"use client";

import Image from "next/image";
import Link from "next/link";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";

export default function FeaturedCollectionsSection() {
  // Select top 6 authentic collections for hero showcase
  const featured = CATALOG_COLLECTIONS.slice(0, 6);

  return (
    <section className="w-full bg-[#FFFFFF] py-16 sm:py-20 border-t border-[#E3E7DF]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#124734]/70">
            Pilihan Koleksi
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#124734] tracking-tight">
            Koleksi Frame Pilihan
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#626C65] leading-relaxed">
            Dari siluet minimalis, gaya retro klasik, hingga material titanium ringan untuk kenyamanan setiap hari.
          </p>
        </div>

        {/* 6-Grid Collections Showcase (Zero Autoplay, No Overlap) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featured.map((col) => {
            const itemCount = col.items.length;
            return (
              <Link
                key={col.id}
                href={`/katalog?cat=${col.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E3E7DF] bg-[#F8F5ED]/40 p-4 transition-all duration-300 hover:border-[#124734]/40 hover:bg-white hover:shadow-md cursor-pointer"
              >
                <div>
                  {/* Clean Cover Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white border border-[#E3E7DF]/70 mb-4">
                    <Image
                      src={col.coverImage}
                      alt={`Koleksi Frame ${col.title} - Optik I See You`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-104"
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#626C65]">
                      <span className="font-medium">Koleksi Frame</span>
                      <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-[#124734] border border-[#E3E7DF]">
                        {itemCount} Model
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#124734] group-hover:text-[#0C3527] transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs text-[#626C65] line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3E7DF] flex items-center justify-between text-xs font-semibold text-[#124734]">
                  <span>Lihat Koleksi</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA to Full Catalog */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-xl bg-[#124734] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#0C3527] transition-all active:scale-98"
          >
            <span>Jelajahi Semua Koleksi Frame</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
