import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * MediaPipe Face Landmarker index reference (478-point map).
 * These are the only indices this project needs.
 */
export const LANDMARK = {
  LEFT_EYE_OUTER:  33,
  RIGHT_EYE_OUTER: 263,
  NOSE_BRIDGE:     168, // between the eyes, where glasses "sit"
} as const;

// ---------------------------------------------------------------------------
// IPD reference constant
// ---------------------------------------------------------------------------
/**
 * "Standard" inter-pupillary distance in normalized X units at a comfortable
 * selfie distance (~50 cm from a typical laptop/tablet camera).
 *
 * Measured empirically on a 16:9 feed:  outer-eye-corner span ≈ 21-22% of
 * frame width.  We use 0.215 as the calibration anchor.
 *
 * Formula for glasses width on canvas:
 *   glassesWidthPx = (ipdNorm / REFERENCE_IPD_NORM) * REFERENCE_IPD_NORM
 *                    * ipdScaleRef * fitWidthRatio * videoWidth * coverScale
 *
 * Simplified:
 *   glassesWidthPx = ipdPx * ipdScaleRef * fitWidthRatio
 * where ipdPx is already scaled by the cover transform.
 */
export const REFERENCE_IPD_NORM = 0.215;

/** Safety clamp — units: CSS pixels (Three.js world units = 1 CSS pixel in this setup).
 *  With the corrected formula (ipdPx × ipdScaleRef), typical output at normal
 *  selfie distance is 150–400px, so these bounds catch genuine outliers only. */
export const GLASSES_SCALE_MIN = 40;   // 40px — face at extreme edge, still visible
export const GLASSES_SCALE_MAX = 600;  // 600px — face pressed very close, still sane

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

  return {
    centerNormalized: { x: nose.x, y: nose.y },
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
