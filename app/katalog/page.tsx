"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import FloatingSunglasses from "@/components/katalog/FloatingSunglasses";
import CatalogConfetti from "@/components/katalog/CatalogConfetti";
import CatalogDetailModal from "@/components/katalog/CatalogDetailModal";
import ContactCSModal from "@/components/ui/ContactCSModal";
import { CATALOG_COLLECTIONS, type CatalogCollection, type CatalogItem } from "@/lib/catalog";
import { csWhatsappUrl } from "@/lib/branches";

/**
 * Item Card component — clean, minimal, click to view detail modal
 */
function CatalogItemCard({
  item,
  onOpenDetail,
  onOpenCSModal,
}: {
  item: CatalogItem;
  onOpenDetail: (item: CatalogItem) => void;
  onOpenCSModal: (item: CatalogItem) => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!item.images || item.images.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % item.images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [item.images]);

  const displayImages = item.images && item.images.length > 0 ? item.images : [item.image];

  return (
    <div
      onClick={() => onOpenDetail(item)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-isy-green-bright/50 hover:shadow-xl cursor-pointer"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-isy-mist border border-isy-line/60">
          {displayImages.map((imgSrc, idx) => (
            <Image
              key={imgSrc}
              src={imgSrc}
              alt={`${item.name} ${idx + 1}`}
              fill
              className={`object-contain p-4 transition-all duration-700 ${
                idx === slideIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          ))}

          {/* Dots */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {displayImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIndex(idx);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === slideIndex ? "w-4 bg-isy-green-bright" : "w-1 bg-isy-green-bright/30"
                  }`}
                />
              ))}
            </div>
          )}

          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-isy-green-deep shadow border border-isy-line z-10">
            {item.style}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(item);
            }}
            className="absolute bottom-3 right-3 rounded-full bg-isy-green-deep/90 text-white px-2.5 py-1 text-[10px] font-bold shadow backdrop-blur-md hover:bg-isy-green-bright transition-colors z-10"
          >
            {item.specsImage ? "Lihat Specs" : "Detail Frame"}
          </button>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <h3 className="font-serif text-lg font-black text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-isy-ink/65 leading-relaxed line-clamp-2">
            {item.description}
          </p>

          {/* Recommended Face Shapes */}
          <div className="pt-1 flex flex-wrap gap-1 items-center">
            <span className="text-[10px] font-bold text-isy-ink/40">Cocok Wajah:</span>
            {item.recommendedFor.map((shape) => (
              <span
                key={shape}
                className="rounded-md bg-isy-mist px-2 py-0.5 text-[9.5px] font-extrabold text-isy-green-deep border border-isy-line"
              >
                {shape}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-2 gap-2 pt-4 border-t border-isy-line">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(item);
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep transition-all hover:bg-isy-line active:scale-95"
        >
          Lihat Detail
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCSModal(item);
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-deep py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-isy-green-bright active:scale-95"
        >
          <Image
            src="/logo/Logo-Whatsapp.png"
            alt="WhatsApp"
            width={16}
            height={16}
            className="h-4 w-4 object-contain"
          />
          Tanya WA
        </button>
      </div>
    </div>
  );
}



function CatalogPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "choose";
  const initialViewMode = tabParam === "frame" || searchParams.get("q") || searchParams.get("cat") ? "frame" : "choose";
  const [viewMode, setViewMode] = useState<"choose" | "frame">(initialViewMode);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalItem, setActiveModalItem] = useState<CatalogItem | null>(null);

  // ContactCS Modal state (poin 4)
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [csModalItem, setCsModalItem] = useState<CatalogItem | null>(null);
  const openCSModal = (item: CatalogItem) => {
    setCsModalItem(item);
    setCsModalOpen(true);
  };

  const contentSectionRef = useRef<HTMLElement>(null);
  const firstSectionRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Categories include all 6 catalog collections
  const categories = [
    { id: "all", label: "Semua Koleksi" },
    ...CATALOG_COLLECTIONS.map((c) => ({ id: c.id, label: c.title })),
  ];

  // Quick search tags
  const quickSearchTags = [
    "The Feline Silhouette",
    "The Skena Gaze",
    "The Lucid Vision",
    "Cat Eye Edition",
    "Quiet Luxury",
    "Titanium",
    "Metro Deek",
  ];

  // Smooth scroll trigger with 150ms delay for DOM render
  const triggerAutoScroll = () => {
    setTimeout(() => {
      const targetEl = firstSectionRef.current || contentSectionRef.current;
      if (targetEl) {
        const yOffset = -90; // sticky navbar offset
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 150);
  };

  // Refined & Accurate Search Filter Logic (Title / Name / Style Priority)
  const displaySections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return CATALOG_COLLECTIONS.map((collection) => {
        const categoryMatches = selectedCategory === "all" || collection.id === selectedCategory;
        if (!categoryMatches) return null;
        return { collection, items: collection.items };
      }).filter(Boolean) as Array<{ collection: CatalogCollection; items: CatalogItem[] }>;
    }

    // Filter matching collections
    const rawMatches = CATALOG_COLLECTIONS.map((collection) => {
      const categoryMatches = selectedCategory === "all" || collection.id === selectedCategory;
      if (!categoryMatches) return null;

      const collectionTitleMatch =
        collection.title.toLowerCase().includes(q) ||
        collection.id.toLowerCase().includes(q);

      const matchingItems = collection.items.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const styleMatch = item.style.toLowerCase().includes(q);
        const colMatch = item.collection.toLowerCase().includes(q);
        const shapeMatch = item.recommendedFor.some((shape) => shape.toLowerCase().includes(q));

        if (collectionTitleMatch || nameMatch || styleMatch || colMatch || shapeMatch) {
          return true;
        }

        // Only fallback to description if query is long (>3 chars) and no title match
        return q.length > 3 && item.description.toLowerCase().includes(q);
      });

      if (matchingItems.length === 0) return null;

      return {
        collection,
        items: matchingItems,
        isTitleMatch: collectionTitleMatch,
      };
    }).filter(Boolean) as Array<{
      collection: CatalogCollection;
      items: CatalogItem[];
      isTitleMatch: boolean;
    }>;

    // Prioritize direct title/name/style matches over description collateral
    const hasDirectMatches = rawMatches.some(
      (sec) =>
        sec.isTitleMatch ||
        sec.items.some(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.style.toLowerCase().includes(q) ||
            i.collection.toLowerCase().includes(q)
        )
    );

    if (hasDirectMatches) {
      return rawMatches
        .map((sec) => {
          if (sec.isTitleMatch) return { collection: sec.collection, items: sec.items };
          const strictItems = sec.items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.style.toLowerCase().includes(q) ||
              item.collection.toLowerCase().includes(q) ||
              item.recommendedFor.some((shape) => shape.toLowerCase().includes(q))
          );
          if (strictItems.length === 0) return null;
          return { collection: sec.collection, items: strictItems };
        })
        .filter(Boolean) as Array<{ collection: CatalogCollection; items: CatalogItem[] }>;
    }

    return rawMatches.map((sec) => ({ collection: sec.collection, items: sec.items }));
  }, [selectedCategory, searchQuery]);

  const totalMatchingItems = useMemo(() => {
    return displaySections.reduce((acc, sec) => acc + sec.items.length, 0);
  }, [displaySections]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      triggerAutoScroll();
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    triggerAutoScroll();
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory("all");
    triggerAutoScroll();
  };

  return (
    <main className="relative min-h-dvh w-full bg-isy-gradient selection:bg-isy-green-bright selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Floating Sunglasses Silhouettes (Desktop & Tablet Wide) */}
      <FloatingSunglasses />

      {/* Brand Green & Gold Confetti Burst on Initial Load */}
      <CatalogConfetti />

      {viewMode === "choose" ? (
        /* Gateway Mode: 2 Big Choice Cards (Minimalist Luxury Design) */
        <section className="relative overflow-hidden px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
          {/* Top-Left Back Button to Home */}
          <div className="w-full max-w-5xl mx-auto flex items-center justify-start mb-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-isy-line bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-isy-green-deep shadow-xs hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-isy-green-deep/5 text-isy-green-deep text-[11px] font-extrabold uppercase tracking-widest mb-3 border border-isy-green-deep/10">
              <span>KATALOG OPTIK I SEE YOU</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-isy-green-deep leading-tight">
              Mau Lihat Koleksi yang Mana?
            </h1>
            <p className="text-sm sm:text-base text-isy-ink/65 mt-3 font-medium">
              Pilih katalog frame kacamata optik atau koleksi softlens natural &amp; eye care.
            </p>
          </div>

          {/* 2 Big Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
            {/* Card 1: Katalog Frame Kacamata (Clean Porcelain Minimalist) */}
            <div
              onClick={() => {
                setViewMode("frame");
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", "/katalog?tab=frame");
                }
              }}
              className="group relative flex flex-col justify-between bg-white rounded-3xl p-8 sm:p-10 border-2 border-isy-line hover:border-isy-green-bright shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-isy-green-deep transition-transform group-hover:scale-110">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="6" cy="14" r="4" />
                        <circle cx="18" cy="14" r="4" />
                        <path d="M10 14h4" />
                        <path d="M6 10l2-4h8l2 4" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                      KOLEKSI OPTIK
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                    9+ Seri Koleksi
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-black text-isy-green-deep mb-3 group-hover:text-isy-green-bright transition-colors tracking-tight">
                  Katalog Frame Kacamata
                </h2>
                <p className="text-sm text-isy-ink/65 mb-8 leading-relaxed">
                  Koleksi frame kacamata optik &amp; sunglasses original: The Feline Silhouette, The Skena Gaze, The Lucid Vision, Cat Eye, Quiet Luxury, Titanium Edition, dan seri eksklusif lainnya.
                </p>
              </div>

              <div className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-isy-green-bright text-white font-black text-sm sm:text-base shadow-md shadow-isy-green-bright/25 group-hover:bg-isy-green-deep transition-all">
                <span>Buka Katalog Frame →</span>
              </div>
            </div>

            {/* Card 2: Katalog Softlens & Aksesoris (Deep Luxury Emerald & Frosted Accent) */}
            <Link
              href="/softlens"
              className="group relative flex flex-col justify-between bg-gradient-to-br from-[#0B2E1E] via-[#0E3B27] to-[#071C12] text-white rounded-3xl p-8 sm:p-10 border-2 border-emerald-800/40 hover:border-emerald-400/80 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer relative overflow-hidden"
            >
              {/* Subtle Ambient Emerald Glow */}
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-emerald-300 backdrop-blur-md transition-transform group-hover:scale-110">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3.5" />
                        <circle cx="13" cy="11" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                      SOFTLENS &amp; EYE CARE
                    </span>
                  </div>

                  {/* Frosted Glass Elevated Tag */}
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-extrabold text-xs tracking-wide shadow-sm">
                    Estetik &amp; Nyaman
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mb-3 tracking-tight drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                  Katalog Softlens &amp; Aksesoris
                </h2>
                <p className="text-sm text-white/75 mb-8 leading-relaxed font-normal">
                  Koleksi softlens normal &amp; minus warna natural berestetika tinggi, cairan pembersih steril berkualitas, serta perlengkapan perawatan mata.
                </p>
              </div>

              <div className="relative z-10 w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 text-[#071C12] font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 group-hover:from-emerald-300 group-hover:to-teal-200 transition-all">
                <span>Buka Katalog Softlens &amp; Cairan →</span>
              </div>
            </Link>
          </div>
        </section>
      ) : (
        /* Frame Mode Content */
        <>
          {/* Hero Header Section */}
          <section className="relative overflow-hidden bg-isy-white border-b border-isy-line px-6 pt-24 pb-8 sm:pb-10 text-center">
            <div className="mx-auto max-w-4xl space-y-4 relative z-10">
              <div className="flex items-center justify-start">
                <button
                  onClick={() => {
                    setViewMode("choose");
                    if (typeof window !== "undefined") {
                      window.history.pushState({}, "", "/katalog");
                    }
                  }}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-isy-line bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-isy-green-deep shadow-xs hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>Kembali ke Pilihan Katalog</span>
                </button>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-isy-green-bright/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-isy-green-bright">
                  Katalog Optik I See You
                </span>
              </div>

              <h1 className="font-serif text-3xl font-black text-isy-green-deep sm:text-5xl">
                Koleksi Frame Terlengkap
              </h1>

              {/* Search Bar Input */}
              <div className="pt-1 max-w-xl mx-auto space-y-3">
                <div className="relative flex items-center">
              <svg
                className="absolute left-4 h-4 w-4 text-isy-ink/40 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Cari model kacamata, bentuk frame, atau koleksi..."
                className="w-full rounded-full border border-isy-line bg-isy-mist/70 pl-11 pr-10 py-3 text-xs font-bold text-isy-green-deep placeholder:text-isy-ink/40 focus:border-isy-green-bright focus:bg-white focus:outline-none focus:ring-2 focus:ring-isy-green-bright/20 transition-all shadow-sm"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 flex h-5 w-5 items-center justify-center rounded-full bg-isy-ink/20 text-[10px] text-white hover:bg-isy-green-deep transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="text-[10px] font-extrabold text-isy-ink/40 uppercase tracking-wider">Cari cepat:</span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTagClick(tag)}
                  className="rounded-full border border-isy-line bg-white/80 px-2.5 py-1 text-[10.5px] font-bold text-isy-green-deep hover:border-isy-green-bright hover:bg-isy-mist transition-all active:scale-95 shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section ref={contentSectionRef} id="katalog-content" className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        {/* Category Filters */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all active:scale-95 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-isy-green-deep text-white shadow-md"
                  : "border border-isy-line bg-white text-isy-ink/70 hover:border-isy-green-bright hover:text-isy-green-deep"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search / Filter Status Notice */}
        {(searchQuery || selectedCategory !== "all") && (
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-isy-line shadow-xs animate-in fade-in duration-200">
            <p className="text-xs font-bold text-isy-green-deep">
              Menampilkan <span className="font-black text-isy-green-bright">{totalMatchingItems}</span> frame
              {searchQuery && (
                <span> untuk pencarian &quot;<span className="italic text-isy-green-bright">{searchQuery}</span>&quot;</span>
              )}
            </p>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs font-extrabold text-isy-green-bright hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Grouped by Collection (1 Judul 1 Section - Clean & Simple) */}
        {displaySections.length > 0 ? (
          <div className="space-y-14">
            {displaySections.map(({ collection, items }, index) => (
              <div
                key={collection.id}
                ref={index === 0 ? firstSectionRef : null}
                className="space-y-6 pt-4 border-t border-isy-line/80 first:border-t-0 first:pt-0"
              >
                {/* 1 Judul Clean per Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-isy-green-bright/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-isy-green-bright">
                        {collection.badge}
                      </span>
                      <span className="text-xs font-bold text-isy-ink/40">
                        {items.length} Frame
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
                      {collection.title}
                    </h2>
                  </div>

                  <p className="text-xs text-isy-ink/60 max-w-md font-medium">
                    {collection.description}
                  </p>
                </div>

                {/* Items Grid for this Collection */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <CatalogItemCard
                      key={item.id}
                      item={item}
                      onOpenDetail={(targetItem) => setActiveModalItem(targetItem)}
                      onOpenCSModal={openCSModal}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search Results State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-isy-line bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-isy-mist text-isy-green-deep">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <h3 className="font-serif text-xl font-black text-isy-green-deep">
              Tidak Ada Model Kacamata yang Sesuai
            </h3>

            <p className="text-xs text-isy-ink/60 max-w-md">
              Tidak ditemukan kacamata untuk kata kunci &quot;{searchQuery}&quot;. Coba gunakan kata kunci lain seperti &quot;Titanium&quot;, &quot;Cat Eye&quot;, atau &quot;Metro Deek&quot;.
            </p>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="rounded-xl bg-isy-green-bright px-6 py-2.5 text-xs font-black text-white hover:bg-isy-green-deep transition-all shadow"
            >
              Lihat Semua Frame
            </button>
          </div>
        )}
      </section>
      </>
    )}

      {/* Detail & Specs Modal */}
      <CatalogDetailModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onOpenContactCS={openCSModal}
      />

      {/* Contact CS Modal — Poin 4 */}
      <ContactCSModal
        isOpen={csModalOpen}
        onClose={() => setCsModalOpen(false)}
        waUrl={csModalItem ? csWhatsappUrl(csModalItem.name) : csWhatsappUrl()}
        productName={csModalItem?.name}
      />
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-isy-ivory flex items-center justify-center">Loading...</div>}>
      <CatalogPageContent />
    </Suspense>
  );
}
