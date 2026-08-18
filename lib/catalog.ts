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
    coverImage: "/katalog/Cat Eye Edition/1.webp",
    images: [
      "/katalog/Cat Eye Edition/1.webp",
      "/katalog/Cat Eye Edition/2.webp",
      "/katalog/Cat Eye Edition/Product Specs.webp",
    ],
    items: [
      {
        id: "cateye-1",
        name: "Cat Eye Signature — Gloss Black",
        collection: "Cat Eye Edition",
        image: "/katalog/Cat Eye Edition/1.webp",
        images: ["/katalog/Cat Eye Edition/1.webp", "/katalog/Cat Eye Edition/Product Specs.webp"],
        specsImage: "/katalog/Cat Eye Edition/Product Specs.webp",
        style: "Cat-Eye",
        recommendedFor: ["Heart", "Oval", "Round"],
        description: "Frame cat-eye elegan dengan sudut tegas dan finishing gloss premium.",
        glassesId: "cateye-frame",
      },
      {
        id: "cateye-2",
        name: "Cat Eye Velvet — Amber Tortoise",
        collection: "Cat Eye Edition",
        image: "/katalog/Cat Eye Edition/2.webp",
        images: ["/katalog/Cat Eye Edition/2.webp", "/katalog/Cat Eye Edition/Product Specs.webp"],
        specsImage: "/katalog/Cat Eye Edition/Product Specs.webp",
        style: "Cat-Eye",
        recommendedFor: ["Heart", "Oval", "Diamond"],
        description: "Warna tortoise eksklusif dengan gagang titanium yang sangat ringan.",
        glassesId: "cateye-frame",
      },
    ],
  },
  {
    id: "new-collection",
    title: "New Collection",
    badge: "Rilisan Terbaru",
    description: "Koleksi kacamata kekinian dengan material ringan dan anti-radiasi.",
    coverImage: "/katalog/New Collection/1.webp",
    images: [
      "/katalog/New Collection/1.webp",
      "/katalog/New Collection/2.webp",
      "/katalog/New Collection/Product Specs.webp",
    ],
    items: [
      {
        id: "new-1",
        name: "Metro Square Pro — Matte Black",
        collection: "New Collection",
        image: "/katalog/New Collection/1.webp",
        images: ["/katalog/New Collection/1.webp", "/katalog/New Collection/Product Specs.webp"],
        specsImage: "/katalog/New Collection/Product Specs.webp",
        style: "Square",
        recommendedFor: ["Round", "Oval", "Diamond"],
        description: "Desain persegi kontemporer dengan sudut halus, cocok untuk aktivitas harian.",
        glassesId: "square-frame",
      },
      {
        id: "new-2",
        name: "Aero Wire — Champagne Gold",
        collection: "New Collection",
        image: "/katalog/New Collection/2.webp",
        images: ["/katalog/New Collection/2.webp", "/katalog/New Collection/Product Specs.webp"],
        specsImage: "/katalog/New Collection/Product Specs.webp",
        style: "Round Wire",
        recommendedFor: ["Square", "Heart", "Diamond"],
        description: "Frame kawat bulat yang halus dan ringan, memberikan kesan retro modern.",
        glassesId: "oval-frame",
      },
    ],
  },
  {
    id: "titanium-edition",
    title: "Titanium Edition",
    badge: "Premium Series",
    description: "Koleksi titanium ultralight dengan ketahanan tinggi dan desain minimalis modern.",
    coverImage: "/katalog/Titanium Edition/1.webp",
    images: [
      "/katalog/Titanium Edition/1.webp",
      "/katalog/Titanium Edition/2.webp",
      "/katalog/Titanium Edition/Product Specs.webp",
    ],
    items: [
      {
        id: "titanium-1",
        name: "Titanium Pure — Matte Steel",
        collection: "Titanium Edition",
        image: "/katalog/Titanium Edition/1.webp",
        images: ["/katalog/Titanium Edition/1.webp", "/katalog/Titanium Edition/Product Specs.webp"],
        specsImage: "/katalog/Titanium Edition/Product Specs.webp",
        style: "Titanium",
        recommendedFor: ["Oval", "Square", "Heart"],
        description: "Frame titanium murni dengan bobot ultra ringan dan ketahanan luar biasa.",
        glassesId: "square-frame",
      },
      {
        id: "titanium-2",
        name: "Titanium Air — Gunmetal Gray",
        collection: "Titanium Edition",
        image: "/katalog/Titanium Edition/2.webp",
        images: ["/katalog/Titanium Edition/2.webp", "/katalog/Titanium Edition/Product Specs.webp"],
        specsImage: "/katalog/Titanium Edition/Product Specs.webp",
        style: "Titanium",
        recommendedFor: ["Oval", "Round", "Diamond"],
        description: "Gaya profesional yang tipis, presisi, dan sangat nyaman dipakai seharian.",
        glassesId: "oval-frame",
      },
    ],
  },
  {
    id: "metro-deek",
    title: "Metro Deek",
    badge: "Modern Urban",
    description: "Desain frame urban kontemporer dengan estetika clean dan material tangguh.",
    coverImage: "/katalog/Metro Deek/Feed 1.webp",
    images: [
      "/katalog/Metro Deek/Feed 1.webp",
      "/katalog/Metro Deek/Feed 2.webp",
      "/katalog/Metro Deek/Feed 3.webp",
    ],
    items: [
      {
        id: "metro-1",
        name: "Metro Deek Urban — Black Acetate",
        collection: "Metro Deek",
        image: "/katalog/Metro Deek/Feed 1.webp",
        images: ["/katalog/Metro Deek/Feed 1.webp"],
        style: "Urban Square",
        recommendedFor: ["Oval", "Round", "Heart"],
        description: "Frame tebal bergaya urban dengan siluet modern untuk penampilan bold.",
        glassesId: "square-frame",
      },
      {
        id: "metro-2",
        name: "Metro Deek Minimalist — Crystal Clear",
        collection: "Metro Deek",
        image: "/katalog/Metro Deek/Feed 2.webp",
        images: ["/katalog/Metro Deek/Feed 2.webp"],
        style: "Transparan",
        recommendedFor: ["Round", "Oval", "Square"],
        description: "Frame transparan bening dengan detail engsel yang kokoh dan estetik.",
        glassesId: "square-frame",
      },
      {
        id: "metro-3",
        name: "Metro Deek Executive — Deep Brown",
        collection: "Metro Deek",
        image: "/katalog/Metro Deek/Feed 3.webp",
        images: ["/katalog/Metro Deek/Feed 3.webp"],
        style: "Classic Square",
        recommendedFor: ["Oval", "Square", "Oblong"],
        description: "Sentuhan nuansa warna cokelat hangat untuk gaya profesional sehari-hari.",
        glassesId: "square-frame",
      },
    ],
  },
  {
    id: "quiet-luxury",
    title: "Quiet Luxury",
    badge: "Sophisticated Series",
    description: "Frame mewah nan understated dengan detail halus dan kenyamanan maksimal.",
    coverImage: "/katalog/Quiet Luxury/CATALOG NEW-01.webp",
    images: [
      "/katalog/Quiet Luxury/CATALOG NEW-01.webp",
      "/katalog/Quiet Luxury/CATALOG NEW-02.webp",
      "/katalog/Quiet Luxury/Detail Spec.webp",
    ],
    items: [
      {
        id: "luxury-1",
        name: "Quiet Luxury One — Subtle Gold Rim",
        collection: "Quiet Luxury",
        image: "/katalog/Quiet Luxury/CATALOG NEW-01.webp",
        images: ["/katalog/Quiet Luxury/CATALOG NEW-01.webp", "/katalog/Quiet Luxury/Detail Spec.webp"],
        specsImage: "/katalog/Quiet Luxury/Detail Spec.webp",
        style: "Luxury Oval",
        recommendedFor: ["Square", "Oval", "Heart"],
        description: "Keanggunan minimalis dengan aksen emas halus yang sangat berkelas.",
        glassesId: "oval-frame",
      },
      {
        id: "luxury-2",
        name: "Quiet Luxury Two — Matte Platinum",
        collection: "Quiet Luxury",
        image: "/katalog/Quiet Luxury/CATALOG NEW-02.webp",
        images: ["/katalog/Quiet Luxury/CATALOG NEW-02.webp", "/katalog/Quiet Luxury/Detail Spec.webp"],
        specsImage: "/katalog/Quiet Luxury/Detail Spec.webp",
        style: "Luxury Round",
        recommendedFor: ["Square", "Oblong", "Diamond"],
        description: "Finishing platinum matte ultralight untuk kenyamanan dan gengsi ekstra.",
        glassesId: "round-frame",
      },
    ],
  },
  {
    id: "shades-of-elegance",
    title: "Shades Of Elegance",
    badge: "Elegance Collection",
    description: "Sentuhan siluet elegan dengan gradasi warna menawan untuk penampilan anggun.",
    coverImage: "/katalog/Shades Of Elegance/1.webp",
    images: [
      "/katalog/Shades Of Elegance/1.webp",
      "/katalog/Shades Of Elegance/2.webp",
      "/katalog/Shades Of Elegance/Product Specs.webp",
    ],
    items: [
      {
        id: "elegance-1",
        name: "Shades Of Elegance Alpha — Soft Rose Gold",
        collection: "Shades Of Elegance",
        image: "/katalog/Shades Of Elegance/1.webp",
        images: ["/katalog/Shades Of Elegance/1.webp", "/katalog/Shades Of Elegance/Product Specs.webp"],
        specsImage: "/katalog/Shades Of Elegance/Product Specs.webp",
        style: "Cat-Eye Elegance",
        recommendedFor: ["Heart", "Oval", "Round"],
        description: "Frame anggun dengan lengkungan halus, menonjolkan fitur estetis wajah.",
        glassesId: "cateye-frame",
      },
      {
        id: "elegance-2",
        name: "Shades Of Elegance Beta — Midnight Crystal",
        collection: "Shades Of Elegance",
        image: "/katalog/Shades Of Elegance/2.webp",
        images: ["/katalog/Shades Of Elegance/2.webp", "/katalog/Shades Of Elegance/Product Specs.webp"],
        specsImage: "/katalog/Shades Of Elegance/Product Specs.webp",
        style: "Soft Square",
        recommendedFor: ["Round", "Oval", "Diamond"],
        description: "Kombinasi warna kristal gelap dengan kilau mewah yang menonjolkan percaya diri.",
        glassesId: "square-frame",
      },
    ],
  },
  {
    id: "shades-edition",
    title: "Shades Edition",
    badge: "Sunglasses Series",
    description: "Koleksi kacamata hitam (sunglasses) bergaya modern dengan proteksi UV400 maksimal.",
    coverImage: "/katalog/Shades Edition/1.webp",
    images: [
      "/katalog/Shades Edition/1.webp",
      "/katalog/Shades Edition/3.webp",
      "/katalog/Shades Edition/Product Specs.webp",
    ],
    items: [
      {
        id: "shades-1",
        name: "Shades Edition Classic — Dark Smoke",
        collection: "Shades Edition",
        image: "/katalog/Shades Edition/1.webp",
        images: ["/katalog/Shades Edition/1.webp", "/katalog/Shades Edition/Product Specs.webp"],
        specsImage: "/katalog/Shades Edition/Product Specs.webp",
        style: "Sunglasses Square",
        recommendedFor: ["Oval", "Round", "Heart"],
        description: "Kacamata hitam gaya klasik dengan lensa dark smoke anti-glare & proteksi UV400 maksimal.",
        glassesId: "sunglasses-black",
      },
      {
        id: "shades-2",
        name: "Shades Edition Modern — Amber Gold",
        collection: "Shades Edition",
        image: "/katalog/Shades Edition/3.webp",
        images: ["/katalog/Shades Edition/3.webp", "/katalog/Shades Edition/Product Specs.webp"],
        specsImage: "/katalog/Shades Edition/Product Specs.webp",
        style: "Sunglasses Aviator",
        recommendedFor: ["Square", "Oval", "Diamond"],
        description: "Siluet modern dengan aksen warna amber gold yang elegan untuk penampilan outdoor stylish.",
        glassesId: "sunglasses-square-metal",
      },
    ],
  },
];
