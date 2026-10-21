import { Suspense } from "react";
import { CATALOG_COLLECTIONS, CatalogCollection, CatalogItem } from "@/lib/catalog";
import { SOFTLENS_PRODUCTS } from "@/lib/softlens";
import { getFrames } from "@/lib/db/repository";
import KatalogClient from "./KatalogClient";
import Navbar from "@/components/ui/Navbar";

export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  let collections: CatalogCollection[] = CATALOG_COLLECTIONS;

  try {
    const liveFrames = await getFrames({ onlyPublished: true });
    if (liveFrames && liveFrames.length > 0) {
      // Group live frames by collection
      const collectionMap = new Map<string, CatalogCollection>();

      // Pre-populate with existing collection meta
      for (const col of CATALOG_COLLECTIONS) {
        collectionMap.set(col.title.toLowerCase(), {
          ...col,
          items: [],
        });
      }

      for (const frame of liveFrames) {
        const key = frame.collection.toLowerCase();
        let targetCol = collectionMap.get(key);

        if (!targetCol) {
          targetCol = {
            id: `col-${frame.collection.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            title: frame.collection,
            badge: frame.shape,
            description: frame.description || `Koleksi ${frame.collection} Optik I See You`,
            coverImage: frame.image,
            images: frame.images || [frame.image],
            items: [],
          };
          collectionMap.set(key, targetCol);
        }

        targetCol.items.push(frame as unknown as CatalogItem);
      }

      // Filter out empty collections and convert to array
      collections = Array.from(collectionMap.values()).filter((col) => col.items.length > 0);
    }
  } catch (err) {
    console.warn("Falling back to static catalog collections:", err);
  }

  // Extract all catalog items for metadata schema with verified data only
  const allProducts = collections.flatMap((col) => col.items);

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
          initialCollections={collections}
          initialSoftlens={SOFTLENS_PRODUCTS}
        />
      </Suspense>
    </main>
  );
}
