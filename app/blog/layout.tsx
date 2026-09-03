import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Kesehatan Mata & Gaya Kacamata | Optik I See You',
  description: 'Tips perawatan mata, panduan pilih kacamata, tren frame terbaru, dan edukasi softlens dari Optik I See You — optik terpercaya di Purwokerto, Purbalingga, Wonosobo, Cilacap.',
  openGraph: {
    title: 'Blog Kesehatan Mata & Gaya Kacamata | Optik I See You',
    description: 'Tips perawatan mata, panduan pilih kacamata, tren frame terbaru, dan edukasi softlens dari Optik I See You.',
    url: 'https://optikiseeyou.com/blog',
    siteName: 'Optik I See You',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1280,
        height: 853,
        alt: 'Blog Optik I See You',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
