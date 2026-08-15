import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try On Kacamata AR — Coba Kacamata Online",
  description:
    "Pilih mode AR Try-On Kacamata atau AR Photobooth interaktif langsung dari kamera ponsel atau laptopmu di Optik I See You Purwokerto.",
  alternates: {
    canonical: "https://optikiseeyou.com/start",
  },
  openGraph: {
    title: "Try On Kacamata AR | Optik I See You",
    description:
      "Coba berbagai model kacamata trendi secara langsung di wajahmu dengan teknologi Augmented Reality real-time.",
    url: "https://optikiseeyou.com/start",
    images: [
      {
        url: "/catalog-glasses.jpg",
        width: 1200,
        height: 630,
        alt: "Try On Kacamata AR Optik I See You",
      },
    ],
  },
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
