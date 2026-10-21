"use client";

/**
 * AdminToast — Shared accessible toast notification component.
 * 
 * Drop-in replacement for the ad-hoc toast pattern used across admin modules.
 * Uses role="status" for success (polite) and role="alert" for errors (assertive).
 * 
 * Usage:
 *   const [toast, setToast] = useAdminToast();
 *   showToast("Berhasil disimpan", "success");
 *   <AdminToast toast={toast} />
 */

import React, { useEffect, useRef } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string;
  type: ToastType;
  id: number; // unique key for re-triggering on same message
}

interface AdminToastProps {
  toast: ToastState | null;
  onDismiss?: () => void;
  durationMs?: number;
}

export default function AdminToast({
  toast,
  onDismiss,
  durationMs = 3500,
}: AdminToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast || !onDismiss) return;
    // Clear any previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onDismiss();
      timerRef.current = null;
    }, durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast?.id, durationMs, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div
      // role="status" for non-urgent (success/info), role="alert" for errors
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      className={[
        "fixed bottom-6 right-4 sm:right-6 z-[9999] flex items-center gap-3",
        "rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold shadow-xl border",
        "max-w-[calc(100vw-2rem)] sm:max-w-sm",
        "animate-in slide-in-from-bottom-4 fade-in-50 duration-200",
        isSuccess
          ? "bg-emerald-50 text-emerald-900 border-emerald-200"
          : isError
          ? "bg-red-50 text-red-900 border-red-200"
          : "bg-blue-50 text-blue-900 border-blue-200",
      ].join(" ")}
    >
      {/* Icon */}
      <span className="shrink-0" aria-hidden="true">
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : isError ? (
          <XCircle className="h-4 w-4 text-red-600" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
        )}
      </span>

      {/* Message */}
      <span className="flex-1 leading-snug">{toast.message}</span>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={[
            "shrink-0 rounded-lg p-1 transition-colors",
            isSuccess
              ? "text-emerald-600/60 hover:text-emerald-900 hover:bg-emerald-100"
              : isError
              ? "text-red-600/60 hover:text-red-900 hover:bg-red-100"
              : "text-blue-600/60 hover:text-blue-900 hover:bg-blue-100",
          ].join(" ")}
          aria-label="Tutup notifikasi"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * useAdminToast — convenience hook to manage toast state with unique IDs.
 * 
 * @example
 * const { toast, showToast, dismissToast } = useAdminToast();
 * showToast("Berhasil!", "success");
 * <AdminToast toast={toast} onDismiss={dismissToast} />
 */
export function useAdminToast() {
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const counterRef = useRef(0);

  const showToast = React.useCallback(
    (message: string, type: ToastType = "success") => {
      counterRef.current += 1;
      setToast({ message, type, id: counterRef.current });
    },
    []
  );

  const dismissToast = React.useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}
