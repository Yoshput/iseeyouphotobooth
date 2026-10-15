import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Kacamata dan Tips Kesehatan Mata | Optik I See You',
  description: 'Panduan lengkap perawatan mata, biaya ganti lensa kacamata, cara merawat softlens untuk pemula, trik memilih frame sesuai bentuk wajah, dan rekomendasi kacamata minus dari tim ahli Optik I See You.',
  keywords: [
    'blog kacamata',
    'biaya ganti lensa kacamata',
    'tips memilih frame kacamata',
    'cara merawat softlens',
    'kacamata minus purwokerto',
    'rekomendasi optik purwokerto',
    'perbedaan lensa blueray dan photochromic',
    'cara baca resep kacamata',
    'edukasi kesehatan mata',
  ],
  openGraph: {
    title: 'Blog Kacamata dan Tips Kesehatan Mata | Optik I See You',
    description: 'Tips perawatan mata, cara pilih frame kacamata, tren frame 2026, dan edukasi softlens dari tim ahli Optik I See You.',
    url: 'https://optikiseeyou.com/blog',
    siteName: 'Optik I See You',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1280,
        height: 853,
        alt: 'Blog Optik I See You — Tips Kacamata dan Kesehatan Mata',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  alternates: { canonical: 'https://optikiseeyou.com/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://optikiseeyou.com/blog#breadcrumb",
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
        name: "Blog Kacamata",
        item: "https://optikiseeyou.com/blog",
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
