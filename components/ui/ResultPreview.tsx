"use client";

/**
 * ResultPreview.tsx
 * Full-screen overlay showing the final composite photo with share actions.
 *
 * UX hierarchy:
 * 1. Foto hasil (scrollable preview, cukup besar)
 * 2. Tombol SIMPAN (primary, always visible)
 * 3. Share row: WhatsApp · Instagram · Umum
 * 4. Retake / Ganti Layout (secondary)
 * 5. Instagram CTA footer
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { FrameLayout } from "@/lib/frameLayouts";
import { csWhatsappUrl } from "@/lib/branches";
import { downloadOrShareImage } from "@/lib/saveImage";

interface Props {
 compositeDataUrl: string;
 layout: FrameLayout;
 onRetake: () => void;
 onChangeLayout: () => void;
 /** Name of the glasses tried on, if any (AR mode only) — used to prefill
  *  the "tanya stok ke CS" WhatsApp message. */
 glassesName?: string;
}

// ── SVG icon atoms ───────────────────────────────────────────────────────────

const IcDownload = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
 stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
 <path d="M12 3v13" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" />
 </svg>
);

const IcWA = () => (
 <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
 <path d="M16 3C8.82 3 3 8.82 3 16c0 2.36.64 4.57 1.76 6.48L3 29l6.73-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.12 18.08c-.26.73-1.51 1.4-2.08 1.48-.57.08-1.1.36-3.71-.77-3.14-1.36-5.15-4.52-5.3-4.73-.15-.21-1.22-1.63-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.58-.38.78-.38h.56c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.08.14.13.31.03.5-.1.19-.14.31-.28.47-.15.16-.3.36-.43.48-.14.12-.29.25-.12.5.16.24.72 1.19 1.55 1.92 1.07.95 1.97 1.24 2.21 1.38.24.13.38.11.52-.07.14-.18.59-.69.75-.93.16-.23.32-.19.54-.11.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.56-.2 1.29z"/>
 </svg>
);

const IcIG = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
 <rect x="2" y="2" width="20" height="20" rx="6" ry="6" />
 <circle cx="12" cy="12" r="4" />
 <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
 </svg>
);

const IcShare = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
 stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
 <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
 <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
 </svg>
);

const IcRetake = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
 stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
 <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
 </svg>
);

const IcGrid = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
 stroke="currentColor" strokeWidth="2.2">
 <rect x="3" y="3" width="7" height="7" rx="1.5" />
 <rect x="14" y="3" width="7" height="7" rx="1.5" />
 <rect x="3" y="14" width="7" height="7" rx="1.5" />
 <rect x="14" y="14" width="7" height="7" rx="1.5" />
 </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function ResultPreview({ compositeDataUrl, layout, onRetake, onChangeLayout, glassesName }: Props) {
 const ref = useRef<HTMLDivElement>(null);
 const photoRef = useRef<HTMLDivElement>(null);
 const actionsRef = useRef<HTMLDivElement>(null);
 const [toast, setToast] = useState<string | null>(null);

 // ── GSAP entrance ──────────────────────────────────────────────────────────
 useEffect(() => {
 const ctx = gsap.context(() => {
 gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.28 });
 gsap.fromTo(photoRef.current,
 { y: 24, opacity: 0 },
 { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.12 });
 gsap.fromTo(actionsRef.current,
 { y: 16, opacity: 0 },
 { y: 0, opacity: 1, duration: 0.36, ease: "power2.out", delay: 0.22 });
 });
 return () => ctx.revert();
 }, []);

 const showToast = (msg: string) => {
 setToast(msg);
 setTimeout(() => setToast(null), 3200);
 };

 // ── Download / Save — cross-platform (iOS Share Sheet / Android / Desktop) ──
 const filename = `iseeyou-photobooth-${Date.now()}.jpg`;

 const download = async () => {
   showToast("Menyimpan foto...");
   const result = await downloadOrShareImage(compositeDataUrl, filename, "Optik I See You — Photobooth");
   if (result.method === "share") {
     showToast("Foto siap disimpan! ");
   } else if (result.method === "download") {
     showToast("Foto tersimpan! ");
   } else {
     // preview fallback — guide user to long-press save on iOS
     showToast("Tekan & tahan foto, lalu pilih 'Simpan' ");
   }
 };

 // ── Share ──────────────────────────────────────────────────────────────
 const shareText =
   "Coba kacamata di @iseeyou.glasses AR Photobooth! \n" +
   "Kunjungi: https://www.instagram.com/iseeyou.glasses/";

 const share = async (platform: "whatsapp" | "instagram" | "general") => {
   // Always try native share sheet first (iOS & Android)
   const result = await downloadOrShareImage(compositeDataUrl, filename, "I See You AR Photobooth");
   if (result.method === "share") return; // native share handled it

   // Desktop / browser fallback
   if (platform === "whatsapp") {
     window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
   } else if (platform === "instagram") {
     window.open("https://www.instagram.com/iseeyou.glasses/", "_blank");
     showToast("Foto diunduh — buka Instagram & share dari galeri! ");
   } else {
     showToast("Foto diunduh! Sekarang bisa dibagikan ");
   }
 };

 return (
 <div ref={ref} className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-white to-isy-mist overflow-y-auto">

 {/* ── Header ─────────────────────────────────────────────────────── */}
 <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-2">
 <div className="inline-flex items-center">
 <Image src="/logo.png" alt="Optik I See You"
 width={120} height={47} className="h-8 w-auto" />
 </div>
 <div className="text-right">
 <p className="text-xs font-bold text-isy-green-bright">Foto siap! </p>
 <p className="text-[11px] text-isy-ink/50 capitalize">{layout.label}</p>
 </div>
 </div>

 {/* ── Composite photo ────────────────────────────────────────────── */}
 <div ref={photoRef} className="flex shrink-0 justify-center px-5 pb-3">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={compositeDataUrl}
 alt="Hasil foto"
 className="w-full max-w-xs rounded-2xl border border-isy-line shadow-xl"
 />
 </div>

 {/* ── Toast ──────────────────────────────────────────────────────── */}
 <div className={`
 flex justify-center px-5 transition-all duration-300
 ${toast ? "mb-1 opacity-100" : "mb-0 opacity-0 pointer-events-none"}
 `}>
 <span className="rounded-full bg-isy-green-deep px-5 py-2 text-xs font-semibold text-white shadow">
 {toast ?? "​"}
 </span>
 </div>

 {/* ── Actions ────────────────────────────────────────────────────── */}
 <div ref={actionsRef} className="shrink-0 px-5 pb-4 space-y-2.5">

 {/* PRIMARY: Download / Simpan */}
 <button
 id="result-download"
 onClick={download}
 className="
 flex w-full items-center justify-center gap-2.5
 rounded-2xl bg-isy-green-bright py-4
 text-sm font-black uppercase tracking-[0.15em] text-white
 shadow-md transition-all active:scale-[0.97] hover:bg-isy-green-deep
 "
 >
 <IcDownload />
 Simpan Foto
 </button>

 {/* Tanya stok ke CS — only shown when a specific pair of glasses was
 tried on (AR mode), since "Photobooth Biasa" has no glasses context */}
 {glassesName && (
 <a
 id="result-ask-cs"
 href={csWhatsappUrl(glassesName)}
 target="_blank"
 rel="noopener noreferrer"
 className="
 flex w-full items-center justify-center gap-2.5
 rounded-2xl border-2 border-isy-green-deep bg-white py-3.5
 text-sm font-bold text-isy-green-deep
 transition-all active:scale-[0.97] hover:bg-isy-mist
 "
 >
 <IcWA />
 Tanya Stok &quot;{glassesName}&quot; ke CS
 </a>
 )}

 {/* SECONDARY: Share row */}
 <div className="grid grid-cols-3 gap-2">
 {(
 [
 { id: "result-share-wa", icon: <IcWA />, label: "WhatsApp", platform: "whatsapp" },
 { id: "result-share-ig", icon: <IcIG />, label: "Instagram", platform: "instagram" },
 { id: "result-share-gen", icon: <IcShare />, label: "Bagikan", platform: "general" },
 ] as const
 ).map(({ id, icon, label, platform }) => (
 <button
 key={id}
 id={id}
 onClick={() => share(platform)}
 className="
 flex flex-col items-center gap-1.5 rounded-2xl
 border border-isy-line bg-white py-3
 text-xs font-semibold text-isy-green-deep
 transition-all active:scale-95
 hover:border-isy-green-bright hover:bg-isy-mist
 "
 >
 {icon}
 {label}
 </button>
 ))}
 </div>

 {/* TERTIARY: Retake / Ganti Layout */}
 <div className="grid grid-cols-2 gap-2">
 <button
 id="result-retake"
 onClick={onRetake}
 className="
 flex items-center justify-center gap-1.5 rounded-xl
 border border-isy-green-bright bg-white py-3
 text-sm font-bold text-isy-green-deep
 transition-all active:scale-95 hover:bg-isy-mist
 "
 >
 <IcRetake />
 Foto Ulang
 </button>
 <button
 id="result-change-layout"
 onClick={onChangeLayout}
 className="
 flex items-center justify-center gap-1.5 rounded-xl
 border border-isy-line bg-white py-3
 text-sm font-semibold text-isy-ink/60
 transition-all active:scale-95 hover:border-isy-ink/30
 "
 >
 <IcGrid />
 Ganti Layout
 </button>
 </div>
 </div>

 {/* ── Instagram CTA footer ───────────────────────────────────────── */}
 <div className="mt-auto shrink-0 border-t border-isy-line bg-white/80 px-5 py-4">
 <a
 id="result-ig-cta"
 href="https://www.instagram.com/iseeyou.glasses/"
 target="_blank"
 rel="noopener noreferrer"
 className="
 mx-auto flex max-w-sm items-center gap-3 rounded-2xl
 bg-isy-mist px-4 py-3
 transition-all hover:bg-isy-line active:scale-[0.98]
 "
 >
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-isy-green-bright">
 <IcIG />
 </div>
 <div className="min-w-0">
 <p className="text-[11px] text-isy-ink/50">Kunjungi Instagram kami</p>
 <p className="text-sm font-black text-isy-green-bright">@iseeyou.glasses</p>
 </div>
 <svg className="ml-auto shrink-0 text-isy-ink/30" width="16" height="16"
 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <path d="M9 18l6-6-6-6" />
 </svg>
 </a>
 <p className="mt-2.5 text-center text-[11px] text-isy-ink/40">
 Optik I See You · Purwokerto · Jadi Sahabat Mata Kamu
 </p>
 </div>
 </div>
 );
}
