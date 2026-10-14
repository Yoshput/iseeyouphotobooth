import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import SoftlensClient from "./SoftlensClient";
import { SOFTLENS_SERIES_LIST } from "@/lib/softlens";

export const metadata: Metadata = {
  title: "Katalog Softlens Resmi Kemenkes RI | Optik I See You",
  description:
    "Koleksi softlens warna natural, lensa kontak bening bulanan, serta cairan pembersih steril resmi berizin Kemenkes RI di Optik I See You Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
  openGraph: {
    title: "Katalog Softlens Resmi Kemenkes RI | Optik I See You",
    description:
      "Temukan lensa kontak nyaman untuk mata minus dan normal serta cairan steril resmi di Optik I See You.",
    url: "https://optikiseeyou.com/softlens",
    siteName: "Optik I See You",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://optikiseeyou.com/softlens",
  },
};

export default function SoftlensPage() {
  const softlensSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://optikiseeyou.com/softlens#products",
        name: "Katalog Softlens dan Perawatan Optik I See You",
        description:
          "Daftar softlens dan cairan pembersih steril resmi berizin Kemenkes RI di Optik I See You.",
        itemListElement: SOFTLENS_SERIES_LIST.map((series, idx) => {
          const itemObj: Record<string, any> = {
            "@type": "Product",
            name: series.name,
            description: series.description,
            image: series.coverImage?.startsWith("http")
              ? series.coverImage
              : `https://optikiseeyou.com${series.coverImage}`,
            category: series.category,
            brand: {
              "@type": "Brand",
              name: series.brand || "Optik I See You",
            },
          };

          // Verified pricing only — zero fabrication
          if (typeof series.basePrice === "number" && series.basePrice > 0) {
            itemObj.offers = {
              "@type": "Offer",
              priceCurrency: "IDR",
              price: series.basePrice.toString(),
              availability: "https://schema.org/InStock",
            };
          }

          return {
            "@type": "ListItem",
            position: idx + 1,
            item: itemObj,
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://optikiseeyou.com/softlens#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: "https://optikiseeyou.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Katalog Softlens",
            item: "https://optikiseeyou.com/softlens",
          },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-dvh w-full bg-[#F8F5ED] overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softlensSchema) }}
      />
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F8F5ED] flex items-center justify-center text-sm font-semibold text-[#124734]">
            Memuat Katalog Softlens...
          </div>
        }
      >
        <SoftlensClient />
      </Suspense>
    </main>
  );
}
