"use client";

/**
 * components/ui/LandingVideoShowcase.tsx
 *
 * Full-width, borderless cinematic luxury video showcase for Optik I See You.
 * - Edge-to-edge full width visual presentation (Apple / Gentle Monster aesthetic)
 * - Zero text clutter — pure immersive visual experience
 * - 60fps buttery smooth HTML5 Video with FastStart streaming
 * - Minimalist frosted glass sound & playback controls
 */

import { useEffect, useRef, useState } from "react";

export default function LandingVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

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

  // Update progress bar
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 33.88;
    setProgress((curr / dur) * 100);
  };

  // Scrub timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * (videoRef.current.duration || 33.88);
    videoRef.current.currentTime = seekTime;
    setProgress(pos * 100);
  };

  // Auto hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  // Sync autoplay state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Edge-to-Edge Full Width Video Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
        className="group relative w-full aspect-[4/3] xs:aspect-[16/9] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[85vh] min-h-[260px] overflow-hidden bg-black flex items-center justify-center"
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/Video Landing/web-poster.webp"
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
          className="h-full w-full object-cover cursor-pointer select-none"
        >
          <source src="/Video Landing/web-optimized.mp4" type="video/mp4" />
          <source src="/Video Landing/web-optimized.webm" type="video/webm" />
          <source src="/Video Landing/web-mobile.mp4" type="video/mp4" />
          <source src="/Video Landing/HL I SEE U LANDSCAPE.mp4" type="video/mp4" />
          Browser Anda tidak mendukung tag video HTML5.
        </video>

        {/* Big Center Play Overlay Button when Paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all cursor-pointer"
          >
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/95 text-isy-green-deep shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Minimalist Floating Controls at Bottom Corners */}
        <div
          className={`absolute bottom-6 right-6 z-30 flex items-center gap-3 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0 sm:opacity-75 sm:hover:opacity-100"
          }`}
        >
          {/* Sound ON / MUTE Pill Button */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Aktifkan Suara" : "Bisukan Suara"}
            className="flex items-center gap-2 rounded-full border border-white/25 bg-black/50 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-xl transition-all duration-300 hover:bg-black/80 hover:border-white/50 active:scale-95"
          >
            {isMuted ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                </svg>
                <span className="text-[11px] uppercase tracking-wider text-white/80">Sound OFF</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Sound ON</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            aria-label="Mode Layar Penuh"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/50 backdrop-blur-md text-white shadow-xl transition-all duration-300 hover:bg-black/80 hover:border-white/50 active:scale-95"
          >
            {isFullscreen ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Minimal Play / Pause Indicator at Bottom Left */}
        <div
          className={`absolute bottom-6 left-6 z-30 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Jeda Video" : "Putar Video"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/50 backdrop-blur-md text-white shadow-xl transition-all duration-300 hover:bg-black/80 hover:border-white/50 active:scale-95"
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Ultra-slim Scrub Line at the Very Bottom */}
        <div
          onClick={handleSeek}
          className="group/scrub absolute bottom-0 left-0 right-0 z-30 h-1 hover:h-2 cursor-pointer bg-white/20 transition-all"
        >
          <div
            className="h-full bg-gradient-to-r from-isy-green-bright to-emerald-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
