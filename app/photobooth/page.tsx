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

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import confetti from "canvas-confetti";
import FaceTracker, { type FaceTrackerHandle } from "@/components/ar/FaceTracker";
import Countdown from "@/components/ui/Countdown";
import FramePicker from "@/components/ui/FramePicker";
import FrameThemePicker from "@/components/ui/FrameThemePicker";
import { FRAME_LAYOUTS, type FrameLayout } from "@/lib/frameLayouts";
import { compositeFrame, compositeArTryOnFrame, FRAME_THEMES, getCompatibleThemes, type FrameTheme } from "@/lib/frameCompositor";
import { COLOR_FILTERS, type ColorFilter } from "@/lib/colorFilters";
import { detectFaceShape, SHAPE_META, type FaceShapeResult, type FaceShape } from "@/lib/faceShape";
import { csWhatsappUrl, SHOPEE_STORE_URL } from "@/lib/branches";
import { uploadPhotoForQR } from "@/lib/uploadImage";
import { createAnimatedGif } from "@/lib/gifGenerator";
import { playShutterSound, unlockAudio } from "@/lib/soundEffects";
import ContactCSModal from "@/components/ui/ContactCSModal";
import ThermalPrintModal from "@/components/ui/ThermalPrintModal";
import { downloadOrShareImage } from "@/lib/saveImage";
import manifestRaw from "@/public/glasses/manifest.json";

type BoothPhase =
 | "frame-select"
 | "theme-select"
 | "ready"
 | "countdown"
 | "flash"
 | "between"
 | "compositing"
 | "result";

type UploadPhase = "idle" | "uploading" | "done" | "error" | "no-key";
type ResultTab = "strip" | "gif";

interface GlassesMeta {
 id: string; name: string; file: string;
 fitWidthRatio: number; style: string;
 recommendedFor: string[]; color: string;
 lensType?: string;
}

const manifest = manifestRaw as GlassesMeta[];
const TIMER_OPTIONS = [3, 5, 10] as const;
type TimerSec = typeof TIMER_OPTIONS[number];

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-isy-line bg-white/90 px-3 py-1.5 text-xs font-bold text-isy-green-deep shadow-sm hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Kembali
    </button>
  );
}

function AIModeToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
 return (
 <button onClick={onToggle}
 className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide transition-all active:scale-95
 ${on ? "bg-isy-green-bright text-white shadow-md" : "border border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright"}`}>
 {on ? " AI Match" : " Manual"}
 </button>
 );
}

function FaceHUD({ result, analyzing }: { result: FaceShapeResult | null; analyzing?: boolean }) {
 if (analyzing) {
  return (
  <div className="flex items-center gap-1.5 text-xs text-isy-ink/50">
  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-isy-green-bright" />
  Menganalisis…
  </div>
  );
 }
 if (!result || result.confidence < 0.3) {
  return (
  <div className="flex items-center gap-1.5 text-xs text-isy-ink/40">
  <span className="h-1.5 w-1.5 rounded-full bg-isy-line" />
  Arahkan wajah ke kamera
  </div>
  );
 }
 const meta = SHAPE_META[result.shape];
 return (
  <div className="flex flex-col gap-0.5">
  <p className="text-xs font-black text-isy-green-deep leading-none">{meta.label}</p>
  <p className="text-[10px] text-isy-ink/50 leading-none"> {meta.style}</p>
  </div>
 );
}

function TimerChips({
 value, onChange, disabled,
}: { value: TimerSec; onChange: (v: TimerSec) => void; disabled: boolean }) {
 return (
 <div className="flex items-center gap-1.5">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-isy-ink/40">
 <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
 </svg>
 {TIMER_OPTIONS.map((t) => (
 <button
 key={t}
 onClick={() => onChange(t)}
 disabled={disabled}
 className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-40
 ${value === t
 ? "bg-isy-green-bright text-white shadow-sm"
 : "border border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright"
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
    `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&color=116B3C&data=${encodeURIComponent(
      uploadedUrl
    )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4 border border-isy-green-bright/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"
        >
          ✕
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-green-bright/10 px-3 py-1 text-xs font-bold text-isy-green-bright">
            <span>Pop-Up Event Booth Mode</span>
          </div>
          <h3 className="font-serif text-xl font-black text-isy-green-deep">Scan &amp; Unduh di HP Kamu</h3>
          <p className="text-xs text-isy-ink/60">Arahkan kamera HP ke QR Code raksasa di bawah ini</p>
        </div>

        <div className="flex justify-center p-3 bg-isy-mist rounded-2xl border border-isy-green-bright/20 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDisplaySrc} alt="QR Code Event Raksasa" className="h-64 w-64 rounded-xl border-4 border-white bg-white object-contain shadow-lg" />
        </div>

 <p className="text-[11px] font-semibold text-isy-green-deep truncate">{uploadedUrl}</p>

 <button onClick={onClose} className="w-full rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-deep active:scale-95 transition-all">
 Tutup & Kembalikan Layar
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
  if (phase === "idle") return null;

  if (phase === "uploading") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-isy-green-bright/25 bg-isy-mist p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-isy-green-bright border-t-transparent" />
        </div>
        <div>
          <p className="text-xs font-bold text-isy-green-deep">Mengunggah Foto…</p>
          <p className="mt-0.5 text-[10px] leading-tight text-isy-ink/55">Menyiapkan QR untuk download di HP.</p>
        </div>
      </div>
    );
  }

  if (phase === "done" && (qrCodeDataUrl || uploadedUrl)) {
    const qrDisplaySrc = qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&color=116B3C&data=${encodeURIComponent(uploadedUrl || "")}`;
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-isy-green-bright/40 bg-gradient-to-br from-[#E8F5E9] to-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-[60px] w-[60px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDisplaySrc} alt="QR Code" className="h-full w-full rounded-xl border-2 border-white bg-white object-contain shadow-md" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-isy-green-bright text-[8px] text-white">✓</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-black text-isy-green-deep">Scan &amp; Unduh di HP</p>
            <p className="text-[10px] leading-tight text-isy-ink/60">Arahkan kamera HP ke QR ini.</p>
          </div>
        </div>

        {/* Event Mode Giant QR Button */}
        <button
          onClick={onOpenGiantQR}
          className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-isy-green-bright px-3 py-2 text-[10px] font-black text-white shadow hover:bg-isy-green-deep active:scale-95 transition-all"
        >
          <span>Perbesar</span>
          <span className="text-[8px] font-medium opacity-80">Event Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm">⚠️</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-red-900 leading-snug">
            {phase === "no-key" ? "Setup Cloudinary Diperlukan" : "Upload QR Gagal"}
          </p>
          <p className="mt-0.5 text-[10px] text-red-700/80 leading-relaxed break-words line-clamp-2">
            {uploadError || "Pastikan Cloudinary preset di-set Unsigned & ENV Vercel terpasang."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-bold text-white shadow active:scale-95 transition-all"
          >
            Coba Lagi
          </button>
        )}
        <button
          onClick={onDownload}
          className="rounded-lg bg-isy-green-bright px-3 py-1.5 text-[10px] font-bold text-white shadow active:scale-95 transition-all"
        >
          Simpan Langsung
        </button>
      </div>
    </div>
  );
}

function ShareModal({ compositeUrl, gifUrl, onClose, onToast }: {
  compositeUrl: string; gifUrl: string | null; onClose: () => void; onToast: (m: string) => void;
}) {
  const downloadStrip = async () => {
    await downloadOrShareImage(compositeUrl, `iseeyou-strip-${Date.now()}.jpg`, "Optik I See You — Photo");
    onToast("Foto berhasil tersimpan / dibagikan! ");
  };
  const downloadGif = async () => {
    if (!gifUrl) return;
    await downloadOrShareImage(gifUrl, `iseeyou-animasi-${Date.now()}.gif`, "Optik I See You — GIF");
    onToast("GIF berhasil tersimpan / dibagikan! ");
  };
  const shareWA = async () => {
    await downloadOrShareImage(compositeUrl, `iseeyou-strip-${Date.now()}.jpg`, "Optik I See You");
    setTimeout(() => window.open("https://wa.me/?text=" + encodeURIComponent("Coba kacamata di @iseeyou.glasses AR Photobooth! "), "_blank"), 600);
  };
  const shareIG = async () => {
    await downloadOrShareImage(compositeUrl, `iseeyou-strip-${Date.now()}.jpg`, "Optik I See You");
    setTimeout(() => { window.open("https://www.instagram.com/iseeyou.glasses/", "_blank"); onToast("Foto diunduh! Share ke Instagram Story "); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-black text-isy-green-deep">Bagikan Hasil</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"></button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: <span className="text-2xl">📸</span>, label: "Unduh Strip", fn: downloadStrip },
            { icon: <span className="text-2xl">🎬</span>, label: "Unduh GIF", fn: downloadGif, disabled: !gifUrl },
            { icon: <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={32} height={32} className="h-8 w-8 object-contain" />, label: "WhatsApp", fn: shareWA },
            { icon: <Image src="/logo/Logo-Shoppe.png" alt="Shopee" width={32} height={32} className="h-8 w-8 object-contain" />, label: "Shopee Store", fn: () => window.open(SHOPEE_STORE_URL, "_blank") },
          ].map(({ icon, label, fn, disabled }) => (
            <button key={label} onClick={fn} disabled={disabled}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-isy-line bg-isy-mist p-3.5 text-xs font-extrabold text-isy-green-deep hover:border-isy-green-bright hover:bg-white transition-all active:scale-95 disabled:opacity-40 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center">{icon}</div>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={shareIG}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-isy-line bg-isy-mist py-3 text-xs font-extrabold text-isy-green-deep hover:border-isy-green-bright hover:bg-white transition-all active:scale-95"
        >
          <span>✨</span>
          <span>Share ke Instagram Story</span>
        </button>
      </div>
    </div>
  );
}
// ── TryOnResult: Branded single-photo result for AR Try-On mode ──────────────
function TryOnResult({
  photoUrl, compositeUrl, arGlassesName, onRetake, onDownload, onOpenShareModal,
}: {
  photoUrl: string; compositeUrl?: string | null; arGlassesName?: string;
  onRetake: () => void; onDownload: () => void; onOpenShareModal: () => void;
}) {
  const router = useRouter();
  const displayUrl = compositeUrl || photoUrl;
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
          <span className="text-xs font-black uppercase tracking-widest text-isy-green-bright">Hasil Try On 🕶️</span>
        </div>
        <span className="rounded-full bg-isy-mist border border-isy-line px-3 py-1 text-[10px] font-extrabold text-isy-green-deep">
          Framed Photo
        </span>
      </div>

      {/* Photo with Watermark Frame */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-isy-green-bright/30 shadow-xl max-h-[380px] flex items-center justify-center bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayUrl} alt="Hasil Try On Kacamata" className="h-full max-h-[380px] w-full object-contain" />
      </div>

      {/* Primary CTA: WhatsApp CS */}
      <a
        href={csWhatsappUrl(arGlassesName)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 3C8.82 3 3 8.82 3 16c0 2.36.64 4.57 1.76 6.48L3 29l6.73-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.12 18.08c-.26.73-1.51 1.4-2.08 1.48-.57.08-1.1.36-3.71-.77-3.14-1.36-5.15-4.52-5.3-4.73-.15-.21-1.22-1.63-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.58-.38.78-.38h.56c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.08.14.13.31.03.5-.1.19-.14.31-.28.47-.15.16-.3.36-.43.48-.14.12-.29.25-.12.5.16.24.72 1.19 1.55 1.92 1.07.95 1.97 1.24 2.21 1.38.24.13.38.11.52-.07.14-.18.59-.69.75-.93.16-.23.32-.19.54-.11.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.56-.2 1.29z"/>
        </svg>
        Tanya Ketersediaan Frame ke CS
      </a>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onDownload} className="flex items-center justify-center gap-2 rounded-xl border border-isy-line bg-white py-3 text-xs font-bold text-isy-green-deep hover:border-isy-green-bright active:scale-95">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M12 3v13" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>
          Simpan Foto
        </button>
        <button onClick={onOpenShareModal} className="flex items-center justify-center gap-2 rounded-xl border border-isy-line bg-white py-3 text-xs font-bold text-isy-green-deep hover:border-isy-green-bright active:scale-95">
          Bagikan
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onRetake} className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-ink/70 hover:border-isy-green-bright hover:text-isy-green-deep active:scale-95">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" /></svg>
          Foto Ulang
        </button>
        <button onClick={() => router.push("/katalog")} className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-ink/70 hover:border-isy-green-bright hover:text-isy-green-deep active:scale-95">
          Lihat Katalog
        </button>
      </div>
    </div>
  );
}

// ── StripPreview: Right-panel preview/result for both AR Try-On & Photobooth ──
function StripPreview({
  layout, photos, compositeUrl, gifUrl, uploadedUrl, qrCodeDataUrl, uploadError, uploadPhase,
  phase, photoCount, selectedTheme, selectedFilter,
  onSelectTheme, onSelectFilter, onOpenGiantQR,
  onDownloadStrip, onDownloadGif, onRetake, onChangeLayout, onOpenShareModal,
  onOpenThermalPrint, onRetakeSingleSlot, onRetryUpload, arGlassesName, isArMode = false,
}: {
  layout: FrameLayout; photos: string[]; compositeUrl: string | null;
  gifUrl: string | null; uploadedUrl: string | null; qrCodeDataUrl?: string | null; uploadError?: string | null; uploadPhase: UploadPhase;
  phase: BoothPhase; photoCount: number; selectedTheme: string; selectedFilter: string;
  onSelectTheme: (tId: string) => void; onSelectFilter: (fId: string) => void;
  onOpenGiantQR: () => void;
  onDownloadStrip: () => void; onDownloadGif: () => void;
  onRetake: () => void; onChangeLayout: () => void; onOpenShareModal: () => void;
  onOpenThermalPrint: () => void;
  onRetakeSingleSlot: (slotIdx: number) => void;
  onRetryUpload?: () => void;
  arGlassesName?: string; isArMode?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ResultTab>("strip");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "result" && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }
  }, [phase]);

  // Compositing spinner
  if (phase === "compositing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-isy-green-bright border-t-transparent" />
        <p className="text-sm font-bold text-isy-green-deep">{isArMode ? "Membuat foto Try On…" : "Membuat foto strip & GIF animasi…"}</p>
        <p className="text-[11px] text-isy-ink/50">Sabar sebentar ✨</p>
      </div>
    );
  }

  // AR Try-On framed result — with Try On watermark frame
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

  // Photobooth strip result
  if (phase === "result" && compositeUrl) {
    return (
      <div ref={ref} className="flex flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-xs font-bold uppercase tracking-widest text-isy-green-bright">Hasil Photobooth 📸</span>
          </div>
          <div className="flex rounded-full border border-isy-line bg-isy-mist p-0.5">
            <button onClick={() => setActiveTab("strip")} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${activeTab === "strip" ? "bg-white text-isy-green-deep shadow-sm" : "text-isy-ink/50"}`}>Foto</button>
            <button onClick={() => setActiveTab("gif")} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${activeTab === "gif" ? "bg-white text-isy-green-deep shadow-sm" : "text-isy-ink/50"}`}>GIF</button>
          </div>
        </div>

        {/* Color filter chips */}
        <div className="flex flex-col gap-1 rounded-xl border border-isy-line bg-isy-mist/50 p-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-isy-green-deep">Filter Warna:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {COLOR_FILTERS.map((f) => (
              <button key={f.id} onClick={() => onSelectFilter(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap ${f.id === selectedFilter ? "border-isy-green-bright bg-isy-green-bright text-white shadow-sm" : "border-isy-line bg-white text-isy-ink/75 hover:border-isy-green-bright/50"}`}>
                <span>{f.emoji}</span><span>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frame theme chips */}
        {activeTab === "strip" && (
          <div className="flex flex-col gap-1 rounded-xl border border-isy-line bg-isy-mist/50 p-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-isy-green-deep">Tema Frame:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {getCompatibleThemes(layout).map((th) => (
                <button key={th.id} onClick={() => onSelectTheme(th.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap ${th.id === selectedTheme ? "border-isy-green-bright bg-isy-green-bright text-white shadow-sm" : "border-isy-line bg-white text-isy-ink/75 hover:border-isy-green-bright/50"}`}>
                  <span className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: th.bgColor }} />
                  <span>{th.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview image */}
        <div className="overflow-hidden rounded-2xl border border-isy-line shadow-lg max-h-[340px] flex items-center justify-center bg-black/5">
          {activeTab === "strip" ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={compositeUrl} alt="Hasil foto" className="h-full max-h-[340px] object-contain" />
          ) : gifUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={gifUrl} alt="Hasil GIF animasi" className="h-full max-h-[340px] object-contain" />
          ) : (
            <div className="flex h-44 items-center justify-center text-xs text-isy-ink/40">Memproses GIF…</div>
          )}
        </div>

        <QRBox
          phase={uploadPhase}
          uploadedUrl={uploadedUrl}
          qrCodeDataUrl={qrCodeDataUrl || null}
          uploadError={uploadError || null}
          onOpenGiantQR={onOpenGiantQR}
          onDownload={onDownloadStrip}
          onRetry={onRetryUpload}
        />

        <div className="grid grid-cols-3 gap-2">
          {activeTab === "strip" ? (
            <button onClick={onDownloadStrip} className="group relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-deep active:scale-[0.97]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M12 3v13" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>
              Simpan
            </button>
          ) : (
            <button onClick={onDownloadGif} disabled={!gifUrl} className="flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-deep active:scale-[0.97] disabled:opacity-50">
              GIF
            </button>
          )}

          <button onClick={onOpenThermalPrint} className="flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-deep py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-isy-green-bright active:scale-[0.97]">
            Cetak 🖨️
          </button>

          <button onClick={onOpenShareModal} className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-green-bright bg-white py-3 text-xs font-bold text-isy-green-deep shadow-sm hover:bg-isy-mist active:scale-[0.97]">
            Bagikan
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onRetake} className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-white py-2.5 text-xs font-bold text-isy-ink/70 hover:border-isy-green-bright hover:text-isy-green-deep active:scale-95">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" /></svg>
            Ulangi Semua
          </button>
          <button onClick={onChangeLayout} className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-white py-2.5 text-xs font-bold text-isy-ink/70 hover:border-isy-green-bright hover:text-isy-green-deep active:scale-95">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            Ganti Layout
          </button>
        </div>
      </div>
    );
  }

  // Live preview — slot-by-slot with selective retake
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-isy-green-deep">Preview Strip</p>
        <p className="text-[11px] text-isy-ink/50 font-medium">{layout.label} · {photoCount}/{layout.numPhotos} foto</p>
      </div>

      <div className={`grid gap-2 ${layout.numPhotos >= 4 ? "grid-cols-2" : "grid-cols-1"}`}>
        {Array.from({ length: layout.numPhotos }).map((_, i) => (
          <div key={i}
            className={`group relative overflow-hidden rounded-xl border-2 bg-isy-mist transition-all duration-300 ${photos[i] ? "border-isy-green-bright shadow-md scale-[1.01]" : i === photoCount ? "border-isy-green-bright/50 ring-2 ring-isy-green-bright/30 animate-pulse" : "border-dashed border-isy-line"}`}
            style={{ aspectRatio: "4/3" }}>
            {photos[i] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[i]} alt="" className="h-full w-full object-cover" />
                <button onClick={() => onRetakeSingleSlot(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-isy-green-deep shadow-lg hover:bg-isy-green-bright hover:text-white transition-colors">
                    Retake Foto #{i + 1}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                  {i === photoCount ? (
                    <span className="text-xs font-bold text-isy-green-bright animate-pulse">⚡ Siap!</span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-isy-line">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span className="text-[10px] font-medium text-isy-line">Foto {i + 1}</span>
                    </>
                  )}
                </div>
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

 const [phase, setPhase] = useState<BoothPhase>("frame-select");
 const [layout, setLayout] = useState<FrameLayout>(FRAME_LAYOUTS[0]);
 const [themeId, setThemeId] = useState<string>("classic-white");
 const [colorFilterId, setColorFilterId] = useState<string>("normal");
 const [photos, setPhotos] = useState<string[]>([]);
 const [currentSlot, setCurrentSlot] = useState(0);
 const [singleSlotRetake, setSingleSlotRetake] = useState<number | null>(null);
 const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
 const [gifUrl, setGifUrl] = useState<string | null>(null);
 const [glassesIndex, setGlassesIndex] = useState(1);
 const [aiMode, setAiMode] = useState(true);
 // arEnabled = whether the AR/glasses concept exists at all this session.
 // Distinct from aiMode (which only toggles the auto-recommendation badge
 // *within* AR mode) — this is the actual "Photobooth Biasa" switch set on
 // /start.
 const [arEnabled, setArEnabled] = useState(true);
 const [beautyMode, setBeautyMode] = useState(true);
 const [lipstickMode, setLipstickMode] = useState(false);
 const [faceResult, setFaceResult] = useState<FaceShapeResult | null>(null);
 const [faceDetected, setFaceDetected] = useState(false);
 const [toast, setToast] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [giantQRModalOpen, setGiantQRModalOpen] = useState(false);
  const [thermalPrintModalOpen, setThermalPrintModalOpen] = useState(false);
 const [timerSec, setTimerSec] = useState<TimerSec>(3);
 const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
 const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
 const [isScanning, setIsScanning] = useState(false);
 const [scanComplete, setScanComplete] = useState(false);
 const [soundEnabled, setSoundEnabled] = useState(true);

 const glasses = manifest[glassesIndex];
 const faceTrackerRef = useRef<FaceTrackerHandle>(null);

 // Mode chosen on /start ("Scan AR Kacamata" vs "Photobooth") arrives
 // as ?mode=ar / ?mode=photobooth (or ?ai=1 / ?ai=0). Read via window.location.
 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 const modeParam = params.get("mode");
 const aiParam = params.get("ai");
 const glassesParam = params.get("glasses");

 if (glassesParam) {
 const idx = manifest.findIndex((g) => g.id === glassesParam);
 if (idx >= 0) setGlassesIndex(idx);
 }

 if (modeParam === "ar" || aiParam === "1") {
 setAiMode(true);
 setArEnabled(true);
 setLayout(FRAME_LAYOUTS[0]);
 setPhase("ready");
 } else if (modeParam === "photobooth" || aiParam === "0") {
 setAiMode(false);
 setArEnabled(false);
 setPhase("frame-select");
 }
 }, []);
 const flashRef = useRef<HTMLDivElement>(null);

 const shooting = phase === "ready" || phase === "countdown" || phase === "flash" || phase === "between";
 const showShutter = phase === "ready";
 const rightActive = phase !== "frame-select";

const showToast = useCallback((msg: string) => {
 setToast(msg);
 setTimeout(() => setToast(null), 3000);
 }, []);

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
        return isOpen && Array.isArray(g.recommendedFor) && g.recommendedFor.includes(shape);
      })
      .map(({ i }) => i);

    if (candidateIndices.length > 0) {
      const randomIdx = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
      setGlassesIndex(randomIdx);
    } else {
      const openIdx = manifest.findIndex((g) => (!g.lensType || g.lensType === "open") && g.id !== "none");
      if (openIdx >= 0) setGlassesIndex(openIdx);
    }
  }, []);

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
    const res = await downloadOrShareImage(compositeUrl, `iseeyou-foto-${Date.now()}.jpg`, "Optik I See You — Photo");
    if (res.method === "share") {
      showToast("Berhasil dibagikan / tersimpan ke Galeri! 📸");
    } else {
      showToast("Foto berhasil tersimpan! 📸");
    }
  }, [compositeUrl, showToast]);

  const downloadGif = useCallback(async () => {
    if (!gifUrl) return;
    const res = await downloadOrShareImage(gifUrl, `iseeyou-animasi-${Date.now()}.gif`, "Optik I See You — GIF");
    if (res.method === "share") {
      showToast("GIF berhasil dibagikan / tersimpan! 🎬");
    } else {
      showToast("GIF animasi berhasil tersimpan! 🎬");
    }
  }, [gifUrl, showToast]);

 const resetSession = useCallback(() => {
 setScanComplete(false);
 setIsScanning(false);
 setPhotos([]);
 setCurrentSlot(0);
 setSingleSlotRetake(null);
 setCompositeUrl(null);
 setGifUrl(null);
 setUploadedUrl(null);
 setUploadPhase("idle");
 }, []);

  const handleLayoutSelect = useCallback((chosen: FrameLayout) => {
    setLayout(chosen);
    resetSession();
    setPhase("theme-select");
  }, [resetSession]);

 const handleRetake = useCallback(() => {
 resetSession();
 if (arEnabled) {
 setLayout(FRAME_LAYOUTS[0]);
 // Jika wajah sudah terdeteksi, langsung re-enable tombol tanpa scanning lagi
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

 const handleCountdownComplete = useCallback(() => {
 const dataUrl = faceTrackerRef.current?.captureFrame() ?? null;
 if (!dataUrl) {
 setPhase("ready");
 return;
 }

 // Play Shutter Audio Effect! 📸
 playShutterSound(soundEnabled);

 if (flashRef.current) {
 gsap.fromTo(flashRef.current, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "power2.out" });
 }

 const targetSlot = singleSlotRetake !== null ? singleSlotRetake : currentSlot;

 setPhotos((prev) => {
 const n = [...prev];
 n[targetSlot] = dataUrl;
 return n;
 });

 // If we were retaking a single slot -> finish immediately & re-composite!
 if (singleSlotRetake !== null) {
 setSingleSlotRetake(null);
 setTimeout(() => setPhase("compositing"), 400);
 return;
 }

 const nextSlot = currentSlot + 1;

 if (nextSlot < layout.numPhotos) {
 setPhase("between");
 setTimeout(() => {
 setCurrentSlot(nextSlot);
 setPhase("countdown");
 }, 1200);
 } else {
 setCurrentSlot(nextSlot);
 setTimeout(() => setPhase("compositing"), 400);
 }
 }, [currentSlot, layout.numPhotos, singleSlotRetake]);

  const handleStartSession = useCallback(() => {
    if (phase !== "ready") return;
    unlockAudio();
    resetSession();
    setCurrentSlot(0);
    setPhase("countdown");
  }, [phase, resetSession]);

 const handleSelectTheme = useCallback((newThemeId: string) => {
 setThemeId(newThemeId);
 if (photos.length) {
 compositeFrame(layout, photos, newThemeId, colorFilterId).then((url) => {
 setCompositeUrl(url);
 });
 createAnimatedGif(photos, newThemeId, colorFilterId).then((gif) => {
 setGifUrl(gif);
 }).catch((err) => console.warn("GIF theme update error:", err));
 }
 }, [layout, photos, colorFilterId]);

 const handleSelectFilter = useCallback((newFilterId: string) => {
 setColorFilterId(newFilterId);
 if (photos.length) {
 // Re-composite strip
 compositeFrame(layout, photos, themeId, newFilterId).then((url) => {
 setCompositeUrl(url);
 });
 // Re-generate GIF
 createAnimatedGif(photos, themeId, newFilterId).then((gif) => {
 setGifUrl(gif);
 }).catch((err) => console.warn("GIF filter update error:", err));
 }
 }, [layout, photos, themeId]);

  // Composite strip & generate animated GIF when photos are ready
  useEffect(() => {
    if (phase !== "compositing") return;
    let cancelled = false;

    if (arEnabled && photos[0]) {
      compositeArTryOnFrame(photos[0], glasses?.name).then((url) => {
        if (!cancelled) {
          setCompositeUrl(url);
          setPhase("result");
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#116B3C", "#2FA84F", "#86EFAC"],
          });
        }
      });
      return () => { cancelled = true; };
    }

    compositeFrame(layout, photos, themeId, colorFilterId).then((url) => {
      if (!cancelled) {
        setCompositeUrl(url);
        setPhase("result");
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#116B3C", "#2FA84F", "#86EFAC", "#FFD700"],
        });
      }
    });

    createAnimatedGif(photos, themeId, colorFilterId).then((gif) => {
      if (!cancelled) {
        setGifUrl(gif);
      }
    }).catch((err) => console.warn("GIF generation error:", err));

    return () => { cancelled = true; };
  }, [phase]);

  // Auto-upload both Photo Strip and Animated GIF to Cloudinary for QR code
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const doUpload = () => {
    if (phase !== "result" || !compositeUrl) return;
    setUploadPhase("uploading");
    setUploadError(null);

    uploadPhotoForQR(compositeUrl, gifUrl).then((result) => {
      if (result.ok) {
        setUploadedUrl(result.qrPageUrl);
        setQrCodeDataUrl(result.qrCodeDataUrl);
        setUploadPhase("done");
      } else {
        console.warn("QR upload:", result.error);
        setUploadError(result.error);
        setUploadPhase("error");
      }
    });
  };

  useEffect(() => {
    if (phase !== "result" || !compositeUrl) return;
    doUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, compositeUrl, gifUrl]);

 return (
 <main className="flex min-h-dvh w-full items-center justify-center bg-isy-gradient lg:p-6">
 <div className="
 relative flex h-dvh w-full flex-col overflow-hidden bg-isy-white
 lg:h-[740px] lg:max-h-[94svh] lg:w-[1020px] lg:max-w-[96vw]
 lg:flex-row lg:rounded-[24px] lg:border lg:border-isy-line lg:shadow-2xl
 ">

 {/* ══ LEFT — Camera Panel ══════════════════════════════════════════════ */}
 <div className="
 relative flex flex-col overflow-hidden bg-isy-mist
 h-[55vw] min-h-[280px] max-h-[440px] shrink-0
 lg:h-full lg:w-[56%] lg:max-h-none lg:min-h-0 lg:border-r lg:border-isy-line
 ">
 {rightActive && (
 <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-3 lg:hidden">
 <BackBtn onClick={goHome} />
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
  glassesSrc={arEnabled && glasses.file ? `/glasses/${glasses.file}` : ""}
  fitWidthRatio={glasses.fitWidthRatio}
  numFaces={layout.numPhotos}
  beautyMode={beautyMode}
  lipstickMode={lipstickMode}
  scanIntro={isScanning}
  showFaceGuide={arEnabled}
  faceResult={faceResult}
  onScanIntroComplete={() => {
    setIsScanning(false);
    setScanComplete(true);
  }}
  onFaceCountChange={handleFaceCountChange}
  ipdScaleRef={(glasses as any).ipdScaleRef ?? 1.5}
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

 <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: 0 }} aria-hidden />

 {phase === "countdown" && (
    <Countdown from={timerSec} duration={1} soundEnabled={soundEnabled} onComplete={handleCountdownComplete} />
 )}

 {phase === "between" && (
 <div className="absolute inset-0 z-30 flex items-center justify-center">
 <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/50 px-6 py-4 backdrop-blur-sm">
 <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
 <p className="text-xs font-bold text-white">
 Foto {photos.length}/{layout.numPhotos} · Siap untuk berikutnya…
 </p>
 </div>
 </div>
 )}

 {shooting && phase !== "countdown" && phase !== "between" && (
 <div className={`
 absolute bottom-3 left-1/2 -translate-x-1/2
 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-all
 ${faceDetected ? "bg-isy-green-bright text-white" : "bg-black/50 backdrop-blur text-white/70"}
 `}>
 <span className={`h-1.5 w-1.5 rounded-full ${faceDetected ? "animate-pulse bg-white" : "bg-white/40"}`} />
 {faceDetected ? "Wajah Terdeteksi! " : "Arahkan ke Kamera"}
 </div>
 )}

 {shooting && (
 <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm lg:hidden">
 {photos.length}/{layout.numPhotos}
 </div>
 )}
 </div>
 </div>

 {/* ══ RIGHT — Controls + Preview Panel ════════════════════════════════ */}
 <div className="flex flex-1 flex-col overflow-y-auto bg-white lg:w-[44%] lg:flex-none">

 <div className="hidden lg:flex shrink-0 items-center justify-between border-b border-isy-line px-5 py-3">
 <BackBtn onClick={goHome} />
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
 <div className={`flex items-center gap-1 text-[10px] font-bold ${faceDetected ? "text-isy-green-bright" : "text-isy-ink/30"}`}>
 <span className={`h-1.5 w-1.5 rounded-full ${faceDetected ? "animate-pulse bg-isy-green-bright" : "bg-isy-ink/20"}`} />
 {faceDetected ? "Terdeteksi" : "Tidak ada wajah"}
 </div>
 </div>

 <div className="flex items-center justify-between gap-2 flex-wrap">
 <div className="flex items-center gap-1.5 flex-wrap">
 <button
 onClick={() => setBeautyMode((v) => !v)}
 className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95
 ${beautyMode ? "bg-isy-green-bright/15 text-isy-green-deep border border-isy-green-bright/40" : "border border-isy-line text-isy-ink/50"}`}
 >
 AI Mulus
 </button>
 <button
 onClick={() => setLipstickMode((v) => !v)}
 className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95
 ${lipstickMode ? "bg-pink-100 text-pink-700 border border-pink-300" : "border border-isy-line text-isy-ink/50"}`}
 >
 Lipstik
 </button>
 <button
   onClick={() => setSoundEnabled((v) => !v)}
   className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 ${
     soundEnabled
       ? "bg-isy-green-bright/15 text-isy-green-deep border border-isy-green-bright/40"
       : "bg-gray-100 text-gray-400 border border-gray-200"
   }`}
   title={soundEnabled ? "Suara Countdown & Jepret ON (Klik untuk Mute)" : "Suara Muted (Klik untuk Nyalakan)"}
 >
   {soundEnabled ? "🔊 Suara ON" : "🔇 Mute"}
 </button>
 </div>
 <TimerChips
 value={timerSec}
 onChange={setTimerSec}
 disabled={phase !== "ready"}
 />
 </div>

 {arEnabled && (
 <div className="flex gap-1.5 overflow-x-auto pb-0.5">
 {manifest.map((g, i) => (
 <button
 key={g.id}
 onClick={() => { setGlassesIndex(i); setAiMode(false); }}
 className={`relative shrink-0 flex flex-col items-center gap-0.5 rounded-xl border px-2.5 pt-1.5 pb-1 text-[9px] font-semibold transition-all active:scale-95
 ${i === glassesIndex
 ? "border-isy-green-bright bg-isy-green-bright/10 text-isy-green-deep shadow-md"
 : "border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright/50"}`}
 >
 {aiMode && faceResult?.recommendedGlassesId === g.id && (
 <span className="absolute -top-2 -right-1 rounded-full bg-isy-green-bright px-1 py-0.5 text-[7px] font-black text-white">AI</span>
 )}
 <div className="h-2 w-2 rounded-full border border-black/10" style={{ backgroundColor: g.color }} />
 <span className="max-w-[52px] text-center leading-tight">{g.name}</span>
 </button>
 ))}
 </div>
 )}

 <button
 id="shutter-btn"
 onClick={handleStartSession}
 disabled={!showShutter || (arEnabled && !scanComplete)}
 className="group relative w-full overflow-hidden rounded-xl bg-isy-green-bright py-3.5 text-sm font-black uppercase tracking-[0.15em] text-white shadow-md transition-all hover:bg-isy-green-deep active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
 >
 <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
 <span className="relative flex items-center justify-center gap-2">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
 <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
 <circle cx="12" cy="13" r="4" />
 </svg>
 {showShutter
    ? arEnabled
      ? `Try On & Ambil Foto (1x)`
      : `Mulai Foto — ${timerSec}s × ${layout.numPhotos} Foto`
    : phase === "countdown" ? " Bersiap…"
    : phase === "between" ? ` ${photos.length}/${layout.numPhotos} foto`
    : phase === "flash" ? " Jepret!"
    : "Memproses…"}
 </span>
 </button>

 <div className="flex items-center justify-between text-xs">
 {!arEnabled ? (
 <button onClick={handleChangeLayout} className="text-isy-ink/40 hover:text-isy-green-deep transition-colors">
 Ganti Layout
 </button>
 ) : (
 <span className="text-[11px] font-bold text-isy-green-bright">✨ Try-On 1x Foto</span>
 )}
 {photos.length > 0 && (
 <button onClick={handleRetake} className="text-isy-ink/40 hover:text-red-500 transition-colors">
 Ulangi
 </button>
 )}
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
            arGlassesName={arEnabled ? glasses?.name : undefined}
            isArMode={arEnabled}
          />
 )}
 </div>

 {/* Overlays */}
 {phase === "frame-select" && <FramePicker onSelect={handleLayoutSelect} onBack={goHome} />}
 {phase === "theme-select" && (
 <FrameThemePicker
 layout={layout}
 selectedThemeId={themeId}
 onSelect={(tId) => {
 setThemeId(tId);
 setPhase("ready");
 }}
 onBack={() => setPhase("frame-select")}
 />
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
