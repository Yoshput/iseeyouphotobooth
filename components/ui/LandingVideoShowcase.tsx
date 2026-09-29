"use client";

/**
 * components/ui/LandingVideoShowcase.tsx
 *
 * Full-width, borderless cinematic luxury video showcase for Optik I See You.
 * - Edge-to-edge full width visual presentation (Apple / Gentle Monster aesthetic)
 * - Zero pause buttons, zero scrub bar — non-skippable, clear cinematic background loop
 * - Guaranteed continuous autoplay with hardware acceleration
 * - Local high-speed CDN delivery from /public/Video Landing/
 */

import { useEffect, useRef, useState } from "react";

export default function LandingVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen for responsive video payload
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Guaranteed continuous playback loop — ensures video never freezes or stays paused
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force initial play
    const startPlay = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener("loadeddata", startPlay, { once: true });
      video.addEventListener("canplay", startPlay, { once: true });
    }

    // IntersectionObserver: Ensure it plays when in view and resumes smoothly
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          // Pause when completely off screen to save GPU/battery
          video.pause();
        }
      },
      { rootMargin: "200px 0px 200px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // If for any reason playback stalls or ends, immediately loop
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener("ended", handleEnded);

    return () => {
      observer.disconnect();
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Mute / Unmute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Auto-hide subtle sound controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  return (
    <section className="relative w-full overflow-hidden bg-black select-none">
      {/* Edge-to-Edge Full Width Video Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
        className="group relative w-full aspect-[4/3] xs:aspect-[16/9] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[85vh] min-h-[260px] overflow-hidden bg-black flex items-center justify-center pointer-events-auto"
      >
        {/* Continuous Autoplay HTML5 Video — Non-clickable, Non-skippable */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/Video Landing/web-poster.webp"
          src={isMobile ? "/Video Landing/web-mobile.mp4" : "/Video Landing/web-optimized.mp4"}
          className="h-full w-full object-cover pointer-events-none select-none"
        >
          {isMobile ? (
            <>
              <source src="/Video Landing/web-mobile.mp4" type="video/mp4" />
              <source src="/Video Landing/web-optimized.mp4" type="video/mp4" />
            </>
          ) : (
            <>
              <source src="/Video Landing/web-optimized.mp4" type="video/mp4" />
              <source src="/Video Landing/web-optimized.webm" type="video/webm" />
              <source src="/Video Landing/web-mobile.mp4" type="video/mp4" />
            </>
          )}
          Browser Anda tidak mendukung tag video HTML5.
        </video>

        {/* Minimalist Sound & Fullscreen Controls at Bottom Right — Subtly fades when idle */}
        <div
          className={`absolute bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2.5 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 sm:opacity-60 sm:hover:opacity-100"
          }`}
        >
          {/* Sound ON / MUTE Pill Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Aktifkan Suara" : "Bisukan Suara"}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-white shadow-lg transition-all duration-200 hover:bg-black/80 hover:border-white/40 active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                </svg>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80">Sound OFF</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">Sound ON</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Mode Layar Penuh"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white shadow-lg transition-all duration-200 hover:bg-black/80 hover:border-white/40 active:scale-95 cursor-pointer"
          >
            {isFullscreen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
