"use client";

/**
 * FramePicker.tsx · Optik I See You Photobooth
 * Screen A: Modern Editorial Layout Selection
 *
 * Displays realistic visual mini mockups matching real physical photobooth ratios:
 * - 1:3 slender ratio for 2×6 inch strips (trio_vert)
 * - 2:3 ratio for 4×6 inch photo cards (solo, trio_grid, quartet_grid)
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
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

  // Clean studio photo placeholder style
  const slotStyle =
    "relative rounded-sm bg-[#EFEFEA] border border-[#DCE3DC] flex items-center justify-center overflow-hidden shadow-2xs transition-transform duration-300 group-hover:scale-[1.01]";

  const PersonIcon = () => (
    <svg className="w-3.5 h-3.5 text-[#103F31]/30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  return (
    <div className="flex h-[180px] sm:h-[190px] w-full items-center justify-center py-1">
      <div
        className={`relative ${
          isStrip1x3 ? "aspect-[1/3] max-w-[80px]" : "aspect-[2/3] max-w-[130px]"
        } h-full w-full rounded-xl border border-[#DDE8E1] bg-white p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:border-[#103F31]/50 group-hover:shadow-md`}
      >
        {/* Mini Frame Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#E5E9E4]">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#103F31]" />
            <span
              className={`${
                isStrip1x3 ? "text-[6px]" : "text-[7.5px]"
              } font-semibold uppercase tracking-wider text-[#103F31]`}
            >
              I SEE YOU
            </span>
          </div>
          {!isStrip1x3 && (
            <span className="text-[6.5px] font-bold text-[#27A35B] uppercase tracking-wide">STUDIO</span>
          )}
        </div>

        {/* Slot Grid Replicas according to layout.id */}
        <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden">
          {layout.id === "solo" && (
            <div className={`${slotStyle} h-full w-full`}>
              <PersonIcon />
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
        <div className="pt-0.5 border-t border-[#E5E9E4] text-center">
          <span className="text-[6px] font-medium text-[#68756D] tracking-tight">
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
        group relative flex flex-col items-center justify-between gap-2.5 rounded-2xl
        p-3.5 shadow-xs transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        active:scale-[0.98] text-left cursor-pointer
        ${
          isSelected
            ? "border-2 border-[#103F31] bg-[#103F31]/5 shadow-md ring-2 ring-[#103F31]/15"
            : "border border-[#DDE8E1] bg-white hover:border-[#103F31]/40 hover:bg-[#F8F7F3]"
        }
      `}
    >
      {/* Selected Badge */}
      {isSelected && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#103F31] text-white shadow-sm z-10 animate-in zoom-in-50 duration-200">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      )}

      {/* Print Standard Badge */}
      <span className="self-start rounded-md bg-[#F0F4F1] px-2 py-0.5 text-[10px] font-semibold text-[#103F31] border border-[#DDE8E1]">
        {isStrip ? "2×6 Strip (1:3)" : "4×6 Card (2:3)"}
      </span>

      {/* Visual Mockup Thumbnail with Real Aspect Ratio */}
      <VisualFrameMockup layout={layout} />

      {/* Label and Info */}
      <div className="flex flex-col items-center text-center space-y-1 w-full pt-1">
        <span className="text-xs sm:text-sm font-semibold text-[#18251F] group-hover:text-[#103F31] transition-colors leading-tight">
          {layout.label} · {layout.sublabel}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F4F1] px-2.5 py-0.5 text-[10px] font-medium text-[#103F31] border border-[#DDE8E1]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#27A35B]" />
          {layout.numPhotos} Pose Foto
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
      if (cardsRef.current && cardsRef.current.children.length > 0) {
        const cards = Array.from(cardsRef.current.children);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 14, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
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
      className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-[#F8F7F3] text-[#18251F]"
    >
      {/* Brand Header */}
      <header className="relative flex shrink-0 items-center justify-between border-b border-[#DDE8E1] bg-white px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-[#DDE8E1] bg-[#F8F7F3] px-3 py-1.5 text-xs font-medium text-[#68756D] hover:text-[#103F31] hover:bg-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          )}
          <Image
            src="/logo.png"
            alt="Optik I See You"
            width={105}
            height={36}
            className="h-6 w-auto object-contain"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-md border border-[#103F31]/15 bg-[#103F31]/5 px-2.5 py-1 text-xs font-semibold text-[#103F31]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#27A35B]" />
          <span>Langkah 1 dari 2</span>
        </div>
      </header>

      {/* Grid of Layout Cards */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center max-w-lg mx-auto space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#18251F] tracking-tight">
            Pilih Format Foto
          </h1>
          <p className="text-xs sm:text-sm text-[#68756D]">
            Pilih rasio cetak photobooth studio: 2×6 inch Strip vertikal atau 4×6 inch Card polaroid.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-4 max-w-4xl mx-auto pb-6 items-stretch"
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
      <footer className="flex shrink-0 items-center justify-between border-t border-[#DDE8E1] bg-white px-4 sm:px-6 py-3 text-xs text-[#68756D]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#27A35B]" />
          <span className="font-semibold text-[#103F31]">@iseeyou.glasses</span>
        </div>
        <span className="text-[11px] text-[#68756D]">Studio Photobooth</span>
      </footer>
    </div>
  );
}
