import type { Metadata, Viewport } from "next";
import CustomCursor from "@/components/ui/CustomCursor";
import PWARegister from "@/components/ui/PWARegister";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import PWASplashScreen from "@/components/pwa/PWASplashScreen";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import TopProgressBar from "@/components/ui/TopProgressBar";
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
    default: "Optik I See You | Rekomendasi Toko Kacamata Minus dan Softlens Purwokerto",
    template: "%s | Optik I See You",
  },
  description:
    "Rekomendasi optik terpercaya di Purwokerto, Purbalingga, Wonosobo dan Cilacap. Periksa mata gratis, kacamata minus dan silinder, ganti lensa express CNC, frame titanium, softlens original Kemenkes dan AR Try-On real-time.",
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
    title: "Optik I See You: Kacamata, Softlens dan AR Try-On Purwokerto",
    description:
      "Periksa mata GRATIS, 100+ frame kacamata, softlens original, dan coba kacamata virtual AR di wajahmu. Tersedia di Purwokerto, Purbalingga, Wonosobo dan Cilacap.",
    url: "https://optikiseeyou.com",
    siteName: "Optik I See You",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1280,
        height: 853,
        alt: "Optik I See You: Kacamata dan Softlens Terbaik di Purwokerto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optik I See You: Kacamata, Softlens dan AR Try-On Purwokerto",
    description:
      "Periksa mata GRATIS, 100+ frame kacamata estetik, softlens original dan coba virtual AR. 4 Cabang: Purwokerto, Purbalingga, Wonosobo, Cilacap.",
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
        {/* Google Fonts via standard CSS link */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&family=Poppins:wght@400;500;600;700;800&display=swap"
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

        {/* Schema.org Structured Data — Organization (all 4 branches), WebSite, SiteNavigation, FAQ */}
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
                  logo: {
                    "@type": "ImageObject",
                    url: "https://optikiseeyou.com/logo.png",
                    width: 400,
                    height: 140,
                  },
                  image: "https://optikiseeyou.com/hero-bg.jpg",
                  description:
                    "Optik modern terpercaya dengan layanan periksa mata komputerisasi, teknologi AR Try-On kacamata real-time, photobooth cetak instan, dan katalog softlens lengkap di Purwokerto, Wonosobo, Cilacap, dan Purbalingga.",
                  telephone: "+62895-4156-14261",
                  priceRange: "$$",
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "5.0",
                    reviewCount: "7626",
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
                  department: [
                    {
                      "@type": ["LocalBusiness", "Optician"],
                      "@id": "https://optikiseeyou.com/cabang/purwokerto#store",
                      name: "Optik I See You Purwokerto",
                      url: "https://optikiseeyou.com/cabang/purwokerto",
                      telephone: "+62895-4156-14261",
                      priceRange: "$$",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang",
                        addressLocality: "Purwokerto",
                        addressRegion: "Jawa Tengah",
                        postalCode: "53124",
                        addressCountry: "ID",
                      },
                      geo: { "@type": "GeoCoordinates", latitude: -7.3929206, longitude: 109.2496106 },
                      openingHours: "Mo-Su 09:00-21:00",
                      image: "https://optikiseeyou.com/lokasi/purwokerto/IMG_1543.webp",
                    },
                    {
                      "@type": ["LocalBusiness", "Optician"],
                      "@id": "https://optikiseeyou.com/cabang/wonosobo#store",
                      name: "Optik I See You Wonosobo",
                      url: "https://optikiseeyou.com/cabang/wonosobo",
                      telephone: "+62897-7129-039",
                      priceRange: "$$",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Jenderal Soedirman, Sumberan Selatan",
                        addressLocality: "Wonosobo",
                        addressRegion: "Jawa Tengah",
                        postalCode: "56311",
                        addressCountry: "ID",
                      },
                      geo: { "@type": "GeoCoordinates", latitude: -7.3641333, longitude: 109.9006525 },
                      openingHours: "Mo-Su 09:00-18:00",
                      image: "https://optikiseeyou.com/lokasi/wonosobo/IMG_4474.webp",
                    },
                    {
                      "@type": ["LocalBusiness", "Optician"],
                      "@id": "https://optikiseeyou.com/cabang/cilacap#store",
                      name: "Optik I See You Cilacap",
                      url: "https://optikiseeyou.com/cabang/cilacap",
                      telephone: "+62851-3593-0533",
                      priceRange: "$$",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Rinjani Depan Perum GRP No.2 Ruko No.3",
                        addressLocality: "Cilacap",
                        addressRegion: "Jawa Tengah",
                        postalCode: "53223",
                        addressCountry: "ID",
                      },
                      geo: { "@type": "GeoCoordinates", latitude: -7.7027438, longitude: 109.015884 },
                      openingHours: "Mo-Su 09:00-21:00",
                      image: "https://optikiseeyou.com/lokasi/cilacap/IMG_6716.webp",
                    },
                    {
                      "@type": ["LocalBusiness", "Optician"],
                      "@id": "https://optikiseeyou.com/cabang/purbalingga#store",
                      name: "Optik I See You Purbalingga",
                      url: "https://optikiseeyou.com/cabang/purbalingga",
                      telephone: "+62822-3486-2322",
                      priceRange: "$$",
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: "Jl. Onje No.1, Purbalingga Lor",
                        addressLocality: "Purbalingga",
                        addressRegion: "Jawa Tengah",
                        postalCode: "53311",
                        addressCountry: "ID",
                      },
                      geo: { "@type": "GeoCoordinates", latitude: -7.3886959, longitude: 109.3642131 },
                      openingHours: ["Mo-Fr 11:00-20:00", "Sa-Su 09:00-21:00"],
                      image: "https://optikiseeyou.com/lokasi/purbalingga/IMG_8525.webp",
                    },
                  ],
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
                      name: "Katalog Kacamata",
                      description: "100+ frame kacamata minus pria dan wanita: titanium, cat-eye, sunglasses",
                      url: "https://optikiseeyou.com/katalog",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 2,
                      name: "Katalog Softlens",
                      description: "Softlens original bersertifikasi Kemenkes RI, berbagai warna dan kadar air",
                      url: "https://optikiseeyou.com/softlens",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 3,
                      name: "Virtual Try-On",
                      description: "Coba kacamata di wajah Anda secara virtual real-time tanpa aplikasi",
                      url: "https://optikiseeyou.com/try-on",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 4,
                      name: "Lokasi Cabang",
                      description: "4 cabang resmi: Purwokerto, Purbalingga, Wonosobo, dan Cilacap",
                      url: "https://optikiseeyou.com/cabang",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 5,
                      name: "Cabang Purwokerto",
                      description: "Optik I See You Purwokerto — Jl. Sunan Ampel No.5, Sumbang, Banyumas",
                      url: "https://optikiseeyou.com/cabang/purwokerto",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 6,
                      name: "Cabang Purbalingga",
                      description: "Optik I See You Purbalingga — Jl. Onje No.1, Purbalingga",
                      url: "https://optikiseeyou.com/cabang/purbalingga",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 7,
                      name: "Cabang Wonosobo",
                      description: "Optik I See You Wonosobo — Jl. Jenderal Soedirman, Wonosobo",
                      url: "https://optikiseeyou.com/cabang/wonosobo",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 8,
                      name: "Cabang Cilacap",
                      description: "Optik I See You Cilacap — Jl. Rinjani Depan Perum GRP No.2",
                      url: "https://optikiseeyou.com/cabang/cilacap",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 9,
                      name: "Photobooth",
                      description: "Photobooth AR kacamata dengan animasi GIF dan cetak instan",
                      url: "https://optikiseeyou.com/photobooth",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 10,
                      name: "Quiz Frame",
                      description: "Analisis frame kacamata dan skrining kesehatan mata interaktif",
                      url: "https://optikiseeyou.com/quiz",
                    },
                    {
                      "@type": "SiteNavigationElement",
                      position: 11,
                      name: "Blog Kacamata",
                      description: "Tips memilih frame, cara merawat softlens, biaya ganti lensa dan kesehatan mata",
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
      
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MPCWJ4KZ');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="bg-isy-ivory font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MPCWJ4KZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Real-Time Glowing Top Navigation Progress Bar */}
        <TopProgressBar />

        {/* Luxury Brand Opening Splash Screen */}
        <PWASplashScreen />

        {children}

        {/* PWA: Register Service Worker */}
        <PWARegister />

        {/* PWA: Install Prompt Banner */}
        <PWAInstallPrompt />

        {/* Global Privacy & Cookie Consent Banner */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}

