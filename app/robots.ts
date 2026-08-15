import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * app/robots.ts — robots.txt generator for Optik I See You
 * Official Domain: https://optikiseeyou.com
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
    ],
    sitemap: "https://optikiseeyou.com/sitemap.xml",
    host: "https://optikiseeyou.com",
  };
}
