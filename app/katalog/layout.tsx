import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Frame Kacamata — Koleksi Mewah & Elegan",
  description:
    "Jelajahi koleksi frame kacamata premium Optik I See You: Quiet Luxury, Cat Eye, Metro Geek, Shades Edition, dan Titanium Series di Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
  alternates: {
    canonical: "https://optikiseeyou.com/katalog",
  },
  openGraph: {
    title: "Katalog Frame Kacamata | Optik I See You",
    description:
      "Temukan frame kacamata yang cocok dengan bentuk wajahmu. Cek spesifikasi lengkap dan pesan mudah via WhatsApp CS.",
    url: "https://optikiseeyou.com/katalog",
    images: [
      {
        url: "/catalog-glasses.jpg",
        width: 1200,
        height: 630,
        alt: "Katalog Frame Kacamata Optik I See You",
      },
    ],
  },
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        name: "Katalog Frame",
        item: "https://optikiseeyou.com/katalog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
