"use client";

import Image from "next/image";
import { PromoGalleryItem, PromoCollageLayout } from "@/lib/db/types";

interface PromoGalleryCollageProps {
  images: PromoGalleryItem[];
  layout?: PromoCollageLayout;
  title: string;
}

export default function PromoGalleryCollage({
  images,
  layout = "grid-2",
  title,
}: PromoGalleryCollageProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Galeri Promo & Koleksi ({images.length} Foto)
      </h3>

      {/* Grid 2 Layout */}
      {layout === "grid-2" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs"
            >
              <Image
                src={item.url}
                alt={item.alt || `${title} Foto ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 hover:scale-102"
              />
            </div>
          ))}
        </div>
      )}

      {/* Grid 3 Layout */}
      {layout === "grid-3" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs"
            >
              <Image
                src={item.url}
                alt={item.alt || `${title} Foto ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-102"
              />
            </div>
          ))}
        </div>
      )}

      {/* Split Hero Layout */}
      {layout === "split-hero" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Main big image */}
          <div className="md:col-span-7 relative aspect-4/3 md:aspect-auto md:min-h-[320px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
            <Image
              src={images[0].url}
              alt={images[0].alt || `${title} Utama`}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {/* Secondary images grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            {images.slice(1, 5).map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80"
              >
                <Image
                  src={item.url}
                  alt={item.alt || `${title} Foto ${idx + 2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masonry Layout */}
      {layout === "masonry" && (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs break-inside-avoid"
            >
              <Image
                src={item.url}
                alt={item.alt || `${title} Foto ${idx + 1}`}
                width={600}
                height={idx % 2 === 0 ? 450 : 600}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Carousel Layout */}
      {layout === "carousel" && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory admin-scrollbar">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative h-64 w-80 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs snap-start"
            >
              <Image
                src={item.url}
                alt={item.alt || `${title} Foto ${idx + 1}`}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
