"use client";

import { useState } from "react";
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
  brown: "linear-gradient(135deg, #8B6350 0%, #C4956A 100%)",
  grey: "linear-gradient(135deg, #8C9EA8 0%, #C5CDD2 100%)",
  hazel: "linear-gradient(135deg, #7B6248 0%, #A8855E 100%)",
  natural: "linear-gradient(135deg, #3A3D40 0%, #70757A 100%)",
  colorful: "linear-gradient(135deg, #4A7C9B 0%, #9BC4E2 100%)",
  accessory: "linear-gradient(135deg, #116B3C 0%, #2FA84F 100%)",
};

export default function SoftlensCartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: SoftlensCartDrawerProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  if (!isOpen) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer Panel */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-isy-line p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-isy-green-bright/10 text-lg text-isy-green-bright">
                🛒
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
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Drawer Body — Cart List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-3 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-isy-mist text-3xl">
                  🛒
                </div>
                <h4 className="font-serif text-base font-bold text-isy-green-deep">
                  Keranjang Masih Kosong
                </h4>
                <p className="text-xs text-isy-ink/60 max-w-xs leading-relaxed">
                  Pilih varian softlens atau cairan perawatan favoritmu di katalog untuk ditambahkan ke keranjang.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-xl bg-isy-green-deep px-5 py-2.5 text-xs font-extrabold text-white shadow hover:bg-isy-green-bright transition-all"
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
                    className="flex items-center justify-between gap-3 rounded-2xl border border-isy-line bg-isy-mist/30 p-3 shadow-sm transition-all hover:border-isy-green-bright/30"
                  >
                    {/* Swatch Thumbnail */}
                    <div
                      className="h-12 w-12 shrink-0 rounded-xl shadow border border-white flex items-center justify-center relative overflow-hidden"
                      style={{ background: swatchGradient }}
                    >
                      <span className="text-white text-base drop-shadow select-none">
                        {item.product.isAccessory ? "💧" : "👁"}
                      </span>
                    </div>

                    {/* Product Name & Price */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-serif text-xs font-bold text-isy-green-deep truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-extrabold text-isy-green-bright">
                        Rp {item.product.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-isy-line bg-white shadow-sm overflow-hidden">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, -1)
                          }
                          className="flex h-7 w-7 items-center justify-center text-xs font-bold text-isy-ink hover:bg-isy-mist transition-colors"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-black text-isy-green-deep">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="flex h-7 w-7 items-center justify-center text-xs font-bold text-isy-ink hover:bg-isy-mist transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-isy-ink/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Hapus dari keranjang"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer — Total & Order Button */}
          {cartItems.length > 0 && (
            <div className="border-t border-isy-line bg-white p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-isy-ink/60 uppercase tracking-wider block">
                    Total Pembayaran
                  </span>
                  <span className="font-serif text-xl font-black text-isy-green-deep">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <span className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-xs font-bold text-isy-green-bright border border-isy-green-bright/20">
                  {totalItems} item
                </span>
              </div>

              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-isy-green-bright/30 hover:bg-isy-green-deep active:scale-95 transition-all"
              >
                <span>Lanjut Order via WhatsApp</span>
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
