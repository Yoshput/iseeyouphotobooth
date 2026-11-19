"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, X, ExternalLink } from "lucide-react";
import { PromoGalleryItem, PromoCollageLayout } from "@/lib/db/types";

interface PromoGalleryCollageProps {
  images: PromoGalleryItem[];
  layout?: PromoCollageLayout;
  title: string;
}

export default function PromoGalleryCollage({
  images,
  title,
}: PromoGalleryCollageProps) {
  const [zoomedImage, setZoomedImage] = useState<PromoGalleryItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomedImage(null);
        setZoomLevel(1);
      }
    };
    if (zoomedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [zoomedImage]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E3E7DF] pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2FA84F]">
            Visual Campaign & Poster Resmi
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-[#124734]">
            Galeri Poster Promo Lengkap
          </h3>
        </div>
        <p className="hidden sm:block text-xs text-slate-500">
          Klik poster untuk memperbesar dan membaca detail
        </p>
      </div>

      {/* Grid: Full uncropped posters preserving exact 4:5 aspect ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {images.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              setZoomLevel(1);
              setZoomedImage(item);
            }}
            className="group relative cursor-pointer rounded-3xl overflow-hidden bg-white border border-[#E3E7DF] shadow-md hover:shadow-xl hover:border-[#124734]/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Poster image container: 100% uncropped */}
            <div className="relative w-full bg-[#FAF8F3] overflow-hidden p-2 sm:p-3">
              <Image
                src={item.url}
                alt={item.alt || `${title} Poster ${idx + 1}`}
                width={1200}
                height={1500}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto object-contain block rounded-2xl transition-transform duration-500 group-hover:scale-102"
              />

              {/* Click to Zoom Pill */}
              <div className="absolute bottom-5 right-5 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white opacity-85 group-hover:opacity-100 transition-opacity shadow-md">
                <Maximize2 className="h-3.5 w-3.5 text-[#2FA84F]" />
                <span>Perbesar</span>
              </div>
            </div>

            {/* Poster Caption */}
            {item.alt && (
              <div className="p-4 border-t border-[#E3E7DF] bg-white">
                <p className="text-xs font-bold text-[#124734] line-clamp-2">
                  {item.alt}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Lightbox Modal with Zoom & Pan */}
      {zoomedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setZoomedImage(null);
            setZoomLevel(1);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[95vh] max-w-4xl w-full rounded-3xl bg-[#0D2F1D] border border-white/20 p-3 sm:p-5 shadow-2xl flex flex-col items-center overflow-hidden"
          >
            {/* Header Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 px-1 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm line-clamp-1">
                  {zoomedImage.alt || title}
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold bg-white/10 px-2 py-0.5 rounded-md shrink-0">
                  Zoom {zoomLevel.toFixed(1)}x
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Perbesar (+)"
                  aria-label="Perbesar gambar"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Perkecil (-)"
                  aria-label="Perkecil gambar"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Reset Ukuran (1x)"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomedImage(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ml-2"
                  title="Tutup (Esc)"
                  aria-label="Tutup preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div className="relative w-full max-h-[80vh] overflow-auto flex items-center justify-center p-2 rounded-2xl bg-black/40 my-2 admin-scrollbar">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                className="transition-transform duration-200 w-full max-w-lg flex items-center justify-center cursor-zoom-in"
                onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
              >
                <Image
                  src={zoomedImage.url}
                  alt={zoomedImage.alt || title}
                  width={2160}
                  height={2700}
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="w-full h-auto max-h-[75vh] object-contain rounded-xl select-none"
                />
              </div>
            </div>

            {/* Bottom info */}
            <div className="w-full pt-1 px-1 flex items-center justify-between text-white/70 text-[11px]">
              <span>Ketuk poster untuk memperbesar detail voucher & teks promosi</span>
              <a
                href={zoomedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Buka Berkas Asli</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}