import type { MetadataRoute } from "next";
import { BRANCHES } from "@/lib/branches";
import { BLOG_POSTS } from "@/lib/blog";
import { getBlogPosts } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

/**
 * app/sitemap.ts — Dynamic Sitemap for Optik I See You
 * Official Domain: https://optikiseeyou.com
 *
 * Mencakup SEMUA halaman publik yang dapat diindeks:
 *  - Halaman utama & produk
 *  - Semua detail cabang (4 kota)
 *  - Semua artikel blog (termasuk yang dipublikasikan via CMS)
 *  - Halaman informasi & legal
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://optikiseeyou.com";
  const now = new Date();

  // ── 1. Core / Pilar Pages ────────────────────────────────────────────
  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/softlens`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/try-on`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cabang`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/photobooth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testimoni`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/home-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/sponsor`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── 2. Branch Detail Pages (4 Cabang Resmi) ──────────────────────────
  const branchPages: MetadataRoute.Sitemap = BRANCHES.map((branch) => ({
    url: `${baseUrl}/cabang/${branch.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // ── 3. Blog Article Pages ────────────────────────────────────────────
  let publishedPosts = BLOG_POSTS;
  try {
    const livePosts = await getBlogPosts({ onlyPublished: true });
    if (livePosts && livePosts.length > 0) {
      publishedPosts = livePosts as unknown as typeof BLOG_POSTS;
    }
  } catch {}

  const blogPages: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt || now),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...corePages, ...branchPages, ...blogPages];
}
