import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AR Photobooth Kacamata Online — Foto Strip & Cetak Instan | Optik I See You',
  description: 'Photobooth online aesthetic dengan kacamata AR real-time! Ambil foto strip 3 pose, buat animasi GIF, dan cetak instan di booth Optik I See You. Gratis via browser!',
  keywords: ['photobooth purwokerto', 'ar photobooth kacamata', 'photobooth online gratis', 'photobooth strip aesthetic', 'photobooth cetak instan purwokerto'],
  openGraph: {
    title: 'AR Photobooth Kacamata Online — Foto Strip & Cetak Instan | Optik I See You',
    description: 'Foto seru dengan kacamata AR & template aesthetic langsung dari browser. Dapatkan foto strip & GIF gratis!',
    url: 'https://optikiseeyou.com/photobooth',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AR Photobooth Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/photobooth' },
};

export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
