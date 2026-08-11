"use client";

/**
 * components/ui/FloatingGlasses.tsx
 *
 * Floating glasses showcase untuk hero section.
 * - Mendukung 1 atau 2 gambar kacamata (staggered diagonal layout)
 * - Pure PNG 100% transparan tanpa background / tanpa mix-blend-mode distortion
 * - CSS float animation via GSAP (translateY, sine.inOut, infinite)
 * - Subtle rotation oscillation, stagger antar frame
 * - Mouse parallax on desktop only (max ±15px)
 * - IntersectionObserver: pause animasi saat di luar viewport
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface GlassesItem {
  src: string;
  alt?: string;
}

interface FloatingGlassesProps {
  /** Legacy single-image support */
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Multi-image support: array of 1 atau 2 kacamata */
  items?: GlassesItem[];
}

export default function FloatingGlasses({
  src,
  alt = "Kacamata I See You",
  width = 520,
  height = 260,
  items,
}: FloatingGlassesProps) {
  // Normalise ke array — backward-compat dengan props lama (src/alt)
  const glasses: GlassesItem[] =
    items && items.length > 0
      ? items
      : src
      ? [{ src, alt }]
      : [];

  const wrapRef = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(true);
  const isTouchDevice = useRef(false);

  const isDual = glasses.length >= 2;

  /* ── Detect touch device ───────────────────────────────── */
  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  /* ── GSAP float + rotation ─────────────────────────────── */
  useEffect(() => {
    const refs = [img1Ref.current, img2Ref.current].filter(Boolean) as HTMLDivElement[];
    if (refs.length === 0) return;

    gsapCtxRef.current = gsap.context(() => {
      refs.forEach((el, i) => {
        const delay = i * 1.1;

        gsap.to(el, {
          y: -14,
          duration: 2.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay,
          paused: !visible,
        });

        gsap.to(el, {
          rotation: i === 0 ? 2.5 : -2.5,
          duration: 4.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: delay + 0.5,
          paused: !visible,
        });
      });
    });

    return () => gsapCtxRef.current?.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pause/resume based on visibility ─────────────────── */
  useEffect(() => {
    const refs = [img1Ref.current, img2Ref.current].filter(Boolean) as HTMLDivElement[];
    refs.forEach((el) => {
      const tweens = gsap.getTweensOf(el);
      tweens.forEach((t) => (visible ? t.resume() : t.pause()));
    });
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
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      parallaxRef.current = { x: nx * 15, y: ny * 10 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

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

  /* ── Render ────────────────────────────────────────────── */

  if (!isDual) {
    const g = glasses[0];
    if (!g) return null;
    return (
      <div
        ref={wrapRef}
        className="relative flex items-center justify-center select-none w-full"
        style={{ willChange: "transform", maxWidth: `${width}px` }}
      >
        {/* Shadow blob */}
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
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
        <div ref={img1Ref} className="w-full flex justify-center" style={{ willChange: "transform" }}>
          <Image
            src={g.src}
            alt={g.alt ?? alt}
            width={width}
            height={height}
            className="w-full h-auto object-contain drop-shadow-md"
            style={{ maxWidth: `${width}px` }}
            priority
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // === Dual glasses layout — prominent size & diagonal stagger ===
  const [g1, g2] = glasses;
  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col items-center select-none w-full"
      style={{
        willChange: "transform",
        maxWidth: "560px",
        gap: "16px",
      }}
    >
      {/* ── Frame 1 — Hitam (atas, geser sedikit ke kiri) ── */}
      <div
        className="relative w-[88%] sm:w-[85%]"
        style={{ alignSelf: "flex-start", marginLeft: "2%" }}
      >
        {/* Soft Shadow blob */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "72%",
            height: "24px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, transparent 70%)",
            filter: "blur(14px)",
            pointerEvents: "none",
          }}
        />
        <div ref={img1Ref} style={{ willChange: "transform" }}>
          <Image
            src={g1.src}
            alt={g1.alt ?? "Kacamata Hitam I See You"}
            width={width}
            height={height}
            className="w-full h-auto object-contain drop-shadow-sm"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* ── Frame 2 — Tortoise / Caramel (bawah, geser sedikit ke kanan) ── */}
      <div
        className="relative w-[88%] sm:w-[85%]"
        style={{ alignSelf: "flex-end", marginRight: "2%" }}
      >
        {/* Soft Shadow blob */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "72%",
            height: "24px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, transparent 70%)",
            filter: "blur(14px)",
            pointerEvents: "none",
          }}
        />
        <div ref={img2Ref} style={{ willChange: "transform" }}>
          <Image
            src={g2.src}
            alt={g2.alt ?? "Kacamata Tortoise Caramel I See You"}
            width={width}
            height={height}
            className="w-full h-auto object-contain drop-shadow-sm"
            priority
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
