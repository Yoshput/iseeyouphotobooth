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

    const modelPath = "/models/face_landmarker.task";
    const cdnPath =
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

    const createLandmarker = async (delegate: "GPU" | "CPU") => {
      try {
        return await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: modelPath, delegate },
          runningMode: "VIDEO",
          numFaces,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });
      } catch {
        return await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: cdnPath, delegate },
          runningMode: "VIDEO",
          numFaces,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });
      }
    };

    try {
      return await createLandmarker("GPU");
    } catch (gpuErr) {
      console.warn("MediaPipe GPU delegate unavailable, falling back to CPU:", gpuErr);
      return await createLandmarker("CPU");
    }
  })();


  return landmarkerPromise;
}

let imageLandmarkerPromise: Promise<FaceLandmarker> | null = null;

/**
 * Loads (singleton-cached) MediaPipe Face Landmarker configured in IMAGE mode
 * for client-side face tracking on user-uploaded photos.
 */
export function getImageFaceLandmarker(): Promise<FaceLandmarker> {
  if (imageLandmarkerPromise) return imageLandmarkerPromise;

  imageLandmarkerPromise = (async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("/wasm");

    const modelPath = "/models/face_landmarker.task";
    const cdnPath =
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

    const createLandmarker = async (delegate: "GPU" | "CPU") => {
      try {
        return await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: modelPath, delegate },
          runningMode: "IMAGE",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });
      } catch {
        return await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: cdnPath, delegate },
          runningMode: "IMAGE",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });
      }
    };

    try {
      return await createLandmarker("GPU");
    } catch (gpuErr) {
      console.warn("MediaPipe GPU delegate unavailable for image mode, falling back to CPU:", gpuErr);
      return await createLandmarker("CPU");
    }
  })();

  return imageLandmarkerPromise;
}

export type { FaceLandmarkerResult };
