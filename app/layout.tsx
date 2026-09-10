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
    default: "Optik I See You — Rekomendasi Toko Kacamata Minus & Softlens Purwokerto",
    template: "%s | Optik I See You",
  },
  description:
    "Rekomendasi optik terpercaya di Purwokerto, Purbalingga, Wonosobo & Cilacap. Periksa mata gratis, kacamata minus & silinder, ganti lensa express CNC, frame titanium, softlens original Kemenkes & AR Try-On real-time.",
  keywords: [
    "optik i see you",
    "optik i see you purwokerto",
    "kacamata minus purwokerto",
    "rekomendasi optik purwokerto",
    "biaya ganti lensa kacamata",
    "ganti lensa kacamata",
    "tempat periksa mata purwokerto",
    "toko kacamata terdekat",
    "optik purwokerto",
    "optik purbalingga",
    "optik wonosobo",
    "optik cilacap",
    "kacamata purwokerto",
    "kacamata purbalingga",
    "kacamata wonosobo",
    "kacamata cilacap",
    "softlens purwokerto",
    "kacamata anti radiasi blueray",
    "kacamata photochromic",
    "kacamata silinder",
    "ar try-on kacamata",
    "periksa mata gratis",
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
    title: "Optik I See You — Kacamata, Softlens & AR Try-On Purwokerto",
    description:
      "Periksa mata GRATIS, 100+ frame kacamata, softlens original, dan coba kacamata virtual AR di wajahmu. Tersedia di Purwokerto, Purbalingga, Wonosobo & Cilacap.",
    url: "https://optikiseeyou.com",
    siteName: "Optik I See You",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1280,
        height: 853,
        alt: "Optik I See You — Kacamata & Softlens Terbaik di Purwokerto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optik I See You — Kacamata, Softlens & AR Try-On Purwokerto",
    description:
      "Periksa mata GRATIS, 100+ frame kacamata estetik, softlens original & coba virtual AR. 4 Cabang: Purwokerto, Purbalingga, Wonosobo, Cilacap.",
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
                      name: "Quiz Frame & Skrining Mata",
                      description: "Tes IQ kesehatan mata, uji minus silinder, dan analisis frame kacamata",
                      url: "https://optikiseeyou.com/quiz",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 6,
                      name: "4 Cabang Resmi",
                      description: "Cabang Purwokerto, Purbalingga, Wonosobo, dan Cilacap",
                      url: "https://optikiseeyou.com/cabang",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 7,
                      name: "Blog & Edukasi Kacamata",
                      description: "Tips memilih frame kacamata, cara merawat softlens, biaya ganti lensa & kesehatan mata",
                      url: "https://optikiseeyou.com/blog",
                    },
                  ],
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://optikiseeyou.com/#faq",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "Di mana saja lokasi cabang Optik I See You?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Optik I See You memiliki 4 cabang resmi di Jawa Tengah: Purwokerto (Jl. Sunan Ampel No.5, Sumbang), Purbalingga (Jl. Onje No.1), Wonosobo (Jl. Jenderal Soedirman), dan Cilacap (Jl. Rinjani Depan Perum GRP No.2).",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Apakah periksa mata di Optik I See You gratis?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Ya, periksa mata komputerisasi menggunakan Autorefractor digital dan konsultasi resep kacamata bersama tim refraksionis berpengalaman 100% GRATIS di seluruh 4 cabang.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Berapa biaya ganti lensa kacamata di Optik I See You? Apakah bisa bawa frame sendiri?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Biaya ganti lensa kacamata mulai dari Rp100.000-an tergantung jenis lensa (Anti Radiasi Blueray, Photochromic bunglon, Bluechromic, atau Progresif). Dan ya, Anda bisa membawa frame sendiri dari rumah!",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Apakah melayani kacamata minus tinggi dan silinder?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Ya, kami melayani kacamata resep minus tinggi hingga -10.00 dan silinder (astigmatisme) dengan pilihan lensa index tipis (1.61, 1.67, 1.74) serta proses faset express CNC presisi tinggi yang bisa ditunggu.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Bagaimana cara mencoba kacamata secara online?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Anda dapat mencoba puluhan model kacamata secara langsung di wajah Anda menggunakan fitur AR Try-On real-time di website optikiseeyou.com/try-on melalui kamera HP atau laptop tanpa perlu download aplikasi.",
                      },
                    },
                  ],
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
