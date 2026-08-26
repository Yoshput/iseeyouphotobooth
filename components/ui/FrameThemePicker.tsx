"use client";

/**
 * FrameThemePicker.tsx
 * Full-screen branded overlay for choosing the frame theme/style.
 *
 * Displays realistic visual representations of all 6 themes matching the selected photo layout.
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

// ── Realistic Dynamic Visual Theme Mockup Component ──────────────────────────

function VisualThemeMockup({
  theme,
  layout,
}: {
  theme: FrameTheme;
  layout: FrameLayout;
}) {
  const isVintageFilm = theme.id === "vintage-film-bw";
  const isEmerald = theme.id === "emerald-luxury";
  const isPastel = theme.id === "pastel-pink";
  const isFrameKoran = theme.id === "frame-koran-custom";
  const isSignatureISY = theme.id === "signature-isy-custom";
  const isStrip1x3 = layout.aspectRatioClass === "aspect-[1/3]";

  // 4 new PNG-overlay frames — show actual PNG as thumbnail
  const pngOverlayFrames: Record<string, { src: string; aspect: string; maxW: string }> = {
    "frame-4-pink":  { src: "/frame photobooth/frame 4 pink.png",  aspect: "aspect-[4/5]", maxW: "max-w-[144px]" },
    "frame-hijau-3": { src: "/frame photobooth/frame hijau 3.png", aspect: "aspect-[1/2]", maxW: "max-w-[80px]"  },
    "frame-pink-3":  { src: "/frame photobooth/frame pink 3.png",  aspect: "aspect-[1/2]", maxW: "max-w-[80px]"  },
    "frame-putih-4": { src: "/frame photobooth/frame putih 4.png", aspect: "aspect-[4/5]", maxW: "max-w-[144px]" },
  };
  const pngMeta = pngOverlayFrames[theme.id];
  if (pngMeta) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${pngMeta.aspect} ${pngMeta.maxW} h-full w-full rounded-xl overflow-hidden shadow-xs border border-stone-200 transition-all duration-300 group-hover:shadow-md`}
        >
          <Image
            src={pngMeta.src}
            alt={theme.name}
            fill
            className="object-cover"
            sizes="144px"
          />
        </div>
      </div>
    );
  }


  // Person SVG icon for slot placeholder
  const PersonIcon = ({ color }: { color?: string }) => (
    <svg
      className={`w-3.5 h-3.5 ${
        color ||
        (isVintageFilm
          ? "text-white/40"
          : isEmerald
          ? "text-[#E2B857]/50"
          : isPastel
          ? "text-[#EC4899]/40"
          : isSignatureISY
          ? "text-[#E2B857]/40"
          : "text-isy-green-deep/30")
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  // 1. Frame Koran Preview — uses the exact authentic manual artwork PNG
  if (isFrameKoran) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${
            isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
          } h-full w-full rounded-xl overflow-hidden shadow-xs border border-stone-300 transition-all duration-300 group-hover:shadow-md`}
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

  // 2. Signature Optik I See You (Manual Design in Progress) Mockup
  if (isSignatureISY) {
    return (
      <div className="flex h-[180px] w-full items-center justify-center py-1">
        <div
          className={`relative ${
            isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
          } h-full w-full rounded-xl border border-[#E2B857]/40 bg-gradient-to-b from-[#0E3821] to-[#062013] p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:shadow-[0_0_15px_rgba(226,184,87,0.25)]`}
        >
          {/* Subtle gold border insets */}
          <div className="absolute inset-1 rounded-lg border border-[#E2B857]/20 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-[#E2B857]/30 z-10">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#E2B857]" />
              <span className={`${isStrip1x3 ? "text-[5.5px]" : "text-[7px]"} font-black uppercase tracking-wider text-[#E2B857]`}>
                I SEE YOU
              </span>
            </div>
            {!isStrip1x3 && (
              <span className="text-[6px] font-extrabold uppercase text-[#E2B857]/80">SIGNATURE</span>
            )}
          </div>

          {/* Slots */}
          <div className="my-1 flex-1 flex flex-col gap-1 overflow-hidden z-10">
            {layout.id === "solo" && (
              <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] h-full w-full">
                <PersonIcon />
              </div>
            )}
            {layout.id === "trio_vert" && (
              <div className="flex flex-col gap-1 h-full w-full">
                <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
              </div>
            )}
            {layout.id === "trio_grid" && (
              <div className="flex flex-col gap-1 h-full w-full">
                <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] h-[52%] w-full"><PersonIcon /></div>
                <div className="flex gap-1 h-[44%] w-full">
                  <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                  <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                </div>
              </div>
            )}
            {layout.id === "quartet_grid" && (
              <div className="flex flex-col gap-1 h-full w-full">
                <div className="flex gap-1 flex-1 w-full">
                  <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                  <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                </div>
                <div className="flex gap-1 flex-1 w-full">
                  <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                  <div className="relative rounded-[3px] flex items-center justify-center border border-dashed border-[#E2B857]/40 bg-[#082916] flex-1"><PersonIcon /></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-0.5 border-t border-[#E2B857]/30 text-center z-10">
            <span className="text-[5.5px] font-serif italic text-[#E2B857]/90 tracking-wide">
              Edisi Spesial I See You
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Dynamic Styling Configuration for Classic White, Emerald Luxury, Vintage Film, Pastel Cute
  const containerClass = isVintageFilm
    ? "bg-[#141414] border-[#333333] text-white"
    : isEmerald
    ? "bg-gradient-to-b from-[#0A482A] to-[#052917] border-[#14683C] text-white shadow-[0_0_12px_rgba(10,72,42,0.4)]"
    : isPastel
    ? "bg-gradient-to-b from-[#FFF5F7] to-[#FCE4EC] border-[#FBCFE8] text-[#831843]"
    : "bg-gradient-to-b from-white to-[#EAF6EC]/40 border-isy-line text-isy-green-deep";

  const slotBgClass = isVintageFilm
    ? "bg-[#1C1C1C] border-[#333333]"
    : isEmerald
    ? "bg-[#06361E] border-[#14683C]"
    : isPastel
    ? "bg-[#FDF2F8] border-[#FBCFE8]"
    : "bg-[#EEF6F0] border-[#C8E6C9]";

  const headerDotColor = isVintageFilm
    ? "bg-[#FF9900]"
    : isEmerald
    ? "bg-[#E2B857]"
    : isPastel
    ? "bg-[#EC4899]"
    : "bg-isy-green-bright";

  const headerTextColor = isVintageFilm
    ? "text-white"
    : isEmerald
    ? "text-[#E2B857]"
    : isPastel
    ? "text-[#831843]"
    : "text-isy-green-deep";

  const headerBadgeColor = isVintageFilm
    ? "text-[#FF9900]"
    : isEmerald
    ? "text-[#E2B857]"
    : isPastel
    ? "text-[#EC4899]"
    : "text-isy-green-bright";

  const headerBorderColor = isVintageFilm
    ? "border-white/10"
    : isEmerald
    ? "border-[#E2B857]/20"
    : isPastel
    ? "border-[#FBCFE8]"
    : "border-isy-line/60";

  const footerTextColor = isVintageFilm
    ? "text-[#FF9900]"
    : isEmerald
    ? "text-[#E2B857]"
    : isPastel
    ? "text-[#EC4899]"
    : "text-isy-green-deep/70";

  const slotStyle = `relative rounded-[3px] flex items-center justify-center border ${slotBgClass} shadow-2xs overflow-hidden`;

  return (
    <div className="flex h-[180px] w-full items-center justify-center py-1">
      <div
        className={`relative ${
          isStrip1x3 ? "aspect-[1/3] max-w-[76px]" : "aspect-[2/3] max-w-[126px]"
        } h-full w-full rounded-xl border p-2 shadow-xs transition-all duration-300 flex flex-col justify-between overflow-hidden group-hover:shadow-md ${containerClass}`}
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
        <div className={`flex items-center justify-between pb-1 border-b ${headerBorderColor}`}>
          <div className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${headerDotColor}`} />
            <span
              className={`${
                isStrip1x3 ? "text-[6px]" : "text-[7.5px]"
              } font-black uppercase tracking-wider ${headerTextColor}`}
            >
              I SEE YOU
            </span>
          </div>
          {!isStrip1x3 && (
            <span className={`text-[6.5px] font-extrabold uppercase ${headerBadgeColor}`}>
              {isVintageFilm ? "35MM" : isEmerald ? "LUXURY" : isPastel ? "CUTE" : "PHOTO"}
            </span>
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
        <div className={`pt-0.5 text-center border-t ${headerBorderColor}`}>
          <span className={`text-[6px] font-extrabold ${footerTextColor}`}>
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
  const isKoran = theme.id === "frame-koran-custom";
  const isSignature = theme.id === "signature-isy-custom";
  const isKoranNotTrio = isKoran && layout.numPhotos !== 3;

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

      {/* Badge Top Left */}
      <div className="flex items-center justify-between w-full">
        {isKoranNotTrio ? (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 border border-amber-500/30 z-10">
            Tahap Update (1 & 4 Foto)
          </span>
        ) : isSignature ? (
          <span className="rounded-full bg-emerald-700/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800 border border-emerald-700/30 z-10">
            Tahap Update
          </span>
        ) : theme.badge ? (
          <span className="rounded-full bg-isy-green-bright/10 px-2 py-0.5 text-[9px] font-black uppercase text-isy-green-bright border border-isy-green-bright/30 z-10">
            {theme.badge}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Visual Thumbnail matching the user's selected photo count layout */}
      <VisualThemeMockup theme={theme} layout={layout} />

      {/* Title & Description */}
      <div className="flex flex-col items-center text-center space-y-1 w-full pt-1">
        <span className="text-xs font-black text-isy-green-deep group-hover:text-isy-green-bright transition-colors leading-tight">
          {theme.name}
        </span>

        <span className="text-[10px] text-isy-ink/60 font-medium line-clamp-2 leading-tight">
          {isKoranNotTrio
            ? "Tersedia optimal untuk 3 Foto. Format ini sedang dalam pembaruan."
            : isSignature
            ? "Desain manual khas I See You dalam tahap pembaruan."
            : theme.description}
        </span>
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

  // Available themes for user choice
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
            stagger: 0.06,
            ease: "power2.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [availableThemes]);

  const handleCardClick = (themeId: string) => {
    setActiveThemeId(themeId);
    onSelect(themeId);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl border border-isy-line sm:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-isy-line pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-isy-mist text-isy-green-deep hover:bg-isy-green-bright hover:text-white transition-all active:scale-95 shadow-2xs cursor-pointer"
              aria-label="Kembali"
            >
              ←
            </button>
            <div>
              <h2 className="font-serif text-2xl font-black text-isy-green-deep">
                Pilih Template Desain Frame
              </h2>
              <p className="text-xs text-isy-ink/60 font-medium mt-0.5">
                Layout: <span className="font-bold text-isy-green-deep">{layout.label} ({layout.sublabel})</span> · Pilih template sebelum mulai foto
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-isy-green-bright border border-isy-green-bright/20">
              {availableThemes.length} Pilihan Tema
            </span>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-y-auto max-h-[62vh] p-1"
        >
          {availableThemes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              layout={layout}
              isSelected={activeThemeId === t.id}
              onSelect={() => handleCardClick(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
