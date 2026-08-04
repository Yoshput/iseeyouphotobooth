"use client";

import { useEffect, useRef } from "react";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { getFaceLandmarker } from "@/lib/mediapipe";

type FrameCallback = (result: FaceLandmarkerResult) => void;

/**
 * Runs face detection against a <video> element every animation frame and
 * hands the raw result to onFrame.
 *
 * IMPORTANT: onFrame fires up to 60x/sec. Do NOT setState inside it directly
 * from a React component — that re-renders on every frame and will visibly
 * lag on mid-range phones. Instead, mutate a ref (see GlassesRenderer) and
 * let Three.js's own render loop read from it.
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

      const loop = () => {
        if (cancelled) return;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const result = landmarker.detectForVideo(video, performance.now());
          onFrameRef.current(result);
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
