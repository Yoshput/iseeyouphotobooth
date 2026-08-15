"use client";

/**
 * components/ui/EyeExamFacilitySection.tsx
 *
 * Section "Fasilitas & Workshop Laboratorium Optik" untuk Homepage.
 * Desain Minimalis, Profesional, Elegan & Modern.
 * 6 Fasilitas Resmi Optik I See You:
 * 1. Mesin Potong Lensa Otomatis (Auto Lens Edger)
 * 2. Mesin Potong Lensa Semi Otomatis (Manual Pattern Edger)
 * 3. Autorefractor (Refractometer Digital)
 * 4. Trial Frame (Kacamata Uji Coba)
 * 5. Trial Lens Set (Koper Lensa Uji)
 * 6. Snellen Chart (Tes Visus Mata)
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { csWhatsappUrl } from "@/lib/branches";

interface FacilityItem {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  category: "Pemeriksaan Mata" | "Lab & Faset Lensa";
  shortDesc: string;
  detailedDesc: string;
  highlights: string[];
  image: string;
}

const FACILITIES: FacilityItem[] = [
  {
    id: "mesin-potong-otomatis",
    name: "Mesin Potong Lensa Otomatis",
    subtitle: "High-Speed CNC Auto Lens Edger",
    tag: "Lab & Faset Otomatis",
    category: "Lab & Faset Lensa",
    shortDesc:
      "Mesin faset otomatis berbasis CNC digital dengan 3D frame tracing untuk hasil pemotongan lensa super rapi, akurat hingga 0.01 mm, dan siap ditunggu.",
    detailedDesc:
      "Mesin faset otomatis berkecepatan tinggi yang memindai kontur frame kacamata secara 3D dan memotong lensa optik secara terkomputerisasi. Menjamin kelengkungan dan ketebalan bevel lensa terkunci sempurna pada frame tanpa celah, sehingga lensa tidak goyang, tidak mudah lepas, dan kacamata siap dipakai dengan hasil setara standar lab optik internasional.",
    highlights: [
      "Presisi CNC 0.01 mm",
      "Pengerjaan Cepat (Express / Bisa Ditunggu)",
      "3D Frame Tracing Komputer",
      "Bevel Halus Anti-Gores & Terkunci Kuat",
    ],
    image: "/fasilitas/mesin potong otomatis.webp",
  },
  {
    id: "mesin-potong-semi-otomatis",
    name: "Mesin Potong Lensa Semi Otomatis",
    subtitle: "Precision Manual Pattern Edger",
    tag: "Workshop Presisi",
    category: "Lab & Faset Lensa",
    shortDesc:
      "Mesin faset presisi tinggi untuk pengerjaan custom frame, rimless/half-frame, dan penyetelan manual khusus oleh teknisi lab berpengalaman.",
    detailedDesc:
      "Mesin faset semi-otomatis yang memberikan fleksibilitas penuh bagi teknisi refraksi untuk melakukan pemotongan, penyesuaian sudut bevel, dan penghalusan tepi lensa secara manual. Sangat ideal untuk kacamata model khusus, frame vintage, atau lensa dengan kurva basis unik yang memerlukan sentuhan tangan ahli demi kenyamanan estetika maksimal.",
    highlights: [
      "Custom Rimless & Half-Frame",
      "Finishing Bevel Manual Halus",
      "Kontrol Sudut & Ketebalan Ekstra",
      "Dikerjakan Teknisi Lab Berpengalaman",
    ],
    image: "/fasilitas/mesin potong semi otomatis.webp",
  },
  {
    id: "autorefractor",
    name: "Autorefractor (Refractometer Digital)",
    subtitle: "Computerized Optical Refractometer",
    tag: "Pemeriksaan Digital",
    category: "Pemeriksaan Mata",
    shortDesc:
      "Mesin digital canggih untuk memindai kelainan refraksi (minus, plus, silinder, axis) secara instan, objektif, dan presisi tinggi.",
    detailedDesc:
      "Alat diagnostik digital berteknologi infra merah yang memancarkan cahaya lembut ke retina untuk mendeteksi indeks bias mata secara instan dalam hitungan detik. Menghasilkan data awal minus, plus, silinder, serta axis mata dengan akurasi tinggi sebagai pondasi sebelum penentuan ukuran lensa final.",
    highlights: [
      "Pengukuran Instan dalam 3 Detik",
      "Deteksi Minus, Plus, & Silinder",
      "Data Refraksi Objektif Akurat",
      "Non-Invasif & Nyaman untuk Mata",
    ],
    image: "/fasilitas/autorefractor.webp",
  },
  {
    id: "trial-frame",
    name: "Trial Frame (Kacamata Uji Coba)",
    subtitle: "Precision Optometry Trial Frame",
    tag: "Fitting Test",
    category: "Pemeriksaan Mata",
    shortDesc:
      "Frame kacamata uji khusus yang dipasang langsung ke mata pasien untuk mencoba dan merasakan kombinasi ukuran lensa secara nyata sebelum kacamata permanen dibuat.",
    detailedDesc:
      "Frame kacamata uji ergonomis yang dirancang untuk menahan kombinasi lensa uji coba langsung di depan mata pasien. Dilengkapi pengatur jarak pupil (Pupillary Distance/PD) dan sudut axis yang fleksibel, memastikan pasien dapat mencoba kenyamanan melihat saat berjalan, menunduk, dan membaca sebelum lensa kacamata diproses secara permanen.",
    highlights: [
      "Pengaturan Jarak Pupil (PD) Presisi",
      "Uji Coba Nyata di Wajah Pasien",
      "Simulasi Pemakaian Kacamata Langsung",
      "Mencegah Pusing & Ketidaknyamanan",
    ],
    image: "/fasilitas/trial-frame.webp",
  },
  {
    id: "trial-lens-set",
    name: "Trial Lens Set (Koper Lensa Uji)",
    subtitle: "Optometry Trial Lens Collection",
    tag: "Koleksi Lensa Presisi",
    category: "Pemeriksaan Mata",
    shortDesc:
      "Set koper komplit berisi ratusan pilihan lensa uji coba minus, plus, dan silinder presisi tinggi untuk menemukan resep kacamata yang paling pas & tajam.",
    detailedDesc:
      "Koleksi lengkap ratusan keping lensa optik berspesifikasi klinis dengan berbagai tingkatan ukuran sferis (minus/plus), silinder, prisma, dan filter uji. Digunakan secara bertahap oleh refraksionis optisien untuk mencari kombinasi ukuran lensa terbaik hingga penglihatan pasien mencapai ketajaman maksimal tanpa distorsi.",
    highlights: [
      "Ratusan Keping Lensa Ukuran Lengkap",
      "Uji Koreksi Minus, Plus, & Silinder",
      "Koreksi Akurat Tahap demi Tahap",
      "Standar Optometri Profesional",
    ],
    image: "/fasilitas/trial-lens-set.webp",
  },
  {
    id: "snellen-chart",
    name: "Snellen Chart (Tes Visus Mata)",
    subtitle: "Standard Visual Acuity Chart",
    tag: "Uji Ketajaman Visus",
    category: "Pemeriksaan Mata",
    shortDesc:
      "Poster dan chart standar optometri internasional untuk mengukur ketajaman penglihatan awal dan hasil akhir koreksi mata.",
    detailedDesc:
      "Bagan optometri berstandar internasional yang digunakan untuk menguji ketajaman penglihatan (visus) pasien dari jarak standar. Digunakan untuk menentukan seberapa tajam penglihatan alami pasien dan memastikan hasil koreksi lensa mencapai visus optimal (6/6 atau 20/20).",
    highlights: [
      "Standar Optometri Internasional",
      "Uji Visus Mata Kanan & Kiri Terpisah",
      "Ukur Progres Ketajaman Penglihatan",
      "Tahap Wajib di Setiap Pemeriksaan",
    ],
    image: "/fasilitas/snellen-chart.webp",
  },
];

const TRUST_HIGHLIGHTS = [
  "Gratis Cek Mata di Semua Cabang",
  "Lab & Mesin Faset Standar Modern",
  "Dikerjakan Teknisi Berpengalaman",
  "Pengerjaan Cepat & Bisa Ditunggu",
];

export default function EyeExamFacilitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedFacility(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredFacilities =
    activeCategory === "Semua"
      ? FACILITIES
      : FACILITIES.filter((f) => f.category === activeCategory);

  return (
    <section
      ref={sectionRef}
      id="fasilitas"
      className="relative w-full overflow-hidden border-t border-isy-line bg-gradient-to-b from-white via-isy-ivory/50 to-white px-6 py-20 transition-all duration-700"
    >
      {/* Soft background glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 h-[420px] w-[850px] rounded-full bg-isy-green-bright/5 blur-[140px]"
      />

      <div className="mx-auto max-w-6xl relative z-10 space-y-12">
        {/* ── 1) HEADER SECTION ── */}
        <div
          className={`mx-auto max-w-2xl text-center space-y-4 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-isy-green-bright/10 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-isy-green-bright">
              FASILITAS & WORKSHOP LAB OPTIK
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-black text-isy-green-deep sm:text-5xl leading-tight">
            Fasilitas Pemeriksaan &
            <br />
            <span className="text-isy-green-bright">Mesin Faset Presisi</span>
          </h2>

          {/* Subheading */}
          <p className="mx-auto max-w-xl text-xs sm:text-sm font-medium text-isy-ink/65 leading-relaxed">
            Setiap cabang Optik I See You dilengkapi peralatan diagnostik digital dan mesin pemotong lensa otomatis modern — menjamin hasil kacamata presisi, nyaman, dan rapi.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {["Semua", "Pemeriksaan Mata", "Lab & Faset Lensa"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-isy-green-deep text-white shadow-md"
                    : "border border-isy-line bg-white/80 text-isy-ink/70 hover:border-isy-green-bright/50 hover:bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── 2) GRID KARTU FASILITAS ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedFacility(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedFacility(item)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-isy-green-bright/50 hover:shadow-xl cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-isy-green-bright/50 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${100 + idx * 80}ms` }}
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-isy-ivory/60 to-isy-mist/40 border border-isy-line/60 flex items-center justify-center p-3 mb-5 group-hover:bg-white transition-colors">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />

                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[9.5px] font-extrabold text-isy-green-deep shadow-sm border border-isy-line">
                    {item.tag}
                  </span>

                  <span className="absolute bottom-3 right-3 rounded-full bg-isy-green-deep/90 text-white px-2.5 py-0.5 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    🔍 Klik Detail
                  </span>
                </div>

                {/* Name Only */}
                <div className="pt-1">
                  <h3 className="font-serif text-xl font-black text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors">
                    {item.name}
                  </h3>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-6 pt-4 border-t border-isy-line/60 flex items-center justify-between">
                <span className="text-xs font-bold text-isy-green-deep group-hover:text-isy-green-bright flex items-center gap-1.5 transition-colors">
                  <span>Lihat Detail</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-isy-green-bright/30 group-hover:bg-isy-green-bright transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* ── 3) TRUST STRIP & CTA PENUTUP ── */}
        <div
          className={`text-center space-y-6 pt-4 transition-all duration-700 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {TRUST_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight}
                className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/20 bg-white px-4 py-1.5 text-xs font-bold text-isy-green-deep shadow-sm"
              >
                <svg
                  className="h-3.5 w-3.5 text-isy-green-bright"
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

          {/* CTA Button */}
          <div className="pt-2">
            <a
              href="#lokasi"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-isy-green-bright to-isy-green-deep py-4 px-8 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-isy-green-bright/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-isy-green-bright/40 active:scale-[0.97]"
            >
              <span>KUNJUNGI CABANG OPTIK I SEE YOU</span>
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

      {/* ── 4) INTERACTIVE DETAIL MODAL ── */}
      {selectedFacility && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="facility-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            onClick={() => setSelectedFacility(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-3xl border border-isy-line bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedFacility(null)}
              aria-label="Tutup detail fasilitas"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-isy-line bg-white/90 text-isy-ink/60 shadow-sm transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header with image */}
            <div className="space-y-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-isy-ivory to-isy-mist/50 border border-isy-line flex items-center justify-center p-4">
                <Image
                  src={selectedFacility.image}
                  alt={selectedFacility.name}
                  fill
                  className="object-contain p-2"
                />
                <span className="absolute top-3 left-3 rounded-full bg-isy-green-deep text-white px-3.5 py-1 text-xs font-black shadow-md">
                  {selectedFacility.tag}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-isy-green-bright">
                  {selectedFacility.subtitle}
                </span>
                <h3 id="facility-modal-title" className="font-serif text-2xl sm:text-3xl font-black text-isy-green-deep leading-tight mt-1">
                  {selectedFacility.name}
                </h3>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="space-y-3 border-t border-isy-line/80 pt-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-isy-green-deep">
                Fungsi &amp; Peran dalam Pembuatan Kacamata:
              </h4>
              <p className="text-sm text-isy-ink/75 leading-relaxed font-normal">
                {selectedFacility.detailedDesc}
              </p>
            </div>

            {/* Key Highlights */}
            <div className="space-y-3 bg-isy-ivory/60 rounded-2xl p-4 border border-isy-line">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-isy-green-deep">
                Keunggulan &amp; Standar Presisi:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedFacility.highlights.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-semibold text-isy-ink/80">
                    <svg className="h-4 w-4 shrink-0 text-isy-green-bright mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={csWhatsappUrl(`Halo Optik I See You, saya ingin konsultasi mengenai fasilitas ${selectedFacility.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-isy-green-deep py-3.5 px-6 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-isy-green-bright transition-all active:scale-95"
              >
                <span>Konsultasi Alat / Periksa Mata</span>
                <span>→</span>
              </a>
              <button
                onClick={() => setSelectedFacility(null)}
                className="w-full sm:w-auto rounded-2xl border border-isy-line bg-white px-6 py-3.5 text-xs font-bold text-isy-ink/70 hover:bg-isy-mist transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
