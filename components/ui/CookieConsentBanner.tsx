"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "isy_cookie_consent_v1";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay so it appears smoothly after page load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is disabled
    }
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Pemberitahuan Cookie dan Privasi"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 select-none"
    >
      <div className="rounded-3xl border border-black/10 bg-white/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            We value your privacy
          </h3>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
        </div>

        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-5">
          Kami menggunakan cookies untuk meningkatkan pengalaman penelusuran Anda, memproses preferensi kacamata, dan menganalisis traffic situs sesuai{" "}
          <Link
            href="/kebijakan-privasi"
            className="text-isy-green-deep font-bold underline hover:text-isy-green-bright transition-colors"
          >
            Kebijakan Privasi
          </Link>{" "}
          Optik I See You. Dengan klik &ldquo;Accept All&rdquo;, Anda menyetujui penggunaan cookies kami.
        </p>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => handleConsent("rejected")}
            className="w-full rounded-2xl border-2 border-slate-900 bg-white py-3 px-4 text-xs font-black uppercase tracking-wider text-slate-900 transition-all hover:bg-slate-100 active:scale-95 cursor-pointer text-center"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => handleConsent("accepted")}
            className="w-full rounded-2xl border-2 border-slate-900 bg-slate-900 py-3 px-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-isy-green-deep hover:border-isy-green-deep active:scale-95 cursor-pointer text-center"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
