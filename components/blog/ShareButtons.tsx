"use client";

import { useState } from "react";
import { Link as LinkIcon, Share2, Check, Download, ExternalLink, X } from "lucide-react";

export default function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const url =
    typeof window !== "undefined"
      ? window.location.origin + "/blog/" + slug
      : "https://optikiseeyou.com/blog/" + slug;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareWA = () => {
    // Professional concise news brief without redundant title repetition
    const text = encodeURIComponent(
      "Agenda Resmi: Booth Optik I See You hadir di Banyumas Wedding Expo 2026 (Rita SuperMall Purwokerto).\n\n" +
      "• Jadwal: 4 – 6 September 2026 (10.00 – 22.00 WIB)\n" +
      "• Lokasi: Ground Floor (Depan J.CO & Samping Lift GF)\n" +
      "• Layanan: Pemeriksaan Refraksi & Studio Photobooth Gratis\n\n" +
      "Informasi & video dokumentasi lengkap:\n" + url
    );
    window.open("https://api.whatsapp.com/send?text=" + text, "_blank");
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: "Informasi booth Optik I See You di Rita SuperMall Purwokerto: " + title,
          url,
        });
      } catch {
        // Dismissed
      }
    } else {
      copyLink();
    }
  };

  const openInstagramStory = () => {
    copyLink();
    window.location.href = "instagram://story-camera";
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 1200);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 border-t border-b border-isy-line py-6 my-10">
        <span className="font-semibold text-isy-ink flex items-center text-sm mr-1">
          <Share2 className="w-4 h-4 mr-2 text-isy-green-deep" /> Bagikan:
        </span>

        {/* WhatsApp Button */}
        <button
          onClick={shareWA}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#25D366] text-white hover:bg-[#20b858] active:scale-95 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          <span>WhatsApp</span>
        </button>

        {/* Dedicated Instagram Story Button */}
        <button
          onClick={() => {
            copyLink();
            setIsStoryModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-95 active:scale-95 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span>Instagram Story</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-isy-line bg-white hover:bg-isy-mist active:scale-95 transition-all text-xs font-semibold text-isy-ink shadow-2xs cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
          <span>{copied ? "Tautan Tersalin" : "Salin Tautan"}</span>
        </button>

        {/* Native Share Button */}
        <button
          onClick={shareNative}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-isy-line bg-white hover:bg-isy-mist active:scale-95 transition-all text-xs font-semibold text-isy-green-deep shadow-2xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Lainnya</span>
        </button>
      </div>

      {/* ═══ INSTAGRAM STORY SHARING MODAL ═══ */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-isy-line overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-isy-line mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fd5949] to-[#d6249f] flex items-center justify-center text-white shadow-xs">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-isy-green-deep">Bagikan ke Instagram Story</h4>
                  <p className="text-[11px] text-isy-ink/60">Panduan berbagi profesional dengan stiker tautan</p>
                </div>
              </div>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="p-1 rounded-full text-isy-ink/40 hover:text-isy-ink hover:bg-isy-mist transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Preview Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-isy-green-deep to-[#0b3320] p-4 text-white text-center mb-5 overflow-hidden shadow-inner">
              <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-300 block mb-1">
                Pratinjau Stiker Instagram Story
              </span>
              <p className="text-sm font-dm-serif line-clamp-1 mb-3 px-2">
                Banyumas Wedding Expo 2026 • Rita SuperMall
              </p>

              {/* Fake Instagram Link Sticker */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 text-isy-green-deep text-xs font-bold shadow-lg border border-white/40">
                <LinkIcon className="w-3.5 h-3.5 text-isy-green-deep" />
                <span className="truncate max-w-[190px]">optikiseeyou.com</span>
                <ExternalLink className="w-3 h-3 text-isy-ink/40" />
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 mb-6 text-xs text-isy-ink/80">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-isy-mist text-isy-green-deep font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>Tautan Artikel Telah Disalin:</strong> Tautan otomatis tersimpan di clipboard perangkat Anda.
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-isy-mist text-isy-green-deep font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>Buka Instagram Story:</strong> Buat Story baru menggunakan foto/video dokumentasi booth pameran.
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-isy-mist text-isy-green-deep font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>Pasang Stiker Tautan:</strong> Pilih menu Stiker di Instagram &rarr; pilih <em>Tautan (Link)</em> &rarr; tempel tautan artikel ini.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={openInstagramStory}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold text-xs tracking-wide shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Aplikasi Instagram</span>
              </button>

              <a
                href="/blog/banyumas-wedding-expo-2026.jpg"
                download="Poster-Banyumas-Wedding-Expo-OptikISeeYou.jpg"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-isy-line bg-isy-mist/50 hover:bg-isy-mist text-isy-green-deep font-medium text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar Poster untuk Background Story</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
