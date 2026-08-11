"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Rich, elegant brand green & gold confetti burst on catalog load.
 * Colors: Optik I See You Deep Green, Bright Green, Emerald, Gold, White.
 */
export default function CatalogConfetti() {
  useEffect(() => {
    // Dual side cannons for a festive & premium hero entry
    const fireConfetti = () => {
      const count = 60;
      const defaults = {
        origin: { y: 0.28 },
        colors: ["#1B4D3E", "#2FA84F", "#00C853", "#D4AF37", "#FFFFFF"],
        ticks: 200,
        gravity: 0.9,
        decay: 0.92,
        scalar: 1.0,
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
    return () => clearTimeout(timer);
  }, []);

  return null;
}
