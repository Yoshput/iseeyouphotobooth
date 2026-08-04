export interface CatalogItem {
  id: string;
  name: string;
  collection: string;
  image: string;
  specsImage?: string;
  style: string;
  recommendedFor: string[];
  description: string;
  glassesId?: string; // Maps to AR glasses manifest entry if available
}

export interface CatalogCollection {
  id: string;
  title: string;
  badge: string;
  description: string;
  coverImage: string;
  items: CatalogItem[];
}

export const CATALOG_COLLECTIONS: CatalogCollection[] = [
  {
    id: "cat-eye-edition",
    title: "Cat Eye Edition",
    badge: "Trending Collection",
    description: "Desain cat-eye ikonis yang memberikan kesan elegan, bold, dan menawan.",
    coverImage: "/katalog/Cat Eye Edition/1.png",
    items: [
      {
        id: "cateye-1",
        name: "Cat Eye Signature — Gloss Black",
        collection: "Cat Eye Edition",
        image: "/katalog/Cat Eye Edition/1.png",
        specsImage: "/katalog/Cat Eye Edition/Product Specs.png",
        style: "Cat-Eye",
        recommendedFor: ["Heart", "Oval", "Round"],
        description: "Frame cat-eye elegan dengan sudut tegas dan finishing gloss premium.",
        glassesId: "cateye-tortoise",
      },
      {
        id: "cateye-2",
        name: "Cat Eye Velvet — Amber Tortoise",
        collection: "Cat Eye Edition",
        image: "/katalog/Cat Eye Edition/2.png",
        specsImage: "/katalog/Cat Eye Edition/Product Specs.png",
        style: "Cat-Eye",
        recommendedFor: ["Heart", "Oval", "Diamond"],
        description: "Warna tortoise eksklusif dengan gagang titanium yang sangat ringan.",
        glassesId: "cateye-tortoise",
      },
    ],
  },
  {
    id: "new-collection",
    title: "New Collection",
    badge: "Rilisan Terbaru",
    description: "Koleksi kacamata kekinian dengan material ringan dan anti-radiasi.",
    coverImage: "/katalog/New Collection/1.png",
    items: [
      {
        id: "new-1",
        name: "Metro Square Pro — Matte Black",
        collection: "New Collection",
        image: "/katalog/New Collection/1.png",
        style: "Square",
        recommendedFor: ["Round", "Oval", "Diamond"],
        description: "Desain persegi kontemporer dengan sudut halus, cocok untuk aktivitas harian.",
        glassesId: "square-black",
      },
      {
        id: "new-2",
        name: "Aero Wire — Champagne Gold",
        collection: "New Collection",
        image: "/katalog/New Collection/2.png",
        style: "Round Wire",
        recommendedFor: ["Square", "Heart", "Diamond"],
        description: "Frame kawat bulat yang halus dan ringan, memberikan kesan retro modern.",
        glassesId: "round-gold",
      },
    ],
  },
];
