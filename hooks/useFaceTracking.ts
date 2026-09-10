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
    let rvfcId: number;
    let cancelled = false;

    (async () => {
      const landmarker = await getFaceLandmarker(numFaces);
      const video = videoRef.current;
      if (!video || cancelled) return;

      let frameCount = 0;
      let lastPerfTs = performance.now();
      let lastDetectTs = 0;
      // Minimum interval between inferences: ~30ms (~33 FPS) to match native camera frame rates
      // and protect 90Hz / 120Hz mobile screens from thermal throttling.
      const MIN_FRAME_INTERVAL = 30;

      // Check if native requestVideoFrameCallback is supported (modern Chrome / Android)
      const hasRVFC = typeof (video as any).requestVideoFrameCallback === "function";

      const processFrame = (now: number) => {
        if (cancelled) return;

        // Ensure video has enough decoded frame data
        if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          const elapsed = now - lastDetectTs;
          if (elapsed >= MIN_FRAME_INTERVAL) {
            lastDetectTs = now;
            const deltaTime = Math.min(now - lastPerfTs, 200);
            lastPerfTs = now;

            const warmUp = frameCount < WARMUP_FRAMES;
            frameCount++;

            try {
              const result = landmarker.detectForVideo(video, now);
              onFrameRef.current(result, { deltaTime, warmUp });
            } catch (err) {
              // Gracefully handle occasional dropped frame or context loss during camera switch
            }
          }
        }

        scheduleNext();
      };

      const scheduleNext = () => {
        if (cancelled) return;
        if (hasRVFC) {
          rvfcId = (video as any).requestVideoFrameCallback((now: number) => {
            processFrame(now);
          });
        } else {
          rafId = requestAnimationFrame((now) => {
            processFrame(now);
          });
        }
      };

      scheduleNext();
    })();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      const v = videoRef.current as any;
      if (v && typeof v.cancelVideoFrameCallback === "function") {
        try {
          v.cancelVideoFrameCallback(rvfcId);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, numFaces, enabled]);
}
