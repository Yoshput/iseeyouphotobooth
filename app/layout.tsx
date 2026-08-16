import type { Metadata, Viewport } from "next";
import CustomCursor from "@/components/ui/CustomCursor";
import PWARegister from "@/components/ui/PWARegister";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import PWASplashScreen from "@/components/pwa/PWASplashScreen";
import "./globals.css";

/**
 * layout.tsx — Root layout
 *
 * Fonts are loaded via Google Fonts CSS @import (in globals.css) instead of
 * next/font/google. This is because next/font/google internally uses a custom
 * HTTP server at runtime for font serving — incompatible with `output: 'export'`.
 *
 * The CSS import approach works identically from the user's perspective:
 * fonts are still served from Google CDN (or your own CDN if you self-host).
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://optikiseeyou.com"),
  title: {
    default: "Optik I See You — AR Try-On Kacamata, Photobooth & Softlens",
    template: "%s | Optik I See You",
  },
  description:
    "Coba kacamata online dengan AR real-time, photobooth seru, dan katalog softlens lengkap di Optik I See You Purwokerto. Tersedia 4 cabang: Purwokerto, Wonosobo, Cilacap, & Purbalingga.",
  keywords: [
    "optik purwokerto",
    "kacamata purwokerto",
    "ar try-on kacamata",
    "photobooth purwokerto",
    "softlens purwokerto",
    "optik i see you",
    "periksa mata purwokerto",
    "katalog frame kacamata",
  ],
  alternates: {
    canonical: "https://optikiseeyou.com",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "I See You",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Optik I See You — AR Try-On Kacamata & Katalog Softlens",
    description:
      "Coba langsung koleksi kacamata & softlens I See You di wajah kamu secara real-time. Layanan optik modern & photobooth seru di Purwokerto.",
    url: "https://optikiseeyou.com",
    siteName: "Optik I See You",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1280,
        height: 853,
        alt: "Optik I See You — AR Try-On & Photobooth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optik I See You — AR Try-On Kacamata & Katalog Softlens",
    description:
      "Coba langsung kacamata & softlens di wajahmu dengan teknologi AR real-time. Kunjungi Optik I See You Purwokerto.",
    images: ["/hero-bg.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EC" },
    { media: "(prefers-color-scheme: dark)",  color: "#116B3C" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Google Fonts via standard CSS link — works in static export */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />

        {/* Google Search & PWA Standard Favicons (48x48, 192x192, 512x512, ICO) */}
        <link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon-512.png" sizes="512x512" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* iOS PWA splash color */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="I See You" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* MS Tile (Windows / Edge) */}
        <meta name="msapplication-TileColor" content="#FAF6EC" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
      </head>
      <body className="overscroll-none bg-isy-ivory font-sans antialiased">
        {/* Luxury Brand Opening Splash Screen */}
        <PWASplashScreen />

        <CustomCursor />
        {children}

        {/* PWA: Register Service Worker */}
        <PWARegister />

        {/* PWA: Install Prompt Banner */}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
