"use client";

/**
 * app/page.tsx — Landing Page, Optik I See You AR Photobooth
 * Tagline: "for every you"
 * High-class minimal luxury optical experience.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import BranchCarousel from "@/components/ui/BranchCarousel";
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
    <div className="relative flex flex-col gap-2 rounded-3xl border border-isy-line bg-white p-6 shadow-sm transition-all duration-300 hover:border-isy-green-bright/50 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl" style={{ background: accent }} />
      <p className="font-bold text-isy-green-deep text-sm">{title}</p>
      <p className="text-xs text-isy-ink/60 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-isy-green-deep text-xl font-black text-white shadow-xl shadow-isy-green-deep/20">
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

      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-isy-green-bright/6 blur-[140px]" />

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[88dvh] flex-col items-center justify-center px-6 pt-10 pb-12 text-center">
        <div ref={logoRef} className="mb-3 w-full max-w-[300px] drop-shadow-sm flex flex-col items-center">
          <Image src="/logo.png" alt="Optik I See You" width={640} height={250} className="w-full h-auto" priority />
          <span className="mt-2 font-serif text-lg italic tracking-[0.25em] text-isy-green-deep/90 font-medium">
            for every you
          </span>
        </div>

        <div ref={badgeRef} className="my-5 inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-isy-green-bright">AR Try-On & Photobooth</span>
        </div>

        <div ref={tagRef} className="mb-2">
          <h1 className="font-serif text-4xl font-black leading-[1.1] text-isy-green-deep md:text-6xl">
            Coba Kacamata
            <br />
            <span className="text-isy-green-bright">Tanpa Ribet</span>
          </h1>
          <p className="mt-4 text-sm text-isy-ink/60 leading-relaxed max-w-[340px] mx-auto font-medium">
            Coba langsung koleksi kacamata I See You di wajah kamu secara real-time pakai kamera HP atau laptop, gratis.
          </p>
        </div>

        {/* Quick Action Grid: AR Try On, Katalog, Pricelist Lensa, Konsultasi */}
        <div ref={ctaRef} className="mt-8 w-full max-w-[420px] space-y-3">
          <button
            onClick={start}
            className="w-full rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-4 px-6 text-base font-black uppercase tracking-[0.1em] text-white shadow-xl shadow-isy-green-bright/25 transition-all hover:scale-[1.02] active:scale-[0.97]"
          >
            Mulai Try-On / Photobooth
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/katalog"
              className="flex items-center justify-center gap-2 rounded-2xl border border-isy-line bg-white/90 py-3 px-4 backdrop-blur-sm text-xs font-bold text-isy-green-deep transition-all hover:border-isy-green-bright hover:bg-white hover:scale-[1.02] active:scale-[0.97]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Katalog Frame
            </Link>

            <a
              href={PRICE_LIST_LENSA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-isy-line bg-white/90 py-3 px-4 backdrop-blur-sm text-xs font-extrabold text-isy-green-deep transition-all hover:border-isy-green-bright hover:bg-white hover:scale-[1.02] active:scale-[0.97]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Price List Lensa
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={konsultasiWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-isy-green-bright/40 bg-isy-green-bright/10 py-3 px-4 text-xs font-black text-isy-green-deep transition-all hover:bg-isy-green-bright hover:text-white hover:scale-[1.02] active:scale-[0.97]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3C8.82 3 3 8.82 3 16c0 2.36.64 4.57 1.76 6.48L3 29l6.73-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.12 18.08c-.26.73-1.51 1.4-2.08 1.48-.57.08-1.1.36-3.71-.77-3.14-1.36-5.15-4.52-5.3-4.73-.15-.21-1.22-1.63-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.58-.38.78-.38h.56c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.08.14.13.31.03.5-.1.19-.14.31-.28.47-.15.16-.3.36-.43.48-.14.12-.29.25-.12.5.16.24.72 1.19 1.55 1.92 1.07.95 1.97 1.24 2.21 1.38.24.13.38.11.52-.07.14-.18.59-.69.75-.93.16-.23.32-.19.54-.11.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.56-.2 1.29z"/></svg>
              Konsultasi Gratis
            </a>

            <a
              href={SHOPEE_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50/90 py-3 px-4 text-xs font-black text-orange-600 transition-all hover:bg-orange-100 hover:scale-[1.02] active:scale-[0.97]"
            >
              <span>🛍️ Toko Shopee</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ KATALOG PREVIEW ═══ */}
      <section className="w-full bg-white px-6 py-16 border-t border-isy-line">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Koleksi Kacamata
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">Katalog Frame I See You</h2>
            <p className="mt-2 font-serif text-sm italic text-isy-green-deep/80">for every you</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
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
                  <Image src={col.coverImage} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
      <section className="w-full bg-white px-6 py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Fitur Unggulan
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">Bukan Photobooth Biasa</h2>
            <p className="mt-1 font-serif text-xs italic text-isy-green-deep/70">for every you</p>
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
            className="mt-12 w-full rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-5 text-base font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-isy-green-bright/30 transition-all hover:scale-[1.02] active:scale-[0.97]"
          >
            Mulai Sekarang — Gratis
          </button>
        </div>
      </section>

      {/* ═══ CABANG & LOKASI ═══ */}
      <section id="lokasi" className="w-full bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-isy-green-bright">
              Kunjungi Kami
            </span>
            <h2 className="font-serif text-3xl font-black text-isy-green-deep">4 Cabang Optik I See You</h2>
            <p className="mt-2 text-sm text-isy-ink/60">Purwokerto · Wonosobo · Cilacap · Purbalingga</p>
          </div>

          <BranchCarousel />
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full border-t border-isy-line bg-isy-green-deep px-6 py-12 text-center text-white">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col items-center">
            <Image src="/logo.png" alt="Optik I See You" width={220} height={86} className="h-14 w-auto brightness-0 invert opacity-95" />
            <span className="mt-2 font-serif text-base italic tracking-[0.25em] text-isy-green-bright/90 font-medium">
              for every you
            </span>
          </div>

          {/* Instagram 4 Cabang Links Grid */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-isy-green-bright mb-3">Instagram Official 4 Cabang</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 max-w-xl mx-auto">
              {BRANCHES.map((b) => (
                <a
                  key={b.id}
                  href={b.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center rounded-2xl border border-white/15 bg-white/5 p-3 transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
                >
                  <span className="text-xs font-black text-white">{b.city}</span>
                  <span className="text-[10px] text-isy-green-bright font-medium">{b.handle}</span>
                </a>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href={PRICE_LIST_LENSA_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/20">📄 Price List Lensa</a>
            <a href={SHOPEE_STORE_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-orange-500/20 border border-orange-400/40 px-4 py-2 text-xs font-bold text-orange-200 hover:bg-orange-500/30">🛍️ Shopee Store</a>
            <a href={konsultasiWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500/20 border border-green-400/40 px-4 py-2 text-xs font-bold text-green-200 hover:bg-green-500/30">💬 Konsultasi WA</a>
          </div>

          <div className="mx-auto h-px max-w-xs bg-white/20" />
          <p className="text-[11px] opacity-60">Optik I See You · AR Photobooth & Optical Studio</p>

          <button
            onClick={start}
            className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/20 active:scale-95"
          >
            Mulai Photobooth
          </button>
        </div>
      </footer>
    </main>
  );
}
