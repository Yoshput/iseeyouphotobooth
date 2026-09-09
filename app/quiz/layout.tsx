import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz & Skrining Penglihatan Interaktif | Optik I See You',
  description: 'Ikuti kuis edukasi kesehatan mata, tes skrining visual minus & silinder (kipas astigmatisme & duochrome), serta temukan karakter frame kacamata impianmu.',
  keywords: ['quiz optik i see you', 'tes silinder online', 'tes minus mata', 'skrining penglihatan mandiri', 'kuis frame kacamata', 'kuis kesehatan mata'],
  openGraph: {
    title: 'Quiz & Skrining Penglihatan Interaktif | Optik I See You',
    description: 'Asah wawasan dan periksa indikasi penglihatanmu lewat tes visual interaktif serta temukan frame kacamata yang cocok.',
    url: 'https://optikiseeyou.com/quiz',
    siteName: 'Optik I See You',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Quiz & Skrining Penglihatan Optik I See You' }],
    locale: 'id_ID',
    type: 'website',
  },
  alternates: { canonical: 'https://optikiseeyou.com/quiz' },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
