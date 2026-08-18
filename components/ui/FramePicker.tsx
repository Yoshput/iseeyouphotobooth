"use client";

/**
 * FramePicker.tsx
 * Full-screen branded overlay for choosing the photo layout.
 *
 * Displays realistic visual mini mockups matching real physical photobooth ratios:
 * - 1:3 slender ratio for 2×6 inch strips (duo_vert, trio_vert, quartet_strip)
 * - 2:3 ratio for 4×6 inch photo cards (solo, trio_grid, quartet_grid, sextet_grid)
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { FRAME_LAYOUTS, type FrameLayout } from "@/lib/frameLayouts";

interface FramePickerProps {
  onSelect: (layout: FrameLayout) => void;
  onBack?: () => void;
  selectedLayoutId?: string;
}

// ── Realistic Physical Ratio Frame Mockup Component ────────────────────────

function VisualFrameMockup({ layout }: { layout: FrameLayout }) {
  const isStrip1x3 = layout.aspectRatioClass === "aspect-[1/3]";

  // Soft photo placeholder style with subtle gradient & border
  const slotStyle =
    "relative rounded-[3px] bg-gradient-to-br from-emerald-100/90 via-teal-50 to-emerald-200/70 border border-emerald-400/30 flex items-center justify-center overflow-hidden shadow-2xs transition-transform duration-300 group-hover:scale-[1.01]";

  const PersonIcon = () => (
    <svg className="w-3 h-3 text-isy-green-deep/35" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  return (
    <div className="flex h-[180px] w-full items-center justify-center py-1">
      <div
        className={`relative ${
          isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
        } h-full w-full rounded-xl border border-isy-line bg-white p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:border-isy-green-bright/60 group-hover:shadow-md`}
      >
        {/* Mini Frame Header */}
        <div className="flex items-center justify-between pb-1 border-b border-isy-line/60">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
            <span
              className={`${
                isStrip1x3 ? "text-[6px]" : "text-[7.5px]"
              } font-black uppercase tracking-wider text-isy-green-deep`}
            >
              I SEE YOU
            </span>
          </div>
          {!isStrip1x3 && (
            <span className="text-[6.5px] font-extrabold text-isy-green-bright uppercase">AR</span>
          )}
        </div>

        {/* Slot Grid Replicas according to layout.id */}
        <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden">
          {layout.id === "solo" && (
            <div className={`${slotStyle} h-full w-full`}>
              <PersonIcon />
            </div>
          )}

          {layout.id === "duo_vert" && (
            <div className="flex flex-col gap-1 h-full w-full">
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
            </div>
          )}

          {layout.id === "trio_vert" && (
            <div className="flex flex-col gap-1 h-full w-full">
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
            </div>
          )}

          {layout.id === "trio_grid" && (
            <div className="flex flex-col gap-1 h-full w-full">
              <div className={`${slotStyle} h-[52%] w-full`}><PersonIcon /></div>
              <div className="flex gap-1 h-[44%] w-full">
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              </div>
            </div>
          )}

          {layout.id === "quartet_grid" && (
            <div className="flex flex-col gap-1 h-full w-full">
              <div className="flex gap-1 flex-1 w-full">
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              </div>
              <div className="flex gap-1 flex-1 w-full">
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              </div>
            </div>
          )}
        </div>

        {/* Mini Frame Footer */}
        <div className="pt-0.5 border-t border-isy-line/60 text-center">
          <span className="text-[6px] font-extrabold text-isy-green-deep/70 tracking-tight">
            @iseeyou.glasses
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Layout Card Component ───────────────────────────────────────────────────

function LayoutCard({
  layout,
  isSelected,
  onSelect,
}: {
  layout: FrameLayout;
  isSelected?: boolean;
  onSelect: () => void;
}) {
  const isStrip = layout.aspectRatioClass === "aspect-[1/3]";

  return (
    <button
      id={`frame-pick-${layout.id}`}
      onClick={onSelect}
      className={`
        group relative flex flex-col items-center justify-between gap-2 rounded-2xl
        bg-white p-3.5 shadow-xs transition-all duration-300
        hover:-translate-y-1 hover:border-isy-green-bright/60 hover:shadow-lg
        active:scale-[0.97] text-left cursor-pointer
        ${
          isSelected
            ? "border-2 border-isy-green-bright bg-isy-green-bright/5 shadow-md scale-[1.02]"
            : "border border-isy-line"
        }
      `}
    >
      {/* Selected Badge */}
      {isSelected && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-isy-green-bright text-white shadow-md text-xs font-black z-10 animate-in zoom-in-50 duration-200">
          ✓
        </span>
      )}

      {/* Print Standard Badge */}
      <span className="self-start rounded-md bg-isy-mist px-2 py-0.5 text-[9px] font-extrabold text-isy-green-deep border border-isy-line">
        {isStrip ? "2×6 Strip (1:3)" : "4×6 Card (2:3)"}
      </span>

      {/* Visual Mockup Thumbnail with Real Aspect Ratio */}
      <VisualFrameMockup layout={layout} />

      {/* Label and Info */}
      <div className="flex flex-col items-center text-center space-y-1 w-full pt-1">
        <span className="text-xs font-black text-isy-green-deep group-hover:text-isy-green-bright transition-colors leading-tight">
          {layout.label} / {layout.sublabel}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-isy-mist px-2.5 py-0.5 text-[10px] font-extrabold text-isy-green-deep border border-isy-line">
          <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
          {layout.numPhotos} Foto
        </span>
      </div>
    </button>
  );
}

// ── Main FramePicker Overlay ─────────────────────────────────────────────────

export default function FramePicker({
  onSelect,
  onBack,
  selectedLayoutId,
}: FramePickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | undefined>(selectedLayoutId);

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

  const handleChoose = (layout: FrameLayout) => {
    setActiveId(layout.id);
    onSelect(layout);
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-isy-white"
    >
      {/* Brand Header */}
      <div className="relative flex shrink-0 flex-col items-center bg-isy-green-deep px-6 pt-7 pb-5 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/20 transition-colors active:scale-95"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
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
        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-isy-green-bright">
          AR Photobooth
        </p>
      </div>

      {/* Grid of Layout Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 text-center max-w-md mx-auto space-y-1">
          <h2 className="font-serif text-2xl font-black text-isy-green-deep tracking-tight">
            PILIH GAYA FOTO
          </h2>
          <p className="text-xs text-isy-ink/65 font-medium">
            Rasio cetak standar photobooth fisik: Strip 2×6 inch (1:3) & Card 4×6 inch (2:3)
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 max-w-5xl mx-auto pb-6 items-stretch"
        >
          {FRAME_LAYOUTS.map((layout) => (
            <LayoutCard
              key={layout.id}
              isSelected={activeId === layout.id}
              layout={layout}
              onSelect={() => handleChoose(layout)}
            />
          ))}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-isy-line bg-isy-mist px-6 py-3 text-xs text-isy-ink/60">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-isy-green-bright animate-pulse" />
          <span className="font-bold text-isy-green-deep">@iseeyou.glasses</span>
        </div>
        <span className="text-[11px] font-semibold text-isy-ink/40">Optik I See You</span>
      </div>
    </div>
  );
}
