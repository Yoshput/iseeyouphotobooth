"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/softlens";
import { SOFTLENS_CS_NUMBER } from "@/lib/softlens";

interface SoftlensOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  onOrderSuccess: () => void;
}

export default function SoftlensOrderModal({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  onOrderSuccess,
}: SoftlensOrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Mohon isi nama kamu");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError("Mohon isi nomor telepon/WhatsApp yang valid");
      return;
    }

    setError("");

    // Build Order List Text
    const itemsText = cartItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.name} (x${item.quantity}) — Rp ${(
            item.product.price * item.quantity
          ).toLocaleString("id-ID")}`
      )
      .join("\n");

    const totalFormatted = `Rp ${totalPrice.toLocaleString("id-ID")}`;

    // Professional WhatsApp Message Template
    const message = `Halo CS Optik I See You 👋
Saya mau pesan Softlens dari website:

📋 *DATA PEMESAN*
• Nama: ${name.trim()}
• No. WhatsApp: ${phone.trim()}

🛍️ *DAFTAR PESANAN*
${itemsText}

💰 *TOTAL PEMBAYARAN:* ${totalFormatted}

Mohon info ketersediaan stok & cara pembayarannya ya kak. Terima kasih!`;

    const waUrl = `https://wa.me/${SOFTLENS_CS_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(waUrl, "_blank");

    onOrderSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-isy-line">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-isy-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-isy-green-bright/10 text-isy-green-bright text-lg">
              💬
            </span>
            <div>
              <h3 className="font-serif text-lg font-black text-isy-green-deep">
                Isi Data Pemesan
              </h3>
              <p className="text-[11px] text-isy-ink/60">
                Data akan diteruskan ke WhatsApp CS Optik I See You
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Order Summary Pill */}
        <div className="rounded-2xl border border-isy-green-bright/20 bg-isy-mist/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-isy-green-deep">
            <span>Ringkasan Pesanan ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} item)</span>
            <span className="text-isy-green-bright font-black">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-isy-ink/75 pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span className="truncate pr-2">
                  • {item.product.name} <span className="font-bold text-isy-green-deep">(x{item.quantity})</span>
                </span>
                <span className="shrink-0 font-semibold">
                  Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-isy-green-deep block">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none focus:ring-1 focus:ring-isy-green-bright shadow-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-isy-green-deep block">
              Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none focus:ring-1 focus:ring-isy-green-bright shadow-sm"
              required
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-xl border border-isy-line py-3 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-95 transition-all"
            >
              <span>Kirim Pesanan ke WA</span>
              <svg
                width="14"
                height="14"
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
        </form>
      </div>
    </div>
  );
}
