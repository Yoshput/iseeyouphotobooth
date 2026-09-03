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
    default: "Optik I See You — Kacamata, Softlens & AR Photobooth Purwokerto",
    template: "%s | Optik I See You",
  },
  description:
    "Pusat kacamata & softlens kekinian di Purwokerto, Purbalingga, Wonosobo, dan Cilacap. Nikmati periksa mata gratis, coba frame via AR Try-On real-time, dan photobooth seru di Optik I See You.",
  keywords: [
    "optik i see you",
    "optik i see you glasses",
    "optik i see you purwokerto",
    "optik i see you purbalingga",
    "optik i see you wonosobo",
    "optik i see you cilacap",
    "optik purwokerto",
    "optik purbalingga",
    "optik wonosobo",
    "optik cilacap",
    "kacamata purwokerto",
    "kacamata purbalingga",
    "kacamata wonosobo",
    "kacamata cilacap",
    "ar try-on kacamata",
    "photobooth purwokerto",
    "softlens purwokerto",
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
      "Coba langsung koleksi kacamata & softlens I See You di wajah kamu secara real-time. Layanan optik modern & photobooth seru di Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
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
      "Coba langsung kacamata & softlens di wajahmu dengan teknologi AR real-time. Kunjungi Optik I See You Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
    images: ["/hero-bg.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        />
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

        {/* Schema.org Structured Data (Multi-Branch Organization / WebSite / Sitelinks / FAQ) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "Optician", "LocalBusiness"],
                  "@id": "https://optikiseeyou.com/#organization",
                  name: "Optik I See You",
                  legalName: "Optik I See You Glasses",
                  alternateName: [
                    "I See You Glasses",
                    "Optik I See You Purwokerto",
                    "Optik I See You Purbalingga",
                    "Optik I See You Wonosobo",
                    "Optik I See You Cilacap",
                    "optikiseeyou",
                  ],
                  url: "https://optikiseeyou.com",
                  logo: "https://optikiseeyou.com/logo.png",
                  image: "https://optikiseeyou.com/hero-bg.jpg",
                  description:
                    "Optik modern terpercaya dengan layanan periksa mata komputerisasi, teknologi AR Try-On kacamata real-time, photobooth cetak instan, dan katalog softlens lengkap di Purwokerto, Wonosobo, Cilacap, dan Purbalingga.",
                  telephone: "+62895-4156-14261",
                  priceRange: "$$",
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "5.0",
                    reviewCount: "7581",
                    bestRating: "5",
                    worstRating: "1",
                  },
                  foundingDate: "2019",
                  sameAs: [
                    "https://www.instagram.com/iseeyou.glasses",
                    "https://www.instagram.com/iseeyou.wonosobo",
                    "https://www.instagram.com/iseeyou.cilacap",
                    "https://www.instagram.com/iseeyou.purbalingga",
                    "https://www.tiktok.com/@iseeyouglasses",
                    "https://shopee.co.id/iseeyou.id",
                  ],
                  contactPoint: [
                    {
                      "@type": "ContactPoint",
                      telephone: "+62895-4156-14261",
                      contactType: "customer service",
                      areaServed: "ID",
                      availableLanguage: "Indonesian",
                    },
                  ],
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang",
                    addressLocality: "Purwokerto, Banyumas",
                    addressRegion: "Jawa Tengah",
                    postalCode: "53124",
                    addressCountry: "ID",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://optikiseeyou.com/#website",
                  url: "https://optikiseeyou.com",
                  name: "Optik I See You",
                  alternateName: ["I See You Glasses", "optikiseeyou"],
                  publisher: {
                    "@id": "https://optikiseeyou.com/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://optikiseeyou.com/katalog?search={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "ItemList",
                  "@id": "https://optikiseeyou.com/#sitelinks",
                  name: "Navigasi Utama Optik I See You",
                  itemListElement: [
                    {
                      "@type": "SiteNavigationElement",
                      position: 1,
                      name: "Katalog Frame Kacamata",
                      description: "Koleksi frame kacamata premium & pilihan bentuk wajah",
                      url: "https://optikiseeyou.com/katalog",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 2,
                      name: "Katalog Softlens Lengkap",
                      description: "Katalog softlens original kadar air tinggi & aksesoris",
                      url: "https://optikiseeyou.com/softlens",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 3,
                      name: "Coba AR Try-On Kacamata",
                      description: "Coba kacamata langsung secara virtual di wajahmu",
                      url: "https://optikiseeyou.com/try-on",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 4,
                      name: "AR Photobooth & Cetak",
                      description: "Photobooth kacamata seru dengan animasi GIF dan cetak instan",
                      url: "https://optikiseeyou.com/photobooth",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 5,
                      name: "4 Cabang Resmi",
                      description: "Cabang Purwokerto, Purbalingga, Wonosobo, dan Cilacap",
                      url: "https://optikiseeyou.com/#lokasi",
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="overscroll-none bg-isy-ivory font-sans antialiased pb-16 md:pb-0">
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
