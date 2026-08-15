import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Softlens & Cairan Pembersih — Optik I See You",
  description:
    "Katalog softlens warna natural & glam, minus plano hingga -10.00, silinder, serta cairan pembersih ICE, X2, & Pure N'Soft resmi di Purwokerto.",
  alternates: {
    canonical: "https://optikiseeyou.com/softlens",
  },
  openGraph: {
    title: "Katalog Softlens & Aksesoris | Optik I See You",
    description:
      "Koleksi softlens nyaman kadar air tinggi dan aksesoris perawatan mata higienis. Order langsung ke WhatsApp CS Optik I See You.",
    url: "https://optikiseeyou.com/softlens",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Katalog Softlens Optik I See You",
      },
    ],
  },
};

export default function SoftlensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
