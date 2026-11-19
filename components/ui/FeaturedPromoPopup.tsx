"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Tag } from "lucide-react";
import { PromoItem, PromoPopupSettings } from "@/lib/db/types";
import { getPromoSubdomainUrl } from "@/lib/promo";

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="featured-promo-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/75 backdrop-blur-xs animate-in fade-in duration-300"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg sm:max-w-4xl lg:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* Optik Melawai Style Crisp Circular Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Tutup jendela promo"
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-slate-800 hover:bg-slate-100 hover:text-black transition-all shadow-lg border border-slate-200/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#124734]"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
        </button>

        {/* 2-Column Grand Editorial Spread (Inspired by Optik Melawai) */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">
          {/* Left Column: Full-Bleed Grand Poster Visual */}
          <div className="relative aspect-[4/5] md:aspect-auto md:col-span-7 w-full h-full min-h-[260px] sm:min-h-[420px] bg-[#FAF8F5] overflow-hidden">
            {promo.heroImageUrl ? (
              <Image
                src={promo.heroImageUrl}
                alt={promo.heroImageAlt || promo.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <Tag className="h-12 w-12 stroke-[1.5]" />
                <span className="text-xs mt-2 font-medium">Optik I See You</span>
              </div>
            )}
          </div>

          {/* Right Column: Editorial Narrative & Bold Action */}
          <div className="md:col-span-5 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
            <div className="space-y-3 sm:space-y-4">
              {/* Campaign Title */}
              <h2
                id="featured-promo-popup-title"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#124734] leading-tight tracking-tight"
              >
                {promo.title}
              </h2>

              {/* Campaign Excerpt / Description */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed font-normal">
                {promo.excerpt || promo.description}
              </p>

              {/* Bold CTA Button (Optik Melawai Style) */}
              <div className="pt-2 sm:pt-4">
                <a
                  href={getPromoSubdomainUrl(promo.slug)}
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-xl bg-[#124734] hover:bg-[#0B3B2A] text-white py-3.5 px-8 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98 text-center"
                >
                  <span>SELENGKAPNYA</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
