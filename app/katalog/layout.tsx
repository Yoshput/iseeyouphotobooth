import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katalog Frame Kacamata & Lensa — Kacamata Minus Pria & Wanita | Optik I See You',
  description: 'Temukan 100+ model frame kacamata minus & silinder terbaru: Titanium ultra ringan, Cat-Eye wanita, Acetate pria, Korean style. Biaya ganti lensa murah & periksa mata gratis di 4 cabang Purwokerto, Purbalingga, Wonosobo, Cilacap.',
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
    title: 'Katalog Frame Kacamata & Lensa — Kacamata Minus Pria & Wanita | Optik I See You',
    description: '100+ model frame kacamata estetik, titanium, cat-eye & softlens original. Coba virtual AR di wajahmu atau periksa mata gratis di 4 cabang!',
    url: 'https://optikiseeyou.com/katalog',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Katalog Frame Kacamata Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/katalog' },
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
