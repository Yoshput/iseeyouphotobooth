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
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import {
  BRANCHES,
  PRICE_LIST_LENSA_URL,
  SHOPEE_STORE_URL,
  konsultasiWhatsappUrl,
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
        <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

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
              <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-white/70 px-3.5 py-1 shadow-sm backdrop-blur-sm w-fit">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-isy-green-bright" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-isy-green-bright">AR Live · Gratis</span>
              </div>
            </div>

            {/* Main headline — most dominant element */}
            <div ref={tagRef}>
              <h1 className="font-serif font-black leading-[1.05] text-isy-green-deep"
                  style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
                Coba Kacamata
                <br />
                <span className="text-isy-green-bright">Tanpa Ribet</span>
              </h1>
              <p className="mt-4 text-[13px] text-isy-ink/55 leading-relaxed max-w-[320px] font-medium">
                Coba langsung koleksi kacamata I See You di wajah kamu secara real-time — gratis, tanpa install apapun.
              </p>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="mt-8 w-full max-w-[380px] space-y-4">
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
                  className="flex items-center gap-1.5 rounded-full border border-isy-green-deep/15 bg-white/40 backdrop-blur-sm px-4 py-2 text-[11px] font-semibold text-isy-ink/60 transition-all duration-200 hover:border-isy-green-bright hover:bg-white/70 hover:text-isy-green-deep hover:-translate-y-px active:scale-95"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Katalog Frame
                </Link>

                <a
                  href={PRICE_LIST_LENSA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-isy-green-deep/15 bg-white/40 backdrop-blur-sm px-4 py-2 text-[11px] font-semibold text-isy-ink/60 transition-all duration-200 hover:border-isy-green-bright hover:bg-white/70 hover:text-isy-green-deep hover:-translate-y-px active:scale-95"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Pricelist Lensa
                </a>

                <a
                  href={konsultasiWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-isy-green-deep/15 bg-white/40 backdrop-blur-sm px-4 py-2 text-[11px] font-semibold text-isy-ink/60 transition-all duration-200 hover:border-isy-green-bright hover:bg-white/70 hover:text-isy-green-deep hover:-translate-y-px active:scale-95"
                >
                  <Image src="/logo/Logo-Whatsapp.png" alt="WA" width={11} height={11} className="h-[11px] w-[11px] object-contain" />
                  Konsultasi Gratis
                </a>

                <a
                  href={SHOPEE_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-white/40 backdrop-blur-sm px-4 py-2 text-[11px] font-semibold text-isy-ink/60 transition-all duration-200 hover:border-orange-400 hover:bg-orange-50/70 hover:text-orange-600 hover:-translate-y-px active:scale-95"
                >
                  <Image src="/logo/Logo-Shoppe.png" alt="Shopee" width={11} height={11} className="h-[11px] w-[11px] object-contain" />
                  Toko Shopee
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Floating Glasses Showcase — no background glow ── */}
          <div className="hidden md:flex items-center justify-center relative py-12">

            {/* Sparkle particle 1 — top-right */}
            <span
              aria-hidden
              className="absolute top-[18%] right-[14%] pointer-events-none"
              style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#2FA84F",
                opacity: 0.55,
                animation: "sparkle-float 3.2s ease-in-out infinite",
                animationDelay: "0s",
              }}
            />
            {/* Sparkle particle 2 — bottom-left */}
            <span
              aria-hidden
              className="absolute bottom-[22%] left-[12%] pointer-events-none"
              style={{
                width: 3.5, height: 3.5, borderRadius: "50%",
                background: "#1B4332",
                opacity: 0.4,
                animation: "sparkle-float 4s ease-in-out infinite",
                animationDelay: "1.1s",
              }}
            />
            {/* Sparkle arc line — subtle curved line */}
            <span
              aria-hidden
              className="absolute top-[28%] left-[8%] pointer-events-none"
              style={{
                width: 28, height: 28,
                borderRadius: "50%",
                border: "1.5px solid rgba(47,168,79,0.25)",
                borderBottomColor: "transparent",
                borderLeftColor: "transparent",
                animation: "sparkle-float 5s ease-in-out infinite reverse",
                animationDelay: "0.6s",
              }}
            />

            <FloatingGlasses
              src="/glasses/aviator-silver.png"
              alt="Aviator Silver — Optik I See You"
              width={440}
              height={220}
            />
          </div>

        </div>
      </section>


      {/* ═══ KATALOG PREVIEW ═══ */}
      <section className="w-full bg-white px-6 py-16 border-t border-isy-line">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center flex flex-col items-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Koleksi Kacamata
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">Katalog Frame I See You</h2>
            <p className="mt-2 text-lg sm:text-xl tracking-[0.2em] text-black font-normal" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              for every you
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG_COLLECTIONS.map((col) => (
              <div key={col.id} className="group relative overflow-hidden rounded-3xl border border-isy-line bg-isy-mist/40 p-6 transition-all hover:shadow-xl hover:border-isy-green-bright/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-[10px] font-black uppercase text-isy-green-bright">
                    {col.badge}
                  </span>
                  <span className="text-xs font-bold text-isy-ink/40">{col.items.length} Model</span>
                </div>
                <h3 className="font-serif text-2xl font-black text-isy-green-deep">{col.title}</h3>
                <p className="mt-1 text-xs text-isy-ink/60">{col.description}</p>
                <div className="mt-4 relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white border border-isy-line">
                  <Image src={col.coverImage || col.images?.[0]} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
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
        </div>
      </section>

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
            Mulai Sekarang — Gratis
          </button>
        </div>
      </section>

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

      {/* ═══ FOOTER — Dark green, two-column layout ═══ */}
      <footer className="w-full" style={{ background: "#1a4a2e" }}>
        {/* Main footer content */}
        <div className="mx-auto max-w-5xl px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">


          {/* LEFT — Brand + description + CTA buttons */}
          <div className="flex flex-col gap-3">
            {/* Logo text — persis seperti foto referensi */}
            <div className="flex flex-col" style={{ lineHeight: 1 }}>
              {/* OPTIK — kecil, letter-spaced */}
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.32em",
                  color: "rgba(255,255,255,0.85)",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                  display: "block",
                }}
              >
                OPTIK
              </span>
              {/* I SEE YOU — besar, serif bold */}
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "30px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "0.01em",
                  lineHeight: 1.05,
                  display: "block",
                }}
              >
                I SEE YOU
              </span>
              {/* for every you — DM Serif italic */}
              <span
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.8)",
                  letterSpacing: "0.22em",
                  marginTop: "3px",
                  display: "block",
                }}
              >
                for every you
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", maxWidth: "260px" }}>
              AR Try-On Kacamata &amp; Photobooth berbasis kamera untuk pengalaman optik yang menyenangkan.
            </p>

            {/* CTA Buttons — horizontal row */}
            <div className="flex flex-wrap gap-2">
              <a
                href={PRICE_LIST_LENSA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/18 px-3.5 py-1.5 text-[11px] font-medium text-white/70 transition-all hover:text-white hover:border-white/30 active:scale-95"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Price List Lensa
              </a>

              <a
                href={SHOPEE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/35 px-3.5 py-1.5 text-[11px] font-medium text-orange-300/80 transition-all hover:text-orange-200 active:scale-95"
                style={{ background: "rgba(249,115,22,0.08)" }}
              >
                <Image src="/logo/Logo-Shoppe.png" alt="Shopee" width={12} height={12} className="h-3 w-3 object-contain" />
                Shopee Store
              </a>

              <a
                href={konsultasiWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-green-400/35 px-3.5 py-1.5 text-[11px] font-medium text-green-300/80 transition-all hover:text-green-200 active:scale-95"
                style={{ background: "rgba(34,197,94,0.08)" }}
              >
                <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={12} height={12} className="h-3 w-3 object-contain" />
                Konsultasi WA
              </a>
            </div>
          </div>

          {/* RIGHT — Instagram Official + Branch Grid + Photobooth CTA */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "#5ec97a" }}>
                INSTAGRAM OFFICIAL
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Follow 4 cabang kami</p>
            </div>

            {/* 2×2 Branch Grid — compact */}
            <div className="grid grid-cols-2 gap-2">
              {BRANCHES.map((b) => (
                <a
                  key={b.id}
                  href={b.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all hover:border-white/20 active:scale-95"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="text-xs font-semibold text-white">
                    {b.city}
                  </span>
                  <span className="text-[10px] font-normal" style={{ color: "#5ec97a" }}>
                    {b.handle}
                  </span>
                </a>
              ))}
            </div>

            {/* Photobooth CTA */}
            <button
              onClick={start}
              className="w-full rounded-lg py-3 text-xs font-semibold uppercase text-white/80 transition-all hover:text-white hover:brightness-110 active:scale-[0.97]"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                letterSpacing: "0.1em",
              }}
            >
              MULAI PHOTOBOOTH SEKARANG →
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="w-full border-t px-10 md:px-20 py-5"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="mx-auto max-w-5xl flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Optik I See You · AR Photobooth &amp; Optical Studio
            </p>
            <div className="flex items-center">
              {BRANCHES.map((b, i) => (
                <span key={b.id} className="flex items-center">
                  <a
                    href={b.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors hover:text-white/60"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {b.city}
                  </a>
                  {i < BRANCHES.length - 1 && (
                    <span className="mx-2 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
