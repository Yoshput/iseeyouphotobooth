import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/**
 * Loads (once, singleton-cached) the MediaPipe Face Landmarker.
 * Includes automatic CPU fallback for iOS Safari GPU/WebGL delegates.
 */
export function getFaceLandmarker(numFaces: number = 1): Promise<FaceLandmarker> {
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("/wasm");

    try {
      return await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: true,
      });
    } catch (gpuErr) {
      console.warn("MediaPipe GPU delegate unavailable, falling back to CPU for iOS Safari:", gpuErr);
      return await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numFaces,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: true,
      });
    }
  })();

  return landmarkerPromise;
}

export type { FaceLandmarkerResult };
