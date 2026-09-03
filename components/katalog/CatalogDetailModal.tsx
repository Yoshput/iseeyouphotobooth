"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CatalogItem } from "@/lib/catalog";
import { csWhatsappUrl } from "@/lib/branches";

interface CatalogDetailModalProps {
  item: CatalogItem | null;
  onClose: () => void;
  onOpenContactCS?: (item: CatalogItem) => void;
}

export default function CatalogDetailModal({
  item,
  onClose,
  onOpenContactCS,
}: CatalogDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"gallery" | "specs">("gallery");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  // Reset tab & image index when item changes
  useEffect(() => {
    setActiveTab("gallery");
    setActiveImageIndex(0);
  }, [item]);

  if (!item) return null;

  const displayImages = item.images && item.images.length > 0 ? item.images : [item.image];
  const hasSpecs = !!item.specsImage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl space-y-6 transition-all border border-isy-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-isy-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-isy-green-bright">
              {item.collection}
            </span>
            <span className="rounded-full border border-isy-line bg-isy-mist px-2.5 py-0.5 text-[10px] font-extrabold text-isy-green-deep">
              {item.style}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-isy-mist text-isy-ink/70 hover:bg-isy-line hover:text-isy-green-deep transition-colors"
            title="Tutup (Esc)"
          >
            ✕
          </button>
        </div>

        {/* View Switcher Tabs (Foto Produk vs Spesifikasi Detail) */}
        {hasSpecs && (
          <div className="flex rounded-2xl bg-isy-mist p-1 border border-isy-line">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex-1 rounded-xl py-2 text-xs font-black transition-all ${
                activeTab === "gallery"
                  ? "bg-white text-isy-green-deep shadow-sm"
                  : "text-isy-ink/60 hover:text-isy-green-deep"
              }`}
            >
              Galeri Foto ({displayImages.length})
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 rounded-xl py-2 text-xs font-black transition-all ${
                activeTab === "specs"
                  ? "bg-white text-isy-green-deep shadow-sm"
                  : "text-isy-ink/60 hover:text-isy-green-deep"
              }`}
            >
              Spesifikasi Frame
            </button>
          </div>
        )}

        {/* Content Body */}
        {activeTab === "gallery" ? (
          <div className="space-y-4">
            {/* Main High-Res Image Display */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-isy-mist border border-isy-line/70">
              <Image
                src={displayImages[activeImageIndex]}
                alt={item.name}
                fill
                className="object-contain p-4 transition-all duration-300"
              />
            </div>

            {/* Thumbnail Selection Bar (if multiple images) */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                {displayImages.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      idx === activeImageIndex
                        ? "border-isy-green-bright scale-105 shadow-md"
                        : "border-isy-line opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgSrc}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Full Product Specs Image View */
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-isy-mist border border-isy-line">
            {item.specsImage ? (
              <Image
                src={item.specsImage}
                alt={`Spesifikasi ${item.name}`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-isy-ink/50">
                Spesifikasi gambar belum tersedia
              </div>
            )}
          </div>
        )}

        {/* Product Details Section */}
        <div className="space-y-3 pt-2">
          <h2 className="font-serif text-2xl font-black text-isy-green-deep">
            {item.name}
          </h2>

          <p className="text-xs sm:text-sm text-isy-ink/75 leading-relaxed">
            {item.description}
          </p>

          {/* Face Shape Recommendations */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs font-bold text-isy-ink/50">
              Bentuk Wajah:
            </span>
            {item.recommendedFor.map((shape) => (
              <span
                key={shape}
                className="rounded-lg bg-isy-mist px-2.5 py-1 text-xs font-extrabold text-isy-green-deep border border-isy-line"
              >
                {shape}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-isy-line">
          {onOpenContactCS ? (
            <button
              type="button"
              onClick={() => {
                const currentItem = item;
                onClose();
                onOpenContactCS(currentItem);
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-isy-green-deep py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-bright transition-all active:scale-95 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.212 8.212 0 0 1-5.82 2.41h-.01c-1.38 0-2.73-.35-3.92-1.02l-.28-.16-2.9.76.77-2.83-.18-.29a8.196 8.196 0 0 1-1.25-4.39c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
              </svg>
              <span>Tanya Stok &amp; Pesan via WhatsApp (4 Cabang)</span>
            </button>
          ) : (
            <a
              href={csWhatsappUrl(item.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-isy-green-deep py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-bright transition-all active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.212 8.212 0 0 1-5.82 2.41h-.01c-1.38 0-2.73-.35-3.92-1.02l-.28-.16-2.9.76.77-2.83-.18-.29a8.196 8.196 0 0 1-1.25-4.39c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
              </svg>
              <span>Tanya Stok &amp; Pesan via WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
