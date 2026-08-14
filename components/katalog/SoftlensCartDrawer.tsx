"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { CartItem, SoftlensProduct } from "@/lib/softlens";
import SoftlensOrderModal from "./SoftlensOrderModal";

interface SoftlensCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

const COLOR_SWATCHES: Record<string, string> = {
  brown:     "linear-gradient(135deg, #8B6350 0%, #C4956A 100%)",
  grey:      "linear-gradient(135deg, #8C9EA8 0%, #C5CDD2 100%)",
  hazel:     "linear-gradient(135deg, #7B6248 0%, #A8855E 100%)",
  natural:   "linear-gradient(135deg, #3A3D40 0%, #70757A 100%)",
  colorful:  "linear-gradient(135deg, #4A7C9B 0%, #9BC4E2 100%)",
  accessory: "linear-gradient(135deg, #116B3C 0%, #2FA84F 100%)",
};

// ── Icon SVGs ────────────────────────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ── Quantity Stepper — shows trash icon when qty = 1 (next tap = remove) ─────
function QuantityStepper({
  quantity,
  onDecrement,
  onRemove,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onRemove: () => void;
  onIncrement: () => void;
}) {
  const isOne = quantity === 1;

  return (
    <div className="flex items-center rounded-xl border border-isy-line bg-white shadow-sm overflow-hidden">
      {/* Decrement or Remove */}
      <button
        onClick={isOne ? onRemove : onDecrement}
        className={`flex h-9 w-9 items-center justify-center text-xs font-bold transition-all duration-150 ${
          isOne
            ? "text-red-400 hover:bg-red-50 hover:text-red-600"
            : "text-isy-ink hover:bg-isy-mist"
        }`}
        title={isOne ? "Hapus dari keranjang" : "Kurangi jumlah"}
        aria-label={isOne ? "Hapus dari keranjang" : "Kurangi jumlah"}
      >
        {isOne ? <TrashIcon /> : <span className="text-sm leading-none">&#8722;</span>}
      </button>

      {/* Quantity */}
      <span className="w-8 text-center text-xs font-black text-isy-green-deep tabular-nums select-none">
        {quantity}
      </span>

      {/* Increment */}
      <button
        onClick={onIncrement}
        className="flex h-9 w-9 items-center justify-center text-xs font-bold text-isy-ink hover:bg-isy-mist transition-colors"
        title="Tambah jumlah"
        aria-label="Tambah jumlah"
      >
        <span className="text-sm leading-none">&#43;</span>
      </button>
    </div>
  );
}

// ── Main Cart Drawer ──────────────────────────────────────────────────────────
export default function SoftlensCartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: SoftlensCartDrawerProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleDecrement = useCallback(
    (id: string) => onUpdateQuantity(id, -1),
    [onUpdateQuantity]
  );
  const handleIncrement = useCallback(
    (id: string) => onUpdateQuantity(id, 1),
    [onUpdateQuantity]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer Panel — flex column so footer sticks */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex shrink-0 items-center justify-between border-b border-isy-line p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-isy-green-bright/10 text-isy-green-bright">
                <CartIcon />
              </span>
              <div>
                <h3 className="font-serif text-lg font-black text-isy-green-deep">
                  Keranjang Softlens
                </h3>
                <p className="text-[11px] text-isy-ink/60">
                  {totalItems > 0
                    ? `${totalItems} item dipilih`
                    : "Keranjang kamu masih kosong"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"
                aria-label="Tutup keranjang"
              >
                &#x2715;
              </button>
            </div>
          </div>

          {/* ── Scrollable Body ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cartItems.length === 0 ? (
              /* Empty State */
              <div className="flex h-full flex-col items-center justify-center text-center space-y-3 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-isy-mist text-isy-green-bright/50">
                  <CartIcon />
                </div>
                <h4 className="font-serif text-base font-bold text-isy-green-deep">
                  Keranjang Masih Kosong
                </h4>
                <p className="text-xs text-isy-ink/60 max-w-xs leading-relaxed">
                  Yuk pilih softlens atau cairan perawatan favoritmu dari katalog.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-xl bg-isy-green-deep px-5 py-2.5 text-xs font-extrabold text-white shadow hover:bg-isy-green-bright transition-all active:scale-95"
                >
                  Pilih Softlens
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const swatchGradient =
                  COLOR_SWATCHES[item.product.colorFamily] ??
                  COLOR_SWATCHES.brown;
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-isy-line bg-isy-mist/30 p-3 shadow-sm transition-all duration-200 hover:border-isy-green-bright/30 hover:shadow-md hover:-translate-y-px"
                  >
                    {/* Product Image */}
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden shadow-sm border border-isy-line bg-isy-mist">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div
                          className="h-full w-full flex items-center justify-center text-white text-sm select-none"
                          style={{ background: swatchGradient }}
                        >
                          {item.product.isAccessory ? "&#128167;" : "&#128065;"}
                        </div>
                      )}
                    </div>

                    {/* Product Name & Price */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-serif text-xs font-bold text-isy-green-deep truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-extrabold text-isy-green-bright whitespace-nowrap">
                        Rp {item.product.price.toLocaleString("id-ID")}
                        <span className="text-[10px] font-bold text-isy-ink/40 ml-1">
                          {item.product.isAccessory ? "/pcs" : "/pasang"}
                        </span>
                      </p>
                    </div>

                    {/* Qty Stepper */}
                    <QuantityStepper
                      quantity={item.quantity}
                      onDecrement={() => handleDecrement(item.product.id)}
                      onRemove={() => onRemoveItem(item.product.id)}
                      onIncrement={() => handleIncrement(item.product.id)}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* ── Sticky Footer — Total & CTA ──────────────────────────────── */}
          {cartItems.length > 0 && (
            <div
              className="shrink-0 border-t border-isy-line bg-white p-5 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.07)]"
              style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-isy-ink/55 uppercase tracking-wider block">
                    Total Pembayaran
                  </span>
                  <span className="font-serif text-xl font-black text-isy-green-deep tabular-nums">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <span className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-xs font-bold text-isy-green-bright border border-isy-green-bright/20">
                  {totalItems} item
                </span>
              </div>

              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-isy-green-bright/30 hover:bg-isy-green-deep active:scale-95 transition-all duration-200"
              >
                <span>Lanjut Order via WhatsApp</span>
                <ArrowIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Form Modal */}
      <SoftlensOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        onOrderSuccess={() => {
          onClearCart();
          onClose();
        }}
      />
    </>
  );
}
