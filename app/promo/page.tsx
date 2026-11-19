import { Metadata } from "next";
import { getPublicPromos, getFeaturedPopupPromo } from "@/lib/db/repository";
import PromoMicrositeHeader from "@/components/promo/PromoMicrositeHeader";
import PromoMicrositeFooter from "@/components/promo/PromoMicrositeFooter";
import PromoMicrositeClient from "@/components/promo/PromoMicrositeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promo & Penawaran Eksklusif | Optik I See You",
  description:
    "Jelajahi promo mingguan, promo bulanan, dan penawaran spesial kacamata, frame titanium, lensa resep, serta softlens resmi di seluruh cabang Optik I See You.",
  alternates: {
    canonical: "https://promo.optikiseeyou.com/",
  },
  openGraph: {
    title: "Promo & Penawaran Eksklusif | Optik I See You",
    description:
      "Temukan diskon kacamata, paket lensa hemat, dan program promo spesial di Optik I See You Purwokerto, Wonosobo, Cilacap, dan Purbalingga.",
    url: "https://promo.optikiseeyou.com/",
    siteName: "Optik I See You",
    locale: "id_ID",
    type: "website",
  },
};

export default async function PromoMicrositePage() {
  const [promos, featuredData] = await Promise.all([
    getPublicPromos(),
    getFeaturedPopupPromo(),
  ]);

  const featuredPromo = featuredData.promo;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-slate-900 selection:bg-[#2FA84F] selection:text-white">
      {/* Header */}
      <PromoMicrositeHeader />

      {/* Hero Section */}
      <section className="relative px-6 sm:px-8 lg:px-12 pt-10 sm:pt-16 pb-8 sm:pb-12 border-b border-[#E3E7DF] bg-[#F8F5ED]">
        <div className="mx-auto max-w-6xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#124734] shadow-2xs">
            Official Promo Center • Optik I See You
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#124734] tracking-tight">
            Promo & Penawaran Eksklusif
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            Dapatkan penawaran terbaik untuk frame kacamata estetik, lensa resep berteknologi tinggi, dan softlens resmi di 4 cabang Optik I See You.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
        <PromoMicrositeClient
          initialPromos={promos}
          featuredPromo={featuredPromo}
        />
      </main>

      {/* Footer */}
      <PromoMicrositeFooter />
    </div>
  );
}
