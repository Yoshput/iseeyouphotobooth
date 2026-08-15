"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWAInstallPrompt — Smart install banner.
 *
 * - Chrome/Edge/Android: shows native "Add to Home Screen" prompt
 * - Safari iOS: shows manual instruction card (iOS doesn't support beforeinstallprompt)
 * - Auto-hides if already installed (display-mode: standalone)
 * - Dismissible and won't re-appear until next session
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as standalone — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // User already dismissed this session
    if (sessionStorage.getItem("pwa-dismissed")) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const ios =
      /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    setIsIOS(ios);

    if (ios) {
      // iOS: show instruction card after 4 seconds
      const t = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(t);
    }

    // Chrome/Edge/Android: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (!showBanner || dismissed) return null;

  // ── iOS Safari: manual instruction ──────────────────────────────────────
  if (isIOS) {
    return (
      <div
        className="fixed bottom-0 inset-x-0 z-[200] animate-in slide-in-from-bottom duration-500"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="dialog"
        aria-label="Pasang aplikasi"
      >
        <div className="mx-4 mb-4 rounded-3xl bg-white border border-isy-line shadow-2xl shadow-isy-green-deep/15 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-isy-line px-5 py-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-isy-line shadow-sm">
              <Image src="/icon-192.png" alt="I See You" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm font-black text-isy-green-deep">Pasang sebagai Aplikasi</p>
              <p className="text-[11px] text-isy-ink/50 font-medium">Optik I See You</p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/50 hover:bg-isy-line transition-colors"
              aria-label="Tutup"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Steps */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-isy-ink/60 leading-relaxed">
              Untuk memasang di iPhone / iPad:
            </p>
            <div className="space-y-2.5">
              {[
                { num: 1, text: "Ketuk ikon", icon: "share" },
                { num: 2, text: '"Tambahkan ke Layar Utama"', icon: "plus" },
                { num: 3, text: "Ketuk Tambah di pojok kanan atas", icon: "check" },
              ].map(({ num, text, icon }) => (
                <div key={num} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-isy-green-bright text-[10px] font-black text-white">
                    {num}
                  </span>
                  <span className="text-xs font-semibold text-isy-ink/70 flex items-center gap-1.5">
                    {text}
                    {icon === "share" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow pointing to Safari share button */}
          <div className="text-center py-3 border-t border-isy-line bg-isy-mist/50">
            <p className="text-[10px] font-bold text-isy-ink/40 uppercase tracking-widest">
              Cari ikon ↑ di bawah Safari
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Chrome / Android / Edge: native prompt ───────────────────────────────
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[200] animate-in slide-in-from-bottom duration-500"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      role="dialog"
      aria-label="Pasang aplikasi"
    >
      <div className="mx-4 mb-4 rounded-3xl bg-white border border-isy-line shadow-2xl shadow-isy-green-deep/15 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-isy-line shadow-sm">
            <Image src="/icon-192.png" alt="I See You" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-black text-isy-green-deep leading-tight">
              Pasang sebagai Aplikasi
            </p>
            <p className="text-[11px] text-isy-ink/50 font-medium">
              Buka katalog lebih cepat — tanpa buka browser
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-isy-mist text-isy-ink/50 hover:bg-isy-line transition-colors"
            aria-label="Nanti saja"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-5 pb-5 flex gap-2.5">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-2xl border border-isy-line bg-isy-mist py-3 text-xs font-bold text-isy-ink/60 hover:bg-isy-line transition-colors"
          >
            Nanti Saja
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-isy-green-bright py-3 text-xs font-black text-white shadow-md hover:bg-isy-green-deep transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Pasang Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
}
