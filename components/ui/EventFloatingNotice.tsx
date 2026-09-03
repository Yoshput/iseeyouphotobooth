"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function EventFloatingNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Auto-open fully with smooth entry
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsMinimized(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <aside aria-label="Agenda Pameran Optik I See You" className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3 sm:right-6 z-40">
        <button
          onClick={handleExpand}
          className="group inline-flex items-center gap-2 rounded-full border border-emerald-300/90 bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-isy-green-deep shadow-xl transition-all hover:border-emerald-500 hover:shadow-2xl active:scale-95 cursor-pointer"
        >
          {/* Glowing Green Live Beacon */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100/90 text-emerald-800 font-extrabold text-[10px] tracking-wider uppercase">Live</span>
          <span className="text-[11px] sm:text-xs">Booth Rita SuperMall (4–6 Sep)</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-y-0.5"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Pengumuman Acara Rita SuperMall"
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-[450px] z-40 animate-in fade-in slide-in-from-bottom-5 duration-400"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-emerald-500/25 bg-white/98 backdrop-blur-2xl p-3 sm:p-5 shadow-2xl transition-all hover:border-emerald-500/40">
        {/* Header line & close button */}
        <div className="flex items-center justify-between mb-2.5 pb-2 sm:mb-3.5 sm:pb-3 border-b border-isy-line">
          <div className="flex items-center gap-2">
            {/* Glowing Green Active Radar Beacon */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10B981]" />
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Booth Sedang Aktif
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-isy-ink/60 hidden sm:inline">
              Rita SuperMall Purwokerto
            </span>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Kecilkan Pengumuman"
            title="Kecilkan Pengumuman"
            className="p-1 rounded-full text-isy-ink/40 hover:text-isy-ink hover:bg-isy-mist transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body with Thumbnail & Meta */}
        <Link
          href="/blog/optik-i-see-you-banyumas-wedding-expo-rita-supermall"
          className="group block"
        >
          <div className="flex gap-3 sm:gap-4 items-start">
            {/* Thumbnail Preview */}
            <div className="relative w-18 h-20 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 border border-isy-line bg-black/5 shadow-xs">
              {/* Active Green Badge on thumbnail */}
              <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-black/70 backdrop-blur-md text-[8px] sm:text-[9px] font-extrabold text-white tracking-wider uppercase border border-white/10">
                <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] animate-pulse" />
                Live
              </div>
              <Image
                src="/blog/covers/cover-wedding-expo-rsm.jpg"
                alt="Booth Optik I See You di Rita SuperMall Purwokerto"
                fill
                sizes="(max-width: 640px) 72px, 96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center pl-0.5 shadow-md group-hover:scale-110 transition-transform">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-isy-green-deep ml-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors line-clamp-2">
                Booth Optik I See You di Banyumas Wedding Expo 2026
              </h4>

              <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs text-isy-ink/75">
                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-isy-green-deep">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="font-semibold text-isy-ink truncate">4 – 6 Sep 2026 (10.00 – 22.00 WIB)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-isy-green-deep">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate font-medium">Depan J.CO &amp; Samping Lift GF</span>
                </div>
              </div>

              <div className="mt-1.5">
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-900 border border-emerald-200">
                  Cek Mata &amp; Photobooth Gratis
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Action Button */}
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-isy-line">
            <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-isy-green-deep group-hover:bg-isy-green-bright text-white text-[11px] sm:text-xs font-bold transition-all shadow-md active:scale-98">
              <span>Buka Informasi Booth &amp; Putar Video</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
