"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Eye, Minimize2, X, VideoOff, RefreshCw } from "lucide-react";

interface LiveCompanionCamProps {
  stream: MediaStream | null;
  onToggleCam?: () => void;
}

export default function LiveCompanionCam({ stream, onToggleCam }: LiveCompanionCamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [internalStream, setInternalStream] = useState<MediaStream | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [camError, setCamError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-minimize on small screens (mobile) on initial mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsMinimized(true);
    }
  }, []);

  // Helper to verify if a stream is live
  const isStreamLive = (s: MediaStream | null): boolean => {
    return Boolean(
      s &&
      s.getVideoTracks().length > 0 &&
      s.getVideoTracks().some((t) => t.readyState === "live")
    );
  };

  // Determine active stream: either passed from modal or internal
  const activeStream = isStreamLive(stream)
    ? stream
    : isStreamLive(internalStream)
    ? internalStream
    : null;

  // Request camera stream internally if no external live stream
  const requestCamera = useCallback(async () => {
    if (activeStream) return;
    setIsLoading(true);
    setCamError(false);

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
        audio: false,
      });
      setInternalStream(s);
      setIsLoading(false);
    } catch (err) {
      console.warn("LiveCompanionCam ideal constraints failed:", err);
      try {
        const s2 = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setInternalStream(s2);
        setIsLoading(false);
      } catch (err2) {
        console.warn("LiveCompanionCam general fallback failed:", err2);
        setCamError(true);
        setIsLoading(false);
      }
    }
  }, [activeStream]);

  // Initial trigger if no stream provided
  useEffect(() => {
    if (!isStreamLive(stream) && !isStreamLive(internalStream)) {
      requestCamera();
    }
  }, [stream, internalStream, requestCamera]);

  // Persistent callback ref: guarantees srcObject is attached the instant video element is in DOM
  const attachVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (el) {
        el.muted = true;
        el.playsInline = true;
        if (activeStream && el.srcObject !== activeStream) {
          el.srcObject = activeStream;
        }
        el.play().catch(() => {});
      }
    },
    [activeStream]
  );

  // Re-sync and play whenever activeStream or minimize state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStream) return;

    video.muted = true;
    video.playsInline = true;

    if (video.srcObject !== activeStream) {
      video.srcObject = activeStream;
    }

    video.play().catch((err) => {
      console.warn("video.play error:", err);
    });
  }, [activeStream, isMinimized]);

  // Clean up internal stream when closing or unmounting
  useEffect(() => {
    return () => {
      if (internalStream) {
        internalStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [internalStream]);

  if (isClosed) return null;

  return (
    <aside
      aria-label="Live Focus Monitor"
      className="fixed bottom-24 right-3 sm:bottom-6 sm:right-6 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Minimized Pill Button */}
      {isMinimized && (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            if (!activeStream) {
              requestCamera();
            }
          }}
          className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-full bg-isy-green-deep/95 backdrop-blur-md text-white border border-isy-green-bright/40 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-isy-green-bright animate-pulse" />
          <Eye className="w-3.5 h-3.5 text-isy-green-bright" />
          <span className="text-[10px] sm:text-[11px] font-bold pr-1">Focus Cam</span>
        </button>
      )}

      {/* Expanded Monitor Box — Kept in DOM so video stream is never destroyed on toggle */}
      <div
        className={`relative w-36 sm:w-44 rounded-2xl overflow-hidden bg-black/90 border-2 border-isy-green-deep shadow-2xl p-1 backdrop-blur-md transition-all duration-200 ${
          isMinimized ? "hidden pointer-events-none" : "block"
        }`}
      >
        {/* Top Title Bar */}
        <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-isy-green-bright animate-ping" />
            <span className="text-isy-green-bright uppercase tracking-wider">Eye Lab</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Camera Refresh Button */}
            <button
              type="button"
              onClick={() => {
                if (internalStream) {
                  internalStream.getTracks().forEach((t) => t.stop());
                  setInternalStream(null);
                }
                requestCamera();
              }}
              title="Muat Ulang Kamera"
              className="p-0.5 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Kecilkan"
              className="p-0.5 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsClosed(true);
                if (internalStream) {
                  internalStream.getTracks().forEach((t) => t.stop());
                }
                if (onToggleCam) onToggleCam();
              }}
              title="Tutup Monitor"
              className="p-0.5 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
              <RefreshCw className="w-4 h-4 text-isy-green-bright animate-spin mb-1" />
              <span className="text-[8px] text-white/70 font-bold">Memuat...</span>
            </div>
          )}

          {camError ? (
            <div className="flex flex-col items-center justify-center p-2 text-center text-zinc-400">
              <VideoOff className="w-5 h-5 mb-1 text-amber-400 opacity-80" />
              <span className="text-[9px] font-bold leading-tight mb-1.5">Kamera Belum Aktif</span>
              <button
                type="button"
                onClick={requestCamera}
                className="text-[9px] font-black px-2 py-0.5 rounded-md bg-isy-green-deep text-white hover:bg-isy-green-bright transition-colors cursor-pointer"
              >
                Nyalakan Kamera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={attachVideoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => {});
                }}
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {/* Viewfinder crosshairs */}
              <div className="absolute inset-2 pointer-events-none border border-white/20 rounded-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-isy-green-bright/70 animate-pulse" />
              </div>
            </>
          )}
        </div>

        {/* Bottom Badge */}
        <div className="text-center py-1 text-[9px] font-bold text-white/70 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-isy-green-bright" />
          <span>AI Focus Monitor</span>
        </div>
      </div>
    </aside>
  );
}

