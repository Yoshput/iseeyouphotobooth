"use client";

/**
 * app/page.tsx - Landing Page, Optik I See You AR Photobooth
 * Slogan Logo: /logo/Logo-ForEveryYou.png (Prominent, Proportional Sizing)
 *
 * Includes:
 * - Fixed & translucent glassmorphism Navbar on scroll
 * - Official image logo /logo/Logo-ForEveryYou.png across sections (balanced size)
 * - Interactive action cards for Pricelist Lensa, Konsultasi Gratis (WA), Shopee Official Store
 * - Instagram 4 Cabang links (@iseeyou.glasses, @iseeyou.wonosobo, @iseeyou.cilacap, @iseeyou.purbalingga)
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import BranchCarousel from "@/components/ui/BranchCarousel";
import FloatingGlasses from "@/components/ui/FloatingGlasses";
import EyeExamFacilitySection from "@/components/ui/EyeExamFacilitySection";
import LandingVideoShowcase from "@/components/ui/LandingVideoShowcase";
import AboutRefractionBookingSection from "@/components/ui/AboutRefractionBookingSection";
import RunningCatalogFeed from "@/components/landing/RunningCatalogFeed";
import GoogleReviewsSection from "@/components/ui/GoogleReviewsSection";
import BlogShowcaseSection from "@/components/ui/BlogShowcaseSection";
import LocalFaqSection from "@/components/ui/LocalFaqSection";
import Navbar from "@/components/ui/Navbar";
import BranchWhatsAppModal from "@/components/ui/BranchWhatsAppModal";
import Link from "next/link";
import { ScanFace, Sparkles, Camera, QrCode, Eye } from "lucide-react";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import {
  BRANCHES,
  PRICE_LIST_LENSA_URL,
  SHOPEE_STORE_URL,
  konsultasiWhatsappUrl,
  mapsDirectionsUrl,
} from "@/lib/branches";

function ModernFeatureCard({
  icon: Icon,
  title,
  tag,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tag: string;
  desc: string;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-isy-green-bright/40 hover:shadow-xl hover:shadow-isy-green-bright/5">
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-isy-green-deep transition-all duration-300 group-hover:bg-isy-green-deep group-hover:text-white shadow-xs">
            <Icon className="h-5 w-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-isy-green-bright transition-colors">
            {tag}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-isy-green-deep transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
          {desc}
        </p>
      </div>
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-isy-green-deep transition-colors">
        <span>Pengalaman Interaktif</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isBranchWAModalOpen, setIsBranchWAModalOpen] = useState(false);

  const logoRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(logoRef.current, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
        .fromTo(tagRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2")
        .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    });
    return () => ctx.revert();
  }, []);

  const start = () => router.push("/start");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://optikiseeyou.com/#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Di mana saja lokasi cabang Optik I See You di Jawa Tengah?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Optik I See You memiliki 4 cabang resmi: 1) Purwokerto (Jl. Sunan Ampel No.5, Sumbang), 2) Purbalingga (Jl. Onje No.1, Purbalingga Lor), 3) Wonosobo (Jl. Jenderal Soedirman, Sumberan Selatan), dan 4) Cilacap (Jl. Rinjani Depan Perum GRP No.2 Ruko No.3)."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah periksa mata di Optik I See You Purwokerto & cabang lainnya gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ya, Optik I See You menyediakan layanan Konsultasi & Cek Mata Gratis dengan Autorefractor digital komputerisasi dan Trial Lens Set oleh tenaga refraksi berpengalaman."
        }
      },
      {
        "@type": "Question",
        "name": "Berapa lama proses pembuatan kacamata faset otomatis di Optik I See You?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dengan dukungan Mesin Pemotong Lensa CNC Otomatis berteknologi 3D Frame Tracing di lab optik kami, pembuatan kacamata resep standar dapat diselesaikan secara Express (bisa ditunggu)."
        }
      },
      {
        "@type": "Question",
        "name": "Bagaimana cara mencoba kacamata secara online dengan AR Try-On di optikiseeyou.com?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Anda cukup membuka fitur Mulai Coba AR di website optikiseeyou.com menggunakan kamera HP, laptop, atau tablet. Teknologi AR Face Landmark 3D akan memindai proporsi wajah secara real-time dan menampilkan bentuk frame kacamata secara presisi tanpa perlu instalasi aplikasi."
        }
      }
    ]
  };

  return (
    <main className="relative w-full overflow-x-hidden bg-isy-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      {/* Soft glow background */}
      {/* ═══ HERO EDITORIAL SECTION ═══ */}
      <section className="relative min-h-[85dvh] flex items-center justify-center px-6 md:px-12 lg:px-20 pt-24 sm:pt-28 pb-14 bg-[#F8F5ED]">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── LEFT: Editorial Typography & Stacked CTAs ── */}
          <div className="flex flex-col items-start text-left justify-center">

            {/* Eyebrow badge */}
            <div ref={logoRef} className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#124734]">
                Optik I See You • For Every You
              </span>
            </div>

            {/* Editorial Headline with vibrant 2-tone colors */}
            <div ref={tagRef}>
              <h1 className="font-extrabold leading-[1.14] tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                <span className="text-[#124734] block">Temukan frame</span>
                <span className="bg-gradient-to-r from-[#208c49] via-[#1b703e] to-[#124734] bg-clip-text text-transparent block">
                  yang terasa seperti kamu.
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#626C65] leading-relaxed max-w-lg font-normal">
                Jelajahi koleksi kacamata dan softlens, coba frame secara virtual, atau kunjungi cabang terdekat.
              </p>
            </div>

            {/* Action Buttons: Stacked layout with vibrant gradient matching Screenshot 3 */}
            <div ref={ctaRef} className="mt-7 w-full max-w-[440px] space-y-3.5">
              {/* Primary CTA: Mulai Try-On / Photobooth */}
              <button
                type="button"
                onClick={start}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#208c49] via-[#1b703e] to-[#124734] py-4 px-6 text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-[#208c49]/25 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                <span>MULAI TRY-ON / PHOTOBOOTH</span>
              </button>

              {/* Secondary CTA: Antri Cek Mata & Konsultasi */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("antrian-cek-mata");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    router.push("#antrian-cek-mata");
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#124734]/25 bg-white/95 backdrop-blur-md py-4 px-6 text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.08em] text-[#124734] shadow-md shadow-black/5 transition-all duration-200 hover:border-[#124734] hover:bg-[#FAF8F3] hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#208c49] group-hover:scale-110 transition-transform"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>ANTRI CEK MATA &amp; KONSULTASI</span>
              </button>

              {/* Supporting CTA below Antrian Cek Mata */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <Link
                  href="/katalog"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1.5 text-xs font-bold text-[#124734] shadow-2xs hover:border-[#124734] hover:bg-[#FAF8F3] transition-colors"
                >
                  <span>Jelajahi Katalog Frame</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/softlens"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1.5 text-xs font-bold text-[#124734] shadow-2xs hover:border-[#124734] hover:bg-[#FAF8F3] transition-colors"
                >
                  <span>Katalog Softlens</span>
                </Link>
                <Link
                  href="/cabang"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1.5 text-xs font-bold text-[#124734] shadow-2xs hover:border-[#124734] hover:bg-[#FAF8F3] transition-colors"
                >
                  <span>4 Cabang Resmi</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Authentic Floating Glasses Showcase ── */}
          <div className="flex flex-col items-center justify-center relative py-4 sm:py-6 w-full">
            <FloatingGlasses
              items={[
                {
                  src: "/glasses/hero-glasses-black.webp",
                  alt: "Frame Hitam Kacamata Optik I See You",
                },
                {
                  src: "/glasses/hero-glasses-champagne.webp",
                  alt: "Frame Champagne Crystal Kacamata Optik I See You",
                },
              ]}
              width={520}
              height={260}
            />

            {/* 3 Authentic Quick Action Buttons below Floating Glasses */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 z-10">
              <button
                type="button"
                onClick={() => setIsBranchWAModalOpen(true)}
                aria-label="Hubungi WhatsApp 4 Cabang Resmi Optik I See You"
                title="Chat WhatsApp 4 Cabang"
                className="flex items-center gap-2 rounded-xl bg-white border border-[#E3E7DF] px-3.5 py-2 text-xs font-semibold text-[#124734] hover:border-[#124734] hover:shadow-sm transition-all"
              >
                <Image
                  src="/logo/Logo-Whatsapp.webp"
                  alt="WhatsApp"
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 object-contain"
                />
                <span>WhatsApp Cabang</span>
              </button>

              <a
                href={SHOPEE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi toko Shopee resmi Optik I See You"
                title="Toko Shopee Official"
                className="flex items-center gap-2 rounded-xl bg-white border border-[#E3E7DF] px-3.5 py-2 text-xs font-semibold text-[#626C65] hover:border-[#D4875A] hover:text-[#D4875A] transition-all"
              >
                <Image
                  src="/logo/Logo-Shoppe.webp"
                  alt="Shopee"
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 object-contain"
                />
                <span>Shopee Official</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("lokasi");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    router.push("#lokasi");
                  }
                }}
                aria-label="Lihat Lokasi 4 Cabang di Google Maps"
                title="Lihat Lokasi Cabang"
                className="flex items-center gap-2 rounded-xl bg-white border border-[#E3E7DF] px-3.5 py-2 text-xs font-semibold text-[#626C65] hover:border-[#124734] hover:text-[#124734] transition-all"
              >
                <Image
                  src="/logo/Logo-Gmaps.webp"
                  alt="Google Maps"
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 object-contain"
                />
                <span>Peta Cabang</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ KATALOG BERJALAN: FEED RSM MARQUEE ═══ */}
      <RunningCatalogFeed />

      {/* ═══ CINEMATIC VIDEO SHOWCASE ═══ */}
      <LandingVideoShowcase />

      {/* ═══ FITUR - Redesigned Commercial Aesthetic ═══ */}
      <section className="w-full bg-white px-6 py-20 border-t border-isy-line">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center flex flex-col items-center max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-isy-green-deep tracking-tight">
              Bukan Photobooth Biasa
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              Eksplorasi teknologi AR fitting kacamata dan studio foto digital modern dalam satu pengalaman visual yang intuitif.
            </p>
            <p className="mt-2 text-base sm:text-lg tracking-[0.2em] text-black font-normal" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              for every you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <ModernFeatureCard
              icon={ScanFace}
              tag="Face Analysis"
              title="Deteksi Bentuk Wajah"
              desc="Kamera otomatis mengidentifikasi proporsi wajah secara real-time dan merekomendasikan model frame paling proporsional."
            />
            <ModernFeatureCard
              icon={Sparkles}
              tag="3D Virtual Fit"
              title="AR Try-On Real-Time"
              desc="Kacamata virtual 3D langsung menempel presisi di wajah, bergerak dinamis mengikuti rotasi kepala tanpa jeda."
            />
            <ModernFeatureCard
              icon={Camera}
              tag="Studio Photo"
              title="Photobooth Studio"
              desc="Mode foto studio resolusi tinggi dengan aneka template frame eksklusif khas Optik I See You yang siap diabadikan."
            />
            <ModernFeatureCard
              icon={QrCode}
              tag="Instant Save"
              title="QR Scan & Unduh"
              desc="Pindai kode QR langsung dari layar untuk mengunduh foto jernih ke galeri ponsel kamu dalam hitungan detik."
            />
          </div>
        </div>
      </section>

      {/* ═══ PAGE 5: ANTRIAN CEK MATA & KONSULTASI ═══ */}
      <AboutRefractionBookingSection />

      {/* ═══ PAGE 6: ALAT DAN FASILITAS LABORATORIUM ═══ */}
      <EyeExamFacilitySection />

      {/* ═══ QUIZ CTA SECTION ═══ */}
      <section className="w-full bg-gradient-to-b from-[#0F3822] via-[#0D2F1D] to-[#0A2417] px-6 py-20 text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-[#2FA84F]/15 blur-[120px]" />
        
        <div className="mx-auto max-w-2xl relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            Cari Tahu <span className="text-[#2FA84F]">Frame DNA</span><br />
            Kamu!
          </h2>
          <p className="text-white/85 text-base md:text-lg mb-10 max-w-lg mx-auto font-normal">
            Quiz 5 menit untuk temukan frame yang cocok sama bentuk wajah dan kepribadian kamu.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2FA84F] to-[#10B981] px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#2FA84F]/35 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#2FA84F]/50 active:scale-95"
          >
            <span>MULAI QUIZ FRAME DNA</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ═══ PAGE 7: TESTIMONI / GOOGLE BUSINESS REVIEWS ═══ */}
      <GoogleReviewsSection />

      {/* ═══ PAGE 7.5: BILLBOARD BLOG & EDUKASI SHOWCASE ═══ */}
      <BlogShowcaseSection />

      {/* ═══ PAGE 8: CABANG & LOKASI MAPS ═══ */}
      <section id="lokasi" className="w-full bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-sans text-isy-green-deep tracking-tight">Cabang Optik I See You</h2>
            <p className="mt-2 text-sm text-isy-ink/60">Purwokerto · Wonosobo · Cilacap · Purbalingga</p>
            <p className="mt-2 text-base sm:text-lg tracking-[0.2em] text-black font-normal" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              for every you
            </p>
          </div>

          <BranchCarousel />
        </div>
      </section>

      {/* ═══ PAGE 9: FAQ & PERTANYAAN ═══ */}
      <LocalFaqSection />

      {/* ═══ 2-WARNA GRADASI: PUTIH KE HIJAU EMERALD SAMPAI BAWAH ═══ */}
      <div
        className="relative w-full h-32 sm:h-44 lg:h-52 -mt-px -mb-px pointer-events-none select-none"
        style={{
          background: "linear-gradient(to bottom, #FFFFFF 0%, #0D2F1D 100%)",
        }}
      />

      {/* ═══ FOOTER - Luxury Emerald Multi-Column Layout ═══ */}
      <footer className="w-full bg-[#0D2F1D] text-white">
        {/* Main 4-Column Footer Content */}
        <div className="mx-auto max-w-6xl px-6 sm:px-10 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Link href="/" className="inline-block group focus:outline-none">
                <Image
                  src="/logo/logo-isy-putih-cropped.png"
                  alt="Optik I See You"
                  width={220}
                  height={75}
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </Link>
              <p
                className="text-[12px] tracking-[0.22em] text-white/70 font-medium italic select-none"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                for every you
              </p>
            </div>

            <p className="text-xs text-white/65 leading-relaxed">
              Optik kacamata &amp; softlens estetik modern terpercaya sejak 2019 dengan 4 cabang resmi di Purwokerto, Purbalingga, Wonosobo, dan Cilacap.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={SHOPEE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A87C]/35 px-3 py-1 text-[11px] font-semibold text-orange-300 transition-all hover:bg-[#D4875A]/20 active:scale-95"
              >
                <Image src="/logo/Logo-Shoppe.png" alt="Shopee" width={12} height={12} className="h-3 w-3 object-contain" />
                Shopee
              </a>
              <button
                type="button"
                onClick={() => setIsBranchWAModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-isy-green-bright/35 px-3 py-1 text-[11px] font-semibold text-teal-300 transition-all hover:bg-isy-green-bright/20 active:scale-95 cursor-pointer"
              >
                <Image src="/logo/Logo-Whatsapp.png" alt="WhatsApp" width={12} height={12} className="h-3 w-3 object-contain" />
                WhatsApp 4 Cabang
              </button>
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
              <li>
                <Link href="/home-service" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Layanan Home Service (Ke Rumah)
                </Link>
              </li>
              <li>
                <Link href="/sponsor" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Pengajuan Sponsor Event / Komunitas
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">›</span> Blog &amp; Edukasi Kacamata
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Cabang Resmi & Alamat */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#5ec97a]">
              Cabang Resmi
            </h4>
            <div className="space-y-3 text-xs">
              {BRANCHES.map((b) => (
                <div key={b.id} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/cabang/${b.id}`}
                      className="font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      Optik I See You {b.city}
                    </Link>
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
              className="mt-2 w-full rounded-xl bg-[#2FA84F] hover:bg-[#258e42] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#2FA84F]/30 transition-all active:scale-95 cursor-pointer"
            >
              Mulai Photobooth AR →
            </button>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar - Unified Emerald Green */}
        <div className="border-t border-white/10 px-6 sm:px-10 py-5 text-xs text-white/60">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-xs font-medium text-white/70">
                &copy; 2019 &ndash; 2026 Optik I See You. All Rights Reserved.
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Layanan optik terpercaya, periksa mata digital, faset presisi CNC, dan AR Try-On interaktif.
              </p>
            </div>

            {/* Legal & Developer Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-white/60">
              <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <span className="text-white/20">&bull;</span>
              <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">
                Syarat &amp; Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ MODAL POPUP WHATSAPP 4 CABANG ═══ */}
      <BranchWhatsAppModal
        isOpen={isBranchWAModalOpen}
        onClose={() => setIsBranchWAModalOpen(false)}
      />
    </main>
  );
}
