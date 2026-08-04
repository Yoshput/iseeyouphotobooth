"use client";

/**
 * FramePicker.tsx
 * Full-screen branded overlay for choosing the photo layout.
 *
 * Supports 7 layout variations matching PoseSnap style.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { FRAME_LAYOUTS, type FrameLayout } from "@/lib/frameLayouts";

interface FramePickerProps {
 onSelect: (layout: FrameLayout) => void;
 onBack?: () => void;
}

// ── Tiny slot-preview grid (pure CSS/div) ───────────────────────────────────

function SlotPreview({ id }: { id: string }) {
 const cell = "rounded-[2px] bg-white/60 flex-1";

 if (id === "solo") {
 return (
 <div className="flex h-12 w-10 p-0.5">
 <div className={`${cell} w-full`} />
 </div>
 );
 }

 if (id === "duo_vert") {
 return (
 <div className="flex h-12 w-10 flex-col gap-[3px] p-0.5">
 <div className={cell} />
 <div className={cell} />
 </div>
 );
 }

 if (id === "trio_vert") {
 return (
 <div className="flex h-12 w-10 flex-col gap-[2px] p-0.5">
 <div className={cell} />
 <div className={cell} />
 <div className={cell} />
 </div>
 );
 }

 if (id === "trio_grid") {
 return (
 <div className="flex h-12 w-10 flex-col gap-[2px] p-0.5">
 <div className="rounded-[2px] bg-white/60" style={{ flex: "0 0 52%" }} />
 <div className="flex flex-1 gap-[2px]">
 <div className={cell} />
 <div className={cell} />
 </div>
 </div>
 );
 }

 if (id === "quartet_strip") {
 return (
 <div className="flex h-12 w-10 flex-col gap-[2px] p-0.5">
 <div className={cell} />
 <div className={cell} />
 <div className={cell} />
 <div className={cell} />
 </div>
 );
 }

 if (id === "quartet_grid") {
 return (
 <div className="flex h-12 w-10 flex-col gap-[2px] p-0.5">
 <div className="flex flex-1 gap-[2px]">
 <div className={cell} />
 <div className={cell} />
 </div>
 <div className="flex flex-1 gap-[2px]">
 <div className={cell} />
 <div className={cell} />
 </div>
 </div>
 );
 }

 if (id === "sextet_grid") {
 return (
 <div className="flex h-12 w-10 flex-col gap-[2px] p-0.5">
 <div className="flex flex-1 gap-[2px]">
 <div className={cell} />
 <div className={cell} />
 </div>
 <div className="flex flex-1 gap-[2px]">
 <div className={cell} />
 <div className={cell} />
 </div>
 <div className="flex flex-1 gap-[2px]">
 <div className={cell} />
 <div className={cell} />
 </div>
 </div>
 );
 }

 return <div className="flex h-12 w-10 bg-white/40 rounded" />;
}

// ── Layout card ───────────────────────────────────────────────────────────────

function LayoutCard({
 layout,
 onSelect,
}: {
 layout: FrameLayout;
 onSelect: () => void;
}) {
 return (
 <button
 id={`frame-pick-${layout.id}`}
 onClick={onSelect}
 className="
 group flex flex-col items-center gap-2 rounded-2xl
 border border-isy-line bg-white p-3.5
 shadow-sm transition-all duration-200
 hover:border-isy-green-bright hover:shadow-md
 active:scale-[0.96]
 "
 >
 <div className="flex h-14 w-12 items-center justify-center rounded-xl bg-isy-green-deep p-1.5 shadow-inner">
 <SlotPreview id={layout.id} />
 </div>

 <div className="flex flex-col items-center">
 <span className="text-xs font-black text-isy-green-deep">{layout.label}</span>
 <span className="text-[10px] text-isy-ink/50">{layout.sublabel}</span>
 </div>

 <span className="flex items-center gap-1 rounded-full bg-isy-green-bright/10 px-2 py-0.5 text-[10px] font-bold text-isy-green-bright">
 <span className="inline-block h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
 {layout.numPhotos} foto
 </span>
 </button>
 );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function FramePicker({ onSelect, onBack }: FramePickerProps) {
 const overlayRef = useRef<HTMLDivElement>(null);
 const cardsRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const ctx = gsap.context(() => {
 if (overlayRef.current) {
 gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
 }
 if (cardsRef.current) {
 const cards = Array.from(cardsRef.current.children);
 gsap.fromTo(
 cards,
 { opacity: 0, y: 16, scale: 0.96 },
 {
 opacity: 1,
 y: 0,
 scale: 1,
 duration: 0.35,
 stagger: 0.05,
 ease: "power2.out",
 }
 );
 }
 });
 return () => ctx.revert();
 }, []);

 return (
 <div
 ref={overlayRef}
 className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-isy-white"
 >
 {/* Brand header */}
 <div className="relative flex shrink-0 flex-col items-center bg-isy-green-deep px-6 pt-7 pb-5">
 {onBack && (
 <button
 onClick={onBack}
 className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 transition-colors active:scale-95"
 >
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
 <path d="M15 18l-6-6 6-6" />
 </svg>
 Home
 </button>
 )}
 <Image
 src="/logo.png"
 alt="Optik I See You"
 width={180}
 height={70}
 className="h-11 w-auto brightness-0 invert"
 priority
 />
 <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
 AR Photobooth
 </p>
 </div>

 {/* Grid of layout cards */}
 <div className="flex-1 overflow-y-auto px-6 py-6">
 <div className="mb-4 text-center">
 <h2 className="font-serif text-xl font-black text-isy-green-deep">
 PILIH GAYA FOTO
 </h2>
 <p className="mt-0.5 text-xs text-isy-ink/60">
 Sendiri atau rame-rame? 
 </p>
 </div>

 <div
 ref={cardsRef}
 className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 max-w-2xl mx-auto"
 >
 {FRAME_LAYOUTS.map((layout) => (
 <LayoutCard
 key={layout.id}
 layout={layout}
 onSelect={() => onSelect(layout)}
 />
 ))}
 </div>
 </div>

 {/* Footer link */}
 <div className="flex shrink-0 items-center justify-between border-t border-isy-line bg-isy-mist px-6 py-3 text-xs text-isy-ink/60">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-isy-green-bright/10 text-isy-green-bright">
 
 </span>
 <span className="font-semibold text-isy-green-deep">@iseeyou.glasses</span>
 </div>
 <span className="text-[11px] text-isy-ink/40">Optik I See You</span>
 </div>
 </div>
 );
}
