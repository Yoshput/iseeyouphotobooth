import type { MetadataRoute } from "next";
import { BRANCHES } from "@/lib/branches";
import { BLOG_POSTS } from "@/lib/blog";

export const dynamic = "force-static";

/**
 * app/sitemap.ts — Sitemap generator for Optik I See You
 * Official Domain: https://optikiseeyou.com
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://optikiseeyou.com";
  const lastModified = new Date();

  // Core main pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/try-on`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/photobooth`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/softlens`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/testimoni`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cabang`,
      lastModified: new Date("2026-09-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];


  // 4 Branch dedicated pages
  const branchRoutes: MetadataRoute.Sitemap = BRANCHES.map((b) => ({
    url: `${baseUrl}/cabang/${b.id}`,
    lastModified: new Date("2026-09-09"),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  // Blog post pages
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...branchRoutes, ...blogRoutes];
}
