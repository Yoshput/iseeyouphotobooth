import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Foto Photobooth — Optik I See You",
  description:
    "Download hasil foto strip dan animasi GIF AR Photobooth Optik I See You langsung ke galeri ponselmu. Simpan momen seru dan bagikan ke Instagram.",
  alternates: {
    canonical: "https://optikiseeyou.com/download",
  },
  openGraph: {
    title: "Download Foto Photobooth | Optik I See You",
    description:
      "Simpan dan bagikan foto strip AR Photobooth kamu dari Optik I See You Purwokerto.",
    url: "https://optikiseeyou.com/download",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Download Foto Photobooth Optik I See You",
      },
    ],
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
