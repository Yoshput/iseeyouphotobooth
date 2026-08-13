"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import SoftlensCartDrawer from "@/components/katalog/SoftlensCartDrawer";
import ProductImageZoomModal from "@/components/katalog/ProductImageZoomModal";
import CatalogConfetti from "@/components/katalog/CatalogConfetti";
import { Eye, RefreshCw, Hand, FlaskConical, Droplet, Box, type LucideIcon } from "lucide-react";
import {
  SOFTLENS_PRODUCTS,
  SOFTLENS_FAQ,
  SOFTLENS_CATEGORIES,
  COLOR_FILTERS,
  SOFTLENS_CS_WA_URL,
  type SoftlensProduct,
  type CartItem,
} from "@/lib/softlens";

// Quick Preview Lightbox Modal
function SoftlensPreviewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenZoom,
}: {
  product: SoftlensProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: SoftlensProduct) => void;
  onOpenZoom: (product: SoftlensProduct, initialIdx?: number) => void;
}) {
  if (!isOpen || !product) return null;

  const displayImage = product.detailPoster || product.hoverImage || product.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#c9a869]/40 animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#FAF9F5] px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-[#1a3d2e] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {product.category}
            </span>
            {product.badgeText && (
              <span className="rounded-full bg-[#c9a869]/20 border border-[#c9a869]/40 px-3 py-1 text-[10px] font-extrabold uppercase text-[#8c6520]">
                {product.badgeText}
              </span>
            )}
            {product.discountPercentage && (
              <span className="rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-black uppercase text-white shadow-xs">
                PROMO SPECIAL
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          {/* Image Showcase with Click-to-Zoom */}
          <div className="space-y-2">
            <div
              onClick={() => onOpenZoom(product, 0)}
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#FBFBFA] to-[#F4F1EA] border border-slate-200 shadow-inner group flex items-center justify-center p-4 cursor-zoom-in"
              title="Klik untuk zoom layar penuh HD"
            >
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                <span className="rounded-full bg-white/95 px-3.5 py-2 text-xs font-black text-[#1a3d2e] shadow-xl flex items-center gap-1.5 border border-[#c9a869]/40">
                  <span>🔍 Klik Zoom Layar Penuh</span>
                </span>
              </div>
            </div>

            {/* Direct Zoom Button */}
            <button
              onClick={() => onOpenZoom(product, 0)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#c9a869]/60 bg-[#c9a869]/10 py-2.5 text-xs font-black text-[#8c6520] hover:bg-[#c9a869] hover:text-white transition-all shadow-xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Perbesar Poster Detail Specs HD</span>
            </button>
          </div>

          {/* Details & Specifications */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-black text-[#1a3d2e] leading-snug">
                {product.name}
              </h3>

              {/* Price Display */}
              <div className="mt-2 flex items-baseline gap-2 whitespace-nowrap">
                <span className="font-serif text-3xl font-black text-[#c9a869]">
                  {product.priceFormatted}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {product.isAccessory ? "/ pcs" : "/ pasang"}
                </span>
                {product.discountPercentage && (
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 ml-1">
                    PROMO SPECIAL
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>

              {/* Specs Table */}
              <div className="mt-4 space-y-2 rounded-2xl bg-[#FAF9F5] p-4 border border-slate-200/80 text-xs">
                {product.diameter && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="font-semibold text-slate-500">Diameter (DIA):</span>
                    <span className="font-bold text-[#1a3d2e]">{product.diameter}</span>
                  </div>
                )}
                {product.waterContent && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="font-semibold text-slate-500">Kadar Air (Water):</span>
                    <span className="font-bold text-[#1a3d2e]">{product.waterContent}</span>
                  </div>
                )}
                {product.usageDuration && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="font-semibold text-slate-500">Masa Pakai:</span>
                    <span className="font-bold text-[#1a3d2e]">{product.usageDuration}</span>
                  </div>
                )}
                {product.volume && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="font-semibold text-slate-500">Volume Kemasan:</span>
                    <span className="font-bold text-[#1a3d2e]">{product.volume}</span>
                  </div>
                )}
                <div className="flex justify-between pt-0.5">
                  <span className="font-semibold text-slate-500">Ketersediaan Ukuran:</span>
                  <span className="font-bold text-[#1a3d2e]">Plano (Normal) s/d -10.00</span>
                </div>
              </div>

              {/* Feature Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-[#1a3d2e]/5 px-2.5 py-1 text-[10px] font-extrabold text-[#1a3d2e] border border-[#1a3d2e]/15"
                  >
                    ✓ {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-isy-green-deep active:scale-95"
              >
                <span>🛒 Tambah Keranjang</span>
              </button>

              <a
                href={SOFTLENS_CS_WA_URL(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-600 bg-emerald-50 px-4 py-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Tanya CS via WA"
              >
                <span>💬 Chat WA</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ultra Clean & Elegant Luxury Product Card
function LuxurySoftlensCard({
  product,
  onAddToCart,
  onQuickPreview,
  onOpenZoom,
}: {
  product: SoftlensProduct;
  onAddToCart: (product: SoftlensProduct) => void;
  onQuickPreview: (product: SoftlensProduct) => void;
  onOpenZoom: (product: SoftlensProduct) => void;
}) {
  return (
    <div
      onClick={() => onQuickPreview(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-[#c9a869]/70 hover:shadow-lg cursor-pointer transform-gpu"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FDFDFD] via-[#FAF9F6] to-[#F4F1EA] border border-slate-100/80 p-3 mb-3 flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />

          {/* Top-Left Floating Badge (Diskon / Promo) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
            {product.discountPercentage ? (
              <span className="rounded-full bg-[#1a3d2e]/90 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-md border border-white/20">
                ✨ PROMO SPECIAL
              </span>
            ) : product.badgeText ? (
              <span className="rounded-full bg-[#1a3d2e]/90 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md border border-white/20">
                {product.badgeText}
              </span>
            ) : null}
          </div>

          {/* Top-Right Spec Badge */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            {product.volume ? (
              <span className="rounded-full bg-[#c9a869] px-2.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                {product.volume}
              </span>
            ) : product.diameter ? (
              <span className="rounded-full bg-[#1a3d2e]/80 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                {product.diameter}
              </span>
            ) : null}
          </div>

          {/* Quick Actions Hover Overlay */}
          <div className="absolute inset-0 bg-[#1a3d2e]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenZoom(product);
              }}
              className="w-full max-w-[170px] rounded-full bg-[#c9a869] px-4 py-2 text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 transition-transform duration-200 hover:scale-105 border border-white/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Zoom Poster HD</span>
            </button>

            <span className="rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold text-[#1a3d2e] shadow-md flex items-center gap-1 transition-transform duration-200 hover:scale-105">
              <span>Detail &amp; Spesifikasi</span>
            </span>
          </div>
        </div>

        {/* Title ONLY */}
        <div className="px-1 pt-0.5">
          <h3
            title={product.name}
            className="font-serif text-base sm:text-lg font-black text-[#1a3d2e] leading-snug group-hover:text-[#c9a869] transition-colors duration-200 line-clamp-1"
          >
            {product.name}
          </h3>
        </div>
      </div>

      {/* Price & Cart CTA Button */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Neat Horizontal Price without Line-Break */}
        <div className="flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
          <span className="font-serif text-lg sm:text-xl font-black text-[#1a3d2e] whitespace-nowrap">
            {product.priceFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
            {product.isAccessory ? "/ pcs" : "/ pasang"}
          </span>
        </div>

        {/* Pure Icon-Only Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-isy-green-bright text-white shadow-md transition-all duration-200 hover:bg-isy-green-deep hover:scale-105 active:scale-95"
          title="Tambah ke Keranjang"
          aria-label="Tambah ke Keranjang"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Elegant Guide Card Component with Gold Circle Icon
function GuideCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#1a3d2e]/10 bg-white p-6 shadow-xs hover:shadow-md hover:border-[#c9a869]/50 transition-all duration-300">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a869]">
        <Icon size={18} strokeWidth={1.5} className="text-[#c9a869]" aria-hidden="true" />
      </div>
      <h3 className="mb-2 font-serif text-base sm:text-lg font-black text-[#1a3d2e]">{title}</h3>
      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">{desc}</p>
    </div>
  );
}

// Main Softlens Catalog Page
export default function SoftlensCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<SoftlensProduct | null>(null);

  // Zoom Lightbox State
  const [zoomProduct, setZoomProduct] = useState<SoftlensProduct | null>(null);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("isy_softlens_cart");
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("isy_softlens_cart", JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: SoftlensProduct) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`✨ "${product.name}" ditambahkan ke keranjang!`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOpenZoom = (product: SoftlensProduct, initialIdx = 0) => {
    setZoomProduct(product);
    setZoomInitialIndex(initialIdx);
  };

  const totalCartItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    return SOFTLENS_PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesColor = selectedColor === "all" || p.colorFamily === selectedColor;
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesColor && matchesSearch;
    });
  }, [selectedCategory, selectedColor, searchQuery]);

  // Build Image List for Zoom Modal (Poster Detail + Product Photo)
  const zoomImageList = useMemo(() => {
    if (!zoomProduct) return [];
    const list = [];
    if (zoomProduct.detailPoster) {
      list.push({
        label: "Poster Detail Specs HD",
        src: zoomProduct.detailPoster,
      });
    } else if (zoomProduct.hoverImage) {
      list.push({
        label: "Poster Detail Specs HD",
        src: zoomProduct.hoverImage,
      });
    }
    list.push({
      label: "Foto Produk (PNG)",
      src: zoomProduct.image,
    });
    return list;
  }, [zoomProduct]);

  return (
    <div className="min-h-dvh bg-[#FAF9F6] text-isy-ink relative overflow-hidden">
      {/* Confetti Animation */}
      <CatalogConfetti />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-24 space-y-12">
        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a869]/40 bg-[#c9a869]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#8c6520] shadow-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#c9a869]" />
            Optik I See You Soflens · Official Collection
          </div>

          <h1 className="font-serif text-4xl font-black text-[#1a3d2e] sm:text-6xl leading-tight">
            Katalog Softlens <br />
            <span className="text-[#c9a869] italic">Mewah, Elegan &amp; Nyaman</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Koleksi Softlens Exoticon, Miss ICE, Golden Eye Prestige, Russian Velvet &amp; Cairan Perawatan Steril. Klik produk untuk zoom poster detail HD &amp; pesan mudah via WhatsApp CS.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/iseeyou.soflens/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-[#1a3d2e] shadow-xs hover:border-[#c9a869] hover:shadow-md transition-all"
            >
              <span>📷 Instagram @iseeyou.soflens</span>
            </a>

            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1a3d2e] px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-isy-green-bright transition-all active:scale-95"
            >
              <span>🛒 Lihat Keranjang ({totalCartItems})</span>
            </button>
          </div>
        </section>

        {/* FILTER & SEARCH CONTROLS */}
        <section className="space-y-4 max-w-4xl mx-auto">
          {/* Search Input Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari softlens (contoh: ICE N°5, Dubai, Russian Velvet, X2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-white px-6 py-3.5 pl-12 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#c9a869] focus:outline-none focus:ring-2 focus:ring-[#c9a869]/20 transition-all"
            />
            <svg
              className="absolute left-4 top-4 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {SOFTLENS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "bg-[#1a3d2e] text-white shadow-md scale-105 border border-[#c9a869]/40"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-[#c9a869]/50 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Color Sub-Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Varian Warna:</span>
            {COLOR_FILTERS.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedColor(col.id)}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                  selectedColor === col.id
                    ? "bg-[#c9a869] text-white shadow-xs"
                    : "bg-[#FAF9F5] text-slate-600 border border-slate-200 hover:bg-white"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="font-serif text-xl sm:text-2xl font-black text-[#1a3d2e]">
              {selectedCategory === "all" ? "Koleksi Lengkap Softlens & Aksesoris" : selectedCategory}
            </h2>
            <span className="rounded-full bg-[#c9a869]/15 border border-[#c9a869]/30 px-3.5 py-1 text-xs font-black text-[#8c6520]">
              {filteredProducts.length} Produk
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-200 max-w-md mx-auto">
              <span className="text-4xl">🔍</span>
              <h3 className="font-serif text-lg font-bold text-[#1a3d2e]">Tidak Ada Produk Ditemukan</h3>
              <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter warna/kategori.</p>
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedColor("all"); setSearchQuery(""); }}
                className="mt-2 rounded-full bg-[#1a3d2e] px-5 py-2 text-xs font-bold text-white shadow-xs"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <LuxurySoftlensCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickPreview={(p) => setPreviewProduct(p)}
                  onOpenZoom={handleOpenZoom}
                />
              ))}
            </div>
          )}
        </section>

        {/* FAQ & EDUKASI SECTION */}
        <section className="rounded-3xl border border-[#c9a869]/30 bg-gradient-to-br from-white via-[#FAF9F5] to-white p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c9a869]">
              Edukasi &amp; Panduan Softlens
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1a3d2e]">
              Seputar Perawatan &amp; Resep Softlens
            </h2>
            <p className="text-xs text-slate-600">
              Panduan lengkap softlens minus tinggi, silinder, cara pembersihan, dan pilihan cairan higienis.
            </p>
          </div>

          <div className="space-y-8">
            {/* Group 1: Resep & Ukuran */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#c9a869] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a869]" />
                Resep &amp; Ukuran
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <GuideCard
                  icon={Eye}
                  title="Minus Tinggi &amp; Resep Presisi"
                  desc="Ready stok hingga -10.00, tim CS bantu cocokkan resep."
                />
                <GuideCard
                  icon={RefreshCw}
                  title="Silinder (Astigmatism)"
                  desc="Axis presisi, fokus tetap nyaman buat mata silinder."
                />
              </div>
            </div>

            {/* Group 2: Perawatan Harian */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#c9a869] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a869]" />
                Perawatan Harian
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <GuideCard
                  icon={Hand}
                  title="Cara Pakai &amp; Higienitas"
                  desc="Cuci tangan, rendam minimal 4 jam sebelum pemakaian awal."
                />
                <GuideCard
                  icon={FlaskConical}
                  title="Cairan Pembersih Steril"
                  desc="ICE / X2 / Pure N'Soft buat lepas endapan protein."
                />
                <GuideCard
                  icon={Droplet}
                  title="Tetes Mata Pelembab"
                  desc="Pakai saat mata kering di ruangan ber-AC."
                />
                <GuideCard
                  icon={Box}
                  title="Perawatan Lens Case"
                  desc="Ganti wadah perendam tiap 1-2 bulan sekali."
                />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a3d2e] via-[#0d542e] to-[#2FA84F] p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#f3e3ba] backdrop-blur-sm border border-[#c9a869]/40">
              Konsultasi Resep &amp; Order
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black">
              Butuh Ukuran Minus Khusus / Silinder?
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
              Tim CS Optik I See You siap membantu mengecek resep mata kamu dan merekomendasikan varian softlens paling nyaman.
            </p>
            <div className="pt-3">
              <a
                href={SOFTLENS_CS_WA_URL()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#c9a869] hover:bg-[#b89555] px-8 py-4 text-xs font-black uppercase tracking-widest text-[#1a3d2e] shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Chat CS WhatsApp Softlens</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING CART BUTTON */}
      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[#1a3d2e] px-5 py-3.5 text-white shadow-2xl shadow-[#1a3d2e]/50 border border-[#c9a869]/40 transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Buka Keranjang Belanja Softlens"
      >
        <div className="relative">
          <span className="text-xl">🛒</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a869] text-[10px] font-black text-[#1a3d2e] shadow-md animate-pulse">
              {totalCartItems}
            </span>
          )}
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline-block">
          Keranjang ({totalCartItems})
        </span>
      </button>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-full bg-[#1a3d2e] px-6 py-3 text-xs font-bold text-white shadow-2xl border border-[#c9a869]/40 backdrop-blur-md">
            {toastMessage}
          </div>
        </div>
      )}

      {/* QUICK PREVIEW LIGHTBOX MODAL */}
      <SoftlensPreviewModal
        product={previewProduct}
        isOpen={Boolean(previewProduct)}
        onClose={() => setPreviewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenZoom={handleOpenZoom}
      />

      {/* INTERACTIVE FULL-SCREEN IMAGE ZOOM LIGHTBOX */}
      <ProductImageZoomModal
        isOpen={Boolean(zoomProduct)}
        onClose={() => setZoomProduct(null)}
        title={zoomProduct?.name || "Detail Softlens"}
        images={zoomImageList}
        initialIndex={zoomInitialIndex}
      />

      {/* CART DRAWER */}
      <SoftlensCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
