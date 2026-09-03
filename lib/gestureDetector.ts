import {
  GestureRecognizer,
  FilesetResolver,
  type GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

let recognizerPromise: Promise<GestureRecognizer> | null = null;

/**
 * Singleton loader for MediaPipe Gesture Recognizer.
 * Supports Open_Palm, Victory (peace), Thumb_Up, etc.
 */
export function getGestureRecognizer(): Promise<GestureRecognizer> {
  if (recognizerPromise) return recognizerPromise;

  recognizerPromise = (async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks("/wasm");
    const localModel = "/models/gesture_recognizer.task";
    const cdnModel =
      "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

    const createRecognizer = async (delegate: "GPU" | "CPU") => {
      const options = {
        runningMode: "VIDEO" as const,
        numHands: 2,
        minHandDetectionConfidence: 0.38,
        minHandPresenceConfidence: 0.38,
        minTrackingConfidence: 0.38,
      };

      try {
        return await GestureRecognizer.createFromOptions(filesetResolver, {
          ...options,
          baseOptions: { modelAssetPath: localModel, delegate },
        });
      } catch {
        return await GestureRecognizer.createFromOptions(filesetResolver, {
          ...options,
          baseOptions: { modelAssetPath: cdnModel, delegate },
        });
      }
    };

    try {
      return await createRecognizer("GPU");
    } catch (gpuErr) {
      console.warn("GestureRecognizer GPU fallback to CPU:", gpuErr);
      return await createRecognizer("CPU");
    }
  })().catch((err) => {
    recognizerPromise = null;
    throw err;
  });


  return recognizerPromise;
}

export type { GestureRecognizerResult };
