"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
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
          ? "border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-lg shadow-isy-green-deep/5 py-2.5"
          : "border-b border-isy-line/60 bg-white/90 backdrop-blur-md py-3.5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Optik I See You"
            width={120}
            height={46}
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full p-1 transition-all">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : (pathname ?? "").startsWith(link.href.split("?")[0]);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
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

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/photobooth?mode=ar"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-isy-green-bright to-isy-green-deep px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
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

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around border-t border-isy-line bg-white/80 backdrop-blur-md px-2 py-2 overflow-x-auto text-[11px] font-bold">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 px-2.5 py-1 text-isy-ink/70 hover:text-isy-green-deep active:scale-95"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
