"use client";

/**
 * components/ui/GoogleReviewsSection.tsx
 *
 * Authentic Google Reviews & Trust Section (Rating 5.0 / 7,500+ Reviews).
 * Features real customer testimonials across Purwokerto, Purbalingga, Wonosobo, and Cilacap branches.
 */

import { useState, useMemo } from "react";
import { BRANCHES, branchGoogleReviewsUrl } from "@/lib/branches";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

function parseRelativeDate(dateStr: string): number {
  const lower = dateStr.toLowerCase().trim();
  if (lower.includes("hari")) {
    const days = parseInt(lower) || 1;
    return days;
  }
  if (lower.includes("minggu")) {
    const weeks = parseInt(lower) || 1;
    return weeks * 7;
  }
  if (lower.includes("bulan")) {
    const months = parseInt(lower) || 1;
    return months * 30;
  }
  if (lower.includes("tahun") || lower.includes("setahun")) {
    const years = parseInt(lower) || 1;
    return years * 365;
  }
  return 180;
}

function getIsoDate(dateStr: string): string {
  const daysAgo = parseRelativeDate(dateStr);
  const target = new Date();
  target.setDate(target.getDate() - daysAgo);
  return target.toISOString().split("T")[0];
}

export default function GoogleReviewsSection() {
  const [selectedCity, setSelectedCity] = useState<string>("Semua");

  // Sort testimonials newest first
  const sortedReviews = useMemo(() => {
    return [...TESTIMONIALS].sort((a, b) => {
      const aDays = parseRelativeDate(a.date);
      const bDays = parseRelativeDate(b.date);
      return aDays - bDays;
    });
  }, []);

  const filteredReviews = useMemo(() => {
    if (selectedCity === "Semua") {
      return sortedReviews.slice(0, 8);
    }
    return sortedReviews
      .filter((r) => r.branch.toLowerCase() === selectedCity.toLowerCase())
      .slice(0, 8);
  }, [selectedCity, sortedReviews]);

  return (
    <section
      id="testimoni"
      className="relative w-full bg-[#F8F5ED] px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-24 border-t border-[#E3E7DF]"
    >
      <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
        {/* Header with Google Rating Badge */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E3E7DF] bg-white px-3.5 py-1 shadow-2xs">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="text-[11px] font-bold tracking-wider text-[#124734] uppercase">
              Google Business Reviews
            </span>
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#124734] leading-tight tracking-tight">
            Ulasan Pelanggan Asli
          </h2>

          <p className="text-xs sm:text-sm text-[#626C65] leading-relaxed max-w-xl mx-auto">
            Testimoni otentik pengunjung di gerai Purwokerto, Purbalingga, Wonosobo, dan Cilacap dari ulasan terverifikasi Google Maps.
          </p>

          {/* Rating Summary Bar */}
          <div className="pt-1">
            <a
              href={branchGoogleReviewsUrl(BRANCHES[0])}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka Ulasan Google Optik I See You"
              className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-[#E3E7DF] shadow-2xs hover:border-[#124734] hover:shadow-xs transition-colors"
            >
              <span className="text-xl sm:text-2xl font-black text-[#124734]">5.0</span>
              <div className="flex gap-0.5 text-amber-500 text-sm" aria-label="Rating 5 dari 5 bintang">
                {"★★★★★"}
              </div>
              <span className="text-xs text-[#626C65] border-l border-[#E3E7DF] pl-3 flex items-center gap-1 font-semibold">
                7.500+ Ulasan Google Bintang 5
                <span className="text-[#124734] text-xs">↗</span>
              </span>
            </a>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {["Semua", "Purwokerto", "Purbalingga", "Wonosobo", "Cilacap"].map((city) => {
            const isSelected = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-[#124734] text-white shadow-2xs"
                    : "bg-white text-[#626C65] border border-[#E3E7DF] hover:border-[#124734] hover:text-[#183C30]"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredReviews.map((r, i) => {
            const branchObj = BRANCHES.find((b) => b.city.toLowerCase() === r.branch.toLowerCase());
            const reviewUrl = branchObj ? branchGoogleReviewsUrl(branchObj) : branchGoogleReviewsUrl(BRANCHES[0]);
            const iso = getIsoDate(r.date);

            return (
              <a
                key={r.id || i}
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Lihat ulasan ${r.branch} langsung di Google Maps`}
                className="group rounded-xl border border-[#E3E7DF] bg-white p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xs transition-all duration-200 hover:border-[#124734]/50 hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-amber-500 text-xs" aria-label={`Bintang ${r.rating || 5}`}>
                      {"★".repeat(r.rating || 5)}
                    </div>
                    <time dateTime={iso} className="text-[10.5px] font-medium text-[#626C65]">
                      {r.date}
                    </time>
                  </div>

                  <p className="text-xs text-[#183C30] leading-relaxed line-clamp-4">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F2EEE6] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#183C30] group-hover:text-[#124734] transition-colors flex items-center gap-1">
                      {r.name}
                      <span className="text-[10px] text-[#124734] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </h3>
                    <p className="text-[10.5px] text-[#626C65] font-medium">Cabang {r.branch}</p>
                  </div>
                  <span className="rounded-md bg-[#FAF8F3] border border-[#E3E7DF] px-2 py-0.5 text-[9.5px] font-semibold text-[#124734]">
                    {r.badge || "Google Review"}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Branch Direct Google Maps Links */}
        <div className="rounded-xl bg-white border border-[#E3E7DF] p-5 sm:p-6 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#124734]">
            Buka Profil Ulasan di Google Maps Setiap Cabang:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {BRANCHES.map((b) => (
              <a
                key={b.id}
                href={branchGoogleReviewsUrl(b)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3E7DF] bg-[#FAF8F3] px-3.5 py-1.5 text-xs font-semibold text-[#183C30] hover:border-[#124734] hover:bg-white hover:text-[#124734] transition-colors shadow-2xs"
              >
                <span>Ulasan Cabang {b.city}</span>
                <span className="text-[10px] text-[#124734]">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
