import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coba AR Try-On Kacamata Online — Virtual Mirror Real-Time | Optik I See You",
  description: "Coba kacamata online secara virtual di wajahmu secara real-time dengan teknologi AI & AR Try-On Optik I See You. Pilih frame kacamata pria & wanita yang paling pas sebelum beli.",
  keywords: [
    "try on kacamata online",
    "virtual try on kacamata",
    "coba kacamata online",
    "ar try on kacamata",
    "kacamata virtual mirror",
    "coba frame kacamata di wajah",
    "optik i see you try on",
    "rekomendasi kacamata online",
  ],
  openGraph: {
    title: "Coba AR Try-On Kacamata Online — Virtual Mirror | Optik I See You",
    description: "Coba puluhan koleksi kacamata langsung di wajahmu dengan kamera HP atau webcam secara real-time.",
    url: "https://optikiseeyou.com/try-on",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "AR Try-On Kacamata Optik I See You" }],
  },
  alternates: { canonical: "https://optikiseeyou.com/try-on" },
};

export default function TryOnLayout({ children }: { children: React.ReactNode }) {
  const tryOnSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://optikiseeyou.com/try-on#app",
        name: "AR Try-On Kacamata Virtual Mirror — Optik I See You",
        url: "https://optikiseeyou.com/try-on",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        browserRequirements: "Requires WebRTC and Camera access",
        description: "Aplikasi coba kacamata online virtual try-on real-time berbasis AI face tracking untuk fitting frame kacamata secara akurat.",
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
        "@id": "https://optikiseeyou.com/try-on#breadcrumb",
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
            name: "AR Try-On Kacamata",
            item: "https://optikiseeyou.com/try-on",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tryOnSchema) }}
      />
      {children}
    </>
  );
}
