"use client";

import { useState, useMemo } from "react";
import { Tag, Sparkles, Calendar, Layers, Search, Filter } from "lucide-react";
import { PromoItem, PromoCategory } from "@/lib/db/types";
import { PROMO_CATEGORIES } from "@/lib/promo";
import PromoCard from "./PromoCard";

interface PromoMicrositeClientProps {
  initialPromos: PromoItem[];
  featuredPromo: PromoItem | null;
}

export default function PromoMicrositeClient({
  initialPromos,
  featuredPromo,
}: PromoMicrositeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPromos = useMemo(() => {
    return initialPromos.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesExcerpt = p.excerpt.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt) return false;
      }
      return true;
    });
  }, [initialPromos, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E3E7DF] pb-5">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 admin-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#124734] text-white shadow-md shadow-[#124734]/20"
                : "bg-white border border-[#E3E7DF] text-slate-700 hover:border-[#124734]"
            }`}
          >
            Semua Promo ({initialPromos.length})
          </button>

          {PROMO_CATEGORIES.map((cat) => {
            const count = initialPromos.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-[#124734] text-white shadow-md shadow-[#124734]/20"
                    : "bg-white border border-[#E3E7DF] text-slate-700 hover:border-[#124734]"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari promo..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-[#E3E7DF] bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Featured Promo Highlight Banner (if applicable and viewing all or matches category) */}
      {featuredPromo &&
        selectedCategory === "all" &&
        !searchQuery && (
          <div className="relative rounded-3xl bg-gradient-to-r from-[#124734] to-[#0D2F1D] text-white p-6 sm:p-10 shadow-xl overflow-hidden">
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-[#2FA84F]/20 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2.5">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                  Program Unggulan
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                  {featuredPromo.title}
                </h2>
                {featuredPromo.subtitle && (
                  <p className="text-sm font-semibold text-emerald-200">
                    {featuredPromo.subtitle}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-xl font-normal leading-relaxed">
                  {featuredPromo.excerpt || featuredPromo.description}
                </p>
              </div>

              <div className="md:col-span-4 flex md:justify-end">
                <a
                  href={`/${featuredPromo.slug}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-[#124734] shadow-lg hover:bg-[#FAF8F3] hover:scale-102 active:scale-98 transition-all"
                >
                  <span>{featuredPromo.ctaLabel || "Lihat Promo Unggulan"}</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        )}

      {/* Promos Grid */}
      {filteredPromos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E3E7DF] bg-[#FAF8F3] p-12 text-center space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white border border-[#E3E7DF] text-[#124734] shadow-2xs">
            <Tag className="h-6 w-6 stroke-[1.8] text-[#2FA84F]" />
          </div>
          <h3 className="text-base font-bold text-[#124734]">
            Belum Ada Promo Aktif pada Kategori Ini
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Program promosi baru sedang disiapkan oleh tim Optik I See You. Kunjungi kami kembali dalam waktu dekat atau konsultasikan kebutuhan lensa dan frame langsung dengan tim refraksionis di cabang kami.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124734] hover:underline"
            >
              <span>← Tampilkan Semua Promo Aktif</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </div>
  );
}
