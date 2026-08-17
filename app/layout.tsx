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
    "optik i see you",
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

        {/* Schema.org Structured Data (Multi-Branch LocalBusiness / Optician / WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Optician",
                  "@id": "https://optikiseeyou.com/#organization",
                  name: "Optik I See You",
                  alternateName: [
                    "I See You Glasses",
                    "Optik I See You Purwokerto",
                    "Optik I See You Purbalingga",
                    "Optik I See You Wonosobo",
                    "Optik I See You Cilacap",
                    "optikiseeyou",
                  ],
                  url: "https://www.optikiseeyou.com",
                  logo: "https://www.optikiseeyou.com/icon-512.png",
                  image: "https://www.optikiseeyou.com/hero-bg.jpg",
                  description:
                    "Optik modern terpercaya dengan layanan periksa mata, teknologi AR Try-On kacamata real-time, photobooth cetak instan, dan katalog softlens lengkap di Purwokerto, Wonosobo, Cilacap, dan Purbalingga.",
                  telephone: "+62895415614261",
                  priceRange: "$$",
                  sameAs: [
                    "https://www.instagram.com/iseeyou.glasses",
                    "https://www.tiktok.com/@iseeyouglasses",
                  ],
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang",
                    addressLocality: "Purwokerto, Banyumas",
                    addressRegion: "Jawa Tengah",
                    postalCode: "53124",
                    addressCountry: "ID",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: -7.392899,
                    longitude: 109.249667,
                  },
                  department: [
                    {
                      "@type": "Optician",
                      name: "Optik I See You — Cabang Purwokerto",
                      telephone: "+62895415614261",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang, Kec. Sumbang",
                        addressLocality: "Purwokerto, Banyumas",
                        addressRegion: "Jawa Tengah",
                        postalCode: "53124",
                        addressCountry: "ID",
                      },
                      geo: {
                        "@type": "GeoCoordinates",
                        latitude: -7.392899,
                        longitude: 109.249667,
                      },
                    },
                    {
                      "@type": "Optician",
                      name: "Optik I See You — Cabang Purbalingga",
                      telephone: "+6282234862322",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Onje No.1, Purbalingga Lor, Kec. Purbalingga",
                        addressLocality: "Purbalingga",
                        addressRegion: "Jawa Tengah",
                        postalCode: "53311",
                        addressCountry: "ID",
                      },
                      geo: {
                        "@type": "GeoCoordinates",
                        latitude: -7.388426,
                        longitude: 109.364487,
                      },
                    },
                    {
                      "@type": "Optician",
                      name: "Optik I See You — Cabang Wonosobo",
                      telephone: "+628977129039",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Jenderal Soedirman, Sumberan Selatan, Wonosobo Bar., Kec. Wonosobo",
                        addressLocality: "Wonosobo",
                        addressRegion: "Jawa Tengah",
                        postalCode: "56311",
                        addressCountry: "ID",
                      },
                      geo: {
                        "@type": "GeoCoordinates",
                        latitude: -7.364198,
                        longitude: 109.900669,
                      },
                    },
                    {
                      "@type": "Optician",
                      name: "Optik I See You — Cabang Cilacap",
                      telephone: "+6285135930533",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Rinjani Depan Perum GRP No.2 Ruko No.3, Rawagaru, Sidanegara, Kec. Cilacap Tengah",
                        addressLocality: "Cilacap",
                        addressRegion: "Jawa Tengah",
                        postalCode: "53223",
                        addressCountry: "ID",
                      },
                      geo: {
                        "@type": "GeoCoordinates",
                        latitude: -7.702595,
                        longitude: 109.01627,
                      },
                    },
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://optikiseeyou.com/#website",
                  url: "https://www.optikiseeyou.com",
                  name: "Optik I See You",
                  alternateName: ["I See You Glasses", "optikiseeyou"],
                  publisher: {
                    "@id": "https://optikiseeyou.com/#organization",
                  },
                },
              ],
            }),
          }}
        />
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
