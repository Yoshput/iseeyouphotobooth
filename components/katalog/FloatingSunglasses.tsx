"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Ambient floating sunglasses silhouettes for desktop/tablet viewports.
 * Subtle opacity (15-20%), smooth idle floating motion using GSAP.
 */
export default function FloatingSunglasses() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    const ctx = gsap.context(() => {
      // Left sunglasses float
      gsap.to(leftRef.current, {
        y: -18,
        rotation: 4,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Right sunglasses float (slightly offset rhythm)
      gsap.to(rightRef.current, {
        y: 20,
        rotation: -5,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.6,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Left Floating Silhouette */}
      <div
        ref={leftRef}
        className="pointer-events-none fixed left-4 top-1/3 z-10 hidden lg:block opacity-[0.18] transition-opacity hover:opacity-30"
        aria-hidden="true"
      >
        <svg
          width="120"
          height="50"
          viewBox="0 0 120 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-isy-green-deep"
        >
          {/* Eyeglasses Frame Outline SVG */}
          <path
            d="M8 20C8 12 18 10 32 10C46 10 54 15 54 22C54 32 44 38 32 38C20 38 8 32 8 20Z"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <path
            d="M66 20C66 12 76 10 90 10C104 10 112 15 112 22C112 32 102 38 90 38C78 38 66 32 66 20Z"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <path
            d="M54 18C57 16 63 16 66 18"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M2 16L8 18"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M118 16L112 18"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Right Floating Silhouette */}
      <div
        ref={rightRef}
        className="pointer-events-none fixed right-4 top-2/3 z-10 hidden lg:block opacity-[0.16] transition-opacity hover:opacity-30"
        aria-hidden="true"
      >
        <svg
          width="110"
          height="46"
          viewBox="0 0 120 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-isy-green-deep"
        >
          {/* Cat-Eye Silhouette */}
          <path
            d="M6 14C12 6 36 8 50 16C54 26 42 38 28 38C14 38 4 26 6 14Z"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M114 14C108 6 84 8 70 16C66 26 78 38 92 38C106 38 116 26 114 14Z"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M50 16C55 15 65 15 70 16"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
