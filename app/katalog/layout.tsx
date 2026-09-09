import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Kacamata & Softlens — 100+ Pilihan Frame Terbaru | Optik I See You',
  description: 'Jelajahi 100+ koleksi frame kacamata Cat Eye, Titanium, Quiet Luxury, dan softlens natural terlengkap. Periksa mata GRATIS di 4 cabang Purwokerto, Purbalingga, Wonosobo, Cilacap.',
  keywords: ['katalog kacamata', 'katalog softlens', 'frame kacamata purwokerto', 'kacamata cat eye', 'kacamata titanium', 'softlens purwokerto', 'optik i see you katalog'],
  openGraph: {
    title: 'Katalog Kacamata & Softlens | Optik I See You',
    description: '100+ frame kacamata estetik & softlens original. Coba virtual AR atau kunjungi langsung 4 cabang kami!',
    url: 'https://optikiseeyou.com/katalog',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Kacamata & Softlens Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/katalog' },
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
