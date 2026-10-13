"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isQuizPlaying, setIsQuizPlaying] = useState(false);
  const [isKatalogOpen, setIsKatalogOpen] = useState(false);
  const [isMobileKatalogOpen, setIsMobileKatalogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsKatalogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsKatalogOpen(false);
    setIsMobileKatalogOpen(false);
  }, [pathname]);

  const isKatalogActive = Boolean(pathname?.startsWith("/katalog") || pathname?.startsWith("/softlens"));

  const katalogOptions = [
    {
      href: "/katalog",
      title: "Katalog Frame Kacamata",
      desc: "100+ Koleksi frame optik, titanium & sunglasses",
      badge: "Frame Optik",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="14" r="4" />
          <circle cx="18" cy="14" r="4" />
          <path d="M10 14h4" />
          <path d="M2 14l3-7h14l3 7" />
        </svg>
      ),
    },
    {
      href: "/softlens",
      title: "Katalog Softlens",
      desc: "Softlens warna natural, bening & cairan Kemenkes RI",
      badge: "Kemenkes RI",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  const navLinks = [
    { href: "/photobooth", label: "Photobooth" },
    { href: "/cabang", label: "Cabang" },
    { href: "/home-service", label: "Home Service" },
    { href: "/sponsor", label: "Sponsor" },
    { href: "/quiz", label: "Quiz Frame" },
    { href: "/blog", label: "Blog" },
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
          <div className="flex items-center gap-3 sm:gap-6 sm:gap-8">
            {/* Mobile-Only Home Return Button on /quiz */}
            {pathname?.startsWith("/quiz") && (
              <Link
                href="/"
                aria-label="Kembali ke Beranda"
                title="Kembali ke Beranda"
                className="flex md:hidden items-center gap-1 px-2.5 py-1 rounded-full bg-isy-green-deep/10 text-isy-green-deep text-[11px] font-black hover:bg-isy-green-deep/20 transition-all active:scale-95 shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Home</span>
              </Link>
            )}

            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/logo.webp"
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

              {/* Interactive Katalog Dropdown Button */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setIsKatalogOpen(true)}
                onMouseLeave={() => setIsKatalogOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsKatalogOpen((prev) => !prev)}
                  aria-expanded={isKatalogOpen}
                  aria-haspopup="true"
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isKatalogActive
                      ? "bg-isy-green-deep text-white shadow-md"
                      : "text-isy-green-deep/80 hover:bg-[#F2ECE0] hover:text-isy-green-deep hover:scale-105 active:scale-95"
                  }`}
                >
                  <span>Katalog</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isKatalogOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Desktop Dropdown Popover */}
                {isKatalogOpen && (
                  <div className="absolute left-0 top-full pt-2 z-50 w-72 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="overflow-hidden rounded-2xl border border-[#E3E7DF] bg-[#FAF8F3] p-2 shadow-xl ring-1 ring-black/5">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#626C65]">
                        Pilihan Katalog Produk
                      </div>
                      <div className="space-y-1">
                        {katalogOptions.map((opt) => {
                          const isOptionActive = pathname?.startsWith(opt.href);
                          return (
                            <Link
                              key={opt.href}
                              href={opt.href}
                              onClick={() => setIsKatalogOpen(false)}
                              className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors border group/item ${
                                isOptionActive
                                  ? "bg-white border-[#124734]/30 shadow-2xs"
                                  : "hover:bg-white border-transparent hover:border-[#E3E7DF]"
                              }`}
                            >
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                  isOptionActive
                                    ? "bg-[#124734] text-white"
                                    : "bg-[#124734]/10 text-[#124734] group-hover/item:bg-[#124734] group-hover/item:text-white"
                                }`}
                              >
                                {opt.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-[#183C30] group-hover/item:text-[#124734]">
                                    {opt.title}
                                  </span>
                                  <span className="text-[9.5px] font-semibold text-[#124734] bg-[#124734]/10 px-1.5 py-0.5 rounded">
                                    {opt.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#626C65] leading-snug mt-0.5 line-clamp-1">
                                  {opt.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Navigation Links */}
              {navLinks.map((link) => {
                const isActive =
                  link.href.startsWith("/#")
                    ? false
                    : (pathname ?? "").startsWith(link.href.split("?")[0]);

                const isQuiz = link.href === "/quiz";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-isy-green-deep text-white shadow-md"
                        : "text-isy-green-deep/80 hover:bg-[#F2ECE0] hover:text-isy-green-deep hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isQuiz && !isActive && (
                      <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Right: "For Every You" logo + CTA */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <p
              className="hidden lg:block text-base tracking-[0.16em] text-isy-green-deep/90 font-medium italic select-none transition-transform hover:scale-105"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              for every you
            </p>
            <Link
              href="/try-on"
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

      </header>

      {/* Mobile Katalog Selection Popup (Drawer) */}
      {isMobileKatalogOpen && !isQuizPlaying && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs md:hidden"
            onClick={() => setIsMobileKatalogOpen(false)}
          />
          <div
            className="fixed left-3 right-3 z-50 md:hidden animate-in slide-in-from-bottom-3 fade-in duration-200"
            style={{ bottom: "calc(3.6rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="overflow-hidden rounded-2xl border border-[#E3E7DF] bg-[#FAF8F3] p-3 shadow-2xl ring-1 ring-black/10">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3E7DF] px-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#124734]">
                  Pilih Katalog Produk
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileKatalogOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200/70 text-stone-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1.5">
                {katalogOptions.map((opt) => {
                  const isOptionActive = pathname?.startsWith(opt.href);
                  return (
                    <Link
                      key={opt.href}
                      href={opt.href}
                      onClick={() => setIsMobileKatalogOpen(false)}
                      className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors border ${
                        isOptionActive
                          ? "bg-white border-[#124734]/30 shadow-2xs"
                          : "bg-white border-[#E3E7DF] active:bg-[#FAF8F3]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isOptionActive
                            ? "bg-[#124734] text-white"
                            : "bg-[#124734]/10 text-[#124734]"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#183C30]">
                            {opt.title}
                          </span>
                          <span className="text-[9.5px] font-semibold text-[#124734] bg-[#124734]/10 px-1.5 py-0.5 rounded">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-[#626C65] truncate mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Nav Bar — scrollable for all links (hidden only when user is actively playing a quiz) */}
      {!isQuizPlaying && (
        <div className="fixed bottom-0 inset-x-0 z-50 flex md:hidden items-center border-t border-[#E3E7DF] bg-[#FAF6EC]/98 backdrop-blur-md px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] overflow-x-auto gap-1 text-[11px] font-bold scrollbar-none shadow-sm">
          {/* Home */}
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

          {/* Divider */}
          <span className="shrink-0 h-4 w-px bg-isy-line/80 mx-0.5" />

          {/* Mobile Katalog 2-Choice Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileKatalogOpen((prev) => !prev)}
            aria-expanded={isMobileKatalogOpen}
            className={`relative flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              isKatalogActive || isMobileKatalogOpen
                ? "bg-isy-green-deep text-white"
                : "text-isy-green-deep/80 hover:text-isy-green-deep active:scale-95"
            }`}
          >
            <span>Katalog</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isMobileKatalogOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {navLinks.map((link) => {
            const isActive =
              link.href.startsWith("/#")
                ? false
                : (pathname ?? "").startsWith(link.href.split("?")[0]);

            const isQuiz = link.href === "/quiz";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative shrink-0 px-2.5 py-1 rounded-full transition-colors ${
                  isActive ? "bg-isy-green-deep text-white" : "text-isy-green-deep/80 hover:text-isy-green-deep active:scale-95"
                }`}
              >
                {isQuiz && !isActive && (
                  <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-isy-green-bright" />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
      {!isQuizPlaying && <div className="h-14 md:hidden pointer-events-none" aria-hidden="true" />}



      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="h-16 sm:h-20" aria-hidden="true" />
    </>
  );
}
