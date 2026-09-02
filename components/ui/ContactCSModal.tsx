"use client";

/**
 * components/ui/ContactCSModal.tsx
 *
 * Modal popup WhatsApp dengan pilihan 4 Cabang Resmi Optik I See You:
 * - Purwokerto (0895-4156-14261)
 * - Purbalingga (0822-3486-2322)
 * - Wonosobo (0897-7129-039)
 * - Cilacap (0851-3593-0533)
 *
 * Alur:
 *  1. User klik "Chat CS" / "Beli via WA" di katalog frame atau detail produk
 *  2. Langkah 1: User memasukkan Nama & Nomor WhatsApp
 *  3. Langkah 2: User memilih Cabang kota terdekat (Purwokerto / Purbalingga / Wonosobo / Cilacap)
 *  4. Membuka WhatsApp CS cabang terkait dengan pesan rapi & terstruktur
 */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export const CS_BRANCHES = [
  {
    id: "purwokerto",
    name: "Purwokerto",
    address: "Jl. Sunan Ampel No.5, Kedungmalang",
    phoneDisplay: "0895-4156-14261",
    phoneWa: "62895415614261",
    badgeBg: "bg-emerald-100 text-emerald-800",
    borderHover: "hover:border-emerald-500",
  },
  {
    id: "purbalingga",
    name: "Purbalingga",
    address: "Jl. Onje No.1, Purbalingga Lor",
    phoneDisplay: "0822-3486-2322",
    phoneWa: "6282234862322",
    badgeBg: "bg-teal-100 text-teal-800",
    borderHover: "hover:border-teal-500",
  },
  {
    id: "wonosobo",
    name: "Wonosobo",
    address: "Jl. Jenderal Soedirman, Sumberan",
    phoneDisplay: "0897-7129-039",
    phoneWa: "628977129039",
    badgeBg: "bg-lime-100 text-lime-800",
    borderHover: "hover:border-lime-500",
  },
  {
    id: "cilacap",
    name: "Cilacap",
    address: "Jl. Rinjani Ruko No.3 (Depan GRP)",
    phoneDisplay: "0851-3593-0533",
    phoneWa: "6285135930533",
    badgeBg: "bg-green-100 text-green-800",
    borderHover: "hover:border-green-500",
  },
] as const;

type BranchId = typeof CS_BRANCHES[number]["id"];

interface ContactCSModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** URL WhatsApp cadangan / template lama */
  waUrl?: string;
  productName?: string;
  csName?: string;
}



export default function ContactCSModal({
  isOpen,
  onClose,
  productName,
  csName = "CS I See You",
}: ContactCSModalProps) {
  const [mounted, setMounted] = useState(false);

  /* Animate in & Focus */
  useEffect(() => {
    if (isOpen) {
      const t = requestAnimationFrame(() => setMounted(true));
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = sw + 'px';
      document.body.style.overflow = "hidden";
      return () => cancelAnimationFrame(t);
    } else {
      setMounted(false);
      document.body.style.paddingRight = '';
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  /* Keyboard: Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendToBranch = (branchIdToUse: BranchId) => {
    if (!branchIdToUse) return;

    const branch = CS_BRANCHES.find((b) => b.id === branchIdToUse)!;
    const message = productName 
      ? `Halo Optik I See You ${branch.name}! 👋\nSaya ingin bertanya tentang: *${productName}*\n\nBoleh dibantu informasinya? 🙏`
      : `Halo Optik I See You ${branch.name}! 👋\nSaya ingin bertanya tentang produk frame & lensa kacamata di Optik I See You.\n\nBoleh dibantu informasinya? 🙏`;
    const waUrl = `https://api.whatsapp.com/send/?phone=${branch.phoneWa}&text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="cs-modal-title"
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-t-[2rem] bg-white shadow-2xl transition-all duration-300 sm:rounded-[2rem] border border-isy-line max-h-[92vh] flex flex-col ${
          mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-[0.97]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#116B3C] via-[#2FA84F] to-[#86EFAC]" />

        {/* Header Section */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-isy-line/70 bg-gradient-to-b from-isy-mist/50 to-white">
          <div className="flex items-center gap-3">
            <div>
              <h2 id="cs-modal-title" className="font-serif text-lg font-black text-isy-green-deep">
                Pilih Cabang Tujuan
              </h2>
              <p className="text-[10.5px] text-isy-ink/55 font-medium">
                Terhubung ke nomor cabang terdekat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/50 hover:bg-isy-line transition-colors"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Product Context Banner (if item exists) */}
        {productName && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-2xl bg-isy-mist/70 border border-isy-line px-3.5 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-isy-green-deep text-white text-xs font-bold">
              👓
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-isy-green-bright">
                Frame yang ditanyakan:
              </p>
              <p className="text-xs font-bold text-isy-green-deep truncate">{productName}</p>
            </div>
          </div>
        )}

        {/* ── Pilih 4 Cabang Resmi ── */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-isy-ink/65 leading-relaxed">
            Pilih cabang kota terdekat untuk langsung membuka percakapan WhatsApp dengan CS cabang terkait:
          </p>

          {/* Branch Card Buttons */}
          <div className="space-y-2.5">
            {CS_BRANCHES.map((branch) => {
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => {
                    handleSendToBranch(branch.id);
                  }}
                  className={`group w-full flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer border-isy-line bg-white hover:border-isy-green-bright hover:bg-isy-mist/50 hover:shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">
                      <Image
                        src="/logo/Logo-Whatsapp.png"
                        alt="WA"
                        width={22}
                        height={22}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-isy-green-deep">
                          Cabang {branch.name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${branch.badgeBg}`}>
                          Official
                        </span>
                      </div>
                      <p className="text-[10px] text-isy-ink/50 truncate max-w-[190px] sm:max-w-[220px]">
                        {branch.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-black text-isy-green-bright block">
                      {branch.phoneDisplay}
                    </span>
                    <span className="text-[9.5px] font-bold text-isy-green-deep opacity-0 group-hover:opacity-100 transition-opacity">
                      Chat Sekarang →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
