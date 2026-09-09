import { Suspense } from "react";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import { SOFTLENS_PRODUCTS } from "@/lib/softlens";
import KatalogClient from "./KatalogClient";
import Navbar from "@/components/ui/Navbar";

export default function KatalogPage() {
  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://optikiseeyou.com/katalog#collections",
        name: "Koleksi Frame Kacamata & Softlens Optik I See You",
        description: "Koleksi frame kacamata premium wanita dan pria serta softlens original di Optik I See You.",
        itemListElement: CATALOG_COLLECTIONS.map((col, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            name: col.title,
            description: col.description,
            image: col.coverImage.startsWith("http")
              ? col.coverImage
              : `https://optikiseeyou.com${col.coverImage}`,
            category: "Eyewear Frame",
            brand: {
              "@type": "Brand",
              name: "Optik I See You",
            },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "IDR",
              lowPrice: "150000",
              highPrice: "750000",
              offerCount: col.items.length.toString(),
              availability: "https://schema.org/InStock",
            },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://optikiseeyou.com/katalog#breadcrumb",
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
            name: "Katalog Kacamata & Softlens",
            item: "https://optikiseeyou.com/katalog",
          },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-dvh w-full bg-isy-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-isy-ivory flex items-center justify-center">Loading...</div>}>
        <KatalogClient initialCollections={CATALOG_COLLECTIONS} initialSoftlens={SOFTLENS_PRODUCTS} />
      </Suspense>
    </main>
  );
}

