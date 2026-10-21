"use client";

import { useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen || isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-isy-line transition-all scale-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-lg p-2 text-isy-text-secondary hover:bg-isy-mist min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label="Tutup dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
              confirmVariant === "danger"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-isy-mist text-isy-emerald border border-isy-line"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="pr-6">
            <h3 id="confirm-modal-title" className="text-base font-bold text-isy-emerald">
              {title}
            </h3>
            <p id="confirm-modal-desc" className="mt-1 text-xs sm:text-sm text-isy-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-isy-line">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-isy-line bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-isy-text-primary hover:bg-isy-mist transition-colors min-h-[44px] touch-manipulation"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors min-h-[44px] touch-manipulation ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-isy-emerald hover:bg-isy-emerald-hover"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
