"use client";

/**
 * components/pwa/PWASplashScreen.tsx
 *
 * Luxury Brand Opening Splash Pop-up for Optik I See You.
 * - Smooth brand logo pop-up animation on initial launch / open
 * - Ivory #FAF6EC background with Emerald #116B3C typography
 * - Smooth luxury scale & fade transition
 * - Session-cached (plays once per session) & tap-to-skip
 */

import { useEffect, useState } from "react";

export default function PWASplashScreen() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only show splash screen if launched as an installed standalone PWA
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true);

    if (!isStandalone) return;

    // Check if splash was already shown in this session
    try {
      const alreadyShown = sessionStorage.getItem("isy_splash_shown");
      if (alreadyShown) return;
      sessionStorage.setItem("isy_splash_shown", "true");
    } catch {
      // Ignore private browsing restrictions
    }

    setShow(true);

    // Start fade-out at 1.1s
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1100);

    // Completely unmount at 1.6s
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 1600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);


  if (!show) return null;

  return (
    <div
      onClick={() => setShow(false)}
      role="status"
      aria-label="Memuat Optik I See You"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-isy-ivory transition-all duration-500 cursor-pointer select-none ${
        fading ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundColor: "#FAF6EC",
      }}
    >
      {/* Soft radial ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-[320px] w-[320px] sm:h-[450px] sm:w-[450px] rounded-full bg-isy-green-bright/10 blur-[100px] animate-pulse"
      />

      {/* Center Logo Content with Pop-up Animation */}
      <div className="relative z-10 flex flex-col items-center text-center animate-in zoom-in-90 fade-in duration-700 ease-out space-y-2">
        {/* OPTIK — small, tracked */}
        <span
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.4em",
            color: "#116B3C",
            textTransform: "uppercase",
            lineHeight: 1,
            marginLeft: "0.4em",
          }}
        >
          OPTIK
        </span>

        {/* I SEE YOU — big bold serif */}
        <span
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(36px, 9vw, 54px)",
            fontWeight: 900,
            color: "#0D5C33",
            letterSpacing: "0.02em",
            lineHeight: 1.05,
          }}
        >
          I SEE YOU
        </span>

        {/* for every you — DM Serif display italic */}
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "clamp(16px, 4vw, 22px)",
            fontWeight: 400,
            color: "#1A8F50",
            letterSpacing: "0.22em",
            marginTop: "6px",
          }}
        >
          for every you
        </span>

        {/* Minimal loading dot line */}
        <div className="pt-6 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
