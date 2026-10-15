import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Kacamata Minus dan Lensa — Frame Pria dan Wanita | Optik I See You',
  description: 'Temukan 100+ model frame kacamata terbaru: titanium ultra ringan, cat-eye wanita, acetate pria, Korean style. Ganti lensa express CNC, periksa mata gratis di 4 cabang Purwokerto, Purbalingga, Wonosobo, Cilacap.',
  keywords: [
    'katalog kacamata',
    'kacamata minus purwokerto',
    'frame kacamata wanita',
    'frame kacamata pria',
    'biaya ganti lensa kacamata',
    'ganti lensa kacamata',
    'kacamata titanium',
    'kacamata cat eye',
    'rekomendasi optik purwokerto',
    'toko kacamata terdekat',
    'kacamata anti radiasi',
    'kacamata minus murah',
    'optik i see you katalog',
  ],
  openGraph: {
    title: 'Katalog Kacamata Minus dan Lensa | Optik I See You',
    description: '100+ model frame kacamata estetik, titanium, cat-eye dan softlens original. Coba virtual AR di wajahmu atau periksa mata gratis di 4 cabang!',
    url: 'https://optikiseeyou.com/katalog',
    siteName: 'Optik I See You',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Frame Kacamata Optik I See You' }],
    locale: 'id_ID',
    type: 'website',
  },
  alternates: { canonical: 'https://optikiseeyou.com/katalog' },
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://optikiseeyou.com/katalog#breadcrumb",
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
        name: "Katalog Kacamata",
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
