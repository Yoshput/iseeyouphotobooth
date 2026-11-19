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
  layout = "grid-3",
  title,
}: PromoGalleryCollageProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2FA84F]">
            Visual Campaign & Poster
          </p>
          <h3 className="text-lg sm:text-xl font-black text-[#124734]">
            Galeri Promo Resmi
          </h3>
        </div>
      </div>

      {/* Asymmetrical Editorial / Staggered Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Dominant Hero Poster (Takes 7 columns on desktop) */}
        {images[0] && (
          <div className="md:col-span-7 relative aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-[#E3E7DF] shadow-lg group">
            <Image
              src={images[0].url}
              alt={images[0].alt || `${title} Poster Utama`}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-102"
            />
            {images[0].alt && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                <p className="text-xs font-semibold line-clamp-1">{images[0].alt}</p>
              </div>
            )}
          </div>
        )}

        {/* Companion Visuals (Takes 5 columns, stacked / staggered vertically) */}
        <div className="md:col-span-5 flex flex-col gap-4 sm:gap-6 justify-between">
          {images.slice(1, 3).map((item, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl overflow-hidden bg-white border border-[#E3E7DF] shadow-md group ${
                idx === 0
                  ? "aspect-[4/3] sm:aspect-auto sm:flex-1 -rotate-0.5 sm:-translate-y-1 transition-transform"
                  : "aspect-[4/3] sm:aspect-auto sm:flex-1 rotate-0.5 sm:translate-y-1 transition-transform"
              }`}
            >
              <Image
                src={item.url}
                alt={item.alt || `${title} Visual ${idx + 2}`}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {item.alt && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 text-white">
                  <p className="text-xs font-semibold line-clamp-1">{item.alt}</p>
                </div>
              )}
            </div>
          ))}

          {/* If there's only 1 companion image, fill the second slot with a genuine Studio consultation badge card */}
          {images.length === 2 && (
            <div className="rounded-3xl bg-[#124734] p-6 text-white flex flex-col justify-between shadow-md">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  Konsultasi Optik I See You
                </span>
                <h4 className="text-base font-bold">
                  Mau Konsultasi Lensa & Promo Ini?
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Hubungi refraksionis kami via WhatsApp untuk booking jadwal cek mata atau cek ketersediaan frame.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="https://wa.me/6281390977209?text=Halo%20Optik%20I%20See%20You,%20saya%20ingin%20tanya%20tentang%20promo%20ini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#124734] hover:bg-[#FAF8F3]"
                >
                  Chat WhatsApp Cabang →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
