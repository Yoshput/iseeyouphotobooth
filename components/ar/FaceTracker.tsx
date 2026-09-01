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
import { useGestureTracking } from "@/hooks/useGestureTracking";
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
  trackingEnabled?: boolean;
  facingMode?: "user" | "environment";
  deviceId?: string;
  customStream?: MediaStream | null;
  gestureEnabled?: boolean;
  onGestureDetected?: (gesture: string) => void;
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
      border: 2px solid ${RING_COLOR};
      transform: translate(-50%, -50%) scale(0.6);
      opacity: 0.9;
      transition: transform 0.65s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.65s ease;
      box-shadow: 0 0 16px ${RING_COLOR}55;
    `;
    container.appendChild(ring);
  }

  ring.style.left   = `${cx}px`;
  ring.style.top    = `${cy}px`;
  ring.style.width  = `${r * 2}px`;
  ring.style.height = `${r * 2}px`;

  requestAnimationFrame(() => {
    if (!ring) return;
    ring.style.transform = "translate(-50%, -50%) scale(1.15)";
    ring.style.opacity   = "0";
  });
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
      showFaceGuide = false,
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
      yOffsetRatio = 0,
      pivotOffset,
      rotationOffsetDeg,
      templeFadeStart = 0.65,
      trackingEnabled = true,
      facingMode = "user",
      deviceId,
      customStream,
      gestureEnabled = false,
      onGestureDetected,
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
        const msg = args[0] ? String(args[0]) : "";
        if (
          msg.includes("GL error") ||
          msg.includes("FaceBlendshapesGraph") ||
          msg.includes("OpenGL error checking is disabled") ||
          msg.includes("vision_wasm_internal")
        ) {
          return;
        }
        orig(...args);
      };
      return () => {
        console.error = orig;
      };
    }, []);

    // ── Video loaded metadata handler ─────────────────────────────────────
    const handleLoadedMetadata = () => {
      const v = videoRef.current;
      if (!v) return;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (vw > 0 && vh > 0) {
        setVideoSize({ width: vw, height: vh });
        setCameraReady(true);
      }
    };

    const readVideoDimensions = () => {
      const v = videoRef.current;
      if (!v) return;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (vw > 0 && vh > 0) {
        setVideoSize({ width: vw, height: vh });
      }
    };

    // ── Camera initialization — 3-tier fallback with deviceId / facingMode / customStream ─
    useEffect(() => {
      let active = true;
      let stream: MediaStream | null = null;

      async function waitForEnoughData(video: HTMLVideoElement, timeoutMs = 1500): Promise<boolean> {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) return true;
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            video.removeEventListener("canplay", onReady);
            video.removeEventListener("loadeddata", onReady);
            resolve(false); // timeout — proceed anyway
          }, timeoutMs);
          const onReady = () => {
            clearTimeout(timer);
            resolve(true);
          };
          video.addEventListener("canplay", onReady, { once: true });
          video.addEventListener("loadeddata", onReady, { once: true });
        });
      }

      async function initCamera() {
        setCameraError(null);
        setCameraReady(false);

        // If a remote / external custom stream is passed (e.g. Remote HP camera via WebRTC)
        if (customStream) {
          if (videoRef.current) {
            videoRef.current.srcObject = customStream;
            await videoRef.current.play().catch(() => {});
            await waitForEnoughData(videoRef.current);
            readVideoDimensions();
            if (active) setCameraReady(true);
          }
          return;
        }

        let gotStream = false;

        const baseConstraints: MediaTrackConstraints = deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: facingMode || "user" };

        // Tier 1: 4K / 2K / Full HD Crisp Camera Sensor Resolution
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              ...baseConstraints,
              width: { ideal: 3840, min: 1920 },
              height: { ideal: 2160, min: 1080 },
              frameRate: { ideal: 30 },
            },
            audio: false,
          });
          gotStream = true;
        } catch { /* fall through */ }

        // Tier 2: Full HD (1080p)
        if (!gotStream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                ...baseConstraints,
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
                frameRate: { ideal: 30 },
              },
              audio: false,
            });
            gotStream = true;
          } catch { /* fall through */ }
        }

        // Tier 3: Standard HD
        if (!gotStream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                ...baseConstraints,
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
            gotStream = true;
          } catch { /* fall through */ }
        }

        // Tier 4: Any camera matching constraints
        if (!gotStream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: baseConstraints,
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
        if (!customStream) {
          stream?.getTracks().forEach((t) => t.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }, [deviceId, facingMode, customStream]);

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

        if (scanIntro && curr > prev && ringContainerRef.current) {
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
      { numFaces, enabled: cameraReady && trackingEnabled }
    );

    // ── Silent Hand Gesture Detection (Open_Palm, Victory, Thumb_Up) ───
    useGestureTracking(videoRef, {
      enabled: gestureEnabled && cameraReady,
      onGesture: (gesture) => {
        onGestureDetected?.(gesture);
      },
    });

    // ── Exposed captureFrame (Full Native Sensor Resolution - Razor Sharp) ───
    useImperativeHandle(ref, () => ({
      captureFrame() {
        const video     = videoRef.current;
        const container = containerRef.current;
        if (!video || !video.videoWidth || !container) return null;

        const { width: containerW, height: containerH } = container.getBoundingClientRect();
        const containerRatio = (containerW && containerH) ? containerW / containerH : (3 / 4);

        // Capture directly from full sensor resolution (preserving crystal-clear 1080p/4K details)
        const sensorW = video.videoWidth;
        const sensorH = video.videoHeight;

        let targetW = sensorW;
        let targetH = Math.round(targetW / containerRatio);

        if (targetH > sensorH) {
          targetH = sensorH;
          targetW = Math.round(targetH * containerRatio);
        }

        // Guarantee at least 1440px resolution on the shorter axis for print-grade clarity
        const minShortAxis = 1440;
        if (Math.min(targetW, targetH) < minShortAxis) {
          const upScale = minShortAxis / Math.max(1, Math.min(targetW, targetH));
          targetW = Math.round(targetW * upScale);
          targetH = Math.round(targetH * upScale);
        }

        const out = document.createElement("canvas");
        out.width  = targetW;
        out.height = targetH;
        const ctx  = out.getContext("2d", { willReadFrequently: true })!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Mirror horizontally only for user front selfie camera
        const isSelfie = facingMode === "user";
        if (isSelfie) {
          ctx.translate(targetW, 0);
          ctx.scale(-1, 1);
        }

        let filterStr = "contrast(1.03) brightness(1.01) saturate(1.08)";
        if (beautyMode && lipstickMode) {
          filterStr = "contrast(1.05) brightness(1.03) saturate(1.18)";
        } else if (beautyMode) {
          filterStr = "contrast(1.04) brightness(1.02) saturate(1.12)";
        } else if (lipstickMode) {
          filterStr = "contrast(1.05) saturate(1.18)";
        }
        ctx.filter = filterStr;

        const t = computeCoverTransform(
          video.videoWidth,
          video.videoHeight,
          targetW,
          targetH
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
            ctx.drawImage(glCanvas, 0, 0, targetW, targetH);
          }
        }

        // Return pristine 96% JPEG (crystal-clear, uncompressed visual look)
        return out.toDataURL("image/jpeg", 0.96);
      },
    }));

    let previewFilterStyle = "contrast(1.03) brightness(1.01) saturate(1.08)";
    if (beautyMode && lipstickMode) {
      previewFilterStyle = "contrast(1.05) brightness(1.03) saturate(1.18)";
    } else if (beautyMode) {
      previewFilterStyle = "contrast(1.04) brightness(1.02) saturate(1.12)";
    } else if (lipstickMode) {
      previewFilterStyle = "contrast(1.05) saturate(1.18)";
    }

    if (cameraError) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-center bg-isy-mist">
          <p className="text-sm font-semibold text-isy-ink/80">{cameraError}</p>
        </div>
      );
    }

    const mirrorClass = facingMode === "user" ? "-scale-x-100" : "scale-x-100";

    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden bg-black ${className}`}
      >
        {/* Video layer */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedMetadata}
          onCanPlay={handleLoadedMetadata}
          onPlaying={handleLoadedMetadata}
          style={{ filter: previewFilterStyle }}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${mirrorClass}`}
        />

        {/* Glasses overlay */}
        {size.width > 0 && size.height > 0 && (
          <div className={`absolute inset-0 ${mirrorClass}`}>
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
