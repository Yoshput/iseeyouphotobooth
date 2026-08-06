export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
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
    hours: "Buka 09:00 - 18:00 WIB",
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
    hours: "Buka 09:00 - 21:00 WIB",
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
    address: "Jl. Onje No.1, Purbalingga, Purbalingga Lor, Kec. Purbalingga, Kabupaten Purbalingga, Jawa Tengah 53311",
    lat: -7.388426037302636,
    lng: 109.36448728949104,
    hours: "Buka 09:00 - 21:00 WIB",
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

export const CS_WHATSAPP_NUMBER = "62895415614261";
export const KONSULTASI_WA_NUMBER = "62895415614261";
export const PRICE_LIST_LENSA_URL = "https://drive.google.com/file/d/1ysBYYKikn5m5CEom-SLqmwJaHc6xeuvS/view";
export const SHOPEE_STORE_URL = "https://shopee.co.id/iseeyou.id?entryPoint=ShopBySearch&searchKeyword=iseeyou.id";

export function csWhatsappUrl(glassesName?: string) {
  const message = glassesName
    ? `Halo kak, saya tertarik dengan frame "${glassesName}" ini. Boleh tau apakah masih tersedia atau tidak? Soalnya cocok banget di aku.`
    : `Halo kak, saya mau tanya-tanya soal kacamata di Optik I See You.`;
  return `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function konsultasiWhatsappUrl() {
  const message = `Halo Optik I See You, saya mau Konsultasi Gratis mengenai periksa mata & rekomendasi kacamata/lensa.`;
  return `https://wa.me/${KONSULTASI_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}
