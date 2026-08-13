"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/softlens";

// ─── Branch Data ───────────────────────────────────────────────────────────────
// Format phoneWa: hapus '0' di depan, tambah '62', tanpa spasi/strip/tanda '+'
const BRANCHES = [
  { id: "purwokerto",  name: "Purwokerto",  phoneDisplay: "0895-4156-14261", phoneWa: "62895415614261" },
  { id: "wonosobo",   name: "Wonosobo",    phoneDisplay: "0897-7129-039",   phoneWa: "628977129039"  },
  { id: "cilacap",    name: "Cilacap",     phoneDisplay: "0851-3593-0533",  phoneWa: "6285135930533" },
  { id: "purbalingga",name: "Purbalingga", phoneDisplay: "0822-3486-2322",  phoneWa: "6282234862322" },
] as const;

type BranchId = typeof BRANCHES[number]["id"];

// ─── WA Message Builder ─────────────────────────────────────────────────────────
function buildOrderMessage(
  branchName: string,
  customerName: string,
  phone: string,
  items: CartItem[],
  total: number
): string {
  const daftarItem = items
    .map(
      (item, i) =>
        `${i + 1}. ${item.product.name} (x${item.quantity}) - Rp ${(item.product.price * item.quantity).toLocaleString("id-ID")}`
    )
    .join("\n");

  return [
    `Halo CS Optik I See You - Cabang ${branchName}`,
    `Saya mau pesan Softlens dari website.`,
    ``,
    `*DATA PEMESAN*`,
    `- Nama: ${customerName}`,
    `- No. WhatsApp: ${phone}`,
    ``,
    `*DAFTAR PESANAN*`,
    daftarItem,
    ``,
    `*TOTAL PEMBAYARAN:* Rp ${total.toLocaleString("id-ID")}`,
    ``,
    `Mohon info ketersediaan stok & cara pembayarannya ya kak. Terima kasih!`,
  ].join("\n");
}

// ─── Props ──────────────────────────────────────────────────────────────────────
interface SoftlensOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  onOrderSuccess: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function SoftlensOrderModal({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  onOrderSuccess,
}: SoftlensOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // ── Validation & Step 1 Submit ──────────────────────────────────────────────
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Mohon isi nama lengkap kamu");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setError("Mohon isi nomor WhatsApp yang valid (min. 8 digit)");
      return;
    }
    setError("");
    setStep(2);
  };

  // ── Final WA Send ────────────────────────────────────────────────────────────
  const handleSendOrder = () => {
    if (!selectedBranch) return;
    const branch = BRANCHES.find((b) => b.id === selectedBranch)!;
    const message = buildOrderMessage(branch.name, name.trim(), phone.trim(), cartItems, totalPrice);
    const waUrl = `https://api.whatsapp.com/send/?phone=${branch.phoneWa}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    // Reset state
    setStep(1);
    setName("");
    setPhone("");
    setSelectedBranch(null);
    setError("");
    onOrderSuccess();
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setName("");
    setPhone("");
    setSelectedBranch(null);
    setError("");
    onClose();
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-isy-line animate-in zoom-in-95 duration-300">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-isy-line bg-[#FAF9F5] px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Step Indicator */}
            <div className="flex items-center gap-1.5">
              {/* Step 1 Dot */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all duration-300 ${
                  step >= 1
                    ? "bg-isy-green-bright text-white"
                    : "bg-isy-line text-isy-ink/40"
                }`}
              >
                {step > 1 ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "1"
                )}
              </div>
              {/* Connector */}
              <div className={`h-0.5 w-6 rounded-full transition-all duration-500 ${step === 2 ? "bg-isy-green-bright" : "bg-isy-line"}`} />
              {/* Step 2 Dot */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all duration-300 ${
                  step === 2
                    ? "bg-isy-green-bright text-white"
                    : "bg-isy-line text-isy-ink/40"
                }`}
              >
                2
              </div>
            </div>

            <div>
              <h3 className="font-serif text-base font-black text-isy-green-deep">
                {step === 1 ? "Isi Data Pemesan" : "Pilih Cabang Tujuan"}
              </h3>
              <p className="text-[10px] text-isy-ink/55 font-medium">
                {step === 1 ? "Langkah 1/2 — Data diri kamu" : "Langkah 2/2 — Pesanan diteruskan ke cabang ini"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/50 hover:bg-isy-line transition-colors"
            aria-label="Tutup modal"
          >
            &#x2715;
          </button>
        </div>

        {/* ── Order Summary Pill (always visible) ────────────────────────── */}
        <div className="mx-6 mt-5 rounded-2xl border border-isy-green-bright/20 bg-isy-mist/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-isy-green-deep">
            <span>Ringkasan Pesanan ({totalItems} item)</span>
            <span className="text-isy-green-bright font-black">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="max-h-20 overflow-y-auto space-y-1 text-[11px] text-isy-ink/70 pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.product.name}{" "}
                  <span className="font-bold text-isy-green-deep">(x{item.quantity})</span>
                </span>
                <span className="shrink-0 font-semibold">
                  Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 1: Data Pemesan ────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="px-6 pb-6 pt-5 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
                &#9888; {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="order-name" className="text-xs font-bold text-isy-green-deep block">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="order-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none focus:ring-1 focus:ring-isy-green-bright shadow-sm transition-all"
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="order-phone" className="text-xs font-bold text-isy-green-deep block">
                Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
              </label>
              <input
                id="order-phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none focus:ring-1 focus:ring-isy-green-bright shadow-sm transition-all"
                required
                autoComplete="tel"
              />
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-1/3 rounded-xl border border-isy-line py-3 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!name.trim() || phone.replace(/\D/g, "").length < 8}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <span>Lanjutkan</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Pilih Cabang ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="px-6 pb-6 pt-5 space-y-4">
            {/* Branch List — Radio Cards */}
            <fieldset>
              <legend className="text-xs font-bold text-isy-ink/60 mb-3">
                Pilih salah satu cabang tujuan:
              </legend>
              <div className="space-y-2.5" role="radiogroup" aria-label="Pilih cabang tujuan">
                {BRANCHES.map((branch) => {
                  const isSelected = selectedBranch === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Cabang ${branch.name} — ${branch.phoneDisplay}`}
                      onClick={() => setSelectedBranch(branch.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-isy-green-bright ${
                        isSelected
                          ? "border-isy-green-bright bg-isy-green-bright/8 shadow-sm"
                          : "border-isy-line bg-white hover:border-isy-green-bright/50 hover:bg-isy-mist/40"
                      }`}
                    >
                      {/* Left: Radio Dot + Name */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-isy-green-bright bg-isy-green-bright"
                              : "border-isy-line bg-white"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                          )}
                        </span>
                        <span className={`text-sm font-black transition-colors ${isSelected ? "text-isy-green-deep" : "text-isy-ink"}`}>
                          {branch.name}
                        </span>
                      </div>

                      {/* Right: Phone Number */}
                      <span className={`text-[11px] font-mono font-bold transition-colors ${isSelected ? "text-isy-green-bright" : "text-isy-ink/50"}`}>
                        {branch.phoneDisplay}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 flex items-center justify-center gap-1.5 rounded-xl border border-isy-line py-3 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSendOrder}
                disabled={!selectedBranch}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-isy-green-bright py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 hover:bg-isy-green-deep active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {/* WhatsApp Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Kirim Pesanan ke WA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
