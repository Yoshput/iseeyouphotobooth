"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, RefreshCw, Hand, FlaskConical, Droplet, Box, ShoppingBag, Search, X, RotateCcw } from "lucide-react";
import {
  SOFTLENS_SERIES_LIST,
  COLOR_FILTERS,
  SOFTLENS_CS_WA_URL,
  type SoftlensSeries,
  type SoftlensVariant,
  type SoftlensProduct,
  type CartItem,
} from "@/lib/softlens";
import SoftlensSeriesCard from "@/components/katalog/SoftlensSeriesCard";
import SoftlensDetailModal from "@/components/katalog/SoftlensDetailModal";
import SoftlensCartDrawer from "@/components/katalog/SoftlensCartDrawer";
import ProductImageZoomModal from "@/components/katalog/ProductImageZoomModal";

export default function SoftlensClient() {
  const [activeTab, setActiveTab] = useState<"all" | "lens" | "accessory">("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Detail Modal State
  const [detailSeries, setDetailSeries] = useState<SoftlensSeries | null>(null);
  const [detailInitialVariant, setDetailInitialVariant] = useState<SoftlensVariant | undefined>(undefined);

  // Zoom Modal State
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  // Cart State (Persisted in localStorage)
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

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    try {
      localStorage.setItem("isy_softlens_cart", JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenDetail = (series: SoftlensSeries, selectedVariant?: SoftlensVariant) => {
    setDetailSeries(series);
    setDetailInitialVariant(selectedVariant);
  };

  const handleCloseDetail = () => {
    setDetailSeries(null);
    setDetailInitialVariant(undefined);
  };

  const handleAddToCart = (series: SoftlensSeries, selectedVariant?: SoftlensVariant) => {
    const variant = selectedVariant || series.variants[0];
    const itemId = variant ? `${series.id}-${variant.id}` : series.id;
    const itemName = variant ? `${series.name} - ${variant.name}` : series.name;

    const cartProduct: SoftlensProduct = {
      id: itemId,
      name: itemName,
      category: series.category,
      price: variant ? variant.price : series.basePrice,
      priceFormatted: variant ? variant.priceFormatted : series.basePriceFormatted,
      image: variant ? variant.image : series.coverImage,
      hoverImage: variant?.hoverImage,
      detailPoster: variant?.detailPoster,
      colorFamily: variant ? variant.colorFamily : series.colorFamily,
      specs: series.specs,
      diameter: series.diameter,
      waterContent: series.waterContent,
      usageDuration: series.usageDuration,
      volume: series.volume,
      isAccessory: series.type === "accessory",
      description: series.description,
    };

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === cartProduct.id);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product: cartProduct, quantity: 1 }];
    });

    showToast(`"${itemName}" ditambahkan ke keranjang`);
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

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  // Filtered Series List
  const filteredSeries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return SOFTLENS_SERIES_LIST.filter((series) => {
      // Tab filter
      if (activeTab === "lens" && series.type !== "lens") return false;
      if (activeTab === "accessory" && series.type !== "accessory") return false;

      // Color filter
      if (selectedColor !== "all") {
        const hasMatchingColor =
          series.colorFamily === selectedColor ||
          series.variants.some((v) => v.colorFamily === selectedColor);
        if (!hasMatchingColor) return false;
      }

      // Search query
      if (q) {
        const matchName = series.name.toLowerCase().includes(q);
        const matchBrand = series.brand?.toLowerCase().includes(q);
        const matchDesc = series.description.toLowerCase().includes(q);
        const matchSpecs = series.specs.some((s) => s.toLowerCase().includes(q));
        const matchVariants = series.variants.some((v) =>
          v.name.toLowerCase().includes(q)
        );

        if (!matchName && !matchBrand && !matchDesc && !matchSpecs && !matchVariants) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, selectedColor, searchQuery]);

  const hasActiveFilter = activeTab !== "all" || selectedColor !== "all" || searchQuery !== "";

  const handleResetFilters = () => {
    setActiveTab("all");
    setSelectedColor("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#183C30]">
      {/* Top Header / Breadcrumb */}
      <section className="border-b border-[#E3E7DF] bg-white pt-24 pb-8 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[#626C65]">
              <li>
                <Link href="/" className="hover:text-[#124734] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-[#183C30]" aria-current="page">
                Katalog Softlens
              </li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#124734] tracking-tight">
                Katalog Softlens &amp; Perawatan
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#626C65] max-w-2xl leading-relaxed">
                Pilihan softlens warna natural, lensa bening bulanan, serta cairan pembersih higienis resmi Kemenkes RI untuk kesehatan mata Anda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/katalog"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E7DF] bg-[#F8F5ED] px-3.5 py-2 text-xs font-semibold text-[#124734] hover:bg-white hover:border-[#124734] transition-colors"
              >
                Lihat Katalog Kacamata →
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[#626C65] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari softlens, varian warna, atau cairan (contoh: ICE N°5, Irina Grey, X2)..."
                className="w-full rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#183C30] placeholder:text-[#626C65]/60 focus:border-[#124734] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#124734]/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute right-3 p-1 text-[#626C65] hover:text-[#183C30]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick search chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#626C65]">Pencarian Cepat:</span>
              {["ICE N°5", "Russian Velvet", "EXO CLEAR", "Cairan X2"].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="rounded-md border border-[#E3E7DF] bg-[#FAF8F3] px-2 py-0.5 text-[11px] font-medium text-[#183C30] hover:border-[#124734] hover:text-[#124734] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation Tabs & Color Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E3E7DF] pb-4">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "Semua Produk" },
              { id: "lens", label: "Softlens & Warna" },
              { id: "accessory", label: "Cairan & Aksesoris" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#124734] text-white shadow-xs"
                      : "border border-[#E3E7DF] bg-white text-[#626C65] hover:border-[#124734]/40 hover:text-[#183C30]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Color Filter (Active when not purely accessories) */}
          {activeTab !== "accessory" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-[#626C65] mr-1 hidden sm:inline">Warna:</span>
              {COLOR_FILTERS.filter((c) => c.id !== "accessory").map((col) => {
                const isSelected = selectedColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-[#183C30] text-white"
                        : "border border-[#E3E7DF] bg-white text-[#626C65] hover:border-[#124734] hover:text-[#183C30]"
                    }`}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-[#626C65] font-medium">
            Menampilkan <span className="font-bold text-[#183C30]">{filteredSeries.length}</span> model produk
          </p>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#124734] hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filter
            </button>
          )}
        </div>

        {/* Product Grid (1 Series = 1 Card) */}
        {filteredSeries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E3E7DF] bg-white p-12 text-center max-w-md mx-auto space-y-3">
            <p className="text-sm font-bold text-[#183C30]">Tidak ada produk yang cocok</p>
            <p className="text-xs text-[#626C65]">
              Coba gunakan kata kunci pencarian yang berbeda atau reset filter kategori &amp; warna.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#124734] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0C3527] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredSeries.map((series) => (
              <SoftlensSeriesCard
                key={series.id}
                series={series}
                onOpenDetail={handleOpenDetail}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Edukasi & Panduan Perawatan */}
        <section className="rounded-2xl border border-[#E3E7DF] bg-white p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#124734]">
              Panduan Higienitas
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#183C30] mt-1">
              Perawatan &amp; Edukasi Softlens
            </h2>
            <p className="text-xs sm:text-sm text-[#626C65] mt-1 leading-relaxed">
              Panduan pemakaian aman untuk kenyamanan kornea mata dan pencegahan iritasi harian.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#124734]/10 text-[#124734]">
                <Hand className="h-4 w-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#183C30]">Cuci Tangan Bersih</h3>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Selalu cuci tangan dengan sabun tanpa pewangi dan keringkan sebelum menyentuh softlens.
              </p>
            </div>

            <div className="rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#124734]/10 text-[#124734]">
                <FlaskConical className="h-4 w-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#183C30]">Cairan Steril Khusus</h3>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Gunakan cairan multi-purpose fresh setiap kali merendam. Jangan pernah gunakan air keran.
              </p>
            </div>

            <div className="rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#124734]/10 text-[#124734]">
                <Droplet className="h-4 w-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#183C30]">Tetes Mata Pelembab</h3>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Gunakan tetes mata khusus lensa kontak saat berada di ruangan ber-AC agar mata tidak kering.
              </p>
            </div>

            <div className="rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] p-4 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#124734]/10 text-[#124734]">
                <Box className="h-4 w-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#183C30]">Ganti Case Berkala</h3>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Ganti wadah perendam (lens case) setiap 1 hingga 2 bulan sekali untuk mencegah bakteri.
              </p>
            </div>
          </div>
        </section>

        {/* WhatsApp Consultation Banner */}
        <section className="rounded-2xl bg-[#124734] p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              Layanan Konsultasi Resep
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">
              Butuh Ukuran Minus Khusus atau Silinder?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Tim Optisi Optik I See You siap membantu mengecek ketersediaan minus dan merekomendasikan varian softlens yang paling pas untuk mata Anda.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={SOFTLENS_CS_WA_URL()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-[#124734] hover:bg-[#F8F5ED] transition-colors shadow-sm"
            >
              <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={18} height={18} />
              <span>Chat CS WhatsApp Softlens</span>
            </a>
          </div>
        </section>
      </main>

      {/* Floating Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="fixed right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#124734] px-4 py-3 text-white shadow-lg hover:bg-[#0C3527] transition-all focus:outline-none focus:ring-2 focus:ring-[#124734] focus:ring-offset-2"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label={`Buka Keranjang Belanja (${totalCartCount} item)`}
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#124734]">
              {totalCartCount}
            </span>
          )}
        </div>
        <span className="text-xs font-bold hidden sm:inline">
          Keranjang ({totalCartCount})
        </span>
      </button>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 z-50 transition-all"
          style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="rounded-full bg-[#183C30] px-5 py-2.5 text-xs font-semibold text-white shadow-xl border border-white/10">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <SoftlensDetailModal
        series={detailSeries}
        initialVariant={detailInitialVariant}
        isOpen={Boolean(detailSeries)}
        onClose={handleCloseDetail}
        onAddToCart={handleAddToCart}
        onOpenZoom={(src, title) => setZoomImage({ src, title })}
      />

      {/* Image Zoom Modal */}
      {zoomImage && (
        <ProductImageZoomModal
          isOpen={Boolean(zoomImage)}
          onClose={() => setZoomImage(null)}
          title={zoomImage.title}
          images={[{ label: "Tampilan HD", src: zoomImage.src }]}
          initialIndex={0}
        />
      )}

      {/* Cart Drawer */}
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
