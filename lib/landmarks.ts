import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * MediaPipe Face Landmarker index reference (478-point map).
 * These are the only indices this project needs.
 */
export const LANDMARK = {
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  NOSE_BRIDGE: 168, // between the eyes, where glasses "sit"
} as const;

export interface GlassesAnchor {
  /** Normalized [0-1] nose-bridge position, in the VIDEO's own coordinate space. */
  centerNormalized: { x: number; y: number };
  /** Eye-to-eye distance in actual video pixels (not normalized). */
  eyeSpanPx: number;
  /** In-plane rotation (roll) in radians. */
  roll: number;
}

/**
 * Turns raw landmarks into pixel-accurate numbers.
 *
 * IMPORTANT: eyeSpan is computed in real video pixels (dx in video-width
 * units, dy in video-height units, THEN hypot) rather than in raw normalized
 * units. MediaPipe normalizes x by frame width and y by frame height
 * separately — treating those as the same scale silently breaks distance
 * math on any non-square video, which is every camera we'll actually see.
 */
export function computeGlassesAnchor(
  landmarks: NormalizedLandmark[],
  videoWidth: number,
  videoHeight: number
): GlassesAnchor {
  const leftEye = landmarks[LANDMARK.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARK.RIGHT_EYE_OUTER];
  const nose = landmarks[LANDMARK.NOSE_BRIDGE];

  const dx = (rightEye.x - leftEye.x) * videoWidth;
  const dy = (rightEye.y - leftEye.y) * videoHeight;

  return {
    centerNormalized: { x: nose.x, y: nose.y },
    eyeSpanPx: Math.hypot(dx, dy),
    roll: Math.atan2(dy, dx),
  };
}
