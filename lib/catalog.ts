export interface CatalogItem {
  id: string;
  name: string;
  collection: string;
  images: string[];        // All product images (slideshow)
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
  images: string[];        // All images for slideshow in collection banner
  items: CatalogItem[];
}

export const CATALOG_COLLECTIONS: CatalogCollection[] = [
  {
    id: "cat-eye-edition",
    title: "Cat Eye Edition",
    badge: "Trending Collection",
    description: "Desain cat-eye ikonis yang memberikan kesan elegan, bold, dan menawan.",
    images: [
      "/katalog/Cat Eye Edition/1.png",
      "/katalog/Cat Eye Edition/2.png",
      "/katalog/Cat Eye Edition/Product Specs.png",
    ],
    items: [
      {
        id: "cateye-1",
        name: "Cat Eye Edition — Model 1",
        collection: "Cat Eye Edition",
        images: [
          "/katalog/Cat Eye Edition/1.png",
          "/katalog/Cat Eye Edition/Product Specs.png",
        ],
        specsImage: "/katalog/Cat Eye Edition/Product Specs.png",
        style: "Cat-Eye",
        recommendedFor: ["Heart", "Oval", "Round"],
        description: "Frame cat-eye elegan dengan sudut tegas dan finishing premium.",
        glassesId: "cateye-tortoise",
      },
      {
        id: "cateye-2",
        name: "Cat Eye Edition — Model 2",
        collection: "Cat Eye Edition",
        images: [
          "/katalog/Cat Eye Edition/2.png",
          "/katalog/Cat Eye Edition/Product Specs.png",
        ],
        specsImage: "/katalog/Cat Eye Edition/Product Specs.png",
        style: "Cat-Eye",
        recommendedFor: ["Heart", "Oval", "Diamond"],
        description: "Warna eksklusif dengan gagang titanium yang sangat ringan.",
        glassesId: "cateye-tortoise",
      },
    ],
  },
  {
    id: "new-collection",
    title: "New Collection",
    badge: "Rilisan Terbaru",
    description: "Koleksi kacamata kekinian dengan material ringan dan anti-radiasi.",
    images: [
      "/katalog/New Collection/1.png",
      "/katalog/New Collection/2.png",
    ],
    items: [
      {
        id: "new-1",
        name: "New Collection — Model 1",
        collection: "New Collection",
        images: ["/katalog/New Collection/1.png"],
        style: "Square",
        recommendedFor: ["Round", "Oval", "Diamond"],
        description: "Desain persegi kontemporer dengan sudut halus, cocok untuk aktivitas harian.",
        glassesId: "square-black",
      },
      {
        id: "new-2",
        name: "New Collection — Model 2",
        collection: "New Collection",
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
    description: "Material titanium ultra-ringan berkualitas tinggi. Tahan lama, presisi, dan eksklusif.",
    images: [
      "/katalog/Titanium Edition/1.png",
      "/katalog/Titanium Edition/2.png",
      "/katalog/Titanium Edition/Product Specs.png",
    ],
    items: [
      {
        id: "titanium-1",
        name: "Titanium Edition — Model 1",
        collection: "Titanium Edition",
        images: [
          "/katalog/Titanium Edition/1.png",
          "/katalog/Titanium Edition/Product Specs.png",
        ],
        specsImage: "/katalog/Titanium Edition/Product Specs.png",
        style: "Titanium",
        recommendedFor: ["Oval", "Square", "Heart"],
        description: "Frame titanium premium ultra-ringan dengan ketahanan tinggi dan presisi maksimal.",
        glassesId: "square-black",
      },
      {
        id: "titanium-2",
        name: "Titanium Edition — Model 2",
        collection: "Titanium Edition",
        images: [
          "/katalog/Titanium Edition/2.png",
          "/katalog/Titanium Edition/Product Specs.png",
        ],
        specsImage: "/katalog/Titanium Edition/Product Specs.png",
        style: "Titanium",
        recommendedFor: ["Oval", "Round", "Diamond"],
        description: "Desain minimalis titanium modern, cocok untuk penggunaan profesional harian.",
        glassesId: "round-gold",
      },
    ],
  },
];
