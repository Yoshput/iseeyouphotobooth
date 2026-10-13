"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CatalogItem } from "@/lib/catalog";
import { CS_BRANCHES } from "@/components/ui/ContactCSModal";

interface CatalogDetailModalProps {
  item: CatalogItem | null;
  selectedColorName?: string;
  onClose: () => void;
  onOpenContactCS?: (item: CatalogItem) => void;
}

export default function CatalogDetailModal({
  item,
  selectedColorName,
  onClose,
}: CatalogDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("purwokerto");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [showSpecsDiagram, setShowSpecsDiagram] = useState(false);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!item) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

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
  }, [item, onClose]);

  // Sync color & reset active image on item change
  useEffect(() => {
    if (!item) return;
    const defaultColor =
      selectedColorName ||
      (item.colors && item.colors.length > 0 ? item.colors[0].name : "");
    setSelectedColor(defaultColor);
    setActiveImageIdx(0);
    setShowSpecsDiagram(false);
  }, [item, selectedColorName]);

  if (!item) return null;

  // Build gallery photos
  const colors = item.colors || [];
  const activeVariant = colors.find((c) => c.name === selectedColor);

  const galleryImages: { src: string; label: string }[] = [];

  // Variant image if available
  if (activeVariant?.image) {
    galleryImages.push({ src: activeVariant.image, label: activeVariant.name });
  }

  // Base image
  if (item.image && !galleryImages.some((g) => g.src === item.image)) {
    galleryImages.push({ src: item.image, label: "Tampak Depan" });
  }

  // Other product images
  if (item.images) {
    item.images.forEach((img, i) => {
      if (!galleryImages.some((g) => g.src === img)) {
        galleryImages.push({ src: img, label: `Sudut ${i + 1}` });
      }
    });
  }

  // Lifestyle / Worn images
  if (item.lifestyleImages) {
    item.lifestyleImages.forEach((img, i) => {
      if (!galleryImages.some((g) => g.src === img)) {
        galleryImages.push({ src: img, label: `Foto Dipakai ${i + 1}` });
      }
    });
  }

  const currentPhoto = galleryImages[activeImageIdx] || galleryImages[0];
  const selectedBranch = CS_BRANCHES.find((b) => b.id === selectedBranchId) || CS_BRANCHES[0];

  // Build clean WhatsApp Message
  const buildWhatsAppUrl = () => {
    const skuText = item.sku ? ` (SKU: *${item.sku}*)` : "";
    const colorText = selectedColor ? ` varian warna *${selectedColor}*` : "";
    const message = `Halo Optik I See You ${selectedBranch.name}! 👋\nSaya tertarik dengan frame *${item.name}*${skuText}${colorText}.\n\nApakah stok masih tersedia di Cabang ${selectedBranch.name}? Boleh dibantu informasinya? Terima kasih! 🙏`;
    return `https://api.whatsapp.com/send/?phone=${selectedBranch.phoneWa}&text=${encodeURIComponent(message)}`;
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    const variant = colors.find((c) => c.name === colorName);
    if (variant?.image) {
      const idx = galleryImages.findIndex((g) => g.src === variant.image);
      if (idx >= 0) {
        setActiveImageIdx(idx);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="product-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-[#E7E2D7] focus:outline-none flex flex-col my-auto"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EFEBE2] bg-white/95 backdrop-blur-xs px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
              {item.collection}
            </span>
            {item.sku && (
              <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-600">
                SKU: {item.sku}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela detail produk"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content: 2 Columns on Desktop */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Column 1: Photos & Diagrams (5 cols on lg) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Display View */}
            <div className="relative aspect-[4/5] max-h-[520px] w-full overflow-hidden rounded-xl bg-[#FAF7F0] border border-[#E7E2D7]">
              {showSpecsDiagram && item.specsImage ? (
                <Image
                  src={item.specsImage}
                  alt={`Diagram spesifikasi teknis dan dimensi ${item.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-2"
                />
              ) : (
                currentPhoto && (
                  <Image
                    src={currentPhoto.src}
                    alt={`Frame kacamata ${item.name} - ${currentPhoto.label}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-4"
                  />
                )
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {galleryImages.map((img, idx) => {
                const isActive = !showSpecsDiagram && activeImageIdx === idx;
                return (
                  <button
                    key={img.src + idx}
                    type="button"
                    aria-label={`Pilih foto ${img.label}`}
                    onClick={() => {
                      setShowSpecsDiagram(false);
                      setActiveImageIdx(idx);
                    }}
                    className={`relative h-14 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#FAF7F0] transition-all ${
                      isActive
                        ? "border-[#1B4332] ring-2 ring-[#1B4332]/20 scale-102"
                        : "border-[#E2DCD0] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.label}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}

              {/* Specs diagram thumbnail toggle */}
              {item.specsImage && (
                <button
                  type="button"
                  aria-label="Lihat diagram ukuran pabrik"
                  onClick={() => setShowSpecsDiagram(true)}
                  className={`relative h-14 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#FAF7F0] flex flex-col items-center justify-center p-1 text-center transition-all ${
                    showSpecsDiagram
                      ? "border-[#1B4332] ring-2 ring-[#1B4332]/20 scale-102 bg-emerald-50"
                      : "border-[#E2DCD0] opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#1B4332] leading-tight">
                    Diagram Ukuran
                  </span>
                </button>
              )}
            </div>

            {/* Virtual AR Try-On CTA (ONLY when asset exists) */}
            {item.arAssetId && (
              <div className="rounded-xl border border-emerald-900/10 bg-emerald-50/70 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#0D2F1D]">Coba Virtual Try-On</p>
                  <p className="text-[11px] text-stone-600">
                    Lihat kecocokan frame ini di wajah Anda via kamera.
                  </p>
                </div>
                <Link
                  href={`/tryon?model=${item.arAssetId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4332] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D2F1D] transition-colors shrink-0"
                >
                  <span>Mulai AR</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Column 2: Product Specifications & Branch WhatsApp (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-stone-500">
                  {item.shape || item.style}
                </span>
              </div>
              <h2
                id="product-modal-title"
                className="font-sans text-xl sm:text-2xl font-extrabold text-[#0D2F1D] leading-tight"
              >
                {item.name}
              </h2>

              {/* Price display */}
              <div className="mt-2.5">
                {item.price ? (
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-[#1B4332]">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.priceIncludesLens
                        ? "Sudah termasuk lensa standar."
                        : "Harga frame. Belum termasuk lensa resep kustom."}
                    </p>
                  </div>
                ) : (
                  <div className="inline-flex items-center rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    Harga &amp; paket lensa tersedia di cabang
                  </div>
                )}
              </div>
            </div>

            {/* Color Variant Selector */}
            {colors.length > 0 && (
              <div className="border-t border-[#EFEBE2] pt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-700">Pilihan Warna:</span>
                  <span className="font-bold text-[#1B4332]">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {colors.map((c) => {
                    const isSelected = c.name === selectedColor;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleColorChange(c.name)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[#1B4332] bg-[#FAF7F0] text-[#0D2F1D] ring-1 ring-[#1B4332]"
                            : "border-[#E2DCD0] bg-white text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Structured Specifications Table */}
            <div className="border-t border-[#EFEBE2] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                Spesifikasi Dimensi (mm)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {item.dimensions?.lensWidth && (
                  <div className="rounded-lg bg-[#FAF7F0] border border-[#ECE7DC] p-2.5">
                    <span className="text-[10px] text-stone-500 block">Lebar Lensa</span>
                    <span className="font-bold text-[#0D2F1D]">
                      {item.dimensions.lensWidth} mm
                    </span>
                  </div>
                )}
                {item.dimensions?.bridgeWidth && (
                  <div className="rounded-lg bg-[#FAF7F0] border border-[#ECE7DC] p-2.5">
                    <span className="text-[10px] text-stone-500 block">Nose Bridge</span>
                    <span className="font-bold text-[#0D2F1D]">
                      {item.dimensions.bridgeWidth} mm
                    </span>
                  </div>
                )}
                {item.dimensions?.templeLength && (
                  <div className="rounded-lg bg-[#FAF7F0] border border-[#ECE7DC] p-2.5">
                    <span className="text-[10px] text-stone-500 block">Panjang Gagang</span>
                    <span className="font-bold text-[#0D2F1D]">
                      {item.dimensions.templeLength} mm
                    </span>
                  </div>
                )}
                {item.dimensions?.frameWidth && (
                  <div className="rounded-lg bg-[#FAF7F0] border border-[#ECE7DC] p-2.5">
                    <span className="text-[10px] text-stone-500 block">Lebar Total Frame</span>
                    <span className="font-bold text-[#0D2F1D]">
                      {item.dimensions.frameWidth} mm
                    </span>
                  </div>
                )}
                {item.dimensions?.lensHeight && (
                  <div className="rounded-lg bg-[#FAF7F0] border border-[#ECE7DC] p-2.5">
                    <span className="text-[10px] text-stone-500 block">Tinggi Frame</span>
                    <span className="font-bold text-[#0D2F1D]">
                      {item.dimensions.lensHeight} mm
                    </span>
                  </div>
                )}
                {item.material && (
                  <div className="rounded-lg bg-[#FAF7F0] border border-[#ECE7DC] p-2.5">
                    <span className="text-[10px] text-stone-500 block">Material</span>
                    <span className="font-bold text-[#0D2F1D]">{item.material}</span>
                  </div>
                )}
              </div>

              {/* Recommended face shape */}
              {item.recommendedFor && item.recommendedFor.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-stone-500">Cocok untuk wajah:</span>
                  {item.recommendedFor.map((shape) => (
                    <span
                      key={shape}
                      className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700"
                    >
                      {shape}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Branch Selector & Direct WhatsApp Action */}
            <div className="border-t border-[#EFEBE2] pt-4 space-y-3">
              <div>
                <label
                  htmlFor="branch-select"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5"
                >
                  Pilih Cabang untuk Cek Ketersediaan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CS_BRANCHES.map((branch) => {
                    const isBranchActive = branch.id === selectedBranchId;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`rounded-lg border p-2.5 text-left transition-all ${
                          isBranchActive
                            ? "border-[#1B4332] bg-[#FAF7F0] ring-1 ring-[#1B4332]"
                            : "border-[#E2DCD0] bg-white hover:border-stone-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0D2F1D]">
                            {branch.name}
                          </span>
                          {isBranchActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332]" />
                          )}
                        </div>
                        <span className="text-[10.5px] font-mono text-stone-500 block mt-0.5">
                          {branch.phoneDisplay}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct WhatsApp CTA Button */}
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#0D2F1D] active:scale-98 transition-all"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.212 8.212 0 0 1-5.82 2.41h-.01c-1.38 0-2.73-.35-3.92-1.02l-.28-.16-2.9.76.77-2.83-.18-.29a8.196 8.196 0 0 1-1.25-4.39c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
                </svg>
                <span>Tanya Ketersediaan di Cabang {selectedBranch.name}</span>
              </a>

              <p className="text-[11px] text-stone-500 text-center">
                Pemeriksaan mata (Free Eye Examination) &amp; fitting frame gratis di seluruh cabang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
