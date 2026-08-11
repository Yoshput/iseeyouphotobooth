// lib/softlens.ts
import { KONSULTASI_WA_NUMBER } from "./branches";

/** Nomor WA CS Softlens disamakan dengan Nomor WA Konsultasi */
export const SOFTLENS_CS_NUMBER = KONSULTASI_WA_NUMBER; // "62895415614261"

export const SOFTLENS_CS_WA_URL = (productName?: string) => {
  const msg = productName
    ? `Halo kak, saya tertarik dengan "${productName}" di katalog I See You Soflens. Boleh tanya stok, ukuran, dan cara pesan?`
    : `Halo kak, saya mau tanya-tanya mengenai softlens & aksesoris di Optik I See You.`;
  return `https://wa.me/${SOFTLENS_CS_NUMBER}?text=${encodeURIComponent(msg)}`;
};

export interface SoftlensProduct {
  id: string;
  name: string;
  category: "Warna Natural" | "Koleksi Premium" | "Aksesoris & Perawatan";
  colorFamily: "brown" | "grey" | "hazel" | "natural" | "colorful" | "accessory";
  specs: string[];
  description: string;
  price: number;
  priceFormatted: string;
  diameter?: string;
  waterContent?: string;
  usageDuration?: string;
  isAccessory?: boolean;
}

export interface CartItem {
  product: SoftlensProduct;
  quantity: number;
}

export const SOFTLENS_SPECS = [
  "Anti Blue Light",
  "Smooth Surface",
  "All Day Comfort",
  "For Sensitive Eyes",
  "UV Protection",
];

export const SOFTLENS_PRODUCTS: SoftlensProduct[] = [
  // --- 15 SOFTLENS ---
  {
    id: "sheer-brown",
    name: "Sheer Brown",
    category: "Warna Natural",
    colorFamily: "brown",
    specs: ["Anti Blue Light", "All Day Comfort", "UV Protection"],
    description: "Warna coklat alami yang mempercantik iris mata. Cocok untuk daily look sekolah, kuliah, maupun kerja.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.2 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
  },
  {
    id: "dewy-grey",
    name: "Dewy Grey",
    category: "Warna Natural",
    colorFamily: "grey",
    specs: ["Smooth Surface", "All Day Comfort", "For Sensitive Eyes"],
    description: "Abu-abu segar dengan efek glossy dan ring tipis. Memberikan kesan mata berbinar dan ekspresif.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.5 mm",
    waterContent: "55%",
    usageDuration: "6 Bulan",
  },
  {
    id: "petal-grey",
    name: "Petal Grey",
    category: "Warna Natural",
    colorFamily: "grey",
    specs: ["Anti Blue Light", "Smooth Surface", "UV Protection"],
    description: "Abu-abu lembut dengan corak bermotif kelopak bunga. Anggun, feminin, dan elegan.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.2 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
  },
  {
    id: "blush-brown",
    name: "Blush Brown",
    category: "Warna Natural",
    colorFamily: "brown",
    specs: ["All Day Comfort", "For Sensitive Eyes", "Anti Blue Light"],
    description: "Coklat warm hazel dengan sentuhan kemerahan subtle. Tampilan mata manis alami tanpa berlebihan.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.0 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
  },
  {
    id: "bebi-light-brown",
    name: "Bebi Light Brown",
    category: "Warna Natural",
    colorFamily: "brown",
    specs: ["Smooth Surface", "All Day Comfort", "UV Protection"],
    description: "Coklat muda terang transparan. Memberikan efek mata baby eyes yang lembut dan berbinar.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.5 mm",
    waterContent: "50%",
    usageDuration: "6 Bulan",
  },
  {
    id: "bebi-light-grey",
    name: "Bebi Light Grey",
    category: "Warna Natural",
    colorFamily: "grey",
    specs: ["Anti Blue Light", "All Day Comfort", "For Sensitive Eyes"],
    description: "Abu-abu muda bening natural. Tampak berkilau indah di bawah pencahayaan apa saja.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.5 mm",
    waterContent: "50%",
    usageDuration: "6 Bulan",
  },
  {
    id: "hanni-brown",
    name: "Hanni Brown",
    category: "Koleksi Premium",
    colorFamily: "brown",
    specs: ["Anti Blue Light", "Smooth Surface", "All Day Comfort", "UV Protection"],
    description: "Koleksi premium warna coklat rich ala K-Beauty idol. Sangat nyaman untuk mata sensitif seharian.",
    price: 95000,
    priceFormatted: "Rp 95.000",
    diameter: "14.2 mm",
    waterContent: "55%",
    usageDuration: "6 Bulan",
  },
  {
    id: "hazel-honey",
    name: "Hazel Honey",
    category: "Koleksi Premium",
    colorFamily: "hazel",
    specs: ["Smooth Surface", "All Day Comfort", "UV Protection"],
    description: "Kombinasi warna amber madu dan hazel berkilau. Mewah, eksotis, dan memikat perhatian.",
    price: 95000,
    priceFormatted: "Rp 95.000",
    diameter: "14.5 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
  },
  {
    id: "choco-delight",
    name: "Choco Delight",
    category: "Warna Natural",
    colorFamily: "brown",
    specs: ["Anti Blue Light", "All Day Comfort", "For Sensitive Eyes"],
    description: "Coklat dark chocolate pekat alami. Memperjelas lingkaran iris mata secara sempurna.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.0 mm",
    waterContent: "45%",
    usageDuration: "6 Bulan",
  },
  {
    id: "velvet-grey",
    name: "Velvet Grey",
    category: "Koleksi Premium",
    colorFamily: "grey",
    specs: ["Anti Blue Light", "Smooth Surface", "For Sensitive Eyes"],
    description: "Abu-abu gradasi beludru tanpa limbal ring keras. Memberikan kesan misterius dan modern.",
    price: 95000,
    priceFormatted: "Rp 95.000",
    diameter: "14.2 mm",
    waterContent: "55%",
    usageDuration: "6 Bulan",
  },
  {
    id: "olive-glow",
    name: "Olive Glow",
    category: "Koleksi Premium",
    colorFamily: "colorful",
    specs: ["Smooth Surface", "All Day Comfort", "UV Protection"],
    description: "Warna hijau olive lembut dengan sentuhan emas. Unik, stylish, dan estetik.",
    price: 95000,
    priceFormatted: "Rp 95.000",
    diameter: "14.2 mm",
    waterContent: "50%",
    usageDuration: "6 Bulan",
  },
  {
    id: "mystic-black",
    name: "Mystic Black",
    category: "Warna Natural",
    colorFamily: "natural",
    specs: ["All Day Comfort", "For Sensitive Eyes", "UV Protection"],
    description: "Hitam bening natural yang memberikan efek mata lebih besar (dolly eyes) secara elegan.",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.8 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
  },
  {
    id: "crystal-blue",
    name: "Crystal Blue",
    category: "Koleksi Premium",
    colorFamily: "colorful",
    specs: ["Smooth Surface", "Anti Blue Light", "UV Protection"],
    description: "Biru kristal muda bening transparan. Sangat cocok untuk acara foto makeup & photoshoot.",
    price: 95000,
    priceFormatted: "Rp 95.000",
    diameter: "14.2 mm",
    waterContent: "55%",
    usageDuration: "6 Bulan",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    category: "Koleksi Premium",
    colorFamily: "brown",
    specs: ["All Day Comfort", "Smooth Surface", "For Sensitive Eyes"],
    description: "Coklat kemerahan dengan sentuhan shimmer hangat. Memberikan kesan mata bersinar manis.",
    price: 95000,
    priceFormatted: "Rp 95.000",
    diameter: "14.2 mm",
    waterContent: "50%",
    usageDuration: "6 Bulan",
  },
  {
    id: "caramel-nude",
    name: "Caramel Nude",
    category: "Warna Natural",
    colorFamily: "brown",
    specs: ["Anti Blue Light", "All Day Comfort", "UV Protection"],
    description: "Caramel bening transparan nude. Sangat pas untuk yang menyukai gaya tanpa makeup (no-makeup look).",
    price: 85000,
    priceFormatted: "Rp 85.000",
    diameter: "14.0 mm",
    waterContent: "48%",
    usageDuration: "6 Bulan",
  },

  // --- AKSESORIS & PERAWATAN ---
  {
    id: "cairan-oksi",
    name: "Cairan Oksi Solution (Pembersih Softlens)",
    category: "Aksesoris & Perawatan",
    colorFamily: "accessory",
    specs: ["Multi-Purpose", "Anti-Bakteri", "Disinfecting"],
    description: "Cairan pembersih dan perendam softlens khusus dengan kandungan anti-bakteri & penyeimbang pH. Menjaga kelembaban lensa seharian.",
    price: 35000,
    priceFormatted: "Rp 35.000",
    isAccessory: true,
  },
  {
    id: "tetes-mata-soflens",
    name: "Tetes Mata Softlens (Rewetting Drops)",
    category: "Aksesoris & Perawatan",
    colorFamily: "accessory",
    specs: ["Moisturizing", "Anti-Dryness", "Safe for Lenses"],
    description: "Tetes mata khusus pengguna softlens untuk melembabkan mata kering dan meredakan iritasi saat beraktivitas di ruangan AC atau outdoor.",
    price: 25000,
    priceFormatted: "Rp 25.000",
    isAccessory: true,
  },
  {
    id: "kit-aksesoris-soflens",
    name: "Kit Aksesoris Set Softlens (Case & Tweezer)",
    category: "Aksesoris & Perawatan",
    colorFamily: "accessory",
    specs: ["Portable Case", "Hygiene Silicone", "Travel Friendly"],
    description: "Set wadah softlens portable lengkap dengan penjepit silikon higienis, cermin kecil, dan alat pemasang lensa tanpa sentuhan tangan.",
    price: 20000,
    priceFormatted: "Rp 20.000",
    isAccessory: true,
  },
];

export const SOFTLENS_FAQ = [
  {
    id: "minus-tinggi",
    icon: "👁️",
    title: "Minus Tinggi",
    desc: "Ready stok softlens minus tinggi hingga -10.00! Konsultasikan ukuran persis mata kamu ke CS kami.",
  },
  {
    id: "silinder",
    icon: "🔄",
    title: "Silinder (Astigmatism)",
    desc: "Tersedia pemesanan softlens khusus silinder/astigmatism dengan Axis presisi tinggi.",
  },
  {
    id: "cara-pakai",
    icon: "🤲",
    title: "Cara Pakai & Lepas",
    desc: "Selalu cuci tangan bersih dengan sabun, keringkan, dan gunakan kit aplikator silikon higienis.",
  },
  {
    id: "cairan-oksi",
    icon: "🧴",
    title: "Cairan Oksi & Pembersih",
    desc: "Gunakan Cairan Oksi Multi-Purpose Solution untuk merendam dan membersihkan endapan protein.",
  },
  {
    id: "tetes-mata",
    icon: "💧",
    title: "Tetes Mata Soflens",
    desc: "Gunakan tetes mata rewetting drops khusus softlens saat mata terasa kering atau berada di ruangan AC.",
  },
  {
    id: "aksesoris-set",
    icon: "🧰",
    title: "Kebersihan Case & Aksesoris",
    desc: "Ganti tempat perendam softlens minimal 1-2 bulan sekali dan cuci aksesoris dengan cairan khusus.",
  },
];

export const SOFTLENS_CATEGORIES = [
  { id: "all", label: "Semua Produk" },
  { id: "Warna Natural", label: "Warna Natural" },
  { id: "Koleksi Premium", label: "Koleksi Premium" },
  { id: "Aksesoris & Perawatan", label: "Aksesoris & Perawatan" },
];
