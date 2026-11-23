"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MessageCircle,
  Tv,
  Hotel,
  Flame,
  CookingPot,
  Ticket,
  Coffee,
  Laptop,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  MapPin,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { PromoItem } from "@/lib/db/types";
import { BRANCHES, KONSULTASI_WA_NUMBER, branchWhatsappUrl } from "@/lib/branches";
import { formatPromoPeriod, formatBrandText, isPromoActive } from "@/lib/promo";
import BranchWhatsAppModal from "@/components/ui/BranchWhatsAppModal";

interface PromoMicrositeClientProps {
  initialPromos: PromoItem[];
  featuredPromo: PromoItem | null;
}

export default function PromoMicrositeClient({
  initialPromos,
}: PromoMicrositeClientProps) {
  // Lightbox state with zoom level
  const [zoomedImage, setZoomedImage] = useState<{
    url: string;
    alt: string;
    title: string;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomedImage(null);
        setZoomLevel(1);
      }
    };
    if (zoomedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [zoomedImage]);

  // Accordion state for Syarat & Ketentuan per promo ID
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  // 4-Branch WhatsApp modal state
  const [activeBranchPromo, setActiveBranchPromo] = useState<PromoItem | null>(null);

  const toggleTerms = useCallback((id: string) => {
    setExpandedTerms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Sort only currently active promos:
  // 1. Undian Akhir Tahun 2026 (Special)
  // 2. Special Hari Guru (Weekly)
  // 3. Promo Lensa Antifog Blueray (Monthly)
  const orderedPromos = [...initialPromos]
    .filter((p) => isPromoActive(p))
    .sort((a, b) => {
      const order = (slug: string) => {
        if (slug.includes("undian")) return 1;
        if (slug.includes("guru") || slug.includes("mingguan")) return 2;
        if (slug.includes("lensa") || slug.includes("antifog")) return 3;
        return 4;
      };
      return order(a.slug) - order(b.slug);
    });

  // Dedicated promo campaigns resolved safely by slug keywords
  const undianPromo = orderedPromos.find((p) => p.slug.includes("undian"));
  const hariGuruPromo = orderedPromos.find((p) => p.slug.includes("guru"));
  const antifogPromo = orderedPromos.find(
    (p) => p.slug.includes("antifog") || p.slug.includes("lensa")
  );
  const otherPromos = orderedPromos.filter(
    (p) => p !== undianPromo && p !== hariGuruPromo && p !== antifogPromo
  );

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Empty State when no promo is active */}
      {orderedPromos.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#E3E7DF] bg-white p-12 text-center space-y-4">
          <p className="text-base font-bold text-[#124734]">Saat Ini Belum Ada Promo Aktif</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Nantikan promo mingguan dan penawaran spesial berikutnya dari Optik I See You. Silakan kunjungi cabang resmi kami untuk konsultasi dan pemeriksaan refraksi gratis.
          </p>
        </div>
      )}
      {/* =========================================================================
          CAMPAIGN 1: UNDIAN AKHIR TAHUN 2026 (Dark Forest Luxury Spread)
          ========================================================================= */}
      {undianPromo && (
        <section
          id={undianPromo.slug}
          className="relative rounded-3xl bg-gradient-to-br from-[#103E2E] via-[#0E3527] to-[#082218] text-white p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden border border-emerald-800/40"
        >
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#2FA84F]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#E5B54F]/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Essential Editorial Details */}
            <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
              {/* Period Date (Clean text, no artificial AI pill) */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-300">
                <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  Periode: {formatPromoPeriod(undianPromo.startAt, undianPromo.endAt)}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {formatBrandText(undianPromo.title)}
                </h2>
                <p className="text-sm sm:text-base font-semibold text-emerald-200">
                  {formatBrandText(undianPromo.subtitle || "Gebyar Hadiah & Promo Spesial Akhir Tahun")}
                </p>
              </div>

              {/* Clean Narrative */}
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-xl">
                {undianPromo.excerpt ||
                  "Sambut kemeriahan akhir tahun bersama Optik I See You! Setiap transaksi pembelian kacamata lengkap (frame + lensa) di seluruh cabang resmi berhak mendapatkan kupon undian berhadiah istimewa."}
              </p>

              {/* Grand Prizes Grid */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#E5B54F]">
                  Daftar Hadiah Undian:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xs px-3 py-2.5 border border-white/10 text-xs font-bold text-white">
                    <Tv className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span>TV Android</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xs px-3 py-2.5 border border-white/10 text-xs font-bold text-white">
                    <Hotel className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span>Tiket Hotel Liburan</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xs px-3 py-2.5 border border-white/10 text-xs font-bold text-white">
                    <Flame className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span>Kompor Gas 2 Tungku</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xs px-3 py-2.5 border border-white/10 text-xs font-bold text-white">
                    <CookingPot className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span>Magiccom Digital</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xs px-3 py-2.5 border border-white/10 text-xs font-bold text-white col-span-2 sm:col-span-2">
                    <Ticket className="h-4 w-4 text-[#E5B54F] shrink-0" />
                    <span>Voucher Kacamata Rp 250.000</span>
                  </div>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveBranchPromo(undianPromo)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#2FA84F] hover:bg-[#25873f] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-[#2FA84F]/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Klaim Undian di Cabang</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTerms(undianPromo.id)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-4 py-3.5 text-xs font-bold border border-white/15 transition-colors"
                >
                  <span>Syarat & Ketentuan</span>
                  {expandedTerms[undianPromo.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <Link
                  href={`/${undianPromo.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white px-2 py-2 transition-colors ml-auto"
                >
                  <span>Halaman Lengkap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Collapsible Syarat & Ketentuan Accordion */}
              {expandedTerms[undianPromo.id] && (
                <div className="rounded-2xl bg-black/30 border border-white/15 p-4 sm:p-5 text-xs text-white/80 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="font-bold text-white text-[11px] uppercase tracking-wider">
                    Ketentuan Mengikuti Undian:
                  </p>
                  <div className="whitespace-pre-line leading-relaxed text-xs">
                    {undianPromo.termsAndConditions ||
                      "1. Periode promo berlangsung mulai 1 November hingga 31 Desember 2026.\n2. Berlaku untuk seluruh pelanggan di 4 cabang resmi (Purwokerto, Purbalingga, Wonosobo, Cilacap).\n3. Setiap transaksi pembelian kacamata lengkap (frame + lensa) berhak mendapatkan kupon undian.\n4. Pengundian akan diumumkan secara terbuka di Instagram resmi @iseeyou.glasses."}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Authentic High-Res WebP Poster (Fail-safe natural height) */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <div
                onClick={() => {
                  setZoomLevel(1);
                  setZoomedImage({
                    url: "/PROMO/undian-akhir-tahun.webp",
                    alt: undianPromo.title,
                    title: undianPromo.title,
                  });
                }}
                className="group relative w-full max-w-[400px] cursor-pointer rounded-3xl overflow-hidden bg-black/30 border-2 border-white/20 shadow-2xl transition-all duration-300 hover:scale-102 hover:border-emerald-400/50"
              >
                <Image
                  src={undianPromo.heroImageUrl || "/PROMO/undian-akhir-tahun-display.webp"}
                  alt={undianPromo.heroImageAlt || undianPromo.title}
                  width={1200}
                  height={1500}
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full h-auto object-contain block transition-transform duration-500 group-hover:scale-102"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          CAMPAIGN 2: SPECIAL HARI GURU (Clean Warm Cream Alternating Spread)
          ========================================================================= */}
      {hariGuruPromo && (
        <section
          id={hariGuruPromo.slug}
          className="relative rounded-3xl bg-[#FAF8F3] border border-[#E3E7DF] p-6 sm:p-10 lg:p-12 shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Authentic High-Res Poster */}
            <div className="lg:col-span-5 flex justify-center order-1">
              <div
                onClick={() => {
                  setZoomLevel(1);
                  setZoomedImage({
                    url: hariGuruPromo.heroImageUrl || "/PROMO/promo-hari-guru.webp",
                    alt: hariGuruPromo.title,
                    title: hariGuruPromo.title,
                  });
                }}
                className="group relative w-full max-w-[400px] cursor-pointer rounded-3xl overflow-hidden bg-white border-2 border-[#E3E7DF] shadow-xl transition-all duration-300 hover:scale-102 hover:border-[#124734]/40"
              >
                <Image
                  src={hariGuruPromo.heroImageUrl || "/PROMO/promo-hari-guru-display.webp"}
                  alt={hariGuruPromo.heroImageAlt || hariGuruPromo.title}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full h-auto object-contain block transition-transform duration-500 group-hover:scale-102"
                />
              </div>
            </div>

            {/* Right Column: Essential Editorial Details */}
            <div className="lg:col-span-7 space-y-5 order-2">
              {/* Period Date */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#124734]">
                <Calendar className="h-4 w-4 text-[#2FA84F] shrink-0" />
                <span>
                  Periode: {formatPromoPeriod(hariGuruPromo.startAt, hariGuruPromo.endAt)}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#124734] tracking-tight leading-tight">
                  {formatBrandText(hariGuruPromo.title)}
                </h2>
                <p className="text-sm sm:text-base font-semibold text-slate-700">
                  {formatBrandText(hariGuruPromo.subtitle || "Diskon 20% & 15% Frame untuk Guru, Dosen, Pelajar & Mahasiswa")}
                </p>
              </div>

              {/* Narrative */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                {hariGuruPromo.excerpt ||
                  "Spesial Hari Guru! Dapatkan potongan diskon hingga 20% untuk frame kacamata 1 Fokus dan 15% untuk 2 Fokus bagi seluruh Guru, Pelajar, dan Mahasiswa."}
              </p>

              {/* Discount Offer Highlights */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Skema Diskon Tersedia:
                </p>
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-[#E3E7DF] shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#124734] font-black text-sm">
                        20%
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#124734]">
                          Frame Paket Lensa 1 Fokus
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Single Vision untuk membaca, komputer, dan gawai
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      Paling Populer
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-[#E3E7DF] shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#124734] font-black text-sm">
                        15%
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#124734]">
                          Frame Paket Lensa 2 Fokus
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Solusi lensa bifokal / progresif jauh dan dekat
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-3.5 border border-emerald-200 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#124734] text-white font-black text-xs">
                        GRATIS
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#124734]">
                          Pemeriksaan Refraksi Digital
                        </p>
                        <p className="text-[11px] text-emerald-900">
                          Cek mata komputer akurat bersama refraksionis resmi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveBranchPromo(hariGuruPromo)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#124734] hover:bg-[#0D2F1D] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-[#124734]/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{hariGuruPromo.ctaLabel || "Klaim Promo Hari Guru"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTerms(hariGuruPromo.id)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white hover:bg-slate-50 text-[#124734] px-4 py-3.5 text-xs font-bold border border-[#E3E7DF] transition-colors"
                >
                  <span>Syarat & Ketentuan</span>
                  {expandedTerms[hariGuruPromo.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <Link
                  href={`/${hariGuruPromo.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#124734] hover:text-[#2FA84F] px-2 py-2 transition-colors ml-auto"
                >
                  <span>Halaman Lengkap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Collapsible Syarat & Ketentuan Accordion */}
              {expandedTerms[hariGuruPromo.id] && (
                <div className="rounded-2xl bg-white border border-[#E3E7DF] p-4 sm:p-5 text-xs text-slate-600 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="font-bold text-[#124734] text-[11px] uppercase tracking-wider">
                    Ketentuan Promo Hari Guru:
                  </p>
                  <div className="whitespace-pre-line leading-relaxed text-xs">
                    {hariGuruPromo.termsAndConditions ||
                      "1. Periode promo berlaku terbatas mulai 23 hingga 26 November 2026.\n2. Diskon 20% berlaku untuk pembelian frame kacamata dengan paket lensa 1 Fokus (Single Vision).\n3. Diskon 15% berlaku untuk pembelian frame kacamata dengan paket lensa 2 Fokus (Bifokal atau Progresif).\n4. Berlaku khusus untuk Guru, Dosen, Pelajar, dan Mahasiswa dengan menunjukkan kartu identitas aktif.\n5. Berlaku di 4 cabang resmi: Purwokerto, Purbalingga, Wonosobo, Cilacap."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          CAMPAIGN 3: PROMO LENSA ANTIFOG BLUERAY (Modern Fresh Studio Spread)
          ========================================================================= */}
      {antifogPromo && (
        <section
          id={antifogPromo.slug}
          className="relative rounded-3xl bg-white border border-[#E3E7DF] p-6 sm:p-10 lg:p-12 shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Essential Editorial Details */}
            <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
              {/* Period Date */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800">
                <Calendar className="h-4 w-4 text-[#2FA84F] shrink-0" />
                <span>
                  Periode: {formatPromoPeriod(antifogPromo.startAt, antifogPromo.endAt)}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#124734] tracking-tight leading-tight">
                  {formatBrandText(antifogPromo.title)}
                </h2>
                <p className="text-sm sm:text-base font-semibold text-slate-700">
                  {formatBrandText(
                    antifogPromo.subtitle ||
                      "Embun? Ada Antifog! Nikmati Penglihatan Jernih Bebas Embun & Proteksi Sinar Biru"
                  )}
                </p>
              </div>

              {/* Narrative */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                {antifogPromo.excerpt ||
                  "Embun saat minum kopi panas atau pakai masker mengganggu aktivitasmu? Upgrade ke Lensa Antifog Blueray berteknologi hidrofobik mutakhir dengan potongan harga spesial hingga Rp300.000 selama bulan November 2026."}
              </p>

              {/* Benefits Grid */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Keunggulan Lensa Antifog Blueray:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#FAF8F3] p-3.5 border border-[#E3E7DF] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#124734]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-black">
                        Rp
                      </span>
                      <span>Potongan Up to 300rb</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Hemat maksimal untuk upgrade lensa resep berkualitas
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF8F3] p-3.5 border border-[#E3E7DF] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#124734]">
                      <Coffee className="h-4 w-4 text-[#2FA84F]" />
                      <span>Bebas Embun</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Tidak buram saat minum kopi panas atau memakai masker
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF8F3] p-3.5 border border-[#E3E7DF] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#124734]">
                      <Laptop className="h-4 w-4 text-[#2FA84F]" />
                      <span>Filter Sinar Biru</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Mata tidak cepat lelah saat menatap layar gadget & monitor
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveBranchPromo(antifogPromo)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#208c49] to-[#124734] hover:opacity-95 text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-[#124734]/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{antifogPromo.ctaLabel || "Konsultasi Lensa Antifog"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTerms(antifogPromo.id)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FAF8F3] hover:bg-slate-100 text-[#124734] px-4 py-3.5 text-xs font-bold border border-[#E3E7DF] transition-colors"
                >
                  <span>Syarat & Ketentuan</span>
                  {expandedTerms[antifogPromo.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <Link
                  href={`/${antifogPromo.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#124734] hover:text-[#2FA84F] px-2 py-2 transition-colors ml-auto"
                >
                  <span>Halaman Lengkap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Collapsible Syarat & Ketentuan Accordion */}
              {expandedTerms[antifogPromo.id] && (
                <div className="rounded-2xl bg-[#FAF8F3] border border-[#E3E7DF] p-4 sm:p-5 text-xs text-slate-600 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="font-bold text-[#124734] text-[11px] uppercase tracking-wider">
                    Ketentuan Lensa Antifog:
                  </p>
                  <div className="whitespace-pre-line leading-relaxed text-xs">
                    {antifogPromo.termsAndConditions ||
                      "1. Promo berlaku selama bulan November 2026.\n2. Berlaku untuk seluruh pembelian lensa Antifog Blueray di 4 cabang resmi.\n3. Potongan hingga Rp300.000 berlaku sesuai tipe lensa dan indeks resep yang dipilih.\n4. Refraksi mata gratis langsung dilakukan oleh refraksionis optik."}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Authentic High-Res Poster (Fail-safe natural height) */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <div
                onClick={() => {
                  setZoomLevel(1);
                  setZoomedImage({
                    url: "/PROMO/lensa-antifog-blueray.webp",
                    alt: antifogPromo.title,
                    title: antifogPromo.title,
                  });
                }}
                className="group relative w-full max-w-[400px] cursor-pointer rounded-3xl overflow-hidden bg-[#FAF8F3] border-2 border-[#E3E7DF] shadow-xl transition-all duration-300 hover:scale-102 hover:border-[#124734]/40"
              >
                <Image
                  src={antifogPromo.heroImageUrl || "/PROMO/lensa-antifog-blueray-display.webp"}
                  alt={antifogPromo.heroImageAlt || antifogPromo.title}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full h-auto object-contain block transition-transform duration-500 group-hover:scale-102"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          OTHER DYNAMIC PROMO CAMPAIGNS (Added or edited via Admin CMS)
          ========================================================================= */}
      {otherPromos.map((promo, idx) => (
        <section
          key={promo.id}
          id={promo.slug}
          className={`relative rounded-3xl ${
            idx % 2 === 0 ? "bg-[#FAF8F3]" : "bg-white"
          } border border-[#E3E7DF] p-6 sm:p-10 lg:p-12 shadow-lg overflow-hidden`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800">
                <Calendar className="h-4 w-4 text-[#2FA84F] shrink-0" />
                <span>Periode: {formatPromoPeriod(promo.startAt, promo.endAt)}</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#124734] tracking-tight leading-tight">
                  {formatBrandText(promo.title)}
                </h2>
                {promo.subtitle && (
                  <p className="text-sm sm:text-base font-semibold text-slate-700">
                    {formatBrandText(promo.subtitle)}
                  </p>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                {promo.excerpt}
              </p>
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveBranchPromo(promo)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#124734] hover:bg-[#0D2F1D] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{promo.ctaLabel || "Klaim di Cabang"}</span>
                </button>
                {promo.termsAndConditions && (
                  <button
                    type="button"
                    onClick={() => toggleTerms(promo.id)}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FAF8F3] hover:bg-slate-100 text-[#124734] px-4 py-3.5 text-xs font-bold border border-[#E3E7DF] transition-colors"
                  >
                    <span>Syarat & Ketentuan</span>
                    {expandedTerms[promo.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
                <Link
                  href={`/${promo.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#124734] hover:text-[#2FA84F] px-2 py-2 transition-colors ml-auto"
                >
                  <span>Halaman Lengkap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {expandedTerms[promo.id] && promo.termsAndConditions && (
                <div className="rounded-2xl bg-white border border-[#E3E7DF] p-4 sm:p-5 text-xs text-slate-600 space-y-2 animate-in fade-in duration-200">
                  <p className="font-bold text-[#124734] text-[11px] uppercase tracking-wider">Syarat & Ketentuan:</p>
                  <div className="whitespace-pre-line leading-relaxed text-xs">{promo.termsAndConditions}</div>
                </div>
              )}
            </div>
            {promo.heroImageUrl && (
              <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
                <div
                  onClick={() => {
                    setZoomLevel(1);
                    setZoomedImage({
                      url: promo.heroImageUrl,
                      alt: promo.title,
                      title: promo.title,
                    });
                  }}
                  className="group relative w-full max-w-[400px] cursor-pointer rounded-3xl overflow-hidden bg-[#FAF8F3] border-2 border-[#E3E7DF] shadow-xl transition-all duration-300 hover:scale-102 hover:border-[#124734]/40"
                >
                  <Image
                    src={promo.heroImageUrl}
                    alt={promo.heroImageAlt || promo.title}
                    width={1200}
                    height={1500}
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="w-full h-auto object-contain block transition-transform duration-500 group-hover:scale-102"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* =========================================================================
          4 CABANG RESMI DIRECTORY SECTION (Direct store access)
          ========================================================================= */}
      <section className="rounded-3xl bg-[#F8F5ED] border border-[#E3E7DF] p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3E7DF] pb-4">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-[#124734]">
              Kunjungi 4 Cabang Resmi Optik I See You
            </h3>
            <p className="text-xs text-slate-600">
              Klaim promo di cabang terdekat dengan fasilitas pemeriksaan mata gratis & refraksionis tersertifikasi.
            </p>
          </div>
          <a
            href="https://optikiseeyou.com/cabang"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124734] hover:text-[#2FA84F] transition-colors shrink-0"
          >
            <span>Semua Info Cabang</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BRANCHES.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white border border-[#E3E7DF] p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#124734]/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#2FA84F] shrink-0" />
                  <h4 className="text-sm font-black text-[#124734]">
                    Optik I See You {b.city}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {b.address}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={branchWhatsappUrl(
                    b,
                    `Halo Optik I See You cabang ${b.city}, saya mau klaim promo di cabang.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-[#124734] hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="h-3 w-3 text-[#2FA84F]" />
                  <span>Chat Cabang</span>
                </a>

                {b.googleMapsUrl && (
                  <a
                    href={b.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#124734]"
                  >
                    <span>Peta</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE LIGHTBOX MODAL WITH ZOOM & PAN CONTROLS
          ========================================================================= */}
      {zoomedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setZoomedImage(null);
            setZoomLevel(1);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[95vh] max-w-4xl w-full rounded-3xl bg-[#0D2F1D] border border-white/20 p-3 sm:p-5 shadow-2xl flex flex-col items-center overflow-hidden"
          >
            {/* Header Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 px-1 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">{zoomedImage.title}</span>
                <span className="text-[10px] text-emerald-300 font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                  WebP HD • Zoom {zoomLevel.toFixed(1)}x
                </span>
              </div>

              {/* Action Buttons: Zoom & Close */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Perbesar (+)"
                  aria-label="Perbesar gambar"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Perkecil (-)"
                  aria-label="Perkecil gambar"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Reset Ukuran (1x)"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomedImage(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ml-2"
                  title="Tutup (Esc)"
                  aria-label="Tutup preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Poster Canvas Viewport */}
            <div className="relative w-full max-h-[80vh] overflow-auto flex items-center justify-center p-2 rounded-2xl bg-black/40 my-2 admin-scrollbar">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                className="transition-transform duration-200 w-full max-w-lg flex items-center justify-center cursor-zoom-in"
                onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
              >
                <Image
                  src={zoomedImage.url}
                  alt={zoomedImage.alt}
                  width={2160}
                  height={2700}
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="w-full h-auto max-h-[75vh] object-contain rounded-xl select-none"
                />
              </div>
            </div>

            {/* Bottom info */}
            <div className="w-full pt-1 px-1 flex items-center justify-between text-white/70 text-[11px]">
              <span>Ketuk gambar atau gunakan tombol zoom untuk memperbesar detail teks dan voucher</span>
              <a
                href={zoomedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Buka Berkas Asli</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          4-BRANCH WHATSAPP SELECTION MODAL (Matches Screenshot 2)
          ========================================================================= */}
      <BranchWhatsAppModal
        isOpen={Boolean(activeBranchPromo)}
        onClose={() => setActiveBranchPromo(null)}
        title="Pilih WhatsApp Cabang Terdekat"
        description={
          activeBranchPromo
            ? `Silakan hubungi admin cabang kota Anda untuk klaim ${activeBranchPromo.title}:`
            : "Silakan hubungi admin cabang kota Anda:"
        }
        customMessage={(branch) =>
          activeBranchPromo
            ? `Halo Optik I See You cabang ${branch.city}, saya mau klaim ${activeBranchPromo.title}. Mohon info syarat dan ketentuannya ya!`
            : `Halo Optik I See You cabang ${branch.city}, saya mau tanya info promo di toko.`
        }
      />
    </div>
  );
}