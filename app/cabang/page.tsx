import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Phone, Navigation, ArrowRight } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { BRANCHES, mapsDirectionsUrl, branchWhatsappUrl } from "@/lib/branches";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "4 Cabang Resmi Optik I See You — Purwokerto, Purbalingga, Wonosobo, Cilacap",
  description: "Temukan toko kacamata Optik I See You terdekat di Purwokerto, Purbalingga, Wonosobo, dan Cilacap. Periksa mata gratis, faset express, dan coba kacamata AR.",
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
    description: "Kunjungi gerai Optik I See You di Purwokerto, Purbalingga, Wonosobo, dan Cilacap. Cek alamat, jam buka, dan kontak WhatsApp.",
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
            address: {
              "@type": "PostalAddress",
              streetAddress: b.address.split(",")[0],
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
    <main className="min-h-screen bg-isy-ivory text-isy-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-block rounded-full bg-isy-green-bright/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-isy-green-bright mb-4">
            Lokasi Gerai Resmi
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-isy-green-deep tracking-tight mb-4">
            4 Cabang Optik I See You
          </h1>
          <p className="text-sm sm:text-base text-isy-ink/70 max-w-2xl mx-auto leading-relaxed">
            Kunjungi gerai kami di Purwokerto, Purbalingga, Wonosobo, dan Cilacap untuk konsultasi &amp; periksa mata komputerisasi gratis, pembuatan lensa express, serta koleksi kacamata kekinian.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {BRANCHES.map((branch) => {
            const coverImg = branch.images[0] || "/hero-bg.jpg";
            return (
              <div
                key={branch.id}
                className="group flex flex-col rounded-3xl border border-isy-line bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-isy-green-bright/40"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-isy-mist mb-5">
                  <Image
                    src={coverImg}
                    alt={`Optik I See You Cabang ${branch.city}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-isy-green-deep shadow-xs">
                    {branch.city}
                  </div>
                </div>

                <h2 className="font-serif text-2xl font-bold text-isy-green-deep mb-2">
                  {branch.name}
                </h2>

                <div className="space-y-2.5 text-xs text-isy-ink/70 mb-6 grow">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-isy-green-bright shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-isy-green-bright shrink-0" />
                    <span>{branch.hours}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-isy-green-bright shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-isy-line">
                  <Link
                    href={`/cabang/${branch.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-isy-green-deep px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-isy-green-bright"
                  >
                    <span>Detail Cabang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={mapsDirectionsUrl(branch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-isy-line bg-isy-mist px-4 py-2.5 text-xs font-bold text-isy-green-deep transition-colors hover:bg-white hover:border-isy-green-bright"
                  >
                    <Navigation className="w-3.5 h-3.5 text-isy-green-bright" />
                    <span>Arah Maps</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
