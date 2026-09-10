import type { Metadata } from 'next';
import { SOFTLENS_PRODUCTS, SOFTLENS_FAQ } from '@/lib/softlens';

export const metadata: Metadata = {
  title: 'Katalog Softlens Murah & Original Kemenkes — Normal & Minus | Optik I See You',
  description: 'Pusat softlens minus & normal original berizin Kemenkes RI: X2, Kitty Kawaii, Dreamcon, Geo. Kadar air tinggi, nyaman, steril. Panduan cara merawat softlens & cek stok di Purwokerto, Cilacap, Purbalingga, Wonosobo!',
  keywords: [
    'softlens purwokerto',
    'softlens minus purwokerto',
    'cara merawat softlens',
    'cara pakai softlens',
    'softlens cilacap',
    'softlens wonosobo',
    'softlens purbalingga',
    'beli softlens original',
    'softlens kadar air tinggi',
    'softlens kemenkes',
    'toko softlens terdekat',
    'cairan pembersih softlens',
    'optik i see you softlens',
  ],
  openGraph: {
    title: 'Katalog Softlens Murah & Original Kemenkes — Normal & Minus | Optik I See You',
    description: 'Softlens original bersertifikasi Kemenkes RI dengan kadar air tinggi & kenyamanan maksimal. Tersedia normal & minus di 4 cabang resmi.',
    url: 'https://optikiseeyou.com/softlens',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Softlens Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/softlens' },
};

export default function SoftlensLayout({ children }: { children: React.ReactNode }) {
  const softlensSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": "https://optikiseeyou.com/softlens#products",
        name: "Koleksi Softlens Original Berizin Kemenkes RI",
        description: "Pilihan softlens natural dan aesthetic kadar air tinggi dari brand terpercaya di Optik I See You.",
        itemListElement: SOFTLENS_PRODUCTS.slice(0, 25).map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.description,
            image: p.image.startsWith("http") ? p.image : `https://optikiseeyou.com${p.image}`,
            category: "Contact Lenses",
            brand: {
              "@type": "Brand",
              name: p.category,
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "IDR",
              price: String(p.price) || "85000",
              availability: "https://schema.org/InStock",
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": "https://optikiseeyou.com/softlens#faq",
        mainEntity: SOFTLENS_FAQ.map((faq) => ({
          "@type": "Question",
          name: faq.title,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.desc,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://optikiseeyou.com/softlens#breadcrumb",
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
            name: "Katalog Softlens",
            item: "https://optikiseeyou.com/softlens",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softlensSchema) }}
      />
      {children}
    </>
  );
}
