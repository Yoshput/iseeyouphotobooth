"use client";

import { useEffect, useRef } from "react";
import { getGestureRecognizer, type GestureRecognizerResult } from "@/lib/gestureDetector";

import { playGestureTriggerSound } from "@/lib/soundEffects";

interface Options {
  enabled?: boolean;
  minConfidence?: number;
  onGesture: (gestureName: string) => void;
}

/**
 * Hook for detecting Open_Palm ✋ hand gesture to trigger photo shutter.
 * Requires a steady hold (~500ms) with minConfidence 0.65 to avoid accidental triggers.
 */
export function useGestureTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: Options
) {
  const { enabled = false, minConfidence = 0.65, onGesture } = options;
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  const streakRef = useRef(0);
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
          // 65ms interval (~15 fps) — ultra responsive & lightweight on CPU/GPU
          if (now - lastDetectTs >= 65) {
            lastDetectTs = now;

            if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
              try {
                const result: GestureRecognizerResult = recognizer.recognizeForVideo(video, now);
                const gestures = result.gestures;

                let topMatch: { name: string; score: number } | null = null;

                // Inspect detected hands — ONLY accept Open_Palm (Telapak Tangan)
                if (gestures && gestures.length > 0) {
                  for (const handList of gestures) {
                    if (!handList || handList.length === 0) continue;
                    for (const g of handList) {
                      const n = g.categoryName;
                      if (g.score >= minConfidence && n === "Open_Palm") {
                        if (!topMatch || g.score > topMatch.score) {
                          topMatch = { name: n, score: g.score };
                        }
                      }
                    }
                  }
                }

                if (topMatch) {
                  streakRef.current++;
                  const timeSinceLast = Date.now() - lastTriggerTimeRef.current;

                  // Deliberate hold trigger: User must hold palm steady for ~7 frames (~450-500ms)
                  // and high confidence (>= 0.65) to prevent accidental twitches/hair adjustments
                  const isConfidentAndHeld = streakRef.current >= 7 && topMatch.score >= minConfidence;

                  if (isConfidentAndHeld && timeSinceLast > 3800) {
                    lastTriggerTimeRef.current = Date.now();
                    streakRef.current = 0;
                    playGestureTriggerSound(true);
                    onGestureRef.current(topMatch.name);
                  }
                } else {
                  // Reset streak if palm is not visible or lost
                  if (streakRef.current > 0) {
                    streakRef.current = 0;
                  }
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
