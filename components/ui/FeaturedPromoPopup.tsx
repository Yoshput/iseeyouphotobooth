"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Clock, ArrowRight, Tag, Sparkles } from "lucide-react";
import { PromoItem, PromoPopupSettings } from "@/lib/db/types";
import { formatPromoPeriod, getCategoryLabel, getPromoSubdomainUrl } from "@/lib/promo";

const SESSION_STORAGE_KEY = "isy_featured_promo_dismissed";
const LOCAL_STORAGE_KEY = "isy_featured_promo_dismissed_at";

export default function FeaturedPromoPopup() {
  const [promo, setPromo] = useState<PromoItem | null>(null);
  const [settings, setSettings] = useState<PromoPopupSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAndFetchPopup() {
      try {
        const res = await fetch("/api/promos/popup");
        if (!res.ok) return;

        const json = await res.json();
        if (!isMounted || !json.success || !json.data) return;

        const { promo: candidatePromo, settings: currentSettings } = json.data;

        if (!currentSettings || !currentSettings.enabled || !candidatePromo) {
          return;
        }

        // Check frequency dismissal rules
        const freq = currentSettings.frequency || "once-per-session";

        if (freq === "once-per-session") {
          try {
            if (sessionStorage.getItem(SESSION_STORAGE_KEY) === "true") {
              return;
            }
          } catch {}
        } else if (freq === "once-per-day") {
          try {
            const lastDismissedAt = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (lastDismissedAt) {
              const dismissedTime = parseInt(lastDismissedAt, 10);
              const oneDayMs = 24 * 60 * 60 * 1000;
              if (Date.now() - dismissedTime < oneDayMs) {
                return;
              }
            }
          } catch {}
        }

        setPromo(candidatePromo);
        setSettings(currentSettings);

        // Schedule popup appearance after delay
        const delay = currentSettings.delayMs ?? 1500;
        timerRef.current = setTimeout(() => {
          if (isMounted) {
            setIsOpen(true);
          }
        }, delay);
      } catch (err) {
        console.warn("Featured promo popup check skipped:", err);
      }
    }

    checkAndFetchPopup();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);

    if (settings) {
      const freq = settings.frequency || "once-per-session";
      try {
        if (freq === "once-per-session") {
          sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        } else if (freq === "once-per-day") {
          localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
        }
      } catch {}
    }
  };

  if (!isOpen || !promo || hasDismissed) {
    return null;
  }

  const period = formatPromoPeriod(promo.startAt, promo.endAt);
  const categoryLabel = getCategoryLabel(promo.category);
  const layout = settings?.layout || promo.detailLayout || "image-left";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="featured-promo-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3E7DF] overflow-hidden transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* Accessible Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Tutup jendela promo"
          className="absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2FA84F]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 2-Column Desktop, 1-Column Mobile Layout */}
        <div
          className={`grid grid-cols-1 ${
            layout === "image-right" ? "sm:grid-cols-12" : "sm:grid-cols-12"
          } items-center`}
        >
          {/* Image Side */}
          <div
            className={`relative aspect-4/3 sm:aspect-auto sm:h-full min-h-[220px] sm:min-h-[320px] w-full bg-slate-100 ${
              layout === "image-right"
                ? "sm:col-span-6 sm:order-2"
                : "sm:col-span-6 sm:order-1"
            }`}
          >
            {promo.heroImageUrl ? (
              <Image
                src={promo.heroImageUrl}
                alt={promo.heroImageAlt || promo.title}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <Tag className="h-10 w-10 stroke-[1.5]" />
                <span className="text-[11px] mt-1">Optik I See You</span>
              </div>
            )}

            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="rounded-full bg-[#124734]/95 backdrop-blur-xs px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Content Side */}
          <div
            className={`p-6 sm:p-7 space-y-3.5 ${
              layout === "image-right"
                ? "sm:col-span-6 sm:order-1"
                : "sm:col-span-6 sm:order-2"
            }`}
          >
            {/* Period */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Clock className="h-3 w-3 text-[#2FA84F]" />
              <span>{period}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2
                id="featured-promo-popup-title"
                className="text-lg sm:text-xl font-black text-[#124734] leading-snug tracking-tight"
              >
                {promo.title}
              </h2>
              {promo.subtitle && (
                <p className="text-xs font-bold text-[#2FA84F]">
                  {promo.subtitle}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
              {promo.excerpt || promo.description}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 space-y-2">
              <a
                href={getPromoSubdomainUrl(promo.slug)}
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#208c49] via-[#1b703e] to-[#124734] py-3 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-[#208c49]/25 hover:scale-102 hover:shadow-lg active:scale-98 transition-all"
              >
                <span>{promo.ctaLabel || "Lihat Promo Ini"}</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full text-center text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
