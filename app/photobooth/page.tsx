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
import { uploadPhotoForQR, generateInstantQR, generatePhotoId, uploadGifToR2 } from "@/lib/uploadImage";
import { createAnimatedGif } from "@/lib/gifGenerator";
import { playShutterSound, unlockAudio } from "@/lib/soundEffects";
import ContactCSModal from "@/components/ui/ContactCSModal";
import ThermalPrintModal from "@/components/ui/ThermalPrintModal";
import { downloadOrShareImage } from "@/lib/saveImage";
import QRCode from "qrcode";
import manifestRaw from "@/public/glasses/manifest.json";

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
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 rounded-full border border-isy-line bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-isy-green-deep shadow-xs hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all cursor-pointer"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:-translate-x-0.5"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Kembali</span>
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
  if (phase === "idle" && !qrCodeDataUrl && !uploadedUrl) return null;

  // Always show QR code immediately if available!
  if (qrCodeDataUrl || uploadedUrl) {
    const qrDisplaySrc =
      qrCodeDataUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&color=116B3C&data=${encodeURIComponent(
        uploadedUrl || ""
      )}`;

    const isUploading = phase === "uploading";
    const isError = phase === "error";

    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-isy-green-bright/40 bg-gradient-to-br from-[#E8F5E9] to-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-[64px] w-[64px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDisplaySrc}
                alt="QR Code"
                className="h-full w-full rounded-xl border-2 border-white bg-white object-contain shadow-md"
              />
              {isUploading ? (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white animate-pulse"
                  title="Sinkronisasi Cloud"
                >
                  ⚡
                </span>
              ) : isError ? (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white"
                  title="Upload Lambat"
                >
                  !
                </span>
              ) : (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-isy-green-bright text-[8px] text-white"
                  title="Tersimpan di Cloud"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-black text-isy-green-deep">Scan &amp; Unduh di HP</p>
              {isUploading ? (
                <p className="text-[10px] leading-tight text-amber-700 font-medium flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  Bisa langsung di-scan di HP!
                </p>
              ) : isError ? (
                <p className="text-[10px] leading-tight text-red-600 font-medium">
                  Sinyal lambat. Bisa simpan manual.
                </p>
              ) : (
                <p className="text-[10px] leading-tight text-isy-ink/60">Arahkan kamera HP ke QR ini.</p>
              )}
            </div>
          </div>

          {/* Event Mode Giant QR Button */}
          <button
            onClick={onOpenGiantQR}
            className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-isy-green-bright px-3 py-2 text-[10px] font-black text-white shadow hover:bg-isy-green-deep active:scale-95 transition-all cursor-pointer"
          >
            <span>Perbesar</span>
            <span className="text-[8px] font-medium opacity-80">Event Mode</span>
          </button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 pt-1 border-t border-isy-line/50">
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-lg bg-amber-600 px-3 py-1 text-[10px] font-bold text-white shadow active:scale-95 transition-all cursor-pointer"
              >
                Coba Sinkron Ulang
              </button>
            )}
            <button
              onClick={onDownload}
              className="rounded-lg bg-isy-green-bright px-3 py-1 text-[10px] font-bold text-white shadow active:scale-95 transition-all cursor-pointer"
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm">⚠️</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-red-900 leading-snug">
              Setup Cloudinary Diperlukan
            </p>
            <p className="mt-0.5 text-[10px] text-red-700/80 leading-relaxed break-words line-clamp-2">
              {uploadError || "Pastikan Cloudinary preset di-set Unsigned & ENV Vercel terpasang."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onDownload}
            className="rounded-lg bg-isy-green-bright px-3 py-1.5 text-[10px] font-bold text-white shadow active:scale-95 transition-all cursor-pointer"
          >
            Simpan Langsung
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ShareModal({ compositeUrl, gifUrl, onClose, onToast }: {
  compositeUrl: string; gifUrl: string | null; onClose: () => void; onToast: (m: string) => void;
}) {
  const downloadStrip = async () => {
    onToast("Mengunduh foto ke galeri...");
    await downloadOrShareImage(compositeUrl, `iseeyou-strip-${Date.now()}.jpg`, "Optik I See You — Photo");
    onToast("Foto berhasil diunduh & tersimpan di galeri!");
  };
  const downloadGif = async () => {
    if (!gifUrl) return;
    onToast("Mengunduh GIF animasi...");
    await downloadOrShareImage(gifUrl, `iseeyou-animasi-${Date.now()}.gif`, "Optik I See You — GIF");
    onToast("GIF animasi berhasil diunduh & tersimpan di galeri!");
  };
  const shareWA = async () => {
    setTimeout(() => window.open("https://wa.me/?text=" + encodeURIComponent("Coba kacamata di @iseeyou.glasses AR Photobooth! https://optikiseeyou.com/photobooth"), "_blank"), 300);
  };
  const shareIG = async () => {
    setTimeout(() => { window.open("https://www.instagram.com/iseeyou.glasses/", "_blank"); onToast("Buka Instagram @iseeyou.glasses ✨"); }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-black text-isy-green-deep">Bagikan Hasil</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-isy-green-deep">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              ),
              label: "Unduh Foto",
              fn: downloadStrip,
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-isy-green-deep">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                  <line x1="17" y1="7" x2="22" y2="7"/>
                </svg>
              ),
              label: "Unduh GIF",
              fn: downloadGif,
              disabled: !gifUrl,
            },
            {
              icon: <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={32} height={32} className="h-8 w-8 object-contain" />,
              label: "WhatsApp",
              fn: shareWA,
            },
            {
              icon: <Image src="/logo/Logo-Shoppe.png" alt="Shopee" width={32} height={32} className="h-8 w-8 object-contain" />,
              label: "Shopee",
              fn: () => window.open(SHOPEE_STORE_URL, "_blank"),
            },
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-isy-green-deep">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
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
  onOpenThermalPrint, onRetakeSingleSlot, onRetryUpload, onGoToResult, onGoToCustomize,
  arGlassesName, isArMode = false,
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
  onGoToResult: () => void;
  onGoToCustomize: () => void;
  arGlassesName?: string; isArMode?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<ResultTab>("strip");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((phase === "result" || phase === "customize") && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }
  }, [phase]);

  // Compositing spinner
  if (phase === "compositing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-isy-green-bright border-t-transparent" />
        <p className="text-sm font-bold text-isy-green-deep">{isArMode ? "Membuat foto Try On…" : "Membuat foto strip & GIF animasi…"}</p>
        <p className="text-[11px] text-isy-ink/50">Memproses komposisi terbaik...</p>
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

  // Photobooth strip — Kustomisasi (Filter + Frame, tanpa QR/Simpan/Cetak)
  if (phase === "customize" && compositeUrl) {
    return (
      <div ref={ref} className="flex flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-xs font-bold uppercase tracking-widest text-isy-green-deep">Kustomisasi Foto</span>
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
                <span className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-inner" style={{ backgroundColor: f.colorDot }} />
                <span>{f.name}</span>
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
            <img src={compositeUrl} alt="Preview foto" className="h-full max-h-[340px] object-contain" />
          ) : gifUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={gifUrl} alt="Preview GIF animasi" className="h-full max-h-[340px] object-contain" />
          ) : (
            <div className="flex h-44 items-center justify-center text-xs text-isy-ink/40">Memproses GIF…</div>
          )}
        </div>

        {/* CTA: Lanjut ke Hasil Akhir */}
        <button
          onClick={onGoToResult}
          className="group relative w-full overflow-hidden rounded-2xl bg-isy-green-bright py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-[0_4px_20px_rgba(47,168,79,0.45)] transition-all hover:bg-isy-green-deep active:scale-[0.97]"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative flex items-center justify-center gap-2">
            Lanjut, Lihat Hasil
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
          </span>
        </button>
      </div>
    );
  }

  // Photobooth strip — Hasil Akhir (QR + Simpan + Cetak + Bagikan)
  if (phase === "result" && compositeUrl) {
    return (
      <div ref={ref} className="flex flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-xs font-bold uppercase tracking-widest text-isy-green-deep">Hasil Photobooth</span>
          </div>
          <div className="flex rounded-full border border-isy-line bg-isy-mist p-0.5">
            <button onClick={() => setActiveTab("strip")} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${activeTab === "strip" ? "bg-white text-isy-green-deep shadow-sm" : "text-isy-ink/50"}`}>Foto</button>
            <button onClick={() => setActiveTab("gif")} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${activeTab === "gif" ? "bg-white text-isy-green-deep shadow-sm" : "text-isy-ink/50"}`}>GIF</button>
          </div>
        </div>

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Cetak
          </button>

          <button onClick={onOpenShareModal} className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-green-bright bg-white py-3 text-xs font-bold text-isy-green-deep shadow-sm hover:bg-isy-mist active:scale-[0.97]">
            Bagikan
          </button>
        </div>

        {/* Ubah Frame/Filter — kembali ke layar Kustomisasi */}
        <button
          onClick={onGoToCustomize}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-isy-green-bright/60 bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep hover:border-isy-green-bright hover:bg-white active:scale-95 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
          Ubah Frame / Filter
        </button>

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
              {/* Retake button: always visible as corner icon (touch-friendly) */}
              <button
                onClick={() => onRetakeSingleSlot(i)}
                className="absolute top-1.5 right-1.5 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm w-7 h-7 shadow-md transition-all active:scale-90 hover:bg-black/80"
                title={`Retake Foto #${i + 1}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round">
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                </svg>
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

  const openRemoteCameraModal = async () => {
    setIsRemoteModalOpen(true);
    if (!remoteRoomId) {
      const newRoomId = "isy-" + Math.random().toString(36).substring(2, 8);
      setRemoteRoomId(newRoomId);

      const origin = typeof window !== "undefined" ? window.location.origin : "https://optikiseeyou.com";
      const targetUrl = `${origin}/remote-camera?room=${newRoomId}`;

      try {
        const qr = await QRCode.toDataURL(targetUrl, { width: 320, margin: 2 });
        setRemoteQrUrl(qr);
      } catch (err) {
        console.warn("QR generation failed", err);
      }

      try {
        const { default: Peer } = await import("peerjs");
        if (peerReceiverRef.current) {
          peerReceiverRef.current.destroy();
        }
        const peer = new Peer(newRoomId, {
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
            showToast("🟢 Kamera HP Samsung Terhubung!");
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
    setRemoteRoomId("");
    setRemoteQrUrl(null);
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
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleGestureDetected = useCallback((_gesture: string) => {
    if (phase === "ready") {
      setPhase("countdown");
    }
  }, [phase]);

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
    const res = await downloadOrShareImage(compositeUrl, `iseeyou-foto-${Date.now()}.jpg`, "Optik I See You — Photo");
    if (res.success) {
      showToast("Foto berhasil diunduh & tersimpan di galeri!");
    } else {
      showToast("Gagal mengunduh foto.");
    }
  }, [compositeUrl, showToast]);

  const downloadGif = useCallback(async () => {
    if (!gifUrl) return;
    showToast("Mengunduh GIF animasi ke galeri...");
    const res = await downloadOrShareImage(gifUrl, `iseeyou-animasi-${Date.now()}.gif`, "Optik I See You — GIF");
    if (res.success) {
      showToast("GIF animasi berhasil diunduh & tersimpan di galeri!");
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
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#116B3C", "#2FA84F", "#86EFAC"],
        });
      });
      return;
    }

    compositeFrame(layout, photos, themeId, colorFilterId).then((url) => {
      setCompositeUrl(url);
      // Masuk layar Kustomisasi dulu (bukan langsung result)
      setPhase("customize");
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#116B3C", "#2FA84F", "#86EFAC", "#FFD700"],
      });
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
  h-[48vh] min-h-[320px] max-h-[58vh] shrink-0
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
  model3DSrc={glasses?.model3D?.glbFile ? `/glasses/${glasses.model3D.glbFile}` : undefined}
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
  ipdScaleRef={(glasses as any).ipdScaleRef ?? 1.0}
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
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-isy-green-bright text-xs font-black text-white animate-bounce">
          ✓
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
    {/* Clean Minimalist Instruction Hint */}
    <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md px-3.5 py-1.5 text-[11px] text-white/90 border border-white/10 shadow-sm animate-in fade-in duration-300">
      <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-ping" />
      <span className="font-medium">Tunjukkan telapak tangan ke kamera atau tekan tombol Mulai</span>
    </div>

  {/* Main capture button */}
  <button
  id="shutter-btn"
  onClick={handleStartSession}
  disabled={!showShutter || (arEnabled && !scanComplete)}
  className="group relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-isy-green-bright py-3.5 text-sm font-black uppercase tracking-[0.15em] text-white shadow-[0_4px_20px_rgba(47,168,79,0.5)] transition-all hover:bg-isy-green-deep active:scale-[0.97] active:shadow-[0_2px_8px_rgba(47,168,79,0.4)] disabled:opacity-50 disabled:pointer-events-none"
  >
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
  <span className="relative flex items-center justify-center gap-2">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
  <circle cx="12" cy="13" r="4" />
  </svg>
  {arEnabled ? `Try On & Ambil Foto` : `Mulai Foto`}
  </span>
  </button>
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
     className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 ${
       soundEnabled
         ? "bg-isy-green-bright/15 text-isy-green-deep border border-isy-green-bright/40"
         : "bg-gray-100 text-gray-400 border border-gray-200"
     }`}
     title={soundEnabled ? "Suara Countdown & Jepret ON (Klik untuk Mute)" : "Suara Muted (Klik untuk Nyalakan)"}
   >
     {soundEnabled ? (
       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-isy-green-deep">
         <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
         <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
       </svg>
     ) : (
       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
         <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
         <line x1="23" y1="9" x2="17" y2="15"/>
         <line x1="17" y1="9" x2="23" y2="15"/>
       </svg>
     )}
     <span>{soundEnabled ? "Suara ON" : "Mute"}</span>
   </button>
    <button
      onClick={handleSwitchCamera}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 border ${
        cameraFacing === "environment"
          ? "bg-isy-green-bright/15 text-isy-green-deep border-isy-green-bright/40"
          : "border-isy-line text-isy-ink/60 bg-white"
      }`}
      title="Ganti Kamera (Depan, Belakang, atau Webcam Eksternal)"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-isy-green-deep">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
      <span>{cameraFacing === "user" ? "Ganti Kamera" : "Kamera Belakang"}</span>
    </button>
    <button
      onClick={remoteConnected ? disconnectRemoteCamera : openRemoteCameraModal}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95 border ${
        remoteConnected
          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
          : "border-isy-line text-isy-ink/60 bg-white hover:bg-isy-mist"
      }`}
      title={remoteConnected ? "Kamera HP Samsung Terhubung (Klik untuk putuskan)" : "Hubungkan Kamera HP Samsung via QR Code"}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={remoteConnected ? "text-white" : "text-isy-green-deep"}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
      <span>{remoteConnected ? "🟢 Kamera HP ON" : "Kamera HP (QR)"}</span>
    </button>
  </div>
  <TimerChips
    value={timerSec}
    onChange={setTimerSec}
    disabled={phase !== "ready"}
  />
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

 {/* Overlays */}
      {phase === "frame-select" && <FramePicker onSelect={handleLayoutSelect} onBack={goHome} />}
      {phase === "theme-select" && (
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

      {/* "session-review" phase: Pop-up modal after all photos are auto-captured */}
      {phase === "session-review" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-isy-line text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider">
                🎉 Sesi Foto Selesai ({layout.numPhotos} Foto)
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
                Semua Foto Berhasil Diambil!
              </h3>
              <p className="text-xs sm:text-sm text-isy-ink/70 max-w-md mx-auto">
                Pilih <strong className="text-isy-green-deep">Ulang Foto</strong> pada foto tertentu jika ingin mengganti pose, atau langsung lihat hasil cetak frame kamu:
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
                  className="relative flex flex-col rounded-2xl overflow-hidden border-2 border-isy-line bg-white shadow-xs transition-all hover:border-isy-green-bright/60"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
                    {photoSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={photoSrc} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        Slot {idx + 1}
                      </div>
                    )}
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[9px] font-black text-white">
                      Foto {idx + 1}
                    </span>
                  </div>

                  {/* Single Slot Retake Button */}
                  <button
                    onClick={() => {
                      unlockAudio();
                      handleRetakeSingleSlot(idx);
                    }}
                    className="w-full flex items-center justify-center gap-1 py-2 px-1 bg-isy-mist hover:bg-isy-green-bright hover:text-white text-isy-green-deep text-[11px] font-black transition-all border-t border-isy-line active:scale-95 cursor-pointer"
                    title={`Ambil ulang Foto ${idx + 1} saja`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                    </svg>
                    <span>Ulang Foto {idx + 1}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Actions: Retake All vs Ganti Tema vs Lanjut */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {/* Retake All Photos */}
              <button
                onClick={() => {
                  unlockAudio();
                  resetSession();
                  setCurrentSlot(0);
                  setPhase("countdown");
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl border-2 border-isy-line bg-isy-mist hover:bg-white text-isy-green-deep font-black text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                </svg>
                <span>Ulang Semua</span>
              </button>

              {/* Ganti Tema Frame */}
              <button
                onClick={() => setPhase("theme-select")}
                className="inline-flex items-center justify-center gap-1.5 py-3.5 px-3.5 rounded-2xl border border-isy-green-bright/40 bg-white hover:bg-isy-mist text-isy-green-deep font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Ganti Tema</span>
              </button>

              {/* Lanjut Lihat Hasil */}
              <button
                onClick={() => setPhase("compositing")}
                className="group relative flex-[1.4] overflow-hidden rounded-2xl bg-isy-green-bright py-3.5 px-5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-95 transition-all cursor-pointer"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-1.5">
                  <span>Lanjut, Lihat Hasil →</span>
                </span>
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
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-isy-line text-center space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setDevNoticeModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-isy-mist flex items-center justify-center text-isy-ink/50 hover:text-isy-green-deep hover:bg-isy-line transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <span className="text-3xl">🚧</span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                Sedang Dalam Pengembangan
              </span>
              <h3 className="font-serif text-2xl font-bold text-isy-green-deep">
                Fitur Try-On 3D Segera Hadir!
              </h3>
              <p className="text-xs sm:text-sm text-isy-ink/70 leading-relaxed pt-1">
                Pengalaman fitting kacamata 3D Real-Time CAD saat ini sedang dalam proses riset &amp; kalibrasi presisi frame oleh tim *Optik I See You*.
              </p>
              <p className="text-xs text-isy-green-deep font-semibold bg-isy-mist/70 p-3 rounded-xl border border-isy-line">
                ✨ Disarankan menggunakan **Try-On AR 2D &amp; Photobooth** yang sudah siap 100% dengan katalog lengkap dan cetak foto strip!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setDevNoticeModalOpen(false);
                  router.push("/photobooth?mode=ar");
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-isy-green-bright text-white font-bold text-sm shadow-md shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Buka Try-On AR 2D (Direkomendasikan)</span>
              </button>
              <button
                onClick={() => {
                  setDevNoticeModalOpen(false);
                  router.push("/try-on");
                }}
                className="w-full py-2 text-xs font-bold text-isy-ink/50 hover:text-isy-green-deep transition-colors cursor-pointer"
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
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-isy-line text-center space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsRemoteModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-isy-mist flex items-center justify-center text-isy-ink/50 hover:text-isy-green-deep hover:bg-isy-line transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-isy-green-bright/15 text-isy-green-deep text-[11px] font-black uppercase tracking-wider">
                📱 Kamera HP Nirkabel
              </span>
              <h3 className="font-serif text-xl font-bold text-isy-green-deep">
                Scan QR dengan HP Samsung
              </h3>
              <p className="text-xs text-isy-ink/65">
                Gunakan kamera belakang HP Samsung Anda sebagai kamera utama photobooth!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="mx-auto flex flex-col items-center justify-center p-3 rounded-2xl bg-isy-mist border border-isy-line">
              {remoteQrUrl ? (
                <img
                  src={remoteQrUrl}
                  alt="Scan QR Kamera HP"
                  className="w-52 h-52 rounded-xl shadow-xs object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-xs text-isy-ink/50 animate-pulse">
                  Menyiapkan QR Code...
                </div>
              )}
            </div>

            <div className="text-left bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/60 space-y-1.5 text-[11px] text-emerald-950">
              <p className="font-bold flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white">1</span>
                Buka Kamera HP Samsung ➡️ Scan QR di atas
              </p>
              <p className="font-bold flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white">2</span>
                Klik link &amp; izinkan akses kamera
              </p>
              <p className="text-[10px] text-emerald-800 pt-0.5">
                ✨ Kamera HP akan otomatis terhubung ke Tablet ini dalam hitungan detik.
              </p>
            </div>

            <button
              onClick={() => setIsRemoteModalOpen(false)}
              className="w-full py-2.5 rounded-xl border border-isy-line bg-white hover:bg-isy-mist text-xs font-bold text-isy-ink/70 transition-all cursor-pointer"
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
