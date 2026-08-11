import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK } from "./landmarks";

export type FaceGuideStatus =
  | "no_face"
  | "ideal"
  | "far"
  | "close"
  | "left"
  | "right"
  | "up"
  | "down";

export interface FaceGuideValidation {
  status: FaceGuideStatus;
  isIdeal: boolean;
  message: string;
  ipdNorm: number;
  centerOffset: { x: number; y: number };
}

/** Target normalized IPD range at standard ~50cm distance */
export const TARGET_IPD_MIN = 0.17;
export const TARGET_IPD_MAX = 0.26;

/** Target normalized nose bridge center in video space */
export const TARGET_CENTER_X = 0.5;
export const TARGET_CENTER_Y = 0.44;

/** Max allowed normalized offset from center */
export const OFFSET_TOLERANCE_X = 0.08;
export const OFFSET_TOLERANCE_Y = 0.09;

/**
 * Validates face position & distance relative to the face-guide oval.
 * Returns real-time status and user-friendly guidance message.
 */
export function validateFaceGuide(
  landmarks: NormalizedLandmark[] | null | undefined
): FaceGuideValidation {
  if (!landmarks || landmarks.length === 0) {
    return {
      status: "no_face",
      isIdeal: false,
      message: "Arahkan wajah ke dalam panduan",
      ipdNorm: 0,
      centerOffset: { x: 0, y: 0 },
    };
  }

  const leftEye = landmarks[LANDMARK.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARK.RIGHT_EYE_OUTER];
  const nose = landmarks[LANDMARK.NOSE_BRIDGE];

  if (!leftEye || !rightEye || !nose) {
    return {
      status: "no_face",
      isIdeal: false,
      message: "Posisikan wajah di tengah panduan",
      ipdNorm: 0,
      centerOffset: { x: 0, y: 0 },
    };
  }

  const ipdNorm = Math.abs(rightEye.x - leftEye.x);
  const offsetX = nose.x - TARGET_CENTER_X;
  const offsetY = nose.y - TARGET_CENTER_Y;

  // Note: Video preview is mirrored horizontally with CSS (-scale-x-100).
  // So if nose.x > TARGET_CENTER_X (user's head is on right side of raw camera feed),
  // on screen it appears on the LEFT, so user needs to move RIGHT (geser ke kanan).
  if (ipdNorm < TARGET_IPD_MIN) {
    return {
      status: "far",
      isIdeal: false,
      message: "Terlalu jauh, mendekat ke kamera",
      ipdNorm,
      centerOffset: { x: offsetX, y: offsetY },
    };
  }

  if (ipdNorm > TARGET_IPD_MAX) {
    return {
      status: "close",
      isIdeal: false,
      message: "Terlalu dekat, geser sedikit menjauh",
      ipdNorm,
      centerOffset: { x: offsetX, y: offsetY },
    };
  }

  if (offsetX > OFFSET_TOLERANCE_X) {
    return {
      status: "right",
      isIdeal: false,
      message: "Geser ke kanan",
      ipdNorm,
      centerOffset: { x: offsetX, y: offsetY },
    };
  }

  if (offsetX < -OFFSET_TOLERANCE_X) {
    return {
      status: "left",
      isIdeal: false,
      message: "Geser ke kiri",
      ipdNorm,
      centerOffset: { x: offsetX, y: offsetY },
    };
  }

  if (offsetY > OFFSET_TOLERANCE_Y) {
    return {
      status: "up",
      isIdeal: false,
      message: "Geser ke atas",
      ipdNorm,
      centerOffset: { x: offsetX, y: offsetY },
    };
  }

  if (offsetY < -OFFSET_TOLERANCE_Y) {
    return {
      status: "down",
      isIdeal: false,
      message: "Geser ke bawah",
      ipdNorm,
      centerOffset: { x: offsetX, y: offsetY },
    };
  }

  return {
    status: "ideal",
    isIdeal: true,
    message: "Posisi Pas! Terdeteksi",
    ipdNorm,
    centerOffset: { x: offsetX, y: offsetY },
  };
}
