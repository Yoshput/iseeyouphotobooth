"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/photobooth?mode=ar", label: "Try On Kacamata" },
    { href: "/photobooth?mode=photobooth", label: "Photobooth" },
    { href: "/katalog", label: "Katalog Frame" },
    { href: "/#lokasi", label: "Lokasi Cabang" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-isy-line/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
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
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : (pathname ?? "").startsWith(link.href.split("?")[0]);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-isy-green-deep text-white shadow-sm"
                    : "text-isy-ink/70 hover:bg-isy-mist hover:text-isy-green-deep"
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
            className="group inline-flex items-center gap-2 rounded-full bg-isy-green-bright px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-isy-green-deep active:scale-95"
          >
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
      <div className="flex md:hidden items-center justify-around border-t border-isy-line bg-isy-mist/50 px-2 py-2 overflow-x-auto text-[11px] font-bold">
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
