"use client";

/**
 * FaceTracker.tsx · AR layer
 *
 * Improvements over previous version:
 *  - Passes deltaTime from useFaceTracking to GlassesRenderer for
 *    frame-rate-independent EMA smoothing.
 *  - Passes ipdScaleRef from glasses manifest to GlassesRenderer.
 *  - Warm-up frames (first 20) are flagged — onLandmarksChange is skipped
 *    during warm-up so the parent's AI classification doesn't see junk data.
 *  - Camera init: 3-tier fallback (1080p → 720p → any), waits for
 *    HAVE_ENOUGH_DATA before setting cameraReady, re-reads video dimensions
 *    on orientationchange / resize (iOS landscape-in-portrait quirk).
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { useElementSize } from "@/hooks/useElementSize";
import { computeGlassesAnchor } from "@/lib/landmarks";
import { computeCoverTransform, videoPxToContainerPx } from "@/lib/videoCover";
import GlassesRenderer, { type GlassesRendererHandle } from "./GlassesRenderer";
import Glasses3DRenderer from "./Glasses3DRenderer";
import FaceScanIntro from "./FaceScanIntro";
import FaceGuideOverlay from "./FaceGuideOverlay";
import { validateFaceGuide, type FaceGuideValidation } from "@/lib/faceGuide";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface FaceTrackerHandle {
  captureFrame: () => string | null;
}

interface Props {
  glassesSrc: string;
  fitWidthRatio: number;
  /** Per-model IPD scale ref from manifest (default 1.5). */
  ipdScaleRef?: number;
  numFaces?: number;
  className?: string;
  beautyMode?: boolean;
  lipstickMode?: boolean;
  scanIntro?: boolean;
  showFaceGuide?: boolean;
  faceResult?: any;
  renderMode?: "2d" | "3d";
  model3DSrc?: string;
  frameWidthMm?: number;
  bridgeMm?: number;
  templeMm?: number;
  frameColor?: string;
  metalColor?: string;
  isTinted?: boolean;
  style?: string;
  yOffsetRatio?: number;
  /** Per-model origin correction passed to Glasses3DRenderer */
  pivotOffset?: { x: number; y: number; z: number };
  /** Per-model rotation correction in degrees passed to Glasses3DRenderer */
  rotationOffsetDeg?: { x: number; y: number; z: number };
  /** Temple fade start fraction 0–1 (0.65 = fade at 65% of temple length) */
  templeFadeStart?: number;
  onScanIntroComplete?: () => void;
  onFaceCountChange?: (count: number) => void;
  onLandmarksChange?: (landmarks: Array<{ x: number; y: number; z: number }> | null) => void;
}

const RING_COLOR = "#2FA84F";

function triggerScanRing(
  container: HTMLDivElement,
  faceIdx: number,
  cx: number,
  cy: number,
  r: number
) {
  const id = `scan-ring-${faceIdx}`;
  let ring = container.querySelector<HTMLDivElement>(`[data-ring="${id}"]`);

  if (!ring) {
    ring = document.createElement("div");
    ring.dataset.ring = id;
    ring.style.cssText = `
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      border: 3px solid ${RING_COLOR};
      box-shadow: 0 0 12px 2px ${RING_COLOR}40;
    `;
    container.appendChild(ring);
  }

  ring.style.left = `${cx - r}px`;
  ring.style.top  = `${cy - r}px`;
  ring.style.width  = `${r * 2}px`;
  ring.style.height = `${r * 2}px`;

  gsap.killTweensOf(ring);
  gsap.fromTo(
    ring,
    { opacity: 1, scale: 1 },
    {
      opacity: 0,
      scale: 1.12,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => ring?.remove(),
    }
  );
}

const FaceTracker = forwardRef<FaceTrackerHandle, Props>(
  function FaceTracker(
    {
      glassesSrc,
      fitWidthRatio,
      ipdScaleRef = 1.5,
      numFaces = 1,
      className = "",
      beautyMode = false,
      lipstickMode = false,
      scanIntro = false,
      showFaceGuide = true,
      faceResult,
      renderMode = "2d",
      model3DSrc,
      frameWidthMm = 138,
      bridgeMm = 18,
      templeMm = 140,
      frameColor,
      metalColor,
      isTinted = false,
      style,
      yOffsetRatio,
      pivotOffset,
      rotationOffsetDeg,
      templeFadeStart,
      onScanIntroComplete,
      onFaceCountChange,
      onLandmarksChange,
    },
    ref
  ) {
    const videoRef        = useRef<HTMLVideoElement>(null);
    const rendererRef     = useRef<GlassesRendererHandle>(null);
    const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
    const ringContainerRef = useRef<HTMLDivElement>(null);

    const [videoSize, setVideoSize]     = useState({ width: 1920, height: 1080 });
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [rawLandmarks, setRawLandmarks] = useState<Array<{ x: number; y: number; z: number }> | null>(null);
    const [guideValidation, setGuideValidation] = useState<FaceGuideValidation>(() =>
      validateFaceGuide(null)
    );

    const prevFaceCountRef  = useRef(0);
    const lastRingTimeRef   = useRef<Record<number, number>>({});

    const onFaceCountChangeRef  = useRef(onFaceCountChange);
    onFaceCountChangeRef.current = onFaceCountChange;
    const onLandmarksChangeRef  = useRef(onLandmarksChange);
    onLandmarksChangeRef.current = onLandmarksChange;
    const landmarkFrameRef = useRef(0);

    // ── Suppress noisy MediaPipe console output ───────────────────────────
    useEffect(() => {
      const orig = console.error.bind(console);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error = (...args: any[]) => {
        const msg = String(args[0] ?? "");
        if (
          msg.startsWith("INFO:") ||
          msg.includes("XNNPACK") ||
          msg.includes("delegate for CPU") ||
          msg.includes("TensorFlow Lite")
        ) {
          console.info("[MediaPipe]", ...args);
          return;
        }
        orig(...args);
      };
      return () => { console.error = orig; };
    }, []);

    // ── Helper: read actual video dimensions & update state ───────────────
    const readVideoDimensions = () => {
      const v = videoRef.current;
      if (!v) return;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (vw > 0 && vh > 0) {
        setVideoSize({ width: vw, height: vh });
      }
    };

    // ── Camera initialization — 3-tier fallback ───────────────────────────
    useEffect(() => {
      let active = true;
      let stream: MediaStream | null = null;

      async function waitForEnoughData(video: HTMLVideoElement, timeoutMs = 5000): Promise<boolean> {
        if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return true;
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            video.removeEventListener("canplaythrough", onReady);
            resolve(false); // timeout — proceed anyway
          }, timeoutMs);
          const onReady = () => {
            clearTimeout(timer);
            resolve(true);
          };
          video.addEventListener("canplaythrough", onReady, { once: true });
        });
      }

      async function initCamera() {
        setCameraError(null);
        let gotStream = false;

        // Tier 1: Full HD
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
              frameRate: { ideal: 30 },
            },
            audio: false,
          });
          gotStream = true;
        } catch { /* fall through */ }

        // Tier 2: HD
        if (!gotStream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
            gotStream = true;
          } catch { /* fall through */ }
        }

        // Tier 3: Any front camera (very restrictive devices / old iOS)
        if (!gotStream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "user" },
              audio: false,
            });
            gotStream = true;
          } catch (err) {
            console.error("Camera access error:", err);
            if (active) {
              setCameraError(
                "Kamera tidak dapat diakses. Mohon beri izin akses kamera di browser Anda."
              );
            }
            return;
          }
        }

        if (!active) {
          stream?.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          // Wait for iOS to finish decoding the first frames
          await waitForEnoughData(videoRef.current);
          readVideoDimensions();
          if (active) setCameraReady(true);
        }
      }

      initCamera();

      return () => {
        active = false;
        stream?.getTracks().forEach((t) => t.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }, []);

    // ── Re-read video size on orientation change (iOS landscape quirk) ────
    useEffect(() => {
      const handler = () => {
        // Small delay: iOS fires orientationchange before video track updates
        setTimeout(readVideoDimensions, 300);
      };
      window.addEventListener("orientationchange", handler);
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("orientationchange", handler);
        window.removeEventListener("resize", handler);
      };
    }, []);

    const handleLoadedMetadata = () => {
      readVideoDimensions();
    };

    // ── Face tracking loop ────────────────────────────────────────────────
    useFaceTracking(
      videoRef,
      (result, meta) => {
        if (glassesSrc || renderMode === "3d") {
          // Pass deltaTime so GlassesRenderer / Glasses3DRenderer uses time-based EMA
          rendererRef.current?.updateFromResult(result, meta.deltaTime);
        }

        const faces = result.faceLandmarks ?? [];
        const curr  = faces.length;
        const prev  = prevFaceCountRef.current;

        if (curr !== prev) {
          onFaceCountChangeRef.current?.(curr);
        }

        if (faces[0]) {
          setRawLandmarks(faces[0] as Array<{ x: number; y: number; z: number }>);
        } else if (rawLandmarks) {
          setRawLandmarks(null);
        }

        // Validate face guide position every 3 frames for zero UI lag
        landmarkFrameRef.current++;
        if (showFaceGuide && landmarkFrameRef.current % 3 === 0) {
          const val = validateFaceGuide(faces[0] as NormalizedLandmark[] | undefined);
          setGuideValidation(val);
        }
        if (
          !meta.warmUp &&
          landmarkFrameRef.current % 15 === 0 &&
          onLandmarksChangeRef.current
        ) {
          onLandmarksChangeRef.current(
            curr > 0 ? (faces[0] as Array<{ x: number; y: number; z: number }>) : null
          );
        }

        if (curr > prev && ringContainerRef.current) {
          const video     = videoRef.current;
          const container = containerRef.current;
          if (video && container) {
            const { width, height } = container.getBoundingClientRect();
            const t = computeCoverTransform(
              video.videoWidth,
              video.videoHeight,
              width,
              height
            );
            for (let i = prev; i < curr; i++) {
              const now      = Date.now();
              const lastTime = lastRingTimeRef.current[i] ?? 0;
              if (now - lastTime < 2000) continue;
              lastRingTimeRef.current[i] = now;

              const lm     = faces[i] as NormalizedLandmark[];
              const anchor = computeGlassesAnchor(lm, video.videoWidth, video.videoHeight);
              const centerVid  = {
                x: anchor.centerNormalized.x * video.videoWidth,
                y: anchor.centerNormalized.y * video.videoHeight,
              };
              const centerCont = videoPxToContainerPx(centerVid, t);
              const cx = width - centerCont.x;
              const cy = centerCont.y;
              const r  = anchor.eyeSpanPx * t.scale * 0.9;

              triggerScanRing(ringContainerRef.current, i, cx, cy, r);
            }
          }
        }

        if (curr < prev) {
          for (let i = curr; i < prev; i++) {
            delete lastRingTimeRef.current[i];
          }
        }

        prevFaceCountRef.current = curr;
      },
      { numFaces, enabled: cameraReady }
    );

    // ── Exposed captureFrame ──────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      captureFrame() {
        const video     = videoRef.current;
        const container = containerRef.current;
        if (!video || !video.videoWidth || !container) return null;

        const { width, height } = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const out = document.createElement("canvas");
        out.width  = Math.round(width * dpr);
        out.height = Math.round(height * dpr);
        const ctx  = out.getContext("2d")!;
        ctx.scale(dpr, dpr);

        ctx.translate(width, 0);
        ctx.scale(-1, 1);

        let filterStr = "contrast(1.06) brightness(1.05) saturate(1.15)";
        if (beautyMode && lipstickMode) {
          filterStr = "contrast(1.08) brightness(1.08) saturate(1.3)";
        } else if (beautyMode) {
          filterStr = "contrast(1.06) brightness(1.07) saturate(1.18)";
        } else if (lipstickMode) {
          filterStr = "contrast(1.08) saturate(1.3)";
        }
        ctx.filter = filterStr;

        const t = computeCoverTransform(
          video.videoWidth,
          video.videoHeight,
          width,
          height
        );

        ctx.save();
        ctx.translate(t.offsetX, t.offsetY);
        ctx.scale(t.scale, t.scale);
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        ctx.restore();

        ctx.filter = "none";

        if (glassesSrc || renderMode === "3d") {
          const glCanvas = rendererRef.current?.canvas;
          if (glCanvas) {
            ctx.drawImage(glCanvas, 0, 0, width, height);
          }
        }

        return out.toDataURL("image/jpeg", 0.95);
      },
    }));

    let previewFilterStyle = "contrast(1.06) brightness(1.05) saturate(1.15)";
    if (beautyMode && lipstickMode) {
      previewFilterStyle = "contrast(1.08) brightness(1.08) saturate(1.3)";
    } else if (beautyMode) {
      previewFilterStyle = "contrast(1.06) brightness(1.07) saturate(1.18)";
    } else if (lipstickMode) {
      previewFilterStyle = "contrast(1.08) saturate(1.3)";
    }

    if (cameraError) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-center bg-isy-mist">
          <p className="text-sm font-semibold text-isy-ink/80">{cameraError}</p>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden bg-black ${className}`}
      >
        {/* Video layer */}
        <video
          ref={videoRef}
          onLoadedMetadata={handleLoadedMetadata}
          style={{ filter: previewFilterStyle }}
          className="absolute inset-0 h-full w-full object-cover -scale-x-100 transition-all duration-300"
          playsInline
          muted
        />

        {/* Glasses overlay */}
        {size.width > 0 && size.height > 0 && (
          <div className="absolute inset-0 -scale-x-100">
            {renderMode === "3d" ? (
              model3DSrc ? (
                <Glasses3DRenderer
                  ref={rendererRef}
                  width={size.width}
                  height={size.height}
                  videoWidth={videoSize.width}
                  videoHeight={videoSize.height}
                  model3DSrc={model3DSrc}
                  frameWidthMm={frameWidthMm}
                  bridgeMm={bridgeMm}
                  templeMm={templeMm}
                  frameColor={frameColor}
                  metalColor={metalColor}
                  isTinted={isTinted}
                  style={style}
                  fitWidthRatio={fitWidthRatio}
                  ipdScaleRef={ipdScaleRef}
                  yOffsetRatio={yOffsetRatio}
                  maxFaces={numFaces}
                  pivotOffset={pivotOffset}
                  rotationOffsetDeg={rotationOffsetDeg}
                  templeFadeStart={templeFadeStart}
                />
              ) : null
            ) : (
              glassesSrc ? (
                <GlassesRenderer
                  ref={rendererRef}
                  width={size.width}
                  height={size.height}
                  videoWidth={videoSize.width}
                  videoHeight={videoSize.height}
                  glassesSrc={glassesSrc}
                  fitWidthRatio={fitWidthRatio}
                  ipdScaleRef={ipdScaleRef}
                  maxFaces={numFaces}
                />
              ) : null
            )}
          </div>
        )}

        {/* Face-Guide Frame Overlay */}
        {showFaceGuide && cameraReady && size.width > 0 && size.height > 0 && (
          <FaceGuideOverlay validation={guideValidation} />
        )}

        {/* Scan-ring overlay */}
        <div
          ref={ringContainerRef}
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        {/* Face Scan Intro Overlay */}
        {scanIntro && size.width > 0 && size.height > 0 && (
          <FaceScanIntro
            landmarks={rawLandmarks}
            faceResult={faceResult}
            videoWidth={videoSize.width}
            videoHeight={videoSize.height}
            containerWidth={size.width}
            containerHeight={size.height}
            onComplete={onScanIntroComplete ?? (() => {})}
          />
        )}
      </div>
    );
  }
);

export default FaceTracker;
