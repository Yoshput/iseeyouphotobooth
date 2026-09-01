"use client";

import { useEffect, useRef } from "react";
import { getGestureRecognizer, type GestureRecognizerResult } from "@/lib/gestureDetector";

interface Options {
  enabled?: boolean;
  minConfidence?: number;
  onGesture: (gestureName: string) => void;
}

/**
 * Hook for detecting hand gestures (Open_Palm ✋, Victory ✌️, Thumb_Up 👍)
 * to trigger automatic camera shutter/countdown.
 */
export function useGestureTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: Options
) {
  const { enabled = false, minConfidence = 0.65, onGesture } = options;
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  const streakRef = useRef(0);
  const lastGestureRef = useRef<string | null>(null);
  const lastTriggerTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timerId: any = null;

    (async () => {
      try {
        const recognizer = await getGestureRecognizer();
        const video = videoRef.current;
        if (!video || cancelled) return;

        let lastDetectTs = 0;

        const checkGesture = () => {
          if (cancelled) return;

          const now = performance.now();
          // Run check every 120ms for smooth detection without CPU overload
          if (now - lastDetectTs >= 120) {
            lastDetectTs = now;

            if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
              try {
                const result: GestureRecognizerResult = recognizer.recognizeForVideo(video, now);

                const gestures = result.gestures;
                if (gestures && gestures.length > 0 && gestures[0].length > 0) {
                  const topGesture = gestures[0][0];
                  const name = topGesture.categoryName;
                  const score = topGesture.score;

                  // Target gestures: Open_Palm (telapak tangan), Victory (peace 2 jari), Thumb_Up
                  if (
                    score >= minConfidence &&
                    (name === "Open_Palm" || name === "Victory" || name === "Thumb_Up" || name === "Pointing_Up")
                  ) {
                    if (lastGestureRef.current === name) {
                      streakRef.current++;
                    } else {
                      lastGestureRef.current = name;
                      streakRef.current = 1;
                    }

                    // Trigger when stable for 2 frames (~240ms) and not in cooldown (3.5s)
                    if (streakRef.current >= 2 && Date.now() - lastTriggerTimeRef.current > 3500) {
                      lastTriggerTimeRef.current = Date.now();
                      streakRef.current = 0;
                      onGestureRef.current(name);
                    }
                  } else {
                    streakRef.current = 0;
                    lastGestureRef.current = null;
                  }
                } else {
                  streakRef.current = 0;
                  lastGestureRef.current = null;
                }
              } catch (e) {
                // Ignore transient recognition errors
              }
            }
          }

          timerId = requestAnimationFrame(checkGesture);
        };

        timerId = requestAnimationFrame(checkGesture);
      } catch (err) {
        console.warn("Gesture detection could not initialize:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (timerId) cancelAnimationFrame(timerId);
    };
  }, [enabled, minConfidence, videoRef]);
}
