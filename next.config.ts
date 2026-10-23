import type { NextConfig } from "next";

/**
 * next.config.ts — ISY AR Photobooth
 *
 * output: 'export'  →  full static HTML/JS/CSS, zero Node.js server at runtime.
 */
const cspHeader = `
  default-src 'self' https://optikiseeyou.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://cdn.jsdelivr.net
    https://www.googletagmanager.com
    https://*.googletagmanager.com
    https://tagmanager.google.com
    https://ssl.google-analytics.com
    https://www.google-analytics.com
    https://*.google-analytics.com
    https://www.googleadservices.com
    https://*.googleadservices.com
    https://googleads.g.doubleclick.net
    https://*.doubleclick.net
    https://pagead2.googlesyndication.com
    https://*.googlesyndication.com
    https://www.google.com
    https://*.google.com
    https://www.google.co.id
    https://*.google.co.id;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com https://www.googletagmanager.com;
  img-src 'self' data: blob: https: https://*.r2.dev https://*.cloudflarestorage.com https://res.cloudinary.com
    https://www.googletagmanager.com
    https://*.googletagmanager.com
    https://www.google-analytics.com
    https://*.google-analytics.com
    https://www.google.com
    https://*.google.com
    https://www.google.co.id
    https://*.google.co.id
    https://googleads.g.doubleclick.net
    https://ad.doubleclick.net
    https://*.doubleclick.net
    https://stats.g.doubleclick.net
    https://pagead2.googlesyndication.com
    https://*.googlesyndication.com
    https://www.googleadservices.com
    https://*.googleadservices.com;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' https://*.r2.dev https://*.cloudflarestorage.com https://res.cloudinary.com https://cdn.jsdelivr.net https://*.peerjs.com wss://*.peerjs.com https://fonts.googleapis.com https://fonts.gstatic.com https://storage.googleapis.com data: blob:
    https://www.google-analytics.com
    https://*.google-analytics.com
    https://analytics.google.com
    https://region1.google-analytics.com
    https://stats.g.doubleclick.net
    https://www.googletagmanager.com
    https://*.googletagmanager.com
    https://tagmanager.google.com
    https://www.googleadservices.com
    https://*.googleadservices.com
    https://googleads.g.doubleclick.net
    https://ad.doubleclick.net
    https://*.doubleclick.net
    https://pagead2.googlesyndication.com
    https://*.googlesyndication.com
    https://www.google.com
    https://*.google.com
    https://www.google.co.id
    https://*.google.co.id;
  media-src 'self' blob: data: https://*.r2.dev https://*.cloudflarestorage.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://api.whatsapp.com https://wa.me;
  frame-src 'self' https://www.google.com https://maps.google.com
    https://*.google.com
    https://www.googletagmanager.com
    https://*.googletagmanager.com
    https://td.doubleclick.net
    https://bid.g.doubleclick.net
    https://*.doubleclick.net;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-07b182ccb29d4da0be42051ce2b54afa.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

