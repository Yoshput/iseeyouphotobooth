import { Suspense } from "react";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import { SOFTLENS_PRODUCTS } from "@/lib/softlens";
import KatalogClient from "./KatalogClient";
import Navbar from "@/components/ui/Navbar";

export default function KatalogPage() {
  // Extract all catalog items for metadata schema with verified data only
  const allProducts = CATALOG_COLLECTIONS.flatMap((col) => col.items);

  const catalogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://optikiseeyou.com/katalog#products",
        name: "Koleksi Frame Kacamata Optik I See You",
        description:
          "Katalog bingkai kacamata optik dan sunglasses original di cabang Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
        itemListElement: allProducts.map((item, idx) => {
          const productObj: Record<string, any> = {
            "@type": "Product",
            name: item.name,
            description: item.description,
            image: item.image?.startsWith("http")
              ? item.image
              : `https://optikiseeyou.com${item.image}`,
            category: "Eyewear Frame",
            brand: {
              "@type": "Brand",
              name: "Optik I See You",
            },
          };

          if (item.sku) {
            productObj.sku = item.sku;
          }

          if (item.material) {
            productObj.material = item.material;
          }

          // Only output offers when verified price is present. Zero fabrication.
          if (typeof item.price === "number" && item.price > 0) {
            productObj.offers = {
              "@type": "Offer",
              priceCurrency: "IDR",
              price: item.price.toString(),
            };
          }

          return {
            "@type": "ListItem",
            position: idx + 1,
            item: productObj,
          };
        }),
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
            name: "Katalog Frame Kacamata",
            item: "https://optikiseeyou.com/katalog",
          },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-dvh w-full bg-[#FAF8F3] overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center text-sm font-semibold text-[#1B4332]">
            Memuat Katalog Frame...
          </div>
        }
      >
        <KatalogClient
          initialCollections={CATALOG_COLLECTIONS}
          initialSoftlens={SOFTLENS_PRODUCTS}
        />
      </Suspense>
    </main>
  );
}
