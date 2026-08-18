"use client";

/**
 * app/page.tsx — Landing Page, Optik I See You AR Photobooth
 * Slogan Logo: /logo/Logo-ForEveryYou.png (Prominent, Proportional Sizing)
 *
 * Includes:
 * - Fixed & translucent glassmorphism Navbar on scroll
 * - Official image logo /logo/Logo-ForEveryYou.png across sections (balanced size)
 * - Interactive action cards for Pricelist Lensa, Konsultasi Gratis (WA), Shopee Official Store
 * - Instagram 4 Cabang links (@iseeyou.glasses, @iseeyou.wonosobo, @iseeyou.cilacap, @iseeyou.purbalingga)
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import BranchCarousel from "@/components/ui/BranchCarousel";
import FloatingGlasses from "@/components/ui/FloatingGlasses";
import EyeExamFacilitySection from "@/components/ui/EyeExamFacilitySection";
import LandingVideoShowcase from "@/components/ui/LandingVideoShowcase";
import AboutRefractionBookingSection from "@/components/ui/AboutRefractionBookingSection";
import GoogleReviewsSection from "@/components/ui/GoogleReviewsSection";
import LocalFaqSection from "@/components/ui/LocalFaqSection";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import {
  BRANCHES,
  PRICE_LIST_LENSA_URL,
  SHOPEE_STORE_URL,
  TOKOPEDIA_STORE_URL,
  konsultasiWhatsappUrl,
  mapsDirectionsUrl,
} from "@/lib/branches";

function FeatureCard({ title, desc, accent }: { title: string; desc: string; accent: string }) {
  return (
    <div className="relative flex flex-col gap-2 rounded-2xl border border-isy-line bg-white p-5 shadow-sm transition-all hover:border-isy-green-bright/50 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: accent }} />
      <p className="font-bold text-isy-green-deep text-sm">{title}</p>
      <p className="text-xs text-isy-ink/60 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-isy-green-deep text-lg font-black text-white shadow-lg">
        {n}
      </div>
      <p className="text-sm font-bold text-isy-green-deep">{title}</p>
      <p className="text-xs text-isy-ink/60 leading-relaxed max-w-[130px]">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  const logoRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(logoRef.current, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
        .fromTo(badgeRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .fromTo(tagRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2")
        .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    });
    return () => ctx.revert();
  }, []);

  const start = () => router.push("/start");

  return (
    <main className="relative w-full overflow-x-hidden bg-isy-gradient">
      <Navbar />

      {/* Soft glow background */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-isy-green-bright/6 blur-[140px]" />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85dvh] flex items-center px-6 md:px-12 lg:px-20 pt-20 pb-12">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Eyebrow + Heading + CTA ── */}
          <div className="flex flex-col items-start text-left justify-center">

            {/* Eyebrow badge — small, uppercase, replaces bulky logo */}
            <div ref={logoRef} className="mb-6 flex flex-col gap-3">
              {/* Eyebrow text */}
              <span
                className="text-[10px] font-bold uppercase tracking-[0.35em] text-isy-green-bright/80"
                style={{ letterSpacing: "0.32em" }}
              >
                Optik I See You · AR Try-On &amp; Photobooth
              </span>

              {/* Live badge */}
              <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-white/80 px-3.5 py-1 shadow-sm backdrop-blur-sm w-fit">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-isy-green-bright" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-isy-green-bright">AR TRY-ON EKSKLUSIF</span>
              </div>
            </div>

            {/* Main headline — clean 2-line layout without awkward line wraps */}
            <div ref={tagRef}>
              <h1 className="font-serif font-black leading-[1.12] text-isy-green-deep tracking-tight"
                  style={{ fontSize: "clamp(1.9rem, 3.6vw, 3.1rem)" }}>
                <span className="block whitespace-nowrap">Selamat Datang,</span>
                <span className="text-isy-green-bright italic whitespace-nowrap block">di Optik I See You</span>
              </h1>
              <p className="mt-4 text-[13px] text-isy-ink/60 leading-relaxed max-w-[360px] font-medium">
                Coba langsung koleksi kacamata, softlens, dan aksesoris I See You — try-on real-time di wajah kamu, tanpa install apapun.
              </p>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="mt-8 w-full max-w-[420px] space-y-4">
              {/* Primary CTA — single dominant button */}
              <button
                onClick={start}
                className="w-full rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-4 px-6 text-[13px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-isy-green-bright/30 transition-all hover:scale-[1.02] hover:shadow-isy-green-bright/40 active:scale-[0.97]"
              >
                Mulai Try-On / Photobooth
              </button>

              {/* Secondary links — pill/bubble style, clearly clickable */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Link
                  href="/katalog"
                  className="flex items-center gap-1.5 rounded-full border border-isy-green-deep/20 bg-white/80 backdrop-blur-md px-4 py-2.5 text-[12px] font-semibold text-isy-ink/70 shadow-sm transition-all duration-200 hover:border-isy-green-bright hover:bg-white hover:text-isy-green-deep hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-md active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Katalog Frame
                </Link>

                <Link
                  href="/softlens"
                  className="flex items-center gap-1.5 rounded-full border border-isy-green-deep/20 bg-white/80 backdrop-blur-md px-4 py-2.5 text-[12px] font-semibold text-isy-ink/70 shadow-sm transition-all duration-200 hover:border-isy-green-bright hover:bg-white hover:text-isy-green-deep hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-md active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                  Softlens
                </Link>

                <a
                  href={PRICE_LIST_LENSA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-isy-green-deep/20 bg-white/80 backdrop-blur-md px-4 py-2.5 text-[12px] font-semibold text-isy-ink/70 shadow-sm transition-all duration-200 hover:border-isy-green-bright hover:bg-white hover:text-isy-green-deep hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-md active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Pricelist Lensa
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Floating Glasses Showcase ── */}
          <div className="flex flex-col items-center justify-center relative py-6 md:py-10 w-full">

            {/* Sparkle particle 1 — top-right */}
            <span
              aria-hidden
              className="absolute top-[12%] right-[10%] pointer-events-none"
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#2FA84F",
                opacity: 0.6,
                animation: "sparkle-float 3.2s ease-in-out infinite",
                animationDelay: "0s",
              }}
            />
            {/* Sparkle particle 2 — bottom-left */}
            <span
              aria-hidden
              className="absolute bottom-[20%] left-[6%] pointer-events-none"
              style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "#1B4332",
                opacity: 0.45,
                animation: "sparkle-float 4s ease-in-out infinite",
                animationDelay: "1.1s",
              }}
            />
            {/* Sparkle arc line — subtle curved line */}
            <span
              aria-hidden
              className="absolute top-[22%] left-[4%] pointer-events-none"
              style={{
                width: 32, height: 32,
                borderRadius: "50%",
                border: "1.5px solid rgba(47,168,79,0.25)",
                borderBottomColor: "transparent",
                borderLeftColor: "transparent",
                animation: "sparkle-float 5s ease-in-out infinite reverse",
                animationDelay: "0.6s",
              }}
            />

            {/* Prominent Floating Glasses with full temple arms */}
            <FloatingGlasses
              items={[
                {
                  src: "/glasses/hero-glasses-black.png",
                  alt: "Frame Hitam dengan Gagang Penuh — Optik I See You",
                },
                {
                  src: "/glasses/hero-glasses-champagne.png",
                  alt: "Frame Crystal Champagne Blush dengan Gagang Penuh — Optik I See You",
                },
              ]}
              width={540}
              height={270}
            />

            {/* ── Prominent Floating Action Buttons (WA, Shopee, Tokopedia) below floating glasses ── */}
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 mt-8 z-10">
              {/* WhatsApp Button */}
              <a
                href={konsultasiWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hubungi kami via WhatsApp untuk konsultasi"
                title="Chat WhatsApp CS"
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-white/85 backdrop-blur-lg border-2 border-emerald-500/30 shadow-xl shadow-emerald-950/15 transition-all duration-300 hover:scale-115 hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-1.5 active:scale-95 group"
              >
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-25 group-hover:opacity-40" />
                <Image
                  src="/logo/Logo-Whatsapp.png"
                  alt="WhatsApp"
                  width={34}
                  height={34}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                />
              </a>

              {/* Shopee Button */}
              <a
                href={SHOPEE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi toko Shopee I See You"
                title="Toko Shopee Official"
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-white/85 backdrop-blur-lg border-2 border-orange-400/40 shadow-xl shadow-orange-950/15 transition-all duration-300 hover:scale-115 hover:shadow-2xl hover:border-orange-500 hover:-translate-y-1.5 active:scale-95 group"
              >
                <Image
                  src="/logo/Logo-Shoppe.png"
                  alt="Shopee"
                  width={34}
                  height={34}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                />
              </a>

              {/* Tokopedia Button */}
              <a
                href={TOKOPEDIA_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi toko Tokopedia Optik I See You"
                title="Toko Tokopedia Official"
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-white/85 backdrop-blur-lg border-2 border-emerald-500/35 shadow-xl shadow-emerald-950/15 transition-all duration-300 hover:scale-115 hover:shadow-2xl hover:border-[#03AC0E] hover:-translate-y-1.5 active:scale-95 group"
              >
                <Image
                  src="/logo/Logo-Tokopedia.png"
                  alt="Tokopedia"
                  width={34}
                  height={34}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                />
              </a>
            </div>
          </div>

        </div>
      </section>


      {/* ═══ KATALOG PREVIEW — Infinite 2-Row Marquee Showcase ═══ */}
      <section className="w-full bg-white py-16 border-t border-isy-line overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 mb-10 text-center flex flex-col items-center">
          <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
            Koleksi Kacamata
          </span>
          <h2 className="font-serif text-3xl font-black text-isy-green-deep">Katalog Frame I See You</h2>
          <p className="mt-2 text-lg sm:text-xl tracking-[0.2em] text-black font-normal" style={{ fontFamily: 'var(--font-dm-serif)' }}>
            for every you
          </p>
        </div>

        {/* ── Marquee Showcase (2 Rows, Opposite Directions, Smooth Infinite Looping) ── */}
        <div className="w-full space-y-6 overflow-hidden">
          {/* Row 1: Moving LEFTWARD (Cat Eye, New Collection, Titanium — primary clean photos only) */}
          <div className="marquee-group relative w-full overflow-hidden py-1">
            <div className="animate-marquee-left flex items-center gap-6">
              {CATALOG_COLLECTIONS.slice(0, 3)
                .map((c) => c.coverImage)
                .concat(CATALOG_COLLECTIONS.slice(0, 3).map((c) => c.coverImage))
                .concat(CATALOG_COLLECTIONS.slice(0, 3).map((c) => c.coverImage))
                .concat(CATALOG_COLLECTIONS.slice(0, 3).map((c) => c.coverImage))
                .concat(CATALOG_COLLECTIONS.slice(0, 3).map((c) => c.coverImage))
                .map((imgSrc, index) => (
                  <div
                    key={`top-${index}`}
                    className="group/card relative h-48 sm:h-56 md:h-64 w-64 sm:w-80 md:w-96 shrink-0 overflow-hidden rounded-2xl md:rounded-3xl border border-isy-line bg-isy-mist/40 shadow-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:border-isy-green-bright/40 select-none cursor-pointer"
                  >
                    <Image
                      src={imgSrc}
                      alt="Koleksi Frame Utama Optik I See You"
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Row 2: Moving RIGHTWARD (Metro Deek, Quiet Luxury, Shades Of Elegance — primary clean photos only) */}
          <div className="marquee-group relative w-full overflow-hidden py-1">
            <div className="animate-marquee-right flex items-center gap-6">
              {CATALOG_COLLECTIONS.slice(3, 6)
                .map((c) => c.coverImage)
                .concat(CATALOG_COLLECTIONS.slice(3, 6).map((c) => c.coverImage))
                .concat(CATALOG_COLLECTIONS.slice(3, 6).map((c) => c.coverImage))
                .concat(CATALOG_COLLECTIONS.slice(3, 6).map((c) => c.coverImage))
                .concat(CATALOG_COLLECTIONS.slice(3, 6).map((c) => c.coverImage))
                .map((imgSrc, index) => (
                  <div
                    key={`bottom-${index}`}
                    className="group/card relative h-48 sm:h-56 md:h-64 w-64 sm:w-80 md:w-96 shrink-0 overflow-hidden rounded-2xl md:rounded-3xl border border-isy-line bg-isy-mist/40 shadow-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:border-isy-green-bright/40 select-none cursor-pointer"
                  >
                    <Image
                      src={imgSrc}
                      alt="Koleksi Frame Utama Optik I See You"
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* CTA Link to Full Catalog */}
        <div className="mt-12 text-center px-6">
          <Link
            href="/katalog"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-isy-green-deep px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-isy-green-bright active:scale-95"
          >
            <span>Lihat Full Katalog Frame</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══ CINEMATIC VIDEO SHOWCASE ═══ */}
      <LandingVideoShowcase />

      {/* ═══ FITUR ═══ */}
      <section className="w-full bg-white px-6 py-16 border-t border-isy-line">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center flex flex-col items-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Fitur Unggulan
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">Bukan Photobooth Biasa</h2>
            <p className="mt-2 text-base sm:text-lg tracking-[0.2em] text-black font-normal" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              for every you
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard title="Deteksi Bentuk Wajah" desc="Kamera otomatis kenali bentuk wajah, lalu rekomendasikan frame paling cocok." accent="linear-gradient(90deg, #116B3C, #2FA84F)" />
            <FeatureCard title="AR Try-On Real-Time" desc="Kacamata langsung muncul di wajah, mengikuti gerakan kepala." accent="linear-gradient(90deg, #2FA84F, #86EFAC)" />
            <FeatureCard title="Photobooth Biasa" desc="Nggak mau pakai AR? Ada mode photobooth standar juga." accent="linear-gradient(90deg, #6366F1, #818CF8)" />
            <FeatureCard title="QR Scan & Download" desc="Scan QR code, langsung unduh foto ke HP kamu." accent="linear-gradient(90deg, #F59E0B, #FCD34D)" />
          </div>
        </div>
      </section>

      {/* ═══ CARA KERJA ═══ */}
      <section className="w-full px-6 py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Cara Pakai
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">Gampang Banget</h2>
            <p className="mt-2 text-sm text-isy-ink/60">3 langkah, kurang dari semenit</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Step n={1} title="Pilih Mode" desc="Scan AR atau photobooth biasa" />
            <Step n={2} title="Foto" desc="Countdown otomatis, tinggal senyum" />
            <Step n={3} title="Simpan" desc="Scan QR atau simpan ke galeri" />
          </div>

          <button
            onClick={start}
            className="mt-12 w-full rounded-2xl bg-isy-green-bright py-5 text-base font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-isy-green-bright/30 transition-all hover:bg-isy-green-deep active:scale-[0.97]"
          >
            Mulai Try-On Sekarang
          </button>
        </div>
      </section>

      {/* ═══ FASILITAS PEMERIKSAAN MATA ═══ */}
      <EyeExamFacilitySection />

      {/* ═══ TENTANG KAMI & RESERVASI CEK MATA GRATIS ═══ */}
      <AboutRefractionBookingSection />

      {/* ═══ CABANG & LOKASI ═══ */}
      <section id="lokasi" className="w-full bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center flex flex-col items-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Kunjungi Kami
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">4 Cabang Optik I See You</h2>
            <p className="mt-2 text-sm text-isy-ink/60">Purwokerto · Wonosobo · Cilacap · Purbalingga</p>
            <p className="mt-2 text-base sm:text-lg tracking-[0.2em] text-black font-normal" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              for every you
            </p>
          </div>

          <BranchCarousel />
        </div>
      </section>

      {/* ═══ GOOGLE BUSINESS REVIEWS & TESTIMONI ASLI ═══ */}
      <GoogleReviewsSection />

      {/* ═══ FAQ & LOCAL SEO INFO SECTION ═══ */}
      <LocalFaqSection />

      {/* ═══ FOOTER — Luxury Emerald Multi-Column Layout ═══ */}
      <footer className="w-full bg-[#0D2F1D] text-white border-t border-white/10">
        {/* Top Trust Banner */}
        <div className="border-b border-white/10 bg-black/20 px-6 py-6 sm:py-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">100% Produk Original</h4>
                <p className="text-[11px] text-white/60">Frame &amp; softlens terkurasi kualitas optik terbaik</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="22" y1="12" x2="18" y2="12"/>
                  <line x1="6" y1="12" x2="2" y2="12"/>
                  <line x1="12" y1="6" x2="12" y2="2"/>
                  <line x1="12" y1="22" x2="12" y2="18"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Faset Presisi CNC 0.01 mm</h4>
                <p className="text-[11px] text-white/60">Mesin potong otomatis 3D tracing super rapi</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Layanan Cepat &amp; Garansi</h4>
                <p className="text-[11px] text-white/60">Pengerjaan kacamata express bisa ditunggu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main 4-Column Footer Content */}
        <div className="mx-auto max-w-6xl px-6 sm:px-10 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex flex-col" style={{ lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.35em",
                  color: "#5ec97a",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                  display: "block",
                }}
              >
                OPTIK
              </span>
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "0.01em",
                  lineHeight: 1.05,
                  display: "block",
                }}
              >
                I SEE YOU
              </span>
              <span
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: "0.22em",
                  marginTop: "3px",
                  display: "block",
                }}
              >
                for every you
              </span>
            </div>

            <p className="text-xs text-white/65 leading-relaxed">
              Optik kacamata &amp; softlens estetik modern terpercaya sejak 2019 dengan 4 cabang resmi di Purwokerto, Purbalingga, Wonosobo, dan Cilacap.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={SHOPEE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/35 px-3 py-1 text-[11px] font-semibold text-orange-300 transition-all hover:bg-orange-500/20 active:scale-95"
              >
                <Image src="/logo/Logo-Shoppe.png" alt="Shopee" width={12} height={12} className="h-3 w-3 object-contain" />
                Shopee
              </a>
              <a
                href={TOKOPEDIA_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 px-3 py-1 text-[11px] font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-95"
              >
                <Image src="/logo/Logo-Tokopedia.png" alt="Tokopedia" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
                Tokopedia
              </a>
              <a
                href={konsultasiWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/35 px-3 py-1 text-[11px] font-semibold text-teal-300 transition-all hover:bg-teal-500/20 active:scale-95"
              >
                <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={12} height={12} className="h-3 w-3 object-contain" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Col 2: Navigasi Layanan & Produk */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5ec97a]">
              Layanan &amp; Produk
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/try-on" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Coba AR Try-On Kacamata
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Katalog Frame Kacamata
                </Link>
              </li>
              <li>
                <Link href="/softlens" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Katalog Softlens &amp; Aksesoris
                </Link>
              </li>
              <li>
                <Link href="/photobooth" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> AR Photobooth &amp; Cetak Instan
                </Link>
              </li>
              <li>
                <a
                  href={PRICE_LIST_LENSA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white flex items-center gap-1.5"
                >
                  <span className="text-emerald-400">›</span> Price List &amp; Jenis Lensa ↗
                </a>
              </li>
              <li>
                <a href="#fasilitas" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Fasilitas Mesin Potong Lensa
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Cabang Resmi & Alamat */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5ec97a]">
              4 Cabang Resmi
            </h4>
            <div className="space-y-3 text-xs">
              {BRANCHES.map((b) => (
                <div key={b.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{b.city}</span>
                    <a
                      href={mapsDirectionsUrl(b)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-300 hover:underline"
                    >
                      Rute Maps ↗
                    </a>
                  </div>
                  <p className="text-[11px] text-white/55 line-clamp-1 mt-0.5">{b.address}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Instagram & Photobooth CTA */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5ec97a]">
              Social Media Official
            </h4>
            <p className="text-xs text-white/60">Ikuti info promo &amp; katalog terbaru di cabang terdekat:</p>

            <div className="grid grid-cols-2 gap-1.5">
              {BRANCHES.map((b) => (
                <a
                  key={b.id}
                  href={b.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  <p className="text-[11px] font-bold text-white">{b.city}</p>
                  <p className="text-[9.5px] text-emerald-300 truncate">{b.handle}</p>
                </a>
              ))}
            </div>

            <button
              onClick={start}
              className="mt-2 w-full rounded-xl bg-isy-green-bright py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-emerald-500 active:scale-95"
            >
              Mulai Photobooth AR →
            </button>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-white/10 bg-black/40 px-6 sm:px-10 py-5 text-xs text-white/50">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-medium text-white/70">
                &copy; 2019 &ndash; 2026 Optik I See You. All Rights Reserved.
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Layanan optik terpercaya, periksa mata digital, faset presisi CNC, dan AR Try-On interaktif.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Crafted for Every You</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
