"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { useAdminNavigation } from "@/components/admin/navigation/AdminNavigationProvider";

export default function AdminEntryLoader() {
  const { phase, statusMessage, resetNavigation } = useAdminNavigation();
  const overlayRef = useRef<HTMLDivElement>(null);

  const isVisible =
    phase === "authenticating" ||
    phase === "redirecting" ||
    phase === "revealing" ||
    phase === "error";

  // Prevent background scroll while overlay is active
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isError = phase === "error";
  const isRevealing = phase === "revealing";

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F5ED] px-4 transition-all duration-300 ease-out ${
        isRevealing
          ? "opacity-0 pointer-events-none scale-[0.99]"
          : "opacity-100 pointer-events-auto scale-100"
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Brand Logo */}
        <div className="relative mb-6">
          <Image
            src="/logo.webp"
            alt="Optik I See You"
            width={170}
            height={52}
            className="h-11 w-auto object-contain drop-shadow-2xs"
            priority
          />
        </div>

        {/* State Card */}
        <div className="w-full rounded-2xl border border-isy-line bg-white/80 p-5 backdrop-blur-sm shadow-xs">
          {!isError ? (
            <>
              {/* Animated Hairline Emerald Progress Line */}
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-isy-mist border border-isy-line/60 mb-4">
                <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#124734] via-[#2FA84F] to-[#86EFAC] rounded-full animate-[progressIndeterminate_1.2s_ease-in-out_infinite] w-1/2" />
              </div>

              {/* Status Message */}
              <div className="flex items-center justify-center gap-2 text-isy-emerald">
                <ShieldCheck className="h-4 w-4 text-isy-green-bright animate-pulse" />
                <span className="text-xs font-bold tracking-wide">
                  {statusMessage ||
                    (phase === "authenticating"
                      ? "Memverifikasi akses..."
                      : "Mempersiapkan dashboard...")}
                </span>
              </div>

              <p className="mt-1 text-[11px] text-isy-text-secondary">
                Menghubungkan ke sistem otorisasi terpusat
              </p>
            </>
          ) : (
            <>
              {/* Timeout / Slow Connection Recovery Notice */}
              <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Koneksi Membutuhkan Waktu
                </span>
              </div>

              <p className="text-xs text-isy-text-secondary leading-relaxed mb-4">
                {statusMessage ||
                  "Koneksi jaringan tampak lambat. Anda dapat memuat ulang atau membatalkan untuk mencoba lagi."}
              </p>

              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-isy-emerald px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Muat Ulang Halaman</span>
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
