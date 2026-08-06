"use client";

/**
 * components/ui/FloatingGlasses.tsx
 *
 * Floating glasses showcase untuk hero section.
 * - CSS float animation (translateY, ease-in-out, infinite)
 * - Subtle rotation oscillation via GSAP
 * - Mouse parallax on desktop only (max ±15px)
 * - Shadow blur bawah untuk kesan premium product shot
 * - IntersectionObserver: pause animasi saat di luar viewport
 * - Zero Three.js / WebGL — pure CSS + GSAP
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface FloatingGlassesProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export default function FloatingGlasses({
  src,
  alt = "Kacamata I See You",
  width = 420,
  height = 210,
}: FloatingGlassesProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(true);
  const isTouchDevice = useRef(false);

  /* ── Detect touch device ───────────────────────────────── */
  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  /* ── GSAP float + rotation ─────────────────────────────── */
  useEffect(() => {
    if (!imgRef.current) return;

    gsapCtxRef.current = gsap.context(() => {
      // Float up/down — amplitude 12px, 5s cycle
      gsap.to(imgRef.current, {
        y: -12,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: !visible,
      });

      // Very subtle rotation oscillation — ±2.5deg
      gsap.to(imgRef.current, {
        rotation: 2.5,
        duration: 3.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: !visible,
      });
    }, imgRef);

    return () => gsapCtxRef.current?.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pause/resume based on visibility ─────────────────── */
  useEffect(() => {
    if (!imgRef.current) return;
    const tweens = gsap.getTweensOf(imgRef.current);
    tweens.forEach((t) => (visible ? t.resume() : t.pause()));
  }, [visible]);

  /* ── IntersectionObserver ──────────────────────────────── */
  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Mouse parallax (desktop only) ────────────────────── */
  useEffect(() => {
    if (isTouchDevice.current || !wrapRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize -1 to +1
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      parallaxRef.current = { x: nx * 15, y: ny * 10 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Smooth RAF interpolation towards target
    const tick = () => {
      if (!wrapRef.current) return;
      const current = {
        x: parseFloat(wrapRef.current.dataset.px ?? "0"),
        y: parseFloat(wrapRef.current.dataset.py ?? "0"),
      };
      const lerped = {
        x: current.x + (parallaxRef.current.x - current.x) * 0.06,
        y: current.y + (parallaxRef.current.y - current.y) * 0.06,
      };
      wrapRef.current.dataset.px = String(lerped.x);
      wrapRef.current.dataset.py = String(lerped.y);
      wrapRef.current.style.transform = `translate(${lerped.x}px, ${lerped.y}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center justify-center select-none"
      style={{ willChange: "transform" }}
    >
      {/* Shadow blob bawah — premium product shot, pure blur ellipse */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "36px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.13) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      {/* Glasses image — no drop-shadow filter, shadow handled by blob below */}
      <div ref={imgRef} style={{ willChange: "transform" }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-contain"
          style={{ maxWidth: `${width}px` }}
          priority
          draggable={false}
        />
      </div>
    </div>
  );
}
