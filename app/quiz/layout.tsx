import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz: Temukan Frame Kacamata Sesuai Kepribadianmu | Optik I See You',
  description: 'Ikuti quiz singkat 4 pertanyaan dan temukan frame kacamata yang paling cocok untuk gaya hidupmu. Gratis, interaktif, dan langsung coba via AR Try-On!',
  keywords: ['quiz frame kacamata', 'frame kacamata cocok wajah', 'rekomendasi kacamata', 'pilih kacamata berdasarkan kepribadian', 'optik i see you quiz'],
  openGraph: {
    title: 'Quiz Frame Kacamata — Temukan Style-mu | Optik I See You',
    description: 'Quiz cepat 4 pertanyaan untuk temukan frame kacamata terbaik sesuai kepribadian dan gaya hidupmu.',
    url: 'https://optikiseeyou.com/quiz',
    siteName: 'Optik I See You',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Quiz Frame Kacamata Optik I See You' }],
    locale: 'id_ID',
    type: 'website',
  },
  alternates: { canonical: 'https://optikiseeyou.com/quiz' },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
