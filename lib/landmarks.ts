import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * MediaPipe Face Landmarker index reference (478-point map).
 * These are the only indices this project needs.
 */
export const LANDMARK = {
  LEFT_EYE_OUTER:  33,
  RIGHT_EYE_OUTER: 263,
  NOSE_BRIDGE:     168, // between the eyes, where glasses "sit"
  LEFT_EYE_INNER:  133,  // inner corner left eye
  RIGHT_EYE_INNER: 362,  // inner corner right eye
  LEFT_PUPIL:      468,  // left iris center (if using iris model)
  RIGHT_PUPIL:     473,  // right iris center
  LEFT_EYE_TOP:    159,  // top lid left eye
  RIGHT_EYE_TOP:   386,  // top lid right eye
  NOSE_TIP:        4,    // tip of nose
  UPPER_LIP:       13,   // center upper lip
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
 * Y_OFFSET_FACTOR: How far below the nose-bridge anchor the glasses sit.
 *
 * MediaPipe lm[168] is the nasal bone (between brows, above nose tip).
 * For glasses to sit ON the nose (not float above eyebrows), we need to
 * push DOWN by ~25-30% of the inter-eye span.
 *
 * Calibration basis (Transitions virtual try-on reference):
 *  - Glasses rim top should align with the lower edge of the eyebrows.
 *  - Glasses optical center should be at the pupil level.
 *  - Nose pad should rest on the nose bridge (lm[168] → lm[6] level).
 *
 * ipdNorm ≈ 0.215 at normal distance.
 * offsetNorm = ipdNorm × 0.22 ≈ 0.047 → ~5% of frame width downward.
 * This keeps glasses correctly on the nose at all face distances.
 */
export const Y_OFFSET_FACTOR = 0.12;

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
  /** In-plane rotation (roll) in radians. */
  roll: number;
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
  const leftEye  = landmarks[LANDMARK.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARK.RIGHT_EYE_OUTER];
  const nose     = landmarks[LANDMARK.NOSE_BRIDGE];

  const dx = (rightEye.x - leftEye.x) * videoWidth;
  const dy = (rightEye.y - leftEye.y) * videoHeight;

  // Horizontal span in normalized units — used as the primary scale driver
  const ipdNorm = Math.abs(rightEye.x - leftEye.x);

  // Apply a proportional downward offset so the glasses rest on the nose
  // instead of floating above the eyebrows. The offset scales with ipdNorm
  // so it remains consistent regardless of face distance from the camera.
  const centerY = nose.y + ipdNorm * Y_OFFSET_FACTOR;

  return {
    centerNormalized: { x: nose.x, y: centerY },
    eyeSpanPx: Math.hypot(dx, dy),
    ipdNorm,
    roll: Math.atan2(dy, dx),
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
