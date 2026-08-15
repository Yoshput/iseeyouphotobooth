"use client";

/**
 * components/ui/LandingVideoShowcase.tsx
 *
 * Ultra-modern, smooth, luxury video showcase for Optik I See You Homepage.
 * - 60fps buttery smooth playback with HTML5 Video + FastStart streaming
 * - Apple / Gentle Monster aesthetic with frosted glass controls
 * - Ambient background glow & interactive play/pause, sound, and fullscreen
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function LandingVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
    setCurrentTime(curr);
    setDuration(dur);
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

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Sync autoplay state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay with sound might be blocked, ensure muted
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
    <section className="relative w-full overflow-hidden px-6 py-16 sm:py-24 bg-gradient-to-b from-transparent via-isy-ivory to-white">
      <div className="mx-auto max-w-5xl relative z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3 mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-isy-green-bright">
              CINEMATIC EXPERIENCE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-black text-isy-green-deep leading-tight">
            Lihat Pengalaman Seru
            <br />
            <span className="text-isy-green-bright italic">di Optik I See You</span>
          </h2>

          <p className="text-xs sm:text-sm text-isy-ink/65 max-w-lg mx-auto font-medium leading-relaxed">
            Eksplorasi koleksi kacamata, softlens, teknologi AR Try-On interaktif, dan photobooth cetak instan kami dalam satu tayangan visual.
          </p>
        </div>

        {/* Video Showcase Card */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
          className="group relative mx-auto w-full aspect-[16/9] max-w-4xl overflow-hidden rounded-[2rem] border border-isy-line bg-black shadow-2xl transition-all duration-500 hover:shadow-isy-green-bright/15"
        >
          {/* Ambient glow behind video */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-isy-green-bright/20 to-isy-green-deep/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity"
          />

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
            className="relative z-10 h-full w-full object-cover cursor-pointer"
          >
            <source src="/Video Landing/web-optimized.mp4" type="video/mp4" />
            <source src="/Video Landing/web-optimized.webm" type="video/webm" />
            <source src="/Video Landing/web-mobile.mp4" type="video/mp4" />
            <source src="/Video Landing/HL I SEE U LANDSCAPE.mp4" type="video/mp4" />
            Browser Anda tidak mendukung tag video HTML5.
          </video>

          {/* Big Center Play/Pause Overlay Button when Paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all cursor-pointer"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-isy-green-deep shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Luxury Video Controls Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col gap-2 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Interactive Progress Scrub Bar */}
            <div
              onClick={handleSeek}
              className="group/scrub relative h-1.5 hover:h-2.5 w-full cursor-pointer rounded-full bg-white/25 transition-all"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-isy-green-bright to-emerald-400 relative"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover/scrub:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between pt-1 text-white">
              <div className="flex items-center gap-3">
                {/* Play / Pause button */}
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-md hover:bg-white/30 transition-colors"
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

                {/* Mute / Unmute button */}
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                      </svg>
                      <span className="text-[10px]">Mute</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                      <span className="text-[10px] text-isy-green-bright font-bold">Sound ON</span>
                    </>
                  )}
                </button>

                {/* Time Display */}
                <span className="text-[11px] font-mono text-white/70">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right side: Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                aria-label="Toggle Fullscreen"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-md hover:bg-white/30 transition-colors"
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
        </div>

        {/* Bottom CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>Mulai Coba Kacamata AR Sekarang</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-2xl border border-isy-line bg-white px-6 py-4 text-xs font-bold text-isy-green-deep shadow-sm transition-all hover:border-isy-green-bright hover:bg-isy-ivory active:scale-95"
          >
            <span>Lihat Katalog Frame</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
