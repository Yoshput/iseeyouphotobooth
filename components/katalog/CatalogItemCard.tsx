"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogItem } from "@/lib/catalog";

interface CatalogItemCardProps {
  item: CatalogItem;
  collectionTitle?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onOpenDetail: (item: CatalogItem, selectedColorName?: string) => void;
  onQuickWhatsApp?: (item: CatalogItem, selectedColorName?: string) => void;
}

export default function CatalogItemCard({
  item,
  collectionTitle,
  isFavorite = false,
  onToggleFavorite,
  onOpenDetail,
  onQuickWhatsApp,
}: CatalogItemCardProps) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const colors = item.colors && item.colors.length > 0 ? item.colors : [];
  const activeColor = colors[selectedColorIdx];

  // Primary initial image: cover photo or active color variant
  const primaryImage =
    (activeColor && activeColor.image) ||
    item.coverImage ||
    item.image ||
    (item.images && item.images[0]) ||
    "/placeholder-glasses.png";

  // Alternate hover image: specs diagram with measurements (lebar, tinggi, dll) or second photo
  const hoverImage =
    item.specsImage ||
    (item.images && item.images.length > 1 && item.images[1] !== primaryImage
      ? item.images[1]
      : null) ||
    (item.lifestyleImages && item.lifestyleImages.length > 0
      ? item.lifestyleImages[0]
      : null);

  const displayImage = isHovered && hoverImage ? hoverImage : primaryImage;

  // Frame display name
  const displayName = item.name;
  const shapeLabel = item.shape || item.style;

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Lihat detail frame ${displayName}`}
      onClick={() => onOpenDetail(item, activeColor?.name)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item, activeColor?.name);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#E7E2D7] bg-white transition-all duration-200 hover:border-[#1B4332]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B4332] cursor-pointer"
    >
      <div>
        {/* Photo Canvas (4:5 portrait to match real product posters and dimension sheets perfectly) */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF7F0] border-b border-[#EFEBE2]">
          {/* Shape badge */}
          {shapeLabel && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#1B4332] border border-[#E0D9CB] shadow-2xs">
                {shapeLabel}
              </span>
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              type="button"
              aria-label={isFavorite ? `Hapus ${displayName} dari favorit` : `Simpan ${displayName} ke favorit`}
              aria-pressed={isFavorite}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-[#1B4332] border border-[#E0D9CB] shadow-2xs transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={isFavorite ? "#1B4332" : "none"}
                stroke="#1B4332"
                strokeWidth={isFavorite ? "0" : "2"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          )}

          {/* Product Image with smooth cross-fade */}
          <div className="relative h-full w-full p-3 sm:p-4">
            <Image
              src={imgError ? "/logo/Logo-ISeeYou.png" : displayImage}
              alt={`Frame kacamata ${displayName}${activeColor ? ` varian ${activeColor.name}` : ""}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-103"
            />
          </div>

          {/* AR Try-On badge (only when asset exists) */}
          {item.arAssetId && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="inline-flex items-center gap-1 rounded bg-[#0D2F1D]/80 backdrop-blur-xs px-2 py-0.5 text-[9.5px] font-medium text-emerald-200">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Virtual Try-On
              </span>
            </div>
          )}

          {/* Dimension specs badge on hover */}
          {isHovered && item.specsImage && (
            <div className="absolute bottom-2 right-2 z-10 transition-opacity">
              <span className="inline-flex items-center gap-1 rounded bg-[#124734]/90 backdrop-blur-xs px-2 py-0.5 text-[9.5px] font-semibold text-white shadow-2xs">
                📐 Detail Ukuran
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3 sm:p-4">
          {/* SKU & Collection tag */}
          <div className="flex items-center justify-between text-[11px] text-[#555047] mb-1">
            <span className="truncate max-w-[130px] font-medium">
              {collectionTitle || item.collection}
            </span>
            {item.sku && (
              <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                {item.sku}
              </span>
            )}
          </div>

          {/* Model Name */}
          <h3 className="font-sans text-sm sm:text-[15px] font-bold text-[#0D2F1D] leading-snug line-clamp-1 group-hover:text-[#1B4332] transition-colors">
            {displayName}
          </h3>

          {/* Material & Dimension preview */}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6E685C]">
            {item.material && <span>{item.material}</span>}
            {item.material && item.dimensions?.frameWidth && <span>•</span>}
            {item.dimensions?.frameWidth && (
              <span>Lebar {item.dimensions.frameWidth}mm</span>
            )}
          </div>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {colors.map((c, idx) => {
                const isActive = idx === selectedColorIdx;
                return (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={`Varian warna ${c.name}`}
                    title={c.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColorIdx(idx);
                    }}
                    className={`h-4 w-4 rounded-full border transition-all duration-150 ${
                      isActive
                        ? "ring-2 ring-[#1B4332] ring-offset-1 scale-110 border-white"
                        : "border-stone-300 hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
              <span className="text-[10.5px] text-[#7A7468] ml-1 truncate">
                {activeColor?.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Action */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 flex items-center justify-between border-t border-[#F2EEE6] mt-2">
        <div>
          {item.price ? (
            <div>
              <span className="text-[10px] text-stone-500 block leading-none">Harga</span>
              <span className="text-sm font-extrabold text-[#0D2F1D]">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-stone-500">
              Cek stok di cabang
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onQuickWhatsApp && (
            <button
              type="button"
              aria-label={`Tanya stok ${displayName} ke WhatsApp cabang`}
              onClick={(e) => {
                e.stopPropagation();
                onQuickWhatsApp(item, activeColor?.name);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D5CFBF] bg-[#FAF7F0] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
              title="Chat Cabang via WhatsApp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.212 8.212 0 0 1-5.82 2.41h-.01c-1.38 0-2.73-.35-3.92-1.02l-.28-.16-2.9.76.77-2.83-.18-.29a8.196 8.196 0 0 1-1.25-4.39c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
              </svg>
            </button>
          )}

          <span className="inline-flex items-center gap-1 rounded-lg bg-[#1B4332] px-2.5 py-1.5 text-xs font-semibold text-white group-hover:bg-[#0D2F1D] transition-colors">
            Detail
          </span>
        </div>
      </div>
    </article>
  );
}
