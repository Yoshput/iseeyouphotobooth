"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PRICE_LIST_LENSA_URL,
  SHOPEE_STORE_URL,
  konsultasiWhatsappUrl,
} from "@/lib/branches";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/photobooth?mode=ar", label: "Try On Kacamata" },
    { href: "/photobooth?mode=photobooth", label: "Photobooth" },
    { href: "/katalog", label: "Katalog Frame" },
    { href: "/#lokasi", label: "Lokasi Cabang" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-isy-green-bright/20 bg-white/75 backdrop-blur-xl shadow-lg shadow-isy-green-deep/5 py-2.5"
          : "border-b border-isy-line/60 bg-white/95 backdrop-blur-md py-3.5"
      }`}
    >
      {/* Top Banner Accent Line for Extra Luxury Vibe */}
      <div className="h-0.5 w-full bg-gradient-to-r from-isy-green-deep via-isy-green-bright to-isy-green-deep" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo + "for every you" Tagline */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex flex-col items-start">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={120}
              height={46}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col border-l border-isy-line/80 pl-3">
            <span className="font-serif text-[11px] italic tracking-widest text-isy-green-deep/90 font-medium">
              for every you
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : (pathname ?? "").startsWith(link.href.split("?")[0]);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-isy-green-deep text-white shadow-md shadow-isy-green-deep/20 scale-[1.02]"
                    : "text-isy-ink/80 hover:bg-isy-mist hover:text-isy-green-deep hover:scale-105 active:scale-95"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons: Price List Lensa, Shopee, Konsultasi, AR */}
        <div className="flex items-center gap-2">
          {/* Price List Lensa */}
          <a
            href={PRICE_LIST_LENSA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-isy-line bg-white px-3 py-1.5 text-[11px] font-extrabold text-isy-green-deep shadow-sm transition-all hover:border-isy-green-bright hover:bg-isy-mist hover:scale-105 active:scale-95"
            title="Lihat Price List Lensa Optik I See You"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Pricelist Lensa</span>
          </a>

          {/* Shopee Store Link */}
          <a
            href={SHOPEE_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1.5 text-[11px] font-black text-orange-600 shadow-sm transition-all hover:bg-orange-100 hover:scale-105 active:scale-95"
            title="Toko Shopee Resmi iseeyou.id"
          >
            <span className="text-xs">🛍️</span>
            <span>Shopee</span>
          </a>

          {/* Konsultasi Gratis */}
          <a
            href={konsultasiWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-isy-green-bright/40 bg-isy-green-bright/10 px-3.5 py-1.5 text-[11px] font-extrabold text-isy-green-deep transition-all hover:bg-isy-green-bright hover:text-white hover:scale-105 active:scale-95"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 3C8.82 3 3 8.82 3 16c0 2.36.64 4.57 1.76 6.48L3 29l6.73-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.12 18.08c-.26.73-1.51 1.4-2.08 1.48-.57.08-1.1.36-3.71-.77-3.14-1.36-5.15-4.52-5.3-4.73-.15-.21-1.22-1.63-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.58-.38.78-.38h.56c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.08.14.13.31.03.5-.1.19-.14.31-.28.47-.15.16-.3.36-.43.48-.14.12-.29.25-.12.5.16.24.72 1.19 1.55 1.92 1.07.95 1.97 1.24 2.21 1.38.24.13.38.11.52-.07.14-.18.59-.69.75-.93.16-.23.32-.19.54-.11.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.56-.2 1.29z"/>
            </svg>
            <span>Konsultasi</span>
          </a>

          {/* Try On AR CTA */}
          <Link
            href="/photobooth?mode=ar"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-isy-green-bright to-isy-green-deep px-4 sm:px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Try On AR</span>
          </Link>
        </div>
      </div>

      {/* Mobile Sub-Navigation & Quick Action Bar */}
      <div className="flex lg:hidden items-center justify-around border-t border-isy-line/60 bg-white/90 backdrop-blur-md px-2 py-1.5 overflow-x-auto text-[11px] font-bold">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 px-2 py-1 text-isy-ink/70 hover:text-isy-green-deep active:scale-95"
          >
            {link.label}
          </Link>
        ))}
        <a
          href={PRICE_LIST_LENSA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-2 py-1 text-isy-green-bright font-extrabold"
        >
          Pricelist Lensa 📄
        </a>
      </div>
    </header>
  );
}
