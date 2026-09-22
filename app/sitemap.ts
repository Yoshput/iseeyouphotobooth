import type { MetadataRoute } from "next";
import { BRANCHES } from "@/lib/branches";
import { BLOG_POSTS } from "@/lib/blog";

export const dynamic = "force-static";

/**
 * app/sitemap.ts — High-Priority Lean Sitemap for Optik I See You
 * Official Domain: https://optikiseeyou.com
 *
 * Difokuskan khusus pada TOP 5 halaman pilar paling populer & tinggi klik
 * untuk memusatkan crawl budget Googlebot dan mempercepat kemunculan Google Sitelinks.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://optikiseeyou.com";
  const lastModified = new Date();

  return [
    // 1. Beranda Utama (Landing Page Utama Brand)
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    // 2. Katalog Frame Kacamata & Lensa Minus (Produk Paling Banyak Diklik)
    {
      url: `${baseUrl}/katalog`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // 3. Virtual AR Try-On Kacamata Real-time (Fitur Unggulan Interaktif)
    {
      url: `${baseUrl}/try-on`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // 4. Katalog Softlens Resmi Kemenkes RI (Produk Populer Audiens Muda)
    {
      url: `${baseUrl}/softlens`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // 5. 4 Cabang Resmi & Layanan Periksa Mata (Intent Lokal Pelanggan Datang ke Toko)
    {
      url: `${baseUrl}/cabang`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
