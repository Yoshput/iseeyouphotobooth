import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Sparkles,
  Eye,
  Glasses,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import {
  BRANCHES,
  type Branch,
  mapsEmbedUrl,
  mapsDirectionsUrl,
  branchWhatsappUrl,
  branchGoogleReviewsUrl,
  SHOPEE_STORE_URL,
} from "@/lib/branches";

interface BranchPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ── 1. Static Export Support ────────────────────────────────────────────────
export const dynamic = "force-static";

export function generateStaticParams() {
  return BRANCHES.map((branch) => ({
    slug: branch.id,
  }));
}

// ── 2. Dynamic SEO Metadata per Branch ──────────────────────────────────────
export async function generateMetadata({
  params,
}: BranchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const branch = BRANCHES.find((b) => b.id === slug);

  if (!branch) {
    return {
      title: "Cabang Tidak Ditemukan | Optik I See You",
    };
  }

  const title = `Optik I See You ${branch.city} — Periksa Mata Gratis, Kacamata & AR Try-On | ${branch.address.split(",")[0]}`;
  const description = `Kunjungi Optik I See You cabang ${branch.city} di ${branch.address}. Layanan periksa mata digital gratis, ratusan frame kacamata estetik, softlens original, faset lensa express CNC, dan coba kacamata virtual AR. Buka: ${branch.hours}. Telp/WA: ${branch.phone}.`;
  const canonicalUrl = `https://optikiseeyou.com/cabang/${branch.id}`;
  const ogImage = branch.images[0] || "/hero-bg.jpg";

  return {
    title,
    description,
    keywords: [
      `optik i see you ${branch.city.toLowerCase()}`,
      `optik ${branch.city.toLowerCase()}`,
      `kacamata ${branch.city.toLowerCase()}`,
      `toko kacamata ${branch.city.toLowerCase()}`,
      `periksa mata ${branch.city.toLowerCase()}`,
      `softlens ${branch.city.toLowerCase()}`,
      `cek mata gratis ${branch.city.toLowerCase()}`,
      `optik terdekat ${branch.city.toLowerCase()}`,
      `optik i see you`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Optik I See You ${branch.city} — Layanan Optik & Kacamata Terpercaya`,
      description,
      url: canonicalUrl,
      siteName: "Optik I See You",
      locale: "id_ID",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 800,
          alt: `Toko Optik I See You Cabang ${branch.city}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Optik I See You ${branch.city} — Periksa Mata & Kacamata Trendi`,
      description,
      images: [ogImage],
    },
  };
}

// ── 3. Branch Content Descriptions Tailored to Local SEO ────────────────────
const BRANCH_DESCRIPTIONS: Record<
  string,
  {
    heroTagline: string;
    overview: string[];
    highlights: string[];
    surroundings: string;
  }
> = {
  purwokerto: {
    heroTagline: "Cabang Pusat & Laboratorium Faset CNC Utama Banyumas",
    overview: [
      "Optik I See You Purwokerto hadir sebagai destinasi kacamata dan softlens modern terfavorit bagi mahasiswa, pelajar, dan masyarakat Banyumas. Terletak strategis di kawasan Sumbang (dekat kampus Unsoed), toko kami menyediakan ratusan pilihan frame kacamata dari gaya Quiet Luxury, Cat Eye, Metro Geek, hingga Titanium Series yang ringan dan kuat.",
      "Dilengkapi dengan fasilitas pemeriksaan mata komputerisasi Autorefractor digital serta Trial Lens Set lengkap, Anda dapat melakukan konsultasi dan cek minus/silinder mata secara GRATIS bersama tim refraksionis berpengalaman. Kami juga memiliki laboratorium faset otomatis berteknologi 3D Frame Tracing CNC untuk pengerjaan kacamata resep express yang bisa ditunggu.",
    ],
    highlights: [
      "Pemeriksaan Mata Komputerisasi Gratis (Autorefractor Digital)",
      "Pengerjaan Lensa Express dengan Mesin CNC 3D Tracing 0.01 mm",
      "Koleksi Lengkap Frame Kacamata Pria & Wanita Terbaru",
      "Katalog Softlens Resmi (ICE, X2, Pure N'Soft) Kadar Air Tinggi",
      "Photobooth Kacamata AR & Cetak Foto Strip Instan di Tempat",
    ],
    surroundings:
      "Lokasi sangat mudah diakses dari arah Purwokerto Kota maupun kampus Unsoed, berada di Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang, Sumbang dengan area parkir yang nyaman.",
  },
  purbalingga: {
    heroTagline: "Pusat Kacamata Estetik & Periksa Mata Gratis di Jl. Onje",
    overview: [
      "Optik I See You Purbalingga berlokasi strategis di Jl. Onje No.1, Purbalingga Lor. Kami menghadirkan solusi penglihatan terbaik dengan koleksi frame kacamata stylish, elegan, dan harga transparan yang ramah di kantong.",
      "Dapatkan layanan cek visus mata dan konsultasi kacamata gratis tanpa syarat. Kami menyediakan berbagai jenis lensa berkualitas: Lensa Anti Radiasi Blueray untuk pengguna gadget, Lensa Photochromic bunglon yang berubah gelap di bawah sinar matahari, Lensa Bluechromic serbaguna, hingga Lensa Progresif untuk usia 40 tahun ke atas.",
    ],
    highlights: [
      "Konsultasi & Cek Mata Gratis dengan Peralatan Refraksi Akurat",
      "Pilihan Lensa Blueray, Photochromic, Bluechromic, & Progresif",
      "Frame Kacamata Trendy Bergaransi dan Nyaman Dipakai",
      "Layanan Ramah, Cepat, dan Pembersihan Kacamata Gratis",
      "Promo Menarik Setiap Bulan Khusus Pelajar & Mahasiswa",
    ],
    surroundings:
      "Terletak di pusat keramaian Purbalingga (Jl. Onje No.1), dekat dengan kawasan perkantoran dan sekolah, memudahkan Anda untuk mampir periksa mata atau memesan kacamata kapan saja.",
  },
  wonosobo: {
    heroTagline: "Layanan Optik Modern di Jantung Kota Wonosobo",
    overview: [
      "Optik I See You Wonosobo beralamat di Jl. Jenderal Soedirman, Sumberan Selatan (jalan protokol utama Wonosobo). Kami menjadi pilihan utama masyarakat Wonosobo dan sekitarnya yang mendambakan kacamata berkualitas tinggi dengan desain estetik kekinian.",
      "Koleksi kami dirancang untuk menunjang aktivitas harian maupun liburan di daerah berhawa sejuk Wonosobo dan Dieng. Tersedia pula kacamata hitam Sunglasses berfitur UV400 dan Polarized untuk melindungi mata dari silau matahari, serta softlens nyaman dengan kadar air optimal.",
    ],
    highlights: [
      "Cek Mata Digital Gratis dengan Tenaga Berpengalaman",
      "Kacamata Sunglasses Polarized & UV400 Cocok untuk Wisata Dieng",
      "Lensa Anti-Embun & Anti-Refleksi untuk Cuaca Dingin",
      "Garansi Ketepatan Resep Lensa dan Garansi Frame",
      "Pilihan Softlens Natural & Glamour Berizin Kemenkes RI",
    ],
    surroundings:
      "Berada tepat di tepi Jl. Jenderal Soedirman, jalur utama kota Wonosobo, sangat mudah ditemukan dengan plang toko Optik I See You yang khas dan terang.",
  },
  cilacap: {
    heroTagline: "Pusat Frame Kacamata Pesisir & Softlens di Jl. Rinjani",
    overview: [
      "Optik I See You Cilacap menyapa masyarakat kota pesisir Cilacap dengan toko yang luas, nyaman, dan ber-AC di Jl. Rinjani (depan Perum GRP Ruko No.3, Sidanegara). Kami menyediakan ragam pilihan frame kacamata berbahan Acetate tebal dan Titanium anti-karat yang sangat awet untuk iklim pesisir.",
      "Nikmati kenyamanan periksa mata digital secara gratis. Tim kami siap membantu Anda memilih bentuk kacamata yang paling sesuai dengan proporsi wajah, warna kulit, dan kebutuhan refraksi mata (minus, plus, silinder).",
    ],
    highlights: [
      "Frame Kacamata Titanium Tahan Karat & Acetate Premium",
      "Cek Mata Digital Komputerisasi Gratis Setiap Hari",
      "Lensa Perlindungan UV Maksimal & Anti Radiasi Komputer",
      "Koleksi Softlens Lengkap dengan Cairan Pembersih Steril",
      "Area Toko Luas, Nyaman, dan Parkir Mobil/Motor Lapang",
    ],
    surroundings:
      "Beralamat di Jl. Rinjani Depan Perum GRP No.2 Ruko No.3, Sidanegara, Cilacap Tengah — lokasi strategis dekat pusat kuliner dan perumahan.",
  },
};

// ── 4. Main Branch Page Component ───────────────────────────────────────────
export default async function BranchDetailPage({ params }: BranchPageProps) {
  const { slug } = await params;
  const branch = BRANCHES.find((b) => b.id === slug);

  if (!branch) {
    notFound();
  }

  const content = BRANCH_DESCRIPTIONS[branch.id] || {
    heroTagline: `Cabang Resmi Optik I See You di Kota ${branch.city}`,
    overview: [
      `Optik I See You ${branch.city} melayani kebutuhan kacamata, periksa mata gratis, dan softlens berkualitas tinggi.`,
    ],
    highlights: [
      "Periksa Mata Komputerisasi Gratis",
      "Frame Kacamata Berkualitas dan Bergaransi",
      "Pilihan Lensa Lengkap dan Faset Presisi",
    ],
    surroundings: branch.address,
  };

  const otherBranches = BRANCHES.filter((b) => b.id !== branch.id);

  // ── Schema.org Optician JSON-LD ──────────────────────────────────────────
  const openingHoursSpec =
    branch.id === "purbalingga"
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "11:00",
            closes: "20:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday", "Sunday"],
            opens: "09:00",
            closes: "21:00",
          },
        ]
      : branch.id === "wonosobo"
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "18:00",
          },
        ]
      : [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "21:00",
          },
        ];

  const opticianSchema = {
    "@context": "https://schema.org",
    "@type": "Optician",
    "@id": `https://optikiseeyou.com/cabang/${branch.id}#store`,
    name: `Optik I See You ${branch.city}`,
    alternateName: [
      `Optik I See You Cabang ${branch.city}`,
      `I See You Glasses ${branch.city}`,
      `Optik ${branch.city}`,
    ],
    image: branch.images.map((img) => `https://optikiseeyou.com${img}`),
    url: `https://optikiseeyou.com/cabang/${branch.id}`,
    telephone: branch.phone.replace(/[^0-9+]/g, "").startsWith("0")
      ? `+62${branch.phone.replace(/[^0-9]/g, "").slice(1)}`
      : branch.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.city,
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.lat,
      longitude: branch.lng,
    },
    openingHoursSpecification: openingHoursSpec,
    sameAs: [
      branch.instagram,
      "https://www.instagram.com/iseeyou.glasses",
      "https://www.tiktok.com/@iseeyouglasses",
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "Optik I See You",
      url: "https://optikiseeyou.com",
      logo: "https://optikiseeyou.com/logo.png",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
        name: "Lokasi Cabang",
        item: "https://optikiseeyou.com/#lokasi",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Optik I See You ${branch.city}`,
        item: `https://optikiseeyou.com/cabang/${branch.id}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-isy-ivory text-isy-ink select-none">
      {/* ── Schema.org Injection ─────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(opticianSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Global Navbar */}
      <Navbar />

      {/* ── Breadcrumb Navigation ──────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="pt-24 pb-4 px-6 md:px-12 lg:px-20 border-b border-isy-line bg-white/60 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl flex items-center gap-2 text-xs text-isy-ink/60">
          <Link href="/" className="hover:text-isy-green-deep transition-colors font-medium">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-isy-ink/30" />
          <Link href="/#lokasi" className="hover:text-isy-green-deep transition-colors font-medium">
            Lokasi Cabang
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-isy-ink/30" />
          <span className="font-bold text-isy-green-deep truncate">
            {branch.city}
          </span>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 lg:px-20 py-12 md:py-16 overflow-hidden">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-isy-green-bright/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-isy-green-deep">
              <Building2 className="w-3.5 h-3.5 text-isy-green-bright" />
              <span>Cabang Resmi Jawa Tengah</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-isy-green-deep tracking-tight leading-[1.15]">
              Optik I See You{" "}
              <span className="text-isy-green-bright italic block sm:inline">
                {branch.city}
              </span>
            </h1>

            <p className="text-sm md:text-base font-semibold text-isy-ink/80 leading-relaxed max-w-xl">
              {content.heroTagline}
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-isy-line text-xs font-bold text-isy-green-deep shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-isy-green-bright shrink-0" />
                Cek Mata Gratis
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-isy-line text-xs font-bold text-isy-green-deep shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-isy-green-bright shrink-0" />
                Faset Lensa CNC Express
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-isy-line text-xs font-bold text-isy-green-deep shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-isy-green-bright shrink-0" />
                Garansi Resmi Resep
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={branchWhatsappUrl(branch)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-isy-green-bright hover:bg-isy-green-deep text-white px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-isy-green-bright/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp {branch.city}</span>
              </a>

              <a
                href={mapsDirectionsUrl(branch)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-isy-mist border border-isy-line text-isy-green-deep px-5 py-3.5 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-isy-green-bright" />
                <span>Petunjuk Arah (Maps)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Key Info Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-black/5 space-y-4.5">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-isy-green-bright">
                Informasi Lengkap Cabang
              </h2>

              {/* Address Item */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-isy-line/70">
                <div className="p-2.5 rounded-2xl bg-isy-green-bright/10 text-isy-green-deep shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-isy-green-bright" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-isy-green-deep uppercase tracking-wider">
                    Alamat Toko
                  </p>
                  <p className="text-xs text-isy-ink/80 leading-relaxed">
                    {branch.address}
                  </p>
                </div>
              </div>

              {/* Opening Hours Item */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-isy-line/70">
                <div className="p-2.5 rounded-2xl bg-isy-green-bright/10 text-isy-green-deep shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-isy-green-bright" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-isy-green-deep uppercase tracking-wider">
                    Jam Operasional
                  </p>
                  {branch.hoursDetail ? (
                    <div className="text-xs text-isy-ink/80 space-y-0.5">
                      <p>{branch.hoursDetail.weekdays}</p>
                      <p>{branch.hoursDetail.weekend}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-isy-ink/80">{branch.hours}</p>
                  )}
                </div>
              </div>

              {/* Telephone & WA Item */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-isy-green-bright/10 text-isy-green-deep shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-isy-green-bright" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-isy-green-deep uppercase tracking-wider">
                    Kontak &amp; WhatsApp
                  </p>
                  <p className="text-xs font-bold text-isy-green-deep">{branch.phone}</p>
                  <p className="text-[11px] text-isy-ink/60">
                    Instagram:{" "}
                    <a
                      href={branch.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-isy-green-bright font-bold hover:underline"
                    >
                      {branch.handle}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORE PHOTO GALLERY ────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-10 bg-white border-y border-isy-line">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-isy-green-bright">
                Galeri Suasana Toko
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep mt-1">
                Etalase &amp; Fasilitas Optik I See You {branch.city}
              </h2>
            </div>
            <p className="text-xs text-isy-ink/60">Foto asli lokasi fisik cabang {branch.city}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {branch.images.map((imgSrc, idx) => (
              <div
                key={idx}
                className="group relative h-64 sm:h-72 w-full rounded-2xl md:rounded-3xl overflow-hidden border border-isy-line bg-isy-mist/30 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-isy-green-bright/40"
              >
                <Image
                  src={imgSrc}
                  alt={`Suasana Toko Optik I See You ${branch.city} — Foto ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs font-bold text-white tracking-wide">
                    Optik I See You {branch.city} • Foto #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOOGLE MAPS EMBED & ROUTE SECTION ──────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-14">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-isy-green-bright">
              Lokasi &amp; Rute
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
              Kunjungi Toko Kami di {branch.city}
            </h2>
            <p className="text-xs sm:text-sm text-isy-ink/70">
              {content.surroundings}
            </p>
          </div>

          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden border border-isy-line shadow-lg bg-isy-mist/40">
            <iframe
              title={`Peta Lokasi Optik I See You ${branch.city}`}
              src={mapsEmbedUrl(branch)}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0 w-full h-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={mapsDirectionsUrl(branch)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-isy-green-deep hover:bg-isy-green-bright text-white px-6 py-3 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Buka Navigasi Rute di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href={branchGoogleReviewsUrl(branch)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-isy-mist border border-isy-line text-isy-green-deep px-5 py-3 text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-95"
            >
              <span>Lihat Ulasan Pelanggan Google ⭐ 5.0</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── DETAILED UNIQUE SEO CONTENT ────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-14 bg-white border-t border-isy-line">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
              Tentang Layanan Optik I See You {branch.city}
            </h2>
            {content.overview.map((para, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-isy-ink/80 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Highlights Box */}
          <div className="rounded-3xl border border-isy-line bg-isy-mist/30 p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-isy-green-deep">
              Keunggulan Berbelanja Kacamata di Cabang {branch.city}:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-isy-ink/85">
              {content.highlights.map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-isy-green-bright shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border border-isy-line bg-white p-5 space-y-2 shadow-2xs">
              <Eye className="w-6 h-6 text-isy-green-bright" />
              <h4 className="text-xs font-bold text-isy-green-deep uppercase tracking-wide">
                Periksa Mata Gratis
              </h4>
              <p className="text-xs text-isy-ink/65 leading-relaxed">
                Refraksi komputerisasi akurat tanpa biaya untuk cek minus, plus, dan silinder.
              </p>
            </div>

            <div className="rounded-2xl border border-isy-line bg-white p-5 space-y-2 shadow-2xs">
              <Glasses className="w-6 h-6 text-isy-green-bright" />
              <h4 className="text-xs font-bold text-isy-green-deep uppercase tracking-wide">
                Ratusan Frame Trendy
              </h4>
              <p className="text-xs text-isy-ink/65 leading-relaxed">
                Koleksi frame kacamata pria &amp; wanita model kekinian dengan bahan berkualitas.
              </p>
            </div>

            <div className="rounded-2xl border border-isy-line bg-white p-5 space-y-2 shadow-2xs">
              <ShieldCheck className="w-6 h-6 text-isy-green-bright" />
              <h4 className="text-xs font-bold text-isy-green-deep uppercase tracking-wide">
                Garansi &amp; Layanan Cepat
              </h4>
              <p className="text-xs text-isy-ink/65 leading-relaxed">
                Pemotongan lensa faset CNC express presisi dengan garansi kenyamanan optik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AR TRY-ON & ONLINE CATALOG BANNER ──────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-12 bg-gradient-to-br from-isy-green-deep to-[#0A2616] text-white">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold tracking-wider uppercase text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            Coba Kacamata Sebelum Datang ke Toko
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
            Coba Kacamata Virtual di Wajahmu Sekarang
          </h2>

          <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
            Gunakan kamera HP atau laptop Anda untuk mencoba koleksi frame kacamata Optik I See You secara real-time dengan teknologi Augmented Reality 3D.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/try-on"
              className="inline-flex items-center gap-2 rounded-2xl bg-isy-green-bright hover:bg-emerald-400 text-white px-7 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
            >
              <span>Mulai Coba AR Try-On →</span>
            </Link>

            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 text-xs sm:text-sm font-bold transition-all active:scale-95"
            >
              <span>Lihat Katalog Frame</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CROSS-BRANCH INTERNAL LINKING ──────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-14 bg-isy-ivory border-t border-isy-line">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-isy-green-bright">
              Jaringan Cabang Resmi
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep">
              Cabang Optik I See You Lainnya
            </h2>
            <p className="text-xs text-isy-ink/60">
              Temukan toko Optik I See You terdekat di kota Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {otherBranches.map((ob) => (
              <Link
                key={ob.id}
                href={`/cabang/${ob.id}`}
                className="group relative rounded-3xl border border-isy-line bg-white p-6 shadow-sm transition-all duration-300 hover:border-isy-green-bright/60 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-isy-green-bright">
                      Cabang {ob.city}
                    </span>
                    <span className="text-xs text-isy-green-deep group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-isy-green-deep">
                    Optik I See You {ob.city}
                  </h3>
                  <p className="text-xs text-isy-ink/65 line-clamp-2 leading-relaxed">
                    {ob.address}
                  </p>
                </div>

                <div className="pt-4 border-t border-isy-line/60 flex items-center justify-between text-[11px] text-isy-ink/50 mt-4">
                  <span>{ob.hours}</span>
                  <span className="font-bold text-isy-green-deep group-hover:text-isy-green-bright transition-colors">
                    Lihat Lokasi
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#0D2F1D] text-white border-t border-white/10 px-6 sm:px-10 py-10 text-xs">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white text-sm">Optik I See You {branch.city}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{branch.address}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <span>•</span>
            <Link href="/katalog" className="hover:text-white transition-colors">
              Katalog Frame
            </Link>
            <span>•</span>
            <Link href="/softlens" className="hover:text-white transition-colors">
              Katalog Softlens
            </Link>
            <span>•</span>
            <Link href="/try-on" className="hover:text-white transition-colors">
              AR Try-On
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
