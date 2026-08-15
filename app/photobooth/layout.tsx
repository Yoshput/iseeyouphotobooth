import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AR Photobooth Online — Foto Kacamata & Cetak Strip",
  description:
    "AR Photobooth seru dari Optik I See You Purwokerto! Foto dengan frame kacamata AR, filter aesthetic, animasi GIF, dan cetak foto strip instan.",
  alternates: {
    canonical: "https://optikiseeyou.com/photobooth",
  },
  openGraph: {
    title: "AR Photobooth Online | Optik I See You",
    description:
      "Foto bareng teman dengan kacamata AR favoritmu, pilih layout strip aesthetic, dan download langsung ke smartphone.",
    url: "https://optikiseeyou.com/photobooth",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1280,
        height: 853,
        alt: "AR Photobooth Optik I See You",
      },
    ],
  },
};

export default function PhotoboothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
