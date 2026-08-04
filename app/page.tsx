"use client";

/**
 * app/page.tsx — Landing Page, Optik I See You AR Photobooth
 *
 * Sections: Hero -> Katalog -> Fitur -> Cara Kerja -> Cabang & Lokasi -> Footer
 * Simplified per store direction: no emoji, no filler trust-badge row,
 * CTA routes to /start (mode select) instead of straight into the booth.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import manifestRaw from "@/public/glasses/manifest.json";
import BranchCarousel from "@/components/ui/BranchCarousel";

import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";

const manifest = (manifestRaw as { id: string; name: string; style: string; color: string }[]).filter(
  (g) => g.id !== "none"
);

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

      {/* Soft glow, no floating clutter — cleaner per brand direction */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-isy-green-bright/6 blur-[140px]" />

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[85dvh] flex-col items-center justify-center px-6 pt-12 pb-10 text-center">
        <div ref={logoRef} className="mb-5 w-full max-w-[280px] drop-shadow-sm">
          <Image src="/logo.png" alt="Optik I See You" width={640} height={250} className="w-full h-auto" priority />
        </div>

        <div ref={badgeRef} className="mb-6 inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-isy-green-bright">AR Try-On & Photobooth</span>
        </div>

        <div ref={tagRef} className="mb-2">
          <h1 className="font-serif text-4xl font-black leading-[1.1] text-isy-green-deep md:text-6xl">
            Coba Kacamata
            <br />
            <span className="text-isy-green-bright">Tanpa Ribet</span>
          </h1>
          <p className="mt-5 text-sm text-isy-ink/60 leading-relaxed max-w-[320px] mx-auto">
            Coba langsung koleksi kacamata I See You di wajah kamu secara real-time pakai kamera HP atau laptop, gratis.
          </p>
        </div>

        <div ref={ctaRef} className="mt-8 w-full max-w-[360px] space-y-3">
          <button
            onClick={start}
            className="w-full rounded-2xl bg-isy-green-bright py-4 px-6 text-base font-black uppercase tracking-[0.1em] text-white shadow-lg shadow-isy-green-bright/25 transition-all active:scale-[0.97] hover:bg-isy-green-deep"
          >
            Mulai Try-On / Photobooth
          </button>
          <Link
            href="/katalog"
            className="flex items-center justify-center gap-2 rounded-2xl border border-isy-line bg-white/80 py-3.5 px-6 backdrop-blur-sm text-sm font-bold text-isy-green-deep transition-all hover:border-isy-green-bright hover:bg-white active:scale-[0.97]"
          >
            Lihat Katalog Frame
          </Link>
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
            <p className="mt-2 text-sm text-isy-ink/60">Temukan model favoritmu dan coba langsung dengan kamera</p>
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
      <footer className="w-full border-t border-isy-line bg-isy-green-deep px-6 py-10 text-center text-white">
        <Image src="/logo.png" alt="Optik I See You" width={200} height={78} className="mx-auto mb-4 h-14 w-auto brightness-0 invert opacity-90" />
        <p className="text-sm font-semibold opacity-80 mb-1">Optik I See You</p>
        <a
          href="https://www.instagram.com/iseeyou.glasses/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity mb-6"
        >
          @iseeyou.glasses
        </a>
        <div className="mx-auto h-px max-w-xs bg-white/20 mb-6" />
        <p className="text-[11px] opacity-50">Optik I See You · AR Photobooth</p>
        <button
          onClick={start}
          className="mt-5 rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-95"
        >
          Mulai Photobooth
        </button>
      </footer>
    </main>
  );
}
