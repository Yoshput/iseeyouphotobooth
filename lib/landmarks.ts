import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import * as THREE from "three";

/**
 * Extracts pure rotation quaternion from MediaPipe facialTransformationMatrixes 4x4 data.
 * The matrixData is a 16-element column-major float array representing 6DOF head pose.
 */
export function quaternionFromFacialMatrix(matrixData: number[]): THREE.Quaternion {
  const m = new THREE.Matrix4().fromArray(matrixData);
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();
  m.decompose(pos, q, scale);
  return q;
}

/**
 * MediaPipe Face Landmarker index reference (478-point map).
 * These are the only indices this project needs.
 */
export const LANDMARK = {
  LEFT_EYE_OUTER:  33,
  RIGHT_EYE_OUTER: 263,
  NOSE_BRIDGE:     168, // nasion (junction between frontal and nasal bones)
  NOSE_SADDLE:     6,   // mid-nasion crest between inner canthi where glasses bridge sits
  LEFT_EYE_INNER:  133, // inner corner left eye
  RIGHT_EYE_INNER: 362, // inner corner right eye
  LEFT_CHEEK:      234, // outer cheek / temple boundary (image left)
  RIGHT_CHEEK:     454, // outer cheek / temple boundary (image right)
  LEFT_PUPIL:      468, // left iris center (if using iris model)
  RIGHT_PUPIL:     473, // right iris center
  LEFT_EYE_TOP:    159, // top lid left eye
  RIGHT_EYE_TOP:   386, // top lid right eye
  NOSE_TIP:        4,   // tip of nose
  UPPER_LIP:       13,  // center upper lip
  FOREHEAD:        10,
  CHIN:            152,
} as const;

// ---------------------------------------------------------------------------
// IPD reference constant
// ---------------------------------------------------------------------------
/**
 * Standard outer-eye-corner span in normalized X at selfie distance.
 * MediaPipe lm[33]→lm[263] horizontal distance ≈ 0.215–0.24 of frame width.
 * We do NOT use this as a divisor — raw ipdNorm is already the correct scale driver.
 */
export const REFERENCE_IPD_NORM = 0.215;

/**
 * Safety clamp — units: CSS pixels.
 * At typical selfie distance face width ≈ 40-75% of frame → scale 80-600px.
 */
export const GLASSES_SCALE_MIN = 50;   // face at edge, still meaningful
export const GLASSES_SCALE_MAX = 700;  // face very close, still sane

/**
 * Y_OFFSET_FACTOR: Proportional vertical offset relative to outer-eye distance (ipdNorm).
 *
 * MediaPipe lm[168] is the nasion (nasal bone between brows and inner eye corners)
 * and lm[6] is the saddle where the frame bridge rests.
 * In video coordinates (y=0 top, y=1 bottom), a positive factor of +0.095 (8%-12% of IPD)
 * lowers the geometric center of the glasses frame so that:
 *  - Top rim sits cleanly underneath the natural curve of the eyebrows (eyebrows 100% visible).
 *  - Glasses bridge rests securely on the nasal bone / saddle (nasion).
 *  - Wearer's pupils align with the upper-middle optical center of each lens.
 */
export const Y_OFFSET_FACTOR = 0.095;

// ---------------------------------------------------------------------------
// GlassesAnchor
// ---------------------------------------------------------------------------
export interface GlassesAnchor {
  /** Normalized [0-1] nose-bridge position in VIDEO coordinate space. */
  centerNormalized: { x: number; y: number };
  /**
   * Inter-pupillary distance in VIDEO pixels (corrected for non-square
   * aspect: dx in video-width units, dy in video-height units → hypot).
   * @deprecated Use ipdNorm + videoWidth for canvas math instead.
   */
  eyeSpanPx: number;
  /** IPD in normalized X units (0-1 relative to video width). */
  ipdNorm: number;
  /** Temple-to-temple span in normalized X units (landmarks 234 to 454). */
  templeWidthNorm: number;
  /** In-plane rotation (roll) in radians. */
  roll: number;
  /** Estimated head yaw in radians (positive when turned right, negative left). */
  yaw: number;
  /** Estimated head pitch in radians (positive when looking down, negative up). */
  pitch: number;
}

/**
 * Turns raw landmarks into anchor data.
 *
 * eyeSpan is computed in real video pixels (dx in video-width units,
 * dy in video-height units, THEN hypot) rather than raw normalized units.
 * MediaPipe normalizes x by frame width and y by frame height separately —
 * treating those as the same scale silently breaks distance math on any
 * non-square video, which is every camera we'll actually see.
 *
 * ipdNorm is the horizontal component only (in normalized X space),
 * which is resolution-independent and sufficient for width scaling.
 */
export function computeGlassesAnchor(
  landmarks: NormalizedLandmark[],
  videoWidth: number,
  videoHeight: number
): GlassesAnchor {
  const leftEye    = landmarks[LANDMARK.LEFT_EYE_OUTER];
  const rightEye   = landmarks[LANDMARK.RIGHT_EYE_OUTER];
  const noseBridge = landmarks[LANDMARK.NOSE_BRIDGE] ?? landmarks[LANDMARK.NOSE_SADDLE];
  const leftCheek  = landmarks[LANDMARK.LEFT_CHEEK];
  const rightCheek = landmarks[LANDMARK.RIGHT_CHEEK];
  const forehead   = landmarks[LANDMARK.FOREHEAD];
  const chin       = landmarks[LANDMARK.CHIN];

  const dx = (rightEye.x - leftEye.x) * videoWidth;
  const dy = (rightEye.y - leftEye.y) * videoHeight;

  // Horizontal outer-eye span in normalized units — used as the primary scale driver
  const ipdNorm = Math.abs(rightEye.x - leftEye.x);

  // Outer cheekbone / temple span across landmarks 234 and 454
  const templeWidthNorm = (leftCheek && rightCheek)
    ? Math.abs(rightCheek.x - leftCheek.x)
    : ipdNorm * 1.68;

  // Primary horizontal center: strictly anchored to nose bridge (nasion / saddle)
  const centerX = noseBridge ? noseBridge.x : (leftEye.x + rightEye.x) / 2;

  // Primary vertical anchor: nasion / nose saddle shifted down by Y_OFFSET_FACTOR.
  // In video coordinates, y=0 is top, y=1 is bottom, so positive offset (+0.095)
  // lowers the frame so the top rim is right below the eyebrows and bridge rests on the nose.
  const baseNoseY = noseBridge ? noseBridge.y : (leftEye.y + rightEye.y) / 2;
  const centerY = baseNoseY + ipdNorm * Y_OFFSET_FACTOR;

  // Roll (in-plane tilt)
  const roll = Math.atan2(dy, dx);

  // Yaw (head turn left/right):
  // Estimated from asymmetry between nose bridge and outer cheek landmarks.
  let yaw = 0;
  if (leftCheek && rightCheek && noseBridge) {
    const distLeft = Math.abs(noseBridge.x - leftCheek.x);
    const distRight = Math.abs(rightCheek.x - noseBridge.x);
    const totalCheek = distLeft + distRight;
    if (totalCheek > 0.001) {
      const xAsymmetry = (distRight - distLeft) / totalCheek;
      if (typeof leftCheek.z === "number" && typeof rightCheek.z === "number") {
        const zDiff = (rightCheek.z - leftCheek.z) * 1.6;
        yaw = zDiff * 0.5 + xAsymmetry * 0.5;
      } else {
        yaw = xAsymmetry;
      }
    }
  }

  // Pitch (head tilt up/down)
  let pitch = 0;
  if (forehead && chin && noseBridge) {
    if (typeof chin.z === "number" && typeof forehead.z === "number") {
      pitch = -((chin.z - forehead.z) * 1.5);
    } else {
      const upperDist = Math.abs(noseBridge.y - forehead.y);
      const lowerDist = Math.abs(chin.y - noseBridge.y);
      const totalFace = upperDist + lowerDist;
      if (totalFace > 0.001) {
        pitch = ((lowerDist - upperDist) / totalFace) * 0.8;
      }
    }
  }

  return {
    centerNormalized: { x: centerX, y: centerY },
    eyeSpanPx: Math.hypot(dx, dy),
    ipdNorm,
    templeWidthNorm,
    roll,
    yaw,
    pitch,
  };
}

// ---------------------------------------------------------------------------
// EMA (Exponential Moving Average) — delta-time aware
// ---------------------------------------------------------------------------

/**
 * Per-value EMA state.  Initialize with { value: <first sample>, init: false }
 * before the first frame so the first real measurement is seeded immediately
 * without a "cold start" drift.
 */
export interface EMAState {
  value: number;
  initialized: boolean;
}

/**
 * Compute a time-based EMA alpha so the smoothing feel is identical at
 * 60 fps (MacBook) and 20-30 fps (Android tablet / iOS Safari).
 *
 * @param deltaMs   Time since last frame in milliseconds.
 * @param tau       Smoothing time constant in milliseconds (default 80ms).
 *                  Smaller = snappier, larger = smoother.
 */
export function emaAlpha(deltaMs: number, tau = 80): number {
  if (deltaMs <= 0) return 1;
  return 1 - Math.exp(-deltaMs / tau);
}

/**
 * Apply EMA to a single scalar, mutating `state` in place.
 * Returns the smoothed value.
 */
export function applyEMA(
  state: EMAState,
  newValue: number,
  alpha: number
): number {
  if (!state.initialized) {
    state.value = newValue;
    state.initialized = true;
  } else {
    state.value = state.value + alpha * (newValue - state.value);
  }
  return state.value;
}

/** Clamp a scale value between allowed bounds. */
export function clampScale(scale: number): number {
  return Math.max(GLASSES_SCALE_MIN, Math.min(GLASSES_SCALE_MAX, scale));
}
