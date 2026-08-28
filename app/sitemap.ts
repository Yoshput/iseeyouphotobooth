import type { MetadataRoute } from "next";
import { BRANCHES } from "@/lib/branches";

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
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 4 Branch dedicated pages
  const branchRoutes: MetadataRoute.Sitemap = BRANCHES.map((b) => ({
    url: `${baseUrl}/cabang/${b.id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...branchRoutes];
}
