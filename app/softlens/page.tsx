"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import ContactCSModal from "@/components/ui/ContactCSModal";
import SoftlensDetailModal from "@/components/katalog/SoftlensDetailModal";
import CatalogConfetti from "@/components/katalog/CatalogConfetti";
import {
  SOFTLENS_PRODUCTS,
  SOFTLENS_FAQ,
  SOFTLENS_CATEGORIES,
  SOFTLENS_CS_WA_URL,
  SOFTLENS_CS_NUMBER,
  type SoftlensProduct,
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

// --- Product Card ---
function SoftlensCard({
  product,
  onOpenDetail,
  onTanyaStok,
}: {
  product: SoftlensProduct;
  onOpenDetail: (product: SoftlensProduct) => void;
  onTanyaStok: (product: SoftlensProduct) => void;
}) {
  const swatchGradient = COLOR_SWATCHES[product.colorFamily] ?? COLOR_SWATCHES.brown;
  const displaySpecs = product.specs.slice(0, 3);

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-isy-green-bright/40 hover:shadow-xl cursor-pointer"
    >
      <div>
        {/* Color Swatch Visual / Accessory Icon */}
        <div className="relative mb-4 flex items-center justify-center py-2">
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

        {/* Name & Category */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg font-black text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-isy-ink/60 leading-relaxed line-clamp-2">{product.description}</p>
        </div>

        {/* Spec Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {displaySpecs.map((spec) => (
            <span
              key={spec}
              className="rounded-md bg-isy-mist px-2 py-0.5 text-[9.5px] font-extrabold text-isy-green-deep border border-isy-line"
            >
              ✦ {spec}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-isy-line">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(product);
          }}
          className="flex items-center justify-center gap-1 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep transition-all hover:bg-isy-line active:scale-95"
        >
          Specs &amp; Detail
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTanyaStok(product);
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-deep py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-isy-green-bright active:scale-95"
        >
          <Image
            src="/logo/Logo-Whatsapp.png"
            alt="WhatsApp"
            width={15}
            height={15}
            className="h-3.5 w-3.5 object-contain"
          />
          Tanya WA
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function SoftlensPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDetailProduct, setActiveDetailProduct] = useState<SoftlensProduct | null>(null);

  // Contact CS Modal state
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [csModalProduct, setCsModalProduct] = useState<SoftlensProduct | null>(null);

  const handleTanyaStok = (product: SoftlensProduct) => {
    setCsModalProduct(product);
    setCsModalOpen(true);
  };

  const quickSearchTags = [
    "Minus Tinggi",
    "Silinder",
    "Aksoris",
    "Oksi",
    "Tetes Mata",
    "Natural",
    "Premium",
  ];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SOFTLENS_PRODUCTS.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.specs.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden" style={{ background: "linear-gradient(160deg, #fff9f7 0%, #fdf4f0 40%, #f8f4ff 100%)" }}>
      <Navbar />
      <CatalogConfetti />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b border-isy-line/60 bg-white/80 px-6 py-12 text-center backdrop-blur-sm">
        {/* Soft decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-rose-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl space-y-4">
          {/* IG Badge */}
          <a
            href="https://www.instagram.com/iseeyou.soflens/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-rose-500 transition-all hover:bg-rose-100 active:scale-95 shadow-sm"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @iseeyou.soflens
          </a>

          <h1 className="font-serif text-3xl font-black text-isy-green-deep sm:text-5xl">
            Katalog Softlens &amp; Aksesoris
          </h1>

          <p className="mx-auto max-w-md text-xs font-medium text-isy-ink/60 sm:text-sm leading-relaxed">
            15 Varian Softlens Warna Premium + Cairan Oksi &amp; Tetes Mata. Tersedia ukuran minus tinggi &amp; silinder.
          </p>

          {/* Quick info pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {["Minus Tinggi ✓", "Silinder ✓", "Cairan Oksi ✓", "Tetes Mata ✓", "Ready Stok"].map((info) => (
              <span
                key={info}
                className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-[10px] font-bold text-isy-green-deep border border-isy-green-bright/20"
              >
                {info}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search & Sticky Filter Navigation ── */}
      <section className="sticky top-[64px] z-30 w-full border-b border-isy-line bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari softlens, oksi, tetes..."
                className="w-full rounded-2xl border border-isy-line bg-isy-mist/60 px-4 py-2.5 pl-10 text-xs font-medium text-isy-green-deep placeholder:text-isy-ink/40 outline-none transition-all focus:border-isy-green-bright focus:bg-white focus:ring-2 focus:ring-isy-green-bright/20"
              />
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-isy-ink/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-isy-ink/40 hover:text-isy-ink"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {SOFTLENS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-isy-green-deep text-white shadow-md"
                      : "bg-isy-mist/70 text-isy-ink/65 hover:bg-isy-line hover:text-isy-green-deep"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Quick Filter:</span>
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setSelectedCategory("all");
                }}
                className="rounded-full border border-isy-line bg-white px-2.5 py-0.5 text-[10px] font-bold text-isy-green-deep transition-all hover:border-isy-green-bright hover:bg-isy-green-bright/10 active:scale-95"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Product Grid Section ── */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <SoftlensCard
                key={product.id}
                product={product}
                onOpenDetail={(p) => setActiveDetailProduct(p)}
                onTanyaStok={handleTanyaStok}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-isy-line bg-white p-12 text-center shadow-sm space-y-3">
            <p className="text-3xl">🔍</p>
            <h3 className="font-serif text-lg font-black text-isy-green-deep">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-isy-ink/60">Coba kata kunci lain atau pilih kategori Semua Produk.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="rounded-xl bg-isy-green-deep px-5 py-2 text-xs font-bold text-white hover:bg-isy-green-bright transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* ── FAQ & Edukasi Section ── */}
      <section className="border-t border-isy-line bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center space-y-2">
            <span className="inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-isy-green-bright border border-isy-green-bright/20">
              Panduan &amp; Edukasi
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">
              Tips Penggunaan &amp; Perawatan Softlens
            </h2>
            <p className="text-xs text-isy-ink/60 max-w-md mx-auto">
              Perhatikan cara pakai, sterilisasi dengan Cairan Oksi, dan tetes mata agar mata tetap sehat dan nyaman.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTLENS_FAQ.map((faq) => (
              <div
                key={faq.id}
                className="flex flex-col justify-between rounded-2xl border border-isy-line bg-isy-mist/50 p-5 transition-all hover:border-isy-green-bright/40 hover:bg-white hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm border border-isy-line">
                    {faq.icon}
                  </div>
                  <h3 className="font-serif text-base font-black text-isy-green-deep">{faq.title}</h3>
                  <p className="text-xs text-isy-ink/60 leading-relaxed">{faq.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-isy-green-deep text-white px-6 py-14 text-center relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-xl space-y-4">
          <h2 className="font-serif text-2xl font-black sm:text-4xl">
            Butuh Konsultasi Ukuran &amp; Pemesanan?
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Tim CS Optik I See You siap membantu rekomendasi warna, ukuran minus/silinder, dan pengiriman paket softlens aman ke lokasi kamu.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                setCsModalProduct(null);
                setCsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-isy-green-bright px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-isy-green-bright/30 transition-all hover:scale-105 active:scale-95"
            >
              <Image
                src="/logo/Logo-Whatsapp.png"
                alt="WA"
                width={18}
                height={18}
                className="h-4.5 w-4.5 object-contain"
              />
              <span>Chat CS Softlens via WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* Detail & Specs Modal */}
      <SoftlensDetailModal
        product={activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        onTanyaStok={handleTanyaStok}
      />

      {/* Contact CS Modal */}
      <ContactCSModal
        isOpen={csModalOpen}
        onClose={() => setCsModalOpen(false)}
        waUrl={SOFTLENS_CS_WA_URL(csModalProduct?.name)}
        productName={csModalProduct?.name}
        csName="CS Softlens I See You"
      />
    </main>
  );
}
