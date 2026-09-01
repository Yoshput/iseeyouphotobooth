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

    try {
      return await GestureRecognizer.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
    } catch (gpuErr) {
      console.warn("GestureRecognizer GPU fallback to CPU:", gpuErr);
      return await GestureRecognizer.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
    }
  })();

  return recognizerPromise;
}

export type { GestureRecognizerResult };
