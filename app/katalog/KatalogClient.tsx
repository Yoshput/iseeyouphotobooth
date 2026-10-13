"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import CatalogItemCard from "@/components/katalog/CatalogItemCard";
import CatalogDetailModal from "@/components/katalog/CatalogDetailModal";
import ContactCSModal from "@/components/ui/ContactCSModal";
import type { CatalogCollection, CatalogItem } from "@/lib/catalog";
import type { SoftlensProduct } from "@/lib/softlens";

interface KatalogClientProps {
  initialCollections: CatalogCollection[];
  initialSoftlens?: SoftlensProduct[];
}

const FAVORITES_STORAGE_KEY = "isy_fav_frames";

export default function KatalogClient({
  initialCollections,
}: KatalogClientProps) {
  // Flatten unique items across all collections
  const allItems = useMemo<CatalogItem[]>(() => {
    const map = new Map<string, CatalogItem>();
    initialCollections.forEach((col) => {
      col.items.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, {
            ...item,
            collection: item.collection || col.title,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [initialCollections]);

  // Dynamic filter lists supported by data
  const availableShapes = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => {
      const s = i.shape || i.style;
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [allItems]);

  const availableMaterials = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => {
      if (i.material) set.add(i.material);
    });
    return Array.from(set).sort();
  }, [allItems]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => {
      i.colors?.forEach((c) => {
        if (c.name) set.add(c.name);
      });
    });
    return Array.from(set).sort();
  }, [allItems]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShape, setSelectedShape] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [onlyWithAr, setOnlyWithAr] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<
    "default" | "name-asc" | "name-desc" | "price-asc" | "price-desc"
  >("default");

  // Mobile Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Local Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // localStorage may fail in restricted/private modes
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  }, []);

  // Modal States
  const [activeDetailItem, setActiveDetailItem] = useState<CatalogItem | null>(null);
  const [activeColorVariant, setActiveColorVariant] = useState<string | undefined>();
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [csModalItem, setCsModalItem] = useState<{
    item: CatalogItem;
    colorVariant?: string;
  } | null>(null);

  // Filtering & Search Logic
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = allItems.filter((item) => {
      // Search matching (Name, SKU, Collection, Shape, Material, Color, Recommended)
      if (q) {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku?.toLowerCase().includes(q);
        const matchesCollection = item.collection.toLowerCase().includes(q);
        const matchesShape = ((item.shape || item.style) || "").toLowerCase().includes(q);
        const matchesMaterial = item.material?.toLowerCase().includes(q);
        const matchesColors = item.colors?.some((c) =>
          c.name.toLowerCase().includes(q)
        );
        const matchesRecommended = item.recommendedFor?.some((r) =>
          r.toLowerCase().includes(q)
        );

        if (
          !matchesName &&
          !matchesSku &&
          !matchesCollection &&
          !matchesShape &&
          !matchesMaterial &&
          !matchesColors &&
          !matchesRecommended
        ) {
          return false;
        }
      }

      // Shape filter
      if (selectedShape !== "all") {
        const itemShape = item.shape || item.style;
        if (itemShape !== selectedShape) return false;
      }

      // Material filter
      if (selectedMaterial !== "all") {
        if (item.material !== selectedMaterial) return false;
      }

      // Color filter
      if (selectedColor !== "all") {
        const hasColor = item.colors?.some((c) =>
          c.name.toLowerCase() === selectedColor.toLowerCase()
        );
        if (!hasColor) return false;
      }

      // Collection filter
      if (selectedCollection !== "all") {
        const targetCol = initialCollections.find((c) => c.id === selectedCollection);
        if (!targetCol) return false;
        const belongsToCollection = targetCol.items.some((i) => i.id === item.id);
        if (!belongsToCollection && item.collection !== targetCol.title) return false;
      }

      // AR Try-On filter
      if (onlyWithAr && !item.arAssetId) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return a.price - b.price;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return b.price - a.price;
      });
    }

    return result;
  }, [
    allItems,
    searchQuery,
    selectedShape,
    selectedMaterial,
    selectedColor,
    selectedCollection,
    onlyWithAr,
    onlyFavorites,
    favorites,
    sortBy,
    initialCollections,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedShape !== "all") count++;
    if (selectedMaterial !== "all") count++;
    if (selectedColor !== "all") count++;
    if (selectedCollection !== "all") count++;
    if (onlyWithAr) count++;
    if (onlyFavorites) count++;
    if (searchQuery) count++;
    return count;
  }, [
    selectedShape,
    selectedMaterial,
    selectedColor,
    selectedCollection,
    onlyWithAr,
    onlyFavorites,
    searchQuery,
  ]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedShape("all");
    setSelectedMaterial("all");
    setSelectedColor("all");
    setSelectedCollection("all");
    setOnlyWithAr(false);
    setOnlyFavorites(false);
    setSortBy("default");
  };

  const handleOpenDetail = (item: CatalogItem, colorVariantName?: string) => {
    setActiveDetailItem(item);
    setActiveColorVariant(colorVariantName);
  };

  const handleQuickWhatsApp = (item: CatalogItem, colorVariantName?: string) => {
    setCsModalItem({ item, colorVariant: colorVariantName });
    setCsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#22211E] pt-20 pb-24 selection:bg-[#1B4332] selection:text-white">
      {/* Top Banner / Breadcrumb & Category Bar */}
      <div className="border-b border-[#ECE7DC] bg-[#FAF8F3]/90 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <Link href="/" className="hover:text-[#1B4332] transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#0D2F1D]">Katalog Frame</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quiz"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline"
            >
              <span>Quiz Frame DNA</span>
              <span>→</span>
            </Link>
            <Link
              href="/softlens"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D5CFBF] bg-white px-3 py-1 text-xs font-semibold text-stone-700 hover:border-[#1B4332] hover:text-[#1B4332] transition-all shadow-2xs"
            >
              <span>Koleksi Softlens</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Short & Elegant Catalog Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0D2F1D]">
            Katalog Frame Kacamata
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
            Pilihan bingkai kacamata optik dan sunglasses original Optik I See You.
            Pilih model, cek spesifikasi presisi dalam milimeter, lalu hubungi cabang terdekat untuk ketersediaan stok &amp; periksa mata.
          </p>
        </header>

        {/* Search, Filter Bar & Quick Controls */}
        <div className="space-y-3.5 mb-6">
          {/* Main Search & Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama model, SKU (misal CK2127), bentuk frame, warna..."
                className="w-full rounded-xl border border-[#D8D2C4] bg-white pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#0D2F1D] placeholder:text-stone-400 focus:border-[#1B4332] focus:outline-none focus:ring-1 focus:ring-[#1B4332] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Hapus teks pencarian"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Desktop Filters Row */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Shape Dropdown */}
              <select
                value={selectedShape}
                aria-label="Filter bentuk frame"
                onChange={(e) => setSelectedShape(e.target.value)}
                className="rounded-xl border border-[#D8D2C4] bg-white px-3 py-2.5 text-xs font-medium text-stone-700 focus:border-[#1B4332] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
              >
                <option value="all">Semua Bentuk</option>
                {availableShapes.map((shape) => (
                  <option key={shape} value={shape}>
                    {shape}
                  </option>
                ))}
              </select>

              {/* Material Dropdown */}
              <select
                value={selectedMaterial}
                aria-label="Filter material frame"
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="rounded-xl border border-[#D8D2C4] bg-white px-3 py-2.5 text-xs font-medium text-stone-700 focus:border-[#1B4332] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
              >
                <option value="all">Semua Material</option>
                {availableMaterials.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
              </select>

              {/* Collection Dropdown */}
              <select
                value={selectedCollection}
                aria-label="Filter koleksi"
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="rounded-xl border border-[#D8D2C4] bg-white px-3 py-2.5 text-xs font-medium text-stone-700 focus:border-[#1B4332] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
              >
                <option value="all">Semua Koleksi</option>
                {initialCollections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>

              {/* Color Dropdown */}
              <select
                value={selectedColor}
                aria-label="Filter warna"
                onChange={(e) => setSelectedColor(e.target.value)}
                className="rounded-xl border border-[#D8D2C4] bg-white px-3 py-2.5 text-xs font-medium text-stone-700 focus:border-[#1B4332] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
              >
                <option value="all">Semua Warna</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort & Mobile Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                aria-label="Urutkan produk"
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-[#D8D2C4] bg-white px-3 py-2.5 text-xs font-medium text-stone-700 focus:border-[#1B4332] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
              >
                <option value="default">Urutan Standar</option>
                <option value="name-asc">Nama (A — Z)</option>
                <option value="name-desc">Nama (Z — A)</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-[#D8D2C4] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D2F1D] hover:border-[#1B4332] shadow-2xs"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1B4332] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Shape Chips & Quick Toggles */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedShape("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedShape === "all"
                    ? "bg-[#1B4332] text-white"
                    : "border border-[#D8D2C4] bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                Semua
              </button>
              {availableShapes.map((shape) => {
                const isActive = selectedShape === shape;
                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setSelectedShape(isActive ? "all" : shape)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#1B4332] text-white"
                        : "border border-[#D8D2C4] bg-white text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {shape}
                  </button>
                );
              })}
            </div>

            {/* Quick AR & Favorites Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOnlyWithAr((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  onlyWithAr
                    ? "bg-[#0D2F1D] text-emerald-200"
                    : "border border-[#D8D2C4] bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Hanya AR</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyFavorites((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  onlyFavorites
                    ? "bg-[#1B4332] text-white"
                    : "border border-[#D8D2C4] bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill={onlyFavorites ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span>Favorit ({favorites.length})</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips & Results Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ECE7DC] text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-700">
                {filteredItems.length} model frame ditemukan
              </span>

              {/* Active Filter Badges */}
              {selectedShape !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#D5CFBF] px-2 py-0.5 text-[11px] text-[#0D2F1D]">
                  Bentuk: {selectedShape}
                  <button
                    type="button"
                    onClick={() => setSelectedShape("all")}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedMaterial !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#D5CFBF] px-2 py-0.5 text-[11px] text-[#0D2F1D]">
                  Material: {selectedMaterial}
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial("all")}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedColor !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#D5CFBF] px-2 py-0.5 text-[11px] text-[#0D2F1D]">
                  Warna: {selectedColor}
                  <button
                    type="button"
                    onClick={() => setSelectedColor("all")}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedCollection !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#D5CFBF] px-2 py-0.5 text-[11px] text-[#0D2F1D]">
                  Koleksi:{" "}
                  {initialCollections.find((c) => c.id === selectedCollection)?.title}
                  <button
                    type="button"
                    onClick={() => setSelectedCollection("all")}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}

              {onlyWithAr && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] text-emerald-900">
                  Virtual Try-On AR
                  <button
                    type="button"
                    onClick={() => setOnlyWithAr(false)}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}

              {onlyFavorites && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#D5CFBF] px-2 py-0.5 text-[11px] text-[#0D2F1D]">
                  Favorit Tersimpan
                  <button
                    type="button"
                    onClick={() => setOnlyFavorites(false)}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#D5CFBF] px-2 py-0.5 text-[11px] text-[#0D2F1D]">
                  &quot;{searchQuery}&quot;
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="font-semibold text-[#1B4332] hover:underline"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* Product Grid: 4 cols wide desktop, 3 cols tablet, 2 cols mobile */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filteredItems.map((item) => (
              <CatalogItemCard
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
                onOpenDetail={handleOpenDetail}
                onQuickWhatsApp={handleQuickWhatsApp}
              />
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="rounded-2xl border border-[#E7E2D7] bg-white p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F0] text-[#1B4332]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#0D2F1D]">
              Tidak Ada Model Frame yang Sesuai
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Coba kurangi kombinasi filter atau hapus kata kunci pencarian untuk melihat semua koleksi frame.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="rounded-xl bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0D2F1D] transition-colors"
            >
              Tampilkan Semua Frame
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-xs h-full bg-white p-5 flex flex-col justify-between shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#EFEBE2] pb-3">
                <h3 className="font-sans text-base font-bold text-[#0D2F1D]">
                  Filter Katalog
                </h3>
                <button
                  type="button"
                  aria-label="Tutup panel filter"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800"
                >
                  ✕
                </button>
              </div>

              {/* Shape Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Bentuk Frame
                </label>
                <select
                  value={selectedShape}
                  onChange={(e) => setSelectedShape(e.target.value)}
                  className="w-full rounded-lg border border-[#D8D2C4] bg-[#FAF7F0] p-2 text-xs text-stone-700"
                >
                  <option value="all">Semua Bentuk</option>
                  {availableShapes.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Material Frame
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full rounded-lg border border-[#D8D2C4] bg-[#FAF7F0] p-2 text-xs text-stone-700"
                >
                  <option value="all">Semua Material</option>
                  {availableMaterials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Collection Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Koleksi
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full rounded-lg border border-[#D8D2C4] bg-[#FAF7F0] p-2 text-xs text-stone-700"
                >
                  <option value="all">Semua Koleksi</option>
                  {initialCollections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Varian Warna
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full rounded-lg border border-[#D8D2C4] bg-[#FAF7F0] p-2 text-xs text-stone-700"
                >
                  <option value="all">Semua Warna</option>
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* AR & Favorites Toggles */}
              <div className="space-y-2 border-t border-[#EFEBE2] pt-3">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyWithAr}
                    onChange={(e) => setOnlyWithAr(e.target.checked)}
                    className="rounded border-[#D8D2C4] text-[#1B4332] focus:ring-[#1B4332]"
                  />
                  <span>Hanya yang mendukung Virtual Try-On (AR)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyFavorites}
                    onChange={(e) => setOnlyFavorites(e.target.checked)}
                    className="rounded border-[#D8D2C4] text-[#1B4332] focus:ring-[#1B4332]"
                  />
                  <span>Hanya frame yang saya favoritkan ({favorites.length})</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#EFEBE2] space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full rounded-xl bg-[#1B4332] py-2.5 text-xs font-bold text-white text-center"
              >
                Terapkan Filter ({filteredItems.length} Produk)
              </button>
              <button
                type="button"
                onClick={resetAllFilters}
                className="w-full rounded-xl border border-[#D8D2C4] py-2 text-xs font-semibold text-stone-600 text-center"
              >
                Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <CatalogDetailModal
        item={activeDetailItem}
        selectedColorName={activeColorVariant}
        onClose={() => setActiveDetailItem(null)}
      />

      {/* Quick CS WhatsApp Modal */}
      {csModalItem && (
        <ContactCSModal
          isOpen={csModalOpen}
          onClose={() => {
            setCsModalOpen(false);
            setCsModalItem(null);
          }}
          productName={`${csModalItem.item.name}${
            csModalItem.item.sku ? ` (SKU: ${csModalItem.item.sku})` : ""
          }${
            csModalItem.colorVariant ? ` - Warna ${csModalItem.colorVariant}` : ""
          }`}
          customMessage={(branchName) =>
            `Halo Optik I See You ${branchName}! 👋\nSaya tertarik dengan frame *${csModalItem.item.name}*${
              csModalItem.item.sku ? ` (SKU: *${csModalItem.item.sku}*)` : ""
            }${
              csModalItem.colorVariant
                ? ` varian warna *${csModalItem.colorVariant}*`
                : ""
            }.\n\nApakah stok masih tersedia di Cabang ${branchName}? Boleh dibantu informasinya? Terima kasih! 🙏`
          }
        />
      )}
    </div>
  );
}
