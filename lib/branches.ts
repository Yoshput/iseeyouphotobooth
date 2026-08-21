export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  hoursDetail?: { weekdays?: string; weekend?: string };
  phone: string;
  waNumber?: string;
  images: string[];
  instagram: string;
  handle: string;
}

export const BRANCHES: Branch[] = [
  {
    id: "purwokerto",
    name: "Optik I See You — Purwokerto",
    city: "Purwokerto",
    address: "Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang, Kec. Sumbang, Kabupaten Banyumas, Jawa Tengah 53124",
    lat: -7.392899320708557,
    lng: 109.24966692636308,
    hours: "Buka 09:00 - 21:00 WIB",
    phone: "0895-4156-14261",
    waNumber: "62895415614261",
    instagram: "https://www.instagram.com/iseeyou.glasses/",
    handle: "@iseeyou.glasses",
    images: [
      "/lokasi/purwokerto/IMG_1543.JPG",
      "/lokasi/purwokerto/IMG_1544.JPG",
      "/lokasi/purwokerto/IMG_1546.JPG",
    ],
  },
  {
    id: "wonosobo",
    name: "Optik I See You — Wonosobo",
    city: "Wonosobo",
    address: "Jl. Jenderal Soedirman, Sumberan Selatan, Wonosobo Bar., Kec. Wonosobo, Kabupaten Wonosobo, Jawa Tengah 56311",
    lat: -7.364198400005904,
    lng: 109.90066929262443,
    hours: "Setiap hari, 09.00–18.00 WIB",
    phone: "0897-7129-039",
    waNumber: "628977129039",
    instagram: "https://www.instagram.com/iseeyou.wonosobo/",
    handle: "@iseeyou.wonosobo",
    images: [
      "/lokasi/wonosobo/IMG_4474.jpg",
      "/lokasi/wonosobo/IMG_4475.jpg",
      "/lokasi/wonosobo/IMG_4476.jpg",
    ],
  },
  {
    id: "cilacap",
    name: "Optik I See You — Cilacap",
    city: "Cilacap",
    address: "Jl. Rinjani Depan Perum GRP No.2 Ruko No.3, Rawagaru, Sidanegara, Kec. Cilacap Tengah, Kabupaten Cilacap, Jawa Tengah 53223",
    lat: -7.7025949439074815,
    lng: 109.0162702336721,
    hours: "Setiap hari, 09.00–21.00 WIB",
    phone: "0851-3593-0533",
    waNumber: "6285135930533",
    instagram: "https://www.instagram.com/iseeyou.cilacap/",
    handle: "@iseeyou.cilacap",
    images: [
      "/lokasi/cilacap/IMG_6716.jpg",
      "/lokasi/cilacap/IMG_7453.jpg",
      "/lokasi/cilacap/IMG_7455.jpg",
    ],
  },
  {
    id: "purbalingga",
    name: "Optik I See You — Purbalingga",
    city: "Purbalingga",
    address: "Jl. Onje No.1, Purbalingga Lor, Kec. Purbalingga, Kabupaten Purbalingga, Jawa Tengah 53311",
    lat: -7.388426037302636,
    lng: 109.36448728949104,
    hours: "Sen–Jum 11.00–20.00 · Sab–Min 09.00–21.00 WIB",
    hoursDetail: {
      weekdays: "Senin–Jumat: 11.00–20.00 WIB",
      weekend: "Sabtu–Minggu: 09.00–21.00 WIB",
    },
    phone: "0822-3486-2322",
    waNumber: "6282234862322",
    instagram: "https://www.instagram.com/iseeyou.purbalingga/",
    handle: "@iseeyou.purbalingga",
    images: [
      "/lokasi/purbalingga/IMG_8525.jpg",
      "/lokasi/purbalingga/IMG_8526.jpg",
      "/lokasi/purbalingga/IMG_8533.jpg",
    ],
  },
];

export function mapsEmbedUrl(branch: Branch) {
  return `https://www.google.com/maps?q=${branch.lat},${branch.lng}&hl=id&z=16&output=embed`;
}

export function mapsDirectionsUrl(branch: Branch) {
  return `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
}

export function branchGoogleReviewsUrl(branch: Branch) {
  switch (branch.id) {
    case "purwokerto":
      return "https://www.google.com/search?q=Optik+I+See+You+Glasses+Purwokerto#lrd=0x2e655f4f68229ef9:0x135220f93a37d3fb,1,,,,";
    case "wonosobo":
      return "https://www.google.com/search?q=optik+i+see+you+glasses+wonosobo#lrd=0x2e7aa15b14af5143:0x9f777b70a532866d,1,,,,";
    case "cilacap":
      return "https://www.google.com/search?q=optik+i+see+you+glasses+cilacap+#lrd=0x2e6513eb264f30b7:0x46e84e0577a90d12,1,,,,";
    case "purbalingga":
      return "https://www.google.com/search?q=optik+i+see+you+glasses+purbalingga#lrd=0x2e6559f5fffdd7ad:0xed1c5a11a9f20422,1,,,,";
    default:
      return `https://www.google.com/search?q=Optik+I+See+You+${encodeURIComponent(branch.city)}+Ulasan`;
  }
}

export function branchGoogleMapsUrl(branch: Branch) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name + " " + branch.city)}`;
}

/** Nomor WhatsApp Khusus Katalog & Pemesanan Frame */
export const CATALOG_WA_NUMBER = "62895415614261";
export const CS_WHATSAPP_NUMBER = "62895415614261";
export const KONSULTASI_WA_NUMBER = "62895415614261";
export const PRICE_LIST_LENSA_URL = "https://drive.google.com/file/d/1ysBYYKikn5m5CEom-SLqmwJaHc6xeuvS/view";
export const SHOPEE_STORE_URL = "https://shopee.co.id/iseeyou.id?entryPoint=ShopBySearch&searchKeyword=iseeyou.id";

export function branchWhatsappUrl(branch: Branch) {
  const num = branch.waNumber || branch.phone.replace(/[^0-9]/g, "");
  const formattedNum = num.startsWith("0") ? `62${num.slice(1)}` : num;
  const message = `Halo Optik I See You cabang ${branch.city}, saya mau tanya lokasi & produk yang ada di toko.`;
  return `https://wa.me/${formattedNum}?text=${encodeURIComponent(message)}`;
}

export function csWhatsappUrl(glassesName?: string) {
  const message = glassesName
    ? `Halo kak, saya tertarik dengan frame "${glassesName}" di katalog. Boleh tau apakah masih tersedia atau tidak? Soalnya cocok banget di aku.`
    : `Halo kak, saya mau tanya-tanya soal kacamata di Optik I See You.`;
  return `https://wa.me/${CATALOG_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function catalogWhatsappUrl(glassesName?: string) {
  return csWhatsappUrl(glassesName);
}

export function konsultasiWhatsappUrl() {
  const message = `Halo Optik I See You, saya mau Konsultasi Gratis mengenai periksa mata & rekomendasi kacamata/lensa.`;
  return `https://wa.me/${KONSULTASI_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

