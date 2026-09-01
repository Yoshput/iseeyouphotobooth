"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RemoteCameraContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room") || "";

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<"initializing" | "connecting" | "connected" | "error">("initializing");
  const [statusMsg, setStatusMsg] = useState("Menyiapkan kamera HP...");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const peerRef = useRef<any>(null);

  // 1. Initialize Camera on Smartphone
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      try {
        if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
        }

        setStatus("initializing");
        setStatusMsg("Membuka kamera belakang HP...");

        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        });

        if (!isMounted) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
          await videoRef.current.play().catch(() => {});
        }

        // Check torch capability
        const track = localStream.getVideoTracks()[0];
        const caps: any = track.getCapabilities?.();
        setHasTorch(Boolean(caps?.torch));

        setStatus("connecting");
        setStatusMsg("Menghubungkan ke Tablet...");
      } catch (err: any) {
        console.error("Camera error:", err);
        if (isMounted) {
          setStatus("error");
          setStatusMsg("Gagal mengakses kamera. Berikan izin akses kamera di browser.");
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // 2. Connect to Tablet via WebRTC PeerJS
  useEffect(() => {
    if (!room || !stream) return;

    let peer: any = null;
    let call: any = null;
    let isMounted = true;

    async function setupPeer() {
      try {
        const { default: Peer } = await import("peerjs");
        peer = new Peer({
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
            ],
          },
        });
        peerRef.current = peer;

        peer.on("open", () => {
          if (!isMounted) return;
          setStatus("connecting");
          setStatusMsg("Memanggil Tablet Photobooth...");

          // Call tablet room with video stream
          call = peer.call(room, stream);

          call.on("stream", () => {
            // Answer stream received
          });

          call.on("close", () => {
            if (isMounted) {
              setStatus("connecting");
              setStatusMsg("Koneksi ditutup. Menghubungkan ulang...");
            }
          });

          // Connection established
          setStatus("connected");
          setStatusMsg("Terhubung ke Tablet! Kamera HP aktif.");
        });

        peer.on("error", (err: any) => {
          console.warn("Peer error:", err);
          if (isMounted && status !== "connected") {
            setStatus("connecting");
            setStatusMsg("Mencari tablet... Pastikan tablet masih membuka halaman photobooth.");
          }
        });
      } catch (err) {
        console.error("PeerJS load error:", err);
      }
    }

    setupPeer();

    return () => {
      isMounted = false;
      if (call) call.close();
      if (peer) peer.destroy();
    };
  }, [room, stream]);

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn("Torch not supported", e);
    }
  };

  const switchCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="relative flex h-screen w-screen flex-col bg-black text-white select-none overflow-hidden font-sans">
      {/* Top Header Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              status === "connected"
                ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_#10B981]"
                : status === "connecting"
                ? "bg-amber-400 animate-ping"
                : "bg-rose-500"
            }`}
          />
          <span className="text-xs font-bold tracking-wide">
            {status === "connected" ? "TERHUBUNG KE TABLET" : status === "connecting" ? "MENGHUBUNGKAN..." : "TERPUTUS"}
          </span>
        </div>

        <div className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white/80 border border-white/10 backdrop-blur-md">
          Room: {room ? room.slice(-6) : "Unknown"}
        </div>
      </div>

      {/* Main Fullscreen Video View */}
      <div className="relative flex-1 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${facingMode === "user" ? "-scale-x-100" : "scale-x-100"}`}
        />

        {/* Center Target Box overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-3/4 w-4/5 rounded-3xl border-2 border-dashed border-white/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-4">
            <span className="text-[10px] tracking-widest uppercase text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
              Area Frame Photobooth
            </span>
            <span className="text-[11px] text-white/80 bg-black/50 px-3 py-1 rounded-full text-center">
              Arahkan ke pengunjung. Pengoperasian jepret tetap di Tablet.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
        <p className="text-xs text-center text-white/90 font-medium">{statusMsg}</p>

        <div className="flex items-center gap-3">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all active:scale-95 border ${
                torchOn
                  ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_#FBBF24]"
                  : "bg-white/15 text-white border-white/20 backdrop-blur-md"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{torchOn ? "Flash ON" : "Flash OFF"}</span>
            </button>
          )}

          <button
            onClick={switchCameraFacing}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-xs font-bold text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RemoteCameraPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-black text-white">Memuat Kamera...</div>}>
      <RemoteCameraContent />
    </Suspense>
  );
}
