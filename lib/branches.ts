export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
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
    lat: -7.3929206,
    lng: 109.2496106,
    googleMapsUrl:
      "https://www.google.com/maps/place/Optik+I+See+You+Glasses/@-7.3928236,109.2495322,3a,75y,146.27h,94.2t/data=!3m7!1e1!3m5!1sfHbg6AiX3KeGM4EtZOK8rA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-4.196807553811354%26panoid%3DfHbg6AiX3KeGM4EtZOK8rA%26yaw%3D146.27005638005062!7i16384!8i8192!4m12!1m5!3m4!2zN8KwMjMnMzQuNCJTIDEwOcKwMTQnNTguOCJF!8m2!3d-7.3928993!4d109.2496669!3m5!1s0x2e655f4f68229ef9:0x135220f93a37d3fb!8m2!3d-7.3929206!4d109.2496106!16s%2Fg%2F11ql_49vy3?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
    hours: "Buka 09:00 - 21:00 WIB",
    phone: "0895-4156-14261",
    waNumber: "62895415614261",
    instagram: "https://www.instagram.com/iseeyou.glasses/",
    handle: "@iseeyou.glasses",
    images: [
      "/lokasi/purwokerto/IMG_1543.webp",
      "/lokasi/purwokerto/IMG_1544.webp",
      "/lokasi/purwokerto/IMG_1546.webp",
    ],
  },
  {
    id: "wonosobo",
    name: "Optik I See You — Wonosobo",
    city: "Wonosobo",
    address: "Jl. Jenderal Soedirman, Sumberan Selatan, Wonosobo Bar., Kec. Wonosobo, Kabupaten Wonosobo, Jawa Tengah 56311",
    lat: -7.3641333,
    lng: 109.9006525,
    googleMapsUrl:
      "https://www.google.com/maps/@-7.3641333,109.9006525,3a,75y,214.06h,95.96t/data=!3m7!1e1!3m5!1s52wv97eA5uH5TbrxK2d-Lw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-5.961297991889481%26panoid%3D52wv97eA5uH5TbrxK2d-Lw%26yaw%3D214.0554555325389!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
    hours: "Setiap hari, 09.00–18.00 WIB",
    phone: "0897-7129-039",
    waNumber: "628977129039",
    instagram: "https://www.instagram.com/iseeyou.wonosobo/",
    handle: "@iseeyou.wonosobo",
    images: [
      "/lokasi/wonosobo/IMG_4474.webp",
      "/lokasi/wonosobo/IMG_4475.webp",
      "/lokasi/wonosobo/IMG_4476.webp",
    ],
  },
  {
    id: "cilacap",
    name: "Optik I See You — Cilacap",
    city: "Cilacap",
    address: "Jl. Rinjani Depan Perum GRP No.2 Ruko No.3, Rawagaru, Sidanegara, Kec. Cilacap Tengah, Kabupaten Cilacap, Jawa Tengah 53223",
    lat: -7.7027438,
    lng: 109.015884,
    googleMapsUrl:
      "https://www.google.com/maps/place/Optik+I+See+You+Cilacap/@-7.7027971,109.0161141,3a,90y,300.45h,87.68t/data=!3m7!1e1!3m5!1sO7jVjsEEHTlm-B2xM1_gVQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D2.318765955672859%26panoid%3DO7jVjsEEHTlm-B2xM1_gVQ%26yaw%3D300.4491589372741!7i16384!8i8192!4m14!1m7!3m6!1s0x2e6513eb264f30b7:0x46e84e0577a90d12!2sOptik+I+See+You+Cilacap!8m2!3d-7.7027438!4d109.015884!16s%2Fg%2F11wfqcz267!3m5!1s0x2e6513eb264f30b7:0x46e84e0577a90d12!8m2!3d-7.7027438!4d109.015884!16s%2Fg%2F11wfqcz267?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
    hours: "Setiap hari, 09.00–21.00 WIB",
    phone: "0851-3593-0533",
    waNumber: "6285135930533",
    instagram: "https://www.instagram.com/iseeyou.cilacap/",
    handle: "@iseeyou.cilacap",
    images: [
      "/lokasi/cilacap/IMG_6716.webp",
      "/lokasi/cilacap/IMG_7453.webp",
      "/lokasi/cilacap/IMG_7455.webp",
    ],
  },
  {
    id: "purbalingga",
    name: "Optik I See You — Purbalingga",
    city: "Purbalingga",
    address: "Jl. Onje No.1, Purbalingga Lor, Kec. Purbalingga, Kabupaten Purbalingga, Jawa Tengah 53311",
    lat: -7.3886959,
    lng: 109.3642131,
    googleMapsUrl:
      "https://www.google.com/maps/place/Biznet+Branch+Purbalingga/@-7.3886727,109.3640453,3a,75y,84.57h,90.56t/data=!3m7!1e1!3m5!1serfad5SuKpSvoFKeZ2WQug!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-0.562817720521295%26panoid%3Derfad5SuKpSvoFKeZ2WQug%26yaw%3D84.5675941650801!7i16384!8i8192!4m12!1m5!3m4!2zN8KwMjMnMTguMyJTIDEwOcKwMjEnNTIuMiJF!8m2!3d-7.388426!4d109.3644873!3m5!1s0x2e6559215bc923a5:0x6a1b11df9780c5da!8m2!3d-7.3886959!4d109.3642131!16s%2Fg%2F11rnntk7cf?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
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
      "/lokasi/purbalingga/IMG_8525.webp",
      "/lokasi/purbalingga/IMG_8526.webp",
      "/lokasi/purbalingga/IMG_8533.webp",
    ],
  },
];

export function mapsEmbedUrl(branch: Branch) {
  return `https://www.google.com/maps?q=${branch.lat},${branch.lng}&hl=id&z=16&output=embed`;
}

export function mapsDirectionsUrl(branch: Branch) {
  return branch.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
}

export function branchGoogleReviewsUrl(branch: Branch) {
  switch (branch.id) {
    case "purwokerto":
      return "https://www.google.com/search?q=Optik+I+See+You+Glasses+Purwokerto#lrd=0x2e655f4f68229ef9:0x135220f93a37d3fb,1,,,,";
    case "wonosobo":
      return "https://www.google.com/search?q=optik+i+see+you+wonosobo#lrd=0x2e7aa15b14af5143:0x9f777b70a532866d,1,,,,";
    case "cilacap":
      return "https://www.google.com/search?q=optik+i+see+you+glasses+cilacap#lrd=0x2e6513eb264f30b7:0x46e84e0577a90d12,1,,,,";
    case "purbalingga":
      return "https://www.google.com/search?q=optik+i+see+you+glasses+purbalingga#lrd=0x2e6559f5fffdd7ad:0xed1c5a11a9f20422,1,,,,";
    default:
      return `https://www.google.com/search?q=Optik+I+See+You+${encodeURIComponent(branch.city)}+Ulasan`;
  }
}

export function branchGoogleMapsUrl(branch: Branch) {
  return branch.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name + " " + branch.city)}`;
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

