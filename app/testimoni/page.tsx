import TestimoniClient from "./TestimoniClient";
import Navbar from "@/components/ui/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimoni & Review Pelanggan | Optik I See You",
  description: "⭐⭐⭐⭐⭐ Ribuan ulasan bintang 5 dari Google Maps! Baca pengalaman pelanggan Optik I See You di Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
  openGraph: {
    title: "Testimoni & Review Pelanggan | Optik I See You",
    description: "Baca ribuan ulasan bintang 5 dari pelanggan nyata Optik I See You di 4 cabang Jawa Tengah.",
    url: "https://optikiseeyou.com/testimoni",
    siteName: "Optik I See You",
    images: [{ url: "/hero-bg.jpg", width: 1280, height: 853, alt: "Testimoni Pelanggan Optik I See You" }],
    locale: "id_ID",
    type: "website",
  },
  alternates: { canonical: "https://optikiseeyou.com/testimoni" },
};

export default function TestimoniPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "Optician"],
        "@id": "https://optikiseeyou.com/#organization",
        name: "Optik I See You",
        url: "https://optikiseeyou.com",
        image: "https://optikiseeyou.com/hero-bg.jpg",
        telephone: "+62895-4156-14261",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang",
          addressLocality: "Purwokerto, Banyumas",
          addressRegion: "Jawa Tengah",
          postalCode: "53124",
          addressCountry: "ID",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          bestRating: "5",
          worstRating: "1",
          ratingCount: "1250",
          reviewCount: "1250",
        },
      },
      {
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
            name: "Testimoni Pelanggan",
            item: "https://optikiseeyou.com/testimoni",
          },
        ],
      },
    ],
  };

  return (
    <main className="relative w-full min-h-screen bg-[#FAF6EC] pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <div className="pt-24 sm:pt-32">
        <TestimoniClient />
      </div>
    </main>
  );
}
