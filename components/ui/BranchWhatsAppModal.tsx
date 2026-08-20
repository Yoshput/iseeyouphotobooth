"use client";

/**
 * components/ui/BranchWhatsAppModal.tsx
 *
 * Modal popup pemilihan nomor WhatsApp dari 4 cabang Optik I See You:
 * - Purwokerto
 * - Purbalingga
 * - Cilacap
 * - Wonosobo
 *
 * Memudahkan pengunjung memilih cabang kota terdekat untuk langsung chat WhatsApp ke CS cabang terkait.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRANCHES, type Branch, branchWhatsappUrl, mapsDirectionsUrl } from "@/lib/branches";

interface BranchWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CITY_ACCENT_COLORS: Record<string, { badgeBg: string; badgeText: string; borderHover: string }> = {
  purwokerto: {
    badgeBg: "bg-emerald-100 text-emerald-800",
    badgeText: "Purwokerto",
    borderHover: "hover:border-emerald-500",
  },
  purbalingga: {
    badgeBg: "bg-teal-100 text-teal-800",
    badgeText: "Purbalingga",
    borderHover: "hover:border-teal-500",
  },
  cilacap: {
    badgeBg: "bg-green-100 text-green-800",
    badgeText: "Cilacap",
    borderHover: "hover:border-green-500",
  },
  wonosobo: {
    badgeBg: "bg-lime-100 text-lime-800",
    badgeText: "Wonosobo",
    borderHover: "hover:border-lime-500",
  },
};

export default function BranchWhatsAppModal({ isOpen, onClose }: BranchWhatsAppModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = "hidden";
      return () => cancelAnimationFrame(t);
    } else {
      setMounted(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="branch-wa-modal-title"
    >
      <div
        className={`relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl transition-all duration-300 sm:rounded-[2rem] ${
          mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-[0.97]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#116B3C] via-[#2FA84F] to-[#86EFAC]" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-isy-line/60 bg-gradient-to-b from-isy-mist/40 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-sm">
              <Image
                src="/logo/Logo-Whatsapp.png"
                alt="WhatsApp"
                width={28}
                height={28}
                className="h-7 w-7 object-contain drop-shadow-xs"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 mb-1 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Respon Cepat 4 Cabang
                </span>
              </div>
              <h2 id="branch-wa-modal-title" className="font-serif text-lg sm:text-xl font-black text-isy-green-deep">
                Pilih WhatsApp Cabang Terdekat
              </h2>
              <p className="text-xs text-isy-ink/60 mt-0.5">
                Silakan hubungi admin cabang kota Anda untuk tanya stok, lensa &amp; jadwal periksa:
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-isy-ink/60 transition hover:bg-gray-200 active:scale-95"
            aria-label="Tutup modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Branch List Items */}
        <div className="overflow-y-auto px-6 py-4 space-y-3 divide-y divide-transparent">
          {BRANCHES.map((branch: Branch) => {
            const colors = CITY_ACCENT_COLORS[branch.id] || {
              badgeBg: "bg-emerald-100 text-emerald-800",
              badgeText: branch.city,
              borderHover: "hover:border-emerald-500",
            };

            return (
              <div
                key={branch.id}
                className={`group relative rounded-2xl border border-isy-line bg-isy-mist/30 p-4 transition-all duration-200 hover:bg-white hover:shadow-md ${colors.borderHover}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colors.badgeBg}`}>
                        {branch.city}
                      </span>
                      <h3 className="text-sm font-bold text-isy-green-deep">
                        {branch.name}
                      </h3>
                    </div>

                    <p className="text-xs text-isy-ink/70 line-clamp-1 leading-relaxed">
                      {branch.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-isy-ink/60 pt-0.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.46 16z"/>
                        </svg>
                        {branch.phone}
                      </span>
                      <span>&bull;</span>
                      <span>{branch.hours}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <a
                      href={mapsDirectionsUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka lokasi di Google Maps"
                      className="inline-flex items-center justify-center p-2.5 rounded-xl border border-isy-line bg-white text-isy-ink/70 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </a>

                    <a
                      href={branchWhatsappUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onClose()}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-lg transition-all active:scale-95"
                    >
                      <Image
                        src="/logo/Logo-Whatsapp.png"
                        alt="WA"
                        width={14}
                        height={14}
                        className="h-3.5 w-3.5 object-contain"
                      />
                      <span>Chat WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-isy-mist/50 border-t border-isy-line/60 text-center">
          <p className="text-[11px] text-isy-ink/50">
            Layanan konsultasi kacamata &amp; periksa mata resmi Optik I See You
          </p>
        </div>
      </div>
    </div>
  );
}
