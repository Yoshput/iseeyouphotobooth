"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import SoftlensCartDrawer from "@/components/katalog/SoftlensCartDrawer";
import ProductImageZoomModal from "@/components/katalog/ProductImageZoomModal";
import CatalogConfetti from "@/components/katalog/CatalogConfetti";

import { Eye, RefreshCw, Hand, FlaskConical, Droplet, Box, ShoppingBag, type LucideIcon } from "lucide-react";
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

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-isy-line animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-isy-line bg-white px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-isy-green-deep px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {product.category}
            </span>
            {product.badgeText && (
              <span className="rounded-full bg-isy-mist border border-isy-line px-3 py-1 text-[10px] font-extrabold uppercase text-isy-green-deep">
                {product.badgeText}
              </span>
            )}
            {product.discountPercentage && (
              <span className="rounded-full bg-isy-green-bright px-3 py-1 text-[10px] font-black uppercase text-white shadow-xs">
                PROMO SPECIAL
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line hover:text-isy-ink transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          {/* Image Showcase with Click-to-Zoom */}
          <div className="space-y-2">
            <div
              onClick={() => onOpenZoom(product, 0)}
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-isy-mist border border-isy-line shadow-inner group flex items-center justify-center p-4 cursor-zoom-in"
              title="Klik untuk zoom layar penuh HD"
            >
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-isy-green-deep/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                <span className="rounded-full bg-white/95 px-3.5 py-2 text-xs font-black text-isy-green-deep shadow-xl flex items-center gap-1.5 border border-isy-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  Klik Zoom Layar Penuh
                </span>
              </div>
            </div>

            {/* Direct Zoom Button */}
            <button
              onClick={() => onOpenZoom(product, 0)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-black text-isy-green-deep hover:border-isy-green-bright hover:bg-white transition-all shadow-xs"
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
              <h3 className="font-serif text-2xl font-black text-isy-green-deep leading-snug">
                {product.name}
              </h3>

              {/* Price Display */}
              <div className="mt-2 flex items-baseline gap-2 whitespace-nowrap">
                <span className="font-serif text-3xl font-black text-isy-green-deep">
                  {product.priceFormatted}
                </span>
                <span className="text-xs font-semibold text-isy-ink/40">
                  {product.isAccessory ? "/ pcs" : "/ pasang"}
                </span>
                {product.discountPercentage && (
                  <span className="rounded-full bg-isy-green-bright/15 border border-isy-green-bright/30 px-2.5 py-0.5 text-[10px] font-extrabold text-isy-green-deep ml-1">
                    PROMO SPECIAL
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-isy-ink/60 leading-relaxed font-medium">
                {product.description}
              </p>

              {/* Specs Table */}
              <div className="mt-4 space-y-2 rounded-2xl bg-isy-mist p-4 border border-isy-line text-xs">
                {product.diameter && (
                  <div className="flex justify-between border-b border-isy-line pb-1.5">
                    <span className="font-semibold text-isy-ink/50">Diameter (DIA):</span>
                    <span className="font-bold text-isy-green-deep">{product.diameter}</span>
                  </div>
                )}
                {product.waterContent && (
                  <div className="flex justify-between border-b border-isy-line pb-1.5">
                    <span className="font-semibold text-isy-ink/50">Kadar Air (Water):</span>
                    <span className="font-bold text-isy-green-deep">{product.waterContent}</span>
                  </div>
                )}
                {product.usageDuration && (
                  <div className="flex justify-between border-b border-isy-line pb-1.5">
                    <span className="font-semibold text-isy-ink/50">Masa Pakai:</span>
                    <span className="font-bold text-isy-green-deep">{product.usageDuration}</span>
                  </div>
                )}
                {product.volume && (
                  <div className="flex justify-between border-b border-isy-line pb-1.5">
                    <span className="font-semibold text-isy-ink/50">Volume Kemasan:</span>
                    <span className="font-bold text-isy-green-deep">{product.volume}</span>
                  </div>
                )}
                <div className="flex justify-between pt-0.5">
                  <span className="font-semibold text-isy-ink/50">Ketersediaan Ukuran:</span>
                  <span className="font-bold text-isy-green-deep">Plano (Normal) s/d -10.00</span>
                </div>
              </div>

              {/* Feature Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-isy-mist px-2.5 py-1 text-[10px] font-extrabold text-isy-green-deep border border-isy-line"
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
                <ShoppingBag size={14} />
                Tambah Keranjang
              </button>

              <a
                href={SOFTLENS_CS_WA_URL(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-isy-line bg-isy-mist px-4 py-3.5 text-xs font-bold text-isy-green-deep hover:border-isy-green-bright hover:bg-white transition-colors"
                title="Tanya CS via WA"
              >
                <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={16} height={16} className="object-contain" />
                Chat WA
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-4 shadow-xs transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-isy-green-bright/50 hover:shadow-xl cursor-pointer transform-gpu"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-isy-mist border border-isy-line/60 p-3 mb-3 flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 280px"
            loading="lazy"
          />

          {/* Top-Left Badge */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
            {product.discountPercentage ? (
              <span className="rounded-full bg-isy-green-bright backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-md">
                PROMO SPECIAL
              </span>
            ) : product.badgeText ? (
              <span className="rounded-full bg-isy-green-deep backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                {product.badgeText}
              </span>
            ) : null}
          </div>

          {/* Top-Right Spec Badge */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            {product.volume ? (
              <span className="rounded-full bg-isy-green-deep/80 px-2.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                {product.volume}
              </span>
            ) : product.diameter ? (
              <span className="rounded-full bg-isy-green-deep/80 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                {product.diameter}
              </span>
            ) : null}
          </div>

          {/* Quick Actions Hover Overlay */}
          <div className="absolute inset-0 bg-isy-green-deep/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenZoom(product);
              }}
              className="w-full max-w-[170px] rounded-full bg-white px-4 py-2 text-xs font-black text-isy-green-deep shadow-md flex items-center justify-center gap-1.5 transition-transform duration-200 hover:scale-105 border border-isy-line"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Zoom Poster HD</span>
            </button>

            <span className="rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-extrabold text-isy-green-deep shadow-md flex items-center gap-1">
              <span>Detail &amp; Spesifikasi</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="px-1 pt-0.5">
          <h3
            title={product.name}
            className="font-serif text-base sm:text-lg font-black text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors duration-200 line-clamp-1"
          >
            {product.name}
          </h3>
        </div>
      </div>

      {/* Price & Cart CTA Button */}
      <div className="mt-3 pt-3 border-t border-isy-line flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
          <span className="font-serif text-lg sm:text-xl font-black text-isy-green-deep whitespace-nowrap">
            {product.priceFormatted}
          </span>
          <span className="text-[10px] text-isy-ink/40 font-bold whitespace-nowrap">
            {product.isAccessory ? "/ pcs" : "/ pasang"}
          </span>
        </div>

        {/* Icon-Only Cart Button */}
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

// Elegant Guide Card Component
function GuideCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-isy-line bg-white p-6 shadow-xs hover:shadow-md hover:border-isy-green-bright/40 transition-all duration-300">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-isy-green-bright/30 bg-isy-mist">
        <Icon size={18} strokeWidth={1.5} className="text-isy-green-deep" aria-hidden="true" />
      </div>
      <h3 className="mb-2 font-serif text-base sm:text-lg font-black text-isy-green-deep">{title}</h3>
      <p className="text-xs sm:text-sm leading-relaxed text-isy-ink/60 font-medium">{desc}</p>
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

  // Cart State — lazy initializer reads localStorage once on mount (no race condition)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("isy_softlens_cart");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isMounted = useRef(false);

  // Persist cart — only after first mount (skip initial render write)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    try {
      localStorage.setItem("isy_softlens_cart", JSON.stringify(cartItems));
    } catch {
      // Private browsing / storage full — ignore
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
    showToast(`"${product.name}" ditambahkan ke keranjang!`);
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
    <div className="min-h-screen min-h-dvh bg-isy-gradient text-isy-ink relative overflow-hidden [-webkit-tap-highlight-color:transparent]">
      {/* Confetti Animation */}
      <CatalogConfetti />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-24 space-y-12">
        {/* HERO SECTION — badge + judul + deskripsi + search, filter pindah ke bawah */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-4">
          {/* Badge brand */}
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-isy-green-bright/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-isy-green-deep shadow-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            Optik I See You Softlens · Official Collection
          </div>

          <h1 className="font-serif text-4xl font-black text-isy-green-deep sm:text-6xl leading-tight">
            Katalog Softlens<br />
            <span className="text-isy-green-bright italic">Mewah, Elegan &amp; Nyaman</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-isy-ink/60 leading-relaxed max-w-2xl mx-auto">
            Koleksi Softlens Exoticon, Miss ICE, Golden Eye Prestige, Russian Velvet &amp; Cairan Perawatan Steril.
            Klik produk untuk zoom poster detail HD &amp; pesan mudah via WhatsApp CS.
          </p>

          {/* Search bar inline di hero */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Cari softlens (contoh: ICE N°5, Dubai, Russian Velvet, X2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-isy-line bg-white px-6 py-3.5 pl-12 text-xs font-semibold text-isy-ink placeholder:text-isy-ink/40 shadow-sm focus:border-isy-green-bright focus:outline-none focus:ring-2 focus:ring-isy-green-bright/20 transition-all"
            />
            <svg
              className="absolute left-4 top-4 h-4 w-4 text-isy-ink/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-isy-ink/15 text-isy-ink/60 hover:bg-isy-line transition-colors"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </section>

        {/* FILTER & SEARCH CONTROLS — section terpisah dari hero */}
        <section className="space-y-3 max-w-4xl mx-auto">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SOFTLENS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "bg-isy-green-deep text-white shadow-md scale-105"
                    : "bg-white text-isy-ink/70 border border-isy-line hover:border-isy-green-bright/50 hover:text-isy-green-deep"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Color Sub-Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-isy-ink/40 uppercase tracking-wider mr-1 hidden sm:inline">Varian Warna:</span>
            {COLOR_FILTERS.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedColor(col.id)}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                  selectedColor === col.id
                    ? "bg-isy-green-bright text-white shadow-xs"
                    : "bg-white text-isy-ink/60 border border-isy-line hover:border-isy-green-bright/40 hover:text-isy-green-deep"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-isy-line pb-3">
            <h2 className="font-serif text-xl sm:text-2xl font-black text-isy-green-deep">
              {selectedCategory === "all" ? "Koleksi Lengkap Softlens & Aksesoris" : selectedCategory}
            </h2>
            <span className="rounded-full bg-isy-mist border border-isy-line px-3.5 py-1 text-xs font-black text-isy-green-deep">
              {filteredProducts.length} Produk
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-isy-line max-w-md mx-auto">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto text-isy-ink/25"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <h3 className="font-serif text-lg font-bold text-isy-green-deep">Tidak Ada Produk Ditemukan</h3>
              <p className="text-xs text-isy-ink/50">Coba ubah kata kunci pencarian atau reset filter warna/kategori.</p>
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedColor("all"); setSearchQuery(""); }}
                className="mt-2 rounded-full bg-isy-green-deep px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-isy-green-bright transition-all"
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
        <section className="rounded-3xl border border-isy-line bg-white p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-isy-green-bright">
              Edukasi &amp; Panduan Softlens
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
              Seputar Perawatan &amp; Resep Softlens
            </h2>
            <p className="text-xs text-isy-ink/60">
              Panduan lengkap softlens minus tinggi, silinder, cara pembersihan, dan pilihan cairan higienis.
            </p>
          </div>

          <div className="space-y-8">
            {/* Group 1: Resep & Ukuran */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-isy-green-deep flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
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
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-isy-green-deep flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
                Perawatan Harian
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <GuideCard icon={Hand} title="Cara Pakai &amp; Higienitas" desc="Cuci tangan, rendam minimal 4 jam sebelum pemakaian awal." />
                <GuideCard icon={FlaskConical} title="Cairan Pembersih Steril" desc="ICE / X2 / Pure N'Soft buat lepas endapan protein." />
                <GuideCard icon={Droplet} title="Tetes Mata Pelembab" desc="Pakai saat mata kering di ruangan ber-AC." />
                <GuideCard icon={Box} title="Perawatan Lens Case" desc="Ganti wadah perendam tiap 1-2 bulan sekali." />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-isy-green-deep via-[#0d542e] to-isy-green-bright p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm border border-white/20">
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
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white hover:bg-isy-mist px-8 py-4 text-xs font-black uppercase tracking-widest text-isy-green-deep shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={20} height={20} className="object-contain" />
                <span>Chat CS WhatsApp Softlens</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING CART BUTTON — safe-area-inset-bottom for iPhone notch */}
      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="fixed right-6 z-40 flex items-center gap-3 rounded-full bg-isy-green-deep px-5 py-3.5 text-white shadow-2xl shadow-isy-green-deep/40 border border-white/10 transition-all duration-300 hover:scale-110 hover:bg-isy-green-bright active:scale-95 group"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label="Buka Keranjang Belanja Softlens"
      >
        <div className="relative">
          <ShoppingBag size={20} />
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-isy-green-deep shadow-md animate-pulse">
              {totalCartItems}
            </span>
          )}
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline-block">
          Keranjang ({totalCartItems})
        </span>
      </button>

      {/* TOAST NOTIFICATION — above floating button + safe area */}
      {toastMessage && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="rounded-full bg-isy-green-deep px-6 py-3 text-xs font-bold text-white shadow-2xl border border-white/10 backdrop-blur-md">
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
