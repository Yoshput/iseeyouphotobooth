"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn, MessageCircle, ArrowRight, X } from "lucide-react";
import ProductImageZoomModal from "@/components/katalog/ProductImageZoomModal";
import { KONSULTASI_WA_NUMBER } from "@/lib/branches";

interface FeedItem {
  id: string;
  name: string;
  tag: string;
  thumb: string;
  medium: string;
  zoom: string;
}

const FEED_ROW_1: FeedItem[] = [
  { id: "feed-1", name: "RSM Editorial Feed 01", tag: "New Look", thumb: "/katalog-feed/1-thumb.webp", medium: "/katalog-feed/1-medium.webp", zoom: "/katalog-feed/1-zoom.webp" },
  { id: "feed-2", name: "RSM Editorial Feed 02", tag: "Signature Frame", thumb: "/katalog-feed/2-thumb.webp", medium: "/katalog-feed/2-medium.webp", zoom: "/katalog-feed/2-zoom.webp" },
  { id: "feed-3", name: "RSM Editorial Feed 03", tag: "Modern Minimalist", thumb: "/katalog-feed/3-thumb.webp", medium: "/katalog-feed/3-medium.webp", zoom: "/katalog-feed/3-zoom.webp" },
  { id: "feed-4", name: "RSM Editorial Feed 04", tag: "Trendy Eyewear", thumb: "/katalog-feed/4-thumb.webp", medium: "/katalog-feed/4-medium.webp", zoom: "/katalog-feed/4-zoom.webp" },
  { id: "feed-5", name: "RSM Editorial Feed 05", tag: "Titanium Elegance", thumb: "/katalog-feed/5-thumb.webp", medium: "/katalog-feed/5-medium.webp", zoom: "/katalog-feed/5-zoom.webp" },
  { id: "feed-6", name: "RSM Editorial Feed 06", tag: "Acetate Series", thumb: "/katalog-feed/6-thumb.webp", medium: "/katalog-feed/6-medium.webp", zoom: "/katalog-feed/6-zoom.webp" },
  { id: "feed-boom-1", name: "RSM Lookbook 01", tag: "Daily Wear", thumb: "/katalog-feed/boom-thumb.webp", medium: "/katalog-feed/boom-medium.webp", zoom: "/katalog-feed/boom-zoom.webp" },
];

const FEED_ROW_2: FeedItem[] = [
  { id: "feed-7", name: "RSM Editorial Feed 07", tag: "Classic Retro", thumb: "/katalog-feed/7-thumb.webp", medium: "/katalog-feed/7-medium.webp", zoom: "/katalog-feed/7-zoom.webp" },
  { id: "feed-8", name: "RSM Editorial Feed 08", tag: "Urban Style", thumb: "/katalog-feed/8-thumb.webp", medium: "/katalog-feed/8-medium.webp", zoom: "/katalog-feed/8-zoom.webp" },
  { id: "feed-9", name: "RSM Editorial Feed 09", tag: "Comfort Fit", thumb: "/katalog-feed/9-thumb.webp", medium: "/katalog-feed/9-medium.webp", zoom: "/katalog-feed/9-zoom.webp" },
  { id: "feed-10", name: "RSM Editorial Feed 10", tag: "Cat Eye Trend", thumb: "/katalog-feed/10-thumb.webp", medium: "/katalog-feed/10-medium.webp", zoom: "/katalog-feed/10-zoom.webp" },
  { id: "feed-11", name: "RSM Editorial Feed 11", tag: "Subtle Charm", thumb: "/katalog-feed/11-thumb.webp", medium: "/katalog-feed/11-medium.webp", zoom: "/katalog-feed/11-zoom.webp" },
  { id: "feed-boom-2", name: "RSM Lookbook 02", tag: "Vintage Classic", thumb: "/katalog-feed/boom-02-thumb.webp", medium: "/katalog-feed/boom-02-medium.webp", zoom: "/katalog-feed/boom-02-zoom.webp" },
  { id: "feed-boom-3", name: "RSM Lookbook 03", tag: "Gentle Edge", thumb: "/katalog-feed/boom-03-thumb.webp", medium: "/katalog-feed/boom-03-medium.webp", zoom: "/katalog-feed/boom-03-zoom.webp" },
];

export default function RunningCatalogFeed() {
  const [activeItem, setActiveItem] = useState<FeedItem | null>(null);
  const [zoomItem, setZoomItem] = useState<FeedItem | null>(null);

  const getWaUrl = (item: FeedItem) => {
    const msg = `Halo CS Optik I See You 👋, saya tertarik dengan frame pada katalog "${item.name}" (${item.tag}). Boleh info rekomendasi model dan stoknya? Terima kasih! 🙏`;
    return `https://wa.me/${KONSULTASI_WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF8F3] py-16 sm:py-24 border-y border-[#E3E7DF]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-10 text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#124734]">
          Pilihan Koleksi
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#183C30] tracking-tight">
          Koleksi Frame Pilihan
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[#626C65] max-w-2xl mx-auto leading-relaxed">
          Dari siluet minimalis, gaya retro klasik, hingga material titanium ringan untuk kenyamanan setiap hari.
        </p>
      </div>

      {/* Marquee Showcase (2 Rows, Opposite Directions, Smooth Infinite Loop) */}
      <div className="w-full space-y-4 sm:space-y-6 overflow-hidden">
        {/* Row 1: Leftward Infinite Marquee */}
        <div className="group/row relative w-full overflow-hidden py-1">
          <div className="animate-marquee-left flex items-center gap-4 sm:gap-6 group-hover/row:[animation-play-state:paused]">
            {FEED_ROW_1.concat(FEED_ROW_1).concat(FEED_ROW_1).map((item, idx) => (
              <button
                key={`r1-${idx}`}
                type="button"
                onClick={() => setActiveItem(item)}
                aria-label={`Lihat detail ${item.name}`}
                className="group/card relative h-64 sm:h-72 md:h-80 w-44 sm:w-52 md:w-56 shrink-0 overflow-hidden rounded-2xl border border-[#E3E7DF] bg-white shadow-2xs transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-[#124734]/50 select-none cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#124734]"
              >
                <Image
                  src={item.thumb}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 210px, 240px"
                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  loading="lazy"
                />

                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                    {item.tag}
                  </span>
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-white/90 underline mt-0.5">
                    Klik untuk melihat ↗
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Rightward Infinite Marquee */}
        <div className="group/row relative w-full overflow-hidden py-1">
          <div className="animate-marquee-right flex items-center gap-4 sm:gap-6 group-hover/row:[animation-play-state:paused]">
            {FEED_ROW_2.concat(FEED_ROW_2).concat(FEED_ROW_2).map((item, idx) => (
              <button
                key={`r2-${idx}`}
                type="button"
                onClick={() => setActiveItem(item)}
                aria-label={`Lihat detail ${item.name}`}
                className="group/card relative h-64 sm:h-72 md:h-80 w-44 sm:w-52 md:w-56 shrink-0 overflow-hidden rounded-2xl border border-[#E3E7DF] bg-white shadow-2xs transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-[#124734]/50 select-none cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#124734]"
              >
                <Image
                  src={item.thumb}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 210px, 240px"
                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                    {item.tag}
                  </span>
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-white/90 underline mt-0.5">
                    Klik untuk melihat ↗
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-10 sm:mt-12 text-center">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 rounded-xl bg-[#124734] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0C3527] transition-all hover:scale-102 active:scale-98"
        >
          <span>Jelajahi Semua Frame di Katalog</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Preview Modal ("di klik") */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detail ${activeItem.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="absolute inset-0" onClick={() => setActiveItem(null)} />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E3E7DF] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E3E7DF] px-5 py-3.5 bg-[#FAF8F3]">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#124734]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#124734]">
                  {activeItem.tag}
                </span>
                <h3 className="text-sm font-bold text-[#183C30] truncate">
                  {activeItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                aria-label="Tutup preview"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#626C65] hover:bg-[#E3E7DF] hover:text-[#183C30] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Medium Image */}
            <div className="p-4 sm:p-5 space-y-4">
              <div
                onClick={() => {
                  setZoomItem(activeItem);
                  setActiveItem(null);
                }}
                className="relative aspect-[9/14] w-full max-h-[60vh] overflow-hidden rounded-xl bg-[#FAF8F3] border border-[#E3E7DF] cursor-zoom-in group"
                title="Klik untuk Zoom Layar Penuh HD"
              >
                <Image
                  src={activeItem.medium}
                  alt={activeItem.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-102"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-[#124734] shadow-xs flex items-center gap-1 border border-[#E3E7DF]">
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>Klik Zoom HD</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setZoomItem(activeItem);
                    setActiveItem(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] py-2.5 px-4 text-xs font-bold text-[#183C30] hover:bg-white hover:border-[#124734] transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-[#124734]" />
                  <span>Perbesar Layar Penuh HD</span>
                </button>

                <a
                  href={getWaUrl(activeItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#124734] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#0C3527] transition-colors shadow-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Tanya CS WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen HD Zoom Modal ("di zoom") */}
      {zoomItem && (
        <ProductImageZoomModal
          isOpen={Boolean(zoomItem)}
          onClose={() => setZoomItem(null)}
          title={zoomItem.name}
          images={[{ label: "Tampilan Layar Penuh HD", src: zoomItem.zoom }]}
          initialIndex={0}
        />
      )}
    </section>
  );
}
