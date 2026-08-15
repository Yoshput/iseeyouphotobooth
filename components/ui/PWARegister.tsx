"use client";

import { useEffect } from "react";

/**
 * PWARegister — Service Worker registration (client component).
 * Registers /sw.js silently. No UI, just background plumbing.
 */
export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol === "https:" // only on HTTPS (or localhost)
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] SW registration failed:", err);
        });
    }
  }, []);

  return null;
}
