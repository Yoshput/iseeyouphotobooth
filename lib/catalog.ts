export interface CatalogItem {
  id: string;
  name: string;
  collection: string;
  image: string;
  images: string[];
  specsImage?: string;
  style: string;
  recommendedFor: string[];
  description: string;
  glassesId?: string;
}

export interface CatalogCollection {
  id: string;
  title: string;
  badge: string;
  description: string;
  coverImage: string;
  images: string[];
  items: CatalogItem[];
}

export const CATALOG_COLLECTIONS: CatalogCollection[] = [
  {
    id: "cat-eye-edition",
    title: "Cat Eye Edition",
    badge: "Trending Collection",
    description: "Desain cat-eye ikonis yang memberikan kesan elegan, bold, dan menawan.",
    coverImage: "/katalog/Cat Eye Edition/1.png",
    images: [
      "/katalog/Cat Eye Edition/1.png",
      "/katalog/Cat Eye Edition/2.png",
      "/katalog/Cat Eye Edition/Product Specs.png",
    ],
    items: [
      {
        id: "cateye-1",
        name: "Cat Eye Signature — Gloss Black",
        collection: "Cat Eye Edition",
        image: "/katalog/Cat Eye Edition/1.png",
        images: ["/katalog/Cat Eye Edition/1.png", "/katalog/Cat Eye Edition/Product Specs.png"],
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
        images: ["/katalog/Cat Eye Edition/2.png", "/katalog/Cat Eye Edition/Product Specs.png"],
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
    images: [
      "/katalog/New Collection/1.png",
      "/katalog/New Collection/2.png",
    ],
    items: [
      {
        id: "new-1",
        name: "Metro Square Pro — Matte Black",
        collection: "New Collection",
        image: "/katalog/New Collection/1.png",
        images: ["/katalog/New Collection/1.png"],
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
        images: ["/katalog/New Collection/2.png"],
        style: "Round Wire",
        recommendedFor: ["Square", "Heart", "Diamond"],
        description: "Frame kawat bulat yang halus dan ringan, memberikan kesan retro modern.",
        glassesId: "round-gold",
      },
    ],
  },
  {
    id: "titanium-edition",
    title: "Titanium Edition",
    badge: "Premium Series",
    description: "Koleksi titanium ultralight dengan ketahanan tinggi dan desain minimalis modern.",
    coverImage: "/katalog/Titanium Edition/1.png",
    images: [
      "/katalog/Titanium Edition/1.png",
      "/katalog/Titanium Edition/2.png",
      "/katalog/Titanium Edition/Product Specs.png",
    ],
    items: [
      {
        id: "titanium-1",
        name: "Titanium Pure — Matte Steel",
        collection: "Titanium Edition",
        image: "/katalog/Titanium Edition/1.png",
        images: ["/katalog/Titanium Edition/1.png", "/katalog/Titanium Edition/Product Specs.png"],
        specsImage: "/katalog/Titanium Edition/Product Specs.png",
        style: "Titanium",
        recommendedFor: ["Oval", "Square", "Heart"],
        description: "Frame titanium murni dengan bobot ultra ringan dan ketahanan luar biasa.",
        glassesId: "square-black",
      },
      {
        id: "titanium-2",
        name: "Titanium Air — Gunmetal Gray",
        collection: "Titanium Edition",
        image: "/katalog/Titanium Edition/2.png",
        images: ["/katalog/Titanium Edition/2.png", "/katalog/Titanium Edition/Product Specs.png"],
        specsImage: "/katalog/Titanium Edition/Product Specs.png",
        style: "Titanium",
        recommendedFor: ["Oval", "Round", "Diamond"],
        description: "Gaya profesional yang tipis, presisi, dan sangat nyaman dipakai seharian.",
        glassesId: "round-gold",
      },
    ],
  },
];
