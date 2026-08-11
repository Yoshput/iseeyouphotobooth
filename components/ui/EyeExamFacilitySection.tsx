"use client";

/**
 * components/ui/EyeExamFacilitySection.tsx
 *
 * Section "Fasilitas Pemeriksaan Mata" untuk Homepage.
 * Desain Minimalis, Simple, Aesthetic, Elegan & Mewah.
 * 4 Kartu Alat Utama:
 * 1. Autorefractor (Mesin Digital Labmate)
 * 2. Trial Frame (Kacamata Uji Coba)
 * 3. Trial Lens Set (Koper Lensa Uji Coba)
 * 4. Snellen Chart (Poster Visus Mata)
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface FacilityItem {
  id: string;
  name: string;
  tag: string;
  description: string;
  image: string;
}

const FACILITIES: FacilityItem[] = [
  {
    id: "autorefractor",
    name: "Autorefractor (Refractometer)",
    tag: "Digital Precision",
    description:
      "Alat digital untuk mengukur ukuran minus, plus, dan silinder mata secara otomatis dalam hitungan detik, jadi dasar pengukuran presisi sebelum resep akhir ditentukan.",
    image: "/fasilitas/autorefractor.png",
  },
  {
    id: "trial-frame",
    name: "Trial Frame (Kacamata Uji Coba)",
    tag: "Fitting Test",
    description:
      "Frame kacamata uji khusus yang dipasang langsung ke mata pasien untuk mencoba dan merasakan kombinasi ukuran lensa secara nyata sebelum kacamata permanen dibuat.",
    image: "/fasilitas/trial-frame.png",
  },
  {
    id: "trial-lens-set",
    name: "Trial Lens Set (Koper Lensa Uji)",
    tag: "Lens Collection",
    description:
      "Set koper komplit berisi ratusan pilihan lensa uji coba minus, plus, dan silinder presisi tinggi untuk menemukan resep kacamata yang paling pas & nyaman.",
    image: "/fasilitas/trial-lens-set.png",
  },
  {
    id: "snellen-chart",
    name: "Snellen Chart (Poster Cek Mata)",
    tag: "Visus Test",
    description:
      "Poster / chart digital standar internasional untuk mengukur ketajaman penglihatan (visus) pasien dari jarak tertentu — tahap dasar di setiap sesi pemeriksaan.",
    image: "/fasilitas/snellen-chart.png",
  },
];

const TRUST_HIGHLIGHTS = [
  "Gratis di semua cabang",
  "Tim berpengalaman",
  "Alat standar klinik",
];

export default function EyeExamFacilitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="fasilitas"
      className="relative w-full overflow-hidden border-t border-isy-line bg-gradient-to-b from-white via-isy-mist/20 to-white px-6 py-20 transition-all duration-700"
    >
      {/* Soft background glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 h-[420px] w-[750px] rounded-full bg-isy-green-bright/5 blur-[130px]"
      />

      <div className="mx-auto max-w-6xl relative z-10 space-y-12">
        {/* ── 1) HEADER SECTION (Center-aligned) ── */}
        <div
          className={`mx-auto max-w-2xl text-center space-y-4 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-isy-green-bright/10 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-isy-green-bright">
              FASILITAS PEMERIKSAAN MATA · GRATIS SEMUA CABANG
            </span>
          </div>

          {/* Heading 2 Warna (Font Serif) */}
          <h2 className="font-serif text-3xl font-black text-isy-green-deep sm:text-5xl leading-tight">
            Fasilitas Pemeriksaan Mata
            <br />
            <span className="text-isy-green-bright">Standar Profesional</span>
          </h2>

          {/* Subheading */}
          <p className="mx-auto max-w-xl text-xs sm:text-sm font-medium text-isy-ink/65 leading-relaxed">
            Setiap cabang Optik I See You dilengkapi alat pemeriksaan mata standar klinik, dioperasikan tim berpengalaman — cek mata gratis, hasil akurat, tanpa terburu-buru.
          </p>
        </div>

        {/* ── 2) GRID 4 KARTU ALAT (Desktop 4 kolom, Tablet 2x2, Mobile 1 kolom) ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((item, idx) => (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white/90 p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-isy-green-bright/40 hover:shadow-xl backdrop-blur-sm ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${150 + idx * 120}ms` }}
            >
              <div>
                {/* Image Container with clean background */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-white to-isy-mist/40 border border-isy-line/60 flex items-center justify-center p-4 mb-5 group-hover:bg-white transition-colors">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />

                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[9.5px] font-extrabold text-isy-green-deep shadow-sm border border-isy-line">
                    {item.tag}
                  </span>
                </div>

                {/* Name & Description */}
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-black text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-isy-ink/65 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom decorative accent */}
              <div className="mt-6 pt-4 border-t border-isy-line/60 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-isy-green-bright flex items-center gap-1">
                  <span>✓ Standar Klinik</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright/40 group-hover:bg-isy-green-bright transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* ── 3) TRUST STRIP & 4) CTA PENUTUP ── */}
        <div
          className={`text-center space-y-6 pt-2 transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {TRUST_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight}
                className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/20 bg-isy-green-bright/10 px-4 py-1.5 text-xs font-bold text-isy-green-deep shadow-sm"
              >
                <svg
                  className="h-4 w-4 text-isy-green-bright"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          {/* CTA Penutup */}
          <div className="pt-2">
            <a
              href="#lokasi"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-4 px-8 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-isy-green-bright/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-isy-green-bright/40 active:scale-[0.97]"
            >
              <span>CEK LOKASI CABANG TERDEKAT</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
