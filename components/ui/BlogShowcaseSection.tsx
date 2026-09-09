"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, BlogPost, BlogCategory } from "@/lib/blog";

function getCategoryBadge(category: BlogCategory) {
  switch (category) {
    case "tips-pilih-frame":
      return { label: "Tips Pilih Frame", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    case "edukasi-mata":
      return { label: "Edukasi Mata", bg: "bg-blue-100 text-blue-800 border-blue-300" };
    case "info-cabang-promo":
      return { label: "Event & Promo", bg: "bg-amber-100 text-amber-900 border-amber-300" };
    case "tren-gaya":
      return { label: "Tren Gaya", bg: "bg-purple-100 text-purple-800 border-purple-300" };
    case "perawatan-softlens":
      return { label: "Perawatan Softlens", bg: "bg-rose-100 text-rose-800 border-rose-300" };
    default:
      return { label: "Artikel", bg: "bg-gray-100 text-gray-800 border-gray-300" };
  }
}

// Slugs of curated featured articles for the billboard
const FEATURED_SLUGS = [
  "rekomendasi-frame-tipe-keseharian-starter-pack-coffee-shop",
  "kacamata-contouring-wajah-alami-ilusi-optik",
  "optik-i-see-you-banyumas-wedding-expo-rita-supermall",
  "5-tips-pilih-frame-bentuk-wajah",
  "style-kacamata-spiderman-pop-culture",
  "lensa-bluechromic-anti-radiasi",
  "cara-baca-resep-kacamata",
];

export default function BlogShowcaseSection() {
  // Filter curated articles in specified order
  const featuredArticles: BlogPost[] = FEATURED_SLUGS
    .map(slug => BLOG_POSTS.find(p => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Faster, snappy transition: 3.6s per slide (seperti tayangan berita profesional)
  const SLIDE_DURATION = 3600;
  const INTERVAL_STEP = 40;
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
    setProgress(0);
  }, [featuredArticles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    setProgress(0);
  }, [featuredArticles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Timer loop for auto-sliding and progress bar
  useEffect(() => {
    if (isPaused) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (INTERVAL_STEP / SLIDE_DURATION) * 100;
      });
    }, INTERVAL_STEP);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPaused, nextSlide]);

  if (featuredArticles.length === 0) return null;

  const current = featuredArticles[currentIndex];
  const badgeInfo = getCategoryBadge(current.category);

  return (
    <section className="w-full bg-[#FAF6EC] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-isy-line relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-isy-green-bright/5 blur-[120px]" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-isy-green-bright/10 border border-isy-green-bright/20 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-isy-green-bright mb-3">
              <span className="h-2 w-2 rounded-full bg-isy-green-bright animate-pulse" />
              <span>Headline &amp; Edukasi Terkini</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-dm-serif text-isy-green-deep tracking-tight">
              Inspirasi Gaya &amp; Info Optik Terkini
            </h2>
            <p className="mt-2 text-sm sm:text-base text-isy-ink/70 max-w-xl">
              Simak trik ilusi optik wajah, rekomendasi frame sesuai keseharian, hingga dokumentasi keseruan agenda resmi Optik I See You.
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 self-start md:self-auto rounded-full bg-white/90 hover:bg-isy-green-deep text-isy-green-deep hover:text-white border border-isy-line px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <span>Lihat Semua Artikel ({BLOG_POSTS.length})</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Billboard Container */}
        <div
          className="relative rounded-3xl border border-isy-line bg-white shadow-xl shadow-emerald-950/5 overflow-hidden transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Progress Timer Bar (Like LED News Ticker Auto-Switch) */}
          <div className="w-full h-1.5 bg-gray-100 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-isy-green-bright to-isy-green-deep transition-[width] ease-linear duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Pause Notification Tooltip */}
          {isPaused && (
            <div className="absolute top-4 right-4 z-30 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white shadow-md animate-in fade-in duration-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Otomatis dijeda saat membaca</span>
            </div>
          )}

          {/* Main Slide Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch min-h-[460px]">
            {/* Left Image Column: Smooth Stacked Crossfade Animation */}
            <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[360px] lg:min-h-full overflow-hidden bg-isy-mist">
              <Link href={`/blog/${current.slug}`} className="block h-full w-full relative">
                {featuredArticles.map((article, idx) => {
                  const isActive = idx === currentIndex;
                  const itemBadge = getCategoryBadge(article.category);
                  return (
                    <div
                      key={article.slug}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        isActive
                          ? "opacity-100 scale-100 z-10 pointer-events-auto"
                          : "opacity-0 scale-105 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority={idx <= 1}
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />

                      {/* Dark gradient overlay for text readability on mobile */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${itemBadge.bg}`}>
                          {itemBadge.label}
                        </span>
                        {article.videoUrl && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Video
                          </span>
                        )}
                        {article.slug === "optik-i-see-you-banyumas-wedding-expo-rita-supermall" && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300 shadow-xs">
                            Event Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Link>
            </div>

            {/* Right Editorial Details Column with Smooth Broadcast Transition */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white relative overflow-hidden">
              <div
                key={current.slug}
                className="animate-in fade-in slide-in-from-bottom-3 duration-400 ease-out fill-mode-both"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 text-xs text-isy-ink/60 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-extrabold text-isy-green-bright bg-isy-green-bright/10 px-2.5 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
                      SLIDE {String(currentIndex + 1).padStart(2, "0")} / {String(featuredArticles.length).padStart(2, "0")}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-isy-ink/80">{current.readingTime} min baca</span>
                  </div>
                  <span className="hidden sm:inline-block font-medium">
                    {new Date(current.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/blog/${current.slug}`} className="group block">
                  <h3 className="text-2xl sm:text-3xl font-dm-serif text-isy-green-deep group-hover:text-isy-green-bright transition-colors leading-snug mb-4">
                    {current.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-sm sm:text-base text-isy-ink/75 leading-relaxed line-clamp-3 mb-6">
                  {current.excerpt}
                </p>
              </div>

              {/* Bottom Actions & Controls */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link
                  href={`/blog/${current.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep hover:from-isy-green-deep hover:to-isy-green-bright text-white px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95"
                >
                  <span>Baca Artikel Lengkap</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Artikel Sebelumnya"
                    title="Sebelumnya"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-isy-line bg-isy-mist/70 text-isy-green-deep hover:bg-isy-green-deep hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Artikel Selanjutnya"
                    title="Selanjutnya"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-isy-line bg-isy-mist/70 text-isy-green-deep hover:bg-isy-green-deep hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip (Clickable Pills to Directly Switch Slides) */}
        <div className="mt-6 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {featuredArticles.map((article, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={article.slug}
                onClick={() => goToSlide(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? "bg-isy-green-deep text-white border-isy-green-deep shadow-sm scale-102"
                    : "bg-white text-isy-ink/70 border-isy-line hover:border-isy-green-bright/40 hover:bg-white/80"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-isy-green-bright animate-pulse" : "bg-gray-300"
                  }`}
                />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {article.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
