"use client";

/**
 * FaceScanIntro.tsx · Sci-Fi AR Face Scanning Intro & Face Shape Result Overlay
 *
 * Timeline (Total ~3.2s):
 * 1. Viewfinder Brackets (0 - 400ms): 4 Corner L-brackets with overshoot snap
 * 2. Dense Mesh Overlay (400ms - 2200ms): Multi-group contour draw-on + neon pulsing dots
 * 3. Scan Sweep Beam (400ms - 2200ms): Dual-direction horizontal scanning beam
 * 4. Status Progress (0 - 2200ms): "Menganalisis Bentuk Wajah..." + 0-100% progress bar
 * 5. Face Shape Reveal (2200ms - 3200ms): Prominent shape result banner hold
 * 6. Auto Exit -> calls onComplete() & unmounts cleanly
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { computeCoverTransform, videoPxToContainerPx } from "@/lib/videoCover";
import type { FaceShapeResult } from "@/lib/faceShape";
import { SHAPE_META } from "@/lib/faceShape";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface FaceScanIntroProps {
  landmarks: Point3D[] | null;
  faceResult?: FaceShapeResult | null;
  videoWidth: number;
  videoHeight: number;
  containerWidth: number;
  containerHeight: number;
  onComplete: () => void;
}

// MediaPipe 468 Landmark Contours (Dense Sci-Fi Subset)
const CONTOURS = {
  // Face Oval Outer
  faceOval: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
    378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10,
  ],
  // Eyebrows
  rightEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  leftEyebrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
  // Eyes Outer & Inner
  rightEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
  leftEye: [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263],
  // Nose Bridge & Base
  noseBridge: [168, 6, 197, 195, 5, 4, 1],
  noseBase: [98, 97, 2, 326, 327],
  // Lips Outer & Inner
  lipsOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 61],
  lipsInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61],
  // Cheek Mesh Lines (Sci-Fi Dense Grid)
  cheekLeft: [116, 117, 118, 119, 120, 121, 128, 187, 207, 205],
  cheekRight: [345, 346, 347, 348, 349, 350, 357, 411, 427, 425],
  foreheadGrid: [67, 109, 10, 338, 297, 109, 67, 10],
};

// Unique landmark indices for vertex dots
const LANDMARK_DOT_INDICES = Array.from(
  new Set([
    ...CONTOURS.rightEye,
    ...CONTOURS.leftEye,
    ...CONTOURS.rightEyebrow,
    ...CONTOURS.leftEyebrow,
    ...CONTOURS.noseBridge,
    ...CONTOURS.noseBase,
    ...CONTOURS.lipsOuter,
    10, 152, 234, 454, 132, 361, 168, 1, 6,
  ])
);

export default function FaceScanIntro({
  landmarks,
  faceResult,
  videoWidth,
  videoHeight,
  containerWidth,
  containerHeight,
  onComplete,
}: FaceScanIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<SVGGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<SVGLineElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [meshPhase, setMeshPhase] = useState(0); // 0..1
  const [showResultBanner, setShowResultBanner] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Run Master Animation Timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onCompleteRef.current();
        },
      });

      // ── Stage 1: Brackets Snap In (0 - 400ms) ──────────────────────
      if (bracketsRef.current) {
        tl.fromTo(
          bracketsRef.current,
          { scale: 1.3, opacity: 0, transformOrigin: "center center" },
          { scale: 1.0, opacity: 1, duration: 0.38, ease: "back.out(1.9)" },
          0
        );
      }

      // ── Stage 2: Progress & Dense Mesh Draw (400ms - 2200ms) ───────
      tl.to(
        { val: 0 },
        {
          val: 100,
          duration: 1.8,
          ease: "power1.inOut",
          onUpdate: function () {
            const p = Math.round(this.targets()[0].val);
            setProgress(p);
            setMeshPhase(p / 100);
          },
        },
        0.4
      );

      // Sweep Beam Motion
      if (sweepRef.current) {
        tl.fromTo(
          sweepRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25 },
          0.4
        );
      }

      // ── Stage 3: Face Shape Result Banner Reveal (2200ms - 3200ms) ─
      tl.call(() => {
        setShowResultBanner(true);
      }, undefined, 2.2);

      // Fade & Scale Out Exit
      if (containerRef.current) {
        tl.to(
          containerRef.current,
          {
            opacity: 0,
            scale: 0.94,
            duration: 0.45,
            ease: "power2.inOut",
          },
          3.2
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Compute container points from face landmarks
  if (!landmarks || landmarks.length < 468 || !videoWidth || !videoHeight || !containerWidth || !containerHeight) {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-isy-green-bright border-t-transparent" />
          <p className="text-xs font-bold text-white tracking-widest uppercase">Menyiapkan Scanner…</p>
        </div>
      </div>
    );
  }

  // Cover Transform matrix
  const t = computeCoverTransform(videoWidth, videoHeight, containerWidth, containerHeight);

  // Map landmark point to container CSS pixels (mirrored horizontally)
  const mapPt = (pt: Point3D) => {
    const videoPx = { x: pt.x * videoWidth, y: pt.y * videoHeight };
    const containerPx = videoPxToContainerPx(videoPx, t);
    return {
      x: containerWidth - containerPx.x, // mirrored for selfie preview
      y: containerPx.y,
    };
  };

  // Calculate face bounding box
  const mappedPoints = landmarks.map(mapPt);
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (const pt of mappedPoints) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  // Bounding box with 20px padding
  const padX = 22;
  const padY = 26;
  const bbox = {
    left: Math.max(0, minX - padX),
    top: Math.max(0, minY - padY),
    right: Math.min(containerWidth, maxX + padX),
    bottom: Math.min(containerHeight, maxY + padY),
    width: Math.min(containerWidth, maxX - minX + padX * 2),
    height: Math.min(containerHeight, maxY - minY + padY * 2),
  };

  const bracketLength = Math.min(bbox.width, bbox.height) * 0.22;

  // Helper to build SVG path string safely
  const buildPathStr = (indices: number[]) => {
    if (indices.length < 2) return "";
    const first = mappedPoints[indices[0]];
    if (!first) return "";
    let d = `M ${first.x.toFixed(1)},${first.y.toFixed(1)}`;
    for (let i = 1; i < indices.length; i++) {
      const p = mappedPoints[indices[i]];
      if (p) d += ` L ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }
    return d;
  };

  // Sweep line position (sweeps top to bottom 2x)
  const sweepY = bbox.top + (bbox.height * ((meshPhase * 2.2) % 1));

  // Resolved face shape metadata
  const meta = faceResult ? SHAPE_META[faceResult.shape] : null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Soft dark vignette background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* SVG Canvas for Viewfinder & Dense Mesh */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      >
        <defs>
          {/* Neon Glow Filter */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Linear Gradient for Scan Beam */}
          <linearGradient id="scan-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2FA84F" stopOpacity="0" />
            <stop offset="25%" stopColor="#86EFAC" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#2FA84F" stopOpacity="1" />
            <stop offset="75%" stopColor="#86EFAC" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2FA84F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── LAYER 1: Viewfinder Corner Brackets ─────────────────────── */}
        <g ref={bracketsRef}>
          {/* Top-Left */}
          <path
            d={`M ${bbox.left},${bbox.top + bracketLength} L ${bbox.left},${bbox.top} L ${bbox.left + bracketLength},${bbox.top}`}
            fill="none" stroke="#2FA84F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)"
          />
          {/* Top-Right */}
          <path
            d={`M ${bbox.right - bracketLength},${bbox.top} L ${bbox.right},${bbox.top} L ${bbox.right},${bbox.top + bracketLength}`}
            fill="none" stroke="#2FA84F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)"
          />
          {/* Bottom-Right */}
          <path
            d={`M ${bbox.right},${bbox.bottom - bracketLength} L ${bbox.right},${bbox.bottom} L ${bbox.right - bracketLength},${bbox.bottom}`}
            fill="none" stroke="#2FA84F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)"
          />
          {/* Bottom-Left */}
          <path
            d={`M ${bbox.left + bracketLength},${bbox.bottom} L ${bbox.left},${bbox.bottom} L ${bbox.left},${bbox.bottom - bracketLength}`}
            fill="none" stroke="#2FA84F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)"
          />
        </g>

        {/* ── LAYER 2: Sci-Fi Dense Mesh Overlay (Progressive Draw) ──── */}
        {meshPhase > 0.04 && !showResultBanner && (
          <g opacity={Math.min(1, meshPhase * 1.5)}>
            {/* Group 1: Eyes & Eyebrows (appears first) */}
            <path d={buildPathStr(CONTOURS.rightEye)} fill="none" stroke="#2FA84F" strokeWidth="0.9" opacity="0.85" />
            <path d={buildPathStr(CONTOURS.leftEye)} fill="none" stroke="#2FA84F" strokeWidth="0.9" opacity="0.85" />
            <path d={buildPathStr(CONTOURS.rightEyebrow)} fill="none" stroke="#2FA84F" strokeWidth="0.8" opacity="0.75" />
            <path d={buildPathStr(CONTOURS.leftEyebrow)} fill="none" stroke="#2FA84F" strokeWidth="0.8" opacity="0.75" />

            {/* Group 2: Face Oval & Forehead Grid (appears 30%) */}
            {meshPhase > 0.28 && (
              <>
                <path d={buildPathStr(CONTOURS.faceOval)} fill="none" stroke="#2FA84F" strokeWidth="0.9" opacity="0.8" />
                <path d={buildPathStr(CONTOURS.foreheadGrid)} fill="none" stroke="#2FA84F" strokeWidth="0.6" strokeDasharray="3,3" opacity="0.5" />
              </>
            )}

            {/* Group 3: Nose, Lips, & Cheek Mesh (appears 55%) */}
            {meshPhase > 0.5 && (
              <>
                <path d={buildPathStr(CONTOURS.noseBridge)} fill="none" stroke="#2FA84F" strokeWidth="0.8" opacity="0.75" />
                <path d={buildPathStr(CONTOURS.noseBase)} fill="none" stroke="#2FA84F" strokeWidth="0.7" opacity="0.7" />
                <path d={buildPathStr(CONTOURS.lipsOuter)} fill="none" stroke="#2FA84F" strokeWidth="0.8" opacity="0.8" />
                <path d={buildPathStr(CONTOURS.lipsInner)} fill="none" stroke="#2FA84F" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.6" />
                <path d={buildPathStr(CONTOURS.cheekLeft)} fill="none" stroke="#2FA84F" strokeWidth="0.6" opacity="0.55" />
                <path d={buildPathStr(CONTOURS.cheekRight)} fill="none" stroke="#2FA84F" strokeWidth="0.6" opacity="0.55" />
              </>
            )}

            {/* Landmark Vertex Dots — FIXED UNIQUE KEYS (BAGIAN 1) */}
            {LANDMARK_DOT_INDICES.map((idx, i) => {
              const pt = mappedPoints[idx];
              if (!pt) return null;
              return (
                <circle
                  key={`mesh-dot-${idx}-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="2.2"
                  fill="#86EFAC"
                  opacity="0.95"
                  filter="url(#neon-glow)"
                  className="animate-pulse"
                />
              );
            })}
          </g>
        )}

        {/* ── LAYER 3: Horizontal Scan Sweep Beam Line ───────────────── */}
        {meshPhase > 0.04 && meshPhase < 0.96 && !showResultBanner && (
          <g>
            <rect
              x={bbox.left}
              y={sweepY - 10}
              width={bbox.width}
              height="14"
              fill="url(#scan-beam-grad)"
              opacity="0.3"
            />
            <line
              ref={sweepRef}
              x1={bbox.left}
              y1={sweepY}
              x2={bbox.right}
              y2={sweepY}
              stroke="url(#scan-beam-grad)"
              strokeWidth="2.8"
              filter="url(#neon-glow)"
            />
          </g>
        )}
      </svg>

      {/* ── LAYER 4: Status Text & Progress Bar (Before Result Reveal) ─ */}
      {!showResultBanner && (
        <div
          className="absolute flex flex-col items-center gap-2 select-none"
          style={{
            top: `${Math.min(containerHeight - 75, bbox.bottom + 18)}px`,
          }}
        >
          <div className="flex items-center gap-2 rounded-full bg-black/65 px-4 py-1.5 backdrop-blur-md border border-isy-green-bright/40 shadow-lg">
            <span className="h-2 w-2 animate-ping rounded-full bg-isy-green-bright" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-white">
              Menganalisis Bentuk Wajah…
            </span>
          </div>

          <div className="relative h-1.5 w-44 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-isy-green-bright via-[#86EFAC] to-isy-green-bright transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── BAGIAN 3: Dedicated "Hasil Bentuk Wajah" Banner (2200ms - 3200ms) ── */}
      {showResultBanner && meta && (
        <div
          ref={resultCardRef}
          className="relative z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-90 duration-400 ease-out"
        >
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-isy-green-bright/60 bg-black/80 px-8 py-5 shadow-2xl backdrop-blur-md max-w-[320px]">
            {/* Top AI Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-green-bright/20 border border-isy-green-bright/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-isy-green-bright">
              <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-pulse" />
              Hasil Deteksi AI
            </div>

            {/* Shape Name */}
            <h3 className="text-2xl font-black text-white tracking-wide font-serif mt-1">
              {meta.label}
            </h3>

            {/* Recommendation tip */}
            <p className="text-xs font-medium text-white/80 leading-relaxed mt-0.5">
              {meta.tip}
            </p>

            {/* Bottom style tag */}
            <div className="mt-2 rounded-xl bg-white/10 px-3 py-1 text-[11px] font-bold text-isy-green-bright border border-white/10">
              Koleksi: {meta.style}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
