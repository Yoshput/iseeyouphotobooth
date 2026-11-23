import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Gift,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Tv,
  Hotel,
  Flame,
  CookingPot,
  Ticket,
  Glasses,
  Coffee,
  Laptop,
} from "lucide-react";
import { getPromoBySlug, getPublicPromos } from "@/lib/db/repository";
import {
  isPromoActive,
  formatPromoPeriod,
  getCategoryLabel,
  formatBrandText,
} from "@/lib/promo";
import { BRANCHES, branchWhatsappUrl, konsultasiWhatsappUrl } from "@/lib/branches";
import PromoMicrositeHeader from "@/components/promo/PromoMicrositeHeader";
import PromoMicrositeFooter from "@/components/promo/PromoMicrositeFooter";
import PromoGalleryCollage from "@/components/promo/PromoGalleryCollage";
import PromoCard from "@/components/promo/PromoCard";
import PromoDetailActionButtons from "@/components/promo/PromoDetailActionButtons";

export const dynamic = "force-dynamic";

interface PromoDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PromoDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  let promo = await getPromoBySlug(slug);

  if (!promo && (slug.includes("novemblur") || slug.includes("november"))) {
    return {
      title: "Promo NOvemBLUR (Telah Berakhir) | Optik I See You",
      description: "Periode Promo NOvemBLUR di Optik I See You telah berakhir pada 20 November 2026.",
    };
  }

  if (!promo) {
    return {
      title: "Promo Tidak Ditemukan | Optik I See You",
    };
  }

  const title = `${promo.seoTitle || promo.title} | Promo Optik I See You`;
  const description =
    promo.seoDescription ||
    promo.excerpt ||
    "Informasi promo resmi Optik I See You Purwokerto, Wonosobo, Cilacap, dan Purbalingga.";
  const canonicalUrl = `https://promo.optikiseeyou.com/${promo.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Optik I See You",
      locale: "id_ID",
      type: "article",
      images: promo.heroImageUrl
        ? [
            {
              url: promo.heroImageUrl,
              alt: promo.heroImageAlt || promo.title,
            },
          ]
        : [],
    },
  };
}

export default async function PromoDetailPage({ params }: PromoDetailPageProps) {
  const { slug } = await params;
  let promo = await getPromoBySlug(slug);

  if (!promo && (slug.includes("novemblur") || slug.includes("november"))) {
    // Graceful fallback for NOvemBLUR so visitors from cached links see that it has ended
    promo = {
      id: "promo-novemblur-isy-2026",
      slug: "promo-novemblur-isy",
      title: "Promo NOvemBLUR — Bebas Blur Setiap Hari",
      subtitle: "Diskon 15% Bawa Kacamata Lama | 10% Tanpa Kacamata Lama + Tambahan 5% Khusus Member",
      excerpt: "Promo mingguan NOvemBLUR telah berakhir pada 20 November 2026.",
      description: "Promo NOvemBLUR berlaku khusus pada periode 16 – 20 November 2026 dan saat ini telah berakhir.",
      category: "weekly",
      status: "published",
      startAt: "2026-11-16T00:00:00+07:00",
      endAt: "2026-11-20T23:59:59+07:00",
      heroImageUrl: "/PROMO/novemblur-isy-display.webp",
      heroImageAlt: "Promo NOvemBLUR Optik I See You",
      galleryImages: [],
      detailLayout: "image-left",
      collageLayout: "grid-2",
      termsAndConditions: "Periode promo telah berakhir pada 20 November 2026.",
      showOnHomepage: false,
      showInPopup: false,
      popupPriority: 0,
      sortOrder: 99,
      createdAt: "2026-11-16T00:00:00+07:00",
      updatedAt: "2026-11-20T23:59:59+07:00",
      createdBy: "Owner Optik I See You",
    };
  }

  if (!promo) {
    notFound();
  }

  const isExpired = !isPromoActive(promo);

  const allActive = await getPublicPromos({ limit: 4 });
  const relatedPromos = allActive.filter((p) => p.id !== promo.id).slice(0, 3);

  const period = formatPromoPeriod(promo.startAt, promo.endAt);
  const categoryLabel = getCategoryLabel(promo.category);

  const isUndian = promo.slug.includes("undian");
  const isHariGuru = promo.slug.includes("guru");
  const isNovemblur = promo.slug.includes("novemblur");
  const isAntifog = promo.slug.includes("antifog");

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SpecialAnnouncement",
    name: promo.title,
    text: promo.excerpt || promo.description,
    datePosted: promo.createdAt,
    expires: promo.endAt || undefined,
    url: `https://promo.optikiseeyou.com/${promo.slug}`,
    category: promo.category,
    image: promo.heroImageUrl || undefined,
    publisher: {
      "@type": "Organization",
      name: "Optik I See You",
      url: "https://optikiseeyou.com",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-slate-900 selection:bg-[#2FA84F] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PromoMicrositeHeader showBackToAll={true} />

      {/* Expired Promo Graceful Warning Banner */}
      {isExpired && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3.5 px-4 text-center text-xs sm:text-sm font-semibold text-amber-900 flex flex-wrap items-center justify-center gap-2">
          <span>⚠️ Periode promo ini telah berakhir pada {period}. Silakan lihat penawaran promo terbaru kami yang sedang aktif.</span>
          <Link
            href="/promo"
            className="inline-flex items-center gap-1 rounded-xl bg-[#124734] px-3 py-1 text-xs font-bold text-white hover:bg-[#0D2F1D] transition-colors ml-1"
          >
            <span>Lihat Promo Aktif</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Sub-Navigation Ribbon (Inspired by Optik Melawai) */}
      <div className="sticky top-16 sm:top-20 z-30 border-b border-[#E3E7DF] bg-[#FAF8F3]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-6 overflow-x-auto text-xs font-bold text-[#124734] admin-scrollbar">
            <a href="#tentang" className="px-2.5 py-1 rounded-lg hover:bg-[#124734]/10 transition-colors shrink-0">
              Tentang Promo
            </a>
            <a href="#hadiah" className="px-2.5 py-1 rounded-lg hover:bg-[#124734]/10 transition-colors shrink-0">
              {isUndian ? "Daftar Hadiah" : "Penawaran & Diskon"}
            </a>
            <a href="#mekanisme" className="px-2.5 py-1 rounded-lg hover:bg-[#124734]/10 transition-colors shrink-0">
              Mekanisme
            </a>
            <a href="#syarat" className="px-2.5 py-1 rounded-lg hover:bg-[#124734]/10 transition-colors shrink-0">
              Syarat & Ketentuan
            </a>
            <a href="#cabang" className="px-2.5 py-1 rounded-lg hover:bg-[#124734]/10 transition-colors shrink-0">
              Lokasi 4 Cabang
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span>Kategori:</span>
            <span className="font-bold text-[#124734]">{categoryLabel}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16 sm:space-y-20">
        {/* ═══ SECTION 1: HERO CAMPAIGN SHOWCASE (2-COLUMN EDITORIAL) ═══ */}
        <section id="tentang" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Column A: Poster Visual (Full Uncropped 4:5 Aspect Ratio, WebP) */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden bg-white border border-[#E3E7DF] shadow-2xl p-2 sm:p-3">
              {promo.heroImageUrl ? (
                <Image
                  src={promo.heroImageUrl}
                  alt={promo.heroImageAlt || promo.title}
                  width={1200}
                  height={1500}
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full h-auto object-contain block rounded-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-16">
                  <span className="text-xs">Optik I See You</span>
                </div>
              )}
            </div>
          </div>

          {/* Column B: Editorial Narrative & Action */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2FA84F]">
                Tentang Promo & Program
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#124734] tracking-tight leading-tight">
                {formatBrandText(promo.title)}
              </h1>
              {promo.subtitle && (
                <p className="text-base sm:text-lg font-bold text-[#208c49]">
                  {formatBrandText(promo.subtitle)}
                </p>
              )}
            </div>

            {/* Clean Period Indicator (No AI shape border) */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
              <Calendar className="h-4 w-4 text-[#2FA84F] shrink-0" />
              <span>Periode Promo: <strong className="text-slate-800">{period}</strong></span>
            </div>

            {/* Narrative Description */}
            <div className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal whitespace-pre-line space-y-2">
              {promo.description || promo.excerpt}
            </div>

            {/* Action Buttons with 4-Branch WhatsApp Modal */}
            <PromoDetailActionButtons
              promoTitle={promo.title}
              ctaLabel={promo.ctaLabel}
              ctaUrl={promo.ctaUrl}
            />
          </div>
        </section>

        {/* ═══ SECTION 2: HADIAH & PENAWARAN (Modeled on Optik Melawai) ═══ */}
        <section id="hadiah" className="space-y-6 pt-4 border-t border-[#E3E7DF]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2FA84F]">
              {isUndian ? "Hadiah Menanti Anda" : "Rincian Penawaran"}
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#124734]">
              {isUndian
                ? "Hadiah Spektakuler Undian Akhir Tahun"
                : isHariGuru
                ? "Diskon Spesial Hari Guru & Pelajar"
                : isNovemblur
                ? "Skema Diskon Promo NOvemBLUR"
                : "Keunggulan Lensa Antifog Blueray"}
            </h2>
          </div>

          {/* Grand Highlight Showcase Card */}
          {isUndian && (
            <div className="rounded-3xl bg-gradient-to-br from-[#124734] to-[#0D2F1D] text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                    Hadiah Utama Paling Dinanti
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    TV Android & Tiket Menginap Hotel
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                    Nikmati hiburan maksimal di rumah dengan TV Android resolusi tinggi, serta pengalaman liburan berkesan bersama keluarga dengan voucher menginap di hotel pilihan.
                  </p>
                </div>
                <div className="md:col-span-4 flex md:justify-end">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center p-2">
                      <Tv className="h-6 w-6 text-emerald-300" />
                      <span className="text-[9px] font-bold mt-1">TV Android</span>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center p-2">
                      <Hotel className="h-6 w-6 text-emerald-300" />
                      <span className="text-[9px] font-bold mt-1">Tiket Hotel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isHariGuru && (
            <div className="rounded-3xl bg-gradient-to-br from-[#124734] to-[#0D2F1D] text-white p-6 sm:p-10 shadow-xl">
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                  Apresiasi Guru, Dosen, Pelajar & Mahasiswa
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Potongan Hingga 20% Frame Kacamata
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
                  Nikmati diskon 20% untuk pembelian frame kacamata dengan paket lensa 1 Fokus dan diskon 15% untuk paket lensa 2 Fokus. Cukup tunjukkan kartu identitas pelajar atau kartu pengajar saat bertransaksi di kasir cabang Optik I See You.
                </p>
              </div>
            </div>
          )}

          {isNovemblur && (
            <div className="rounded-3xl bg-gradient-to-br from-[#124734] to-[#0D2F1D] text-white p-6 sm:p-10 shadow-xl">
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                  Penawaran Tukar Tambah Terbesar
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Diskon 15% — Cukup Bawa Kacamata Lama
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
                  Bawa kacamata lama Anda dalam kondisi apapun ke kasir cabang Optik I See You dan dapatkan potongan langsung 15% untuk paket frame dan lensa baru pilihan Anda.
                </p>
              </div>
            </div>
          )}

          {isAntifog && (
            <div className="rounded-3xl bg-gradient-to-br from-[#124734] to-[#0D2F1D] text-white p-6 sm:p-10 shadow-xl">
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                  Solusi Pandangan Jernih
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Potongan Harga Up to Rp 300.000
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
                  Tingkatkan kenyamanan penglihatan dengan Lensa Antifog Blueray. Bebas embun saat minum kopi panas atau memakai masker, plus perlindungan maksimal dari sinar radiasi gawai.
                </p>
              </div>
            </div>
          )}

          {/* 4 Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isUndian && (
              <>
                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Flame className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Kompor Gas 2 Tungku</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Perlengkapan memasak modern & efisien untuk mempercantik dapur rumah Anda.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <CookingPot className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Magiccom Digital</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pemasak nasi digital serbaguna dengan teknologi pemanas merata.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Voucher Rp250.000</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kupon belanja kacamata atau softlens untuk transaksi berikutnya.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Gift className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Merchandise Eksklusif</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Souvenir resmi Optik I See You untuk transaksi selama masa promo.
                  </p>
                </div>
              </>
            )}

            {isHariGuru && (
              <>
                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Glasses className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Diskon 20% Frame 1 Fokus</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Paket lensa Single Vision untuk membaca, komputer, dan aktivitas belajar harian.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Gift className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Diskon 15% Frame 2 Fokus</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Solusi kacamata lensa bifokal atau progresif untuk penglihatan jauh dan dekat sekaligus.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Gratis Cek Mata Digital</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pemeriksaan refraksi mata akurat dan konsultasi bersama refraksionis resmi.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Koleksi 100+ Frame</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bebas pilih model frame estetik, ringan, dan nyaman untuk aktivitas mengajar & kuliah.
                  </p>
                </div>
              </>
            )}

          {isNovemblur && (
              <>
                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Glasses className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Diskon 10% Langsung</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Berlaku untuk pembelian kacamata lengkap tanpa membawa kacamata lama.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Tambahan 5% Member</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Potongan ekstra khusus pelanggan setia yang terdaftar sebagai Member.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Gratis Cek Mata Digital</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pemeriksaan mata akurat bersama refraksionis optik berijazah resmi.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Koleksi 100+ Frame</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bebas pilih frame titanium, cat-eye, bulat, dan model estetik terkini.
                  </p>
                </div>
              </>
            )}

            {isAntifog && (
              <>
                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Anti Embun Panas</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pandangan tetap bening saat menyeruput kopi hangat, makan mie, atau memakai masker.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Laptop className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Proteksi Blueray</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Menyaring radiasi sinar biru berbahaya dari laptop, tablet, dan smartphone.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Lapisan Hydrophobic</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Permukaan licin anti-gores, anti-minyak, dan sangat mudah dibersihkan.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-2 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#124734] flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#2FA84F]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Lab CNC Presisi</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pemotongan lensa kacamata dilakukan dengan mesin CNC otomatis berpresisi tinggi.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══ SECTION 3: MEKANISME & CARA MENGIKUTI ═══ */}
        <section id="mekanisme" className="space-y-6 pt-4 border-t border-[#E3E7DF]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2FA84F]">
              Cara Ikutan
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#124734]">
              3 Langkah Mudah Mengikuti Promo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#E3E7DF] bg-white p-6 space-y-3 shadow-xs">
              <span className="text-2xl font-black text-[#2FA84F]">01</span>
              <h3 className="text-base font-bold text-[#124734]">
                Kunjungi Cabang Resmi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Datang langsung ke salah satu dari 4 cabang Optik I See You terdekat di Purwokerto, Purbalingga, Wonosobo, atau Cilacap.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E3E7DF] bg-white p-6 space-y-3 shadow-xs">
              <span className="text-2xl font-black text-[#2FA84F]">02</span>
              <h3 className="text-base font-bold text-[#124734]">
                Periksa Mata & Pilih Kacamata
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dapatkan pemeriksaan refraksi mata gratis secara akurat dan pilih koleksi frame yang sesuai dengan bentuk wajah Anda.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E3E7DF] bg-white p-6 space-y-3 shadow-xs">
              <span className="text-2xl font-black text-[#2FA84F]">03</span>
              <h3 className="text-base font-bold text-[#124734]">
                Klaim Benefit di Kasir
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isUndian
                  ? "Selesaikan transaksi kacamata lengkap dan Anda langsung menerima kupon undian fisik untuk diundi di akhir periode!"
                  : "Dapatkan potongan harga diskon langsung saat menyelesaikan pembayaran di kasir cabang kami."}
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4: VISUAL CAMPAIGN & ASYMMETRICAL COLLAGE ═══ */}
        {promo.galleryImages && promo.galleryImages.length > 0 && (
          <section className="pt-4 border-t border-[#E3E7DF]">
            <PromoGalleryCollage
              images={promo.galleryImages}
              layout={promo.collageLayout}
              title={promo.title}
            />
          </section>
        )}

        {/* ═══ SECTION 5: SYARAT & KETENTUAN ═══ */}
        {promo.termsAndConditions && (
          <section id="syarat" className="rounded-3xl border border-[#E3E7DF] bg-[#F8F5ED] p-6 sm:p-10 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-[#124734]">
              <CheckCircle2 className="h-5 w-5 text-[#2FA84F]" />
              <h2>Syarat dan Ketentuan Promo</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-7 font-normal">
              {promo.termsAndConditions}
            </div>
          </section>
        )}

        {/* ═══ SECTION 6: LOKASI 4 CABANG RESMI ═══ */}
        <section id="cabang" className="space-y-6 pt-4 border-t border-[#E3E7DF]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2FA84F]">
              Kunjungi Kami Langsung
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#124734]">
              Lokasi 4 Cabang Resmi Optik I See You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BRANCHES.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-[#E3E7DF] bg-white p-5 space-y-3 shadow-xs hover:border-[#124734] transition-colors"
              >
                <div className="flex items-center gap-2 text-[#124734] font-bold text-sm">
                  <MapPin className="h-4 w-4 text-[#2FA84F] shrink-0" />
                  <span>Cabang {b.city}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[48px]">
                  {b.address}
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={branchWhatsappUrl(
                      b,
                      `Halo Optik I See You cabang ${b.city}, saya ingin tanya tentang ${promo.title}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#124734] hover:text-[#2FA84F]"
                  >
                    <span>Hubungi Cabang</span>
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 7: PROMO LAINNYA ═══ */}
        {relatedPromos.length > 0 && (
          <section className="pt-8 border-t border-[#E3E7DF] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#124734]">
                  Promo Lainnya yang Sedang Berlangsung
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Temukan penawaran menarik lainnya di cabang Optik I See You
                </p>
              </div>

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#124734] hover:underline"
              >
                <span>Semua Promo</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPromos.map((rel) => (
                <PromoCard key={rel.id} promo={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <PromoMicrositeFooter />
    </div>
  );
}
