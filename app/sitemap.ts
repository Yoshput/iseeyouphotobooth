import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * app/sitemap.ts — Sitemap generator for Optik I See You
 * Official Domain: https://optikiseeyou.com
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://optikiseeyou.com";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/try-on`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/start`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/photobooth`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/softlens`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/download`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
