"use client";

/**
 * components/ui/LocalFaqSection.tsx
 *
 * Luxury Interactive FAQ & Local Search Engine Optimization (SEO) Section.
 * Targets high-intent searches:
 * - "optik di purwokerto", "optik di purbalingga", "optik di wonosobo", "optik di cilacap"
 * - "toko kacamata purwokerto", "periksa mata terdekat", "katalog softlens"
 */

import { useState } from "react";
import Link from "next/link";
import { BRANCHES, konsultasiWhatsappUrl, mapsDirectionsUrl } from "@/lib/branches";

interface FaqItem {
  question: string;
  answer: string;
  category: "Cabang & Lokasi" | "Layanan & Fasilitas" | "AR Try-On & Softlens";
  links?: { label: string; url: string; external?: boolean }[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Cabang & Lokasi",
    question: "Di mana saja lokasi cabang Optik I See You?",
    answer:
      "Optik I See You memiliki 4 cabang resmi di Jawa Tengah: 1) Cabang Purwokerto (Jl. Sunan Ampel No.5, Sumbang), 2) Cabang Purbalingga (Jl. Onje No.1, Purbalingga Lor), 3) Cabang Wonosobo (Jl. Jenderal Soedirman, Sumberan Selatan), dan 4) Cabang Cilacap (Jl. Rinjani Depan Perum GRP No.2 Ruko No.3). Semua cabang menyediakan layanan periksa mata digital dan koleksi frame kacamata kekinian lengkap.",
    links: BRANCHES.map((b) => ({
      label: `Google Maps ${b.city}`,
      url: mapsDirectionsUrl(b),
      external: true,
    })),
  },
  {
    category: "Cabang & Lokasi",
    question: "Apakah Optik I See You di Purwokerto, Purbalingga, Wonosobo & Cilacap buka setiap hari?",
    answer:
      "Ya, seluruh cabang Optik I See You beroperasi setiap hari dengan jam buka fleksibel untuk kenyamanan pengunjung. Cabang Purwokerto dan Cilacap buka pukul 09.00 - 21.00 WIB, cabang Wonosobo buka pukul 09.00 - 18.00 WIB, dan cabang Purbalingga buka pukul 11.00 - 20.00 WIB (Senin–Jumat) serta 09.00 - 21.00 WIB (Sabtu–Minggu).",
  },
  {
    category: "Layanan & Fasilitas",
    question: "Apakah periksa mata di Optik I See You Purwokerto & cabang lainnya gratis?",
    answer:
      "Tentu saja! Kami menyediakan layanan Konsultasi & Cek Mata Gratis menggunakan Autorefractor (Refractometer Digital) komputerisasi dan Trial Lens Set oleh staf refraksi berpengalaman untuk memastikan ukuran minus, silinder, dan plus kamu 100% tepat dan nyaman dipakai seharian.",
    links: [
      {
        label: "Konsultasi Cek Mata via WhatsApp",
        url: konsultasiWhatsappUrl(),
        external: true,
      },
    ],
  },
  {
    category: "Layanan & Fasilitas",
    question: "Berapa lama proses pembuatan kacamata faset otomatis di Optik I See You?",
    answer:
      "Dengan dukungan Mesin Pemotong Lensa CNC Otomatis berteknologi 3D Frame Tracing berkecepatan tinggi di lab internal kami, pembuatan kacamata resep standar dapat diselesaikan secara Express (bisa ditunggu) dengan presisi mikron yang sangat rapi.",
  },
  {
    category: "AR Try-On & Softlens",
    question: "Bagaimana cara mencoba kacamata secara online dengan AR Try-On di optikiseeyou.com?",
    answer:
      "Kamu cukup membuka fitur 'Mulai Coba AR' di website ini menggunakan kamera HP, laptop, atau tablet. Teknologi AR Face Landmark 3D kami akan langsung memindai proporsi wajahmu secara real-time dan menampilkan bentuk frame kacamata secara presisi tanpa perlu instalasi aplikasi tambahan.",
    links: [
      {
        label: "Coba Kacamata AR Sekarang →",
        url: "/start",
        external: false,
      },
      {
        label: "Buka Katalog Frame →",
        url: "/katalog",
        external: false,
      },
    ],
  },
  {
    category: "AR Try-On & Softlens",
    question: "Apakah tersedia katalog softlens original dengan berbagai varian warna?",
    answer:
      "Ya, Optik I See You menyediakan koleksi softlens original terlengkap (Exoticon, Ice, Miss Ice, Moxie, Exo Clear) dengan berbagai pilihan warna Brown, Grey, Hazel, Natural, hingga aksesoris pencuci softlens yang bisa dipesan langsung secara online maupun di store.",
    links: [
      {
        label: "Lihat Katalog Softlens Lengkap →",
        url: "/softlens",
        external: false,
      },
    ],
  },
];

export default function LocalFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-isy-ivory/50 to-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3.5 mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-isy-green-bright/10 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-isy-green-bright" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-isy-green-bright">
              INFO LENGKAP &amp; PANDUAN
            </span>
          </div>

          <h2 className="font-serif text-3xl font-black text-isy-green-deep sm:text-5xl leading-tight">
            Pertanyaan Umum Seputar
            <br />
            <span className="text-isy-green-bright italic">Optik I See You</span>
          </h2>

          <p className="text-xs sm:text-sm font-medium text-isy-ink/65 max-w-lg mx-auto leading-relaxed">
            Informasi lengkap mengenai layanan periksa mata, lokasi cabang Purwokerto, Purbalingga, Wonosobo, Cilacap, dan teknologi AR online kami.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-isy-green-bright/40 bg-white shadow-lg shadow-isy-green-bright/5"
                    : "border-isy-line bg-white/80 hover:border-isy-green-bright/30 hover:bg-white"
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-isy-green-bright">
                      {faq.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-isy-green-deep leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 border-isy-green-bright bg-isy-green-bright text-white"
                        : "border-isy-line bg-isy-mist text-isy-ink/60"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* Answer Content */}
                {isOpen && (
                  <div className="border-t border-isy-line/60 px-5 pb-6 pt-4 sm:px-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs sm:text-sm font-normal text-isy-ink/75 leading-relaxed">
                      {faq.answer}
                    </p>

                    {/* Action Links */}
                    {faq.links && faq.links.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-4">
                        {faq.links.map((lnk, lIdx) =>
                          lnk.external ? (
                            <a
                              key={lIdx}
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-isy-green-bright/30 bg-isy-green-bright/10 px-3.5 py-1.5 text-[11px] font-bold text-isy-green-deep hover:bg-isy-green-bright hover:text-white transition-colors"
                            >
                              <span>{lnk.label}</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          ) : (
                            <Link
                              key={lIdx}
                              href={lnk.url}
                              className="inline-flex items-center gap-1.5 rounded-full bg-isy-green-deep px-4 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-isy-green-bright transition-colors"
                            >
                              <span>{lnk.label}</span>
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
