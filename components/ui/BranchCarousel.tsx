"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BRANCHES,
  mapsDirectionsUrl,
  branchWhatsappUrl,
  type Branch,
} from "@/lib/branches";

const AUTO_ADVANCE_MS = 3500;

// ── City color accents ─────────────────────────────────────────────────────
const CITY_COLORS: Record<string, string> = {
  purwokerto: "#116B3C",
  wonosobo:   "#0D5C33",
  cilacap:    "#1A8F50",
  purbalingga:"#2FA84F",
};

// ── Branch Detail Modal ───────────────────────────────────────────────────
function BranchModal({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = "";
    };
  }, []);

  // Static map image URL via Google Maps Static API (no key needed for basic embed)
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${branch.lat},${branch.lng}&zoom=16&size=800x300&maptype=roadmap&markers=color:green%7C${branch.lat},${branch.lng}&scale=2`;
  const mapsUrl = `https://www.google.com/maps?q=${branch.lat},${branch.lng}`;

  const accentColor = CITY_COLORS[branch.id] ?? "#116B3C";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-t-[2rem] bg-white shadow-2xl transition-all duration-500 sm:rounded-[2rem] ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored accent strip at top */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, #86EFAC)` }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white mb-2"
              style={{ background: accentColor }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
              Lokasi Cabang
            </span>
            <h3 className="font-serif text-xl font-black leading-tight text-isy-green-deep">
              {branch.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-3 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 transition hover:bg-isy-line"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[78vh] overflow-y-auto">

          {/* Map Preview Card — clicking opens Google Maps */}
          <div className="px-6 pb-4">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/7] w-full overflow-hidden rounded-2xl border border-isy-line shadow-md transition hover:shadow-xl"
              title="Buka di Google Maps"
            >
              {/* Static map background */}
              <div
                className="absolute inset-0 bg-[#e8f0e9]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23116B3C' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {/* Simulated map roads */}
              <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 175">
                <line x1="0" y1="87" x2="400" y2="87" stroke="#116B3C" strokeWidth="8" />
                <line x1="200" y1="0" x2="200" y2="175" stroke="#116B3C" strokeWidth="5" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#116B3C" strokeWidth="3" opacity="0.5" />
                <line x1="0" y1="130" x2="400" y2="130" stroke="#116B3C" strokeWidth="3" opacity="0.5" />
                <line x1="100" y1="0" x2="100" y2="175" stroke="#116B3C" strokeWidth="3" opacity="0.4" />
                <line x1="300" y1="0" x2="300" y2="175" stroke="#116B3C" strokeWidth="3" opacity="0.4" />
                <rect x="160" y="60" width="80" height="55" rx="6" fill="#116B3C" opacity="0.08" />
                <rect x="60" y="30" width="60" height="40" rx="4" fill="#116B3C" opacity="0.06" />
                <rect x="280" y="95" width="70" height="45" rx="4" fill="#116B3C" opacity="0.06" />
              </svg>

              {/* Center pin marker */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full shadow-2xl" style={{ background: accentColor }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full shadow-md" style={{ background: accentColor, opacity: 0.4 }} />
                </div>
                <div className="rounded-xl bg-white/95 px-4 py-1.5 text-center shadow-lg">
                  <p className="text-xs font-black" style={{ color: accentColor }}>{branch.city}</p>
                  <p className="text-[10px] text-isy-ink/60 font-medium">Klik untuk buka Google Maps</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${accentColor}22` }}>
                <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black shadow-xl" style={{ color: accentColor }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Buka Google Maps
                </div>
              </div>
            </a>
          </div>

          {/* Info Card */}
          <div className="mx-6 mb-4 rounded-2xl border border-isy-line bg-isy-mist/50 divide-y divide-isy-line/60">
            {/* Address */}
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: accentColor }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Alamat Lengkap</p>
                <p className="mt-1 text-sm font-semibold text-isy-green-deep leading-relaxed">{branch.address}</p>
              </div>
            </div>

            {/* Phone */}
            {branch.phone && (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: accentColor }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.46 16z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Telepon / WhatsApp Cabang</p>
                    <p className="mt-0.5 text-sm font-bold text-isy-green-deep">{branch.phone}</p>
                  </div>
                </div>

                <a
                  href={branchWhatsappUrl(branch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-black text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                >
                  Chat WA
                </a>
              </div>
            )}

            {/* Hours */}
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: accentColor }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Jam Operasional</p>
                {branch.hoursDetail ? (
                  <>
                    <p className="mt-0.5 text-sm font-black" style={{ color: accentColor }}>{branch.hoursDetail.weekdays}</p>
                    <p className="mt-0.5 text-sm font-black" style={{ color: accentColor }}>{branch.hoursDetail.weekend}</p>
                  </>
                ) : (
                  <p className="mt-0.5 text-sm font-black" style={{ color: accentColor }}>{branch.hours}</p>
                )}
              </div>
            </div>

            {/* Instagram Cabang */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Instagram Cabang</p>
                  <p className="mt-0.5 text-xs font-bold text-isy-green-deep">{branch.handle}</p>
                </div>
              </div>
              <a
                href={branch.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
              >
                Buka IG
              </a>
            </div>

            {/* Coordinates */}
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-isy-ink/50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-isy-ink/40">Koordinat GPS</p>
                <p className="mt-0.5 font-mono text-xs text-isy-ink/60">{branch.lat.toFixed(6)}, {branch.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          {branch.images && branch.images.length > 0 && (
            <div className="mx-6 mb-4 space-y-2">
              <p className="flex items-center justify-between text-xs font-bold text-isy-green-deep">
                <span>Foto Toko & Suasana</span>
                <span className="text-[10px] font-medium text-isy-ink/40">{photoIdx + 1} / {branch.images.length}</span>
              </p>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-isy-line bg-black/5">
                <Image
                  key={photoIdx}
                  src={branch.images[photoIdx]}
                  alt={`${branch.name} foto ${photoIdx + 1}`}
                  fill
                  className="object-cover transition-all duration-500"
                />
                {/* Previous / Next buttons */}
                {branch.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx((p) => (p - 1 + branch.images.length) % branch.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                      onClick={() => setPhotoIdx((p) => (p + 1) % branch.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </>
                )}
                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {branch.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`rounded-full transition-all ${i === photoIdx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
                    />
                  ))}
                </div>
              </div>
              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {branch.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      i === photoIdx ? "border-isy-green-bright ring-2 ring-isy-green-bright/30" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mx-6 mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={mapsDirectionsUrl(branch)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #2FA84F)` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Rute di Google Maps
            </a>

            <a
              href={branchWhatsappUrl(branch)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 bg-white py-4 text-xs font-black shadow-md transition-all hover:bg-isy-mist active:scale-[0.97]"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 3C8.82 3 3 8.82 3 16c0 2.36.64 4.57 1.76 6.48L3 29l6.73-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.12 18.08c-.26.73-1.51 1.4-2.08 1.48-.57.08-1.1.36-3.71-.77-3.14-1.36-5.15-4.52-5.3-4.73-.15-.21-1.22-1.63-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.58-.38.78-.38h.56c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.08.14.13.31.03.5-.1.19-.14.31-.28.47-.15.16-.3.36-.43.48-.14.12-.29.25-.12.5.16.24.72 1.19 1.55 1.92 1.07.95 1.97 1.24 2.21 1.38.24.13.38.11.52-.07.14-.18.59-.69.75-.93.16-.23.32-.19.54-.11.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.56-.2 1.29z"/>
              </svg>
              <span>WA {branch.city} ({branch.phone})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Branch Carousel ──────────────────────────────────────────────────
export default function BranchCarousel() {
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [modalBranch, setModalBranch] = useState<Branch | null>(null);
  const touchStartX = useRef<number | null>(null);
  const isInteractingRef = useRef(false);

  const branch = BRANCHES[index];
  const accentColor = CITY_COLORS[branch.id] ?? "#116B3C";

  // Auto-advance branch cards
  useEffect(() => {
    if (modalBranch) return;
    const t = setInterval(() => {
      if (isInteractingRef.current) return;
      setIndex((p) => (p + 1) % BRANCHES.length);
      setPhotoIndex(0);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [modalBranch]);

  // Auto-advance photos within current card
  useEffect(() => {
    if (modalBranch || !branch.images?.length) return;
    const t = setInterval(() => {
      if (isInteractingRef.current) return;
      setPhotoIndex((p) => (p + 1) % branch.images.length);
    }, AUTO_ADVANCE_MS + 500);
    return () => clearInterval(t);
  }, [modalBranch, branch]);

  const goTo = (i: number) => {
    setIndex((i + BRANCHES.length) % BRANCHES.length);
    setPhotoIndex(0);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    isInteractingRef.current = true;
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    setTimeout(() => { isInteractingRef.current = false; }, 800);
  };

  return (
    <div className="w-full">
      {/* City Switcher Tabs */}
      <div className="mb-5 flex items-center justify-center gap-2 flex-wrap">
        {BRANCHES.map((b, i) => (
          <button
            key={b.id}
            onClick={() => goTo(i)}
            className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all active:scale-95 ${
              i === index
                ? "text-white shadow-lg"
                : "border border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright hover:text-isy-green-deep"
            }`}
            style={i === index ? { background: CITY_COLORS[b.id] ?? "#116B3C" } : {}}
          >
            {b.city}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div
        className="group relative overflow-hidden rounded-3xl border border-isy-line bg-white shadow-xl transition-all duration-500 cursor-pointer hover:shadow-2xl hover:border-isy-green-bright/40"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { isInteractingRef.current = true; }}
        onMouseLeave={() => { isInteractingRef.current = false; }}
        onClick={() => setModalBranch(branch)}
      >
        {/* Accent top line */}
        <div className="h-1 w-full transition-all" style={{ background: `linear-gradient(90deg, ${accentColor}, #86EFAC)` }} />

        {/* Photo Area */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-isy-mist">
          {branch.images && branch.images.length > 0 ? (
            <Image
              src={branch.images[photoIndex]}
              alt={`${branch.name}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-isy-ink/40">
              {branch.city}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* City badge */}
          <div
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md"
            style={{ background: accentColor + "EE" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
            {branch.city}
          </div>

          {/* Photo dots */}
          {branch.images && branch.images.length > 1 && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
              {branch.images.map((_, pIdx) => (
                <span key={pIdx} className={`h-1.5 rounded-full transition-all ${pIdx === photoIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          )}

          {/* Branch info overlay */}
          <div className="absolute bottom-0 inset-x-0 p-5 z-10">
            <h3 className="font-serif text-xl font-black text-white drop-shadow sm:text-2xl">{branch.name}</h3>
            <p className="mt-1 text-[11px] text-white/80 line-clamp-1 font-medium leading-relaxed">{branch.address}</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-isy-line bg-white px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-isy-mist" style={{ color: accentColor }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-isy-green-deep">{branch.hours}</span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-md transition-all group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #2FA84F)` }}
          >
            Lihat Detail
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="mt-5 flex justify-center items-center gap-2">
        {BRANCHES.map((b, i) => (
          <button
            key={b.id}
            onClick={() => goTo(i)}
            aria-label={`Ke cabang ${b.city}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? "2rem" : "0.5rem",
              height: "0.5rem",
              background: i === index ? accentColor : "#D1D5DB",
            }}
          />
        ))}
      </div>

      {/* All Branches Quick Grid */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BRANCHES.map((b, i) => (
          <button
            key={b.id}
            onClick={() => { goTo(i); setModalBranch(b); }}
            className={`flex flex-col items-start gap-1.5 rounded-2xl border p-3.5 text-left transition-all hover:shadow-md ${
              i === index ? "border-isy-green-bright/50 shadow-sm" : "border-isy-line bg-white hover:border-isy-green-bright/30"
            }`}
            style={i === index ? { background: (CITY_COLORS[b.id] ?? "#116B3C") + "10" } : {}}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: CITY_COLORS[b.id] ?? "#116B3C" }} />
            <p className="text-xs font-black text-isy-green-deep">{b.city}</p>
            <p className="text-[10px] font-medium leading-tight text-isy-ink/50 line-clamp-2">{b.address.split(",")[0]}</p>
          </button>
        ))}
      </div>

      {/* Modal */}
      {modalBranch && (
        <BranchModal branch={modalBranch} onClose={() => setModalBranch(null)} />
      )}
    </div>
  );
}
