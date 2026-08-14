"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Ambient floating contact lens silhouettes for desktop/tablet viewports.
 * Mirrors FloatingSunglasses.tsx pattern — subtle opacity (15-20%),
 * smooth idle floating motion using GSAP.
 * Lens shapes: concentric circles styled like contact lenses.
 */
export default function FloatingSoftlensAccent() {
  const topLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const midRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topLeftRef.current || !bottomRightRef.current || !midRightRef.current) return;

    const ctx = gsap.context(() => {
      // Top-left lens — slow float up
      gsap.to(topLeftRef.current, {
        y: -22,
        rotation: 8,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Bottom-right lens — offset rhythm, slight tilt
      gsap.to(bottomRightRef.current, {
        y: 18,
        rotation: -6,
        duration: 5.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.8,
      });

      // Mid-right small lens — quickest, lightest
      gsap.to(midRightRef.current, {
        y: -14,
        rotation: 12,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Top-left large contact lens */}
      <div
        ref={topLeftRef}
        className="pointer-events-none fixed left-6 top-1/4 z-10 hidden lg:block opacity-[0.16] transition-opacity"
        aria-hidden="true"
      >
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-isy-green-deep"
        >
          {/* Outer lens ring */}
          <circle
            cx="45"
            cy="45"
            r="40"
            stroke="currentColor"
            strokeWidth="3"
            fill="currentColor"
            fillOpacity="0.06"
          />
          {/* Mid iris ring */}
          <circle
            cx="45"
            cy="45"
            r="27"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity="0.08"
          />
          {/* Inner pupil */}
          <circle
            cx="45"
            cy="45"
            r="13"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Specular highlight */}
          <circle cx="36" cy="34" r="4" fill="currentColor" fillOpacity="0.18" />
        </svg>
      </div>

      {/* Bottom-right large contact lens */}
      <div
        ref={bottomRightRef}
        className="pointer-events-none fixed right-5 bottom-1/4 z-10 hidden lg:block opacity-[0.14] transition-opacity"
        aria-hidden="true"
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-isy-green-bright"
        >
          <circle
            cx="45"
            cy="45"
            r="40"
            stroke="currentColor"
            strokeWidth="3"
            fill="currentColor"
            fillOpacity="0.05"
          />
          <circle
            cx="45"
            cy="45"
            r="27"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity="0.07"
          />
          <circle
            cx="45"
            cy="45"
            r="12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.10"
          />
          <circle cx="36" cy="34" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      </div>

      {/* Mid-right small accent lens */}
      <div
        ref={midRightRef}
        className="pointer-events-none fixed right-16 top-1/3 z-10 hidden lg:block opacity-[0.13] transition-opacity"
        aria-hidden="true"
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-isy-green-deep"
        >
          <circle
            cx="45"
            cy="45"
            r="40"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="currentColor"
            fillOpacity="0.07"
          />
          <circle
            cx="45"
            cy="45"
            r="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity="0.09"
          />
          <circle cx="36" cy="34" r="5" fill="currentColor" fillOpacity="0.16" />
        </svg>
      </div>
    </>
  );
}
