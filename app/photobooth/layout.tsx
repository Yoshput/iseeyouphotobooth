import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AR Photobooth Kacamata | Optik I See You',
  description: 'Coba fitur AR Photobooth unik dari Optik I See You! Foto bersama frame kacamata favoritmu dengan berbagai template seru. Gratis, langsung di browser.',
  openGraph: {
    title: 'AR Photobooth Kacamata | Optik I See You',
    description: 'Foto seru dengan frame kacamata AR langsung dari browser!',
    url: 'https://optikiseeyou.com/photobooth',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AR Photobooth Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/photobooth' },
};

export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
