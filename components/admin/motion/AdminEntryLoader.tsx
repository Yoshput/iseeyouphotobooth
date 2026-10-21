"use client";

import React, { useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { useAdminNavigation } from "@/components/admin/navigation/AdminNavigationProvider";

export default function AdminEntryLoader() {
  const { phase, statusMessage, resetNavigation } = useAdminNavigation();
  const bodyScrollRef = useRef<string>("");

  const isVisible =
    phase === "authenticating" ||
    phase === "redirecting" ||
    phase === "revealing" ||
    phase === "error";

  const isError = phase === "error";
  const isExiting = phase === "revealing";

  // Prevent body scroll while overlay is visible, restore on cleanup
  useEffect(() => {
    if (isVisible && !isExiting) {
      bodyScrollRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = bodyScrollRef.current || "";
    }
    return () => {
      document.body.style.overflow = bodyScrollRef.current || "";
    };
  }, [isVisible, isExiting]);

  const statusText = useMemo(() => {
    if (statusMessage) return statusMessage;
    if (phase === "authenticating") return "Memverifikasi akses...";
    if (phase === "redirecting") return "Mempersiapkan dashboard...";
    return "Memuat...";
  }, [phase, statusMessage]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={statusText}
      className={[
        "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F5ED] px-4",
        "transition-all duration-300 ease-out",
        isExiting
          ? "opacity-0 pointer-events-none scale-[0.99]"
          : "opacity-100 pointer-events-auto scale-100",
      ].join(" ")}
    >
      <div className="flex flex-col items-center text-center max-w-sm mx-auto w-full">
        {/* Brand Logo */}
        <div className="mb-6">
          <Image
            src="/logo.webp"
            alt="Optik I See You"
            width={160}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* State Card */}
        <div className="w-full rounded-2xl border border-isy-line bg-white/80 p-5 shadow-xs backdrop-blur-sm">
          {!isError ? (
            <>
              {/* Hairline indeterminate loader */}
              <div
                role="progressbar"
                aria-label="Memuat..."
                aria-valuetext={statusText}
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-isy-mist border border-isy-line/60 mb-4"
              >
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#124734] via-[#2FA84F] to-[#86EFAC] rounded-full animate-[progressIndeterminate_1.4s_ease-in-out_infinite]" />
              </div>

              <div className="flex items-center justify-center gap-2 text-isy-emerald">
                <ShieldCheck className="h-4 w-4 text-isy-green-bright shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold tracking-wide">{statusText}</span>
              </div>

              <p className="mt-1 text-[11px] text-isy-text-secondary">
                Menghubungkan ke sistem otorisasi terpusat
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Koneksi Membutuhkan Waktu
                </span>
              </div>

              <p className="text-xs text-isy-text-secondary leading-relaxed mb-4">
                {statusMessage ||
                  "Koneksi jaringan tampak lambat. Muat ulang halaman atau tutup dan coba lagi."}
              </p>

              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-isy-emerald px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Muat Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={resetNavigation}
                  className="rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs font-semibold text-isy-text-primary hover:bg-isy-mist transition-colors"
                >
                  Tutup
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
