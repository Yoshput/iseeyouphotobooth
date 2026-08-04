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
import { FRAME_LAYOUTS, type FrameLayout } from "@/lib/frameLayouts";
import { compositeFrame, FRAME_THEMES, type FrameTheme } from "@/lib/frameCompositor";
import { COLOR_FILTERS, type ColorFilter } from "@/lib/colorFilters";
import { detectFaceShape, SHAPE_META, type FaceShapeResult } from "@/lib/faceShape";
import { csWhatsappUrl } from "@/lib/branches";
import { uploadPhotoForQR } from "@/lib/uploadImage";
import { createAnimatedGif } from "@/lib/gifGenerator";
import { playShutterSound } from "@/lib/soundEffects";
import { downloadOrShareImage } from "@/lib/saveImage";
import manifestRaw from "@/public/glasses/manifest.json";

type BoothPhase =
 | "frame-select"
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

function FaceHUD({ result }: { result: FaceShapeResult | null }) {
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
function GiantQRModal({ uploadedUrl, onClose }: { uploadedUrl: string; onClose: () => void }) {
 const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&color=116B3C&data=${encodeURIComponent(uploadedUrl)}`;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
 <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4 border border-isy-green-bright/30">
 <button onClick={onClose} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"></button>

 <div className="space-y-1">
 <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-green-bright/10 px-3 py-1 text-xs font-bold text-isy-green-bright">
 <span> Pop-Up Event Booth Mode</span>
 </div>
 <h3 className="font-serif text-xl font-black text-isy-green-deep">Scan & Unduh di HP Kamu</h3>
 <p className="text-xs text-isy-ink/60">Arahkan kamera HP ke QR Code raksasa di bawah ini</p>
 </div>

 <div className="flex justify-center p-3 bg-isy-mist rounded-2xl border border-isy-green-bright/20 shadow-inner">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={qrApiUrl} alt="QR Code Event Raksasa" className="h-64 w-64 rounded-xl border-4 border-white bg-white object-contain shadow-lg" />
 </div>

 <p className="text-[11px] font-semibold text-isy-green-deep truncate">{uploadedUrl}</p>

 <button onClick={onClose} className="w-full rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-deep active:scale-95 transition-all">
 Tutup & Kembalikan Layar
 </button>
 </div>
 </div>
 );
}

function QRBox({ phase, uploadedUrl, onOpenGiantQR, onDownload }: {
 phase: UploadPhase; uploadedUrl: string | null; onOpenGiantQR: () => void; onDownload: () => void;
}) {
 if (phase === "idle") return null;

 if (phase === "uploading") {
 return (
 <div className="flex items-center gap-3 rounded-2xl border border-isy-green-bright/25 bg-isy-mist p-3">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-isy-green-bright border-t-transparent" />
 </div>
 <div>
 <p className="text-xs font-bold text-isy-green-deep"> Mengunggah Foto…</p>
 <p className="mt-0.5 text-[10px] leading-tight text-isy-ink/55">Menyiapkan QR untuk download di HP.</p>
 </div>
 </div>
 );
 }

 if (phase === "done" && uploadedUrl) {
 const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&color=116B3C&data=${encodeURIComponent(uploadedUrl)}`;
 return (
 <div className="flex items-center justify-between gap-3 rounded-2xl border border-isy-green-bright/40 bg-gradient-to-br from-[#E8F5E9] to-white p-3 shadow-sm">
 <div className="flex items-center gap-3">
 <div className="relative h-[60px] w-[60px] shrink-0">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={qrApiUrl} alt="QR Code" className="h-full w-full rounded-xl border-2 border-white bg-white object-contain shadow-md" />
 <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-isy-green-bright text-[8px] text-white"></span>
 </div>
 <div className="flex flex-col gap-0.5">
 <p className="text-xs font-black text-isy-green-deep"> Scan & Unduh di HP</p>
 <p className="text-[10px] leading-tight text-isy-ink/60">Arahkan kamera HP ke QR ini.</p>
 </div>
 </div>

 {/* Event Mode Giant QR Button */}
 <button
 onClick={onOpenGiantQR}
 className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-isy-green-bright px-3 py-2 text-[10px] font-black text-white shadow hover:bg-isy-green-deep active:scale-95 transition-all"
 >
 <span> Perbesar</span>
 <span className="text-[8px] font-medium opacity-80">Event Mode</span>
 </button>
 </div>
 );
 }

 return (
 <div className="flex items-center gap-3 rounded-2xl border border-dashed border-isy-line bg-white p-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-isy-mist text-lg"></div>
 <div>
 <p className="text-xs font-bold text-isy-ink/80">
 {phase === "no-key" ? "QR: Setup ImgBB/Cloudinary di .env.local" : "Upload QR Gagal"}
 </p>
 <button onClick={onDownload} className="mt-1 rounded-lg bg-isy-green-bright px-2.5 py-1 text-[10px] font-bold text-white active:scale-95">
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
            { icon: "📸", label: "Unduh Strip", fn: downloadStrip },
            { icon: "🎬", label: "Unduh GIF", fn: downloadGif, disabled: !gifUrl },
            { icon: "💬", label: "WhatsApp", fn: shareWA },
            { icon: "✨", label: "Instagram Story", fn: shareIG },
          ].map(({ icon, label, fn, disabled }) => (
            <button key={label} onClick={fn} disabled={disabled}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-isy-line bg-isy-mist p-3 text-xs font-bold text-isy-green-deep hover:border-isy-green-bright hover:bg-white transition-all active:scale-95 disabled:opacity-40">
              <span className="text-2xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
// ── TryOnResult: Clean single-photo result for AR Try-On mode ──────────────
// Per spec: NO photobooth strip border, NO brand watermark, NO multi-slot.
// Primary CTA = WhatsApp CS to check stock.
function TryOnResult({
  photoUrl, arGlassesName, onRetake, onDownload, onOpenShareModal,
}: {
  photoUrl: string; arGlassesName?: string;
  onRetake: () => void; onDownload: () => void; onOpenShareModal: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
          <span className="text-xs font-black uppercase tracking-widest text-isy-green-bright">Hasil Try On 🕶️</span>
        </div>
        <span className="rounded-full bg-isy-mist border border-isy-line px-3 py-1 text-[10px] font-extrabold text-isy-green-deep">
          Clean Photo
        </span>
      </div>

      {/* Clean photo — no photobooth strip frame or brand watermark */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-isy-green-bright/30 shadow-xl max-h-[360px] flex items-center justify-center bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="Hasil Try On Kacamata" className="h-full max-h-[360px] w-full object-contain" />
        {arGlassesName && (
          <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/60 backdrop-blur-md px-4 py-2 text-white flex items-center justify-between">
            <span className="text-xs font-extrabold">Model: {arGlassesName}</span>
            <span className="text-[10px] text-isy-green-bright font-bold">✨ Live Try-On</span>
          </div>
        )}
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
  layout, photos, compositeUrl, gifUrl, uploadedUrl, uploadPhase,
  phase, photoCount, selectedTheme, selectedFilter,
  onSelectTheme, onSelectFilter, onOpenGiantQR,
  onDownloadStrip, onDownloadGif, onRetake, onChangeLayout, onOpenShareModal,
  onRetakeSingleSlot, arGlassesName, isArMode = false,
}: {
  layout: FrameLayout; photos: string[]; compositeUrl: string | null;
  gifUrl: string | null; uploadedUrl: string | null; uploadPhase: UploadPhase;
  phase: BoothPhase; photoCount: number; selectedTheme: string; selectedFilter: string;
  onSelectTheme: (tId: string) => void; onSelectFilter: (fId: string) => void;
  onOpenGiantQR: () => void;
  onDownloadStrip: () => void; onDownloadGif: () => void;
  onRetake: () => void; onChangeLayout: () => void; onOpenShareModal: () => void;
  onRetakeSingleSlot: (slotIdx: number) => void;
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

  // AR Try-On clean result — no strip frame, no watermark
  if (phase === "result" && isArMode && photos[0]) {
    return (
      <TryOnResult
        photoUrl={photos[0]}
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
          <span className="text-[10px] font-bold text-isy-green-deep">Filter Warna:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {COLOR_FILTERS.map((f) => (
              <button key={f.id} onClick={() => onSelectFilter(f.id)}
                className={`flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[9.5px] font-bold transition-all active:scale-95 ${f.id === selectedFilter ? "border-isy-green-bright bg-isy-green-bright text-white shadow-sm" : "border-isy-line bg-white text-isy-ink/70 hover:border-isy-green-bright/50"}`}>
                <span>{f.emoji}</span><span>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frame theme chips */}
        {activeTab === "strip" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[10px] font-bold text-isy-ink/40 shrink-0">Frame:</span>
            {FRAME_THEMES.map((th) => (
              <button key={th.id} onClick={() => onSelectTheme(th.id)}
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold transition-all active:scale-95 ${th.id === selectedTheme ? "border-isy-green-bright bg-isy-green-bright/10 text-isy-green-deep shadow-sm" : "border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright/40"}`}>
                <span className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: th.bgColor }} />
                {th.name}
              </button>
            ))}
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

        <QRBox phase={uploadPhase} uploadedUrl={uploadedUrl} onOpenGiantQR={onOpenGiantQR} onDownload={onDownloadStrip} />

        <div className="grid grid-cols-2 gap-2">
          {activeTab === "strip" ? (
            <button onClick={onDownloadStrip} className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-deep active:scale-[0.97]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M12 3v13" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>
              Simpan Foto
            </button>
          ) : (
            <button onClick={onDownloadGif} disabled={!gifUrl} className="flex items-center justify-center gap-2 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-deep active:scale-[0.97] disabled:opacity-50">
              Simpan GIF
            </button>
          )}
          <button onClick={onOpenShareModal} className="flex items-center justify-center gap-2 rounded-xl border border-isy-green-bright bg-white py-3 text-xs font-bold text-isy-green-deep shadow-sm hover:bg-isy-mist active:scale-[0.97]">
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
 const [timerSec, setTimerSec] = useState<TimerSec>(3);
 const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
 const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
 const [isScanning, setIsScanning] = useState(false);
 const [scanComplete, setScanComplete] = useState(false);

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

 const handleFaceCountChange = (c: number) => {
 const detected = c > 0;
 setFaceDetected(detected);
 if (arEnabled && detected && !scanComplete && !isScanning) {
 setIsScanning(true);
 setTimeout(() => {
 setIsScanning(false);
 setScanComplete(true);
 }, 2500);
 }
 };

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
 setPhotos([]);
 setCurrentSlot(0);
 setSingleSlotRetake(null);
 setCompositeUrl(null);
 setGifUrl(null);
 setUploadedUrl(null);
 setUploadPhase("idle");
 setScanComplete(false);
 }, []);

 const handleLayoutSelect = useCallback((chosen: FrameLayout) => {
 setLayout(chosen);
 resetSession();
 setPhase("ready");
 }, [resetSession]);

 const handleRetake = useCallback(() => {
 resetSession();
 if (arEnabled) {
 setLayout(FRAME_LAYOUTS[0]);
 }
 setPhase("ready");
 }, [resetSession, arEnabled]);

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

 // Play Shutter Audio Effect! 
 playShutterSound();

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

 compositeFrame(layout, photos, themeId, colorFilterId).then((url) => {
 if (!cancelled) {
 setCompositeUrl(url);
 setPhase("result");

 // Celebration Confetti! 
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
 }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

 // Auto-upload both Photo Strip and Animated GIF to Cloudinary/ImgBB for QR code
 useEffect(() => {
 if (phase !== "result" || !compositeUrl) return;
 let cancelled = false;
 setUploadPhase("uploading");

 uploadPhotoForQR(compositeUrl, gifUrl).then((result) => {
 if (cancelled) return;
 if (result.ok) {
 setUploadedUrl(result.qrPageUrl);
 setUploadPhase("done");
 } else if (result.error === "IMGBB_KEY_MISSING") {
 setUploadPhase("no-key");
 } else {
 console.warn("QR upload:", result.error);
 setUploadPhase("error");
 }
 });
 return () => { cancelled = true; };
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
 onFaceCountChange={handleFaceCountChange}
 onLandmarksChange={(lm) => {
 if (!arEnabled || !aiMode || !lm) return;
 const r = detectFaceShape(lm);
 if (r.confidence > 0.3) {
 setFaceResult(r);
 const idx = manifest.findIndex((g) => g.id === r.recommendedGlassesId);
 if (idx >= 0) setGlassesIndex(idx);
 }
 }}
 />

  {/* 2.5-second AR Face Scanning Animation Overlay */}
  {isScanning && (
  <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
  {/* Scan frame */}
  <div className="relative z-10 flex flex-col items-center gap-4">
  <div className="relative h-48 w-36">
  {/* Corner brackets */}
  <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-isy-green-bright rounded-tl-lg" />
  <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-isy-green-bright rounded-tr-lg" />
  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-isy-green-bright rounded-bl-lg" />
  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-isy-green-bright rounded-br-lg" />
  {/* Horizontal scan line animation */}
  <div
  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-isy-green-bright to-transparent shadow-[0_0_12px_2px_rgba(47,168,79,0.8)]"
  style={{ animation: "scanline 1.2s ease-in-out infinite alternate" }}
  />
  </div>
  <div className="flex flex-col items-center gap-1.5">
  <p className="text-sm font-black text-white tracking-wide">Scanning Bentuk Wajah…</p>
  <div className="flex gap-1.5">
  {[0, 1, 2].map((i) => (
  <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-isy-green-bright" style={{ animationDelay: `${i * 0.2}s` }} />
  ))}
  </div>
  </div>
  </div>
  </div>
  )}

 <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: 0 }} aria-hidden />

 {phase === "countdown" && (
 <Countdown from={timerSec} duration={1} onComplete={handleCountdownComplete} />
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

 <div className="flex items-center justify-between">
 {arEnabled && (
 <div className="flex items-center gap-2">
 <AIModeToggle on={aiMode} onToggle={() => setAiMode((v) => !v)} />
 {aiMode && <FaceHUD result={faceResult} />}
 </div>
 )}
 <div className={`flex items-center gap-1 text-[10px] font-bold ${faceDetected ? "text-isy-green-bright" : "text-isy-ink/30"}`}>
 <span className={`h-1.5 w-1.5 rounded-full ${faceDetected ? "animate-pulse bg-isy-green-bright" : "bg-isy-ink/20"}`} />
 {faceDetected ? "Terdeteksi" : "Tidak ada wajah"}
 </div>
 </div>

 <div className="flex items-center justify-between gap-2 flex-wrap">
 <div className="flex gap-2">
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
 onRetakeSingleSlot={handleRetakeSingleSlot}
 arGlassesName={arEnabled ? glasses?.name : undefined}
 isArMode={arEnabled}
 />
 )}
 </div>

 {/* Overlays */}
 {phase === "frame-select" && <FramePicker onSelect={handleLayoutSelect} onBack={goHome} />}
 {shareModalOpen && compositeUrl && (
 <ShareModal compositeUrl={compositeUrl} gifUrl={gifUrl} onClose={() => setShareModalOpen(false)} onToast={showToast} />
 )}
 {giantQRModalOpen && uploadedUrl && (
 <GiantQRModal uploadedUrl={uploadedUrl} onClose={() => setGiantQRModalOpen(false)} />
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
