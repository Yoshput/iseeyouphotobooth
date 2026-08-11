"use client";

import { useEffect, useState } from "react";
import type { SoftlensProduct } from "@/lib/softlens";

interface Props {
  product: SoftlensProduct | null;
  onClose: () => void;
  onTanyaStok: (product: SoftlensProduct) => void;
}

const COLOR_GRADIENTS: Record<string, string> = {
  brown: "linear-gradient(135deg, #8B6350 0%, #C4956A 100%)",
  grey: "linear-gradient(135deg, #8C9EA8 0%, #C5CDD2 100%)",
  hazel: "linear-gradient(135deg, #7B6248 0%, #A8855E 100%)",
  natural: "linear-gradient(135deg, #3A3D40 0%, #70757A 100%)",
  colorful: "linear-gradient(135deg, #4A7C9B 0%, #9BC4E2 100%)",
  accessory: "linear-gradient(135deg, #116B3C 0%, #2FA84F 100%)",
};

export default function SoftlensDetailModal({ product, onClose, onTanyaStok }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (product) {
      const t = requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(t);
        document.body.style.overflow = "";
      };
    } else {
      setMounted(false);
    }
  }, [product]);

  if (!product) return null;

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
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-isy-ink/60 transition hover:bg-gray-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-4 space-y-5">
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
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-isy-ink/40">Keunggulan & Spesifikasi</h4>
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
              Tersedia stok untuk mata normal, minus tinggi hingga -10.00, dan resep silinder (astigmatism). Tanyakan langsung ke CS kami untuk konsultasi ukuran.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-isy-line bg-gray-50 flex gap-3">
          <button
            onClick={() => {
              onClose();
              onTanyaStok(product);
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 transition-all hover:scale-[1.02] active:scale-[0.97]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Tanya Stok via WA
          </button>
        </div>
      </div>
    </div>
  );
}
