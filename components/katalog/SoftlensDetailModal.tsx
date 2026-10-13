"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SoftlensSeries, SoftlensVariant } from "@/lib/softlens";
import { SOFTLENS_CS_WA_URL } from "@/lib/softlens";

interface SoftlensDetailModalProps {
  series: SoftlensSeries | null;
  initialVariant?: SoftlensVariant;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (series: SoftlensSeries, selectedVariant?: SoftlensVariant) => void;
  onOpenZoom?: (imageSrc: string, title: string) => void;
}

export default function SoftlensDetailModal({
  series,
  initialVariant,
  isOpen,
  onClose,
  onAddToCart,
  onOpenZoom,
}: SoftlensDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [activePhotoType, setActivePhotoType] = useState<"variant" | "poster">("variant");

  const variants = series?.variants || [];
  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) ||
    variants[0];

  useEffect(() => {
    if (!series || !isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    const defaultVariant =
      initialVariant || (series.variants && series.variants[0]);
    if (defaultVariant) {
      setSelectedVariantId(defaultVariant.id);
    }
    setActivePhotoType("variant");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [series, initialVariant, isOpen, onClose]);

  if (!isOpen || !series) return null;

  const currentImage =
    activePhotoType === "poster" && activeVariant?.detailPoster
      ? activeVariant.detailPoster
      : activeVariant?.image || series.coverImage;

  const handleSelectVariant = (v: SoftlensVariant) => {
    setSelectedVariantId(v.id);
    setActivePhotoType("variant");
  };

  const whatsappUrl = SOFTLENS_CS_WA_URL(
    series.name,
    activeVariant ? activeVariant.name : undefined
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="softlens-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-[#E3E7DF] focus:outline-none flex flex-col my-auto"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EAE5D9] bg-white/95 backdrop-blur-xs px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#124734] uppercase tracking-wider">
              {series.brand || (series.type === "accessory" ? "Aksesoris" : "Koleksi Softlens")}
            </span>
            {series.badgeText && (
              <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                {series.badgeText}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela detail produk"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#124734]"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content: 2 Columns on Desktop */}
        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Column 1: Image Showcase & Thumbnails (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAF8F3] border border-[#E3E7DF]">
              <Image
                src={currentImage}
                alt={`${series.name}${activeVariant ? ` - Varian ${activeVariant.name}` : ""}`}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-contain p-3 transition-transform duration-300"
                priority
              />

              {onOpenZoom && (
                <button
                  type="button"
                  aria-label="Perbesar gambar"
                  onClick={() => onOpenZoom(currentImage, series.name)}
                  className="absolute bottom-2.5 right-2.5 rounded-lg bg-white/90 p-1.5 text-stone-600 border border-stone-200 shadow-2xs hover:text-[#124734] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
              )}
            </div>

            {/* Poster / Photo Toggle Thumbnails if detail poster exists */}
            {activeVariant?.detailPoster && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePhotoType("variant")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                    activePhotoType === "variant"
                      ? "border-[#124734] bg-[#F8F5ED] text-[#124734]"
                      : "border-[#E3E7DF] bg-white text-stone-600 hover:border-stone-400"
                  }`}
                >
                  Foto Produk
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoType("poster")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                    activePhotoType === "poster"
                      ? "border-[#124734] bg-[#F8F5ED] text-[#124734]"
                      : "border-[#E3E7DF] bg-white text-stone-600 hover:border-stone-400"
                  }`}
                >
                  Poster Detail Specs
                </button>
              </div>
            )}
          </div>

          {/* Column 2: Details, Variants, Specs & Actions (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h2
                id="softlens-modal-title"
                className="font-sans text-xl sm:text-2xl font-extrabold text-[#183C30] leading-tight"
              >
                {series.name}
              </h2>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#124734]">
                  {activeVariant?.priceFormatted || series.basePriceFormatted}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {series.type === "accessory" ? "/ pcs" : "/ pasang"}
                </span>
              </div>

              <p className="mt-2 text-xs text-[#626C65] leading-relaxed">
                {series.description}
              </p>
            </div>

            {/* Variant Selector (if variants > 1) */}
            {variants.length > 1 && (
              <div className="border-t border-[#EAE5D9] pt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-700">Pilihan Varian:</span>
                  <span className="font-bold text-[#124734]">{activeVariant?.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[#124734] bg-[#F8F5ED] text-[#183C30] ring-1 ring-[#124734]"
                            : "border-[#E3E7DF] bg-white text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {v.hex && (
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: v.hex }}
                          />
                        )}
                        <span>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            <div className="border-t border-[#EAE5D9] pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Spesifikasi Teknis
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {series.diameter && (
                  <div className="rounded-lg bg-[#FAF8F3] border border-[#ECE7DC] p-2">
                    <span className="text-[10px] text-stone-500 block">Diameter (DIA)</span>
                    <span className="font-bold text-[#183C30]">{series.diameter}</span>
                  </div>
                )}
                {series.waterContent && (
                  <div className="rounded-lg bg-[#FAF8F3] border border-[#ECE7DC] p-2">
                    <span className="text-[10px] text-stone-500 block">Kadar Air</span>
                    <span className="font-bold text-[#183C30]">{series.waterContent}</span>
                  </div>
                )}
                {series.usageDuration && (
                  <div className="rounded-lg bg-[#FAF8F3] border border-[#ECE7DC] p-2">
                    <span className="text-[10px] text-stone-500 block">Masa Pakai</span>
                    <span className="font-bold text-[#183C30]">{series.usageDuration}</span>
                  </div>
                )}
                {series.volume && (
                  <div className="rounded-lg bg-[#FAF8F3] border border-[#ECE7DC] p-2">
                    <span className="text-[10px] text-stone-500 block">Volume Kemasan</span>
                    <span className="font-bold text-[#183C30]">{series.volume}</span>
                  </div>
                )}
              </div>

              {/* Specs Pills */}
              {series.specs && series.specs.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {series.specs.map((spec) => (
                    <span
                      key={spec}
                      className="rounded bg-stone-100 px-2 py-0.5 text-[10.5px] font-medium text-stone-600"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Add to Cart & WhatsApp */}
            <div className="border-t border-[#EAE5D9] pt-3.5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(series, activeVariant);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#124734] py-3 px-4 text-xs font-bold text-white shadow-sm hover:bg-[#0C3527] transition-all"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>Tambah ke Keranjang</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#124734] bg-white py-3 px-4 text-xs font-bold text-[#124734] hover:bg-[#F8F5ED] transition-all"
                  title="Tanya stok via WhatsApp"
                >
                  <Image src="/logo/Logo-Whatsapp.webp" alt="WA" width={16} height={16} />
                  <span>Chat CS</span>
                </a>
              </div>

              <p className="text-[11px] text-stone-500 text-center">
                Tersedia ukuran normal &amp; minus di seluruh cabang Optik I See You.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
