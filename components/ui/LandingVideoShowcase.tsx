"use client";

/**
 * components/ui/LandingVideoShowcase.tsx
 *
 * Full-width, borderless cinematic luxury video showcase for Optik I See You.
 * - Clean edge-to-edge luxury aesthetic with zero overlaid toggle pills.
 * - Auto-plays video seamlessly.
 * - Intelligent Audio: Automatically enables audio when scrolled into view (once user interacts with the page),
 *   and automatically mutes audio when scrolled out of view.
 * - Click to Scale-Up: Fullscreen toggle upon clicking the video.
 */

import { useEffect, useRef, useState, useCallback } from "react";

export default function LandingVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isIntersectingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

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

  // Attempt to enable audio safely
  const attemptUnmute = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isIntersectingRef.current) return;

    video.muted = false;
    video.volume = 1.0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser blocked audio autoplay before interaction; fallback to muted until gesture
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, []);

  // Mute audio immediately when out of view
  const muteAudio = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
  }, []);

  // Listen for initial user interaction (scroll, touch, click) to unlock browser audio context
  useEffect(() => {
    const handleFirstInteraction = () => {
      hasUserInteractedRef.current = true;
      if (isIntersectingRef.current) {
        attemptUnmute();
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { passive: true, once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { passive: true, once: true });
    window.addEventListener("click", handleFirstInteraction, { passive: true, once: true });
    window.addEventListener("scroll", handleFirstInteraction, { passive: true, once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };
  }, [attemptUnmute]);

  // Guaranteed continuous playback loop + Scroll-based Audio Observer
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

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

    // IntersectionObserver: Turn sound ON when entering viewport, turn sound OFF when leaving
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          isIntersectingRef.current = true;
          video.play().catch(() => {});
          if (hasUserInteractedRef.current) {
            attemptUnmute();
          } else {
            // Attempt even without interaction (some browsers allow it based on domain MEI)
            attemptUnmute();
          }
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
          isIntersectingRef.current = false;
          // Mute audio immediately when out of view
          muteAudio();
        }
      },
      {
        threshold: [0, 0.2, 0.35, 0.7],
      }
    );

    observer.observe(container);

    // Continuous loop safeguard
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener("ended", handleEnded);

    return () => {
      observer.disconnect();
      video.removeEventListener("ended", handleEnded);
    };
  }, [attemptUnmute, muteAudio]);

  // Click to scale-up into full view / fullscreen
  const handleScaleUp = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    hasUserInteractedRef.current = true;
    // Unmute when explicitly clicked
    video.muted = false;
    video.volume = 1.0;
    video.play().catch(() => {});

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          // iOS Safari fallback
          if ((video as unknown as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
            (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
          }
        });
      } else if ((video as unknown as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
        (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-black select-none">
      {/* Edge-to-Edge Full Width Video Container (Clickable to Scale-Up Fullscreen) */}
      <div
        ref={containerRef}
        onClick={handleScaleUp}
        title="Klik untuk memperbesar layar penuh"
        className="group relative w-full aspect-[4/3] xs:aspect-[16/9] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[85vh] min-h-[260px] overflow-hidden bg-black flex items-center justify-center cursor-pointer pointer-events-auto"
      >
        {/* Continuous Autoplay HTML5 Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/Video Landing/web-poster.webp"
          src={isMobile ? "/Video Landing/web-mobile.mp4" : "/Video Landing/web-optimized.mp4"}
          className="h-full w-full object-cover pointer-events-none select-none transition-transform duration-700 ease-out group-hover:scale-[1.015]"
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
      </div>
    </section>
  );
}
