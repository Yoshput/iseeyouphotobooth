"use client";

import type { FaceGuideValidation } from "@/lib/faceGuide";

interface FaceGuideOverlayProps {
  validation: FaceGuideValidation;
}

/**
 * Visual face-guide frame overlay (Face-ID style oval outline + real-time status pill).
 * Responsive: uses relative percentage positioning inside video container.
 */
export default function FaceGuideOverlay({ validation }: FaceGuideOverlayProps) {
  const { isIdeal, message, status } = validation;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between p-4"
      aria-hidden="true"
    >
      {/* Top spacer */}
      <div className="h-6" />

      {/* SVG Face Guide Oval (Centered, Proportional) */}
      <div className="relative flex h-[72%] max-h-[420px] w-[70%] max-w-[290px] items-center justify-center">
        <svg
          viewBox="0 0 240 320"
          className="h-full w-full transition-all duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Corner Crosshairs */}
          <path
            d="M 120 15 V 35 M 120 285 V 305 M 15 160 H 35 M 205 160 H 225"
            stroke={isIdeal ? "#2FA84F" : "rgba(255, 255, 255, 0.3)"}
            strokeWidth="1.5"
            strokeLinecap="round"
            className="transition-colors duration-300"
          />

          {/* Main Face Oval Outline */}
          <ellipse
            cx="120"
            cy="160"
            rx="92"
            ry="125"
            stroke={isIdeal ? "#2FA84F" : "rgba(255, 255, 255, 0.45)"}
            strokeWidth={isIdeal ? "3.5" : "2"}
            strokeDasharray={isIdeal ? "none" : "6 6"}
            className="transition-all duration-300"
            style={{
              filter: isIdeal
                ? "drop-shadow(0 0 10px rgba(47, 168, 79, 0.7))"
                : "none",
            }}
          />

          {/* Inner Eye Alignment Guide Dots */}
          <circle
            cx="85"
            cy="135"
            r="3"
            fill={isIdeal ? "#2FA84F" : "rgba(255, 255, 255, 0.35)"}
            className="transition-colors duration-300"
          />
          <circle
            cx="155"
            cy="135"
            r="3"
            fill={isIdeal ? "#2FA84F" : "rgba(255, 255, 255, 0.35)"}
            className="transition-colors duration-300"
          />

          {/* Nose Bridge Marker */}
          <path
            d="M 120 150 V 162"
            stroke={isIdeal ? "#2FA84F" : "rgba(255, 255, 255, 0.35)"}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-colors duration-300"
          />
        </svg>
      </div>

      {/* Real-Time Guidance Status Pill */}
      <div className="mb-2 transition-all duration-300">
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-lg backdrop-blur-md transition-all duration-300 border ${
            isIdeal
              ? "border-isy-green-bright bg-isy-green-bright text-white ring-2 ring-isy-green-bright/40 animate-pulse"
              : status === "no_face"
              ? "border-white/20 bg-black/60 text-white/80"
              : "border-amber-400/50 bg-black/75 text-amber-300"
          }`}
        >
          {/* Dynamic Status Icon */}
          {isIdeal ? (
            <svg
              className="h-4 w-4 shrink-0 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : status === "far" ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          ) : status === "close" ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m0 0l-3-3m3 3l3-3" />
            </svg>
          )}

          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
