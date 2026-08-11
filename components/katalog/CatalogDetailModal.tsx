"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CatalogItem } from "@/lib/catalog";
import { csWhatsappUrl } from "@/lib/branches";

interface CatalogDetailModalProps {
  item: CatalogItem | null;
  onClose: () => void;
}

export default function CatalogDetailModal({
  item,
  onClose,
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
              📷 Galeri Foto ({displayImages.length})
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 rounded-xl py-2 text-xs font-black transition-all ${
                activeTab === "specs"
                  ? "bg-white text-isy-green-deep shadow-sm"
                  : "text-isy-ink/60 hover:text-isy-green-deep"
              }`}
            >
              📐 Spesifikasi Detail
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
              Bentuk Wajah yang Cocok:
            </span>
            {item.recommendedFor.map((shape) => (
              <span
                key={shape}
                className="rounded-lg bg-isy-mist px-2.5 py-1 text-xs font-extrabold text-isy-green-deep border border-isy-line"
              >
                ✨ {shape}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-isy-line">
          <a
            href={csWhatsappUrl(item.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-isy-green-deep py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-bright transition-all active:scale-95"
          >
            <Image
              src="/logo/Logo-Whatsapp.png"
              alt="WhatsApp"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            Tanya Stok & Pesan via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
