import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Softlens Terlengkap | Optik I See You',
  description: 'Beli softlens original dengan warna terlengkap. Hadir brand Dreamcon, Kitty Kawaii, X2, Geo, dan banyak lagi. Pengiriman cepat & konsultasi gratis di 4 cabang.',
  keywords: ['softlens purwokerto', 'beli softlens original', 'softlens murah purwokerto', 'optik i see you softlens', 'katalog softlens'],
  openGraph: {
    title: 'Katalog Softlens | Optik I See You',
    description: 'Temukan softlens warna favoritmu dari brand-brand terpercaya.',
    url: 'https://optikiseeyou.com/softlens',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Softlens Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/softlens' },
};

export default function SoftlensLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
