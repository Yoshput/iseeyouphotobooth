"use client";

import { useState } from "react";
import Link from "next/link";
import { TESTIMONIALS } from "@/lib/testimonials";
import { BRANCHES, branchGoogleReviewsUrl } from "@/lib/branches";

export default function TestimoniClient() {
  const [filter, setFilter] = useState<string>("Semua");

  const filteredReviews = filter === "Semua" 
    ? TESTIMONIALS 
    : TESTIMONIALS.filter(r => r.branch === filter);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Top-Left Back Button */}
      <div className="mb-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-isy-line bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-isy-green-deep shadow-xs hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all cursor-pointer"
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
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Kembali ke Beranda</span>
        </Link>
      </div>


      {/* Header Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-1.5 text-xs font-bold text-[#2E7D32]">
          ✓ Diverifikasi Google
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-isy-green-deep">
          Apa Kata Pelanggan Kami
        </h1>
        <p className="text-lg text-isy-ink/60">
          Review asli dari Google Maps
        </p>
        
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-isy-green-deep">5.0</span>
            <div className="flex text-amber-400 text-2xl mb-1">
              ★★★★★
            </div>
          </div>
          <p className="text-sm font-medium text-isy-ink/60">
            dari 7.581 ulasan di Google
          </p>
        </div>

        {/* Stats Bar */}
        <div className="inline-flex items-center justify-center gap-4 rounded-full border border-isy-line bg-white px-6 py-3 text-sm font-bold shadow-sm">
          <span className="text-isy-green-deep">5.0 ★</span>
          <span className="h-4 w-px bg-isy-line"></span>
          <span className="text-isy-ink/70">7.581 Ulasan</span>
          <span className="h-4 w-px bg-isy-line"></span>
          <span className="text-isy-ink/70">4 Cabang</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {["Semua", "Purwokerto", "Purbalingga", "Wonosobo", "Cilacap"].map(city => (
          <button
            key={city}
            onClick={() => setFilter(city)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
              filter === city
                ? "bg-isy-green-deep text-white shadow-md"
                : "bg-white text-isy-ink/60 border border-isy-line hover:text-isy-green-deep hover:border-isy-green-bright/50"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Quick Direct Google Maps Branch Links (Same as Home Page) */}
      <div className="mb-10 rounded-2xl bg-white border border-isy-line p-4 text-center space-y-2.5 shadow-2xs">
        <p className="text-xs font-bold uppercase tracking-wider text-isy-green-deep">
          Lihat Ulasan Asli di Google Maps Cabang:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {BRANCHES.map((b) => (
            <a
              key={b.id}
              href={branchGoogleReviewsUrl(b)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buka pop up ulasan Google Cabang ${b.city} di tab baru`}
              className="inline-flex items-center gap-1.5 rounded-full border border-isy-line bg-isy-mist/50 px-3.5 py-1.5 text-xs font-semibold text-isy-green-deep hover:border-isy-green-bright hover:bg-white hover:text-emerald-700 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <span>Ulasan Cabang {b.city}</span>
              <span className="text-[10px] text-isy-green-bright">↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredReviews.map(r => {
          const branchObj = BRANCHES.find((b) => b.city.toLowerCase() === r.branch.toLowerCase());
          const reviewUrl = branchObj ? branchGoogleReviewsUrl(branchObj) : branchGoogleReviewsUrl(BRANCHES[0]);

          return (
            <a 
              key={r.id} 
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buka ulasan ${r.name} di Google Maps ${r.branch}`}
              className="relative rounded-2xl border border-isy-line bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-isy-green-bright/60 hover:-translate-y-1 transition-all cursor-pointer group block"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-isy-green-bright/20 text-lg font-bold text-isy-green-deep group-hover:scale-105 transition-transform">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-isy-green-deep flex items-center gap-1">
                        {r.name}
                        <span className="text-xs text-isy-green-bright opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                      </h3>
                      <span className="inline-block rounded-full bg-isy-mist px-2 py-0.5 text-[10px] font-bold text-isy-ink/60">
                        {r.branch}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <span className="text-[10px] text-isy-ink/40">{r.date}</span>
                  </div>
                </div>
                <p className="text-sm text-isy-ink/80 leading-relaxed line-clamp-3 italic">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
              
              {/* Google G icon at bottom right */}
              <div className="pt-4 mt-4 border-t border-isy-line/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700/80 group-hover:text-emerald-700 transition-colors">
                  Buka di Google Maps ↗
                </span>
                <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* CTA Section (Foto Kedua) */}
      <div className="rounded-3xl border border-isy-line bg-white p-8 text-center shadow-sm">
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep mb-2">
          Lihat Ulasan Asli di Google Maps Cabang:
        </h2>
        <p className="text-sm text-isy-ink/60 mb-8 max-w-lg mx-auto">
          Klik cabang di bawah untuk langsung membuka pop-up ulasan resmi Google Maps di tab baru:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BRANCHES.map(b => (
            <a
              key={b.id}
              href={branchGoogleReviewsUrl(b)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Buka pop-up ulasan resmi Google Maps Cabang ${b.city} di tab baru`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-isy-line bg-isy-mist/50 p-4 transition-all hover:border-isy-green-bright hover:bg-white hover:shadow-md group cursor-pointer active:scale-98"
            >
              <div className="text-left">
                <span className="block text-xs font-bold text-isy-ink/60 uppercase tracking-wider">Ulasan Cabang</span>
                <span className="block text-base font-black text-isy-green-deep group-hover:text-isy-green-bright transition-colors">{b.city}</span>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-isy-green-bright/10 text-isy-green-deep group-hover:bg-isy-green-bright group-hover:text-white transition-all shadow-2xs">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

