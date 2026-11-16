"use client";

/**
 * TryOnExperience.tsx · Optik I See You
 * Master 2D Virtual Try-On Experience with Live Camera & Photo Upload modes.
 *
 * Key Capabilities:
 * - Dual Mode: Live Camera (continuous face tracking) & Photo Upload (client-side MediaPipe)
 * - Two Featured Real Products: Cateye Pastel & Hexagonal Rose Gold (+ 7 additional real frames)
 * - Transparent 2D overlays with 100% clear lens interior and clean studio extraction
 * - Comprehensive Manual Adjustment: Ukuran (Scale), Posisi (X/Y Offsets), Rotasi (Tilt), and Reset
 * - Independent per-product calibration via lib/tryOnCalibration.ts
 * - Seamless zero-reload frame swapping
 * - Single-click high-resolution photo capture & instant download
 * - Direct WhatsApp stock consultation with branch options
 * - 100% Client-side processing with full privacy preservation
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FaceTracker, { type FaceTrackerHandle } from "@/components/ar/FaceTracker";
import PhotoTryOnCanvas, { type PhotoTryOnHandle } from "./PhotoTryOnCanvas";
import manifestRaw from "@/public/glasses/manifest.json";
import { getFrameCalibration } from "@/lib/tryOnCalibration";
import { trackTryOn, trackPhotoShare } from "@/lib/telemetry";
import { CS_WHATSAPP_NUMBER } from "@/lib/branches";

interface GlassesMeta {
  id: string;
  name: string;
  file: string;
  fitWidthRatio: number;
  ipdScaleRef?: number;
  style: string;
  material?: string;
  recommendedFor: string[];
  color: string;
  lensType?: string;
  isRealPhoto?: boolean;
  excludeFromAiMatch?: boolean;
}

// Strictly include the real product photo frames (+ Tanpa Kacamata)
const tryOnManifest = (manifestRaw as GlassesMeta[]).filter(
  (g) => g.id === "none" || g.isRealPhoto === true
);

export default function TryOnExperience() {
  const searchParams = useSearchParams();
  const isDebugAR = searchParams?.get("debugAR") === "1";

  const faceTrackerRef = useRef<FaceTrackerHandle>(null);
  const photoCanvasRef = useRef<PhotoTryOnHandle>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default to first real photo asset (Cateye Pastel or Hexagonal)
  const initialIndex = useMemo(() => {
    const realIdx = tryOnManifest.findIndex((g) => g.isRealPhoto);
    return realIdx >= 0 ? realIdx : 0;
  }, []);

  // Mode: Live Camera vs. Uploaded Photo
  const [tryOnMode, setTryOnMode] = useState<"camera" | "photo">("camera");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Manual Adjustment States (Size, X/Y Position, Rotation) - Persists across modes
  const [manualScale, setManualScale] = useState<number>(1.0);
  const [manualOffsetX, setManualOffsetX] = useState<number>(0);
  const [manualOffsetY, setManualOffsetY] = useState<number>(0);
  const [manualRotation, setManualRotation] = useState<number>(0);
  const [showAdjustDrawer, setShowAdjustDrawer] = useState<boolean>(false);

  // Camera & Tracking states
  const [beautyMode, setBeautyMode] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeGlasses = tryOnManifest[selectedIndex] || tryOnManifest[0];
  const activeCalibration = useMemo(() => getFrameCalibration(activeGlasses.id), [activeGlasses.id]);

  // Combined scale factor: manifest base × calibration multiplier × manual scale
  const effectiveFitWidthRatio = (activeGlasses.fitWidthRatio || 1.45) * activeCalibration.scaleMultiplier;

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Filter categories
  const categories = useMemo(() => {
    const realCount = tryOnManifest.filter((g) => g.isRealPhoto).length;
    return [
      { id: "all", label: `Semua (${realCount})` },
      { id: "Cat-Eye", label: "Cat-Eye" },
      { id: "Hexagonal", label: "Hexagonal" },
      { id: "Square", label: "Kotak" },
      { id: "Oval", label: "Oval" },
      { id: "Sunglasses", label: "Sunglasses" },
    ];
  }, []);

  const filteredGlasses = useMemo(() => {
    return tryOnManifest.filter((g) => {
      if (g.id === "none") return true;
      if (selectedCategory === "all") return true;
      if (selectedCategory === "Cat-Eye") return g.style?.toLowerCase().includes("cat-eye");
      if (selectedCategory === "Hexagonal") return g.style?.toLowerCase().includes("hexagonal");
      if (selectedCategory === "Sunglasses") return g.style === "Sunglasses" || g.style === "Aviator";
      if (selectedCategory === "Square") return g.style === "Square" || g.style === "Semi-Square" || g.style === "Browline";
      return g.style === selectedCategory;
    });
  }, [selectedCategory]);

  // Select frame
  const handleSelectGlasses = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      const chosen = tryOnManifest[index];
      if (chosen && chosen.id !== "none") {
        trackTryOn(chosen.id, chosen.name);
      }
    },
    []
  );

  // Reset all manual fitting adjustments
  const handleResetFitting = useCallback(() => {
    setManualScale(1.0);
    setManualOffsetX(0);
    setManualOffsetY(0);
    setManualRotation(0);
    showToast("Fitting dikembalikan ke posisi awal (Reset)");
  }, [showToast]);

  // Handle Photo Upload
  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        showToast("Format file tidak didukung. Harap pilih foto JPG, PNG, atau WebP.");
        return;
      }

      // Check file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        showToast("Ukuran file terlalu besar. Maksimum 15MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
      setTryOnMode("photo");
      showToast("Foto dimuat! Sistem sedang mendeteksi wajah...");
      e.target.value = "";
    },
    [showToast]
  );

  // Switch camera facing mode
  const handleToggleCamera = useCallback(() => {
    setCameraFacing((prev) => {
      const next = prev === "user" ? "environment" : "user";
      showToast(next === "user" ? "Kamera Depan Aktif" : "Kamera Belakang Aktif");
      return next;
    });
  }, [showToast]);

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      cameraContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Single photo capture in either Camera or Photo mode
  const handleCapture = useCallback(() => {
    setIsCapturing(true);

    setTimeout(() => {
      let dataUrl: string | null = null;
      if (tryOnMode === "camera") {
        dataUrl = faceTrackerRef.current?.captureFrame() ?? null;
      } else {
        dataUrl = photoCanvasRef.current?.captureComposite() ?? null;
      }

      setIsCapturing(false);
      if (dataUrl) {
        setCapturedPhoto(dataUrl);
        showToast("Foto try-on berhasil diambil!");
      } else {
        showToast(
          tryOnMode === "camera"
            ? "Gagal mengambil foto. Pastikan izin kamera aktif dan wajah terdeteksi."
            : "Gagal menyimpan foto. Pastikan foto telah dimuat dengan benar."
        );
      }
    }, 150);
  }, [tryOnMode, showToast]);

  // Direct download captured photo
  const handleDownloadPhoto = useCallback(() => {
    if (!capturedPhoto) return;
    const link = document.createElement("a");
    link.download = `isy-tryon-${activeGlasses.id}-${Date.now()}.jpg`;
    link.href = capturedPhoto;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackPhotoShare(activeGlasses.id);
    showToast("Foto tersimpan di galeri/perangkat Anda!");
  }, [capturedPhoto, activeGlasses, showToast]);

  // WhatsApp consultation
  const whatsappUrl = useMemo(() => {
    const frameName = activeGlasses.name;
    const msg = `Halo Optik I See You, saya baru saja mencoba frame *"${frameName}"* di Virtual Try-On website. Apakah model ini ready stock di toko cabang Purwokerto / Purbalingga / Wonosobo / Cilacap? Terima kasih!`;
    return `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [activeGlasses]);

  const handleOpenWhatsApp = useCallback(() => {
    trackPhotoShare(activeGlasses.id);
  }, [activeGlasses]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-isy-ink flex flex-col font-sans selection:bg-isy-green-bright selection:text-white">
      {/* Hidden File Input for Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
          <div className="rounded-full bg-isy-green-deep/95 text-white px-5 py-2.5 text-xs font-bold shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-isy-green-bright animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ══ HEADER BAR ═══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-isy-line px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-isy-ink/60 hover:text-isy-green-deep transition-colors py-1 px-2.5 rounded-full border border-isy-line/80 bg-isy-mist/50 hover:bg-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Kembali</span>
          </Link>
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Optik I See You" width={110} height={38} priority className="h-6 sm:h-7 w-auto object-contain" />
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-isy-green-bright/10 text-isy-green-deep border border-isy-green-bright/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
            Virtual Try-On 2D
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quiz"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-isy-green-deep hover:text-isy-green-bright py-1.5 px-3 rounded-full border border-isy-line bg-white transition-all shadow-xs"
          >
            <span>🎯 Quiz Wajah</span>
          </Link>
          <Link
            href="/photobooth"
            className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-isy-green-deep hover:bg-isy-green-bright py-1.5 px-3.5 rounded-full shadow-md transition-all active:scale-95"
          >
            <span>📸 Photobooth 4-Grid</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ══ MAIN BODY (SPLIT VIEW ON DESKTOP, STACK ON MOBILE) ════════════ */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6">
        {/* ── LEFT: CAMERA / PHOTO TRY-ON VIEWPORT ───────────────────────── */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex p-1 bg-white border border-isy-line rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => setTryOnMode("camera")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tryOnMode === "camera"
                    ? "bg-isy-green-deep text-white shadow-xs"
                    : "text-isy-ink/60 hover:text-isy-green-deep"
                }`}
              >
                <span>📹</span>
                <span>Aktifkan Kamera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!uploadedPhotoUrl) {
                    fileInputRef.current?.click();
                  } else {
                    setTryOnMode("photo");
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tryOnMode === "photo"
                    ? "bg-isy-green-deep text-white shadow-xs"
                    : "text-isy-ink/60 hover:text-isy-green-deep"
                }`}
              >
                <span>📁</span>
                <span>Upload Foto</span>
              </button>
            </div>

            {/* Re-pick photo button if already in photo mode */}
            {tryOnMode === "photo" && uploadedPhotoUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-isy-green-deep hover:text-isy-green-bright bg-white border border-isy-line px-3 py-1.5 rounded-xl transition-all shadow-xs"
              >
                Ganti Foto ↺
              </button>
            )}
          </div>

          {/* Viewport Frame */}
          <div
            ref={cameraContainerRef}
            className="relative w-full aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/11] bg-black rounded-3xl overflow-hidden shadow-2xl border border-isy-line/80 flex items-center justify-center group"
          >
            {/* Shutter flash effect */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
            )}

            {/* Mode 1: Live Camera Mode */}
            {tryOnMode === "camera" && (
              <FaceTracker
                ref={faceTrackerRef}
                glassesSrc={activeGlasses.file ? `/glasses/${activeGlasses.file}?v=5` : ""}
                fitWidthRatio={effectiveFitWidthRatio}
                ipdScaleRef={((activeGlasses as any).ipdScaleRef ?? 1.0) * manualScale}
                manualOffsetX={manualOffsetX}
                manualOffsetY={manualOffsetY}
                manualScale={manualScale}
                manualRotation={manualRotation}
                numFaces={1}
                beautyMode={beautyMode}
                facingMode={cameraFacing}
                renderMode="2d"
                scanIntro={false}
                showFaceGuide={false}
                trackingEnabled={true}
                onFaceCountChange={(count) => setFaceDetected(count > 0)}
                className="w-full h-full object-cover"
              />
            )}

            {/* Mode 2: Photo Upload Mode */}
            {tryOnMode === "photo" && (
              uploadedPhotoUrl ? (
                <PhotoTryOnCanvas
                  ref={photoCanvasRef}
                  imageSrc={uploadedPhotoUrl}
                  glassesSrc={activeGlasses.file ? `/glasses/${activeGlasses.file}?v=5` : ""}
                  fitWidthRatio={effectiveFitWidthRatio}
                  manualScale={manualScale}
                  manualOffsetX={manualOffsetX}
                  manualOffsetY={manualOffsetY}
                  manualRotation={manualRotation}
                  onFaceDetected={(detected) => setFaceDetected(detected)}
                  onError={(err) => showToast(err)}
                  className="w-full h-full"
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center text-white/80 p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    📁
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Pilih Foto untuk Dicoba</h3>
                  <p className="text-xs text-white/60 max-w-sm mb-4">
                    Gunakan foto wajah tampak depan dengan pencahayaan jelas (format JPG, PNG, atau WebP).
                  </p>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-full bg-isy-green-bright text-white text-xs font-black shadow-lg hover:bg-white hover:text-isy-green-deep transition-all active:scale-95"
                  >
                    Buka Galeri / Pilih Berkas
                  </button>
                </div>
              )
            )}

            {/* Top Bar Floating Controls */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
              {/* Face Status Pill */}
              <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-md border border-white/10">
                <span
                  className={`h-2 w-2 rounded-full ${
                    faceDetected ? "bg-isy-green-bright animate-ping" : "bg-amber-400"
                  }`}
                />
                <span>
                  {faceDetected
                    ? "Wajah Terdeteksi"
                    : tryOnMode === "camera"
                    ? "Arahkan Wajah ke Kamera"
                    : "Menunggu Wajah pada Foto"}
                </span>
              </div>

              {/* Utility buttons */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                {tryOnMode === "camera" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setBeautyMode((prev) => !prev)}
                      title="Filter AI Halus"
                      className={`h-8 px-2.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all active:scale-95 flex items-center gap-1 ${
                        beautyMode
                          ? "bg-isy-green-bright/90 text-white border-white/40 shadow-sm"
                          : "bg-black/50 text-white/80 border-white/15 hover:bg-black/70"
                      }`}
                    >
                      <span>✨</span>
                      <span className="hidden sm:inline">AI Halus</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      title="Ganti Kamera Depan / Belakang"
                      className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  title="Layar Penuh"
                  className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  {isFullscreen ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Floating Bar on Viewport: Fitting Controls & Shutter */}
            <div className="absolute bottom-3 inset-x-3 z-30 flex flex-col items-center gap-2 pointer-events-none">
              {/* Manual Adjustment Floating Toolbar */}
              <div className="pointer-events-auto flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-white shadow-xl max-w-full overflow-x-auto scrollbar-none">
                {/* Scale buttons */}
                <div className="flex items-center gap-1 pr-1 border-r border-white/20">
                  <span className="text-[10px] font-bold text-white/70 hidden sm:inline">Ukuran:</span>
                  <button
                    type="button"
                    onClick={() => setManualScale((prev) => Math.max(0.7, parseFloat((prev - 0.05).toFixed(2))))}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-black transition-all active:scale-90"
                    title="Kecilkan Frame"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-isy-green-bright min-w-[34px] text-center">
                    {Math.round(manualScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setManualScale((prev) => Math.min(1.4, parseFloat((prev + 0.05).toFixed(2))))}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-black transition-all active:scale-90"
                    title="Besarkan Frame"
                  >
                    +
                  </button>
                </div>

                {/* Position Adjuster Toggle / Mini buttons */}
                <div className="flex items-center gap-1 px-1">
                  <button
                    type="button"
                    onClick={() => setManualOffsetY((prev) => prev + 4)}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
                    title="Geser Atas"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOffsetY((prev) => prev - 4)}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
                    title="Geser Bawah"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOffsetX((prev) => prev - 4)}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
                    title="Geser Kiri"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOffsetX((prev) => prev + 4)}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
                    title="Geser Kanan"
                  >
                    →
                  </button>
                </div>

                {/* Rotation buttons */}
                <div className="flex items-center gap-1 pl-1 border-l border-white/20">
                  <button
                    type="button"
                    onClick={() => setManualRotation((prev) => prev - 0.03)}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[10px] font-bold transition-all active:scale-90"
                    title="Putar Kiri"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualRotation((prev) => prev + 0.03)}
                    className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[10px] font-bold transition-all active:scale-90"
                    title="Putar Kanan"
                  >
                    ↻
                  </button>
                </div>

                {/* Reset button */}
                {(manualScale !== 1.0 || manualOffsetX !== 0 || manualOffsetY !== 0 || manualRotation !== 0) && (
                  <button
                    type="button"
                    onClick={handleResetFitting}
                    className="text-[10px] font-extrabold text-amber-300 hover:text-white underline ml-1 pl-1 border-l border-white/20"
                    title="Kembalikan ke posisi awal"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Main Shutter Button */}
              <div className="pointer-events-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCapture}
                  className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-isy-green-bright to-emerald-600 hover:from-isy-green-deep hover:to-isy-green-bright px-6 py-3 text-sm font-black text-white shadow-[0_4px_20px_rgba(47,168,79,0.5)] active:scale-95 transition-all cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Ambil Foto Try-On</span>
                </button>
              </div>
            </div>

            {/* Debug AR info */}
            {isDebugAR && (
              <div className="absolute top-14 left-3 z-40 bg-black/85 text-[10px] text-emerald-300 font-mono p-2 rounded-lg border border-emerald-500/30">
                <p>DEBUG AR MODE</p>
                <p>Frame: {activeGlasses.id}</p>
                <p>Scale: {manualScale.toFixed(2)}x</p>
                <p>Offset: ({manualOffsetX}, {manualOffsetY})</p>
                <p>Rot: {manualRotation.toFixed(2)} rad</p>
              </div>
            )}
          </div>

          {/* Subtitle notice below camera */}
          <div className="mt-2 text-center text-[11px] text-isy-ink/50 flex items-center justify-center gap-1.5">
            <span>💡</span>
            <span>Sesuaikan ukuran (-/+) dan posisi panah (↑↓←→) jika ingin menyesuaikan kacamata secara manual.</span>
          </div>
        </section>

        {/* ── RIGHT: PRODUCT CAROUSEL & FRAME DETAILS ───────────────────── */}
        <section className="lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-4">
          {/* Active Product Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-isy-line shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-isy-green-bright bg-isy-green-bright/10 px-2 py-0.5 rounded-full">
                    {activeGlasses.style || "Frame Kacamata"}
                  </span>
                  {activeGlasses.isRealPhoto && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-white bg-isy-green-deep px-2 py-0.5 rounded-full shadow-2xs">
                      Foto Asli Real
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-isy-ink leading-snug">{activeGlasses.name}</h2>
                {activeGlasses.material && (
                  <p className="text-[11px] font-medium text-isy-ink/60 mt-0.5">
                    Material: <span className="font-bold text-isy-ink/80">{activeGlasses.material}</span>
                  </p>
                )}
              </div>
              <div
                className="h-6 w-6 rounded-full border border-black/15 shrink-0 shadow-xs"
                style={{ backgroundColor: activeGlasses.color || "#1B4D3E" }}
                title={`Warna: ${activeGlasses.color}`}
              />
            </div>

            {/* Face Shape Recommendations */}
            {activeGlasses.recommendedFor && activeGlasses.recommendedFor.length > 0 && (
              <div className="mt-3 pt-3 border-t border-isy-line/60">
                <p className="text-[11px] font-semibold text-isy-ink/60 mb-1.5">Cocok untuk bentuk wajah:</p>
                <div className="flex flex-wrap gap-1">
                  {activeGlasses.recommendedFor.map((shape) => (
                    <span
                      key={shape}
                      className="text-[10px] font-bold text-isy-ink/80 bg-isy-mist px-2 py-0.5 rounded-md border border-isy-line"
                    >
                      {shape}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions for active frame */}
            <div className="mt-4 flex gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-isy-mist hover:bg-isy-green-bright hover:text-white border border-isy-line text-isy-green-deep text-xs font-black py-2.5 transition-all shadow-xs active:scale-95"
              >
                <span>💬 Tanya Stok via WA</span>
              </a>
              <Link
                href={`/katalog?frame=${encodeURIComponent(activeGlasses.id)}`}
                className="inline-flex items-center justify-center px-3 rounded-xl border border-isy-line text-isy-ink/70 hover:text-isy-green-deep hover:bg-isy-mist text-xs font-bold py-2.5 transition-all"
                title="Lihat Detail di Katalog"
              >
                Katalog →
              </Link>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-isy-green-deep text-white shadow-xs"
                    : "bg-white text-isy-ink/60 border border-isy-line hover:border-isy-green-bright hover:text-isy-green-deep"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid / Scroll Area */}
          <div className="flex-1 max-h-[380px] lg:max-h-[460px] overflow-y-auto space-y-2 pr-1">
            {filteredGlasses.map((g) => {
              const isSelected = activeGlasses.id === g.id;
              const globalIndex = tryOnManifest.findIndex((m) => m.id === g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectGlasses(globalIndex)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? "bg-isy-green-bright/10 border-isy-green-bright ring-2 ring-isy-green-bright/30 shadow-md"
                      : "bg-white border-isy-line hover:border-isy-green-bright/40 hover:bg-isy-mist/50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-14 w-20 bg-isy-mist rounded-xl overflow-hidden border border-isy-line flex items-center justify-center p-1 shrink-0">
                    {g.file ? (
                      <Image
                        src={`/glasses/${g.file}?v=5`}
                        alt={g.name}
                        width={80}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-isy-ink/40">Polos</span>
                    )}
                    {g.isRealPhoto && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black uppercase bg-isy-green-deep text-white px-1 rounded">
                        Real
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-isy-green-bright">
                        {g.style}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-black uppercase text-isy-green-deep bg-isy-green-bright/20 px-1.5 py-0.2 rounded-full">
                          Dipakai
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-isy-ink truncate">{g.name}</h3>
                    <p className="text-[11px] text-isy-ink/50 truncate">
                      {g.material ? `${g.material} • ` : ""}
                      {g.recommendedFor?.length ? `Cocok: ${g.recommendedFor.slice(0, 2).join(", ")}` : "Universal fit"}
                    </p>
                  </div>

                  {/* Radio circle */}
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-isy-green-bright bg-isy-green-bright text-white"
                        : "border-isy-line bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cross Promotion Callout */}
          <div className="bg-gradient-to-br from-isy-green-deep to-emerald-950 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-isy-green-bright uppercase tracking-wider">Coba Photobooth</p>
              <p className="text-xs text-white/80 mt-0.5">Cetak photo strip 4-grid dengan template estetik!</p>
            </div>
            <Link
              href="/photobooth"
              className="shrink-0 bg-isy-green-bright hover:bg-white hover:text-isy-green-deep text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm"
            >
              Buka →
            </Link>
          </div>
        </section>
      </main>

      {/* ══ CAPTURED PHOTO PREVIEW MODAL ══════════════════════════════════ */}
      {capturedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-isy-line flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-isy-line">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-isy-green-bright">Hasil Try-On Kamu</p>
                <h3 className="text-base font-black text-isy-ink">{activeGlasses.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="h-8 w-8 rounded-full bg-isy-mist hover:bg-isy-line text-isy-ink/70 flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-2 min-h-[320px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedPhoto}
                alt="Hasil Virtual Try-On"
                className="max-h-[50vh] w-auto rounded-2xl object-contain shadow-lg"
              />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                Frame: {activeGlasses.name}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#FDFBF7] border-t border-isy-line flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPhoto}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-deep hover:bg-isy-green-bright text-white py-3 text-xs font-black shadow-md transition-all active:scale-95"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <span>Simpan Foto (HD)</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black shadow-md transition-all active:scale-95"
                >
                  <span>💬 Tanya Stok WA</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="w-full py-2 text-xs font-bold text-isy-ink/60 hover:text-isy-green-deep text-center transition-colors"
              >
                ← Coba Frame Lain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
