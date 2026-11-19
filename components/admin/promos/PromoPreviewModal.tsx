"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Monitor,
  Smartphone,
  Calendar,
  Clock,
  ExternalLink,
  Tag,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PromoItem, PromoDetailLayout, PromoCollageLayout } from "@/lib/db/types";
import {
  formatPromoPeriod,
  getCategoryLabel,
  getPromoDisplayStatus,
} from "@/lib/promo";

interface PromoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  promo: PromoItem | null;
  initialMode?: "microsite" | "popup";
}

export default function PromoPreviewModal({
  isOpen,
  onClose,
  promo,
  initialMode = "microsite",
}: PromoPreviewModalProps) {
  const [mode, setMode] = useState<"microsite" | "popup">(initialMode);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !promo) return null;

  const status = getPromoDisplayStatus(promo);
  const periodText = formatPromoPeriod(promo.startAt, promo.endAt);
  const categoryLabel = getCategoryLabel(promo.category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Promo"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[850px] bg-white rounded-3xl shadow-2xl border border-isy-line overflow-hidden">
        {/* Header Bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 bg-isy-mist border-b border-isy-line">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-isy-emerald text-white text-xs font-bold">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-isy-emerald">
                Pratinjau: {promo.title}
              </h3>
              <p className="text-[11px] text-isy-text-secondary">
                Mode simulasi tampilan visual promo Optik I See You
              </p>
            </div>
          </div>

          {/* Controls: Mode & Device Switcher */}
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-xl bg-white p-1 border border-isy-line text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode("microsite")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  mode === "microsite"
                    ? "bg-isy-emerald text-white font-bold"
                    : "text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                Detail Microsite
              </button>
              <button
                type="button"
                onClick={() => setMode("popup")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  mode === "popup"
                    ? "bg-isy-emerald text-white font-bold"
                    : "text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                Featured Popup
              </button>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center rounded-xl bg-white p-1 border border-isy-line text-xs font-medium">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                title="Tampilan Desktop"
                className={`p-1.5 rounded-lg transition-colors ${
                  device === "desktop"
                    ? "bg-isy-emerald text-white"
                    : "text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                title="Tampilan Ponsel Mobile"
                className={`p-1.5 rounded-lg transition-colors ${
                  device === "mobile"
                    ? "bg-isy-emerald text-white"
                    : "text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Pratinjau"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-100/70 p-4 sm:p-8 flex items-center justify-center">
          <div
            className={`transition-all duration-300 w-full ${
              device === "mobile"
                ? "max-w-[390px] min-h-[640px] rounded-[36px] border-[8px] border-slate-800 bg-white shadow-2xl overflow-hidden my-auto"
                : "max-w-4xl bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden"
            }`}
          >
            {/* Top Bar for Mobile Phone Frame */}
            {device === "mobile" && (
              <div className="w-full bg-slate-800 h-5 flex items-center justify-center">
                <div className="w-20 h-3 bg-black rounded-full" />
              </div>
            )}

            {/* ============================================================== */}
            {/* MODE A: DETAIL MICROSITE PREVIEW */}
            {/* ============================================================== */}
            {mode === "microsite" && (
              <div className="p-5 sm:p-8 space-y-6">
                {/* Header Brand */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#124734]">
                      Optik I See You
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#124734]/10 text-[#124734]">
                      Promo
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    promo.optikiseeyou.com
                  </span>
                </div>

                {/* Main 2-Column Hero / Detail (reversing order based on detailLayout) */}
                <div
                  className={`grid grid-cols-1 ${
                    device === "desktop" ? "md:grid-cols-2" : ""
                  } gap-6 items-center`}
                >
                  {/* Image Column */}
                  <div
                    className={`${
                      device === "desktop" && promo.detailLayout === "image-right"
                        ? "md:order-2"
                        : "md:order-1"
                    }`}
                  >
                    <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                      {promo.heroImageUrl ? (
                        <Image
                          src={promo.heroImageUrl}
                          alt={promo.heroImageAlt || promo.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Tag className="h-8 w-8 mb-2 stroke-[1.5]" />
                          <span className="text-xs">Belum ada gambar hero</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Column */}
                  <div
                    className={`space-y-3 ${
                      device === "desktop" && promo.detailLayout === "image-right"
                        ? "md:order-1"
                        : "md:order-2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#124734] border border-emerald-200">
                        {categoryLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {periodText}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-[#124734] leading-snug">
                      {promo.title}
                    </h1>

                    {promo.subtitle && (
                      <p className="text-sm font-semibold text-[#2FA84F]">
                        {promo.subtitle}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {promo.description || promo.excerpt}
                    </p>

                    {promo.ctaLabel && (
                      <div className="pt-2">
                        <a
                          href={promo.ctaUrl || "#"}
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
                        >
                          <span>{promo.ctaLabel}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collage Gallery Preview if available */}
                {promo.galleryImages && promo.galleryImages.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Galeri Promo ({promo.collageLayout})
                    </h4>
                    <div
                      className={`grid gap-2 ${
                        promo.collageLayout === "grid-3"
                          ? "grid-cols-3"
                          : promo.collageLayout === "masonry"
                          ? "grid-cols-2 sm:grid-cols-3"
                          : "grid-cols-2"
                      }`}
                    >
                      {promo.galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt || `Galeri ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms and Conditions Preview */}
                {promo.termsAndConditions && (
                  <div className="rounded-2xl bg-[#F8F5ED] p-4 border border-[#E3E7DF] space-y-2">
                    <h4 className="text-xs font-bold text-[#124734] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2FA84F]" />
                      Syarat dan Ketentuan
                    </h4>
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                      {promo.termsAndConditions}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* MODE B: FEATURED POPUP PREVIEW */}
            {/* ============================================================== */}
            {mode === "popup" && (
              <div className="p-4 sm:p-6 bg-slate-900/10 flex items-center justify-center min-h-[420px]">
                <div
                  className={`relative w-full rounded-3xl bg-white border border-[#E3E7DF] shadow-2xl overflow-hidden ${
                    device === "mobile" ? "max-w-xs" : "max-w-xl"
                  }`}
                >
                  {/* Close button mock */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white text-xs">
                      <X className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Popup layout */}
                  <div
                    className={`grid ${
                      device === "desktop" ? "grid-cols-2" : "grid-cols-1"
                    } items-center`}
                  >
                    {/* Image side */}
                    <div
                      className={`relative aspect-4/3 w-full bg-slate-100 ${
                        device === "desktop" && promo.detailLayout === "image-right"
                          ? "order-2"
                          : "order-1"
                      }`}
                    >
                      {promo.heroImageUrl ? (
                        <Image
                          src={promo.heroImageUrl}
                          alt={promo.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                          Gambar Promo
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="rounded-full bg-[#124734] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          {categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content side */}
                    <div
                      className={`p-5 space-y-2.5 ${
                        device === "desktop" && promo.detailLayout === "image-right"
                          ? "order-1"
                          : "order-2"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Clock className="h-3 w-3 text-[#2FA84F]" />
                        <span>{periodText}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-[#124734] leading-snug">
                        {promo.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {promo.excerpt || promo.description}
                      </p>

                      <div className="pt-2">
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <span>{promo.ctaLabel || "Lihat Promo"}</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex-shrink-0 px-5 py-2.5 bg-isy-mist border-t border-isy-line text-center text-xs text-isy-text-secondary flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "active"
                  ? "bg-emerald-500"
                  : status === "scheduled"
                  ? "bg-amber-500"
                  : "bg-slate-400"
              }`}
            />
            Status: {status.toUpperCase()} • Prioritas Popup: {promo.popupPriority}
          </span>
          <span className="text-[11px] text-slate-400">
            Tekan ESC untuk menutup pratinjau
          </span>
        </div>
      </div>
    </div>
  );
}
