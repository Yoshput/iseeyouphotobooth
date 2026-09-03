"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function EventFloatingNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Check if user previously closed the notification during this session
    const isDismissed = sessionStorage.getItem("dismissed_rsm_notice");
    if (isDismissed) {
      setIsMinimized(true);
      setIsVisible(true);
      return;
    }

    // Delay entry slightly for a smooth, non-intrusive appearance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMinimized(true);
    sessionStorage.setItem("dismissed_rsm_notice", "true");
  };

  const handleExpand = () => {
    setIsMinimized(false);
    sessionStorage.removeItem("dismissed_rsm_notice");
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <aside aria-label="Agenda Pameran Optik I See You" className="fixed bottom-5 right-5 z-40">
        <button
          onClick={handleExpand}
          className="group inline-flex items-center gap-2.5 rounded-full border border-isy-line bg-white/95 backdrop-blur-md px-4 py-2 text-xs font-semibold text-isy-green-deep shadow-md transition-all hover:border-isy-green-bright hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Agenda: Booth Rita SuperMall (4–6 Sep)</span>
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
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="relative overflow-hidden rounded-2xl border border-isy-line bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl transition-all">
        {/* Header line & close button */}
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-isy-green-deep">
              Agenda Pameran • Rita SuperMall
            </span>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Tutup Pengumuman"
            className="rounded-full p-1 text-isy-ink/40 hover:text-isy-ink hover:bg-isy-mist transition-colors cursor-pointer"
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
          <div className="flex gap-3.5 items-start">
            {/* Thumbnail Preview */}
            <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-isy-line bg-black/5 shadow-xs">
              <Image
                src="/blog/covers/cover-wedding-expo-rsm.jpg"
                alt="Booth Optik I See You di Rita SuperMall Purwokerto"
                fill
                sizes="80px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center pl-0.5 shadow-xs">
                  <svg
                    width="12"
                    height="12"
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
              <h4 className="text-sm font-bold text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors line-clamp-2">
                Booth Optik I See You di Banyumas Wedding Expo 2026
              </h4>

              <div className="mt-2 space-y-1 text-xs text-isy-ink/70">
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-isy-green-deep">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="font-medium text-isy-ink">4 – 6 September 2026 (10.00 – 22.00 WIB)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-isy-green-deep">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">Depan J.CO &amp; Samping Lift GF</span>
                </div>
              </div>

              <div className="mt-2.5 inline-flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-isy-mist text-[11px] font-semibold text-isy-green-deep border border-isy-line">
                  Cek Mata &amp; Photobooth Gratis
                </span>
              </div>
            </div>
          </div>

          {/* Action Link Footer */}
          <div className="mt-3.5 pt-3 border-t border-isy-line flex items-center justify-between text-xs">
            <span className="text-isy-ink/60">Tersedia video dokumentasi lokasi</span>
            <span className="font-semibold text-isy-green-deep group-hover:text-isy-green-bright transition-colors flex items-center gap-1">
              <span>Buka Informasi Booth</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
