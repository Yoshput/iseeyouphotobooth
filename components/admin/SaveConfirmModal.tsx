"use client";

import { useEffect } from "react";
import { HelpCircle, Save, Loader2, X, AlertCircle } from "lucide-react";

interface SaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "save" | "publish" | "warning";
}

export default function SaveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Simpan Perubahan",
  itemName,
  description,
  confirmText = "Ya, Simpan Perubahan",
  cancelText = "Periksa Kembali",
  isLoading = false,
  variant = "save",
}: SaveConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const defaultDescription = itemName
    ? `Apakah Anda yakin ingin menyimpan perubahan pada "${itemName}"? Data akan langsung diperbarui dan diterapkan di website publik.`
    : "Apakah Anda yakin ingin menyimpan perubahan data ini? Seluruh pembaruan akan langsung aktif di database dan website publik.";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-isy-line transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 rounded-full p-1.5 text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald transition-colors"
          aria-label="Tutup dialog konfirmasi"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header & Icon */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              variant === "publish"
                ? "bg-emerald-50 text-isy-green-bright border border-emerald-200"
                : variant === "warning"
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-isy-mist text-isy-emerald border border-isy-line"
            }`}
          >
            {variant === "warning" ? (
              <AlertCircle className="h-6 w-6 stroke-[2]" />
            ) : variant === "publish" ? (
              <Save className="h-6 w-6 stroke-[2]" />
            ) : (
              <HelpCircle className="h-6 w-6 stroke-[2]" />
            )}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base sm:text-lg font-extrabold text-isy-emerald leading-snug">
              {title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-isy-text-secondary leading-relaxed">
              {description || defaultDescription}
            </p>
          </div>
        </div>

        {/* Informative Callout Banner */}
        <div className="mb-6 rounded-2xl bg-isy-ivory/80 border border-isy-line p-3.5 text-[11px] sm:text-xs text-isy-text-secondary leading-relaxed flex items-center gap-2.5">
          <span className="text-base">⚡</span>
          <span>
            Pembaruan ini akan otomatis disinkronkan ke halaman katalog dan dapat langsung diakses pengunjung.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-isy-line">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-isy-line bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald transition-all active:scale-95"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-isy-green-bright" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
