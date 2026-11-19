import { Metadata } from "next";
import { getPublicPromos, getFeaturedPopupPromo } from "@/lib/db/repository";
import PromoMicrositeHeader from "@/components/promo/PromoMicrositeHeader";
import PromoMicrositeFooter from "@/components/promo/PromoMicrositeFooter";
import PromoMicrositeClient from "@/components/promo/PromoMicrositeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promo & Undian Resmi | Optik I See You",
  description:
    "Portal promosi resmi Optik I See You: Undian Akhir Tahun 2026, Promo NOvemBLUR Diskon Hingga 15%, dan Promo Lensa Antifog Blueray di 4 cabang resmi.",
  alternates: {
    canonical: "https://promo.optikiseeyou.com/",
  },
  openGraph: {
    title: "Promo & Undian Resmi | Optik I See You",
    description:
      "Temukan program Undian Akhir Tahun berhadiah TV Android & Tiket Hotel, diskon kacamata NOvemBLUR, dan potongan lensa Antifog di 4 cabang Optik I See You.",
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

      {/* Subtle Top Indicator */}
      <div className="bg-[#F8F5ED] border-b border-[#E3E7DF] py-2.5 px-4 text-center">
        <p className="text-[11px] sm:text-xs font-bold text-[#124734] flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2FA84F] animate-pulse" />
          <span>Program Promosi & Undian Resmi Optik I See You — Berlaku di 4 Cabang</span>
        </p>
      </div>

      {/* Main Content Area: Stacked Editorial Spreads */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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