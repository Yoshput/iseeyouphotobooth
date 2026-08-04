import type { Metadata, Viewport } from "next";
import CustomCursor from "@/components/ui/CustomCursor";
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
 title: "I See You — AR Photobooth",
 description:
 "Coba kacamata langsung dari kamera, tanpa ribet. Gratis di Optik I See You Purwokerto.",
 icons: {
   icon: "/icon.svg",
   shortcut: "/icon.svg",
   apple: "/icon.svg",
 },
 openGraph: {
 title: "I See You AR Photobooth",
 description: "Pilih kacamata favoritmu dan foto bareng! ",
 siteName: "Optik I See You",
 },
};

export const viewport: Viewport = {
 width: "device-width",
 initialScale: 1,
 maximumScale: 1,
 userScalable: false,
 viewportFit: "cover",
 themeColor: "#116B3C",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="id">
 <head>
 <link rel="icon" type="image/svg+xml" href="/icon.svg" />
 <link rel="apple-touch-icon" href="/icon.svg" />
 {/* Google Fonts via standard CSS link — works in static export */}
 <link rel="preconnect" href="https://fonts.googleapis.com" />
 <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
 <link
 href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap"
 rel="stylesheet"
 />
 </head>
 <body className="overscroll-none bg-white font-sans antialiased">
 <CustomCursor />
 {children}
 </body>
 </html>
 );
}
