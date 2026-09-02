import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AR Try On Kacamata Virtual | Optik I See You',
  description: 'Coba kacamata secara virtual dengan teknologi AR face tracking langsung di browser. Tidak perlu download app! Temukan frame yang cocok untuk wajahmu.',
  keywords: ['try on kacamata virtual', 'AR kacamata', 'virtual try on glasses', 'coba kacamata online'],
  openGraph: {
    title: 'AR Try On Kacamata | Optik I See You',
    description: 'Coba kacamata secara virtual dengan teknologi AR terkini!',
    url: 'https://optikiseeyou.com/try-on',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AR Try On Kacamata Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/try-on' },
  robots: { index: false }, // Halaman ini berat JS, tidak ideal untuk SEO crawl
};

export default function TryOnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
