"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Rich, elegant brand green & gold confetti burst on catalog load.
 * Colors: Optik I See You Deep Green, Bright Green, Emerald, Gold, White.
 * - Respects prefers-reduced-motion for accessibility.
 * - Reduced particle count on mobile for performance.
 * - Properly cleans up with confetti.reset() on unmount.
 */
export default function CatalogConfetti() {
  useEffect(() => {
    // Respect user accessibility preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 640;
    const count = isMobile ? 25 : 55;

    const fireConfetti = () => {
      const defaults = {
        origin: { y: 0.28 },
        colors: ["#1B4D3E", "#2FA84F", "#00C853", "#D4AF37", "#FFFFFF"],
        ticks: isMobile ? 130 : 200,
        gravity: 0.9,
        decay: 0.92,
        scalar: isMobile ? 0.8 : 1.0,
      };

      // Left burst
      confetti({
        ...defaults,
        particleCount: count,
        angle: 60,
        spread: 55,
        origin: { x: 0.15, y: 0.3 },
      });

      // Right burst
      confetti({
        ...defaults,
        particleCount: count,
        angle: 120,
        spread: 55,
        origin: { x: 0.85, y: 0.3 },
      });
    };

    const timer = setTimeout(fireConfetti, 300);

    // Cleanup: cancel pending timer AND reset any running canvas animation
    return () => {
      clearTimeout(timer);
      confetti.reset();
    };
  }, []);

  return null;
}
