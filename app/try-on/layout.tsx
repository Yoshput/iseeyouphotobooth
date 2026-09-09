import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coba Kacamata Virtual AR Try-On — Tanpa Install App | Optik I See You',
  description: 'Coba ratusan frame kacamata langsung di wajahmu secara real-time! Teknologi AR face tracking — gratis, tanpa download aplikasi. Tersedia di optikiseeyou.com.',
  keywords: ['coba kacamata virtual', 'AR try on kacamata', 'virtual try on kacamata online', 'kacamata AR purwokerto'],
  openGraph: {
    title: 'Coba Kacamata Virtual AR Try-On | Optik I See You',
    description: 'Coba frame kacamata langsung di wajahmu dengan AR real-time. Gratis, tanpa install app!',
    url: 'https://optikiseeyou.com/try-on',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AR Try On Kacamata Optik I See You' }],
  },
  alternates: { canonical: 'https://optikiseeyou.com/try-on' },
};

export default function TryOnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
