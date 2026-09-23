"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Award,
  RotateCcw,
  MessageCircle,
  Share2,
  CheckCircle2,
  Compass,
  ArrowRight,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Glasses,
  Check,
} from "lucide-react";
import { QuizModule, QuizOption } from "@/lib/quiz-data";
import { CATALOG_COLLECTIONS, CatalogItem } from "@/lib/catalog";
import ContactCSModal from "@/components/ui/ContactCSModal";

interface QuizResultCardProps {
  module: QuizModule;
  userAnswers: Record<string, QuizOption>;
  totalScore: number;
  maxScore: number;
  onRestart: () => void;
  onExit: () => void;
}

export default function QuizResultCard({
  module,
  userAnswers,
  totalScore,
  maxScore,
  onRestart,
  onExit,
}: QuizResultCardProps) {
  const [isCSModalOpen, setIsCSModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Subtle celebratory confetti
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.55 },
      colors: ["#116B3C", "#2FA84F", "#0F172A"],
    });
  }, []);

  // Compute Module Specific Summaries
  const evaluation = useMemo(() => {
    if (module.id === "style-persona") {
      const counts: Record<string, number> = {};
      Object.values(userAnswers).forEach((ans) => {
        if (ans.indicates) {
          counts[ans.indicates] = (counts[ans.indicates] || 0) + 1;
        }
      });
      let top = "quiet-luxe";
      let maxC = -1;
      Object.entries(counts).forEach(([k, v]) => {
        if (v > maxC) {
          maxC = v;
          top = k;
        }
      });

      const personaMap: Record<
        string,
        { title: string; tagline: string; desc: string; collections: string }
      > = {
        "quiet-luxe": {
          title: "The Quiet Luxe",
          tagline: "Elegan, Bersih & Berkelas Tanpa Harus Berteriak",
          desc: "Karaktermu mengutamakan kesederhanaan mewah dengan presisi tinggi. Frame kacamata titanium murni dan bentuk minimalis adalah signature style-mu.",
          collections: "Quiet Luxury Series & Titanium Edition",
        },
        "bold-statement": {
          title: "The Bold Statement",
          tagline: "Kacamatamu Berbicara Sebelum Kamu Memulai Percakapan",
          desc: "Karaktermu tegas, visioner, dan percaya diri. Siluet acetate tebal geometris atau bingkai hitam pekat mempertegas aura kepemimpinanmu.",
          collections: "The Onyx Enigma & The Skena Gaze",
        },
        "everyday-chic": {
          title: "The Everyday Chic",
          tagline: "Nyaman, Stylish & Fleksibel di Setiap Agenda Harian",
          desc: "Karaktermu aktif dan adaptif. Kacamata yang ideal untukmu harus nyaman digunakan bekerja di laptop, meeting, hingga hangout santai.",
          collections: "Metro Deek & Clarity Series",
        },
        "the-dreamer": {
          title: "The Dreamer",
          tagline: "Eksploratif, Artsy & Selalu Memiliki Sudut Pandang Unik",
          desc: "Karaktermu kaya akan inspirasi dan tidak ragu mengekspresikan orisinalitas. Frame translucent bening atau siluet cat-eye artsy sangat klop untukmu.",
          collections: "The Lucid Vision & The Feline Silhouette",
        },
      };

      const result = personaMap[top] || personaMap["quiet-luxe"];
      return {
        badge: "Hasil Analisis Frame DNA",
        title: result.title,
        subtitle: result.tagline,
        explanation: result.desc,
        actionAdvice: `Rekomendasi koleksi pilihan: ${result.collections}. Coba langsung frame ini di wajahmu via kamera virtual AR!`,
        topPersona: top,
        icon: Compass,
        waMessage: (branchName: string) =>
          `Halo Optik I See You ${branchName}, saya baru selesai tes Kuis Frame Persona di website dan mendapat hasil karakter "${result.title}". Boleh rekomendasi frame kacamata yang cocok untuk karakter ini?`,
      };
    }

    if (module.id === "vision-screening") {
      const hasCylinder = Object.values(userAnswers).some(
        (ans) => ans.indicates === "cylinder"
      );
      const hasMinus = Object.values(userAnswers).some(
        (ans) => ans.indicates === "minus"
      );
      const hasFatigue = Object.values(userAnswers).some(
        (ans) => ans.indicates === "fatigue"
      );

      if (hasCylinder) {
        return {
          badge: "Hasil Skrining Visual",
          title: "Potensi Refraksi Astigmatisme (Silinder)",
          subtitle: "Perlu kalibrasi axis dan silinder pada kornea",
          explanation:
            "Hasil tes dial kipas atau respon lampu malam menunjukkan kemungkinan berkas cahaya tidak terfokus sempurna pada satu titik fokus retina.",
          actionAdvice:
            "Sangat disarankan melakukan Cek Mata Komputerisasi Gratis di Optik I See You terdekat untuk memastikan ukuran silinder & axis lensa yang tepat.",
          topPersona: "cylinder",
          icon: Eye,
          waMessage: (branchName: string) =>
            `Halo Optik I See You ${branchName}, saya baru selesai skrining Tes Minus & Silinder di optikiseeyou.com dan ada indikasi silinder. Saya mau jadwalkan periksa mata komputerisasi gratis ya.`,
        };
      }

      if (hasMinus) {
        return {
          badge: "Hasil Skrining Visual",
          title: "Indikasi Miopi (Mata Minus)",
          subtitle: "Bayangan objek jauh jatuh di depan retina",
          explanation:
            "Hasil tes duochrome merah-hijau dan kebiasaan menyipitkan mata mengindikasikan penurunan ketajaman visus jarak jauh.",
          actionAdvice:
            "Segera periksakan mata Anda. Resep lensa minus yang akurat akan membebaskan Anda dari sakit kepala dan mata tegang.",
          topPersona: "minus",
          icon: Eye,
          waMessage: (branchName: string) =>
            `Halo Optik I See You ${branchName}, saya baru selesai skrining penglihatan di website dan ada indikasi mata minus. Mau booking jadwal periksa mata gratis di toko.`,
        };
      }

      if (hasFatigue) {
        return {
          badge: "Hasil Skrining Visual",
          title: "Kelelahan Akomodasi Digital",
          subtitle: "Computer Vision Syndrome ringan",
          explanation:
            "Mata Anda sering menegang akibat paparan layar berjam-jam tanpa jeda atau kurangnya proteksi filter sinar biru.",
          actionAdvice:
            "Gunakan lensa perlindungan radiasi Bluechromic dan terapkan aturan jeda 20-20-20 setiap beraktivitas dengan gadget.",
          topPersona: "fatigue",
          icon: ShieldCheck,
          waMessage: (branchName: string) =>
            `Halo Optik I See You ${branchName}, saya sering mengalami mata lelah di depan komputer. Mau tanya tentang lensa anti-radiasi Bluechromic dan periksa mata gratis.`,
        };
      }

      return {
        badge: "Hasil Skrining Visual",
        title: "Ketajaman Visus Prima & Seimbang",
        subtitle: "Kelengkungan kornea dan fokus mata dalam kondisi sangat baik",
        explanation:
          "Hasil tes dial kipas dan duochrome menunjukkan keseimbangan refraksi yang optimal antara mata kanan dan kiri.",
        actionAdvice:
          "Pertahankan kesehatan matamu dengan kacamata anti-UV saat beraktivitas outdoor dan kacamata anti-radiasi saat menatap layar monitor.",
        topPersona: "normal",
        icon: CheckCircle2,
        waMessage: (branchName: string) =>
          `Halo Optik I See You ${branchName}, hasil tes penglihatan saya normal. Saya mau lihat koleksi frame kacamata anti-radiasi dan sunglasses ya.`,
      };
    }

    // Default Score Based Evaluation (Eye Health & Glasses Care)
    const percentage = Math.round((totalScore / maxScore) * 100);
    if (percentage >= 80) {
      return {
        badge: "Hasil Evaluasi Edukasi",
        title: `Skor Sangat Baik: ${percentage}/100`,
        subtitle: "Wawasan kesehatan mata dan perawatan kacamata Anda sangat tepat",
        explanation:
          "Anda memahami betul cara menjaga kesehatan mata dan teknik merawat kacamata yang benar sesuai standar optik profesional.",
        actionAdvice:
          "Pertahankan kebiasaan ini dan kunjungi Optik I See You berkala untuk pembersihan kacamata ultrasonik gratis.",
        topPersona: "expert",
        icon: Award,
        waMessage: (branchName: string) =>
          `Halo Optik I See You ${branchName}, saya baru selesai kuis edukasi mata dengan skor ${percentage}/100! Mau tanya koleksi frame dan promo lensa di cabang ini.`,
      };
    }

    return {
      badge: "Hasil Evaluasi Edukasi",
      title: `Skor: ${percentage}/100`,
      subtitle: "Ada beberapa pemahaman perawatan mata yang perlu disesuaikan",
      explanation:
        "Banyak mitos kacamata dan kebiasaan menatap layar yang sering kita abaikan tanpa sadar dapat mengurangi kenyamanan penglihatan jangka panjang.",
      actionAdvice:
        "Kunjungi Optik I See You terdekat untuk konsultasi gratis dan pemeriksaan refraksi berkala bersama refraksionis berlisensi kami.",
      topPersona: "learner",
      icon: Award,
      waMessage: (branchName: string) =>
        `Halo Optik I See You ${branchName}, saya mau konsultasi kesehatan mata dan cara merawat kacamata yang benar di toko.`,
    };
  }, [module.id, userAnswers, totalScore, maxScore]);

  // Curate 3 real frame products from CATALOG_COLLECTIONS
  const recommendedFrames = useMemo(() => {
    const allItems = CATALOG_COLLECTIONS.flatMap((col) => col.items);
    const getItem = (id: string) => allItems.find((i) => i.id === id);

    if (module.id === "style-persona") {
      const p = evaluation.topPersona;
      if (p === "bold-statement") {
        return [getItem("onyx-1"), getItem("skena-1"), getItem("onyx-2")].filter(Boolean) as CatalogItem[];
      }
      if (p === "everyday-chic") {
        return [getItem("clarity-1"), getItem("metro-1"), getItem("new-1")].filter(Boolean) as CatalogItem[];
      }
      if (p === "the-dreamer") {
        return [getItem("lucid-1"), getItem("feline-1"), getItem("clarity-4")].filter(Boolean) as CatalogItem[];
      }
      return [getItem("titanium-1"), getItem("luxury-1"), getItem("titanium-2")].filter(Boolean) as CatalogItem[];
    }

    if (module.id === "vision-screening") {
      const p = evaluation.topPersona;
      if (p === "cylinder") {
        return [getItem("titanium-1"), getItem("clarity-1"), getItem("metro-2")].filter(Boolean) as CatalogItem[];
      }
      if (p === "minus") {
        return [getItem("metro-1"), getItem("onyx-1"), getItem("skena-1")].filter(Boolean) as CatalogItem[];
      }
      return [getItem("titanium-2"), getItem("lucid-1"), getItem("luxury-1")].filter(Boolean) as CatalogItem[];
    }

    return [getItem("clarity-1"), getItem("luxury-1"), getItem("metro-1")].filter(Boolean) as CatalogItem[];
  }, [module.id, evaluation.topPersona]);

  const getCollectionSlug = (collectionTitle: string) => {
    const found = CATALOG_COLLECTIONS.find(
      (c) => c.title.toLowerCase() === collectionTitle.toLowerCase()
    );
    return found ? found.id : collectionTitle.toLowerCase().replace(/\s+/g, "-");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hasil Analisis Optik I See You: ${evaluation.title}`,
          text: `Saya baru menyelesaikan skrining di Optik I See You: ${evaluation.title}. Coba sekarang di:`,
          url: "https://optikiseeyou.com/quiz",
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText("https://optikiseeyou.com/quiz");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const ResultIcon = evaluation.icon;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-8 animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* Top Left Navigation Row (iOS Standard) */}
      <div className="flex items-center justify-between w-full mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-xs font-semibold text-slate-700 hover:text-isy-green-deep hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
          <span>Beranda</span>
        </Link>

        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-xs font-semibold text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        >
          <span>Pilih Kuis Lain</span>
        </button>
      </div>

      {/* Main Diagnostic Card (Apple Health / Vision Style) */}
      <div className="rounded-3xl border border-black/5 bg-white/90 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] text-center flex flex-col items-center">
        {/* Apple Style Refined Result Seal */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-isy-green-deep/10 border border-isy-green-deep/20 flex items-center justify-center text-isy-green-deep mb-5 shadow-2xs">
          <ResultIcon className="w-9 h-9 stroke-[1.75]" />
        </div>

        {/* Diagnostic Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold tracking-wide text-slate-700 mb-3">
          <span>{evaluation.badge}</span>
        </span>

        {/* Title & Subtitle */}
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 leading-tight">
          {evaluation.title}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2 max-w-lg leading-relaxed">
          {evaluation.subtitle}
        </p>

        {/* Clinical / Educational Explanation */}
        <div className="w-full my-6 p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-black/5 text-left space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Analisis Konsultasi
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {evaluation.explanation}
          </p>
          <div className="pt-3 border-t border-slate-200/80 text-xs text-isy-green-deep font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-isy-green-deep shrink-0 mt-0.5" />
            <span className="leading-relaxed">{evaluation.actionAdvice}</span>
          </div>
        </div>

        {/* ── REAL CATALOG FRAME RECOMMENDATIONS SECTION ── */}
        {recommendedFrames.length > 0 && (
          <div className="w-full mt-2 mb-8 pt-6 border-t border-black/5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Rekomendasi Frame
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  Siluet Pilihan Untuk Wajahmu
                </h3>
              </div>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-1 text-xs font-semibold text-isy-green-deep hover:text-isy-green-bright transition-colors shrink-0 group"
              >
                <span>Lihat Semua Katalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Frame Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedFrames.map((item) => {
                const colSlug = getCollectionSlug(item.collection);
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/5 bg-slate-50/60 p-4 hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-black/10 transition-all duration-300"
                  >
                    <div>
                      {/* Frame Image Container */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white border border-black/5 mb-3">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-slate-700 border border-black/5">
                          {item.collection}
                        </span>
                      </div>

                      {/* Details */}
                      <h4 className="font-serif text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-isy-green-deep transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Face Shape Match */}
                      {item.recommendedFor && item.recommendedFor.length > 0 && (
                        <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-black/5">
                          <span className="text-[9.5px] font-medium text-slate-400">Cocok:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.recommendedFor.map((shape) => (
                              <span
                                key={shape}
                                className="rounded-full bg-white px-2 py-0.5 text-[9px] font-medium text-slate-700 border border-black/5"
                              >
                                {shape}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons (Apple Pill Style) */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-black/5">
                      <Link
                        href={`/try-on?frame=${item.glassesId || "square-frame"}`}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-full bg-isy-green-deep text-white text-[10.5px] font-semibold hover:bg-isy-green-bright active:scale-95 transition-all text-center"
                      >
                        <span>Coba AR</span>
                      </Link>
                      <Link
                        href={`/katalog?cat=${colSlug}`}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-full border border-black/10 bg-white text-slate-700 text-[10.5px] font-medium hover:bg-slate-50 active:scale-95 transition-all text-center"
                      >
                        <span>Detail</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons (iOS Style) */}
        <div className="w-full max-w-lg mx-auto space-y-3">
          {/* Main Booking WA Button */}
          <button
            type="button"
            onClick={() => setIsCSModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-full bg-isy-green-deep text-white text-xs sm:text-sm font-semibold hover:bg-isy-green-bright transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Booking Cek Mata Gratis (4 Cabang)</span>
          </button>

          {/* AR Try-on Link */}
          <Link
            href="/try-on"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full border border-black/10 bg-white text-slate-800 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <Glasses className="w-4 h-4 text-isy-green-deep" />
            <span>Eksplor Virtual Try-On AR</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Secondary Action Row */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full border border-black/5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Ulangi Kuis</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full border border-black/5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4-Branch Contact Modal */}
      <ContactCSModal
        isOpen={isCSModalOpen}
        onClose={() => setIsCSModalOpen(false)}
        productName="Konsultasi & Cek Mata Gratis"
        customMessage={evaluation.waMessage}
      />
    </div>
  );
}
