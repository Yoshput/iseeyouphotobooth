"use client";

/**
 * FaceTracker.tsx · AR layer (HD camera + glasses + scan-ring indicator + HD skin glow)
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { gsap } from "gsap";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import { useElementSize } from "@/hooks/useElementSize";
import { computeGlassesAnchor } from "@/lib/landmarks";
import { computeCoverTransform, videoPxToContainerPx } from "@/lib/videoCover";
import GlassesRenderer, { type GlassesRendererHandle } from "./GlassesRenderer";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface FaceTrackerHandle {
 captureFrame: () => string | null;
}

interface Props {
 glassesSrc: string;
 fitWidthRatio: number;
 numFaces?: number;
 className?: string;
 beautyMode?: boolean;
 lipstickMode?: boolean;
 onFaceCountChange?: (count: number) => void;
 onLandmarksChange?: (landmarks: Array<{x:number;y:number;z:number}> | null) => void;
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
 ring.style.top = `${cy - r}px`;
 ring.style.width = `${r * 2}px`;
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
 numFaces = 1,
 className = "",
 beautyMode = false,
 lipstickMode = false,
 onFaceCountChange,
 onLandmarksChange,
 },
 ref
 ) {
 const videoRef = useRef<HTMLVideoElement>(null);
 const rendererRef = useRef<GlassesRendererHandle>(null);
 const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
 const ringContainerRef = useRef<HTMLDivElement>(null);

 const [videoSize, setVideoSize] = useState({ width: 1920, height: 1080 });
 const [cameraReady, setCameraReady] = useState(false);
 const [cameraError, setCameraError] = useState<string | null>(null);

 const prevFaceCountRef = useRef(0);
 const lastRingTimeRef = useRef<Record<number, number>>({});

 const onFaceCountChangeRef = useRef(onFaceCountChange);
 onFaceCountChangeRef.current = onFaceCountChange;
 const onLandmarksChangeRef = useRef(onLandmarksChange);
 onLandmarksChangeRef.current = onLandmarksChange;
 const landmarkFrameRef = useRef(0);

 // Suppress MediaPipe INFO logs
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
 return () => {
 console.error = orig;
 };
 }, []);

 // ── Ultra-HD 1080p Camera Initialization ─────────────────────────────
 useEffect(() => {
 let active = true;
 let stream: MediaStream | null = null;

 async function initCamera() {
 setCameraError(null);
 try {
 // Request 1080p Full HD first for sharpest quality
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
 } catch {
 stream = await navigator.mediaDevices.getUserMedia({
 video: {
 facingMode: "user",
 width: { ideal: 1280 },
 height: { ideal: 720 },
 },
 audio: false,
 });
 }

 if (!active) {
 stream?.getTracks().forEach((t) => t.stop());
 return;
 }

 if (videoRef.current && stream) {
 videoRef.current.srcObject = stream;
 await videoRef.current.play().catch(() => {});
 if (active) setCameraReady(true);
 }
 } catch (err) {
 console.error("Camera access error:", err);
 if (active) {
 setCameraError(
 "Kamera tidak dapat diakses. Mohon beri izin akses kamera di browser Anda."
 );
 }
 }
 }

 initCamera();

 return () => {
 active = false;
 if (stream) {
 stream.getTracks().forEach((t) => t.stop());
 }
 if (videoRef.current) {
 videoRef.current.srcObject = null;
 }
 };
 }, []);

 const handleLoadedMetadata = () => {
 const v = videoRef.current;
 if (v && v.videoWidth > 0) {
 setVideoSize({ width: v.videoWidth, height: v.videoHeight });
 }
 };

 // ── Face tracking loop ──────────────────────────────────────────────
 useFaceTracking(
 videoRef,
 (result) => {
 if (glassesSrc) {
 rendererRef.current?.updateFromResult(result);
 }

 const faces = result.faceLandmarks ?? [];
 const curr = faces.length;
 const prev = prevFaceCountRef.current;

 if (curr !== prev) {
 onFaceCountChangeRef.current?.(curr);
 }

 landmarkFrameRef.current++;
 if (landmarkFrameRef.current % 15 === 0 && onLandmarksChangeRef.current) {
 onLandmarksChangeRef.current(
 curr > 0 ? (faces[0] as Array<{ x: number; y: number; z: number }>) : null
 );
 }

 if (curr > prev && ringContainerRef.current) {
 const video = videoRef.current;
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
 const now = Date.now();
 const lastTime = lastRingTimeRef.current[i] ?? 0;
 if (now - lastTime < 2000) continue;
 lastRingTimeRef.current[i] = now;

 const lm = faces[i] as NormalizedLandmark[];
 const anchor = computeGlassesAnchor(
 lm,
 video.videoWidth,
 video.videoHeight
 );
 const centerVid = {
 x: anchor.centerNormalized.x * video.videoWidth,
 y: anchor.centerNormalized.y * video.videoHeight,
 };
 const centerCont = videoPxToContainerPx(centerVid, t);
 const cx = width - centerCont.x;
 const cy = centerCont.y;
 const r = anchor.eyeSpanPx * t.scale * 0.9;

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

 // ── Exposed captureFrame (HD Crisp Capture) ──────────────────────────
 useImperativeHandle(ref, () => ({
 captureFrame() {
 const video = videoRef.current;
 const container = containerRef.current;
 if (!video || !video.videoWidth || !container) return null;

 const { width, height } = container.getBoundingClientRect();

 // 2x Retina scale for ultra sharp photo quality
 const dpr = Math.min(window.devicePixelRatio || 1, 2);
 const out = document.createElement("canvas");
 out.width = Math.round(width * dpr);
 out.height = Math.round(height * dpr);
 const ctx = out.getContext("2d")!;
 ctx.scale(dpr, dpr);

 // Mirror horizontally to match live preview
 ctx.translate(width, 0);
 ctx.scale(-1, 1);

 // Crisp HD Skin Filter (Zero blur so image stays 100% sharp!)
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

 // Draw HD Video Frame
 ctx.save();
 ctx.translate(t.offsetX, t.offsetY);
 ctx.scale(t.scale, t.scale);
 ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
 ctx.restore();

 ctx.filter = "none";

 // Draw Glasses overlay
 if (glassesSrc) {
 const glCanvas = rendererRef.current?.canvas;
 if (glCanvas) {
 ctx.drawImage(glCanvas, 0, 0, width, height);
 }
 }

 return out.toDataURL("image/jpeg", 0.95);
 },
 }));

 // ── Crisp HD Live Preview Filter (Zero Blur) ──────────────────────
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
 {/* Video layer — HD crisp mirrored preview */}
 <video
 ref={videoRef}
 onLoadedMetadata={handleLoadedMetadata}
 style={{ filter: previewFilterStyle }}
 className="absolute inset-0 h-full w-full object-cover -scale-x-100 transition-all duration-300"
 playsInline
 muted
 />

 {/* Glasses overlay */}
 {glassesSrc && size.width > 0 && size.height > 0 && (
 <div className="absolute inset-0 -scale-x-100">
 <GlassesRenderer
 ref={rendererRef}
 width={size.width}
 height={size.height}
 videoWidth={videoSize.width}
 videoHeight={videoSize.height}
 glassesSrc={glassesSrc}
 fitWidthRatio={fitWidthRatio}
 maxFaces={numFaces}
 />
 </div>
 )}

 {/* Scan-ring overlay */}
 <div
 ref={ringContainerRef}
 className="pointer-events-none absolute inset-0"
 aria-hidden="true"
 />
 </div>
 );
 }
);

export default FaceTracker;
