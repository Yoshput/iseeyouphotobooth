"use client";

import { useEffect, useState } from "react";
import type { SoftlensProduct } from "@/lib/softlens";

interface Props {
  product: SoftlensProduct | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (product: SoftlensProduct) => void;
}

const COLOR_GRADIENTS: Record<string, string> = {
  brown: "linear-gradient(135deg, #8B6350 0%, #C4956A 100%)",
  grey: "linear-gradient(135deg, #8C9EA8 0%, #C5CDD2 100%)",
  hazel: "linear-gradient(135deg, #7B6248 0%, #A8855E 100%)",
  natural: "linear-gradient(135deg, #3A3D40 0%, #70757A 100%)",
  colorful: "linear-gradient(135deg, #4A7C9B 0%, #9BC4E2 100%)",
  accessory: "linear-gradient(135deg, #116B3C 0%, #2FA84F 100%)",
};

export default function SoftlensDetailModal({ product, isOpen = true, onClose, onAddToCart }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      const t = requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(t);
        document.body.style.overflow = "";
      };
    } else {
      setMounted(false);
    }
  }, [product, isOpen]);

  if (!product || !isOpen) return null;

  const gradient = COLOR_GRADIENTS[product.colorFamily] ?? COLOR_GRADIENTS.brown;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-t-[2rem] bg-white shadow-2xl transition-all duration-400 sm:rounded-[2rem] ${
          mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent strip */}
        <div className="h-1.5 w-full" style={{ background: gradient }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-isy-green-bright/10 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-isy-green-bright border border-isy-green-bright/20 mb-2">
              {product.category}
            </span>
            <h2 className="font-serif text-2xl font-black text-isy-green-deep">
              {product.name}
            </h2>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-isy-green-bright tracking-tight">
                {product.priceFormatted}
              </span>
              <span className="text-[10px] text-isy-ink/40 font-semibold">
                {product.isAccessory ? "/ pcs" : "/ pasang"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-isy-ink/60 transition hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-4 space-y-5">
          {/* Visual Swatch / Accessory Icon */}
          <div className="relative flex items-center justify-center py-6 rounded-2xl bg-isy-mist/50 border border-isy-line">
            <div
              className="h-32 w-32 rounded-full shadow-xl ring-4 ring-white flex items-center justify-center relative overflow-hidden"
              style={{ background: gradient }}
            >
              <div className="absolute inset-0 rounded-full bg-white/20 [mask-image:radial-gradient(ellipse_at_30%_30%,white_20%,transparent_70%)]" />
              <span className="text-4xl text-white drop-shadow select-none">
                {product.isAccessory ? "💧" : "👁"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-isy-ink/40">Deskripsi Produk</h4>
            <p className="text-sm font-medium text-isy-ink/75 leading-relaxed">{product.description}</p>
          </div>

          {/* Specs / Detail Info Grid */}
          {!product.isAccessory && (
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-isy-mist p-4 border border-isy-line">
              <div className="text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Diameter</p>
                <p className="mt-0.5 text-xs font-black text-isy-green-deep">{product.diameter ?? "14.2 mm"}</p>
              </div>
              <div className="text-center border-x border-isy-line/60">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Kadar Air</p>
                <p className="mt-0.5 text-xs font-black text-isy-green-deep">{product.waterContent ?? "50%"}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Masa Pakai</p>
                <p className="mt-0.5 text-xs font-black text-isy-green-deep">{product.usageDuration ?? "6 Bulan"}</p>
              </div>
            </div>
          )}

          {/* Features / Highlights */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-isy-ink/40">Keunggulan &amp; Spesifikasi</h4>
            <div className="flex flex-wrap gap-2">
              {product.specs.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 rounded-xl bg-isy-green-bright/10 px-3 py-1 text-xs font-bold text-isy-green-deep border border-isy-green-bright/20"
                >
                  <span className="text-isy-green-bright">✦</span> {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2.5">
            <span className="text-base leading-none">💡</span>
            <p className="leading-relaxed font-medium">
              Tersedia stok untuk mata normal, minus tinggi hingga -10.00, dan resep silinder (astigmatism). Tanyakan langsung saat order.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-isy-line bg-gray-50 flex gap-3">
          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 transition-all hover:bg-isy-green-deep active:scale-[0.97]"
          >
            <span>🛒 Tambah ke Keranjang ({product.priceFormatted})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
