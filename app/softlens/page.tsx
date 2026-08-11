"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import SoftlensCartDrawer from "@/components/katalog/SoftlensCartDrawer";
import CatalogConfetti from "@/components/katalog/CatalogConfetti";
import {
  SOFTLENS_PRODUCTS,
  SOFTLENS_FAQ,
  SOFTLENS_CATEGORIES,
  SOFTLENS_CS_WA_URL,
  type SoftlensProduct,
  type CartItem,
} from "@/lib/softlens";

// --- Color swatch gradient map ---
const COLOR_SWATCHES: Record<string, string> = {
  brown: "linear-gradient(135deg, #8B6350 0%, #C4956A 100%)",
  grey: "linear-gradient(135deg, #8C9EA8 0%, #C5CDD2 100%)",
  hazel: "linear-gradient(135deg, #7B6248 0%, #A8855E 100%)",
  natural: "linear-gradient(135deg, #3A3D40 0%, #70757A 100%)",
  colorful: "linear-gradient(135deg, #4A7C9B 0%, #9BC4E2 100%)",
  accessory: "linear-gradient(135deg, #116B3C 0%, #2FA84F 100%)",
};

// --- Ultra Minimalist & Elegant Product Card Component ---
function SoftlensCard({
  product,
  onAddToCart,
}: {
  product: SoftlensProduct;
  onAddToCart: (product: SoftlensProduct) => void;
}) {
  const swatchGradient = COLOR_SWATCHES[product.colorFamily] ?? COLOR_SWATCHES.brown;

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-isy-green-bright/40 hover:shadow-xl cursor-pointer"
    >
      <div>
        {/* Color Swatch Visual / Accessory Icon */}
        <div className="relative mb-5 flex items-center justify-center py-2">
          <div
            className="h-28 w-28 rounded-full shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 flex items-center justify-center relative overflow-hidden"
            style={{ background: swatchGradient }}
          >
            {/* Glossy highlight */}
            <div className="absolute inset-0 rounded-full bg-white/20 [mask-image:radial-gradient(ellipse_at_30%_30%,white_20%,transparent_70%)]" />
            <span className="text-white/90 text-3xl drop-shadow select-none">
              {product.isAccessory ? "💧" : "👁"}
            </span>
          </div>

          <span className="absolute top-0 right-0 rounded-full bg-isy-green-bright/10 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-isy-green-bright border border-isy-green-bright/20">
            {product.category}
          </span>
        </div>

        {/* Brand Name Only (Clean & Elegant) */}
        <div className="text-center space-y-1">
          <h3 className="font-serif text-xl font-black text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-serif text-lg font-black text-isy-green-bright">
              {product.priceFormatted}
            </span>
            <span className="text-[10px] font-semibold text-isy-ink/40">
              {product.isAccessory ? "/ pcs" : "/ pasang"}
            </span>
          </div>
        </div>
      </div>

      {/* Single Clean CTA Button */}
      <div className="mt-5 pt-4 border-t border-isy-line">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-isy-green-bright py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all hover:bg-isy-green-deep active:scale-95"
        >
          <span>+ Tambah ke Keranjang</span>
        </button>
      </div>
    </div>
  );
}

export default function SoftlensCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Cart State (Persisted in localStorage for convenience)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("isy_softlens_cart");
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      // Ignore localStorage errors
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
    showToast(`🛒 "${product.name}" ditambahkan ke keranjang!`);
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

  const totalCartItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return SOFTLENS_PRODUCTS;
    return SOFTLENS_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white via-isy-mist/30 to-white text-isy-ink relative overflow-hidden">
      {/* Dynamic Confetti Effect on load */}
      <CatalogConfetti />

      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pt-28 pb-24 space-y-16">
        {/* --- HERO SECTION --- */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/20 bg-isy-green-bright/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-isy-green-bright shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            I See You Soflens · @iseeyou.soflens
          </div>

          <h1 className="font-serif text-4xl font-black text-isy-green-deep sm:text-6xl leading-tight">
            Katalog Softlens <br />
            <span className="text-isy-green-bright">Cantik &amp; Nyaman Seharian</span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-isy-ink/65 leading-relaxed max-w-2xl mx-auto">
            15 varian warna natural &amp; K-Beauty premium, plus aksesoris cairan Oksi dan tetes mata pelembab. Pesan mudah via Keranjang &amp; WhatsApp CS Optik I See You.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/iseeyou.soflens/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-isy-line bg-white px-4 py-2 text-xs font-bold text-isy-green-deep shadow-sm hover:border-isy-green-bright transition-all"
            >
              <span>📷 Follow Instagram @iseeyou.soflens</span>
            </a>

            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-isy-green-bright px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-isy-green-deep transition-all"
            >
              <span>🛒 Keranjang ({totalCartItems})</span>
            </button>
          </div>
        </section>

        {/* --- CATEGORY FILTER PILLS --- */}
        <section className="flex flex-wrap items-center justify-center gap-2.5">
          {SOFTLENS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "bg-isy-green-deep text-white shadow-md scale-105"
                  : "bg-white text-isy-ink/75 border border-isy-line hover:border-isy-green-bright/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </section>

        {/* --- PRODUCTS GRID --- */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-black text-isy-green-deep">
              {selectedCategory === "all" ? "Semua Koleksi Softlens &amp; Aksesoris" : selectedCategory}
            </h2>
            <span className="text-xs font-bold text-isy-ink/50">
              {filteredProducts.length} Produk Tersedia
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <SoftlensCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* --- FAQ & EDUKASI SECTION --- */}
        <section className="rounded-3xl border border-isy-line bg-gradient-to-br from-isy-mist/40 via-white to-isy-mist/40 p-8 sm:p-12 space-y-8 shadow-sm">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-isy-green-bright">
              Edukasi &amp; Panduan Soflens
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
              Seputar Perawatan &amp; Resep Soflens
            </h2>
            <p className="text-xs text-isy-ink/65">
              Pertanyaan umum mengenai softlens minus tinggi, silinder, cara cuci, dan aksesoris cairan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTLENS_FAQ.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-isy-line/80 bg-white p-5 space-y-2 shadow-sm transition-all hover:border-isy-green-bright/40 hover:shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{faq.icon}</span>
                  <h3 className="font-serif text-sm font-black text-isy-green-deep">
                    {faq.title}
                  </h3>
                </div>
                <p className="text-xs text-isy-ink/65 leading-relaxed">{faq.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- BOTTOM CTA BANNER --- */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-isy-green-deep via-[#0d542e] to-isy-green-bright p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm border border-white/20">
              Konsultasi &amp; Order
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black">
              Butuh Ukuran Minus Khusus / Silinder?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Tim CS Optik I See You siap membantu memeriksa resep mata kamu dan merekomendasikan varian softlens terbaik.
            </p>
            <div className="pt-3">
              <a
                href={SOFTLENS_CS_WA_URL()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-isy-green-deep shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
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

      {/* --- FLOATING CART BUTTON (Fixed Bottom-Right) --- */}
      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-isy-green-deep px-5 py-3.5 text-white shadow-2xl shadow-isy-green-deep/50 border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Buka Keranjang Belanja Softlens"
      >
        <div className="relative">
          <span className="text-xl">🛒</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-isy-green-bright text-[10px] font-black text-white shadow-md animate-pulse">
              {totalCartItems}
            </span>
          )}
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline-block">
          Keranjang ({totalCartItems})
        </span>
      </button>

      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-full bg-isy-green-deep px-6 py-3 text-xs font-bold text-white shadow-2xl border border-isy-green-bright/30 backdrop-blur-md">
            {toastMessage}
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
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
