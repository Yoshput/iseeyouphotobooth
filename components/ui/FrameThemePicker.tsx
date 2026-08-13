"use client";

/**
 * FrameThemePicker.tsx
 * Full-screen branded overlay for choosing the frame theme/style.
 *
 * Dynamically re-renders theme thumbnails matching the user's selected photo layout (1, 2, 3, 4, 6 slots).
 * Filters out non-compatible themes (e.g. News Paper Editorial is only shown for 1 or 2 photo layouts).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import {
  FRAME_THEMES,
  getCompatibleThemes,
  type FrameTheme,
} from "@/lib/frameCompositor";
import type { FrameLayout } from "@/lib/frameLayouts";

interface FrameThemePickerProps {
  layout: FrameLayout;
  selectedThemeId: string;
  onSelect: (themeId: string) => void;
  onBack: () => void;
}

// ── Dynamic Visual Theme Mockup Component ─────────────────────────────────────

function VisualThemeMockup({
  theme,
  layout,
}: {
  theme: FrameTheme;
  layout: FrameLayout;
}) {
  const isVintageFilm = theme.id === "vintage-film-bw";
  const isNewspaper = theme.id === "newspaper-editorial";
  const isFrameKoran = theme.id === "frame-koran-custom";
  const isOpticalBlueprint = theme.id === "optical-blueprint";
  const isLensFlareGold = theme.id === "lens-flare-gold";
  const isStrip1x3 = layout.aspectRatioClass === "aspect-[1/3]";

  // Person SVG icon for slot placeholder
  const PersonIcon = ({ dark }: { dark?: boolean }) => (
    <svg
      className={`w-3.5 h-3.5 ${
        dark ? "text-stone-400" : isVintageFilm ? "text-white/40" : "text-isy-green-deep/30"
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  const slotBgClass = isVintageFilm
    ? "bg-[#222222] border-white/40 grayscale"
    : isNewspaper
    ? "bg-gradient-to-br from-stone-100 to-stone-200 border-[#1A1A1A]/40"
    : "bg-gradient-to-br from-emerald-100/90 to-emerald-200/70 border-emerald-400/30";

  const slotStyle = `relative rounded-[3px] flex items-center justify-center border ${slotBgClass} shadow-2xs overflow-hidden`;

  if (isNewspaper) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${
            isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
          } h-full w-full rounded-xl border border-[#1A1A1A]/40 bg-[#F9F8F6] p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:shadow-md`}
        >
          {/* Outer newspaper double border */}
          <div className="absolute inset-1 border border-[#1A1A1A]/20 pointer-events-none" />

          {/* Masthead */}
          <div className="text-center pb-1 border-b border-[#1A1A1A]/40">
            <span className="text-[6px] font-black uppercase tracking-wider text-[#1A1A1A] block leading-none">
              I SEE YOU GAZETTE
            </span>
            <span className="text-[4.5px] font-serif italic text-isy-green-deep block pt-0.5">
              See The Moment
            </span>
          </div>

          {/* Dynamic Slots for Newspaper (1 or 2 slots) */}
          <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden">
            {layout.id === "solo" ? (
              <div className={`${slotStyle} h-full w-full`}>
                <PersonIcon dark />
              </div>
            ) : (
              <div className="flex flex-col gap-1 h-full w-full">
                <div className={`${slotStyle} flex-1`}><PersonIcon dark /></div>
                <div className={`${slotStyle} flex-1`}><PersonIcon dark /></div>
              </div>
            )}
          </div>

          {/* Editorial Footer Columns */}
          <div className="pt-0.5 border-t border-[#1A1A1A]/40 flex items-center justify-between text-[5.5px] font-mono text-[#1A1A1A]">
            <span>VOL. 2026</span>
            <span className="font-bold text-isy-green-deep">@iseeyou.glasses</span>
          </div>
        </div>
      </div>
    );
  }

  // Frame Koran preview — use actual preview image asset
  if (isFrameKoran) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${
            isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
          } h-full w-full rounded-xl overflow-hidden shadow-xs transition-all duration-300 group-hover:shadow-md`}
        >
          <Image
            src="/frame photobooth/Frame Koran_preview.png"
            alt="Frame Koran Preview"
            fill
            className="object-cover"
            sizes="126px"
          />
        </div>
      </div>
    );
  }

  // Optical Blueprint mockup
  if (isOpticalBlueprint) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${
            isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
          } h-full w-full rounded-xl border border-[#00B4D8]/50 bg-[#0D1B2A] p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:shadow-[0_0_12px_rgba(0,180,216,0.3)]`}
        >
          {/* Blueprint grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(rgba(0,180,216,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.3) 1px, transparent 1px)",
            backgroundSize: "8px 8px"
          }} />

          {/* Glasses silhouette SVG */}
          <div className="flex justify-center pt-0.5 z-10">
            <svg viewBox="0 0 80 28" className="w-14 h-auto">
              <ellipse cx="20" cy="14" rx="14" ry="9" fill="none" stroke="#00B4D8" strokeWidth="1.2" />
              <ellipse cx="60" cy="14" rx="14" ry="9" fill="none" stroke="#00B4D8" strokeWidth="1.2" />
              <path d="M34 11 Q40 6 46 11" fill="none" stroke="#00B4D8" strokeWidth="1.2" />
              <line x1="0" y1="11" x2="6" y2="12" stroke="#00B4D8" strokeWidth="1.2" />
              <line x1="74" y1="11" x2="80" y2="12" stroke="#00B4D8" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Slots */}
          <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden z-10">
            {layout.slots.slice(0, Math.min(layout.numPhotos, 4)).map((_, i) => (
              <div key={i} className="flex-1 rounded-[2px] border border-[#00B4D8]/40 bg-[#0A2540] flex items-center justify-center">
                <span className="text-[5px] font-mono text-[#00B4D8]/60">{String(i+1).padStart(2,"0")}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-0.5 border-t border-[#00B4D8]/30 z-10">
            <span className="text-[5px] font-mono text-[#00B4D8]/70 block text-center">OPTIK I SEE YOU</span>
          </div>
        </div>
      </div>
    );
  }

  // Lens Flare Gold mockup
  if (isLensFlareGold) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${
            isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
          } h-full w-full rounded-xl border border-[#D4AF37]/40 bg-[#0A0A0A] p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]`}
        >
          {/* Bokeh rings */}
          <div className="absolute top-2 left-2 w-12 h-12 rounded-full border border-[#D4AF37]/15 pointer-events-none" />
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full border border-[#D4AF37]/10 pointer-events-none" />
          <div className="absolute bottom-4 right-2 w-10 h-10 rounded-full border border-[#D4AF37]/15 pointer-events-none" />
          <div className="absolute -top-2 right-3 w-14 h-14 rounded-full border border-[#D4AF37]/08 pointer-events-none" />

          {/* Header */}
          <div className="text-center pb-1 border-b border-[#D4AF37]/30 z-10">
            <span className="text-[6px] font-serif italic text-[#D4AF37] block leading-none">Optik I See You</span>
            <span className="text-[4.5px] text-[#FFF8DC]/50 block">Est. Optical Quality</span>
          </div>

          {/* Slots */}
          <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden z-10">
            {layout.slots.slice(0, Math.min(layout.numPhotos, 4)).map((_, i) => (
              <div key={i} className="flex-1 rounded-[3px] border border-[#D4AF37]/30 bg-[#111100] flex items-center justify-center">
                <svg className="w-3 h-3 text-[#D4AF37]/30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-0.5 border-t border-[#D4AF37]/30 z-10">
            <span className="text-[5px] font-serif italic text-[#D4AF37]/80 block text-center">@iseeyou.glasses</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[180px] w-full items-center justify-center py-1">
      <div
        className={`relative ${
          isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
        } h-full w-full rounded-xl border p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:shadow-md ${
          isVintageFilm ? "bg-[#141414] border-[#333333]" : "bg-white border-isy-line"
        }`}
      >
        {/* Vintage Film Sprocket Holes overlay on left/right */}
        {isVintageFilm && (
          <>
            <div className="absolute left-0.5 top-0 bottom-0 flex flex-col justify-between py-1 z-10 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-2 w-1 rounded-[1px] bg-[#020202] border border-white/20" />
              ))}
            </div>
            <div className="absolute right-0.5 top-0 bottom-0 flex flex-col justify-between py-1 z-10 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-2 w-1 rounded-[1px] bg-[#020202] border border-white/20" />
              ))}
            </div>
          </>
        )}

        {/* Mini Frame Header */}
        <div
          className={`flex items-center justify-between pb-1 ${
            isVintageFilm ? "border-b border-white/10" : "border-b border-isy-line/60"
          }`}
        >
          <span
            className={`text-[6.5px] font-black uppercase tracking-wider ${
              isVintageFilm ? "text-[#D4AF37]" : "text-isy-green-deep"
            }`}
          >
            {isVintageFilm ? "35MM FILM" : "I SEE YOU"}
          </span>
          <span
            className={`text-[6px] font-extrabold ${
              isVintageFilm ? "text-white/60" : "text-isy-green-bright"
            }`}
          >
            {isVintageFilm ? "B&W" : "AR"}
          </span>
        </div>

        {/* Dynamic Slot Layout according to layout.id */}
        <div className={`my-1 flex-1 flex flex-col gap-1 overflow-hidden ${isVintageFilm ? "px-1.5" : ""}`}>
          {layout.id === "solo" && (
            <div className={`${slotStyle} h-full w-full`}><PersonIcon /></div>
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

          {layout.id === "quartet_strip" && (
            <div className="flex flex-col gap-1 h-full w-full">
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
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

          {layout.id === "sextet_grid" && (
            <div className="flex flex-col gap-1 h-full w-full">
              <div className="flex gap-1 flex-1 w-full">
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
                <div className={`${slotStyle} flex-1`}><PersonIcon /></div>
              </div>
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
        <div
          className={`pt-0.5 text-center ${
            isVintageFilm ? "border-t border-white/10" : "border-t border-isy-line/60"
          }`}
        >
          <span
            className={`text-[6px] font-extrabold ${
              isVintageFilm ? "text-[#FF9900]" : "text-isy-green-deep/70"
            }`}
          >
            {isVintageFilm ? "'26 08 08" : "@iseeyou.glasses"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Theme Card Component ───────────────────────────────────────────────────

function ThemeCard({
  theme,
  layout,
  isSelected,
  onSelect,
}: {
  theme: FrameTheme;
  layout: FrameLayout;
  isSelected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      id={`theme-pick-${theme.id}`}
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

      {/* Retro / Custom Badge */}
      {theme.badge && (
        <span className="self-start rounded-full bg-isy-green-bright/10 px-2 py-0.5 text-[9px] font-black uppercase text-isy-green-bright border border-isy-green-bright/30 z-10">
          {theme.badge}
        </span>
      )}

      {/* Visual Thumbnail matching the user's selected photo count layout */}
      <VisualThemeMockup theme={theme} layout={layout} />

      {/* Title & Description */}
      <div className="flex flex-col items-center text-center space-y-1 w-full pt-1">
        <span className="text-xs font-black text-isy-green-deep group-hover:text-isy-green-bright transition-colors leading-tight">
          {theme.name}
        </span>

        {theme.description && (
          <span className="text-[10px] text-isy-ink/60 font-medium line-clamp-2 leading-tight">
            {theme.description}
          </span>
        )}
      </div>
    </button>
  );
}

// ── Main FrameThemePicker Component ─────────────────────────────────────────

export default function FrameThemePicker({
  layout,
  selectedThemeId,
  onSelect,
  onBack,
}: FrameThemePickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Filter themes compatible with the user's chosen layout photo count!
  const availableThemes = useMemo(() => getCompatibleThemes(layout), [layout]);

  const initialThemeId = useMemo(() => {
    const isCurrentValid = availableThemes.some((t) => t.id === selectedThemeId);
    return isCurrentValid ? selectedThemeId : availableThemes[0]?.id || "classic-white";
  }, [availableThemes, selectedThemeId]);

  const [activeThemeId, setActiveThemeId] = useState<string>(initialThemeId);

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
  }, [availableThemes]);

  const handleChooseTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    onSelect(themeId);
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-isy-white"
    >
      {/* Brand Header */}
      <div className="relative flex shrink-0 flex-col items-center bg-isy-green-deep px-6 pt-7 pb-5 shadow-sm">
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
          Gaya Foto
        </button>

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

      {/* Grid of Theme Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 text-center max-w-md mx-auto space-y-1">
          <h2 className="font-serif text-2xl font-black text-isy-green-deep tracking-tight">
            PILIH TEMA FRAME
          </h2>
          <p className="text-xs text-isy-ink/65 font-medium">
            Tema yang tersedia disesuaikan dengan pilihan layout{" "}
            <span className="font-extrabold text-isy-green-deep">
              {layout.label} ({layout.numPhotos} Foto)
            </span>
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 max-w-4xl mx-auto pb-6 items-stretch"
        >
          {availableThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              layout={layout}
              isSelected={activeThemeId === theme.id}
              onSelect={() => handleChooseTheme(theme.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
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
