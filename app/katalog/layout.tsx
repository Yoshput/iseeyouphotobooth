import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Frame Kacamata & Softlens | Optik I See You',
  description: 'Jelajahi 60+ koleksi frame kacamata premium (Cat Eye, Titanium, dll) dan softlens natural berkualitas. Tersedia di 4 cabang Purwokerto, Purbalingga, Wonosobo, Cilacap.',
  keywords: ['katalog kacamata', 'katalog softlens', 'frame kacamata purwokerto', 'kacamata premium', 'softlens purwokerto', 'optik i see you katalog'],
  openGraph: {
    title: 'Katalog Frame Kacamata & Softlens | Optik I See You',
    description: 'Temukan frame kacamata impianmu dan koleksi softlens premium.',
    url: 'https://optikiseeyou.com/katalog',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Kacamata & Softlens Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/katalog' },
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
