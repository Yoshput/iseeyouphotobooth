"use client";

/**
 * components/ui/FloatingGlasses.tsx
 *
 * Floating glasses showcase untuk hero section landing page.
 * - Menggunakan aset foto produk asli transparan kualitas tinggi.
 * - Mendukung 1, 2, atau 3 frame kacamata dalam komposisi diagonal yang terarah.
 * - Animasi floating transform halus via GSAP (translateY, rotation).
 * - Menghormati prefers-reduced-motion (animasi dinonaktifkan jika reduced motion aktif).
 * - Desktop mouse parallax lembut (±12px max).
 * - Pause otomatis saat keluar viewport via IntersectionObserver.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

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

  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(true);
  const isTouchDevice = useRef(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  /* ── GSAP float + rotation with reduced-motion respect ─────────────── */
  useEffect(() => {
    if (prefersReducedMotion.current) return;

    const validRefs = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    if (validRefs.length === 0) return;

    gsapCtxRef.current = gsap.context(() => {
      validRefs.forEach((el, i) => {
        const delay = i * 0.9;
        const yDistance = i % 2 === 0 ? -12 : -10;
        const rotAmount = i % 2 === 0 ? 2 : -2;

        gsap.to(el, {
          y: yDistance,
          duration: 3.2 + i * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay,
          paused: !visible,
        });

        gsap.to(el, {
          rotation: rotAmount,
          duration: 4.5 + i * 0.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: delay + 0.4,
          paused: !visible,
        });
      });
    });

    return () => gsapCtxRef.current?.revert();
  }, [glasses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pause / resume based on visibility ─────────────────── */
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    const validRefs = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    validRefs.forEach((el) => {
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

  /* ── Subtle mouse parallax (desktop only) ────────────────────── */
  useEffect(() => {
    if (
      isTouchDevice.current ||
      prefersReducedMotion.current ||
      !wrapRef.current
    )
      return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      parallaxRef.current = { x: nx * 10, y: ny * 8 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const tick = () => {
      if (!wrapRef.current) return;
      const current = {
        x: parseFloat(wrapRef.current.dataset.px ?? "0"),
        y: parseFloat(wrapRef.current.dataset.py ?? "0"),
      };
      const lerped = {
        x: current.x + (parallaxRef.current.x - current.x) * 0.05,
        y: current.y + (parallaxRef.current.y - current.y) * 0.05,
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
  if (glasses.length === 1) {
    const g = glasses[0];
    return (
      <div
        ref={wrapRef}
        className="relative flex items-center justify-center select-none w-full"
        style={{ willChange: "transform", maxWidth: `${width}px` }}
      >
        <div
          ref={(el) => {
            itemRefs.current[0] = el;
          }}
          className="w-full flex justify-center"
          style={{ willChange: "transform" }}
        >
          <Image
            src={g.src}
            alt={g.alt ?? alt}
            width={width}
            height={height}
            className="w-full h-auto object-contain drop-shadow-sm"
            priority
            draggable={false}
          />
        </div>
      </div>
    );
  }

  // 2 or 3 curated glasses diagonal layout
  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col items-center select-none w-full"
      style={{
        willChange: "transform",
        maxWidth: `${width}px`,
        gap: "20px",
      }}
    >
      {glasses.slice(0, 3).map((item, idx) => {
        const isEven = idx % 2 === 0;
        const alignStyle = isEven
          ? { alignSelf: "flex-start", marginLeft: "3%" }
          : { alignSelf: "flex-end", marginRight: "3%" };

        return (
          <div
            key={item.src + idx}
            className="relative w-[88%] sm:w-[84%]"
            style={alignStyle}
          >
            {/* Soft Ambient Shadow blob */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "74%",
                height: "20px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(18, 71, 52, 0.08) 0%, transparent 70%)",
                filter: "blur(12px)",
                pointerEvents: "none",
              }}
            />
            <div
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              style={{ willChange: "transform" }}
            >
              <Image
                src={item.src}
                alt={item.alt ?? `Frame Kacamata ${idx + 1}`}
                width={width}
                height={height}
                className="w-full h-auto object-contain drop-shadow-sm"
                priority={idx === 0}
                draggable={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
