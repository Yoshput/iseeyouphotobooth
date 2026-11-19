"use client";

/**
 * TryOnExperience.tsx · Optik I See You
 * Professional 2D Virtual Try-On optical retail interface.
 *
 * Design Guidelines:
 * - Premium optical boutique aesthetic with natural brand palette (#104D37, #FAFAF8, #18251F, #E5E9E4)
 * - Typography: Semibold (600) headings/product names, Medium (500) actions, Regular (400) body
 * - Consistent Lucide icons throughout (Zero decorative emojis)
 * - Dual Mode: Live Camera & Client-Side Photo Upload (MediaPipe FaceLandmarker)
 * - Compact, professional adjustment toolbar (Size, Position, Rotation, Reset)
 * - High-resolution single-capture modal with instant HD download and WhatsApp stock inquiry
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Upload,
  MessageCircle,
  Sparkles,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  SlidersHorizontal,
  ScanFace,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  RefreshCw,
  Download,
  X,
  Compass,
  LayoutGrid,
  Box,
  Layers,
  Scale,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import FaceTracker, { type FaceTrackerHandle } from "@/components/ar/FaceTracker";
import PhotoTryOnCanvas, { type PhotoTryOnHandle } from "./PhotoTryOnCanvas";
import manifestRaw from "@/public/glasses/manifest.json";
import { getFrameCalibration } from "@/lib/tryOnCalibration";
import {
  detectFaceShape,
  calculateFrameMatch,
  FaceShapeStabilizer,
  type FaceShape,
  type FaceShapeResult,
  type FrameMatchDetail,
  SHAPE_META,
} from "@/lib/faceShape";
import { trackTryOn, trackPhotoShare } from "@/lib/telemetry";
import { BRANCHES, CS_WHATSAPP_NUMBER, type Branch } from "@/lib/branches";

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

interface Model3DMeta {
  glbFile: string;
  fitWidthRatio: number;
  name: string;
  style?: string;
}

// Verified 3D GLB mapping on Cloudflare R2 for Hybrid 2D/3D Try-On
const FRAME_3D_MAP: Record<string, Model3DMeta> = {
  "clubmaster-real": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/glasses1/glasses01.glb",
    fitWidthRatio: 3.32,
    name: "Clubmaster 3D",
    style: "Browline",
  },
  "cateye-pastel": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/sunglasses_v2.glb",
    fitWidthRatio: 2.8,
    name: "Cat-Eye 3D",
    style: "Cat-Eye",
  },
  "cateye-lebar-real": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/sunglasses_v2.glb",
    fitWidthRatio: 2.8,
    name: "Cat-Eye 3D",
    style: "Cat-Eye",
  },
  "square-plastik-real": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/glasses_kotak_frame_coklat.glb",
    fitWidthRatio: 2.8,
    name: "Kotak 3D",
    style: "Square",
  },
  "oval-kecil-real": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/metal_round_glasses.glb",
    fitWidthRatio: 2.8,
    name: "Oval Metal 3D",
    style: "Oval",
  },
  "hexagonal-rose-gold": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/glasses_transparan.glb",
    fitWidthRatio: 2.8,
    name: "Hexagonal 3D",
    style: "Hexagonal",
  },
  "aviator-real": {
    glbFile: "https://pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev/static/models3D/cyberpunk_johnny_silverhand_glasses.glb",
    fitWidthRatio: 2.8,
    name: "Aviator 3D",
    style: "Aviator",
  },
};

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

  // Default to first real photo asset
  const initialIndex = useMemo(() => {
    const realIdx = tryOnManifest.findIndex((g) => g.isRealPhoto);
    return realIdx >= 0 ? realIdx : 0;
  }, []);

  // Mode: Live Camera vs. Uploaded Photo
  const [tryOnMode, setTryOnMode] = useState<"camera" | "photo">("camera");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Manual Adjustment States (Size, X/Y Position, Rotation)
  const [manualScale, setManualScale] = useState<number>(1.0);
  const [manualOffsetX, setManualOffsetX] = useState<number>(0);
  const [manualOffsetY, setManualOffsetY] = useState<number>(0);
  const [manualRotation, setManualRotation] = useState<number>(0);

  // Camera & Tracking states
  const [beautyMode, setBeautyMode] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hybrid 2D / 3D Virtual Try-On
  const [renderMode, setRenderMode] = useState<"2d" | "3d">("2d");

  // Frame Comparison State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareTargetIndex, setCompareTargetIndex] = useState<number>(() => {
    const nextIdx = (initialIndex + 1) % tryOnManifest.length;
    return nextIdx;
  });

  // Selected Branch for WhatsApp Consultation
  const [selectedBranchId, setSelectedBranchId] = useState<string>("purwokerto");
  const selectedBranch = useMemo(
    () => BRANCHES.find((b) => b.id === selectedBranchId) || BRANCHES[0],
    [selectedBranchId]
  );

  const activeGlasses = tryOnManifest[selectedIndex] || tryOnManifest[0];
  const activeCalibration = useMemo(() => getFrameCalibration(activeGlasses.id), [activeGlasses.id]);
  const active3DMeta = FRAME_3D_MAP[activeGlasses.id];
  const has3DSupport = Boolean(active3DMeta);

  // Combined scale factor & fine-tuned offsets
  const effectiveFitWidthRatio = (activeGlasses.fitWidthRatio || 1.45) * activeCalibration.scaleMultiplier;
  const effectiveOffsetX = manualOffsetX + (activeCalibration.offsetX || 0);
  const effectiveOffsetY = manualOffsetY + (activeCalibration.offsetY || 0);

  // Face Shape Detection & Recommendations
  const [detectedFaceShape, setDetectedFaceShape] = useState<FaceShape | null>(null);
  const [manualFaceShape, setManualFaceShape] = useState<FaceShape | null>(null);
  const [faceShapeResult, setFaceShapeResult] = useState<FaceShapeResult | null>(null);
  const stabilizerRef = useRef(new FaceShapeStabilizer(14));
  const hasAutoNotifiedRef = useRef<boolean>(false);

  // Active shape is user's manual choice or AI detected shape
  const activeFaceShape: FaceShape | null = manualFaceShape || detectedFaceShape;

  // Active frame AI compatibility score & reasons
  const activeMatch = useMemo<FrameMatchDetail | null>(() => {
    if (!activeFaceShape || activeGlasses.id === "none") return null;
    return calculateFrameMatch(activeFaceShape, activeGlasses);
  }, [activeFaceShape, activeGlasses]);

  // Comparison target frame & score
  const compareTargetGlasses = tryOnManifest[compareTargetIndex] || tryOnManifest[0];
  const compareMatch = useMemo<FrameMatchDetail | null>(() => {
    if (!activeFaceShape || compareTargetGlasses.id === "none") return null;
    return calculateFrameMatch(activeFaceShape, compareTargetGlasses);
  }, [activeFaceShape, compareTargetGlasses]);

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Live camera landmarks handler with temporal stabilizer
  const handleLiveLandmarks = useCallback(
    (lm: Array<{ x: number; y: number; z: number }> | null) => {
      if (!lm || lm.length < 468) return;
      const res = detectFaceShape(lm);
      const stableShape = stabilizerRef.current.push(res.shape);

      setDetectedFaceShape((prev) => {
        if (prev !== stableShape) {
          setFaceShapeResult({ ...res, shape: stableShape });
          if (!hasAutoNotifiedRef.current) {
            hasAutoNotifiedRef.current = true;
            showToast(`Wajah terdeteksi: ${stableShape} (Rekomendasi aktif)`);
          }
          return stableShape;
        }
        return prev;
      });
    },
    [showToast]
  );

  // Photo upload landmarks handler
  const handlePhotoLandmarks = useCallback(
    (lm: NormalizedLandmark[]) => {
      if (!lm || lm.length < 468) return;
      const res = detectFaceShape(lm);
      setDetectedFaceShape(res.shape);
      setFaceShapeResult(res);
      showToast(`Wajah terdeteksi: ${res.shape}`);
    },
    [showToast]
  );

  // Apply recommendation action
  const handleApplyRecommendation = useCallback(
    (targetShape?: FaceShape) => {
      const shapeToUse = targetShape || activeFaceShape || "Diamond";
      const meta = SHAPE_META[shapeToUse];
      if (!meta) return;

      const topId = meta.glasses;
      const foundIdx = tryOnManifest.findIndex((g) => g.id === topId);
      if (foundIdx >= 0) {
        setSelectedIndex(foundIdx);
        const chosen = tryOnManifest[foundIdx];
        if (chosen) trackTryOn(chosen.id, chosen.name);
      } else {
        const fallbackIdx = tryOnManifest.findIndex(
          (g) => g.recommendedFor && g.recommendedFor.includes(shapeToUse)
        );
        if (fallbackIdx >= 0) setSelectedIndex(fallbackIdx);
      }

      setSelectedCategory("recommended");
      showToast(`Rekomendasi Wajah ${shapeToUse} diterapkan!`);
    },
    [activeFaceShape, showToast]
  );

  // Filter categories
  const categories = useMemo(() => {
    const realCount = tryOnManifest.filter((g) => g.isRealPhoto).length;
    const baseCats: Array<{ id: string; label: string }> = [
      { id: "all", label: `Semua (${realCount})` },
    ];
    if (activeFaceShape) {
      const matchCount = tryOnManifest.filter(
        (g) => g.isRealPhoto && g.recommendedFor && g.recommendedFor.includes(activeFaceShape)
      ).length;
      baseCats.push({
        id: "recommended",
        label: `★ Rekomendasi (${activeFaceShape} - ${matchCount})`,
      });
    }
    return [
      ...baseCats,
      { id: "Cat-Eye", label: "Cat-Eye" },
      { id: "Hexagonal", label: "Hexagonal" },
      { id: "Square", label: "Kotak" },
      { id: "Oval", label: "Oval" },
      { id: "Sunglasses", label: "Sunglasses" },
    ];
  }, [activeFaceShape]);

  const filteredGlasses = useMemo(() => {
    return tryOnManifest.filter((g) => {
      if (g.id === "none") return true;
      if (selectedCategory === "all") return true;
      if (selectedCategory === "recommended") {
        if (!activeFaceShape) return true;
        return g.recommendedFor && g.recommendedFor.includes(activeFaceShape);
      }
      if (selectedCategory === "Cat-Eye") return g.style?.toLowerCase().includes("cat-eye");
      if (selectedCategory === "Hexagonal") return g.style?.toLowerCase().includes("hexagonal");
      if (selectedCategory === "Sunglasses") return g.style === "Sunglasses" || g.style === "Aviator";
      if (selectedCategory === "Square") return g.style === "Square" || g.style === "Semi-Square" || g.style === "Browline";
      return g.style === selectedCategory;
    });
  }, [selectedCategory, activeFaceShape]);

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
    showToast("Fitting dikembalikan ke posisi otomatis");
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

      if (file.size > 15 * 1024 * 1024) {
        showToast("Ukuran file terlalu besar. Maksimum 15MB.");
        return;
      }

      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
      setTryOnMode("photo");
      showToast("Foto berhasil dimuat. Memproses deteksi wajah...");
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

  // Single photo capture
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
        showToast("Foto try-on berhasil diambil");
      } else {
        showToast(
          tryOnMode === "camera"
            ? "Gagal mengambil foto. Pastikan kamera aktif dan wajah terdeteksi."
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
    showToast("Foto tersimpan di perangkat Anda");
  }, [capturedPhoto, activeGlasses, showToast]);

  // Branch-specific WhatsApp consultation link with authentic routing
  const whatsappUrl = useMemo(() => {
    const frameName = activeGlasses.name;
    const branchName = selectedBranch.name;
    const shapeNote = activeFaceShape ? ` (Rekomendasi Wajah: ${activeFaceShape})` : "";
    const msg = `Halo ${branchName}, saya baru saja mencoba frame "${frameName}"${shapeNote} di Virtual Try-On website Optik I See You. Apakah model ini tersedia di cabang ${selectedBranch.city}? Terima kasih.`;
    const targetPhone = selectedBranch.waNumber || CS_WHATSAPP_NUMBER;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
  }, [activeGlasses, selectedBranch, activeFaceShape]);

  const handleOpenWhatsApp = useCallback(() => {
    trackPhotoShare(activeGlasses.id);
  }, [activeGlasses]);

  const hasAdjustments = manualScale !== 1.0 || manualOffsetX !== 0 || manualOffsetY !== 0 || manualRotation !== 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18251F] flex flex-col font-sans selection:bg-[#104D37] selection:text-white">
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <div className="rounded-xl bg-[#18251F]/90 text-white px-4 py-2 text-xs font-medium shadow-lg border border-white/10 backdrop-blur-md flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16835B]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ══ HEADER BAR ═══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E9E4] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-[#68756D] hover:text-[#104D37] transition-colors py-1.5 px-3 rounded-lg border border-[#E5E9E4] bg-[#F7F8F5] hover:bg-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={105}
              height={36}
              priority
              className="h-6 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-[#104D37] bg-[#104D37]/5 border border-[#104D37]/15 rounded-md px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16835B]" />
            <span>Virtual Try-On 2D</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quiz"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#18251F] hover:text-[#104D37] py-1.5 px-3 rounded-lg border border-[#E5E9E4] bg-white transition-all hover:bg-[#F7F8F5] shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-[#68756D]" />
            <span>Quiz Bentuk Wajah</span>
          </Link>
          <Link
            href="/photobooth"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#104D37] hover:bg-[#0B3B2A] py-1.5 px-3.5 rounded-lg shadow-xs transition-all active:scale-95"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Photobooth 4-Grid</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </header>

      {/* ══ MAIN BODY (SPLIT VIEW ON DESKTOP, STACK ON MOBILE) ════════════ */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6 min-w-0 overflow-x-hidden">
        {/* ── LEFT: CAMERA / PHOTO TRY-ON VIEWPORT ───────────────────────── */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <div className="inline-flex p-1 bg-[#F7F8F5] border border-[#E5E9E4] rounded-xl">
              <button
                type="button"
                onClick={() => setTryOnMode("camera")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tryOnMode === "camera"
                    ? "bg-white text-[#104D37] shadow-xs border border-[#E5E9E4]"
                    : "text-[#68756D] hover:text-[#18251F]"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera Langsung</span>
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tryOnMode === "photo"
                    ? "bg-white text-[#104D37] shadow-xs border border-[#E5E9E4]"
                    : "text-[#68756D] hover:text-[#18251F]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Foto</span>
              </button>
            </div>

            {/* Hybrid 2D / 3D Dimension Toggle (When in Camera mode and frame has 3D asset) */}
            {tryOnMode === "camera" && (
              <div className="inline-flex p-1 bg-[#F7F8F5] border border-[#E5E9E4] rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setRenderMode("2d")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    renderMode === "2d"
                      ? "bg-white text-[#104D37] shadow-xs border border-[#E5E9E4] font-bold"
                      : "text-[#68756D] hover:text-[#18251F]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2D Real</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!has3DSupport) {
                      showToast(`Model 3D interaktif sedang disiapkan untuk ${activeGlasses.name}. Menampilkan simulasi 3D AR.`);
                    }
                    setRenderMode("3d");
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    renderMode === "3d"
                      ? "bg-[#104D37] text-white shadow-xs font-bold"
                      : "text-[#68756D] hover:text-[#18251F]"
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D AR</span>
                  {has3DSupport && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 ml-0.5 animate-pulse" />
                  )}
                </button>
              </div>
            )}

            {/* Re-pick photo button if in photo mode */}
            {tryOnMode === "photo" && uploadedPhotoUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-[#104D37] hover:text-[#0B3B2A] bg-white border border-[#E5E9E4] px-3 py-1.5 rounded-lg transition-all hover:bg-[#F7F8F5] shadow-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ganti Foto</span>
              </button>
            )}
          </div>

          {/* Viewport Frame */}
          <div
            ref={cameraContainerRef}
            className="relative w-full aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/11] bg-[#18251F] rounded-2xl overflow-hidden shadow-md border border-[#E5E9E4] flex items-center justify-center group"
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
                fitWidthRatio={
                  renderMode === "3d" && active3DMeta
                    ? active3DMeta.fitWidthRatio
                    : effectiveFitWidthRatio
                }
                ipdScaleRef={(activeGlasses as any).ipdScaleRef ?? 1.0}
                manualOffsetX={effectiveOffsetX}
                manualOffsetY={effectiveOffsetY}
                manualScale={manualScale}
                manualRotation={manualRotation}
                numFaces={1}
                beautyMode={beautyMode}
                facingMode={cameraFacing}
                renderMode={renderMode === "3d" && active3DMeta ? "3d" : "2d"}
                model3DSrc={renderMode === "3d" && active3DMeta ? active3DMeta.glbFile : undefined}
                scanIntro={false}
                showFaceGuide={false}
                trackingEnabled={true}
                onFaceCountChange={(count) => setFaceDetected(count > 0)}
                onLandmarksChange={handleLiveLandmarks}
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
                  manualOffsetX={effectiveOffsetX}
                  manualOffsetY={effectiveOffsetY}
                  manualRotation={manualRotation}
                  onFaceDetected={(detected) => setFaceDetected(detected)}
                  onLandmarksDetected={handlePhotoLandmarks}
                  onError={(err) => showToast(err)}
                  className="w-full h-full"
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center text-white/80 p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white/70 mb-3 shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">Pilih Foto Wajah untuk Dicoba</h3>
                  <p className="text-xs text-white/60 max-w-sm mb-4">
                    Gunakan foto wajah tampak depan dengan pencahayaan memadai (format JPG, PNG, atau WebP).
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#104D37] text-xs font-medium shadow-sm hover:bg-[#F7F8F5] transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas Foto</span>
                  </button>
                </div>
              )
            )}

            {/* Top Bar Floating Status & Utility Controls */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
              {/* Face Status Pill */}
              <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-[#18251F]/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white/90 border border-white/10 shadow-xs">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    faceDetected ? "bg-[#16835B]" : "bg-amber-400"
                  }`}
                />
                <ScanFace className="w-3 h-3 text-white/60" />
                <span>
                  {faceDetected
                    ? "Wajah Terdeteksi"
                    : tryOnMode === "camera"
                    ? "Posisikan Wajah di Depan Kamera"
                    : "Wajah Belum Terdeteksi"}
                </span>
              </div>

              {/* Utility buttons */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                {tryOnMode === "camera" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setBeautyMode((prev) => !prev)}
                      title="Penghalus Kulit Halus"
                      className={`h-7 px-2 rounded-lg text-xs font-medium backdrop-blur-md border transition-all flex items-center gap-1 ${
                        beautyMode
                          ? "bg-[#104D37]/90 text-white border-white/20 shadow-xs"
                          : "bg-[#18251F]/60 text-white/70 border-white/10 hover:bg-[#18251F]/80"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="hidden sm:inline">Penghalus</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      title="Ganti Kamera Depan / Belakang"
                      className="h-7 w-7 rounded-lg bg-[#18251F]/60 hover:bg-[#18251F]/80 text-white/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  title="Layar Penuh"
                  className="h-7 w-7 rounded-lg bg-[#18251F]/60 hover:bg-[#18251F]/80 text-white/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all shadow-xs"
                >
                  {isFullscreen ? (
                    <Minimize className="w-3 h-3" />
                  ) : (
                    <Maximize className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Floating Toolbar: Compact Fitting Controls & Shutter */}
            <div className="absolute bottom-3 inset-x-3 z-30 flex flex-col items-center gap-2 pointer-events-none">
              {/* Compact Professional Adjustment Toolbar */}
              <div className="pointer-events-auto flex items-center gap-1 bg-[#18251F]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white shadow-md max-w-full overflow-x-auto scrollbar-none text-xs">
                {/* Size Controls */}
                <div className="flex items-center gap-1 pr-1.5 border-r border-white/15">
                  <SlidersHorizontal className="w-3 h-3 text-white/50 hidden sm:inline" />
                  <button
                    type="button"
                    onClick={() => setManualScale((prev) => Math.max(0.7, parseFloat((prev - 0.05).toFixed(2))))}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Kecilkan Frame"
                    aria-label="Kecilkan Frame"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-medium tabular-nums min-w-[34px] text-center text-white/95">
                    {Math.round(manualScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setManualScale((prev) => Math.min(1.4, parseFloat((prev + 0.05).toFixed(2))))}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Besarkan Frame"
                    aria-label="Besarkan Frame"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Position Controls */}
                <div className="flex items-center gap-0.5 px-1 border-r border-white/15">
                  <button
                    type="button"
                    onClick={() => setManualOffsetX((prev) => prev - 4)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Geser Kiri"
                    aria-label="Geser Kiri"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOffsetY((prev) => prev + 4)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Geser Atas"
                    aria-label="Geser Atas"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOffsetY((prev) => prev - 4)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Geser Bawah"
                    aria-label="Geser Bawah"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOffsetX((prev) => prev + 4)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Geser Kanan"
                    aria-label="Geser Kanan"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center gap-0.5 px-1">
                  <button
                    type="button"
                    onClick={() => setManualRotation((prev) => prev - 0.03)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Putar Berlawanan Jarum Jam"
                    aria-label="Putar Berlawanan Jarum Jam"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualRotation((prev) => prev + 0.03)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
                    title="Putar Searah Jarum Jam"
                    aria-label="Putar Searah Jarum Jam"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>

                {/* Reset Action */}
                {hasAdjustments && (
                  <button
                    type="button"
                    onClick={handleResetFitting}
                    className="flex items-center gap-1 text-[11px] font-medium text-white/70 hover:text-white pl-1.5 ml-0.5 border-l border-white/15 transition-colors"
                    title="Kembalikan ke posisi awal"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Shutter / Capture Button */}
              <div className="pointer-events-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCapture}
                  className="flex items-center gap-2 rounded-xl bg-[#104D37] hover:bg-[#0B3B2A] px-5 py-2.5 text-xs font-medium text-white shadow-md active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ambil Foto Try-On</span>
                </button>
              </div>
            </div>

            {/* Debug AR info */}
            {isDebugAR && (
              <div className="absolute top-14 left-3 z-40 bg-[#18251F]/90 text-[10px] text-emerald-300 font-mono p-2 rounded-md border border-white/10">
                <p>DEBUG AR MODE</p>
                <p>Frame: {activeGlasses.id}</p>
                <p>Scale: {manualScale.toFixed(2)}x</p>
                <p>Offset: ({manualOffsetX}, {manualOffsetY})</p>
                <p>Rot: {manualRotation.toFixed(2)} rad</p>
              </div>
            )}
          </div>

          {/* Subtitle notice below camera */}
          <p className="mt-2 text-center text-[11px] text-[#68756D]">
            Ukuran dan posisi kacamata dapat disesuaikan melalui toolbar di bawah preview.
          </p>
        </section>

        {/* ── RIGHT: PRODUCT CAROUSEL & FRAME DETAILS ───────────────────── */}
        <section className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-3.5 min-w-0">
          {/* ══ AI FACE SHAPE RECOMMENDATION BOX ══════════════════════════ */}
          <div className="bg-gradient-to-br from-[#104D37]/5 via-[#F7F8F5] to-white rounded-2xl p-4 border border-[#104D37]/20 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-[#104D37] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#86EFAC]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[#104D37] uppercase tracking-wider">
                    Rekomendasi Bentuk Wajah
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#18251F]">
                      {activeFaceShape ? `Wajah ${activeFaceShape}` : "Menganalisis Bentuk Wajah..."}
                    </span>
                    {detectedFaceShape && !manualFaceShape && (
                      <span className="text-[9px] font-semibold text-[#16835B] bg-[#16835B]/10 px-1.5 py-0.2 rounded border border-[#16835B]/20">
                        AI Auto
                      </span>
                    )}
                    {manualFaceShape && (
                      <span className="text-[9px] font-medium text-[#68756D] bg-[#18251F]/5 px-1.5 py-0.2 rounded">
                        Manual
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Face Shape Selector */}
              <div className="relative shrink-0">
                <select
                  value={manualFaceShape || (detectedFaceShape ? "auto" : "Diamond")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "auto") {
                      setManualFaceShape(null);
                      showToast("Bentuk wajah kembali ke deteksi AI otomatis");
                    } else if (val) {
                      setManualFaceShape(val as FaceShape);
                      showToast(`Bentuk wajah disetel ke: ${val}`);
                    }
                  }}
                  className="text-[11px] font-medium text-[#104D37] bg-white border border-[#E5E9E4] rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#104D37] shadow-2xs"
                  aria-label="Pilih Bentuk Wajah"
                >
                  <option value="auto">
                    {detectedFaceShape ? `Auto AI (${detectedFaceShape})` : "Auto AI"}
                  </option>
                  <option value="Diamond">Diamond</option>
                  <option value="Oval">Oval</option>
                  <option value="Round">Round (Bulat)</option>
                  <option value="Square">Square (Kotak)</option>
                  <option value="Heart">Heart (Hati)</option>
                  <option value="Oblong">Oblong (Panjang)</option>
                </select>
              </div>
            </div>

            {/* Optical Tip / Style Advice */}
            <p className="text-[11px] text-[#68756D] leading-relaxed">
              {activeFaceShape && SHAPE_META[activeFaceShape]
                ? SHAPE_META[activeFaceShape].tip
                : "Arahkan wajah ke kamera atau pilih bentuk wajah di atas untuk melihat frame paling cocok."}
            </p>

            {/* AI Compatibility Analysis for Current Frame */}
            {activeMatch && (
              <div className="rounded-xl bg-white p-3 border border-[#E5E9E4] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#104D37] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#16835B]" />
                    <span>Kecocokan Frame Aktif</span>
                  </span>
                  <span className="text-xs font-black text-[#16835B] bg-[#16835B]/10 px-2 py-0.5 rounded-md">
                    {activeMatch.score}% Match
                  </span>
                </div>
                {activeMatch.reasons.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-[#18251F] leading-snug">
                    {activeMatch.reasons.slice(0, 2).map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-[#16835B] mt-1.5 shrink-0" />
                        <span className="text-slate-600">{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Quick Action Button to Immediately Apply Recommendation */}
            {activeFaceShape && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#E5E9E4]/60">
                <button
                  type="button"
                  onClick={() => handleApplyRecommendation(activeFaceShape)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#104D37] hover:bg-[#0B3B2A] py-2 px-3 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  title={`Pakai frame rekomendasi untuk wajah ${activeFaceShape}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#86EFAC]" />
                  <span>
                    Pakai Rekomendasi {activeFaceShape}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(selectedCategory === "recommended" ? "all" : "recommended");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === "recommended"
                      ? "bg-white text-[#104D37] border-[#104D37] font-semibold"
                      : "bg-white text-[#18251F] border-[#E5E9E4] hover:bg-[#F7F8F5]"
                  }`}
                  title={`Filter katalog frame untuk wajah ${activeFaceShape}`}
                >
                  {selectedCategory === "recommended" ? "Semua" : `Koleksi ${activeFaceShape}`}
                </button>
              </div>
            )}
          </div>

          {/* Active Product Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E9E4] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium text-[#104D37] bg-[#104D37]/5 px-2 py-0.5 rounded-md border border-[#104D37]/15">
                    {activeGlasses.style || "Frame Kacamata"}
                  </span>
                  {activeGlasses.material && (
                    <span className="text-[11px] text-[#68756D]">
                      {activeGlasses.material}
                    </span>
                  )}
                  {has3DSupport && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      3D AR Ready
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold text-[#18251F] leading-snug">
                  {activeGlasses.name}
                </h2>
              </div>
              <div
                className="h-5 w-5 rounded-full border border-black/10 shrink-0 shadow-xs"
                style={{ backgroundColor: activeGlasses.color || "#104D37" }}
                title={`Warna: ${activeGlasses.color}`}
              />
            </div>

            {/* Face Shape Compatibility */}
            {activeGlasses.recommendedFor && activeGlasses.recommendedFor.length > 0 && (
              <div className="pt-2 border-t border-[#E5E9E4]">
                <p className="text-[11px] text-[#68756D] mb-1.5">Bentuk wajah yang sesuai:</p>
                <div className="flex flex-wrap gap-1">
                  {activeGlasses.recommendedFor.map((shape) => (
                    <span
                      key={shape}
                      className="text-[10px] font-medium text-[#18251F] bg-[#F7F8F5] px-2 py-0.5 rounded-md border border-[#E5E9E4]"
                    >
                      {shape}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Branch Selection & WhatsApp Stock Inquiry */}
            <div className="pt-2 border-t border-[#E5E9E4] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#68756D]">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-[#104D37]" />
                  <span>Cabang Tujuan:</span>
                </span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-[#F7F8F5] border border-[#E5E9E4] rounded-lg px-2 py-0.5 text-[11px] font-semibold text-[#104D37] cursor-pointer focus:outline-hidden"
                  aria-label="Pilih Cabang Optik I See You"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#104D37] hover:bg-[#0B3B2A] text-white text-xs font-semibold py-2.5 transition-all shadow-xs active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Tanya Stok ({selectedBranch.city})</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsComparing(true)}
                  className="inline-flex items-center justify-center gap-1 px-3 rounded-xl border border-[#104D37]/30 bg-white hover:bg-[#FAF8F5] text-[#104D37] text-xs font-semibold py-2.5 transition-all shadow-2xs"
                  title="Bandingkan spesifikasi frame ini dengan model lain"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bandingkan</span>
                </button>

                <Link
                  href={`/katalog?frame=${encodeURIComponent(activeGlasses.id)}`}
                  className="inline-flex items-center justify-center gap-1 px-2.5 rounded-xl border border-[#E5E9E4] text-[#18251F] hover:bg-[#F7F8F5] text-xs font-medium py-2.5 transition-all"
                  title="Lihat Detail di Katalog"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#104D37] text-white shadow-xs"
                    : "bg-white text-[#68756D] border border-[#E5E9E4] hover:text-[#18251F] hover:border-[#104D37]/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid / Scroll Area */}
          <div className="flex-1 max-h-[420px] lg:max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {filteredGlasses.map((g) => {
              const isSelected = activeGlasses.id === g.id;
              const globalIndex = tryOnManifest.findIndex((m) => m.id === g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectGlasses(globalIndex)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 min-w-0 ${
                    isSelected
                      ? "bg-[#104D37]/5 border-[#104D37] shadow-xs ring-1 ring-[#104D37]/20"
                      : "bg-white border-[#E5E9E4] hover:border-[#104D37]/40 hover:bg-[#F7F8F5]"
                  }`}
                >
                  {/* Thumbnail: Explicit 96x72 (Desktop) / 80x56 (Mobile) container with contained Image */}
                  <div className="relative w-20 h-14 sm:w-24 sm:h-[72px] shrink-0 bg-[#F7F8F5] rounded-xl overflow-hidden border border-[#E5E9E4] flex items-center justify-center p-1.5">
                    {g.file ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={`/glasses/${g.file}?v=5`}
                          alt={g.name}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-contain object-center"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-[#68756D]">Polos</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p className="text-[10px] font-medium text-[#104D37] truncate uppercase tracking-wider">
                        {g.style || "Frame"}
                      </p>
                      {g.isRealPhoto && (
                        <span className="text-[9px] font-bold text-[#16835B] bg-[#16835B]/10 px-1.5 py-0.2 rounded border border-[#16835B]/20">
                          REAL
                        </span>
                      )}
                      {activeFaceShape && g.recommendedFor && g.recommendedFor.includes(activeFaceShape) && (
                        <span className="text-[9px] font-bold text-[#104D37] bg-[#104D37]/10 px-1.5 py-0.2 rounded border border-[#104D37]/20 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-[#16835B]" />
                          <span>Cocok {activeFaceShape}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#18251F] truncate leading-tight">
                      {g.name}
                    </h3>
                    <p className="text-[11px] text-[#68756D] truncate mt-0.5">
                      {g.material ? `${g.material} • ` : ""}
                      {g.recommendedFor?.length ? `Cocok: ${g.recommendedFor.slice(0, 2).join(", ")}` : "Universal fit"}
                    </p>
                  </div>

                  {/* Radio / Selection Circle */}
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-[#104D37] bg-[#104D37] text-white shadow-xs"
                        : "border-[#CCD3CA] bg-[#F7F8F5]"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cross Promotion Callout */}
          <div className="bg-[#F7F8F5] border border-[#E5E9E4] p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#18251F]">Coba Photobooth 4-Grid</p>
              <p className="text-[11px] text-[#68756D] mt-0.5">Cetak strip foto dengan template estetik Optik I See You.</p>
            </div>
            <Link
              href="/photobooth"
              className="shrink-0 bg-white hover:bg-[#104D37] hover:text-white text-[#104D37] border border-[#E5E9E4] hover:border-[#104D37] px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1"
            >
              <span>Buka</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>

      {/* ══ CAPTURED PHOTO PREVIEW MODAL ══════════════════════════════════ */}
      {capturedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#E5E9E4] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E9E4]">
              <div>
                <p className="text-[10px] font-medium text-[#104D37] uppercase tracking-wider">Hasil Virtual Try-On</p>
                <h3 className="text-sm font-semibold text-[#18251F]">{activeGlasses.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="h-7 w-7 rounded-lg bg-[#F7F8F5] hover:bg-[#E5E9E4] text-[#68756D] flex items-center justify-center transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative flex-1 bg-[#18251F] overflow-hidden flex items-center justify-center p-2 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedPhoto}
                alt="Hasil Virtual Try-On"
                className="max-h-[50vh] w-auto rounded-xl object-contain shadow-lg"
              />
              <div className="absolute bottom-3 left-3 bg-[#18251F]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-white/90 border border-white/10">
                Frame: {activeGlasses.name}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3.5 bg-[#FAFAF8] border-t border-[#E5E9E4] flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPhoto}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#104D37] hover:bg-[#0B3B2A] text-white py-2.5 text-xs font-medium shadow-xs transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Simpan Foto (HD)</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#16835B] hover:bg-[#126b4a] text-white py-2.5 text-xs font-medium shadow-xs transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Tanya Stok WA</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="w-full py-1.5 text-xs font-medium text-[#68756D] hover:text-[#18251F] text-center transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Coba Frame Lain</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ COMPARE 2 FRAMES MODAL (A vs B) ════════════════════════════════ */}
      {isComparing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E5E9E4] flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E9E4] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#104D37] text-white flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#18251F]">
                    Bandingkan 2 Frame Kacamata
                  </h3>
                  <p className="text-[11px] text-[#68756D]">
                    Perbandingan visual, bentuk, spesifikasi, dan skor kecocokan wajah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComparing(false)}
                className="h-8 w-8 rounded-xl bg-white hover:bg-[#E5E9E4] text-[#68756D] flex items-center justify-center transition-colors border border-[#E5E9E4]"
                aria-label="Tutup Perbandingan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Body: Grid 2 Columns */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-6 items-start">
                {/* Column A: Active Frame */}
                <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#104D37]/5 border-2 border-[#104D37]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#104D37] bg-white px-2 py-0.5 rounded-md border border-[#104D37]/20">
                      Frame A (Aktif)
                    </span>
                    {activeMatch && (
                      <span className="text-[11px] font-bold text-[#16835B]">
                        {activeMatch.score}% Cocok
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-[4/3] w-full rounded-xl bg-white border border-[#E5E9E4] p-2 flex items-center justify-center overflow-hidden">
                    {activeGlasses.file ? (
                      <Image
                        src={`/glasses/${activeGlasses.file}?v=5`}
                        alt={activeGlasses.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Polos</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#18251F] leading-tight">
                      {activeGlasses.name}
                    </h4>
                    <p className="text-[11px] text-[#68756D] mt-0.5">
                      Gaya: <strong className="text-[#18251F]">{activeGlasses.style || "-"}</strong>
                    </p>
                    <p className="text-[11px] text-[#68756D]">
                      Material: <strong className="text-[#18251F]">{activeGlasses.material || "High-Grade Polymer"}</strong>
                    </p>
                  </div>

                  {/* Compatibility Details */}
                  {activeMatch && (
                    <div className="rounded-xl bg-white p-2.5 border border-[#E5E9E4] space-y-1 text-[10.5px]">
                      <p className="font-semibold text-[#104D37]">Alasan Kecocokan:</p>
                      <p className="text-[#68756D] leading-relaxed">
                        {activeMatch.reasons[0] || "Proporsional untuk bentuk wajah Anda."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Column B: Comparison Target Frame */}
                <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5E9E4]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded-md border border-[#E5E9E4]">
                      Frame B
                    </span>
                    {compareMatch && (
                      <span className="text-[11px] font-bold text-[#16835B]">
                        {compareMatch.score}% Cocok
                      </span>
                    )}
                  </div>

                  {/* Target Selector Dropdown */}
                  <select
                    value={compareTargetIndex}
                    onChange={(e) => setCompareTargetIndex(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5E9E4] rounded-lg px-2 py-1 text-xs font-semibold text-[#18251F] focus:outline-hidden"
                    aria-label="Pilih Frame Pembanding"
                  >
                    {tryOnManifest.map((g, idx) => (
                      <option key={g.id} value={idx}>
                        {g.name} ({g.style || "Frame"})
                      </option>
                    ))}
                  </select>

                  <div className="relative aspect-[4/3] w-full rounded-xl bg-white border border-[#E5E9E4] p-2 flex items-center justify-center overflow-hidden">
                    {compareTargetGlasses.file ? (
                      <Image
                        src={`/glasses/${compareTargetGlasses.file}?v=5`}
                        alt={compareTargetGlasses.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Polos</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#18251F] leading-tight">
                      {compareTargetGlasses.name}
                    </h4>
                    <p className="text-[11px] text-[#68756D] mt-0.5">
                      Gaya: <strong className="text-[#18251F]">{compareTargetGlasses.style || "-"}</strong>
                    </p>
                    <p className="text-[11px] text-[#68756D]">
                      Material: <strong className="text-[#18251F]">{compareTargetGlasses.material || "High-Grade Polymer"}</strong>
                    </p>
                  </div>

                  {/* Compatibility Details */}
                  {compareMatch && (
                    <div className="rounded-xl bg-white p-2.5 border border-[#E5E9E4] space-y-1 text-[10.5px]">
                      <p className="font-semibold text-[#104D37]">Alasan Kecocokan:</p>
                      <p className="text-[#68756D] leading-relaxed">
                        {compareMatch.reasons[0] || "Proporsional untuk bentuk wajah Anda."}
                      </p>
                    </div>
                  )}

                  {/* Action to switch to Frame B */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(compareTargetIndex);
                      setIsComparing(false);
                      showToast(`Sekarang mencoba ${compareTargetGlasses.name}`);
                    }}
                    className="w-full mt-auto py-2 px-3 rounded-xl bg-[#104D37] hover:bg-[#0B3B2A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 text-center cursor-pointer"
                  >
                    Coba Frame B Ini Sekarang
                  </button>
                </div>
              </div>

              {/* Verified Dimension Table */}
              <div className="rounded-2xl border border-[#E5E9E4] bg-white p-4 space-y-3">
                <h5 className="text-xs font-bold text-[#18251F] uppercase tracking-wider">
                  Perbandingan Dimensi & Spesifikasi Fisik
                </h5>
                <div className="grid grid-cols-3 gap-2 text-xs border-b border-[#E5E9E4] pb-2 font-semibold text-slate-500">
                  <span>Parameter</span>
                  <span className="text-[#104D37]">{activeGlasses.name}</span>
                  <span className="text-slate-700">{compareTargetGlasses.name}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-slate-600">
                    <span className="font-medium text-slate-800">Bentuk Frame</span>
                    <span>{activeGlasses.style || "Standar"}</span>
                    <span>{compareTargetGlasses.style || "Standar"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600">
                    <span className="font-medium text-slate-800">Lebar Fit Rasio</span>
                    <span>{activeGlasses.fitWidthRatio?.toFixed(2) || "1.48"}x IPD</span>
                    <span>{compareTargetGlasses.fitWidthRatio?.toFixed(2) || "1.48"}x IPD</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600">
                    <span className="font-medium text-slate-800">Bentuk Wajah Ideal</span>
                    <span className="text-[11px]">{activeGlasses.recommendedFor?.slice(0, 3).join(", ") || "Semua"}</span>
                    <span className="text-[11px]">{compareTargetGlasses.recommendedFor?.slice(0, 3).join(", ") || "Semua"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600">
                    <span className="font-medium text-slate-800">Dukungan 3D AR</span>
                    <span>{FRAME_3D_MAP[activeGlasses.id] ? "Tersedia (GLB)" : "2D Real"}</span>
                    <span>{FRAME_3D_MAP[compareTargetGlasses.id] ? "Tersedia (GLB)" : "2D Real"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-[#FAF8F5] border-t border-[#E5E9E4] flex justify-end">
              <button
                type="button"
                onClick={() => setIsComparing(false)}
                className="px-5 py-2 rounded-xl bg-white border border-[#E5E9E4] text-xs font-semibold text-[#18251F] hover:bg-[#F7F8F5] transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
