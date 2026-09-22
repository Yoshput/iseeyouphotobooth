import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Photobooth Interaktif & Cetak Foto Instan — Optik I See You",
  description: "Studio photobooth interaktif Optik I See You. Jepret foto estetik gratis dengan aneka frame unik, filter warna retro & film, serta unduh instan ke HP via scan QR code.",
  keywords: [
    "photobooth purwokerto",
    "photobooth kacamata",
    "studio photobooth gratis",
    "cetak foto photobooth",
    "photobooth event banyumas",
    "frame photobooth estetik",
    "optik i see you photobooth",
  ],
  openGraph: {
    title: "Studio Photobooth Interaktif & Cetak Foto Instan | Optik I See You",
    description: "Foto seru di photobooth Optik I See You dengan frame estetik dan scan QR langsung simpan ke galeri smartphone.",
    url: "https://optikiseeyou.com/photobooth",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Photobooth Optik I See You" }],
  },
  alternates: { canonical: "https://optikiseeyou.com/photobooth" },
};

export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  const photoboothSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://optikiseeyou.com/photobooth#app",
        name: "Studio Photobooth Interaktif Optik I See You",
        url: "https://optikiseeyou.com/photobooth",
        applicationCategory: "PhotographyApplication",
        operatingSystem: "All",
        browserRequirements: "Requires WebRTC and Camera access",
        description: "Studio photobooth interaktif dengan filter visual estetik, multi-slot frame layouts, dan QR Code generator instan.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          reviewCount: "7580",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://optikiseeyou.com/photobooth#breadcrumb",
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
            name: "Photobooth",
            item: "https://optikiseeyou.com/photobooth",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photoboothSchema) }}
      />
      {children}
    </>
  );
}
