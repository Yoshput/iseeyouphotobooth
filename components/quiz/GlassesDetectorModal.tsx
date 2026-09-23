"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Camera, Scan, Glasses, CheckCircle2, ArrowRight, X, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { getFaceLandmarker } from "@/lib/mediapipe";
import { speakIndonesian, stopSpeaking, unlockVoiceEngine } from "@/lib/voice";

interface GlassesDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (glassesDetected: boolean, stream?: MediaStream | null) => void;
  isVoiceEnabled?: boolean;
}

export default function GlassesDetectorModal({
  isOpen,
  onClose,
  onProceed,
  isVoiceEnabled = true,
}: GlassesDetectorModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "detected" | "not_detected">("idle");
  const [scanFeedback, setScanFeedback] = useState<string>("Siap memindai");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const detectionCountsRef = useRef<{ glasses: number; noGlasses: number; totalFrames: number }>({
    glasses: 0,
    noGlasses: 0,
    totalFrames: 0,
  });

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanState("idle");
      setScanFeedback("Siap memindai");
    }
  }, [isOpen]);

  const startCamera = async () => {
    unlockVoiceEngine();
    try {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      setCameraActive(true);
      setScanState("scanning");
      setScanFeedback("Menganalisis area wajah & kacamata...");
      detectionCountsRef.current = { glasses: 0, noGlasses: 0, totalFrames: 0 };

      let stream = streamRef.current;
      const isExistingActive =
        stream &&
        stream.getVideoTracks().length > 0 &&
        stream.getVideoTracks().some((t) => t.readyState === "live");

      if (!isExistingActive) {
        setScanFeedback("Membuka kamera...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } else if (videoRef.current && (!videoRef.current.srcObject || videoRef.current.paused)) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      if (isVoiceEnabled) {
        speakIndonesian("Memindai area wajah dan kacamata. Harap tenang di depan kamera.");
      }

      setScanFeedback("Menganalisis area wajah & kacamata...");

      // Initialize MediaPipe Face Landmarker
      const landmarker = await getFaceLandmarker(1).catch((err) => {
        console.warn("FaceLandmarker init fallback", err);
        return null;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const startTime = performance.now();

      const scanLoop = () => {
        const video = videoRef.current;
        if (!video || video.paused || video.ended) return;

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && ctx) {
          ctx.drawImage(video, 0, 0, 320, 240);

          let detectedThisFrame = false;
          let faceFound = false;

          if (landmarker) {
            try {
              const res = landmarker.detectForVideo(video, performance.now());
              if (res.faceLandmarks && res.faceLandmarks.length > 0) {
                faceFound = true;
                const landmarks = res.faceLandmarks[0];

                // 1. Get inner eye corners
                const leftEyeX = Math.min(landmarks[133].x, landmarks[362].x) * 320;
                const rightEyeX = Math.max(landmarks[133].x, landmarks[362].x) * 320;
                const eyeDistance = Math.max(20, rightEyeX - leftEyeX);
                const centerBridgeX = (leftEyeX + rightEyeX) / 2;

                // 2. Bridge zone width
                const crestHalfW = eyeDistance * 0.14;
                const minCrestX = Math.max(0, Math.round(centerBridgeX - crestHalfW));
                const maxCrestX = Math.min(319, Math.round(centerBridgeX + crestHalfW));
                const crestW = maxCrestX - minCrestX;

                // Vertical band where glasses bridge sits (between glabella 168 and mid nose 197)
                const y168 = Math.round(landmarks[168].y * 240);
                const y6 = Math.round(landmarks[6].y * 240);
                const y197 = Math.round(landmarks[197].y * 240);

                const minY = Math.max(6, Math.min(y168, y6) - 5);
                const maxY = Math.min(234, Math.max(y6, y197) + 5);

                if (crestW >= 6 && maxY > minY) {
                  // Baseline skin luminance (above glabella and below mid bone)
                  const sampleLum = (yPos: number) => {
                    const rowData = ctx.getImageData(minCrestX, yPos, crestW, 1).data;
                    let sum = 0;
                    for (let i = 0; i < rowData.length; i += 4) {
                      sum += 0.299 * rowData[i] + 0.587 * rowData[i + 1] + 0.114 * rowData[i + 2];
                    }
                    return sum / (rowData.length / 4);
                  };

                  const skinAbove = sampleLum(Math.max(2, minY - 10));
                  const skinBelow = sampleLum(Math.min(238, maxY + 10));
                  const baselineSkin = (skinAbove + skinBelow) / 2;

                  let maxBridgeDip = 0;
                  let maxEdgeSharpness = 0;
                  let maxDarkRatio = 0;

                  // Scan across the bridge vertical slice to find the physical frame bridge
                  for (let y = minY; y <= maxY; y++) {
                    const rowData = ctx.getImageData(minCrestX, y, crestW, 1).data;
                    let rowSum = 0;
                    let darkCount = 0;
                    const count = rowData.length / 4;

                    for (let i = 0; i < rowData.length; i += 4) {
                      const lum = 0.299 * rowData[i] + 0.587 * rowData[i + 1] + 0.114 * rowData[i + 2];
                      rowSum += lum;
                      if (lum < 85 || lum < baselineSkin * 0.72) {
                        darkCount++;
                      }
                    }

                    const rowAvgLum = rowSum / count;
                    const dip = baselineSkin - rowAvgLum;

                    // Edge gradient against adjacent rows
                    const lumAbove = sampleLum(Math.max(0, y - 3));
                    const lumBelow = sampleLum(Math.min(239, y + 3));
                    const edge = Math.abs(lumAbove - rowAvgLum) + Math.abs(lumBelow - rowAvgLum);

                    if (dip > maxBridgeDip) maxBridgeDip = dip;
                    if (edge > maxEdgeSharpness) maxEdgeSharpness = edge;
                    const darkRatio = darkCount / count;
                    if (darkRatio > maxDarkRatio) maxDarkRatio = darkRatio;
                  }

                  // Genuine physical glasses frame condition:
                  // 1. High contrast dip against baseline skin (> 18 lum)
                  // 2. Either sharp physical frame edge (> 14) or dark pixel ratio (> 18%)
                  if (maxBridgeDip > 18 && (maxEdgeSharpness > 14 || maxDarkRatio > 0.18)) {
                    detectedThisFrame = true;
                  }
                }
              }
            } catch {
              // fallback gracefully
            }
          }

          if (faceFound) {
            detectionCountsRef.current.totalFrames++;
            if (detectedThisFrame) {
              detectionCountsRef.current.glasses++;
            } else {
              detectionCountsRef.current.noGlasses++;
            }
          }

          const elapsed = performance.now() - startTime;

          // After 2.5 seconds of analysis, determine honest conclusion
          if (elapsed > 2500) {
            const { glasses, totalFrames } = detectionCountsRef.current;
            if (totalFrames >= 8 && glasses / totalFrames >= 0.40) {
              setScanState("detected");
              setScanFeedback("Kacamata Terdeteksi Presisi");
              if (isVoiceEnabled) {
                speakIndonesian("Kacamata terverifikasi presisi! Silakan lanjut ke kuis.");
              }
            } else {
              // Honest conclusion: no glasses detected (avoids false positives)
              setScanState("not_detected");
              setScanFeedback("Belum Memakai Kacamata");
              if (isVoiceEnabled) {
                speakIndonesian("Kacamata belum terdeteksi. Silakan kenakan kacamata dan klik Pindai Ulang.");
              }
            }
            return;
          }
        }

        animationFrameRef.current = requestAnimationFrame(scanLoop);
      };

      animationFrameRef.current = requestAnimationFrame(scanLoop);
    } catch (err) {
      console.warn("Camera access denied or unavailable", err);
      setCameraActive(false);
      setScanState("not_detected");
      setScanFeedback("Kamera tidak tersedia");
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleFinish = (isGlasses: boolean, keepStream = true) => {
    unlockVoiceEngine();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const stream = streamRef.current;
    if (!keepStream && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    // CRITICAL: Detach streamRef before notifying parent so when isOpen flips to false
    // and useEffect triggers stopCamera(), it won't stop the tracks transferred to the companion cam!
    streamRef.current = null;
    setCameraActive(false);
    onProceed(isGlasses, keepStream ? stream : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-2xl border border-black/10 p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.12)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          aria-label="Tutup"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-2xs">
          <Scan className="w-6 h-6 stroke-[1.75]" />
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
          Kalibrasi Sensor Kacamata
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Pindai apakah kamu sedang memakai kacamata untuk kalibrasi modul tes penglihatan.
        </p>

        {/* Viewfinder Frame */}
        <div className="relative w-full aspect-[4/3] max-w-xs rounded-2xl overflow-hidden bg-slate-950 my-5 border border-black/10 flex items-center justify-center shadow-inner">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-white/40 text-center">
              <Camera className="w-8 h-8 mb-2 opacity-60 stroke-[1.5]" />
              <span className="text-xs font-medium">Kamera belum aktif</span>
            </div>
          )}

          {/* Apple Face ID Style Corner Brackets */}
          <div className="absolute inset-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />
          </div>

          {/* Status Overlay */}
          {scanState === "scanning" && (
            <div className="absolute bottom-3 inset-x-3 bg-black/75 backdrop-blur-md py-1.5 px-3 rounded-full text-[11px] font-medium text-white flex items-center justify-center gap-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{scanFeedback}</span>
            </div>
          )}

          {scanState === "detected" && (
            <div className="absolute bottom-3 inset-x-3 bg-isy-green-deep/95 backdrop-blur-md py-1.5 px-3 rounded-full text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Kacamata Terdeteksi</span>
            </div>
          )}

          {scanState === "not_detected" && (
            <div className="absolute bottom-3 inset-x-3 bg-rose-950/85 backdrop-blur-md py-1.5 px-3 rounded-full text-xs font-semibold text-rose-200 flex items-center justify-center gap-1.5 shadow-md">
              <AlertCircle className="w-4 h-4 text-rose-300" />
              <span>Kacamata Belum Terlihat</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full space-y-2.5">
          {scanState === "idle" && (
            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-isy-green-deep text-white text-xs sm:text-sm font-semibold hover:bg-isy-green-bright transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Buka Kamera &amp; Pindai</span>
            </button>
          )}

          {scanState === "scanning" && (
            <button
              type="button"
              disabled
              className="w-full py-3 px-5 rounded-full bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
            >
              Menganalisis Wajah...
            </button>
          )}

          {scanState === "detected" && (
            <button
              type="button"
              onClick={() => handleFinish(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-isy-green-deep text-white text-xs sm:text-sm font-semibold hover:bg-isy-green-bright transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <span>Mulai Kuis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {scanState === "not_detected" && (
            <div className="space-y-2 text-center animate-in fade-in duration-200">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sensor tidak mendeteksi bingkai kacamata. Silakan kenakan kacamata atau lanjut langsung.
              </p>

              <button
                type="button"
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-isy-green-deep text-white text-xs font-semibold hover:bg-isy-green-bright transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pindai Ulang</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="w-full py-2.5 px-3 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Lanjut Tanpa Kacamata
              </button>
            </div>
          )}

          {/* Quick Skip Button (Available in Idle) */}
          {scanState === "idle" && (
            <button
              type="button"
              onClick={() => handleFinish(false)}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Lewati &amp; Mulai Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
