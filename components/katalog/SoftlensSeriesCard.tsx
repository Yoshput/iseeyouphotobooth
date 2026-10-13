"use client";

import { useState } from "react";
import Image from "next/image";
import type { SoftlensSeries, SoftlensVariant } from "@/lib/softlens";

interface SoftlensSeriesCardProps {
  series: SoftlensSeries;
  onOpenDetail: (series: SoftlensSeries, selectedVariant?: SoftlensVariant) => void;
  onAddToCart?: (series: SoftlensSeries, selectedVariant?: SoftlensVariant) => void;
}

export default function SoftlensSeriesCard({
  series,
  onOpenDetail,
  onAddToCart,
}: SoftlensSeriesCardProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const variants = series.variants || [];
  const activeVariant = variants[selectedVariantIdx] || variants[0];

  // Image prioritizing active variant image, then coverImage
  const primaryImage =
    activeVariant?.image || series.coverImage || "/logo/logo-square.png";

  const alternateImage =
    activeVariant?.hoverImage && activeVariant.hoverImage !== primaryImage
      ? activeVariant.hoverImage
      : null;

  const displayImage = isHovered && alternateImage ? alternateImage : primaryImage;

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Lihat detail produk ${series.name}`}
      onClick={() => onOpenDetail(series, activeVariant)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(series, activeVariant);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#E3E7DF] bg-white transition-all duration-200 hover:border-[#124734]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#124734] cursor-pointer"
    >
      <div>
        {/* Photo Canvas */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F3] border-b border-[#EAE5D9]">
          {/* Category / Brand Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#124734] border border-[#E3E7DF] shadow-2xs">
              {series.brand || (series.type === "accessory" ? "Aksesoris" : "Softlens")}
            </span>
          </div>

          {/* Specs / DIA Badge on top right */}
          {(series.diameter || series.volume) && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-center rounded-md bg-[#124734]/10 px-2 py-0.5 text-[10px] font-semibold text-[#124734] border border-[#124734]/20">
                {series.diameter || series.volume}
              </span>
            </div>
          )}

          {/* Product Image with smooth cross-fade */}
          <div className="relative h-full w-full p-4">
            <Image
              src={imgError ? "/logo/Logo-ISeeYou.png" : displayImage}
              alt={`${series.name}${activeVariant ? ` varian ${activeVariant.name}` : ""}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-104"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4">
          <div className="text-[11px] text-[#626C65] font-medium mb-1 truncate">
            {series.type === "lens"
              ? `Kadar Air: ${series.waterContent || "42%"} • ${series.usageDuration || "6 Bulan"}`
              : "Perawatan & Higienitas Mata"}
          </div>

          <h3 className="font-sans text-sm sm:text-[15px] font-bold text-[#183C30] leading-snug line-clamp-1 group-hover:text-[#124734] transition-colors">
            {series.name}
          </h3>

          {/* Color Swatches if multiple variants exist */}
          {variants.length > 1 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              {variants.map((v, idx) => {
                const isActive = idx === selectedVariantIdx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    aria-label={`Varian ${v.name}`}
                    title={v.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariantIdx(idx);
                    }}
                    className={`h-4 w-4 rounded-full border transition-all duration-150 ${
                      isActive
                        ? "ring-2 ring-[#124734] ring-offset-1 scale-110 border-white"
                        : "border-stone-300 hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: v.hex || "#6E7F80" }}
                  />
                );
              })}
              <span className="text-[10.5px] text-[#626C65] ml-1 truncate">
                {activeVariant?.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Action */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 flex items-center justify-between border-t border-[#F2EEE6] mt-2">
        <div>
          <span className="text-[10px] text-[#626C65] block leading-none">
            {series.hasPriceRange ? "Mulai dari" : "Harga"}
          </span>
          <span className="text-sm font-extrabold text-[#124734]">
            {activeVariant?.priceFormatted || series.basePriceFormatted}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onAddToCart && (
            <button
              type="button"
              aria-label={`Tambah ${series.name} ke keranjang`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(series, activeVariant);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E7DF] bg-[#FAF8F3] text-[#124734] hover:bg-[#124734] hover:text-white transition-colors"
              title="Tambah ke Keranjang"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
          )}

          <span className="inline-flex items-center gap-1 rounded-lg bg-[#124734] px-2.5 py-1.5 text-xs font-semibold text-white group-hover:bg-[#0C3527] transition-colors">
            Detail
          </span>
        </div>
      </div>
    </article>
  );
}
