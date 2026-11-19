import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Share2,
  Tag,
  Sparkles,
} from "lucide-react";
import { getPromoBySlug, getPublicPromos } from "@/lib/db/repository";
import {
  isPromoActive,
  formatPromoPeriod,
  formatPromoDate,
  getCategoryLabel,
} from "@/lib/promo";
import PromoMicrositeHeader from "@/components/promo/PromoMicrositeHeader";
import PromoMicrositeFooter from "@/components/promo/PromoMicrositeFooter";
import PromoGalleryCollage from "@/components/promo/PromoGalleryCollage";
import PromoCard from "@/components/promo/PromoCard";

export const dynamic = "force-dynamic";

interface PromoDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PromoDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const promo = await getPromoBySlug(slug);

  if (!promo || !isPromoActive(promo)) {
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
  const promo = await getPromoBySlug(slug);

  if (!promo || !isPromoActive(promo)) {
    notFound();
  }

  const allActive = await getPublicPromos({ limit: 4 });
  const relatedPromos = allActive.filter((p) => p.id !== promo.id).slice(0, 3);

  const period = formatPromoPeriod(promo.startAt, promo.endAt);
  const categoryLabel = getCategoryLabel(promo.category);

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

      {/* Breadcrumbs */}
      <div className="border-b border-[#E3E7DF] bg-white">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/promo" className="hover:text-[#124734] transition-colors">
            Promo
          </Link>
          <span>/</span>
          <span className="font-bold text-[#124734]">{categoryLabel}</span>
          <span>/</span>
          <span className="truncate max-w-[200px] sm:max-w-md text-slate-400">
            {promo.title}
          </span>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-12">
        {/* ═══ 2-COLUMN HERO EDITORIAL SECTION ═══ */}
        <section
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center`}
        >
          {/* Column A: Hero Image */}
          <div
            className={`md:col-span-6 ${
              promo.detailLayout === "image-right"
                ? "md:order-2"
                : "md:order-1"
            }`}
          >
            <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-white border border-[#E3E7DF] shadow-md">
              {promo.heroImageUrl ? (
                <Image
                  src={promo.heroImageUrl}
                  alt={promo.heroImageAlt || promo.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <Tag className="h-10 w-10 mb-2 stroke-[1.5]" />
                  <span className="text-xs">Optik I See You</span>
                </div>
              )}
              <div className="absolute top-4 left-4 z-10">
                <span className="rounded-full bg-[#124734] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                  {categoryLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Column B: Promo Details */}
          <div
            className={`md:col-span-6 space-y-5 ${
              promo.detailLayout === "image-right"
                ? "md:order-1"
                : "md:order-2"
            }`}
          >
            {/* Period Indicator */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-[#124734]">
              <Calendar className="h-3.5 w-3.5 text-[#2FA84F]" />
              <span>Periode: {period}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#124734] tracking-tight leading-tight">
                {promo.title}
              </h1>

              {promo.subtitle && (
                <p className="text-base font-semibold text-[#2FA84F]">
                  {promo.subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal whitespace-pre-line">
              {promo.description || promo.excerpt}
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={
                  promo.ctaUrl ||
                  "https://wa.me/6281390977209?text=Halo%20Optik%20I%20See%20You,%20saya%20tertarik%20dengan%20" +
                    encodeURIComponent(promo.title)
                }
                target={promo.ctaUrl?.startsWith("http") ? "_blank" : undefined}
                rel={promo.ctaUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#208c49] via-[#1b703e] to-[#124734] py-3.5 px-6 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#208c49]/25 hover:scale-102 hover:shadow-xl active:scale-98 transition-all"
              >
                <span>{promo.ctaLabel || "Ambil Promo Sekarang"}</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <Link
                href="/promo"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E3E7DF] bg-white px-4 py-3.5 text-xs font-bold text-[#124734] hover:bg-[#FAF8F3] transition-colors"
              >
                <span>Lihat Promo Lainnya</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ COLLAGE GALLERY SECTION (IF MULTIPLE IMAGES) ═══ */}
        {promo.galleryImages && promo.galleryImages.length > 0 && (
          <section className="pt-4 border-t border-[#E3E7DF]">
            <PromoGalleryCollage
              images={promo.galleryImages}
              layout={promo.collageLayout}
              title={promo.title}
            />
          </section>
        )}

        {/* ═══ TERMS AND CONDITIONS ═══ */}
        {promo.termsAndConditions && (
          <section className="rounded-3xl border border-[#E3E7DF] bg-[#F8F5ED] p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#124734]">
              <CheckCircle2 className="h-5 w-5 text-[#2FA84F]" />
              <h2>Syarat dan Ketentuan Promo</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-7 font-normal">
              {promo.termsAndConditions}
            </div>
          </section>
        )}

        {/* ═══ RELATED ACTIVE PROMOS ═══ */}
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
                href="/promo"
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
