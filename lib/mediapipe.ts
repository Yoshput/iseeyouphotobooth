import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/**
 * Loads (once, singleton-cached) the MediaPipe Face Landmarker.
 *
 * WASM files:  served from /wasm/ (local copy in public/wasm/).
 *   → Copied from node_modules/@mediapipe/tasks-vision/wasm at build time.
 *   → Works offline / on flaky store wifi — no CDN dependency at runtime.
 *
 * Model file:  still fetched from Google Storage on first load and cached
 *   by the browser thereafter (~2 MB, downloaded once per device session).
 *   Self-hosting the .task file is possible but adds build complexity; the
 *   CDN version is fine for a kiosk that has any internet at all on day 1.
 *
 * delegate: "GPU" → uses WebGL for inference (60fps on modern mobile/tablet).
 *   Falls back to CPU automatically if GPU is unavailable.
 */
export function getFaceLandmarker(numFaces: number = 1): Promise<FaceLandmarker> {
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    // WASM served locally — no jsdelivr CDN needed at runtime
    const filesetResolver = await FilesetResolver.forVisionTasks("/wasm");

    return FaceLandmarker.createFromOptions(filesetResolver, {
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
  })();

  return landmarkerPromise;
}

export type { FaceLandmarkerResult };
