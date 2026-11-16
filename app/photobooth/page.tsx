"use client";



/**

 * app/photobooth/page.tsx · ISY AR Photobooth Pro (Event & Studio Edition)

 *

 * Professional features:

 * - SELECTIVE RETAKE: Re-shoot single photo slot (e.g. Photo #2) without losing others!

 * - COLOR GRADED FILTERS: Post-processing B&W Noir, Vintage, Soft Film, Emerald, Cyber Pop

 * - GIANT QR EVENT BOOTH MODE: Large centered 320px QR Code modal for offline pop-up events

 * - SHUTTER AUDIO EFFECT: Realistic camera shutter sound on snap

 * - ANIMATED GIF: Creates looping GIF matching selected filters

 * - FRAME THEMES: 5 Theme choices (Classic White, Emerald Luxury, Vintage, Pastel, Midnight)

 */



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

import { useRouter, usePathname } from "next/navigation";

import { gsap } from "gsap";

import {

  Camera,

  RotateCcw,

  Volume2,

  VolumeX,

  Hand,

  RefreshCw,

  Sparkles,

  Smartphone,

  Download,

  Printer,

  Share2,

  QrCode,

  ArrowLeft,

  ArrowRight,

  SlidersHorizontal,

  Check,

  CheckCircle2,

  AlertTriangle,

  X,

  Layers,

  Image as ImageIcon,

  Film,

} from "lucide-react";

import FaceTracker, { type FaceTrackerHandle } from "@/components/ar/FaceTracker";

import Countdown from "@/components/ui/Countdown";

import FramePicker from "@/components/ui/FramePicker";

import FrameThemePicker from "@/components/ui/FrameThemePicker";

import { FRAME_LAYOUTS, type FrameLayout } from "@/lib/frameLayouts";

import { compositeFrame, compositeArTryOnFrame, FRAME_THEMES, getCompatibleThemes, type FrameTheme } from "@/lib/frameCompositor";

import { COLOR_FILTERS, type ColorFilter } from "@/lib/colorFilters";

import { detectFaceShape, SHAPE_META, type FaceShapeResult, type FaceShape } from "@/lib/faceShape";

import { SHOPEE_STORE_URL } from "@/lib/branches";

import { uploadPhotoForQR, generateInstantQR, generatePhotoId, uploadGifToR2 } from "@/lib/uploadImage";

import { createAnimatedGif } from "@/lib/gifGenerator";

import { playShutterSound, unlockAudio } from "@/lib/soundEffects";

import ContactCSModal from "@/components/ui/ContactCSModal";

import ThermalPrintModal from "@/components/ui/ThermalPrintModal";

import { downloadOrShareImage } from "@/lib/saveImage";

import QRCode from "qrcode";

import manifestRaw from "@/public/glasses/manifest.json";

import { trackTryOn, trackPhotoShare } from "@/lib/telemetry";



type BoothPhase =

  | "frame-select"

  | "theme-select"

  | "ready"

  | "countdown"

  | "flash"

  | "between"

  | "session-review"

  | "compositing"

  | "customize"

  | "result";



type UploadPhase = "idle" | "uploading" | "done" | "error" | "no-key";

type ResultTab = "strip" | "gif";



interface Model3DMeta {

  glbFile?: string;

  frameWidthMm?: number;

  bridgeMm?: number;

  templeMm?: number;

  frameColor?: string;

  metalColor?: string;

  isTinted?: boolean;

  style?: string;

  name?: string;

  fitWidthRatio?: number;

  yOffsetRatio?: number;

  /** Per-model pivot origin correction (Three.js units) */

  pivotOffset?: { x: number; y: number; z: number };

  /** Per-model rotation fine-tune in degrees */

  rotationOffsetDeg?: { x: number; y: number; z: number };

  /** Temple fade start fraction 0–1 */

  templeFadeStart?: number;

}



interface GlassesMeta {

  id: string;

  name: string;

  file: string;

  fitWidthRatio: number;

  ipdScaleRef?: number;

  style: string;

  recommendedFor: string[];

  color: string;

  lensType?: string;

  excludeFromAiMatch?: boolean;

  model3D?: Model3DMeta;

}



const manifest = manifestRaw as GlassesMeta[];

const TIMER_OPTIONS = [3, 5, 10] as const;

type TimerSec = typeof TIMER_OPTIONS[number];



function BackBtn({ onClick }: { onClick: () => void }) {

  return (

    <button

      type="button"

      onClick={onClick}

      className="group inline-flex items-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-[#18251F] shadow-xs hover:border-[#103F31]/40 hover:bg-[#F8F7F3] active:scale-95 transition-all cursor-pointer"

    >

      <ArrowLeft className="w-3.5 h-3.5 text-[#68756D] group-hover:-translate-x-0.5 transition-transform" />

      <span>Kembali</span>

    </button>

  );

}



function AIModeToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {

  return (

    <button

      type="button"

      onClick={onToggle}

      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${

        on

          ? "bg-[#103F31] text-white shadow-xs"

          : "border border-[#DDE8E1] bg-white text-[#68756D] hover:border-[#103F31]/30"

      }`}

    >

      <Sparkles className="w-3 h-3" />

      <span>{on ? "AI Rekomendasi" : "Pilih Manual"}</span>

    </button>

  );

}



function FaceHUD({ result, analyzing }: { result: FaceShapeResult | null; analyzing?: boolean }) {

  if (analyzing) {

    return (

      <div className="flex items-center gap-1.5 text-xs text-[#68756D]">

        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#27A35B]" />

        <span>Menganalisis wajah...</span>

      </div>

    );

  }

  if (!result || result.confidence < 0.3) {

    return (

      <div className="flex items-center gap-1.5 text-xs text-[#8C9890]">

        <span className="h-1.5 w-1.5 rounded-full bg-[#DDE8E1]" />

        <span>Posisikan wajah di kamera</span>

      </div>

    );

  }

  const meta = SHAPE_META[result.shape];

  return (

    <div className="flex flex-col gap-0.5">

      <p className="text-xs font-semibold text-[#103F31] leading-none">{meta.label}</p>

      <p className="text-[10px] text-[#68756D] leading-none">{meta.style}</p>

    </div>

  );

}



function TimerChips({

  value,

  onChange,

  disabled,

}: {

  value: TimerSec;

  onChange: (v: TimerSec) => void;

  disabled: boolean;

}) {

  return (

    <div className="flex items-center gap-1">

      {TIMER_OPTIONS.map((t) => (

        <button

          key={t}

          type="button"

          onClick={() => onChange(t)}

          disabled={disabled}

          className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${

            value === t

              ? "bg-[#103F31] text-white shadow-xs"

              : "border border-[#DDE8E1] bg-white text-[#68756D] hover:border-[#103F31]/30"

          }`}

        >

          {t}s

        </button>

      ))}

    </div>

  );

}



// ── Giant Center QR Modal for Pop-Up Events ──────────────────────────────────

function GiantQRModal({

  uploadedUrl,

  qrCodeDataUrl,

  onClose,

}: {

  uploadedUrl: string;

  qrCodeDataUrl?: string | null;

  onClose: () => void;

}) {

  const qrDisplaySrc =

    qrCodeDataUrl ||

    `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&color=103F31&data=${encodeURIComponent(

      uploadedUrl

    )}`;



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4 border border-[#DDE8E1]">

        <button

          type="button"

          onClick={onClose}

          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8F7F3] text-[#68756D] hover:text-[#18251F] hover:bg-[#EFEFEA] transition-all cursor-pointer"

          aria-label="Tutup"

        >

          <X className="w-4 h-4" />

        </button>



        <div className="space-y-1 pt-2">

          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#103F31]/5 border border-[#103F31]/15 px-2.5 py-0.5 text-xs font-semibold text-[#103F31]">

            <QrCode className="w-3.5 h-3.5" />

            <span>Event Booth Mode</span>

          </div>

          <h3 className="text-lg font-semibold text-[#18251F]">Scan dan Unduh di HP</h3>

          <p className="text-xs text-[#68756D]">Arahkan kamera smartphone Anda ke kode QR berikut</p>

        </div>



        <div className="flex justify-center p-3 bg-[#F8F7F3] rounded-2xl border border-[#DDE8E1]">

          <img

            src={qrDisplaySrc}

            alt="QR Code Event Raksasa"

            className="h-60 w-60 rounded-xl border border-[#DDE8E1] bg-white object-contain shadow-xs"

          />

        </div>



        <p className="text-[11px] font-medium text-[#103F31] truncate max-w-full px-2">{uploadedUrl}</p>



        <button

          type="button"

          onClick={onClose}

          className="w-full rounded-xl bg-[#103F31] hover:bg-[#0B2E24] py-3 text-xs font-semibold text-white shadow-md active:scale-98 transition-all cursor-pointer"

        >

          Tutup dan Kembali ke Studio

        </button>

      </div>

    </div>

  );

}



function QRBox({

  phase,

  uploadedUrl,

  qrCodeDataUrl,

  uploadError,

  onOpenGiantQR,

  onDownload,

  onRetry,

}: {

  phase: UploadPhase;

  uploadedUrl: string | null;

  qrCodeDataUrl: string | null;

  uploadError: string | null;

  onOpenGiantQR: () => void;

  onDownload: () => void;

  onRetry?: () => void;

}) {

  if (phase === "idle" && !qrCodeDataUrl && !uploadedUrl) return null;



  if (qrCodeDataUrl || uploadedUrl) {

    const qrDisplaySrc =

      qrCodeDataUrl ||

      `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&color=103F31&data=${encodeURIComponent(

        uploadedUrl || ""

      )}`;



    const isUploading = phase === "uploading";

    const isError = phase === "error";



    return (

      <div className="flex flex-col gap-2 rounded-2xl border border-[#DDE8E1] bg-[#F8F7F3] p-3.5 shadow-2xs">

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-[#DDE8E1] bg-white p-1">

              <img

                src={qrDisplaySrc}

                alt="QR Code"

                className="h-full w-full object-contain"

              />

              {isUploading ? (

                <span

                  className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white"

                  title="Sinkronisasi Cloud"

                >

                  <Sparkles className="w-2 h-2" />

                </span>

              ) : isError ? (

                <span

                  className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white"

                  title="Upload Gagal"

                >

                  <AlertTriangle className="w-2 h-2" />

                </span>

              ) : (

                <span

                  className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#27A35B] text-white"

                  title="Tersimpan di Cloud"

                >

                  <Check className="w-2 h-2 stroke-[3]" />

                </span>

              )}

            </div>

            <div className="flex flex-col gap-0.5">

              <p className="text-xs font-semibold text-[#18251F]">Scan & Unduh di HP</p>

              {isUploading ? (

                <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1">

                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />

                  <span>Sedang menyiapkan tautan unduhan...</span>

                </p>

              ) : isError ? (

                <p className="text-[10px] text-red-600 font-medium">

                  Koneksi lambat. Anda dapat simpan langsung ke galeri.

                </p>

              ) : (

                <p className="text-[10px] text-[#68756D]">Arahkan kamera smartphone ke QR ini.</p>

              )}

            </div>

          </div>



          <button

            type="button"

            onClick={onOpenGiantQR}

            className="flex shrink-0 items-center gap-1 rounded-xl border border-[#DDE8E1] bg-white hover:bg-[#F8F7F3] px-2.5 py-2 text-[10px] font-semibold text-[#103F31] transition-all cursor-pointer shadow-xs"

          >

            <QrCode className="w-3.5 h-3.5" />

            <span>Perbesar</span>

          </button>

        </div>



        {isError && (

          <div className="flex items-center gap-2 pt-2 border-t border-[#DDE8E1]">

            {onRetry && (

              <button

                type="button"

                onClick={onRetry}

                className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1 text-[10px] font-semibold text-white shadow-xs transition-all cursor-pointer"

              >

                Coba Ulang

              </button>

            )}

            <button

              type="button"

              onClick={onDownload}

              className="rounded-lg bg-[#103F31] hover:bg-[#0B2E24] px-3 py-1 text-[10px] font-semibold text-white shadow-xs transition-all cursor-pointer"

            >

              Simpan ke Galeri

            </button>

          </div>

        )}

      </div>

    );

  }



  if (phase === "no-key") {

    return (

      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-3">

        <div className="flex items-start gap-2.5">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">

            <AlertTriangle className="w-3.5 h-3.5" />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-xs font-semibold text-red-900 leading-snug">

              Setup Cloudinary Diperlukan

            </p>

            <p className="mt-0.5 text-[10px] text-red-700/80 leading-relaxed break-words line-clamp-2">

              {uploadError || "Pastikan Cloudinary preset di-set Unsigned dan ENV Vercel terpasang."}

            </p>

          </div>

        </div>



        <div className="flex items-center gap-2 pt-1">

          <button

            type="button"

            onClick={onDownload}

            className="rounded-lg bg-[#103F31] px-3 py-1.5 text-[10px] font-semibold text-white shadow-xs active:scale-95 transition-all cursor-pointer"

          >

            Simpan Langsung

          </button>

        </div>

      </div>

    );

  }



  return null;

}



function ShareModal({

  compositeUrl,

  gifUrl,

  onClose,

  onToast,

}: {

  compositeUrl: string;

  gifUrl: string | null;

  onClose: () => void;

  onToast: (m: string) => void;

}) {

  const downloadStrip = async () => {

    onToast("Mengunduh foto ke galeri...");

    trackPhotoShare();

    await downloadOrShareImage(compositeUrl, `iseeyou-strip-${Date.now()}.jpg`, "Optik I See You — Photo");

    onToast("Foto berhasil diunduh dan tersimpan di galeri!");

  };

  const downloadGif = async () => {

    if (!gifUrl) return;

    onToast("Mengunduh GIF animasi...");

    trackPhotoShare();

    await downloadOrShareImage(gifUrl, `iseeyou-gif-${Date.now()}.gif`, "Optik I See You — GIF");

    onToast("GIF animasi berhasil tersimpan di galeri!");

  };



  const shareWhatsApp = () => {

    const text = encodeURIComponent(

      "Halo! Ini hasil foto seru saya di Photobooth Studio Optik I See You. Kunjungi https://optikiseeyou.com/photobooth"

    );

    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#DDE8E1] text-center space-y-4">

        <button

          type="button"

          onClick={onClose}

          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8F7F3] text-[#68756D] hover:text-[#18251F] hover:bg-[#EFEFEA] transition-all cursor-pointer"

          aria-label="Tutup"

        >

          <X className="w-4 h-4" />

        </button>



        <div className="space-y-1 pt-1">

          <h3 className="text-lg font-semibold text-[#18251F]">Bagikan Foto</h3>

          <p className="text-xs text-[#68756D]">Simpan foto atau bagikan ke media sosial favorit Anda</p>

        </div>



        <div className="flex flex-col gap-2 pt-2">

          <button

            type="button"

            onClick={downloadStrip}

            className="flex items-center justify-center gap-2 rounded-xl bg-[#103F31] hover:bg-[#0B2E24] text-white py-3 px-4 text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer"

          >

            <Download className="w-4 h-4" />

            <span>Simpan Foto Strip (JPG)</span>

          </button>



          {gifUrl && (

            <button

              type="button"

              onClick={downloadGif}

              className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] hover:bg-white text-[#18251F] py-3 px-4 text-xs font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"

            >

              <Film className="w-4 h-4 text-[#103F31]" />

              <span>Simpan Animasi (GIF)</span>

            </button>

          )}



          <button

            type="button"

            onClick={shareWhatsApp}

            className="flex items-center justify-center gap-2 rounded-xl border border-[#27A35B]/40 bg-[#27A35B]/10 hover:bg-[#27A35B]/20 text-[#103F31] py-3 px-4 text-xs font-semibold active:scale-98 transition-all cursor-pointer"

          >

            <Share2 className="w-4 h-4 text-[#27A35B]" />

            <span>Bagikan via WhatsApp</span>

          </button>

        </div>

      </div>

    </div>

  );

}



function TryOnResult({

  photoUrl,

  compositeUrl,

  arGlassesName,

  onRetake,

  onDownload,

  onOpenShareModal,

}: {

  photoUrl: string;

  compositeUrl: string | null;

  arGlassesName?: string;

  onRetake: () => void;

  onDownload: () => void;

  onOpenShareModal: () => void;

}) {

  const router = useRouter();

  const [csModalOpen, setCsModalOpen] = useState(false);

  const displayUrl = compositeUrl || photoUrl;

  return (

    <div className="flex flex-col gap-4 px-4 py-4">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="h-2 w-2 rounded-full bg-[#27A35B]" />

          <span className="text-xs font-semibold uppercase tracking-wider text-[#103F31]">

            Hasil Virtual Try-On

          </span>

        </div>

        <span className="rounded-md bg-[#F8F7F3] border border-[#DDE8E1] px-2.5 py-0.5 text-[10px] font-semibold text-[#103F31]">

          Framed Photo

        </span>

      </div>



      {/* Photo with Watermark Frame */}

      <div className="relative overflow-hidden rounded-2xl border border-[#DDE8E1] shadow-md max-h-[380px] flex items-center justify-center bg-white">

        <img src={displayUrl} alt="Hasil Try On Kacamata" className="h-full max-h-[380px] w-full object-contain" />

      </div>



      {/* Primary CTA: WhatsApp CS */}

      <button

        type="button"

        onClick={() => setCsModalOpen(true)}

        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#103F31] hover:bg-[#0B2E24] py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md active:scale-98 transition-all cursor-pointer"

      >

        <Share2 className="w-4 h-4" />

        <span>Tanya Ketersediaan Frame ke CS</span>

      </button>



      <div className="grid grid-cols-2 gap-2">

        <button

          type="button"

          onClick={onDownload}

          className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE8E1] bg-white py-3 text-xs font-semibold text-[#103F31] hover:bg-[#F8F7F3] active:scale-95 cursor-pointer shadow-xs"

        >

          <Download className="w-4 h-4" />

          <span>Simpan Foto</span>

        </button>

        <button

          type="button"

          onClick={onOpenShareModal}

          className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE8E1] bg-white py-3 text-xs font-semibold text-[#103F31] hover:bg-[#F8F7F3] active:scale-95 cursor-pointer shadow-xs"

        >

          <Share2 className="w-4 h-4" />

          <span>Bagikan</span>

        </button>

      </div>



      <div className="grid grid-cols-2 gap-2">

        <button

          type="button"

          onClick={onRetake}

          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] py-2.5 text-xs font-medium text-[#68756D] hover:text-[#18251F] active:scale-95 cursor-pointer"

        >

          <RotateCcw className="w-3.5 h-3.5" />

          <span>Foto Ulang</span>

        </button>

        <button

          type="button"

          onClick={() => router.push("/katalog")}

          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] py-2.5 text-xs font-medium text-[#68756D] hover:text-[#18251F] active:scale-95 cursor-pointer"

        >

          <span>Lihat Katalog</span>

        </button>

      </div>



      {/* Modal Pilihan 4 Cabang Resmi Optik I See You */}

      <ContactCSModal

        isOpen={csModalOpen}

        onClose={() => setCsModalOpen(false)}

        productName={arGlassesName}

        customMessage={(branchName) =>

          arGlassesName

            ? `Halo Optik I See You Cabang ${branchName}!\nSaya baru saja mencoba frame *${arGlassesName}* di Virtual Try-On Optik I See You.\n\nBoleh tahu apakah stok frame ini masih tersedia di cabang ${branchName}? Terima kasih.`

            : `Halo Optik I See You Cabang ${branchName}!\nSaya baru saja mencoba Virtual Try-On kacamata di website Optik I See You.\n\nBoleh tahu info ketersediaan frame kacamata di cabang ${branchName}? Terima kasih.`

        }

      />

    </div>

  );

}



// ── StripPreview: Handles Customization (Screen E), Final Result (Screen F), & Live Slots ──

function StripPreview({

  layout,

  photos,

  compositeUrl,

  gifUrl,

  uploadedUrl,

  qrCodeDataUrl,

  uploadError,

  uploadPhase,

  phase,

  photoCount,

  selectedTheme,

  selectedFilter,

  onSelectTheme,

  onSelectFilter,

  onOpenGiantQR,

  onDownloadStrip,

  onDownloadGif,

  onRetake,

  onChangeLayout,

  onOpenShareModal,

  onOpenThermalPrint,

  onRetakeSingleSlot,

  onRetryUpload,

  onGoToResult,

  onGoToCustomize,

  arGlassesName,

  isArMode = false,

}: {

  layout: FrameLayout;

  photos: string[];

  compositeUrl: string | null;

  gifUrl: string | null;

  uploadedUrl: string | null;

  qrCodeDataUrl?: string | null;

  uploadError?: string | null;

  uploadPhase: UploadPhase;

  phase: BoothPhase;

  photoCount: number;

  selectedTheme: string;

  selectedFilter: string;

  onSelectTheme: (tId: string) => void;

  onSelectFilter: (fId: string) => void;

  onOpenGiantQR: () => void;

  onDownloadStrip: () => void;

  onDownloadGif: () => void;

  onRetake: () => void;

  onChangeLayout: () => void;

  onOpenShareModal: () => void;

  onOpenThermalPrint: () => void;

  onRetakeSingleSlot: (slotIdx: number) => void;

  onRetryUpload?: () => void;

  onGoToResult: () => void;

  onGoToCustomize: () => void;

  arGlassesName?: string;

  isArMode?: boolean;

}) {

  const [activeTab, setActiveTab] = useState<ResultTab>("strip");

  const ref = useRef<HTMLDivElement>(null);



  useEffect(() => {

    if ((phase === "result" || phase === "customize") && ref.current) {

      gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });

    }

  }, [phase]);



  // Compositing spinner

  if (phase === "compositing") {

    return (

      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">

        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#103F31] border-t-transparent" />

        <h3 className="text-sm font-semibold text-[#18251F]">

          {isArMode ? "Membuat foto Try On..." : "Menyiapkan Komposisi Frame & GIF..."}

        </h3>

        <p className="text-xs text-[#68756D]">Memproses tata letak studio resolusi tinggi 300 DPI</p>

      </div>

    );

  }



  // AR Try-On framed result

  if (phase === "result" && isArMode && photos[0]) {

    return (

      <TryOnResult

        photoUrl={photos[0]}

        compositeUrl={compositeUrl}

        arGlassesName={arGlassesName}

        onRetake={onRetake}

        onDownload={onDownloadStrip}

        onOpenShareModal={onOpenShareModal}

      />

    );

  }



  // ── SCREEN E: PHOTO CUSTOMIZATION STUDIO ─────────────────────────────────

  if (phase === "customize" && compositeUrl) {

    return (

      <div ref={ref} className="w-full flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 min-w-0">

        {/* Left: Prominent Frame Preview */}

        <div className="flex-1 flex flex-col items-center justify-center bg-[#EFEFEA] rounded-2xl p-4 sm:p-6 border border-[#DDE8E1] min-w-0 relative">

          {/* Tab Switcher: Strip Foto vs GIF Animasi */}

          <div className="absolute top-4 left-4 z-10 flex rounded-xl border border-[#DDE8E1] bg-white p-1 shadow-xs">

            <button

              type="button"

              onClick={() => setActiveTab("strip")}

              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${

                activeTab === "strip"

                  ? "bg-[#103F31] text-white shadow-xs"

                  : "text-[#68756D] hover:text-[#18251F]"

              }`}

            >

              <ImageIcon className="w-3.5 h-3.5" />

              <span>Foto Strip</span>

            </button>

            <button

              type="button"

              onClick={() => setActiveTab("gif")}

              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${

                activeTab === "gif"

                  ? "bg-[#103F31] text-white shadow-xs"

                  : "text-[#68756D] hover:text-[#18251F]"

              }`}

            >

              <Film className="w-3.5 h-3.5" />

              <span>Animasi GIF</span>

            </button>

          </div>



          {/* Centered Image */}

          <div className="w-full flex items-center justify-center max-h-[560px] sm:max-h-[620px] overflow-hidden py-4 pt-14">

            {activeTab === "strip" ? (

              <img

                src={compositeUrl}

                alt="Preview Frame"

                className="max-h-[520px] w-auto max-w-full object-contain rounded-xl shadow-lg border border-[#DDE8E1]"

              />

            ) : gifUrl ? (

              <img

                src={gifUrl}

                alt="Preview GIF"

                className="max-h-[520px] w-auto max-w-full object-contain rounded-xl shadow-lg border border-[#DDE8E1]"

              />

            ) : (

              <div className="flex h-56 flex-col items-center justify-center gap-2 text-xs text-[#68756D]">

                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#103F31] border-t-transparent" />

                <span>Memproses animasi GIF...</span>

              </div>

            )}

          </div>

        </div>



        {/* Right: Studio Customization Tools */}

        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4 bg-white p-5 rounded-2xl border border-[#DDE8E1] shadow-xs">

          <div>

            <h3 className="text-base font-semibold text-[#18251F]">Kustomisasi Studio</h3>

            <p className="text-xs text-[#68756D] mt-0.5">Pilih gradasi warna dan tema frame favorit Anda.</p>

          </div>



          {/* Color Filters */}

          <div className="space-y-2">

            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-[#18251F]">Filter Warna</span>

              <span className="text-[11px] text-[#27A35B] font-medium">

                {COLOR_FILTERS.find((f) => f.id === selectedFilter)?.name || "Normal"}

              </span>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

              {COLOR_FILTERS.map((f) => {

                const isSel = f.id === selectedFilter;

                return (

                  <button

                    key={f.id}

                    type="button"

                    onClick={() => onSelectFilter(f.id)}

                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${

                      isSel

                        ? "bg-[#103F31]/5 border-[#103F31] text-[#103F31] ring-1 ring-[#103F31]/20 font-semibold"

                        : "bg-white border-[#DDE8E1] text-[#68756D] hover:border-[#103F31]/30 hover:bg-[#F8F7F3]"

                    }`}

                  >

                    <span

                      className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0"

                      style={{ backgroundColor: f.colorDot }}

                    />

                    <span className="truncate">{f.name}</span>

                  </button>

                );

              })}

            </div>

          </div>



          {/* Frame Themes (for Strip tab) */}

          {activeTab === "strip" && (

            <div className="space-y-2 pt-2 border-t border-[#DDE8E1]">

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold text-[#18251F]">Template Frame</span>

                <span className="text-[11px] text-[#27A35B] font-medium">

                  {getCompatibleThemes(layout).find((t) => t.id === selectedTheme)?.name || "Classic White"}

                </span>

              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">

                {getCompatibleThemes(layout).map((th) => {

                  const isSel = th.id === selectedTheme;

                  return (

                    <button

                      key={th.id}

                      type="button"

                      onClick={() => onSelectTheme(th.id)}

                      className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${

                        isSel

                          ? "bg-[#103F31] text-white border-[#103F31] shadow-xs"

                          : "bg-white text-[#68756D] border-[#DDE8E1] hover:text-[#18251F] hover:border-[#103F31]/40"

                      }`}

                    >

                      <span

                        className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"

                        style={{ backgroundColor: th.bgColor }}

                      />

                      <span>{th.name}</span>

                    </button>

                  );

                })}

              </div>

            </div>

          )}



          {/* CTA: Lanjut ke Hasil Akhir */}

          <div className="pt-3 mt-auto">

            <button

              type="button"

              onClick={onGoToResult}

              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#103F31] hover:bg-[#0B2E24] text-white py-3.5 px-4 text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer"

            >

              <span>Lanjut, Lihat Hasil Akhir</span>

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>

    );

  }



  // ── SCREEN F: FINAL RESULT SHOWCASE ──────────────────────────────────────

  if (phase === "result" && compositeUrl) {

    return (

      <div ref={ref} className="w-full flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 min-w-0">

        {/* Left: Prominent Final Strip Preview */}

        <div className="flex-1 flex flex-col items-center justify-center bg-[#EFEFEA] rounded-2xl p-4 sm:p-6 border border-[#DDE8E1] min-w-0 relative">

          {/* Tab Switcher: Strip Foto vs GIF Animasi */}

          <div className="absolute top-4 left-4 z-10 flex rounded-xl border border-[#DDE8E1] bg-white p-1 shadow-xs">

            <button

              type="button"

              onClick={() => setActiveTab("strip")}

              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${

                activeTab === "strip"

                  ? "bg-[#103F31] text-white shadow-xs"

                  : "text-[#68756D] hover:text-[#18251F]"

              }`}

            >

              <ImageIcon className="w-3.5 h-3.5" />

              <span>Foto Strip</span>

            </button>

            <button

              type="button"

              onClick={() => setActiveTab("gif")}

              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${

                activeTab === "gif"

                  ? "bg-[#103F31] text-white shadow-xs"

                  : "text-[#68756D] hover:text-[#18251F]"

              }`}

            >

              <Film className="w-3.5 h-3.5" />

              <span>Animasi GIF</span>

            </button>

          </div>



          {/* Centered Image */}

          <div className="w-full flex items-center justify-center max-h-[560px] sm:max-h-[620px] overflow-hidden py-4 pt-14">

            {activeTab === "strip" ? (

              <img

                src={compositeUrl}

                alt="Hasil Foto Photobooth"

                className="max-h-[520px] w-auto max-w-full object-contain rounded-xl shadow-xl border border-[#DDE8E1]"

              />

            ) : gifUrl ? (

              <img

                src={gifUrl}

                alt="Hasil Animasi GIF"

                className="max-h-[520px] w-auto max-w-full object-contain rounded-xl shadow-xl border border-[#DDE8E1]"

              />

            ) : (

              <div className="flex h-56 flex-col items-center justify-center gap-2 text-xs text-[#68756D]">

                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#103F31] border-t-transparent" />

                <span>Memproses animasi GIF...</span>

              </div>

            )}

          </div>

        </div>



        {/* Right: Export & Sharing Studio Hub */}

        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-3.5 bg-white p-5 rounded-2xl border border-[#DDE8E1] shadow-xs">

          <div>

            <div className="flex items-center gap-2 mb-1">

              <span className="text-[10px] font-semibold text-[#103F31] uppercase tracking-wider bg-[#103F31]/5 border border-[#103F31]/15 px-2 py-0.5 rounded-md">

                {layout.aspectRatioClass === "aspect-[1/3]" ? "2×6 Strip (1:3)" : "4×6 Card (2:3)"}

              </span>

              <span className="text-[10px] text-[#68756D]">300 DPI Siap Cetak</span>

            </div>

            <h2 className="text-lg font-semibold text-[#18251F]">Hasil Photobooth Studio</h2>

          </div>



          {/* Primary Action: Simpan Foto HD */}

          {activeTab === "strip" ? (

            <button

              type="button"

              onClick={onDownloadStrip}

              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#103F31] hover:bg-[#0B2E24] text-white py-3.5 px-4 text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer"

            >

              <Download className="w-4 h-4" />

              <span>Unduh Foto HD (JPG)</span>

            </button>

          ) : (

            <button

              type="button"

              onClick={onDownloadGif}

              disabled={!gifUrl}

              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#103F31] hover:bg-[#0B2E24] text-white py-3.5 px-4 text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"

            >

              <Download className="w-4 h-4" />

              <span>Unduh Animasi (GIF)</span>

            </button>

          )}



          {/* Secondary Actions: Cetak & Bagikan */}

          <div className="grid grid-cols-2 gap-2">

            <button

              type="button"

              onClick={onOpenThermalPrint}

              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] hover:bg-white text-[#18251F] py-2.5 px-3 text-xs font-semibold transition-all active:scale-98 cursor-pointer shadow-xs"

            >

              <Printer className="w-3.5 h-3.5 text-[#103F31]" />

              <span>Cetak Foto</span>

            </button>

            <button

              type="button"

              onClick={onOpenShareModal}

              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] hover:bg-white text-[#18251F] py-2.5 px-3 text-xs font-semibold transition-all active:scale-98 cursor-pointer shadow-xs"

            >

              <Share2 className="w-3.5 h-3.5 text-[#103F31]" />

              <span>Bagikan</span>

            </button>

          </div>



          {/* Integrated QR Download Card */}

          <QRBox

            phase={uploadPhase}

            uploadedUrl={uploadedUrl}

            qrCodeDataUrl={qrCodeDataUrl || null}

            uploadError={uploadError || null}

            onOpenGiantQR={onOpenGiantQR}

            onDownload={onDownloadStrip}

            onRetry={onRetryUpload}

          />



          {/* Footer Navigation: Edit & New Session */}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DDE8E1] mt-auto">

            <button

              type="button"

              onClick={onGoToCustomize}

              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-white hover:bg-[#F8F7F3] text-[#18251F] py-2.5 px-3 text-xs font-semibold transition-all active:scale-98 cursor-pointer"

            >

              <SlidersHorizontal className="w-3.5 h-3.5 text-[#68756D]" />

              <span>Ubah Frame</span>

            </button>

            <button

              type="button"

              onClick={onRetake}

              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-white hover:bg-[#F8F7F3] text-[#18251F] py-2.5 px-3 text-xs font-semibold transition-all active:scale-98 cursor-pointer"

            >

              <RotateCcw className="w-3.5 h-3.5 text-[#68756D]" />

              <span>Sesi Baru</span>

            </button>

          </div>

        </div>

      </div>

    );

  }



  // ── SCREEN C: LIVE SLOTS PANEL DURING SHOOTING ────────────────────────────

  return (

    <div className="flex flex-col gap-3 p-4 sm:p-5">

      <div className="flex items-center justify-between border-b border-[#DDE8E1] pb-2.5">

        <div>

          <span className="text-[10px] font-semibold text-[#103F31] uppercase tracking-wider">

            Format {layout.label}

          </span>

          <h3 className="text-xs sm:text-sm font-semibold text-[#18251F] leading-tight">

            {layout.sublabel}

          </h3>

        </div>

        <div className="flex items-center gap-1.5 bg-[#F0F4F1] border border-[#DDE8E1] px-2.5 py-1 rounded-full text-xs font-medium text-[#103F31]">

          <span className="h-1.5 w-1.5 rounded-full bg-[#27A35B] animate-pulse" />

          <span>Pose {photoCount + 1} dari {layout.numPhotos}</span>

        </div>

      </div>



      <div className={`grid gap-2.5 ${layout.numPhotos >= 4 ? "grid-cols-2" : "grid-cols-1"}`}>

        {Array.from({ length: layout.numPhotos }).map((_, i) => (

          <div

            key={i}

            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${

              photos[i]

                ? "border-[#103F31] bg-white shadow-xs"

                : i === photoCount

                ? "border-[#27A35B] ring-2 ring-[#27A35B]/25 bg-[#F8F7F3] animate-pulse"

                : "border-dashed border-[#DDE8E1] bg-[#F8F7F3]"

            }`}

            style={{ aspectRatio: "4/3" }}

          >

            {photos[i] ? (

              <>

                <img src={photos[i]} alt="" className="h-full w-full object-cover" />

                <button

                  type="button"

                  onClick={() => onRetakeSingleSlot(i)}

                  className="absolute top-1.5 right-1.5 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white w-7 h-7 shadow-xs transition-all active:scale-90 cursor-pointer"

                  title={`Ulangi Foto #${i + 1}`}

                >

                  <RotateCcw className="w-3.5 h-3.5" />

                </button>

                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">

                  Pose {i + 1}

                </span>

              </>

            ) : (

              <div className="flex h-full flex-col items-center justify-center gap-1 text-[#68756D]">

                {i === photoCount ? (

                  <span className="text-xs font-semibold text-[#27A35B]">Siap</span>

                ) : (

                  <>

                    <Camera className="w-4 h-4 text-[#CCD3CA]" />

                    <span className="text-[10px] text-[#8C9890]">Pose {i + 1}</span>

                  </>

                )}

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}





export default function PhotoboothPage() {

  const router = useRouter();

  const pathname = usePathname();



  const isTryOnRoute = pathname?.includes("/try-on") ?? false;

  const [phase, setPhase] = useState<BoothPhase>(isTryOnRoute ? "ready" : "frame-select");

  const [layout, setLayout] = useState<FrameLayout>(FRAME_LAYOUTS[0]);

  const [themeId, setThemeId] = useState<string>("classic-white");

  const [colorFilterId, setColorFilterId] = useState<string>("normal");

  const [photos, setPhotos] = useState<string[]>([]);

  const [currentSlot, setCurrentSlot] = useState(0);

  const [singleSlotRetake, setSingleSlotRetake] = useState<number | null>(null);

  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);

  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const [glassesIndex, setGlassesIndex] = useState(1);

  const [aiMode, setAiMode] = useState(isTryOnRoute);

  // arEnabled = whether the AR/glasses concept exists at all this session.

  // Distinct from aiMode (which only toggles the auto-recommendation badge

  // *within* AR mode) — this is the actual "Photobooth Biasa" switch set on

  // /start.

  const [arEnabled, setArEnabled] = useState(isTryOnRoute);

  const [beautyMode, setBeautyMode] = useState(true);

  const [lipstickMode, setLipstickMode] = useState(false);

  const [faceResult, setFaceResult] = useState<FaceShapeResult | null>(null);

  const [faceDetected, setFaceDetected] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [giantQRModalOpen, setGiantQRModalOpen] = useState(false);

  const [thermalPrintModalOpen, setThermalPrintModalOpen] = useState(false);

  const [timerSec, setTimerSec] = useState<TimerSec>(3);

  const [isScanning, setIsScanning] = useState(false);

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");

  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentPhotoIdRef = useRef<string | null>(null);

  const lastUploadedRef = useRef<{ composite: string; gif: string | null } | null>(null);

  const gifGenIdRef = useRef(0);

  const [scanComplete, setScanComplete] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [gestureTriggerEnabled, setGestureTriggerEnabled] = useState(true);

  const [devNoticeModalOpen, setDevNoticeModalOpen] = useState(false);

  const [renderMode3D, setRenderMode3D] = useState<boolean>(false);

  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const [userScaleMultiplier, setUserScaleMultiplier] = useState<number>(1.0);



  // Remote Smartphone WebRTC Camera States

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);

  const [remoteRoomId, setRemoteRoomId] = useState<string>("");

  const [remoteQrUrl, setRemoteQrUrl] = useState<string | null>(null);

  const [remoteConnected, setRemoteConnected] = useState(false);

  const peerReceiverRef = useRef<any>(null);



  const activeGlassesList = useMemo(() => {

    if (renderMode3D) {

      return manifest.filter((g) => g.id === "none" || !!g.model3D);

    }

    return manifest;

  }, [renderMode3D]);



  const glasses = manifest[glassesIndex] || manifest[0];

  const faceTrackerRef = useRef<FaceTrackerHandle>(null);



  // Track Virtual Try-On frame trial in Cloudflare R2 and IMI telemetry

  useEffect(() => {

    if (glasses?.name && glasses.id !== "none") {

      trackTryOn(glasses.name);

    }

  }, [glassesIndex, glasses?.name]);



  const openRemoteCameraModal = async () => {

    setIsRemoteModalOpen(true);

    let activeRoomId = remoteRoomId;

    if (!activeRoomId) {

      if (typeof window !== "undefined") {

        activeRoomId = localStorage.getItem("isy_photobooth_remote_room") || "";

      }

      if (!activeRoomId) {

        activeRoomId = "isy-" + Math.random().toString(36).substring(2, 8);

        if (typeof window !== "undefined") {

          localStorage.setItem("isy_photobooth_remote_room", activeRoomId);

        }

      }

      setRemoteRoomId(activeRoomId);

    }



    const origin = typeof window !== "undefined" ? window.location.origin : "https://optikiseeyou.com";

    const targetUrl = `${origin}/remote-camera?room=${activeRoomId}`;



    try {

      const qr = await QRCode.toDataURL(targetUrl, { width: 320, margin: 2 });

      setRemoteQrUrl(qr);

    } catch (err) {

      console.warn("QR generation failed", err);

    }



    if (!peerReceiverRef.current) {

      try {

        const { default: Peer } = await import("peerjs");

        const peer = new Peer(activeRoomId, {

          config: {

            iceServers: [

              { urls: "stun:stun.l.google.com:19302" },

              { urls: "stun:stun1.l.google.com:19302" },

            ],

          },

        });

        peerReceiverRef.current = peer;



        peer.on("call", (call: any) => {

          call.answer(); // Answer the call from smartphone

          call.on("stream", (stream: MediaStream) => {

            setRemoteStream(stream);

            setRemoteConnected(true);

            setIsRemoteModalOpen(false);

            showToast("Kamera Ponsel Nirkabel Terhubung!");

          });

          call.on("close", () => {

            setRemoteStream(null);

            setRemoteConnected(false);

            showToast("Kamera HP terputus");

          });

        });

      } catch (err) {

        console.error("Receiver PeerJS error:", err);

      }

    }

  };



  const disconnectRemoteCamera = () => {

    if (remoteStream) {

      remoteStream.getTracks().forEach((t) => t.stop());

    }

    if (peerReceiverRef.current) {

      peerReceiverRef.current.destroy();

      peerReceiverRef.current = null;

    }

    setRemoteStream(null);

    setRemoteConnected(false);

    showToast("Kembali ke Kamera Tablet");

  };



  useEffect(() => {

    async function loadCameras() {

      try {

        if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {

          const devs = await navigator.mediaDevices.enumerateDevices();

          const vDevs = devs.filter((d) => d.kind === "videoinput");

          setAvailableCameras(vDevs);

        }

      } catch (err) {

        console.warn("Could not enumerate cameras:", err);

      }

    }

    loadCameras();

    navigator.mediaDevices?.addEventListener?.("devicechange", loadCameras);

    return () => {

      navigator.mediaDevices?.removeEventListener?.("devicechange", loadCameras);

    };

  }, []);



  const handleSwitchCamera = useCallback(() => {

    if (availableCameras.length > 1) {

      const currentIdx = availableCameras.findIndex((c) => c.deviceId === selectedCameraId);

      const nextIdx = (currentIdx + 1) % availableCameras.length;

      const nextCam = availableCameras[nextIdx];

      setSelectedCameraId(nextCam.deviceId);

      const isBack =

        nextCam.label.toLowerCase().includes("back") ||

        nextCam.label.toLowerCase().includes("rear") ||

        nextCam.label.toLowerCase().includes("environment");

      setCameraFacing(isBack ? "environment" : "user");

      showToast(`Kamera: ${nextCam.label || `Kamera ${nextIdx + 1}`}`);

    } else {

      const nextFacing = cameraFacing === "user" ? "environment" : "user";

      setCameraFacing(nextFacing);

      showToast(nextFacing === "user" ? "Kamera Depan" : "Kamera Belakang / Luar");

    }

  }, [availableCameras, selectedCameraId, cameraFacing]);



  useEffect(() => {

    const isTryOnRoute = typeof window !== "undefined" && window.location.pathname.includes("/try-on");

    const params = new URLSearchParams(window.location.search);

    const modeParam = params.get("mode");

    const aiParam = params.get("ai");

    const glassesParam = params.get("glasses");



    if (glassesParam) {

      const idx = manifest.findIndex((g) => g.id === glassesParam);

      if (idx >= 0) setGlassesIndex(idx);

    }



    if (modeParam === "3d") {

      // 3D feature is closed / in repair - fallback to 2D AR and show dev notice modal

      setRenderMode3D(false);

      setDevNoticeModalOpen(true);

      setAiMode(true);

      setArEnabled(true);

      setLayout(FRAME_LAYOUTS[0]);

      setPhase("ready");

    } else if (isTryOnRoute || modeParam === "ar" || modeParam === "2d" || aiParam === "1") {

      setRenderMode3D(false);

      setAiMode(true);

      setArEnabled(true);

      setLayout(FRAME_LAYOUTS[0]);

      setPhase("ready");

    } else {

      setAiMode(false);

      setArEnabled(false);

      setPhase("frame-select");

    }

  }, [pathname]);



  const showToast = useCallback((msg: string) => {

    setToast(msg);

    setTimeout(() => setToast(null), 3000);

  }, []);



  const flashRef = useRef<HTMLDivElement>(null);





  const shooting =

    phase === "ready" ||

    phase === "countdown" ||

    phase === "flash" ||

    phase === "between" ||

    phase === "session-review";

  const showShutter = phase === "ready";

  const rightActive = phase !== "frame-select";



  const lastShapeRef = useRef<string | null>(null);



  /**

   * AI Match lock state.

   * - streak: consecutive frames with the same classified shape.

   * - locked: true once streak reaches AI_LOCK_FRAMES → classification freezes.

   * - shape:  shape string being tracked in the current streak.

   * Reset on: face disappears, user clicks Scan Ulang.

   */

  const AI_LOCK_FRAMES = 10;

  const aiLockRef = useRef<{ shape: string | null; streak: number; locked: boolean }>({

    shape: null,

    streak: 0,

    locked: false,

  });

  const [aiAnalyzing, setAiAnalyzing] = useState(false);



  const resetAiLock = useCallback(() => {

    aiLockRef.current = { shape: null, streak: 0, locked: false };

    setAiAnalyzing(false);

  }, []);



  const selectRandomMatchingGlassesForShape = useCallback((shape: FaceShape) => {

    const candidateIndices = manifest

      .map((g, i) => ({ g, i }))

      .filter(({ g }) => {

        const isOpen = !g.lensType || g.lensType === "open";

        const matchesMode = renderMode3D ? !!g.model3D : true;

        return matchesMode && isOpen && Array.isArray(g.recommendedFor) && g.recommendedFor.includes(shape);

      })

      .map(({ i }) => i);



    if (candidateIndices.length > 0) {

      const randomIdx = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];

      setGlassesIndex(randomIdx);

    } else {

      const fallbackIdx = manifest.findIndex((g) => {

        const matchesMode = renderMode3D ? !!g.model3D : true;

        return matchesMode && (!g.lensType || g.lensType === "open") && g.id !== "none";

      });

      if (fallbackIdx >= 0) setGlassesIndex(fallbackIdx);

    }

  }, [renderMode3D]);



  const handleFaceCountChange = (c: number) => {

    const detected = c > 0;

    setFaceDetected(detected);

    if (arEnabled && detected && !scanComplete && !isScanning) {

      setIsScanning(true);

    }

    // Reset AI lock when face disappears so next appearance re-classifies

    if (!detected) {

      resetAiLock();

      lastShapeRef.current = null;

    }

  };



  const handleReScan = useCallback(() => {

    if (!arEnabled) return;

    lastShapeRef.current = null;

    resetAiLock();

    setScanComplete(false);

    setIsScanning(true);

  }, [arEnabled, resetAiLock]);



  const downloadStrip = useCallback(async () => {

    if (!compositeUrl) return;

    showToast("Mengunduh foto ke galeri...");

    trackPhotoShare();

    const res = await downloadOrShareImage(compositeUrl, `iseeyou-foto-${Date.now()}.jpg`, "Optik I See You — Photo");

    if (res.success) {

      showToast("Foto berhasil diunduh dan tersimpan di galeri!");

    } else {

      showToast("Gagal mengunduh foto.");

    }

  }, [compositeUrl, showToast]);



  const downloadGif = useCallback(async () => {

    if (!gifUrl) return;

    showToast("Mengunduh GIF animasi ke galeri...");

    trackPhotoShare();

    const res = await downloadOrShareImage(gifUrl, `iseeyou-animasi-${Date.now()}.gif`, "Optik I See You — GIF");

    if (res.success) {

      showToast("GIF animasi berhasil diunduh dan tersimpan di galeri!");

    } else {

      showToast("Gagal mengunduh GIF.");

    }

  }, [gifUrl, showToast]);



  const resetSession = useCallback(() => {

    gifGenIdRef.current++;

    setScanComplete(false);

    setIsScanning(false);

    setPhotos([]);

    setCurrentSlot(0);

    setSingleSlotRetake(null);

    setCompositeUrl(null);

    setGifUrl(null);

    setUploadedUrl(null);

    setQrCodeDataUrl(null);

    setUploadError(null);

    setUploadPhase("idle");

    currentPhotoIdRef.current = null;

    lastUploadedRef.current = null;

  }, []);



  const handleLayoutSelect = useCallback((chosen: FrameLayout) => {

    setLayout(chosen);

    resetSession();

    const compatible = getCompatibleThemes(chosen);

    if (!compatible.some((t) => t.id === themeId)) {

      setThemeId(compatible[0]?.id || "classic-white");

    }

    setPhase("theme-select");

  }, [resetSession, themeId]);



  const handleRetake = useCallback(() => {

    resetSession();

    if (arEnabled) {

      setLayout(FRAME_LAYOUTS[0]);

      if (faceDetected) {

        setScanComplete(true);

      }

    }

    setPhase("ready");

  }, [resetSession, arEnabled, faceDetected]);



  // SELECTIVE RETAKE: Reshoot only one specific photo slot!

  const handleRetakeSingleSlot = useCallback((slotIdx: number) => {

    setSingleSlotRetake(slotIdx);

    setCurrentSlot(slotIdx);

    setPhase("countdown");

  }, []);



  const handleChangeLayout = useCallback(() => {

    resetSession();

    if (arEnabled) {

      setLayout(FRAME_LAYOUTS[0]);

      setPhase("ready");

    } else {

      setPhase("frame-select");

    }

  }, [resetSession, arEnabled]);



  const goHome = useCallback(() => router.push("/start"), [router]);



  const handleBackNav = useCallback(() => {

    if (arEnabled) {

      // Jalur Khusus Try-On Kacamata AR:

      // Dari layar hasil foto ("result" / "session-review" / "countdown") -> kembali ke kamera & katalog frame kacamata ("ready")

      // Dari kamera ("ready") -> kembali ke menu pilihan awal Try On vs Photobooth (/start)

      if (phase === "result" || phase === "session-review" || phase === "countdown") {

        setPhase("ready");

      } else {

        goHome();

      }

      return;

    }



    // Jalur Normal Photobooth Cetak Strip Foto:

    if (phase === "ready") {

      setPhase("theme-select");

    } else if (phase === "theme-select") {

      setPhase("frame-select");

    } else if (phase === "frame-select") {

      goHome();

    } else if (phase === "customize") {

      setPhase("result");

    } else if (phase === "result" || phase === "session-review") {

      setPhase("ready");

    } else {

      goHome();

    }

  }, [arEnabled, phase, goHome]);



  const handleCountdownComplete = useCallback(() => {

    const dataUrl = faceTrackerRef.current?.captureFrame() ?? null;

    if (!dataUrl) {

      setPhase("ready");

      return;

    }



    // Play Shutter Audio Effect!

    playShutterSound(soundEnabled);



    if (flashRef.current) {

      gsap.fromTo(flashRef.current, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "power2.out" });

    }



    const targetSlot = singleSlotRetake !== null ? singleSlotRetake : currentSlot;



    // Track the new photos state locally to check remaining slots

    let updatedPhotos: string[] = [];

    setPhotos((prev) => {

      const n = [...prev];

      n[targetSlot] = dataUrl;

      updatedPhotos = n;

      return n;

    });



    // If we were retaking a single slot

    if (singleSlotRetake !== null) {

      setSingleSlotRetake(null);

      const allFilled = Array.from({ length: layout.numPhotos }, (_, i) => updatedPhotos[i]).every(Boolean);

      if (allFilled) {

        setPhase("session-review");

      } else {

        const nextEmpty = Array.from({ length: layout.numPhotos }, (_, i) => i).find(i => !updatedPhotos[i]) ?? currentSlot + 1;

        setCurrentSlot(nextEmpty);

        setPhase("between");

      }

      return;

    }



    const nextSlot = currentSlot + 1;



    if (nextSlot < layout.numPhotos) {

      // Advance to next slot, enter automatic 1.2s transition pause before auto-countdown

      setCurrentSlot(nextSlot);

      setPhase("between");

    } else {

      // All photos in session completed!

      setCurrentSlot(nextSlot);

      if (arEnabled && layout.numPhotos === 1) {

        setPhase("compositing");

      } else {

        setPhase("session-review");

      }

    }

  }, [currentSlot, layout.numPhotos, singleSlotRetake, soundEnabled, arEnabled]);



  // Auto-progress from "between" phase to next photo's countdown after 1.2s pause

  useEffect(() => {

    if (phase !== "between") return;

    const timer = setTimeout(() => {

      setPhase("countdown");

    }, 1200);

    return () => clearTimeout(timer);

  }, [phase]);



  const handleStartSession = useCallback(() => {

    if (phase !== "ready") return;

    unlockAudio();

    resetSession();

    setCurrentSlot(0);

    setPhase("countdown");

  }, [phase, resetSession]);



  const handleGestureDetected = useCallback((gesture: string) => {

    if (phase === "ready" && gestureTriggerEnabled && gesture === "Open_Palm") {

      unlockAudio();

      resetSession();

      setCurrentSlot(0);

      setPhase("countdown");

      showToast("Gestur Telapak Tangan Terdeteksi! Bersiap...");

    }

  }, [phase, gestureTriggerEnabled, resetSession, showToast]);





  const generateGifForCurrentSession = useCallback(

    (currentThemeId: string, currentFilterId: string) => {

      if (!photos.length) return;

      const myId = ++gifGenIdRef.current;

      createAnimatedGif(photos, currentThemeId, currentFilterId)

        .then((gif) => {

          if (myId === gifGenIdRef.current) {

            setGifUrl(gif);

            if (currentPhotoIdRef.current) {

              uploadGifToR2(currentPhotoIdRef.current, gif).catch(() => {});

            }

          }

        })

        .catch((err) => {

          console.warn("GIF generation error:", err);

        });

    },

    [photos]

  );



  const handleSelectTheme = useCallback(

    (newThemeId: string) => {

      setThemeId(newThemeId);

      if (photos.length) {

        compositeFrame(layout, photos, newThemeId, colorFilterId).then((url) => {

          setCompositeUrl(url);

        });

        generateGifForCurrentSession(newThemeId, colorFilterId);

      }

    },

    [layout, photos, colorFilterId, generateGifForCurrentSession]

  );



  const handleSelectFilter = useCallback(

    (newFilterId: string) => {

      setColorFilterId(newFilterId);

      if (photos.length) {

        compositeFrame(layout, photos, themeId, newFilterId).then((url) => {

          setCompositeUrl(url);

        });

        generateGifForCurrentSession(themeId, newFilterId);

      }

    },

    [layout, photos, themeId, generateGifForCurrentSession]

  );



  // Composite strip & generate animated GIF when photos are ready

  useEffect(() => {

    if (phase !== "compositing") return;



    // Generate Instant QR Code ID at the earliest possible moment (0 ms delay)

    if (!currentPhotoIdRef.current) {

      const newId = generatePhotoId();

      currentPhotoIdRef.current = newId;

      generateInstantQR(newId).then(({ qrPageUrl, qrCodeDataUrl: qrData }) => {

        setUploadedUrl(qrPageUrl);

        setQrCodeDataUrl(qrData);

      }).catch((err) => console.warn("Instant QR error:", err));

    }



    if (arEnabled && photos[0]) {

      compositeArTryOnFrame(photos[0], glasses?.name).then((url) => {

        setCompositeUrl(url);

        setPhase("result");

        

      });

      return;

    }



    compositeFrame(layout, photos, themeId, colorFilterId).then((url) => {

      setCompositeUrl(url);

      // Masuk layar Kustomisasi dulu (bukan langsung result)

      setPhase("customize");

      

    });



    // Start background GIF encoding (runs uninterrupted through customize & result phases)

    generateGifForCurrentSession(themeId, colorFilterId);

  }, [phase, arEnabled, photos, glasses?.name, layout, themeId, colorFilterId, generateGifForCurrentSession]);



  // Decoupled Background Upload to Cloudflare R2 / Cloudinary

  const doUpload = useCallback(() => {

    if (phase !== "result" || !compositeUrl) return;

    // Skip upload jika compositeUrl dan gifUrl tidak berubah sejak upload terakhir

    // NEVER upload Try-On photos to Cloudflare R2 bucket.

    // Try-On photos are strictly for on-device fitting preview and direct local download.

    if (arEnabled) {

      setUploadPhase("idle");

      return;

    }



    if (

      lastUploadedRef.current?.composite === compositeUrl &&

      lastUploadedRef.current?.gif === (gifUrl || null) &&

      uploadPhase === "done"

    ) {

      return;

    }



    if (!currentPhotoIdRef.current) {

      currentPhotoIdRef.current = generatePhotoId();

    }

    const targetId = currentPhotoIdRef.current;



    // Ensure instant QR is generated immediately if not already set

    if (!qrCodeDataUrl) {

      generateInstantQR(targetId).then(({ qrPageUrl, qrCodeDataUrl: qrData }) => {

        setUploadedUrl(qrPageUrl);

        setQrCodeDataUrl(qrData);

      }).catch((err) => console.warn("Instant QR fallback error:", err));

    }



    setUploadPhase("uploading");

    setUploadError(null);



    uploadPhotoForQR(compositeUrl, gifUrl, targetId).then((result) => {

      if (result.ok) {

        setUploadedUrl(result.qrPageUrl);

        setQrCodeDataUrl(result.qrCodeDataUrl);

        setUploadPhase("done");

        lastUploadedRef.current = { composite: compositeUrl, gif: gifUrl || null };

      } else {

        console.warn("QR background upload:", result.error);

        setUploadError(result.error);

        setUploadPhase("error");

      }

    });

  }, [phase, compositeUrl, gifUrl, uploadPhase, qrCodeDataUrl]);



  useEffect(() => {

    if (phase !== "result" || !compositeUrl) return;

    doUpload();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [phase, compositeUrl, gifUrl]);



  const isPostCapture = phase === "customize" || phase === "result" || phase === "compositing";



  if (isPostCapture) {

    return (

      <main className="flex min-h-dvh w-full items-center justify-center bg-[#F8F7F3] p-2 sm:p-4 lg:p-6">

        <div className="relative flex min-h-[92vh] w-full max-w-6xl flex-col overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-[#DDE8E1] shadow-xl">

          {/* Studio Top Header */}

          <div className="flex shrink-0 items-center justify-between border-b border-[#DDE8E1] px-5 py-3.5 bg-white">

            <div className="flex items-center gap-3">

              <button

                type="button"

                onClick={() => {

                  if (phase === "result") setPhase("customize");

                  else if (phase === "customize") setPhase("session-review");

                  else setPhase("ready");

                }}

                className="flex items-center gap-1.5 rounded-full border border-[#DDE8E1] bg-[#F8F7F3] hover:bg-white text-[#18251F] px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer"

              >

                <ArrowLeft className="w-3.5 h-3.5 text-[#103F31]" />

                <span>

                  {phase === "result"

                    ? "Kembali ke Kustomisasi"

                    : phase === "customize"

                    ? "Kembali ke Review"

                    : "Kembali ke Kamera"}

                </span>

              </button>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#27A35B] animate-pulse" />

                <span className="text-xs font-semibold text-[#103F31]">

                  {phase === "result"

                    ? "Hasil Photobooth Studio"

                    : phase === "customize"

                    ? "Studio Kustomisasi Frame & Filter"

                    : "Memproses Komposisi..."}

                </span>

              </div>

            </div>

            <Image src="/logo.png" alt="Optik I See You" width={90} height={35} className="h-6 w-auto" priority />

          </div>



          {/* Dedicated Studio Content */}

          <div className="flex-1 flex overflow-y-auto">

            <StripPreview

              layout={layout}

              photos={photos}

              compositeUrl={compositeUrl}

              gifUrl={gifUrl}

              uploadedUrl={uploadedUrl}

              qrCodeDataUrl={qrCodeDataUrl}

              uploadError={uploadError}

              uploadPhase={uploadPhase}

              phase={phase}

              photoCount={currentSlot}

              selectedTheme={themeId}

              selectedFilter={colorFilterId}

              onSelectTheme={handleSelectTheme}

              onSelectFilter={handleSelectFilter}

              onOpenGiantQR={() => setGiantQRModalOpen(true)}

              onDownloadStrip={downloadStrip}

              onDownloadGif={downloadGif}

              onRetake={handleRetake}

              onChangeLayout={handleChangeLayout}

              onOpenShareModal={() => setShareModalOpen(true)}

              onOpenThermalPrint={() => setThermalPrintModalOpen(true)}

              onRetakeSingleSlot={handleRetakeSingleSlot}

              onRetryUpload={doUpload}

              onGoToResult={() => setPhase("result")}

              onGoToCustomize={() => setPhase("customize")}

              arGlassesName={arEnabled ? glasses?.name : undefined}

              isArMode={arEnabled}

            />

          </div>

        </div>



        {/* Global Result Modals */}

        {shareModalOpen && compositeUrl && (

          <ShareModal

            compositeUrl={compositeUrl}

            gifUrl={gifUrl}

            onClose={() => setShareModalOpen(false)}

            onToast={showToast}

          />

        )}

        {giantQRModalOpen && uploadedUrl && (

          <GiantQRModal

            uploadedUrl={uploadedUrl}

            qrCodeDataUrl={qrCodeDataUrl}

            onClose={() => setGiantQRModalOpen(false)}

          />

        )}

        {thermalPrintModalOpen && (

          <ThermalPrintModal

            isOpen={thermalPrintModalOpen}

            onClose={() => setThermalPrintModalOpen(false)}

            imageDataUrl={compositeUrl || photos[0]}

          />

        )}

        {toast && (

          <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50">

            <div className="rounded-full bg-[#103F31] px-5 py-2.5 text-xs font-semibold text-white shadow-lg">

              {toast}

            </div>

          </div>

        )}

      </main>

    );

  }



 return (

 <main className="flex min-h-dvh w-full items-center justify-center bg-[#F8F7F3] lg:p-6">

 <div className="

 relative flex h-dvh w-full flex-col overflow-hidden bg-white

 lg:h-[740px] lg:max-h-[94svh] lg:w-[1020px] lg:max-w-[96vw]

 lg:flex-row lg:rounded-[24px] lg:border lg:border-[#DDE8E1] lg:shadow-2xl

 ">



 {/* ══ LEFT — Camera Panel ══════════════════════════════════════════════ */}

 <div className="

  relative flex flex-col overflow-hidden bg-isy-mist

  h-[44dvh] min-h-[250px] max-h-[48dvh] shrink-0

  lg:h-full lg:w-[56%] lg:max-h-none lg:min-h-0 lg:border-r lg:border-isy-line

  ">

 {rightActive && (

 <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-3 lg:hidden">

 <BackBtn onClick={handleBackNav} />

 <Image src="/logo.png" alt="Optik I See You" width={80} height={31} className="h-6 w-auto drop-shadow" />

 {shooting && (

 <div className="flex gap-1">

 {Array.from({ length: layout.numPhotos }).map((_, i) => (

 <span key={i} className={`h-2 w-2 rounded-full transition-all ${

 i < photos.length ? "bg-isy-green-bright scale-110" :

 i === currentSlot && phase === "countdown" ? "ring-2 ring-isy-green-bright bg-isy-green-bright/30 animate-pulse" :

 "bg-white/40"

 }`} />

 ))}

 </div>

 )}

 </div>

 )}



 <div className="relative h-full w-full overflow-hidden">

 <FaceTracker

  ref={faceTrackerRef}

  glassesSrc={!renderMode3D && arEnabled && glasses.file ? `/glasses/${glasses.file}` : ""}

  fitWidthRatio={renderMode3D && glasses?.model3D?.fitWidthRatio ? glasses.model3D.fitWidthRatio : glasses.fitWidthRatio}

  numFaces={layout.numPhotos}

  beautyMode={beautyMode}

  lipstickMode={lipstickMode}

  facingMode={cameraFacing}

  deviceId={selectedCameraId || undefined}

  customStream={remoteStream}

  gestureEnabled={gestureTriggerEnabled && phase === "ready"}

  onGestureDetected={handleGestureDetected}

  scanIntro={isScanning}

  showFaceGuide={false}

  faceResult={faceResult}

  renderMode={renderMode3D && glasses?.model3D ? "3d" : "2d"}

  model3DSrc={glasses?.model3D?.glbFile ? (glasses.model3D.glbFile.startsWith("http") ? glasses.model3D.glbFile : `/glasses/${glasses.model3D.glbFile}`) : undefined}

  frameWidthMm={glasses?.model3D?.frameWidthMm}

  bridgeMm={glasses?.model3D?.bridgeMm}

  templeMm={glasses?.model3D?.templeMm}

  frameColor={glasses?.model3D?.frameColor || glasses?.color}

  metalColor={glasses?.model3D?.metalColor}

  isTinted={glasses?.model3D?.isTinted || glasses?.lensType === "tinted"}

  style={glasses?.model3D?.style || glasses?.style}

  yOffsetRatio={glasses?.model3D?.yOffsetRatio}

  pivotOffset={glasses?.model3D?.pivotOffset}

  rotationOffsetDeg={glasses?.model3D?.rotationOffsetDeg}

  templeFadeStart={glasses?.model3D?.templeFadeStart}

  trackingEnabled={phase === "ready" || phase === "countdown" || phase === "flash" || phase === "between" || phase === "session-review"}

  onScanIntroComplete={() => {

    setIsScanning(false);

    setScanComplete(true);

  }}

  onFaceCountChange={handleFaceCountChange}

  ipdScaleRef={((glasses as any).ipdScaleRef ?? 1.0) * userScaleMultiplier}

  onLandmarksChange={(lm) => {

  if (!arEnabled || !aiMode || !lm) return;

  // Once locked, skip re-classification until explicitly reset

  if (aiLockRef.current.locked) return;



  const r = detectFaceShape(lm);

  if (r.confidence <= 0.3) return;



  // Accumulate streak of same shape

  const lock = aiLockRef.current;

  if (lock.shape === r.shape) {

    lock.streak++;

  } else {

    lock.shape = r.shape;

    lock.streak = 1;

    // Show analyzing indicator when shape changes mid-streak

    if (!aiAnalyzing) setAiAnalyzing(true);

  }



  // Still building streak — show analyzing badge, don't commit result yet

  if (lock.streak < AI_LOCK_FRAMES) {

    if (!aiAnalyzing) setAiAnalyzing(true);

    return;

  }



  // Streak reached — lock the result

  lock.locked = true;

  setAiAnalyzing(false);

  setFaceResult(r);

  if (lastShapeRef.current !== r.shape) {

    lastShapeRef.current = r.shape;

    selectRandomMatchingGlassesForShape(r.shape);

  }

  }}

  />



  {/* "between" phase: Auto-progress banner between photo captures */}

  {phase === "between" && (

    <div className="absolute inset-x-4 top-16 z-30 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">

      <div className="flex items-center gap-3 rounded-2xl bg-black/85 px-5 py-3 text-white backdrop-blur-md shadow-2xl border border-white/20">

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#103F31] text-white animate-bounce">
          <Check className="w-4 h-4 text-white" />
        </span>

        <div className="text-left">

          <p className="text-xs font-black text-isy-green-bright">

            Foto {currentSlot} dari {layout.numPhotos} Tersimpan!

          </p>

          <p className="text-[11px] font-semibold text-white/90">

            Bersiap untuk Foto ke-{currentSlot + 1}...

          </p>

        </div>

      </div>

    </div>

  )}



 <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: 0 }} aria-hidden />



 {phase === "countdown" && (

    <Countdown from={timerSec} duration={1} soundEnabled={soundEnabled} onComplete={handleCountdownComplete} />

 )}



 {/* Capture button area — anchored at bottom of camera */}

 {shooting && phase === "ready" && (

  <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col items-center px-4 pb-4 pt-2 bg-gradient-to-t from-black/75 via-black/35 to-transparent gap-2">

    {/* Clean Minimalist Instruction Hint with Quick Toggle */}

    <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-[11px] text-white/90 border border-white/10 shadow-sm animate-in fade-in duration-300">

      <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-ping" />

      <span className="font-medium">

        {gestureTriggerEnabled

          ? "Tunjukkan telapak tangan ke kamera atau tekan tombol Mulai"

          : "Tekan tombol Mulai Foto untuk mengambil gambar"}

      </span>

      <button

        type="button"

        onClick={() => setGestureTriggerEnabled((v) => !v)}

        className={`ml-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${

          gestureTriggerEnabled

            ? "bg-amber-400 text-black border border-amber-300 hover:bg-amber-300"

            : "bg-white/15 text-white/70 border border-white/20 hover:bg-white/25"

        }`}

        title={gestureTriggerEnabled ? "Nonaktifkan Gestur Tangan" : "Aktifkan Gestur Tangan"}

      >

        <Hand className="w-2.5 h-2.5" />

        <span>{gestureTriggerEnabled ? "Gestur ON" : "Gestur OFF"}</span>

      </button>

    </div>



  {/* Main capture button */}

  <button

    id="shutter-btn"

    onClick={handleStartSession}

    disabled={!showShutter || (arEnabled && !scanComplete)}

    className="group relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-[#103F31] hover:bg-[#0B2E24] py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-[#103F31]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"

  >

    <span className="relative flex items-center justify-center gap-2">

      <Camera className="w-4 h-4" />

      <span>{arEnabled ? "Try On dan Ambil Foto" : "Mulai Ambil Foto"}</span>

    </span>

  </button>

  </div>

 )}

 </div>

 </div>



 {/* ══ RIGHT — Controls + Preview Panel ════════════════════════════════ */}

 <div className="flex flex-1 flex-col overflow-y-auto bg-white lg:w-[44%] lg:flex-none">



 <div className="hidden lg:flex shrink-0 items-center justify-between border-b border-isy-line px-5 py-3">

 <BackBtn onClick={handleBackNav} />

 <Image src="/logo.png" alt="Optik I See You" width={100} height={39} className="h-7 w-auto" />

 {shooting && (

 <div className="flex gap-1">

 {Array.from({ length: layout.numPhotos }).map((_, i) => (

 <span key={i} className={`h-2 w-2 rounded-full transition-all duration-300 ${

 i < photos.length ? "bg-isy-green-bright scale-110" :

 i === currentSlot && phase === "countdown" ? "ring-2 ring-isy-green-bright bg-isy-green-bright/30 animate-pulse" :

 "bg-isy-line"

 }`} />

 ))}

 </div>

 )}

 </div>



 {shooting && (

 <div className="flex shrink-0 flex-col gap-3 border-b border-isy-line px-4 py-3">



 <div className="flex items-center justify-between flex-wrap gap-2">

 {arEnabled && (

 <div className="flex items-center gap-2 flex-wrap">

 <AIModeToggle on={aiMode} onToggle={() => setAiMode((v) => !v)} />

 {aiMode && <FaceHUD result={faceResult} analyzing={aiAnalyzing} />}

 <button

 onClick={handleReScan}

 title="Scan Ulang Wajah"

 className="flex items-center gap-1 rounded-full border border-isy-line bg-isy-mist/70 px-2.5 py-1 text-[10px] font-extrabold text-isy-green-deep hover:border-isy-green-bright hover:bg-white hover:text-isy-green-bright transition-all active:scale-95 shadow-2xs"

 >

 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">

 <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />

 </svg>

 Scan Ulang

 </button>

 </div>

 )}

 </div>



 <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">

   <div className="flex items-center gap-1.5 shrink-0">

   <button

   onClick={() => setBeautyMode((v) => !v)}

   className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 shrink-0

   ${beautyMode ? "bg-isy-green-bright/15 text-isy-green-deep border border-isy-green-bright/40" : "border border-isy-line text-isy-ink/50"}`}

   >

   AI Mulus

   </button>

   <button

   onClick={() => setLipstickMode((v) => !v)}

   className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 shrink-0

   ${lipstickMode ? "bg-pink-100 text-pink-700 border border-pink-300" : "border border-isy-line text-isy-ink/50"}`}

   >

   Lipstik

   </button>

   <button

      onClick={() => setSoundEnabled((v) => !v)}

      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all active:scale-95 shrink-0 cursor-pointer ${

        soundEnabled

          ? "bg-[#103F31]/10 text-[#103F31] border border-[#103F31]/30"

          : "bg-gray-100 text-gray-400 border border-gray-200"

      }`}

      title={soundEnabled ? "Suara Countdown dan Jepret ON" : "Suara Muted"}

    >

      {soundEnabled ? (

        <Volume2 className="w-3 h-3 text-[#103F31]" />

      ) : (

        <VolumeX className="w-3 h-3 text-gray-400" />

      )}

      <span>{soundEnabled ? "Suara ON" : "Mute"}</span>

    </button>

    <button

      onClick={() => setGestureTriggerEnabled((v) => !v)}

      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all active:scale-95 border shrink-0 cursor-pointer ${

        gestureTriggerEnabled

          ? "bg-amber-500/15 text-amber-800 border-amber-500/40"

          : "border-[#DDE8E1] text-[#68756D] bg-white hover:bg-[#F8F7F3]"

      }`}

      title={gestureTriggerEnabled ? "Gestur Tangan Aktif" : "Gestur Tangan Nonaktif"}

    >

      <Hand className="w-3 h-3" />

      <span>{gestureTriggerEnabled ? "Gestur ON" : "Gestur OFF"}</span>

    </button>

    <button

      onClick={handleSwitchCamera}

      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all active:scale-95 border shrink-0 cursor-pointer ${

        cameraFacing === "environment"

          ? "bg-[#103F31]/10 text-[#103F31] border-[#103F31]/30"

          : "border-[#DDE8E1] text-[#18251F] bg-white hover:bg-[#F8F7F3]"

      }`}

      title="Ganti Kamera"

    >

      <RefreshCw className="w-3 h-3 text-[#103F31]" />

      <span>{cameraFacing === "user" ? "Ganti Kamera" : "Kamera Belakang"}</span>

    </button>

    <button

      onClick={remoteConnected ? disconnectRemoteCamera : openRemoteCameraModal}

      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all active:scale-95 border shrink-0 cursor-pointer ${

        remoteConnected

          ? "bg-[#103F31] text-white border-[#103F31] shadow-xs"

          : "border-[#DDE8E1] text-[#18251F] bg-white hover:bg-[#F8F7F3]"

      }`}

      title={remoteConnected ? "Kamera Nirkabel Terhubung" : "Hubungkan Kamera Nirkabel via QR Code"}

    >

      <Smartphone className={`w-3 h-3 ${remoteConnected ? "text-white" : "text-[#103F31]"}`} />

      <span>{remoteConnected ? "Kamera HP Aktif" : "Kamera HP (QR)"}</span>

    </button>

  </div>

  <div className="shrink-0">

    <TimerChips

      value={timerSec}

      onChange={setTimerSec}

      disabled={phase !== "ready"}

    />

  </div>

  </div>



  {arEnabled && (

    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">

      {activeGlassesList.map((g) => {

        const isSelected = glasses.id === g.id;

        return (

          <button

            key={g.id}

            onClick={() => {

              const realIdx = manifest.findIndex((item) => item.id === g.id);

              if (realIdx >= 0) setGlassesIndex(realIdx);

              setAiMode(false);

            }}

            className={`relative shrink-0 flex flex-col items-center gap-0.5 rounded-xl border px-2.5 pt-1.5 pb-1 text-[9px] font-semibold transition-all active:scale-95 cursor-pointer

            ${isSelected

              ? "border-isy-green-bright bg-isy-green-bright/10 text-isy-green-deep shadow-md"

              : "border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright/50"}`}

          >

            {renderMode3D && g.model3D ? (

              <span className="absolute -top-1.5 -left-1 rounded-full bg-emerald-700 px-1 py-0.2 text-[7px] font-black text-white shadow-2xs">

                3D

              </span>

            ) : !renderMode3D && g.model3D ? (

              <span className="absolute -top-1.5 -left-1 rounded-full bg-emerald-700/80 px-1 py-0.2 text-[7px] font-black text-white shadow-2xs">

                3D

              </span>

            ) : null}

            {aiMode && faceResult?.recommendedGlassesId === g.id && (

              <span className="absolute -top-2 -right-1 rounded-full bg-isy-green-bright px-1 py-0.5 text-[7px] font-black text-white">AI</span>

            )}

            <div className="h-2 w-2 rounded-full border border-black/10" style={{ backgroundColor: g.color }} />

            <span className="max-w-[52px] text-center leading-tight">{renderMode3D && g.model3D?.name ? g.model3D.name : g.name}</span>

          </button>

        );

      })}

    </div>

  )}



  {arEnabled && (

    <div className="flex items-center justify-between py-1.5 px-2.5 bg-isy-mist/60 rounded-xl border border-isy-line/80 shadow-2xs">

      <span className="text-[10px] font-bold text-isy-ink/70 uppercase tracking-wider">Ukuran Frame:</span>

      <div className="flex items-center gap-1.5">

        <button

          type="button"

          onClick={() => setUserScaleMultiplier((prev) => Math.max(0.85, parseFloat((prev - 0.05).toFixed(2))))}

          className="h-6 w-6 rounded-lg bg-white border border-isy-line flex items-center justify-center text-xs font-black text-isy-green-deep hover:bg-isy-green-bright hover:text-white transition-all cursor-pointer active:scale-90 shadow-2xs"

          title="Perkecil Ukuran"

        >

          -

        </button>

        <span className="text-[11px] font-black text-isy-green-deep min-w-[36px] text-center">

          {Math.round(userScaleMultiplier * 100)}%

        </span>

        <button

          type="button"

          onClick={() => setUserScaleMultiplier((prev) => Math.min(1.4, parseFloat((prev + 0.05).toFixed(2))))}

          className="h-6 w-6 rounded-lg bg-white border border-isy-line flex items-center justify-center text-xs font-black text-isy-green-deep hover:bg-isy-green-bright hover:text-white transition-all cursor-pointer active:scale-90 shadow-2xs"

          title="Perbesar Ukuran"

        >

          +

        </button>

        {userScaleMultiplier !== 1.0 && (

          <button

            type="button"

            onClick={() => setUserScaleMultiplier(1.0)}

            className="text-[9px] font-bold text-isy-ink/50 hover:text-isy-green-deep underline ml-1 cursor-pointer"

          >

            Reset

          </button>

        )}

      </div>

    </div>

  )}



 <div className="flex items-center justify-between text-xs">

 {!arEnabled ? (

   <div className="flex items-center gap-2">

     <button onClick={handleChangeLayout} className="font-semibold text-isy-ink/50 hover:text-isy-green-deep transition-colors">

       Ganti Layout

     </button>

     <span className="text-isy-ink/30">•</span>

     <button onClick={() => setPhase("theme-select")} className="font-semibold text-isy-green-bright hover:text-isy-green-deep transition-colors">

       Ganti Template

     </button>

   </div>

 ) : (

 <span className="text-[11px] font-bold text-isy-green-bright">Try-On 1x Foto</span>

 )}

 <button onClick={handleRetake} className="text-isy-ink/40 hover:text-red-500 transition-colors">

 Ulangi

 </button>

 </div>

 </div>

 )}



 {rightActive && (

          <StripPreview

            layout={layout}

            photos={photos}

            compositeUrl={compositeUrl}

            gifUrl={gifUrl}

            uploadedUrl={uploadedUrl}

            qrCodeDataUrl={qrCodeDataUrl}

            uploadError={uploadError}

            uploadPhase={uploadPhase}

            phase={phase}

            photoCount={currentSlot}

            selectedTheme={themeId}

            selectedFilter={colorFilterId}

            onSelectTheme={handleSelectTheme}

            onSelectFilter={handleSelectFilter}

            onOpenGiantQR={() => setGiantQRModalOpen(true)}

            onDownloadStrip={downloadStrip}

            onDownloadGif={downloadGif}

            onRetake={handleRetake}

            onChangeLayout={handleChangeLayout}

            onOpenShareModal={() => setShareModalOpen(true)}

            onOpenThermalPrint={() => setThermalPrintModalOpen(true)}

            onRetakeSingleSlot={handleRetakeSingleSlot}

            onRetryUpload={doUpload}

            onGoToResult={() => setPhase("result")}

            onGoToCustomize={() => setPhase("customize")}

            arGlassesName={arEnabled ? glasses?.name : undefined}

            isArMode={arEnabled}

          />

 )}

 </div>



 {/* Overlays (Hanya untuk Photobooth Strip, bukan Try-On AR) */}

      {!arEnabled && phase === "frame-select" && <FramePicker onSelect={handleLayoutSelect} onBack={goHome} />}

      {!arEnabled && phase === "theme-select" && (

        <FrameThemePicker

          layout={layout}

          selectedThemeId={themeId}

          onSelect={(tId) => {

            setThemeId(tId);

            if (photos.filter(Boolean).length >= layout.numPhotos) {

              setPhase("compositing");

            } else {

              setPhase("ready");

            }

          }}

          onBack={() => setPhase(photos.filter(Boolean).length >= layout.numPhotos ? "session-review" : "frame-select")}

        />

      )}



      {/* "session-review" phase: Screen D - Studio Review Modal */}

      {phase === "session-review" && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">

          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#DDE8E1] text-center space-y-4 animate-in zoom-in-95 duration-200">

            {/* Header */}

            <div className="space-y-1">

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#103F31]/10 text-[#103F31] text-xs font-semibold uppercase tracking-wider">

                <CheckCircle2 className="w-3.5 h-3.5 text-[#27A35B]" />

                Sesi Foto Selesai ({layout.numPhotos} Pose)

              </span>

              <h3 className="text-xl sm:text-2xl font-semibold text-[#18251F]">

                Semua Pose Berhasil Diambil

              </h3>

              <p className="text-xs sm:text-sm text-[#68756D] max-w-md mx-auto">

                Pilih <strong className="text-[#103F31]">Ulang Pose</strong> jika ingin memperbaiki pose tertentu, atau lanjutkan untuk kustomisasi frame:

              </p>

            </div>



            {/* Photo Preview Grid with Individual Retake Buttons */}

            <div className={`grid gap-3 my-2 max-h-[46vh] overflow-y-auto p-1 ${

              layout.numPhotos === 1 ? "grid-cols-1 max-w-[220px] mx-auto" :

              layout.numPhotos === 2 ? "grid-cols-2 max-w-md mx-auto" :

              layout.numPhotos === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"

            }`}>

              {photos.slice(0, layout.numPhotos).map((photoSrc, idx) => (

                <div

                  key={idx}

                  className="relative flex flex-col rounded-2xl overflow-hidden border border-[#DDE8E1] bg-white shadow-xs transition-all hover:border-[#103F31]/60"

                >

                  <div className="relative aspect-[3/4] overflow-hidden bg-black/5">

                    {photoSrc ? (

                      /* eslint-disable-next-line @next/next/no-img-element */

                      <img src={photoSrc} alt={`Pose ${idx + 1}`} className="h-full w-full object-cover" />

                    ) : (

                      <div className="flex h-full items-center justify-center text-xs text-[#68756D]">

                        Slot {idx + 1}

                      </div>

                    )}

                    <span className="absolute top-1.5 left-1.5 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[9px] font-semibold text-white">

                      Pose {idx + 1}

                    </span>

                  </div>



                  {/* Single Slot Retake Button */}

                  <button

                    onClick={() => {

                      unlockAudio();

                      handleRetakeSingleSlot(idx);

                    }}

                    className="w-full flex items-center justify-center gap-1.5 py-2 px-1 bg-[#F8F7F3] hover:bg-[#103F31] hover:text-white text-[#103F31] text-[11px] font-semibold transition-all border-t border-[#DDE8E1] active:scale-95 cursor-pointer"

                    title={`Ambil ulang Pose ${idx + 1} saja`}

                  >

                    <RotateCcw className="w-3 h-3" />

                    <span>Ulang Pose {idx + 1}</span>

                  </button>

                </div>

              ))}

            </div>



            {/* Actions: Retake All vs Ganti Layout vs Ganti Tema vs Lanjut */}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">

              <button

                onClick={() => {

                  unlockAudio();

                  handleRetake();

                }}

                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] hover:bg-white text-[#18251F] font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"

              >

                <RotateCcw className="w-3.5 h-3.5 text-[#68756D]" />

                <span>Ulang Semua</span>

              </button>



              <button

                onClick={handleChangeLayout}

                className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border border-[#DDE8E1] bg-white hover:bg-[#F8F7F3] text-[#18251F] font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"

                title="Ganti format jumlah foto strip"

              >

                <Layers className="w-3.5 h-3.5 text-[#68756D]" />

                <span>Ganti Layout</span>

              </button>



              <button

                onClick={() => setPhase("theme-select")}

                className="inline-flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl border border-[#DDE8E1] bg-white hover:bg-[#F8F7F3] text-[#103F31] font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"

              >

                <ImageIcon className="w-3.5 h-3.5 text-[#103F31]" />

                <span>Ganti Tema</span>

              </button>



              <button

                onClick={() => setPhase("compositing")}

                className="flex-[1.4] inline-flex items-center justify-center gap-2 rounded-xl bg-[#103F31] hover:bg-[#0B2E24] py-3 px-5 text-xs sm:text-sm font-semibold text-white shadow-md active:scale-95 transition-all cursor-pointer"

              >

                <span>Lanjut ke Kustomisasi</span>

                <ArrowRight className="w-4 h-4" />

              </button>

            </div>

          </div>

        </div>

      )}



      {shareModalOpen && compositeUrl && (

        <ShareModal compositeUrl={compositeUrl} gifUrl={gifUrl} onClose={() => setShareModalOpen(false)} onToast={showToast} />

      )}

      {giantQRModalOpen && uploadedUrl && (

        <GiantQRModal

          uploadedUrl={uploadedUrl}

          qrCodeDataUrl={qrCodeDataUrl}

          onClose={() => setGiantQRModalOpen(false)}

        />

      )}

      {thermalPrintModalOpen && (

        <ThermalPrintModal

          isOpen={thermalPrintModalOpen}

          onClose={() => setThermalPrintModalOpen(false)}

          imageDataUrl={compositeUrl || photos[0]}

        />

      )}

      {/* 3D Development Notice Modal */}

      {devNoticeModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">

          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#DDE8E1] text-center space-y-5 animate-in zoom-in-95 duration-200">

            <button

              onClick={() => setDevNoticeModalOpen(false)}

              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#F8F7F3] flex items-center justify-center text-[#68756D] hover:text-[#18251F] hover:bg-[#DDE8E1] transition-all cursor-pointer"

            >

              <X className="w-4 h-4" />

            </button>



            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">

              <AlertTriangle className="w-7 h-7 text-amber-600" />

            </div>



            <div className="space-y-2">

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold uppercase tracking-wider">

                Sedang Dalam Pengembangan

              </span>

              <h3 className="text-xl font-semibold text-[#18251F]">

                Fitur Try-On 3D Segera Hadir

              </h3>

              <p className="text-xs sm:text-sm text-[#68756D] leading-relaxed pt-1">

                Pengalaman fitting kacamata 3D Real-Time saat ini sedang dalam proses riset dan kalibrasi presisi frame oleh tim Optik I See You.

              </p>

              <p className="text-xs text-[#103F31] font-medium bg-[#F8F7F3] p-3 rounded-xl border border-[#DDE8E1]">

                Disarankan menggunakan Try-On 2D dan Photobooth yang sudah siap dengan katalog lengkap dan cetak foto strip.

              </p>

            </div>



            <div className="pt-2 flex flex-col gap-2.5">

              <button

                onClick={() => {

                  setDevNoticeModalOpen(false);

                  router.push("/photobooth?mode=ar");

                }}

                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#103F31] text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-[#0B2E24] active:scale-[0.98] transition-all cursor-pointer"

              >

                <span>Buka Try-On AR 2D</span>

              </button>

              <button

                onClick={() => {

                  setDevNoticeModalOpen(false);

                  router.push("/try-on");

                }}

                className="w-full py-2 text-xs font-semibold text-[#68756D] hover:text-[#18251F] transition-colors cursor-pointer"

              >

                Kembali ke Menu

              </button>

            </div>

          </div>

        </div>

      )}



      {/* Remote Camera QR Modal */}

      {isRemoteModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">

          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#DDE8E1] text-center space-y-4 animate-in zoom-in-95 duration-200">

            <button

              onClick={() => setIsRemoteModalOpen(false)}

              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#F8F7F3] flex items-center justify-center text-[#68756D] hover:text-[#18251F] hover:bg-[#DDE8E1] transition-all cursor-pointer"

            >

              <X className="w-4 h-4" />

            </button>



            <div className="space-y-1">

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#103F31]/10 text-[#103F31] text-[11px] font-semibold uppercase tracking-wider">

                <Smartphone className="w-3.5 h-3.5 text-[#103F31]" />

                Kamera Nirkabel

              </span>

              <h3 className="text-lg font-semibold text-[#18251F]">

                Scan QR dengan Ponsel

              </h3>

              <p className="text-xs text-[#68756D]">

                Gunakan kamera ponsel sebagai kamera eksternal photobooth.

              </p>

            </div>



            {/* QR Code Container */}

            <div className="mx-auto flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8F7F3] border border-[#DDE8E1]">

              {remoteQrUrl ? (

                <img

                  src={remoteQrUrl}

                  alt="Scan QR Kamera HP"

                  className="w-52 h-52 rounded-xl shadow-xs object-contain"

                />

              ) : (

                <div className="w-52 h-52 flex items-center justify-center text-xs text-[#68756D] animate-pulse">

                  Menyiapkan QR Code...

                </div>

              )}

            </div>



            <div className="text-left bg-[#103F31]/5 p-3.5 rounded-2xl border border-[#103F31]/15 space-y-1.5 text-[11px] text-[#18251F]">

              <p className="font-semibold flex items-center gap-1.5">

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#103F31] text-[9px] font-bold text-white">1</span>

                Buka Kamera HP <ArrowRight className="w-3 h-3 text-[#103F31] inline" /> Scan QR di atas

              </p>

              <p className="font-semibold flex items-center gap-1.5">

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#103F31] text-[9px] font-bold text-white">2</span>

                Buka tautan dan izinkan akses kamera

              </p>

              <p className="text-[10px] text-[#68756D] pt-0.5">

                Kamera ponsel akan otomatis terhubung ke sistem photobooth.

              </p>

            </div>



            <button

              onClick={() => setIsRemoteModalOpen(false)}

              className="w-full py-2.5 rounded-xl border border-[#DDE8E1] bg-white hover:bg-[#F8F7F3] text-xs font-semibold text-[#18251F] transition-all cursor-pointer"

            >

              Tutup

            </button>

          </div>

        </div>

      )}

      {toast && (

        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-50">

          <div className="rounded-full bg-isy-green-deep px-5 py-2 text-xs font-semibold text-white shadow-lg">

            {toast}

          </div>

        </div>

      )}

    </div>

  </main>

  );

}

