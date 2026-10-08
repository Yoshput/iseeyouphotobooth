"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, BlogPost, BlogCategory } from "@/lib/blog";

function getCategoryBadge(category: BlogCategory) {
  switch (category) {
    case "tips-pilih-frame":
      return { label: "Tips Pilih Frame", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    case "edukasi-mata":
      return { label: "Edukasi Mata", bg: "bg-blue-50 text-blue-800 border-blue-200" };
    case "info-cabang-promo":
      return { label: "Event & Promo", bg: "bg-amber-50 text-amber-900 border-amber-200" };
    case "tren-gaya":
      return { label: "Tren Gaya", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    case "perawatan-softlens":
      return { label: "Perawatan Softlens", bg: "bg-rose-50 text-rose-800 border-rose-200" };
    default:
      return { label: "Artikel", bg: "bg-gray-50 text-gray-800 border-gray-200" };
  }
}

// Category tabs configuration for the pill bar
const CATEGORY_TABS: { key: string; label: string; icon: "all" | "eye" | "glasses" | "sparkle" | "event" }[] = [
  { key: "semua", label: "Semua Artikel", icon: "all" },
  { key: "edukasi-mata", label: "Edukasi Mata", icon: "eye" },
  { key: "tips-pilih-frame", label: "Tips Pilih Frame", icon: "glasses" },
  { key: "tren-gaya", label: "Tren Gaya", icon: "sparkle" },
  { key: "info-cabang-promo", label: "Event & Cabang", icon: "event" },
];

export default function BlogShowcaseSection() {
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filtered articles based on active category
  const filteredArticles: BlogPost[] = useMemo(() => {
    if (activeCategory === "semua") {
      return BLOG_POSTS;
    }
    return BLOG_POSTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const totalArticles = filteredArticles.length;

  const nextSlide = useCallback(() => {
    if (totalArticles <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalArticles);
  }, [totalArticles]);

  const prevSlide = useCallback(() => {
    if (totalArticles <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalArticles) % totalArticles);
  }, [totalArticles]);

  // Reset index when changing category
  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setCurrentIndex(0);
  };

  // Auto-cycle slides gently every 5.5s
  useEffect(() => {
    if (isPaused || totalArticles <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide, totalArticles]);

  if (totalArticles === 0) return null;

  const current = filteredArticles[currentIndex] || filteredArticles[0];
  const badgeInfo = getCategoryBadge(current.category);

  return (
    <section className="w-full bg-[#FAF6EC] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-isy-line relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-isy-green-bright/5 blur-[120px]" />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* ═══ 1. Section Header (Centered, Clean Luxury) ═══ */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans text-isy-green-deep tracking-tight">
            Inspirasi Gaya &amp; Info Terkini
          </h2>
          <p className="text-sm sm:text-base text-isy-ink/70">
            Simak rekomendasi frame sesuai bentuk wajah, tips kesehatan mata, dan agenda resmi Optik I See You.
          </p>
        </div>

        {/* ═══ 2. Category Filter Pills (Simple, Clean, Sleek Reference Style) ═══ */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleCategoryChange(tab.key)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-isy-green-deep text-white shadow-sm ring-1 ring-isy-green-deep scale-102"
                    : "bg-white text-isy-ink/70 border border-isy-line hover:border-isy-green-deep/30 hover:bg-white/80"
                }`}
              >
                {/* Minimal Icons for Categories */}
                {tab.icon === "all" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                )}
                {tab.icon === "eye" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
                {tab.icon === "glasses" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="6" cy="12" r="4" />
                    <circle cx="18" cy="12" r="4" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                )}
                {tab.icon === "sparkle" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                  </svg>
                )}
                {tab.icon === "event" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══ 3. Single Elegant Showcase Card (1 Card that can change / transition) ═══ */}
        <div
          className="relative rounded-3xl border border-isy-line bg-white shadow-lg shadow-emerald-950/5 overflow-hidden transition-all duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[380px]">
            {/* Left Cover Image Column — 100% Clean Image with smooth shadow & transition */}
            <div className="md:col-span-5 relative min-h-[260px] md:min-h-full overflow-hidden bg-isy-mist shadow-xs">
              <Link href={`/blog/${current.slug}`} className="block h-full w-full relative group overflow-hidden">
                <Image
                  key={current.slug}
                  src={current.coverImage}
                  alt={current.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Right Editorial Details Column */}
            <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
              <div key={current.slug} className="animate-in fade-in duration-300">
                {/* Meta Header */}
                <div className="flex items-center gap-2 text-xs text-isy-ink/60 mb-3">
                  <span className="font-bold text-isy-green-deep">{badgeInfo.label}</span>
                  <span>•</span>
                  <span>
                    {new Date(current.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span>{current.readingTime} min baca</span>
                </div>

                {/* Title */}
                <Link href={`/blog/${current.slug}`} className="group block">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-isy-green-deep group-hover:text-isy-green-bright transition-colors leading-snug mb-3">
                    {current.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-sm sm:text-base text-isy-ink/75 leading-relaxed line-clamp-3 mb-6">
                  {current.excerpt}
                </p>
              </div>

              {/* Bottom Actions & Slide Switcher */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <Link
                  href={`/blog/${current.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-isy-green-deep hover:bg-isy-green-bright text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
                >
                  <span>Baca Artikel Lengkap</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Previous / Next Arrows for switching slides */}
                {totalArticles > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Artikel Sebelumnya"
                      title="Sebelumnya"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-isy-line bg-gray-50 text-isy-green-deep hover:bg-isy-green-deep hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <span className="text-xs text-isy-ink/60 font-medium px-1">
                      {currentIndex + 1} / {totalArticles}
                    </span>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Artikel Selanjutnya"
                      title="Selanjutnya"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-isy-line bg-gray-50 text-isy-green-deep hover:bg-isy-green-deep hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 4. Centered Bottom CTA (Like Screenshot 3 "Lihat Berita Lainnya") ═══ */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-bold text-sm text-isy-green-deep hover:text-isy-green-bright transition-colors cursor-pointer border-b border-isy-green-deep/30 hover:border-isy-green-bright pb-0.5"
          >
            <span>Lihat Semua Artikel ({BLOG_POSTS.length})</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
