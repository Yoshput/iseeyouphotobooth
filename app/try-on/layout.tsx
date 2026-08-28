import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try-On Kacamata AR — Coba Kacamata Online Real-Time | Optik I See You",
  description:
    "Coba berbagai koleksi frame kacamata secara langsung di wajahmu dengan teknologi Augmented Reality (AR) real-time di Optik I See You.",
  alternates: {
    canonical: "https://optikiseeyou.com/try-on",
  },
  openGraph: {
    title: "Try-On Kacamata AR | Optik I See You",
    description:
      "Coba kacamata trendi secara virtual langsung di wajahmu tanpa install aplikasi apapun.",
    url: "https://optikiseeyou.com/try-on",
    images: [
      {
        url: "/catalog-glasses.jpg",
        width: 1200,
        height: 630,
        alt: "Try On Kacamata AR Optik I See You",
      },
    ],
  },
};

export default function TryOnLayout({
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
        name: "Virtual Try-On AR",
        item: "https://optikiseeyou.com/try-on",
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
