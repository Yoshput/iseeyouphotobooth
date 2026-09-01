"use client";

/**
 * app/download/page.tsx
 * Branded Mobile Download Portal for Optik I See You Photobooth.
 * Opened when visitors scan the QR Code on their smartphone!
 */

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { downloadOrShareImage } from "@/lib/saveImage";

function DownloadPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const photoId = searchParams?.get("id") || "";
  const directStrip = searchParams?.get("strip") || "";
  const directGif = searchParams?.get("gif") || "";

  const defaultTab = searchParams?.get("tab") === "gif" ? "gif" : "strip";
  const [activeTab, setActiveTab] = useState<"strip" | "gif">(defaultTab);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Derive R2 public domain if photoId is used
  const r2PublicDomain = (
    process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || ""
  ).replace(/\/+$/, "");

  const isCustomDomain =
    r2PublicDomain &&
    !r2PublicDomain.includes(".r2.dev") &&
    !r2PublicDomain.includes("cloudflarestorage.com");

  // If using custom domain, load directly from CDN; otherwise stream reliably via /api/photo
  const retryParam = retryCount > 0 ? `&_r=${retryCount}` : "";
  const stripUrl =
    (directStrip && !directStrip.includes(".r2.dev") ? directStrip : null) ||
    (photoId
      ? isCustomDomain
        ? `${r2PublicDomain}/photos/${photoId}.jpg${retryCount > 0 ? `?_r=${retryCount}` : ""}`
        : `/api/photo?id=${encodeURIComponent(photoId)}&type=jpg${retryParam}`
      : directStrip);

  const gifUrl =
    (directGif && !directGif.includes(".r2.dev") ? directGif : null) ||
    (photoId
      ? isCustomDomain
        ? `${r2PublicDomain}/photos/${photoId}.gif${retryCount > 0 ? `?_r=${retryCount}` : ""}`
        : `/api/photo?id=${encodeURIComponent(photoId)}&type=gif${retryParam}`
      : directGif);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageError = () => {
    if (photoId && retryCount < 5) {
      setIsRetrying(true);
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setIsRetrying(false);
      }, 1400);
    } else {
      setImageError(true);
    }
  };

  const handleDownloadStrip = async () => {
    if (!stripUrl) return;
    showToast("Mengunduh foto HD ke galeri...");
    const res = await downloadOrShareImage(
      stripUrl,
      `iseeyou-photobooth-${photoId || Date.now()}.jpg`,
      "Optik I See You — Foto Strip HD"
    );
    if (res.success) {
      showToast("Foto berhasil diunduh & tersimpan di galeri!");
    } else {
      showToast("Gagal mengunduh foto.");
    }
  };

  const handleDownloadGif = async () => {
    if (!gifUrl) return;
    showToast("Mengunduh GIF animasi ke galeri...");
    const res = await downloadOrShareImage(
      gifUrl,
      `iseeyou-animasi-${photoId || Date.now()}.gif`,
      "Optik I See You — Animasi GIF"
    );
    if (res.success) {
      showToast("GIF animasi berhasil diunduh & tersimpan!");
    } else {
      showToast("Gagal mengunduh GIF.");
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link foto berhasil disalin! 📋");
      } else {
        showToast("Link: " + window.location.href);
      }
    } catch {
      showToast("Link siap dibagikan!");
    }
  };

  const handleOpenIG = () => {
    if (typeof window !== "undefined") {
      window.open("https://www.instagram.com/iseeyou.glasses/", "_blank");
    }
  };

  // ── Syncing / Retrying Screen (when scanned instantaneously) ─────────────
  if (isRetrying) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center bg-[#FDFBF7] text-isy-ink selection:bg-isy-green-bright/20">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-isy-line text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={140}
              height={52}
              className="h-8 w-auto mx-auto object-contain"
              priority
            />
          </Link>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-isy-green-deep shadow-2xs">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-isy-green-bright border-t-transparent" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-lg font-bold text-isy-green-deep">
              Menyiapkan Foto HD Anda…
            </h2>
            <p className="text-xs text-isy-ink/70 leading-relaxed">
              Foto baru saja selesai diambil dan sedang disinkronkan ke cloud. Mohon tunggu sebentar…
            </p>
          </div>

          <div className="pt-2">
            <div className="h-1.5 w-full bg-isy-mist rounded-full overflow-hidden">
              <div className="h-full bg-isy-green-bright rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Expired / 404 Not Found Screen ─────────────────────────────────────────
  if ((!stripUrl && !gifUrl) || imageError) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center bg-[#FDFBF7] text-isy-ink selection:bg-isy-green-bright/20">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-isy-line text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={150}
              height={58}
              className="h-9 w-auto mx-auto object-contain"
              priority
            />
          </Link>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
              Masa Simpan Berakhir
            </span>
            <h2 className="font-serif text-xl font-bold text-isy-green-deep">
              Foto Sudah Tidak Tersedia
            </h2>
            <p className="text-xs text-isy-ink/70 leading-relaxed pt-1">
              Foto ini sudah melewati batas masa penyimpanan 7 hari atau sudah dihapus otomatis sesuai kebijakan privasi dan pembersihan Cloudflare R2 Optik I See You.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => router.push("/photobooth")}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-isy-green-bright text-white font-bold text-xs shadow-md hover:bg-isy-green-deep active:scale-95 transition-all cursor-pointer"
            >
              <span>📸 Coba Photobooth Baru</span>
            </button>
            <Link
              href="/"
              className="w-full py-2.5 text-xs font-bold text-isy-ink/50 hover:text-isy-green-deep transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Normal Active Download Screen ──────────────────────────────────────────
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-4 sm:p-6 bg-[#FDFBF7] text-isy-ink selection:bg-isy-green-bright/20">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-7 shadow-xl border border-isy-line text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={140}
              height={52}
              className="h-8 w-auto mx-auto object-contain"
              priority
            />
          </Link>
          <div className="space-y-0.5">
            <h1 className="font-serif text-lg font-bold text-isy-green-deep">
              Hasil Foto Photobooth
            </h1>
            <p className="text-[11px] text-isy-ink/60">
              Download langsung foto HD & animasi GIF ke galeri HP kamu
            </p>
          </div>
        </div>

        {/* 7 Days Expiry Notice Pill */}
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-[10px] font-semibold text-amber-800">
          <span>⏰</span>
          <span>Foto cloud aktif 7 hari. Segera simpan ke galeri!</span>
        </div>

        {/* Tab Switcher: Strip vs GIF */}
        {gifUrl && (
          <div className="flex rounded-full border border-isy-line bg-isy-mist p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("strip")}
              className={`flex-1 rounded-full py-2 transition-all cursor-pointer ${
                activeTab === "strip"
                  ? "bg-white text-isy-green-deep shadow-xs"
                  : "text-isy-ink/50"
              }`}
            >
              Foto Strip HD
            </button>
            <button
              onClick={() => setActiveTab("gif")}
              className={`flex-1 rounded-full py-2 transition-all cursor-pointer ${
                activeTab === "gif"
                  ? "bg-white text-isy-green-deep shadow-xs"
                  : "text-isy-ink/50"
              }`}
            >
              GIF Animasi ✨
            </button>
          </div>
        )}

        {/* Display Area */}
        <div className="overflow-hidden rounded-2xl border border-isy-line bg-black/5 flex items-center justify-center p-2 min-h-[280px]">
          {activeTab === "strip" || !gifUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={stripUrl}
              alt="Foto Strip Optik I See You"
              onError={handleImageError}
              className="max-h-[420px] w-full object-contain rounded-xl shadow"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={gifUrl}
              alt="GIF Animasi Optik I See You"
              onError={() => {
                // If GIF fails, fall back to strip
                setActiveTab("strip");
              }}
              className="max-h-[420px] w-full object-contain rounded-xl shadow"
            />
          )}
        </div>

        {/* Cross-device saving instructions tip */}
        <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/60 p-2.5 text-left text-[11px] text-emerald-950 leading-relaxed space-y-1">
          <p className="font-bold flex items-center gap-1 text-isy-green-deep">
            <span>💡</span> Cara Simpan ke Galeri:
          </p>
          <ul className="list-disc list-inside text-[10.5px] text-emerald-900/80 space-y-0.5">
            <li>Klik tombol hijau <b>Unduh ke Galeri</b> di bawah.</li>
            <li>Di iPhone / Android, Anda juga bisa <b>tekan & tahan foto</b> di atas, lalu pilih <b>&quot;Simpan ke Foto&quot;</b> / <b>&quot;Download Gambar&quot;</b>.</li>
          </ul>
        </div>

        {/* Download Buttons */}
        <div className="space-y-2 pt-1">
          {stripUrl && (
            <button
              onClick={handleDownloadStrip}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-isy-green-deep active:scale-95 cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                <path d="M12 3v13" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              Unduh Foto Strip HD ke Galeri
            </button>
          )}

          {gifUrl && (
            <button
              onClick={handleDownloadGif}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-isy-green-bright bg-white py-3.5 text-xs font-black uppercase tracking-wider text-isy-green-deep shadow-xs transition-all hover:bg-isy-mist active:scale-95 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                <path d="M12 3v13" />
                <path d="M7 11l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              Unduh GIF Animasi ke Galeri
            </button>
          )}
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep hover:bg-white transition-all active:scale-95 cursor-pointer"
          >
            <span>🔗 Salin Link</span>
          </button>
          <button
            onClick={handleOpenIG}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep hover:bg-white transition-all active:scale-95 cursor-pointer"
          >
            <span>📸 Instagram</span>
          </button>
        </div>

        {/* Brand Footer */}
        <div className="pt-2 text-center border-t border-isy-line">
          <a
            href="https://www.instagram.com/iseeyou.glasses/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-isy-green-bright hover:underline"
          >
            @iseeyou.glasses · Optik I See You
          </a>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="rounded-full bg-isy-green-deep px-5 py-2 text-xs font-semibold text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}

export default function DownloadPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-isy-mist text-xs font-bold text-isy-green-deep">
          Memuat Portal Download…
        </div>
      }
    >
      <DownloadPortalContent />
    </Suspense>
  );
}
