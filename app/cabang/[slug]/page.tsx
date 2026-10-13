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
  mapsEmbedUrl,
  mapsDirectionsUrl,
  branchWhatsappUrl,
  branchGoogleReviewsUrl,
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

  const title = `Optik I See You ${branch.city} - Kacamata Minus, Cek Mata Gratis & Ganti Lensa`;
  const description = `Gerai kacamata resmi Optik I See You di ${branch.city}: ${branch.address}. Layanan periksa mata komputerisasi gratis, ratusan frame kacamata minus & silinder, softlens resmi Kemenkes RI, dan pengerjaan lensa faset express CNC. Jam buka: ${branch.hours}. Telp/WA: ${branch.phone}.`;
  const canonicalUrl = `https://optikiseeyou.com/cabang/${branch.id}`;
  const ogImage = branch.images[0] || "/hero-bg.jpg";

  return {
    title,
    description,
    keywords: [
      `optik ${branch.city.toLowerCase()}`,
      `toko kacamata ${branch.city.toLowerCase()}`,
      `kacamata minus ${branch.city.toLowerCase()}`,
      `periksa mata gratis ${branch.city.toLowerCase()}`,
      `ganti lensa kacamata ${branch.city.toLowerCase()}`,
      `softlens ${branch.city.toLowerCase()}`,
      `optik i see you ${branch.city.toLowerCase()}`,
      `optik terdekat ${branch.city.toLowerCase()}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Optik I See You ${branch.city} - Gerai Kacamata & Periksa Mata Gratis`,
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
      title: `Optik I See You ${branch.city} - Periksa Mata & Kacamata Trendi`,
      description,
      images: [ogImage],
    },
  };
}

// ── 3. Branch Content Descriptions Tailored to Local Area ────────────────────
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
      "Optik I See You Purwokerto hadir sebagai destinasi kacamata dan softlens modern terfavorit bagi mahasiswa, pelajar, dan masyarakat Banyumas. Terletak strategis di kawasan Sumbang (dekat kampus Unsoed), toko kami menyediakan pilihan frame kacamata dari berbagai gaya serta lensa resep berkualitas.",
      "Dilengkapi dengan fasilitas pemeriksaan mata komputerisasi Autorefractor digital serta Trial Lens Set lengkap, Anda dapat melakukan konsultasi dan cek minus/silinder mata secara GRATIS bersama tim refraksionis berpengalaman. Kami juga memiliki laboratorium faset otomatis berteknologi 3D Frame Tracing CNC untuk pengerjaan kacamata resep express yang bisa ditunggu.",
    ],
    highlights: [
      "Pemeriksaan Mata Komputerisasi Gratis (Autorefractor Digital)",
      "Pengerjaan Lensa Express dengan Mesin CNC 3D Tracing Presisi",
      "Koleksi Lengkap Frame Kacamata Pria & Wanita Terbaru",
      "Katalog Softlens Resmi Kemenkes RI Berbagai Warna & Kadar Air",
      "Garansi Ketepatan Resep Kacamata & Penyetelan Frame",
    ],
    surroundings:
      "Lokasi sangat mudah diakses dari arah Purwokerto Kota maupun kampus Unsoed, berada di Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang, Sumbang dengan area parkir yang nyaman.",
  },
  purbalingga: {
    heroTagline: "Pusat Kacamata & Periksa Mata Gratis di Jl. Onje",
    overview: [
      "Optik I See You Purbalingga berlokasi strategis di Jl. Onje No.1, Purbalingga Lor. Kami menghadirkan solusi penglihatan terbaik dengan koleksi frame kacamata stylish, elegan, dan harga transparan yang ramah di kantong.",
      "Dapatkan layanan cek visus mata dan konsultasi kacamata gratis tanpa syarat. Kami menyediakan berbagai jenis lensa berkualitas: Lensa Anti Radiasi Blueray untuk pengguna gadget, Lensa Photochromic yang berubah gelap di bawah sinar matahari, Lensa Bluechromic serbaguna, hingga Lensa Progresif.",
    ],
    highlights: [
      "Konsultasi & Cek Mata Gratis dengan Peralatan Refraksi Akurat",
      "Pilihan Lensa Blueray, Photochromic, Bluechromic, & Progresif",
      "Frame Kacamata Berkualitas, Bergaransi, dan Nyaman Dipakai",
      "Layanan Ramah, Cepat, dan Pembersihan Kacamata Gratis",
      "Pilihan Softlens Berizin Kemenkes RI Lengkap dengan Cairan Steril",
    ],
    surroundings:
      "Terletak di pusat keramaian Purbalingga (Jl. Onje No.1), dekat dengan kawasan perkantoran dan sekolah, memudahkan Anda untuk mampir periksa mata atau memesan kacamata kapan saja.",
  },
  wonosobo: {
    heroTagline: "Layanan Optik Modern di Jantung Kota Wonosobo",
    overview: [
      "Optik I See You Wonosobo beralamat di Jl. Jenderal Soedirman, Sumberan Selatan (jalan protokol utama Wonosobo). Kami menjadi pilihan utama masyarakat Wonosobo dan sekitarnya yang mendambakan kacamata berkualitas tinggi dengan desain estetik kekinian.",
      "Koleksi kami dirancang untuk menunjang aktivitas harian maupun liburan di daerah berhawa sejuk Wonosobo dan Dieng. Tersedia kacamata hitam berfitur UV400 dan Polarized untuk melindungi mata dari silau matahari, serta softlens nyaman dengan kadar air optimal.",
    ],
    highlights: [
      "Cek Mata Digital Gratis dengan Tenaga Refraksi Berpengalaman",
      "Kacamata Sunglasses Polarized & UV400 untuk Wisata Dieng",
      "Lensa Anti-Embun & Anti-Refleksi untuk Kenyamanan Harian",
      "Garansi Ketepatan Resep Lensa dan Garansi Frame",
      "Pilihan Softlens Natural & Glamour Berizin Kemenkes RI",
    ],
    surroundings:
      "Berada tepat di tepi Jl. Jenderal Soedirman, jalur utama kota Wonosobo, sangat mudah ditemukan dengan plang toko Optik I See You yang jelas dan terang.",
  },
  cilacap: {
    heroTagline: "Pusat Frame Kacamata & Softlens di Jl. Rinjani",
    overview: [
      "Optik I See You Cilacap menyapa masyarakat kota pesisir Cilacap dengan toko yang luas, nyaman, dan ber-AC di Jl. Rinjani (depan Perum GRP Ruko No.3, Sidanegara). Kami menyediakan ragam pilihan frame kacamata berbahan Acetate dan Titanium tahan korosi yang awet untuk iklim pesisir.",
      "Nikmati kenyamanan periksa mata digital secara gratis. Tim kami siap membantu Anda memilih bentuk kacamata yang paling sesuai dengan proporsi wajah, warna kulit, dan kebutuhan refraksi mata (minus, plus, silinder).",
    ],
    highlights: [
      "Frame Kacamata Titanium Tahan Karat & Acetate Berkualitas",
      "Cek Mata Digital Komputerisasi Gratis Setiap Hari",
      "Lensa Perlindungan UV Maksimal & Anti Radiasi Komputer",
      "Koleksi Softlens Lengkap dengan Cairan Pembersih Steril",
      "Area Toko Nyaman dan Parkir Mobil/Motor Lapang",
    ],
    surroundings:
      "Beralamat di Jl. Rinjani Depan Perum GRP No.2 Ruko No.3, Sidanegara, Cilacap Tengah - lokasi strategis dekat pusat kuliner dan perumahan.",
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

  // ── Schema.org LocalBusiness / Optician JSON-LD (Verified only) ─────────────
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Optician"],
    "@id": `https://optikiseeyou.com/cabang/${branch.id}#store`,
    name: `Optik I See You ${branch.city}`,
    legalName: "Optik I See You",
    description: `Optik modern di ${branch.city}, Jawa Tengah. Layanan periksa mata gratis dengan Autorefractor digital, ratusan koleksi frame kacamata, softlens resmi Kemenkes RI, dan teknologi AR Try-On virtual.`,
    url: `https://optikiseeyou.com/cabang/${branch.id}`,
    image: branch.images.map((img) =>
      img.startsWith("http") ? img : `https://optikiseeyou.com${img}`
    ),
    telephone: branch.phone,
    priceRange: "$$",
    currenciesAccepted: "IDR",
    paymentAccepted: "Cash, Transfer Bank, QRIS",
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address.split(",")[0].trim(),
      addressLocality: branch.city,
      addressRegion: "Jawa Tengah",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.lat,
      longitude: branch.lng,
    },
    hasMap: branch.googleMapsUrl,
    sameAs: [
      branch.instagram,
      "https://www.instagram.com/iseeyou.glasses",
      "https://www.tiktok.com/@iseeyouglasses",
    ],
    parentOrganization: {
      "@type": "Organization",
      "@id": "https://optikiseeyou.com/#organization",
      name: "Optik I See You",
      url: "https://optikiseeyou.com",
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
        name: "Cabang Resmi",
        item: "https://optikiseeyou.com/cabang",
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
    <main className="min-h-screen bg-[#F8F5ED] text-[#183C30]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="pt-24 pb-4 px-4 sm:px-6 md:px-12 lg:px-20 border-b border-[#E3E7DF] bg-white"
      >
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4 text-xs text-[#626C65]">
          <Link
            href="/cabang"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-[#E3E7DF] bg-[#FAF8F3] px-3 py-1.5 text-xs font-semibold text-[#124734] hover:border-[#124734] hover:bg-white transition-colors"
          >
            <span>← Kembali ke Daftar Cabang</span>
          </Link>

          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#124734] transition-colors">
                Beranda
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-[#626C65]/50" />
            </li>
            <li>
              <Link href="/cabang" className="hover:text-[#124734] transition-colors">
                Cabang
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-[#626C65]/50" />
            </li>
            <li className="font-bold text-[#183C30]" aria-current="page">
              {branch.city}
            </li>
          </ol>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-10 md:py-14 border-b border-[#E3E7DF] bg-white">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md bg-[#124734]/10 px-3 py-1 text-[11px] font-semibold text-[#124734]">
              <Building2 className="w-3.5 h-3.5" />
              <span>Gerai Resmi Jawa Tengah</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#124734] tracking-tight leading-[1.15]">
              Optik I See You {branch.city}
            </h1>

            <p className="text-sm md:text-base font-medium text-[#626C65] leading-relaxed max-w-xl">
              {content.heroTagline}
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F3] border border-[#E3E7DF] text-xs font-semibold text-[#183C30]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#124734] shrink-0" />
                Cek Mata Gratis
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F3] border border-[#E3E7DF] text-xs font-semibold text-[#183C30]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#124734] shrink-0" />
                Faset CNC Express
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F3] border border-[#E3E7DF] text-xs font-semibold text-[#183C30]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#124734] shrink-0" />
                Garansi Resep
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={branchWhatsappUrl(branch)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#124734] hover:bg-[#0C3527] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp {branch.city}</span>
              </a>

              <a
                href={mapsDirectionsUrl(branch)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FAF8F3] hover:bg-white border border-[#E3E7DF] text-[#183C30] px-5 py-3 text-xs sm:text-sm font-semibold transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#124734]" />
                <span>Petunjuk Arah (Google Maps)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Key Info Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E3E7DF] bg-[#FAF8F3] p-6 space-y-4 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#124734]">
                Informasi Gerai
              </h2>

              {/* Address Item */}
              <div className="flex items-start gap-3 pb-3 border-b border-[#E3E7DF]">
                <div className="p-2 rounded-lg bg-white text-[#124734] shrink-0 border border-[#E3E7DF] mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[11px] font-bold text-[#626C65] uppercase">
                    Alamat Lengkap
                  </p>
                  <p className="text-xs text-[#183C30] leading-relaxed">
                    {branch.address}
                  </p>
                </div>
              </div>

              {/* Opening Hours Item */}
              <div className="flex items-start gap-3 pb-3 border-b border-[#E3E7DF]">
                <div className="p-2 rounded-lg bg-white text-[#124734] shrink-0 border border-[#E3E7DF] mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[11px] font-bold text-[#626C65] uppercase">
                    Jam Operasional
                  </p>
                  {branch.hoursDetail ? (
                    <div className="text-xs text-[#183C30] space-y-0.5">
                      <p>{branch.hoursDetail.weekdays}</p>
                      <p>{branch.hoursDetail.weekend}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#183C30]">{branch.hours}</p>
                  )}
                </div>
              </div>

              {/* Telephone & WA Item */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white text-[#124734] shrink-0 border border-[#E3E7DF] mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[11px] font-bold text-[#626C65] uppercase">
                    Kontak &amp; Sosial Media
                  </p>
                  <p className="text-xs font-bold text-[#183C30]">{branch.phone}</p>
                  <p className="text-xs text-[#626C65]">
                    Instagram:{" "}
                    <a
                      href={branch.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#124734] font-semibold hover:underline"
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

      {/* STORE PHOTO GALLERY */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-10 sm:py-14 border-b border-[#E3E7DF] bg-[#FAF8F3]">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#124734]">
                Dokumentasi Cabang
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183C30] mt-1">
                Suasana Toko Optik I See You {branch.city}
              </h2>
            </div>
            <p className="text-xs text-[#626C65]">Foto dokumentasi fisik gerai {branch.city}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {branch.images.map((imgSrc, idx) => (
              <div
                key={idx}
                className="group relative h-60 sm:h-64 w-full rounded-xl overflow-hidden border border-[#E3E7DF] bg-white shadow-2xs"
              >
                <Image
                  src={imgSrc}
                  alt={`Suasana Toko Optik I See You ${branch.city} - Foto ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-104"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-xs font-semibold text-white">
                    {branch.name} • Foto {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOOGLE MAPS EMBED & ROUTE SECTION */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 bg-white border-b border-[#E3E7DF]">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#124734]">
              Peta Lokasi
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183C30]">
              Lokasi &amp; Navigasi di {branch.city}
            </h2>
            <p className="text-xs sm:text-sm text-[#626C65] leading-relaxed">
              {content.surroundings}
            </p>
          </div>

          <div className="relative w-full h-[340px] sm:h-[400px] md:h-[450px] rounded-2xl overflow-hidden border border-[#E3E7DF] bg-[#FAF8F3]">
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#124734] hover:bg-[#0C3527] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka Petunjuk Arah di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href={branchGoogleReviewsUrl(branch)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] hover:bg-white text-[#183C30] px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Ulasan Google Maps Cabang {branch.city} ↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* DETAILED CONTENT SECTION */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 bg-[#FAF8F3] border-b border-[#E3E7DF]">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183C30]">
              Layanan Optik I See You {branch.city}
            </h2>
            {content.overview.map((para, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-[#626C65] leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Highlights Box */}
          <div className="rounded-2xl border border-[#E3E7DF] bg-white p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#124734]">
              Keunggulan Cabang {branch.city}:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#183C30]">
              {content.highlights.map((hl, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#124734] shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl border border-[#E3E7DF] bg-white p-5 space-y-2">
              <Eye className="w-5 h-5 text-[#124734]" />
              <h4 className="text-xs font-bold text-[#183C30] uppercase">
                Periksa Mata Gratis
              </h4>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Refraksi komputerisasi digital akurat untuk mengukur minus, plus, dan silinder.
              </p>
            </div>

            <div className="rounded-xl border border-[#E3E7DF] bg-white p-5 space-y-2">
              <Glasses className="w-5 h-5 text-[#124734]" />
              <h4 className="text-xs font-bold text-[#183C30] uppercase">
                Koleksi Frame Lengkap
              </h4>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Ragam pilihan bingkai kacamata terkini dengan material kokoh dan nyaman.
              </p>
            </div>

            <div className="rounded-xl border border-[#E3E7DF] bg-white p-5 space-y-2">
              <ShieldCheck className="w-5 h-5 text-[#124734]" />
              <h4 className="text-xs font-bold text-[#183C30] uppercase">
                Garansi &amp; Faset CNC
              </h4>
              <p className="text-xs text-[#626C65] leading-relaxed">
                Pemotongan lensa express dengan mesin tracing presisi serta garansi kenyamanan resep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AR TRY-ON & ONLINE CATALOG BANNER */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-12 bg-[#124734] text-white">
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold tracking-wider uppercase text-white/90">
            <Sparkles className="w-3.5 h-3.5" />
            Fitur Coba Kacamata Virtual
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
            Coba Kacamata Secara Virtual Sebelum Datang ke Toko
          </h2>

          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Gunakan kamera ponsel atau laptop Anda untuk mencoba koleksi frame kacamata Optik I See You secara langsung dengan Augmented Reality 3D.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/try-on"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#124734] hover:bg-[#F8F5ED] px-6 py-3 text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <span>Coba AR Try-On Sekarang →</span>
            </Link>

            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Lihat Katalog Frame</span>
            </Link>
          </div>
        </div>
      </section>

      {/* OTHER BRANCHES CROSS-LINKING */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16 bg-white border-b border-[#E3E7DF]">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#124734]">
              Jaringan Gerai
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#183C30]">
              Cabang Optik I See You Lainnya
            </h2>
            <p className="text-xs text-[#626C65]">
              Temukan toko Optik I See You terdekat di kota Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {otherBranches.map((ob) => (
              <Link
                key={ob.id}
                href={`/cabang/${ob.id}`}
                className="group rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] p-5 shadow-2xs transition-all duration-200 hover:border-[#124734]/40 hover:bg-white hover:shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#124734]">
                      Cabang {ob.city}
                    </span>
                    <span className="text-xs text-[#124734] group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#183C30]">
                    {ob.name}
                  </h3>
                  <p className="text-xs text-[#626C65] line-clamp-2 leading-relaxed">
                    {ob.address}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE5D9] flex items-center justify-between text-[11px] text-[#626C65] mt-4">
                  <span>{ob.hours}</span>
                  <span className="font-semibold text-[#124734]">
                    Lihat Cabang
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#183C30] text-white px-4 sm:px-6 lg:px-8 py-8 text-xs">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white text-sm">Optik I See You {branch.city}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{branch.address}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/70 flex-wrap justify-center">
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
            <Link href="/cabang" className="hover:text-white transition-colors">
              Semua Cabang
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
