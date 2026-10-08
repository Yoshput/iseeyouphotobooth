"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface BlogMediaProps {
  title: string;
  coverImage: string;
  videoUrl?: string;
}

export default function BlogMedia({ title, coverImage, videoUrl }: BlogMediaProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    // Browser standard autoplay requires muted
    video.muted = true;
    setIsMuted(true);

    const checkAudio = () => {
      const audio =
        Boolean((video as any).mozHasAudio) ||
        Boolean((video as any).webkitAudioDecodedByteCount) ||
        Boolean((video as any).audioTracks && (video as any).audioTracks.length > 0);
      setHasAudio(audio);
    };

    video.addEventListener("loadeddata", checkAudio);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }

    // Performance & Battery Saver: Pause video when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", checkAudio);
    };
  }, [videoUrl]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  if (videoUrl && !hasVideoError) {
    return (
      <div className="relative aspect-[4/5] w-full max-w-lg rounded-3xl overflow-hidden shadow-xl border border-isy-line bg-black flex items-center justify-center group select-none transform-gpu">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={coverImage}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setHasVideoError(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handleVideoClick}
          className="w-full h-full object-cover cursor-pointer"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Minimalist Sound Toggle Pill (Only when video actually has audio) */}
        {hasAudio && (
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={handleSoundToggle}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium transition-all shadow-lg border border-white/15 active:scale-95 cursor-pointer"
              aria-label={isMuted ? "Aktifkan suara video" : "Bisukan suara video"}
            >
              {isMuted ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span>Aktifkan Suara</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span className="text-emerald-300">Suara Aktif</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Minimalist Pause Overlay (Only shown when user manually paused) */}
        {!isPlaying && (
          <div
            onClick={handleVideoClick}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 z-10"
            role="button"
            aria-label="Lanjutkan Pemutaran Video"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 backdrop-blur-md text-isy-green-deep flex items-center justify-center shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 pl-1">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="mt-3 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">
              Ketuk untuk Melanjutkan
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full max-w-lg rounded-3xl overflow-hidden shadow-xl border border-isy-line bg-isy-mist">
      <Image
        src={coverImage}
        alt={title}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 512px"
      />
    </div>
  );
}
