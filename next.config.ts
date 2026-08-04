import type { NextConfig } from "next";

/**
 * next.config.ts — ISY AR Photobooth
 *
 * output: 'export'  →  full static HTML/JS/CSS, zero Node.js server at runtime.
 */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
