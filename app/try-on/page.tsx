"use client";

/**
 * app/try-on/page.tsx · Optik I See You
 * Dedicated route for Real-time AR Eyewear Virtual Try-On (2D AR Mode).
 * Product-first UX inspired by Heykama with shared camera & FaceTracker engine.
 */

import { Suspense } from "react";
import TryOnExperience from "@/components/try-on/TryOnExperience";

export default function TryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-isy-green-bright border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-isy-ink/70">Menyiapkan Virtual Try-On...</p>
          </div>
        </div>
      }
    >
      <TryOnExperience />
    </Suspense>
  );
}
