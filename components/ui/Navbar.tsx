"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      // Show when scrolling UP, hide when scrolling DOWN (after 60px threshold)
      if (currentY < 60) {
        setVisible(true);
      } else if (diff > 6) {
        // Scrolling DOWN → hide
        setVisible(false);
      } else if (diff < -6) {
        // Scrolling UP → show
        setVisible(true);
      }

      setScrolled(currentY > 30);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/photobooth", label: "Photobooth" },
    { href: "/katalog", label: "Katalog" },
    { href: "/#lokasi", label: "Lokasi" },
    { href: "/#testimoni", label: "Testimoni" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ease-in-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "bg-[#FAF6EC]/92 backdrop-blur-2xl border-b border-isy-line shadow-sm shadow-black/[0.03] py-2.5"
            : "bg-[#FAF6EC]/95 backdrop-blur-md border-b border-isy-line/70 py-3.5"
        }`}
        style={{
          WebkitBackdropFilter: scrolled ? "blur(28px) saturate(180%)" : "blur(16px)",
          backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "blur(16px)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Left Group: Brand Logo + Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/logo.png"
                alt="Optik I See You"
                width={130}
                height={50}
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Desktop Navigation — Aligned to Left near Logo */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 transition-all">
              {/* Home Icon Button */}
              <Link
                href="/"
                aria-label="Beranda"
                title="Beranda"
                className={`rounded-full p-2.5 transition-all duration-200 flex items-center justify-center ${
                  pathname === "/"
                    ? "bg-isy-green-deep text-white shadow-md"
                    : "text-isy-green-deep/80 hover:bg-[#F2ECE0] hover:text-isy-green-deep hover:scale-105 active:scale-95"
                }`}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>

              {/* Other Navigation Links */}
              {navLinks.map((link) => {
                const isKatalog = link.href === "/katalog" && (pathname?.startsWith("/katalog") || pathname?.startsWith("/softlens"));
                const isActive =
                  isKatalog ||
                  (link.href.startsWith("/#")
                    ? false
                    : (pathname ?? "").startsWith(link.href.split("?")[0]));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-isy-green-deep text-white shadow-md"
                        : "text-isy-green-deep/80 hover:bg-[#F2ECE0] hover:text-isy-green-deep hover:scale-105 active:scale-95"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: "For Every You" logo + CTA */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <p className="hidden lg:block text-base tracking-[0.2em] text-isy-green-deep/90 font-serif italic select-none transition-transform hover:scale-105" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              for every you
            </p>
            <Link
              href="/photobooth?mode=ar"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-isy-green-bright to-isy-green-deep px-4 sm:px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-isy-green-bright/25 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Try On AR</span>
            </Link>
          </div>
        </div>

        {/* Mobile Bottom Nav Bar */}
        <div className="flex md:hidden items-center justify-around border-t border-isy-line/80 bg-[#FAF6EC]/95 backdrop-blur-md px-2 py-2 overflow-x-auto text-[11px] font-bold">
          <Link
            href="/"
            aria-label="Beranda"
            className={`flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full transition-colors ${
              pathname === "/" ? "bg-isy-green-deep text-white" : "text-isy-green-deep/80 hover:text-isy-green-deep"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </Link>
          {navLinks.map((link) => {
            const isKatalog = link.href === "/katalog" && (pathname?.startsWith("/katalog") || pathname?.startsWith("/softlens"));
            const isActive =
              isKatalog ||
              (link.href.startsWith("/#")
                ? false
                : (pathname ?? "").startsWith(link.href.split("?")[0]));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 px-2.5 py-1 rounded-full transition-colors ${
                  isActive ? "bg-isy-green-deep text-white" : "text-isy-green-deep/80 hover:text-isy-green-deep active:scale-95"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="h-16 sm:h-20" aria-hidden="true" />
    </>
  );
}
