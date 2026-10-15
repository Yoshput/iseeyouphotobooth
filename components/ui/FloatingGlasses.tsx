"use client";

/**
 * components/ui/FloatingGlasses.tsx
 *
 * Floating glasses showcase untuk hero section landing page.
 * - Menggunakan aset foto produk asli transparan kualitas tinggi.
 * - Komposisi diagonal terarah (kacamata hitam atas & champagne bawah).
 * - Animasi floating naik-turun halus (keyframe CSS 60fps GPU-accelerated).
 * - Parallax mouse lembut pada desktop.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";

export interface GlassesItem {
  src: string;
  alt?: string;
}

interface FloatingGlassesProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  items?: GlassesItem[];
}

export default function FloatingGlasses({
  src,
  alt = "Kacamata Optik I See You",
  width = 540,
  height = 270,
  items,
}: FloatingGlassesProps) {
  const glasses: GlassesItem[] =
    items && items.length > 0
      ? items
      : src
      ? [{ src, alt }]
      : [
          {
            src: "/glasses/hero-glasses-black.webp",
            alt: "Frame Hitam Kacamata I See You",
          },
          {
            src: "/glasses/hero-glasses-champagne.webp",
            alt: "Frame Champagne Crystal Kacamata I See You",
          },
        ];

  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Disable mouse parallax on mobile/tablet or touch screens to save main-thread & battery
    if (typeof window === "undefined" || window.innerWidth < 768) {
      return;
    }

    let animationFrameId: number | null = null;
    let currentX = 0;
    let currentY = 0;
    let isRunning = false;

    const render = () => {
      const diffX = parallaxRef.current.x - currentX;
      const diffY = parallaxRef.current.y - currentY;
      currentX += diffX * 0.06;
      currentY += diffY * 0.06;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }

      // Stop loop when close to target to release CPU
      if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        isRunning = false;
        animationFrameId = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      parallaxRef.current = { x: nx * 14, y: ny * 10 };

      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-motion="allow"
      className="allow-motion relative w-full max-w-[560px] flex flex-col items-center justify-center pointer-events-none select-none transition-transform duration-100 ease-out"
    >
      <style>{`
        @keyframes float-glasses-top {
          0% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -22px, 0) rotate(2.5deg);
          }
          100% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
        }

        @keyframes float-glasses-bottom {
          0% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, 20px, 0) rotate(-2deg);
          }
          100% {
            transform: translate3d(0, 0px, 0) rotate(0deg);
          }
        }

        .glasses-float-top {
          animation: float-glasses-top 3.8s ease-in-out infinite !important;
          will-change: transform;
        }

        .glasses-float-bottom {
          animation: float-glasses-bottom 4.5s ease-in-out infinite 0.7s !important;
          will-change: transform;
        }
      `}</style>

      {/* Frame 1: Kacamata Hitam (Atas, Floating Naik-Turun) */}
      {glasses[0] && (
        <div
          data-motion="allow"
          className="allow-motion glasses-float-top relative w-[82%] sm:w-[86%] aspect-[2/1] -mb-10 sm:-mb-14 z-20 drop-shadow-[0_18px_28px_rgba(18,71,52,0.18)]"
        >
          <Image
            src={glasses[0].src}
            alt={glasses[0].alt || "Frame Kacamata 1"}
            fill
            priority
            sizes="(max-width: 768px) 320px, 500px"
            className="object-contain"
          />
        </div>
      )}

      {/* Frame 2: Kacamata Champagne Crystal (Bawah, Floating Bertolak Belakang) */}
      {glasses[1] && (
        <div
          data-motion="allow"
          className="allow-motion glasses-float-bottom relative w-[82%] sm:w-[86%] aspect-[2/1] ml-8 sm:ml-12 z-10 drop-shadow-[0_20px_32px_rgba(0,0,0,0.12)]"
        >
          <Image
            src={glasses[1].src}
            alt={glasses[1].alt || "Frame Kacamata 2"}
            fill
            priority
            sizes="(max-width: 768px) 320px, 500px"
            className="object-contain"
          />
        </div>
      )}

      {/* Subtle organic shadow underneath */}
      <div
        aria-hidden="true"
        className="w-48 sm:w-64 h-6 rounded-full bg-[#124734]/8 blur-xl mt-2 pointer-events-none"
      />
    </div>
  );
}
