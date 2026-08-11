"use client";

/**
 * components/ui/ContactCSModal.tsx
 *
 * Modal shared untuk Nama + No. WA sebelum buka chat CS.
 * Dipakai di: halaman Katalog, hasil Try-On, dan halaman Softlens.
 *
 * Alur:
 *  1. User klik tombol "Tanya WA" / "Chat CS"
 *  2. Modal ini muncul — user isi Nama & No. WA
 *  3. Klik Kirim → redirect ke wa.me dengan pesan yang sudah ada + nama & nomor user
 *
 * Props:
 *  - isOpen: boolean — controlled dari parent
 *  - onClose: () => void
 *  - waUrl: string — base WA URL (dengan template pesan yang sudah ada)
 *  - productName?: string — nama produk untuk konteks pesan
 *  - csName?: string — nama CS yang akan dihubungi (opsional, default "CS I See You")
 */

import { useState, useEffect, useRef } from "react";

interface ContactCSModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** URL WhatsApp lengkap dengan template pesan (dari csWhatsappUrl() / catalogWhatsappUrl()) */
  waUrl: string;
  productName?: string;
  csName?: string;
}

/** Validasi No. WA Indonesia: 08xx atau +62xxx atau 62xxx */
function isValidWANumber(num: string): boolean {
  const cleaned = num.replace(/[\s\-().]/g, "");
  return /^(\+62|62|08)\d{8,13}$/.test(cleaned);
}

/** Format nomor ke internasional tanpa + untuk wa.me */
function toWAFormat(num: string): string {
  const cleaned = num.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+62")) return cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  if (cleaned.startsWith("08")) return "62" + cleaned.slice(1);
  return cleaned;
}

export default function ContactCSModal({
  isOpen,
  onClose,
  waUrl,
  productName,
  csName = "CS I See You",
}: ContactCSModalProps) {
  const [nama, setNama] = useState("");
  const [nomorWA, setNomorWA] = useState("");
  const [errors, setErrors] = useState<{ nama?: string; nomorWA?: string }>({});
  const [mounted, setMounted] = useState(false);
  const namaInputRef = useRef<HTMLInputElement>(null);

  /* Animate in */
  useEffect(() => {
    if (isOpen) {
      const t = requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = "hidden";
      setTimeout(() => namaInputRef.current?.focus(), 300);
      return () => cancelAnimationFrame(t);
    } else {
      setMounted(false);
      document.body.style.overflow = "";
      // Reset form setelah modal tutup
      setTimeout(() => {
        setNama("");
        setNomorWA("");
        setErrors({});
      }, 300);
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

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nama.trim() || nama.trim().length < 2) {
      newErrors.nama = "Nama minimal 2 karakter";
    }
    if (!isValidWANumber(nomorWA)) {
      newErrors.nomorWA = "Format: 08xx atau +62xxx";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    /* Sisipkan nama & nomor ke URL pesan yang sudah ada */
    const userInfo = `\n\nNama saya: ${nama.trim()}\nNomor WA saya: ${nomorWA.trim()}`;
    const baseUrl = waUrl.includes("?text=")
      ? waUrl
      : waUrl + "?text=";

    let finalUrl: string;
    if (waUrl.includes("?text=")) {
      const [base, encodedMsg] = waUrl.split("?text=");
      const decoded = decodeURIComponent(encodedMsg);
      finalUrl = `${base}?text=${encodeURIComponent(decoded + userInfo)}`;
    } else {
      finalUrl = `${waUrl}?text=${encodeURIComponent(userInfo)}`;
    }

    window.open(finalUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="cs-modal-title"
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-t-[2rem] bg-white shadow-2xl transition-all duration-400 sm:rounded-[2rem] ${
          mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-[0.97]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent strip */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #116B3C, #2FA84F)" }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-isy-green-bright">
                Chat CS
              </span>
            </div>
            <h2 id="cs-modal-title" className="font-serif text-xl font-black text-isy-green-deep">
              Sebelum Chat {csName}
            </h2>
            {productName && (
              <p className="mt-0.5 text-xs text-isy-ink/50">
                Re:{" "}
                <span className="font-semibold text-isy-green-deep">{productName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            id="cs-modal-close"
            className="ml-3 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-isy-ink/60 transition hover:bg-gray-200"
            aria-label="Tutup"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-3 space-y-4">
          <p className="text-xs text-isy-ink/55 leading-relaxed">
            Isi nama dan nomor WA kamu, biar CS kami bisa langsung balas dengan personal 😊
          </p>

          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="cs-modal-nama" className="text-[11px] font-extrabold uppercase tracking-wider text-isy-ink/50">
              Nama Kamu
            </label>
            <input
              ref={namaInputRef}
              id="cs-modal-nama"
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (errors.nama) setErrors((p) => ({ ...p, nama: undefined }));
              }}
              placeholder="Contoh: Andi"
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-isy-green-deep placeholder:text-isy-ink/30 outline-none transition-all focus:ring-2 focus:ring-isy-green-bright/30 ${
                errors.nama
                  ? "border-red-400 bg-red-50"
                  : "border-isy-line bg-isy-mist/60 focus:border-isy-green-bright"
              }`}
              autoComplete="name"
              maxLength={60}
            />
            {errors.nama && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                {errors.nama}
              </p>
            )}
          </div>

          {/* No. WA */}
          <div className="space-y-1.5">
            <label htmlFor="cs-modal-wa" className="text-[11px] font-extrabold uppercase tracking-wider text-isy-ink/50">
              Nomor WhatsApp
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-isy-ink/40 select-none">
                🇮🇩
              </span>
              <input
                id="cs-modal-wa"
                type="tel"
                value={nomorWA}
                onChange={(e) => {
                  setNomorWA(e.target.value);
                  if (errors.nomorWA) setErrors((p) => ({ ...p, nomorWA: undefined }));
                }}
                placeholder="08123456789 atau +628123456789"
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm font-medium text-isy-green-deep placeholder:text-isy-ink/30 outline-none transition-all focus:ring-2 focus:ring-isy-green-bright/30 ${
                  errors.nomorWA
                    ? "border-red-400 bg-red-50"
                    : "border-isy-line bg-isy-mist/60 focus:border-isy-green-bright"
                }`}
                autoComplete="tel"
                inputMode="tel"
                maxLength={20}
              />
            </div>
            {errors.nomorWA ? (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                {errors.nomorWA}
              </p>
            ) : (
              <p className="text-[11px] text-isy-ink/40">Format: 08xx atau +62xxx (nomor Indonesia)</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="cs-modal-submit"
            className="w-full rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 transition-all hover:scale-[1.02] hover:shadow-isy-green-bright/35 active:scale-[0.97]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M11.5 2.5a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9z"/>
              </svg>
              Lanjut ke WhatsApp
            </span>
          </button>

          <p className="text-center text-[10px] text-isy-ink/35">
            Data kamu hanya digunakan untuk pesan WA, tidak disimpan.
          </p>
        </form>
      </div>
    </div>
  );
}
