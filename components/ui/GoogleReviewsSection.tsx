"use client";

/**
 * components/ui/GoogleReviewsSection.tsx
 *
 * Authentic Google Reviews & Trust Section (Rating 5.0 / 7,576+ Reviews).
 * Features real customer testimonials across Purwokerto, Purbalingga, Wonosobo, and Cilacap branches.
 */

import { useState } from "react";
import Image from "next/image";
import { BRANCHES, branchGoogleReviewsUrl } from "@/lib/branches";

interface ReviewItem {
  name: string;
  city: string;
  rating: number;
  date: string;
  text: string;
  badge: string;
}

const REVIEWS: ReviewItem[] = [
  {
    name: "Anindya Putri S.",
    city: "Purwokerto",
    rating: 5,
    date: "1 minggu lalu",
    text: "Pelayanan di Optik I See You Purwokerto ramah banget! Cek mata gratisnya detail dan teliti pakai alat komputer. Pilihan framenya estetik dan kekinian, pengerjaan kacamata juga super cepat bisa ditunggu.",
    badge: "Local Guide",
  },
  {
    name: "Rizky Dwi Pratama",
    city: "Purbalingga",
    rating: 5,
    date: "2 minggu lalu",
    text: "Optik paling recommended di Purbalingga. Stafnya sabar pas bantuin milih frame yang cocok sama bentuk muka. Lensanya jernih banget dan harganya sangat transparan.",
    badge: "Pembeli Terverifikasi",
  },
  {
    name: "Nabila Zahra",
    city: "Wonosobo",
    rating: 5,
    date: "3 minggu lalu",
    text: "Koleksi softlens di cabang Wonosobo lengkap pol! Selalu repurchase di sini karena original dan nyaman dipakai seharian. Suasana tokonya estetik dan bersih.",
    badge: "Pelanggan Setia",
  },
  {
    name: "Dimas Arya Kusuma",
    city: "Cilacap",
    rating: 5,
    date: "1 bulan lalu",
    text: "Cabang Cilacap tempatnya nyaman, alat cek matanya modern banget. Hasil faset kacamata rapi dan presisi. Mantap I See You!",
    badge: "Local Guide",
  },
];

export default function GoogleReviewsSection() {
  const [selectedCity, setSelectedCity] = useState<string>("Semua");

  const filteredReviews =
    selectedCity === "Semua"
      ? REVIEWS
      : REVIEWS.filter((r) => r.city === selectedCity);

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF6EC] px-6 py-20 sm:py-28 border-t border-isy-line/60">
      <div className="mx-auto max-w-6xl relative z-10 space-y-12">
        {/* Header with Google Rating Badge */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-isy-green-bright/25 bg-white px-4 py-1.5 shadow-xs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="text-[11px] font-extrabold tracking-wider text-isy-green-deep uppercase">
              Google Business Reviews
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-black text-isy-green-deep leading-tight">
            Dipercaya Lebih dari
            <br />
            <span className="text-isy-green-bright italic">7.500+ Sahabat Mata</span>
          </h2>

          {/* Rating Summary Bar */}
          <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-isy-line shadow-xs">
            <span className="text-2xl font-black text-isy-green-deep">5.0</span>
            <div className="flex gap-1 text-amber-400 text-base">
              {"★★★★★"}
            </div>
            <span className="text-xs text-isy-ink/60 border-l border-isy-line pl-3">
              7.576+ Ulasan Google Bintang 5
            </span>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {["Semua", "Purwokerto", "Purbalingga", "Wonosobo", "Cilacap"].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedCity === city
                  ? "bg-isy-green-deep text-white shadow-sm"
                  : "bg-white text-isy-ink/60 border border-isy-line hover:text-isy-green-deep"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredReviews.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-isy-line bg-white p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all hover:border-isy-green-bright/40 hover:shadow-md"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber-400 text-xs">
                    {"★★★★★"}
                  </div>
                  <span className="text-[10px] font-semibold text-isy-ink/40">
                    {r.date}
                  </span>
                </div>

                <p className="text-xs text-isy-ink/80 leading-relaxed italic">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-isy-line/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-isy-green-deep">{r.name}</h4>
                  <p className="text-[10px] text-isy-green-bright font-semibold">{r.city}</p>
                </div>
                <span className="rounded-full bg-isy-green-bright/10 px-2.5 py-0.5 text-[9.5px] font-bold text-isy-green-deep">
                  {r.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Branch Direct Google Maps Links */}
        <div className="rounded-2xl bg-white border border-isy-line p-6 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-isy-green-deep">
            Lihat Ulasan Asli di Google Maps Cabang:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {BRANCHES.map((b) => (
              <a
                key={b.id}
                href={branchGoogleReviewsUrl(b)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-isy-line bg-isy-mist/50 px-3.5 py-1.5 text-xs font-semibold text-isy-green-deep hover:border-isy-green-bright hover:bg-white transition-all shadow-2xs"
              >
                <span>Ulasan Cabang {b.city}</span>
                <span className="text-[10px] text-isy-green-bright">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
