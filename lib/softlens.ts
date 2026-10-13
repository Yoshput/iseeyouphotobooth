// lib/softlens.ts
import { KONSULTASI_WA_NUMBER } from "./branches";

/** Nomor WA CS Softlens disamakan dengan Nomor WA Konsultasi Optik I See You */
export const SOFTLENS_CS_NUMBER = KONSULTASI_WA_NUMBER; // "62895415614261"

export const SOFTLENS_CS_WA_URL = (productName?: string, variantName?: string) => {
  const itemDesc = variantName
    ? `*${productName}* (Varian: *${variantName}*)`
    : productName
    ? `*${productName}*`
    : "koleksi Softlens & Aksesoris";
  const msg = `Halo CS Optik I See You 👋, saya tertarik dengan produk ${itemDesc} di Katalog Softlens. Boleh info ketersediaan stok, ukuran minus, dan cara pemesanan? Terima kasih! 🙏`;
  return `https://wa.me/${SOFTLENS_CS_NUMBER}?text=${encodeURIComponent(msg)}`;
};

/** Detail Varian Warna / Ukuran Produk */
export interface SoftlensVariant {
  id: string; // e.g. "ice-no5-brown"
  name: string; // e.g. "Brown"
  colorFamily: "brown" | "grey" | "hazel" | "natural" | "colorful" | "accessory";
  hex?: string;
  image: string;
  hoverImage?: string;
  detailPoster?: string;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  discountPercentage?: string;
  badgeText?: string;
}

/** Model Series Softlens & Aksesoris (1 Series = 1 Kartu) */
export interface SoftlensSeries {
  id: string; // e.g. "exoticon-ice-no5"
  name: string; // e.g. "Exoticon ICE N°5"
  brand?: string;
  category: "Softlens" | "Aksesoris & Perawatan";
  type: "lens" | "accessory";
  colorFamily: "brown" | "grey" | "hazel" | "natural" | "colorful" | "accessory";
  coverImage: string;
  description: string;
  specs: string[];
  diameter?: string;
  waterContent?: string;
  usageDuration?: string;
  volume?: string; // Khusus cairan
  isAccessory?: boolean;
  basePrice: number;
  basePriceFormatted: string;
  hasPriceRange?: boolean;
  maxPrice?: number;
  maxPriceFormatted?: string;
  variants: SoftlensVariant[];
  badgeText?: string;
}

/** Tipe backward-compatibility untuk produk softlens flat */
export interface SoftlensProduct {
  id: string;
  name: string;
  category: "Koleksi Premium" | "Aksesoris & Perawatan" | "Softlens";
  colorFamily: "brown" | "grey" | "hazel" | "natural" | "colorful" | "accessory";
  specs: string[];
  description: string;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  discountPercentage?: string;
  image: string;
  hoverImage?: string;
  detailPoster?: string;
  volume?: string;
  diameter?: string;
  waterContent?: string;
  usageDuration?: string;
  isAccessory?: boolean;
  badgeText?: string;
  seriesId?: string;
  variantName?: string;
}

export interface CartItem {
  product: SoftlensProduct;
  quantity: number;
  selectedVariant?: SoftlensVariant;
}

export const SOFTLENS_SPECS = [
  "Anti Blue Light",
  "Smooth Surface",
  "All Day Comfort",
  "For Sensitive Eyes",
  "UV Protection",
];

export const COLOR_FILTERS = [
  { id: "all", label: "Semua Warna" },
  { id: "brown", label: "Cokelat (Brown)" },
  { id: "grey", label: "Abu-Abu (Grey)" },
  { id: "hazel", label: "Hazel & Emas" },
  { id: "natural", label: "Natural & Bening" },
  { id: "colorful", label: "Anti Blue Light" },
  { id: "accessory", label: "Cairan & Aksesoris" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA SERIES RESMI (1 SERIES = 1 KARTU)
// ─────────────────────────────────────────────────────────────────────────────
export const SOFTLENS_SERIES_LIST: SoftlensSeries[] = [
  // ── 1. Exoticon ICE N°5 Series (3 Varian: Brown, Grey, Black) ──
  {
    id: "exoticon-ice-no5",
    name: "Exoticon ICE N°5",
    brand: "Exoticon",
    category: "Softlens",
    type: "lens",
    colorFamily: "brown",
    coverImage: "/Katalog Soflens/Assets Soflens/Exoticon ice-no5-brown.webp",
    description:
      "Softlens Exoticon ICE N°5 dengan kenyamanan tingkat tinggi dan warna berkelas untuk mata indah bercahaya alami.",
    specs: ["Exoticon Series", "High Oxygen", "All Day Comfort", "UV Protection"],
    diameter: "14.5 mm",
    waterContent: "42%",
    usageDuration: "6 Bulan",
    basePrice: 55000,
    basePriceFormatted: "Rp 55.000",
    badgeText: "Best Seller Exoticon",
    variants: [
      {
        id: "ice-no5-brown",
        name: "Brown",
        colorFamily: "brown",
        hex: "#8B5A2B",
        image: "/Katalog Soflens/Assets Soflens/Exoticon ice-no5-brown.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Exoticon N5.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Exoticon N5.webp",
        price: 55000,
        priceFormatted: "Rp 55.000",
        badgeText: "Brown Glow",
      },
      {
        id: "ice-no5-grey",
        name: "Grey",
        colorFamily: "grey",
        hex: "#7A8B8B",
        image: "/Katalog Soflens/Assets Soflens/Exoticon ice-no5-grey.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Exoticon Ice no5-Grey-Detail.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Exoticon Ice no5-Grey-Detail.webp",
        price: 55000,
        priceFormatted: "Rp 55.000",
        badgeText: "Crystal Grey",
      },
      {
        id: "ice-no5-black",
        name: "Black",
        colorFamily: "natural",
        hex: "#222222",
        image: "/Katalog Soflens/Assets Soflens/Ice no5-Black.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Exoticon N5.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Exoticon N5.webp",
        price: 55000,
        priceFormatted: "Rp 55.000",
        badgeText: "Deep Black",
      },
    ],
  },

  // ── 2. Exoticon Miss ICE Series (Selena Grey) ──
  {
    id: "exoticon-miss-ice",
    name: "Exoticon Miss ICE",
    brand: "Exoticon",
    category: "Softlens",
    type: "lens",
    colorFamily: "grey",
    coverImage: "/Katalog Soflens/Assets Soflens/Exoticon Miss Ice-Selena Grey.webp",
    description:
      "Varian eksklusif Exoticon Miss ICE Selena Grey dengan warna abu-abu lembut nan manis khas K-Beauty.",
    specs: ["Miss ICE Series", "K-Beauty Velvet", "Ultra Soft Lens", "UV Protection"],
    diameter: "14.5 mm",
    waterContent: "42%",
    usageDuration: "6 Bulan",
    basePrice: 55000,
    basePriceFormatted: "Rp 55.000",
    badgeText: "Miss ICE Series",
    variants: [
      {
        id: "miss-ice-selena-grey",
        name: "Selena Grey",
        colorFamily: "grey",
        hex: "#708090",
        image: "/Katalog Soflens/Assets Soflens/Exoticon Miss Ice-Selena Grey.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Exoticon Miss Ice.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Exoticon Miss Ice.webp",
        price: 55000,
        priceFormatted: "Rp 55.000",
        badgeText: "K-Beauty Grey",
      },
    ],
  },

  // ── 3. Russian Velvet Series (2 Varian: Irina Grey, Sofiya Dark Glow) ──
  {
    id: "russian-velvet",
    name: "Russian Velvet Series",
    brand: "Russian Velvet",
    category: "Softlens",
    type: "lens",
    colorFamily: "grey",
    coverImage: "/Katalog Soflens/Assets Soflens/Rusian-velvet-Irina Grey.webp",
    description:
      "Gaya beludru mewah tanpa garis tepi luar (no limbal ring) untuk gradasi mata natural ala idol Korea.",
    specs: ["No Limbal Ring", "K-Beauty Velvet", "All Day Comfort", "Soft Blend"],
    diameter: "14.0 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "K-Idol Favorite",
    variants: [
      {
        id: "russian-velvet-irina-grey",
        name: "Irina Grey",
        colorFamily: "grey",
        hex: "#808A87",
        image: "/Katalog Soflens/Assets Soflens/Rusian-velvet-Irina Grey.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Rusian Velvet - Edited.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Rusian Velvet - Edited.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
        badgeText: "Irina Grey",
      },
      {
        id: "russian-velvet-sofiya-dark-glow",
        name: "Sofiya Dark Glow",
        colorFamily: "grey",
        hex: "#4F5D58",
        image: "/Katalog Soflens/Assets Soflens/Rusian-velvet-Sofiya Dark Glow.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Rusian Velvet - Edited.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Rusian Velvet - Edited.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
        badgeText: "Dark Glow",
      },
    ],
  },

  // ── 4. Exoticon EXO CLEAR (Lensa Bening Bulanan) ──
  {
    id: "exoticon-exo-clear",
    name: "Exoticon EXO CLEAR",
    brand: "Exoticon",
    category: "Softlens",
    type: "lens",
    colorFamily: "natural",
    coverImage: "/Katalog Soflens/Assets Soflens/exoticon-exo clear.webp",
    description:
      "Softlens bening bulanan ultrathin berbahan Etafilcon A, memberikan penglihatan super tajam & sangat nyaman.",
    specs: ["Monthly Disposable", "Super Thin Vision", "For Sensitive Eyes", "Etafilcon A"],
    diameter: "14.2 mm",
    waterContent: "55%",
    usageDuration: "1 Bulan",
    basePrice: 45000,
    basePriceFormatted: "Rp 45.000",
    badgeText: "Lensa Bening",
    variants: [
      {
        id: "exo-clear",
        name: "Clear Bening",
        colorFamily: "natural",
        hex: "#E0F2FE",
        image: "/Katalog Soflens/Assets Soflens/exoticon-exo clear.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Exoticon Exo Clear.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Exoticon Exo Clear.webp",
        price: 45000,
        priceFormatted: "Rp 45.000",
        badgeText: "Bening Bulanan",
      },
    ],
  },

  // ── 5. Golden Eye Prestige ──
  {
    id: "golden-eye-prestige",
    name: "Golden Eye Prestige",
    brand: "Golden Eye",
    category: "Softlens",
    type: "lens",
    colorFamily: "hazel",
    coverImage: "/Katalog Soflens/Assets Soflens/Golden Eye Prestige.webp",
    description:
      "Warna hazel emas berkelas ala Golden Eye Prestige untuk efek kilau mata mewah dan berkarakter.",
    specs: ["Prestige Color", "High Moisture", "All Day Comfort", "Golden Glow"],
    diameter: "14.5 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "Prestige Series",
    variants: [
      {
        id: "golden-eye-prestige-gold",
        name: "Golden Hazel",
        colorFamily: "hazel",
        hex: "#C5A059",
        image: "/Katalog Soflens/Assets Soflens/Golden Eye Prestige.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Golden Eye Prestige.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Golden Eye Prestige.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
      },
    ],
  },

  // ── 6. New More Dubai ──
  {
    id: "new-more-dubai",
    name: "New More Dubai",
    brand: "New More",
    category: "Softlens",
    type: "lens",
    colorFamily: "hazel",
    coverImage: "/Katalog Soflens/Assets Soflens/New More Dubai.webp",
    description:
      "Sentuhan warna eksotis ala Timur Tengah yang mewah, memberikan gradasi mata cantik dan memikat.",
    specs: ["Exotic Dubai", "Rich Pigment", "Smooth Surface", "All Day Comfort"],
    diameter: "14.5 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "Dubai Series",
    variants: [
      {
        id: "new-more-dubai-hazel",
        name: "Dubai Hazel",
        colorFamily: "hazel",
        hex: "#B8860B",
        image: "/Katalog Soflens/Assets Soflens/New More Dubai.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/New More Dubai.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/New More Dubai.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
      },
    ],
  },

  // ── 7. Living Color Miracle ──
  {
    id: "living-color-miracle",
    name: "Living Color Miracle",
    brand: "Living Color",
    category: "Softlens",
    type: "lens",
    colorFamily: "brown",
    coverImage: "/Katalog Soflens/Assets Soflens/Miracle.webp",
    description:
      "Sentuhan warna cokelat eksotis dengan gradasi warna hidup yang memberikan kilau natural setiap hari.",
    specs: ["Exotic Glow", "Living Color", "Smooth Surface", "UV Protection"],
    diameter: "14.2 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "Living Color",
    variants: [
      {
        id: "miracle-brown",
        name: "Miracle Brown",
        colorFamily: "brown",
        hex: "#704214",
        image: "/Katalog Soflens/Assets Soflens/Miracle.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Miracle-Edit.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Miracle-Edit.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
      },
    ],
  },

  // ── 8. Exoticon Moxie ──
  {
    id: "exoticon-moxie",
    name: "Exoticon Moxie",
    brand: "Exoticon",
    category: "Softlens",
    type: "lens",
    colorFamily: "brown",
    coverImage: "/Katalog Soflens/Assets Soflens/moxie.webp",
    description:
      "Warna cokelat kontemporer kemasan Exoticon Moxie untuk gaya hidup aktif dan modis.",
    specs: ["Exoticon Series", "Modern Style", "Smooth Surface", "All Day Comfort"],
    diameter: "14.2 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "Exoticon Moxie",
    variants: [
      {
        id: "moxie-brown",
        name: "Moxie Brown",
        colorFamily: "brown",
        hex: "#5C4033",
        image: "/Katalog Soflens/Assets Soflens/moxie.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Exoticon-Moxie-Detail.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Exoticon-Moxie-Detail.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
      },
    ],
  },

  // ── 9. Pure Color Comfort ──
  {
    id: "pure-color-comfort",
    name: "Pure Color Comfort",
    brand: "Pure Color",
    category: "Softlens",
    type: "lens",
    colorFamily: "natural",
    coverImage: "/Katalog Soflens/Assets Soflens/Pure Color Comfort.webp",
    description:
      "Desain warna lembut berteknologi High-Moisture yang sangat ramah dan sejuk untuk mata sensitif.",
    specs: ["High Moisture", "For Sensitive Eyes", "Smooth Surface", "All Day Comfort"],
    diameter: "14.2 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "Comfort Series",
    variants: [
      {
        id: "pure-color-comfort-choco",
        name: "Natural Choco",
        colorFamily: "natural",
        hex: "#4A2E18",
        image: "/Katalog Soflens/Assets Soflens/Pure Color Comfort.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Pure Color Comfort.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Pure Color Comfort.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
      },
    ],
  },

  // ── 10. Color Twilight (Anti Blue Light) ──
  {
    id: "color-twilight",
    name: "Color Twilight Anti Blue Light",
    brand: "Twilight",
    category: "Softlens",
    type: "lens",
    colorFamily: "colorful",
    coverImage: "/Katalog Soflens/Assets Soflens/Twilight.webp",
    description:
      "Teknologi Anti Blue Light dengan bahan Phosphorylcholine (PC) murni untuk perlindungan mata dari radiasi gadget.",
    specs: ["Anti Blue Light", "Phosphorylcholine PC", "Smooth Surface", "Eye Protection"],
    diameter: "14.2 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
    basePrice: 35000,
    basePriceFormatted: "Rp 35.000",
    badgeText: "Anti Blue Light",
    variants: [
      {
        id: "twilight-blue",
        name: "Twilight Tint",
        colorFamily: "colorful",
        hex: "#3A506B",
        image: "/Katalog Soflens/Assets Soflens/Twilight.webp",
        hoverImage: "/Katalog Soflens/Assets detail produk soflens/Twilight-Katalog.webp",
        detailPoster: "/Katalog Soflens/Assets detail produk soflens/Twilight-Katalog.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // AKSESORIS & PERAWATAN SOFLENS & KACAMATA
  // ───────────────────────────────────────────────────────────────────────────
  // ── 11. ICE Solution Multi-Purpose (150ML & 60ML) ──
  {
    id: "ice-solution",
    name: "ICE Solution Multi-Purpose",
    brand: "ICE",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Cairan Soflens Ice-150ml.webp",
    description:
      "Cairan pembersih dan perendam softlens ICE dengan kandungan Pro-Vitamin B5 untuk kelembaban optimal.",
    specs: ["Pro-Vitamin B5", "Multi-Purpose", "All-In-One Sterile", "Menjaga Kelembaban"],
    isAccessory: true,
    basePrice: 20000,
    basePriceFormatted: "Rp 20.000",
    hasPriceRange: true,
    maxPrice: 30000,
    maxPriceFormatted: "Rp 30.000",
    badgeText: "Cairan Steril",
    variants: [
      {
        id: "ice-150ml",
        name: "Botol Besar 150ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Cairan Soflens Ice-150ml.webp",
        price: 30000,
        priceFormatted: "Rp 30.000",
        badgeText: "150ML",
      },
      {
        id: "ice-60ml",
        name: "Travel Size 60ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/cairan soflens ice-60ml.webp",
        price: 20000,
        priceFormatted: "Rp 20.000",
        badgeText: "60ML",
      },
    ],
  },

  // ── 12. X2 Solution Multi-Purpose (120ML & 60ML) ──
  {
    id: "x2-solution",
    name: "X2 Solution Multi-Purpose",
    brand: "X2",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Cairan Soflens X2.webp",
    description:
      "Cairan pembersih softlens X2 dengan sertifikasi Halal MUI untuk higienitas ekstra dan rasa lembut di mata.",
    specs: ["Advanced Formula", "Extra Delicate Care", "MUI Halal Certified", "Anti-Bakteri"],
    isAccessory: true,
    basePrice: 20000,
    basePriceFormatted: "Rp 20.000",
    hasPriceRange: true,
    maxPrice: 30000,
    maxPriceFormatted: "Rp 30.000",
    badgeText: "Halal MUI",
    variants: [
      {
        id: "x2-120ml",
        name: "Botol Sedang 120ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Cairan Soflens X2.webp",
        price: 30000,
        priceFormatted: "Rp 30.000",
        badgeText: "120ML",
      },
      {
        id: "x2-60ml",
        name: "Travel Size 60ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Cairan Soflens X2.webp",
        price: 20000,
        priceFormatted: "Rp 20.000",
        badgeText: "60ML",
      },
    ],
  },

  // ── 13. X2 Contacts Tetes Mata 15ML ──
  {
    id: "x2-contacts-15ml",
    name: "X2 Contacts Tetes Mata (15ML)",
    brand: "X2",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/X2 Contacts.webp",
    description:
      "Tetes mata khusus pengguna softlens X2 Contacts 15ml untuk meredakan mata kering di ruangan ber-AC.",
    specs: ["Eye Drops 15ml", "Anti-Dryness", "Instant Refresh", "Khusus Softlens"],
    volume: "15ML",
    isAccessory: true,
    basePrice: 25000,
    basePriceFormatted: "Rp 25.000",
    badgeText: "Tetes Mata",
    variants: [
      {
        id: "x2-contacts-15ml",
        name: "Kemasan 15ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/X2 Contacts.webp",
        price: 25000,
        priceFormatted: "Rp 25.000",
      },
    ],
  },

  // ── 14. Pure N'Soft Solution 60ML ──
  {
    id: "pure-n-soft-60ml",
    name: "Pure N'Soft Solution (60ML)",
    brand: "Pure N'Soft",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Cairan Soflens  Men Soft.webp",
    description:
      "Cairan pembersih & perendam softlens Pure N'Soft 60ml menjaga lensa tetap higienis dan nyaman seharian.",
    specs: ["Hyaluronic Gentle", "Ekonomis & Steril", "Lepas Endapan Protein", "Kemasan 60ML"],
    volume: "60ML",
    isAccessory: true,
    basePrice: 8000,
    basePriceFormatted: "Rp 8.000",
    badgeText: "Hemat & Steril",
    variants: [
      {
        id: "pure-n-soft-60ml",
        name: "Botol 60ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Cairan Soflens  Men Soft.webp",
        price: 8000,
        priceFormatted: "Rp 8.000",
      },
    ],
  },

  // ── 15. Case Magnet Exclusive (2 Varian: Coklat & Pastel) ──
  {
    id: "case-magnet-series",
    name: "Case Magnet Kacamata & Softlens",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Case Magnet Coklat.webp",
    description:
      "Kotak kacamata & softlens hardcase bermagnet mewah dengan interior beludru lembut pelindung goresan.",
    specs: ["Magnetic Closure", "Hard Case Protection", "Luxury Finish", "Interior Beludru"],
    isAccessory: true,
    basePrice: 30000,
    basePriceFormatted: "Rp 30.000",
    hasPriceRange: true,
    maxPrice: 35000,
    maxPriceFormatted: "Rp 35.000",
    badgeText: "Hardcase Magnet",
    variants: [
      {
        id: "case-magnet-coklat",
        name: "Motif Coklat",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Case Magnet Coklat.webp",
        price: 35000,
        priceFormatted: "Rp 35.000",
        badgeText: "Exclusive Coklat",
      },
      {
        id: "case-magnet-pastel",
        name: "Edisi Pastel",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Case Magnet.webp",
        price: 30000,
        priceFormatted: "Rp 30.000",
        badgeText: "Pastel Lock",
      },
    ],
  },

  // ── 16. Cleaner Lensa NEX Anti-Fog 30ML ──
  {
    id: "cleaner-lensa-nex",
    name: "Cleaner Lensa NEX Anti-Fog (30ML)",
    brand: "NEX",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Cleaner Lensa Nex.webp",
    description:
      "Cairan semprot pembersih lensa kacamata NEX anti-embun & anti-static untuk kejernihan HD seketika.",
    specs: ["Anti-Fog Spray", "High Definition Clean", "Streak-Free", "Aman untuk Coating"],
    volume: "30ML",
    isAccessory: true,
    basePrice: 20000,
    basePriceFormatted: "Rp 20.000",
    badgeText: "Anti-Fog Spray",
    variants: [
      {
        id: "cleaner-lensa-nex",
        name: "Botol Spray 30ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Cleaner Lensa Nex.webp",
        price: 20000,
        priceFormatted: "Rp 20.000",
      },
    ],
  },

  // ── 17. Spray Cleaner Lensa Standard 30ML ──
  {
    id: "cleaner-biasa",
    name: "Spray Cleaner Lensa Standard (30ML)",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Cleaner Biasa.webp",
    description:
      "Pembersih semprot praktis efektif mengangkat noda minyak dan debu seketika pada lensa dan frame.",
    specs: ["Sanitizer Spray", "Pocket Size", "Debu & Minyak Hilang", "Jernih Maksimal"],
    volume: "30ML",
    isAccessory: true,
    basePrice: 10000,
    basePriceFormatted: "Rp 10.000",
    badgeText: "Pembersih Lensa",
    variants: [
      {
        id: "cleaner-biasa",
        name: "Standard 30ML",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Cleaner Biasa.webp",
        price: 10000,
        priceFormatted: "Rp 10.000",
      },
    ],
  },

  // ── 18. Mesin Pencuci Softlens Ultrasonic ──
  {
    id: "mesin-pencuci-soflens",
    name: "Mesin Pencuci Softlens (Ultrasonic)",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Mesin Pencuci Soflens.webp",
    description:
      "Mesin getar ultrasonic otomatis membersihkan kotoran & endapan protein pada softlens tanpa merusak pori lensa.",
    specs: ["Vibrasi Otomatis", "USB Rechargeable", "Pembersih Kuman Deep Clean", "Steril 3 Menit"],
    isAccessory: true,
    basePrice: 15000,
    basePriceFormatted: "Rp 15.000",
    badgeText: "Ultrasonic Cleaner",
    variants: [
      {
        id: "mesin-pencuci-soflens",
        name: "Unit Ultrasonic",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Mesin Pencuci Soflens.webp",
        price: 15000,
        priceFormatted: "Rp 15.000",
      },
    ],
  },

  // ── 19. Wadah Softlens Travel Kit (2 Varian: Standard & Hijau Mint) ──
  {
    id: "wadah-soflens-series",
    name: "Wadah Softlens Travel Kit",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Wadah Soflens.webp",
    description:
      "Set wadah perendam softlens higienis lengkap dengan cermin mini, pinset, dan aplikator steril.",
    specs: ["Sterile Storage", "Includes Tweezers", "Soft Applicator", "Cermin Mini"],
    isAccessory: true,
    basePrice: 15000,
    basePriceFormatted: "Rp 15.000",
    badgeText: "Travel Kit",
    variants: [
      {
        id: "wadah-soflens-set",
        name: "Kit Cermin Lengkap",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Wadah Soflens.webp",
        price: 15000,
        priceFormatted: "Rp 15.000",
        badgeText: "Travel Set",
      },
      {
        id: "wadah-soflens-hijau",
        name: "Edisi Hijau Mint",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Wadah Soflens Hijau.webp",
        price: 15000,
        priceFormatted: "Rp 15.000",
        badgeText: "Hijau Mint",
      },
    ],
  },

  // ── 20. Ear Hook Anti-Slip Kacamata ──
  {
    id: "ear-hook",
    name: "Ear Hook Anti-Slip Kacamata",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Ear Hook.webp",
    description:
      "Pengait telinga berbahan silikon lembut mencegah kacamata melorot saat berolahraga dan beraktivitas.",
    specs: ["Silikon Premium", "Anti-Melorot Olahraga", "Sangat Empuk", "Cocok Semua Gagang"],
    isAccessory: true,
    basePrice: 10000,
    basePriceFormatted: "Rp 10.000",
    badgeText: "Anti-Slip Hook",
    variants: [
      {
        id: "ear-hook",
        name: "Sepasang (Kiri & Kanan)",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Ear Hook.webp",
        price: 10000,
        priceFormatted: "Rp 10.000",
      },
    ],
  },

  // ── 21. Nose Pad Tempel Silikon Soft ──
  {
    id: "nose-pad-tempel",
    name: "Nose Pad Tempel Silikon Soft",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Nose pad Tempel.webp",
    description:
      "Bantalan hidung silikon fleksibel menambah kenyamanan & mencegah kacamata meninggalkan bekas di hidung.",
    specs: ["Silikon Air-Cushion", "Perekat Kuat", "Bebas Bekas di Hidung", "Anti-Sakit"],
    isAccessory: true,
    basePrice: 12000,
    basePriceFormatted: "Rp 12.000",
    badgeText: "Nosepad Cushion",
    variants: [
      {
        id: "nose-pad-tempel",
        name: "Sepasang Nosepad",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Nose pad Tempel.webp",
        price: 12000,
        priceFormatted: "Rp 12.000",
      },
    ],
  },

  // ── 22. Strap Tali Kacamata Sport ──
  {
    id: "strap-kacamata",
    name: "Strap Tali Kacamata Sport / Etnik",
    brand: "Optik I See You",
    category: "Aksesoris & Perawatan",
    type: "accessory",
    colorFamily: "accessory",
    coverImage: "/Katalog Soflens/Aksesoris/Strap Kacamata.webp",
    description:
      "Tali gantungan kacamata stylish & kuat menjaga kacamata tetap aman di leher saat tidak dipakai.",
    specs: ["Tali Flexible Adjustable", "Pengunci Karet Kuat", "Trendy & Modis", "Mencegah Kacamata Jatuh"],
    isAccessory: true,
    basePrice: 15000,
    basePriceFormatted: "Rp 15.000",
    badgeText: "Strap Kacamata",
    variants: [
      {
        id: "strap-kacamata",
        name: "1 Pcs Tali Kacamata",
        colorFamily: "accessory",
        image: "/Katalog Soflens/Aksesoris/Strap Kacamata.webp",
        price: 15000,
        priceFormatted: "Rp 15.000",
      },
    ],
  },
];

// Flat products list derived from series for backward compatibility
export const SOFTLENS_PRODUCTS: SoftlensProduct[] = SOFTLENS_SERIES_LIST.flatMap(
  (series) =>
    series.variants.map((variant) => ({
      id: variant.id,
      name: `${series.name} — ${variant.name}`,
      category:
        series.category === "Softlens"
          ? ("Koleksi Premium" as const)
          : ("Aksesoris & Perawatan" as const),
      colorFamily: variant.colorFamily,
      specs: series.specs,
      description: series.description,
      price: variant.price,
      priceFormatted: variant.priceFormatted,
      originalPrice: variant.originalPrice,
      originalPriceFormatted: variant.originalPriceFormatted,
      discountPercentage: variant.discountPercentage,
      image: variant.image,
      hoverImage: variant.hoverImage || series.coverImage,
      detailPoster: variant.detailPoster,
      volume: series.volume,
      diameter: series.diameter,
      waterContent: series.waterContent,
      usageDuration: series.usageDuration,
      isAccessory: series.isAccessory,
      badgeText: variant.badgeText || series.badgeText,
      seriesId: series.id,
      variantName: variant.name,
    }))
);

export const SOFTLENS_CATEGORIES = [
  { id: "all", label: "Semua Koleksi" },
  { id: "Softlens", label: "Koleksi Softlens" },
  { id: "Aksesoris & Perawatan", label: "Aksesoris & Perawatan" },
];

export const SOFTLENS_FAQ = [
  {
    id: "minus-tinggi",
    icon: "👁️",
    title: "Minus Tinggi & Resep Presisi",
    desc: "Ready stok softlens dari normal (plano) hingga minus tinggi. Tim CS kami siap mencocokkan resep mata kamu.",
  },
  {
    id: "silinder",
    icon: "🔄",
    title: "Silinder (Astigmatism)",
    desc: "Tersedia pemesanan softlens khusus silinder/astigmatism dengan Axis presisi tinggi demi kenyamanan fokus.",
  },
  {
    id: "cara-pakai",
    icon: "🤲",
    title: "Cara Pakai & Higienitas",
    desc: "Selalu cuci tangan bersih dengan sabun, dan rendam softlens minimal 4 jam sebelum pemakaian awal.",
  },
  {
    id: "cairan-oksi",
    icon: "🧴",
    title: "Cairan Pembersih Steril",
    desc: "Gunakan cairan pembersih khusus (ICE / X2 / Pure N'Soft) untuk melepaskan endapan protein pada permukaan lensa.",
  },
  {
    id: "tetes-mata",
    icon: "💧",
    title: "Tetes Mata Pelembab",
    desc: "Gunakan tetes X2 Contacts saat mata terasa kering di ruangan ber-AC untuk menjaga kelembaban sepanjang hari.",
  },
  {
    id: "aksesoris-set",
    icon: "🧰",
    title: "Perawatan Lens Case",
    desc: "Ganti wadah perendam softlens secara berkala 1-2 bulan sekali demi menjaga kesehatan & kesegaran mata.",
  },
];
