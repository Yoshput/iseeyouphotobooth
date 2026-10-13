import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Phone, Navigation, ArrowRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { BRANCHES, mapsDirectionsUrl, branchWhatsappUrl } from "@/lib/branches";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "4 Cabang Resmi Optik I See You - Purwokerto, Purbalingga, Wonosobo, Cilacap",
  description:
    "Temukan toko kacamata Optik I See You terdekat di Purwokerto, Purbalingga, Wonosobo, dan Cilacap. Periksa mata gratis, faset express CNC, dan koleksi frame berkualitas.",
  keywords: [
    "cabang optik i see you",
    "optik purwokerto",
    "optik purbalingga",
    "optik wonosobo",
    "optik cilacap",
    "toko kacamata terdekat",
    "periksa mata gratis",
  ],
  openGraph: {
    title: "4 Cabang Resmi Optik I See You | Jawa Tengah",
    description:
      "Kunjungi gerai Optik I See You di Purwokerto, Purbalingga, Wonosobo, dan Cilacap. Cek alamat, jam buka, dan kontak WhatsApp.",
    url: "https://optikiseeyou.com/cabang",
    siteName: "Optik I See You",
    images: [{ url: "/hero-bg.jpg", width: 1280, height: 853, alt: "Cabang Optik I See You" }],
    locale: "id_ID",
    type: "website",
  },
  alternates: { canonical: "https://optikiseeyou.com/cabang" },
};

export default function CabangIndexPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://optikiseeyou.com/cabang#list",
        name: "Daftar Cabang Resmi Optik I See You",
        description: "Jaringan gerai kacamata modern Optik I See You di Jawa Tengah.",
        itemListElement: BRANCHES.map((b, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": ["LocalBusiness", "Optician"],
            name: `Optik I See You ${b.city}`,
            url: `https://optikiseeyou.com/cabang/${b.id}`,
            telephone: b.phone,
            priceRange: "$$",
            address: {
              "@type": "PostalAddress",
              streetAddress: b.address.split(",")[0].trim(),
              addressLocality: b.city,
              addressRegion: "Jawa Tengah",
              addressCountry: "ID",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: b.lat,
              longitude: b.lng,
            },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://optikiseeyou.com/cabang#breadcrumb",
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
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F8F5ED] text-[#183C30]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      {/* Header Section */}
      <section className="pt-28 pb-10 px-4 sm:px-6 md:px-12 lg:px-20 border-b border-[#E3E7DF] bg-white">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[#626C65]">
              <li>
                <Link href="/" className="hover:text-[#124734] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-[#183C30]" aria-current="page">
                Cabang Resmi
              </li>
            </ol>
          </nav>

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-[#124734] tracking-tight">
              Cabang Resmi Optik I See You
            </h1>
            <p className="text-sm sm:text-base text-[#626C65] leading-relaxed">
              Kunjungi gerai kami di Purwokerto, Purbalingga, Wonosobo, dan Cilacap untuk periksa mata komputerisasi gratis, pembuatan lensa express CNC, serta koleksi frame kacamata &amp; softlens terlengkap.
            </p>
          </div>
        </div>
      </section>

      {/* Branch Cards Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {BRANCHES.map((branch) => {
            const coverImg = branch.images[0] || "/hero-bg.jpg";

            return (
              <article
                key={branch.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#E3E7DF] bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-[#124734]/40 hover:shadow-md"
              >
                <div>
                  {/* Clickable Photo Container */}
                  <Link
                    href={`/cabang/${branch.id}`}
                    aria-label={`Buka detail cabang Optik I See You ${branch.city}`}
                    className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#FAF8F3] mb-5 block border border-[#EAE5D9] focus:outline-none focus:ring-2 focus:ring-[#124734]"
                  >
                    <Image
                      src={coverImg}
                      alt={`Foto gerai Optik I See You Cabang ${branch.city}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-104"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-3 right-3 rounded-md bg-[#124734]/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
                      Buka Profil Cabang →
                    </span>
                  </Link>

                  {/* Title linked to branch */}
                  <Link
                    href={`/cabang/${branch.id}`}
                    className="focus:outline-none focus:ring-1 focus:ring-[#124734] rounded"
                  >
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#183C30] group-hover:text-[#124734] transition-colors mb-2">
                      {branch.name}
                    </h2>
                  </Link>

                  {/* Info details */}
                  <div className="space-y-2.5 text-xs text-[#626C65] mb-6">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#124734] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#124734] shrink-0" />
                      <span>{branch.hours}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#124734] shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Separated Action Buttons */}
                <div className="pt-4 border-t border-[#F2EEE6] space-y-2.5">
                  <Link
                    href={`/cabang/${branch.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#124734] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0C3527] focus:outline-none focus:ring-2 focus:ring-[#124734]"
                  >
                    <span>Detail &amp; Fasilitas Cabang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={branchWhatsappUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#124734] transition-colors hover:bg-[#124734] hover:text-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={mapsDirectionsUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#183C30] transition-colors hover:bg-white hover:border-[#124734]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#124734]" />
                      <span>Petunjuk Arah</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
