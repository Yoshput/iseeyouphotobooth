"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Calendar, ArrowRight, Sparkles, Layers } from "lucide-react";
import { PromoItem, PromoCategory } from "@/lib/db/types";
import { formatPromoPeriod, getCategoryLabel, PROMO_CATEGORIES, getPromoSubdomainUrl } from "@/lib/promo";

export default function PromoSection() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    async function fetchHomepagePromos() {
      try {
        const res = await fetch("/api/promos?homepage=true&limit=6");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setPromos(json.data);
        }
      } catch (err) {
        console.warn("Failed to load homepage promos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchHomepagePromos();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = promos.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  // If loading or completely empty, we can render clean empty state or compact announcement
  return (
    <section
      id="promo-penawaran"
      className="relative w-full bg-[#F8F5ED] px-6 md:px-12 lg:px-20 py-20 border-t border-[#E3E7DF]"
    >
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#124734] shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#2FA84F]" />
              <span>Program & Penawaran Terkini</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#124734] tracking-tight">
              Promo Spesial Optik I See You
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Nikmati penawaran hemat untuk koleksi frame kacamata, paket lensa resep digital, dan promo softlens terdaftar di seluruh cabang kami.
            </p>
          </div>

          {/* CTA to microsite */}
          <div className="shrink-0">
            <Link
              href="/promo"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#124734] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#0d2f1d] hover:scale-102 active:scale-98 transition-all"
            >
              <span>Lihat Semua Promo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 admin-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#124734] text-white shadow-xs"
                : "bg-white border border-[#E3E7DF] text-slate-600 hover:border-[#124734]"
            }`}
          >
            Semua Promo
          </button>
          {PROMO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#124734] text-white shadow-xs"
                  : "bg-white border border-[#E3E7DF] text-slate-600 hover:border-[#124734]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-[#E3E7DF] bg-white p-5 space-y-4 animate-pulse"
              >
                <div className="aspect-[4/5] rounded-2xl bg-slate-200" />
                <div className="h-4 w-24 bg-slate-200 rounded-md" />
                <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E3E7DF] bg-white/70 p-10 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-50 text-[#124734]">
              <Tag className="h-6 w-6 stroke-[1.8] text-[#2FA84F]" />
            </div>
            <h3 className="text-base font-bold text-[#124734]">
              Nantikan Promo Berikutnya
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Saat ini belum ada promo aktif dalam kategori ini. Silakan kunjungi halaman promo microsite kami untuk melihat jadwal penawaran mendatang.
            </p>
            <div className="pt-2">
              <a
                href={getPromoSubdomainUrl()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124734] hover:underline"
              >
                <span>Buka Promo Microsite</span>
                <span>→</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.slice(0, 3).map((promo) => {
              const period = formatPromoPeriod(promo.startAt, promo.endAt);
              const categoryLabel = getCategoryLabel(promo.category);

              return (
                <div
                  key={promo.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#E3E7DF] bg-white overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#2FA84F]/40 hover:shadow-xl hover:shadow-[#2FA84F]/5"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF8F3] p-2.5">
                      {promo.heroImageUrl ? (
                        <Image
                          src={promo.heroImageUrl}
                          alt={promo.heroImageAlt || promo.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-102 rounded-2xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <Tag className="h-8 w-8 stroke-[1.5]" />
                          <span className="text-[11px] mt-1">Optik I See You</span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 z-10">
                        <span className="rounded-full bg-[#124734]/90 backdrop-blur-xs px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                          {categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 sm:p-6 space-y-2.5">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="h-3 w-3 text-[#2FA84F]" />
                        <span>{period}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#124734] transition-colors leading-snug line-clamp-2">
                        {promo.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 font-normal">
                        {promo.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 sm:p-6 pt-0">
                    <a
                      href={getPromoSubdomainUrl(promo.slug)}
                      className="w-full inline-flex items-center justify-between rounded-2xl border border-[#E3E7DF] bg-[#F8F5ED] px-4 py-3 text-xs font-bold text-[#124734] group-hover:border-[#124734] group-hover:bg-[#124734] group-hover:text-white transition-all duration-300"
                    >
                      <span>Lihat Promo</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
