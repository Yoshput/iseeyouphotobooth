import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Frame Kacamata Terlengkap | Optik I See You',
  description: 'Jelajahi 60+ koleksi frame kacamata premium dari brand lokal dan internasional. Cat Eye, Titanium, Quiet Luxury, dan banyak lagi. Tersedia di 4 cabang Purwokerto, Purbalingga, Wonosobo, Cilacap.',
  keywords: ['katalog kacamata', 'frame kacamata purwokerto', 'kacamata premium', 'optik i see you katalog', 'harga kacamata purwokerto'],
  openGraph: {
    title: 'Katalog Frame Kacamata | Optik I See You',
    description: 'Temukan frame kacamata impianmu dari 60+ koleksi premium.',
    url: 'https://optikiseeyou.com/katalog',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Frame Kacamata Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/katalog' },
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
