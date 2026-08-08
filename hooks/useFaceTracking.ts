"use client";

import { useEffect, useRef } from "react";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { getFaceLandmarker } from "@/lib/mediapipe";

/** Meta passed alongside every detection result. */
export interface FrameMeta {
  /** Milliseconds since the previous frame (capped at 200ms to avoid spike on tab focus). */
  deltaTime: number;
  /**
   * True for the first WARMUP_FRAMES frames after the loop starts.
   * Callers should skip face-shape classification and AI-match logic during
   * warm-up — MediaPipe confidence is not yet settled.
   */
  warmUp: boolean;
}

type FrameCallback = (result: FaceLandmarkerResult, meta: FrameMeta) => void;

/** Number of frames to mark as warm-up at loop start. */
const WARMUP_FRAMES = 20;

/**
 * Runs face detection against a <video> element every animation frame and
 * hands the raw result + frame metadata to onFrame.
 *
 * IMPORTANT: onFrame fires up to 60x/sec. Do NOT setState inside it directly
 * from a React component — that re-renders on every frame and will visibly
 * lag on mid-range phones. Instead, mutate a ref (see GlassesRenderer) and
 * let Three.js's own render loop read from it.
 *
 * iOS Safari notes:
 * - We wait for readyState >= HAVE_ENOUGH_DATA (4) rather than
 *   HAVE_CURRENT_DATA (2) before calling detectForVideo. HAVE_CURRENT_DATA
 *   on iOS sometimes fires before the first decoded frame is available,
 *   causing MediaPipe to receive a blank buffer and return junk landmarks.
 */
export function useFaceTracking(
  videoRef: React.RefObject<HTMLVideoElement>,
  onFrame: FrameCallback,
  options: { numFaces?: number; enabled?: boolean } = {}
) {
  const { numFaces = 1, enabled = true } = options;
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) return;
    let rafId: number;
    let cancelled = false;

    (async () => {
      const landmarker = await getFaceLandmarker(numFaces);
      const video = videoRef.current;
      if (!video || cancelled) return;

      let frameCount = 0;
      let lastPerfTs = performance.now();

      const loop = () => {
        if (cancelled) return;

        // iOS Safari: wait for HAVE_ENOUGH_DATA (4) — not just HAVE_CURRENT_DATA (2)
        if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          const now = performance.now();
          // Cap deltaTime at 200ms to avoid huge alpha spike after tab focus
          const deltaTime = Math.min(now - lastPerfTs, 200);
          lastPerfTs = now;

          const warmUp = frameCount < WARMUP_FRAMES;
          frameCount++;

          const result = landmarker.detectForVideo(video, now);
          onFrameRef.current(result, { deltaTime, warmUp });
        }

        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, numFaces, enabled]);
}
