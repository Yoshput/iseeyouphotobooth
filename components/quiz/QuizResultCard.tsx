"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Trophy,
  Award,
  Sparkles,
  RotateCcw,
  MessageCircle,
  Share2,
  CheckCircle2,
  Compass,
  ArrowRight,
  ExternalLink,
  Home,
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
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2FA84F", "#116B3C", "#F7C948", "#FAF6EC"],
    });
  }, []);

  // Compute Module Specific Summaries
  const evaluation = useMemo(() => {
    if (module.id === "style-persona") {
      // Find top persona from indicates
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
        badge: "Karakter Frame Terpilih",
        title: result.title,
        subtitle: result.tagline,
        explanation: result.desc,
        actionAdvice: `Rekomendasi koleksi untukmu: ${result.collections}. Kamu bisa langsung mencoba frame ini di wajahmu via kamera virtual!`,
        topPersona: top,
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
          badge: "Indikasi Silinder Terdeteksi",
          title: "Potensi Refraksi Astigmatisme",
          subtitle: "Perlu kalibrasi axis dan silinder pada kornea",
          explanation:
            "Hasil tes dial kipas atau respon lampu malam menunjukkan kemungkinan berkas cahaya tidak terfokus sempurna pada satu titik fokus retina.",
          actionAdvice:
            "Sangat disarankan melakukan Cek Mata Komputerisasi Gratis di Optik I See You terdekat untuk memastikan ukuran silinder & axis lensa yang tepat.",
          topPersona: "cylinder",
          waMessage: (branchName: string) =>
            `Halo Optik I See You ${branchName}, saya baru selesai skrining Tes Minus & Silinder di optikiseeyou.com dan ada indikasi silinder. Saya mau jadwalkan periksa mata komputerisasi gratis ya.`,
        };
      }

      if (hasMinus) {
        return {
          badge: "Indikasi Minus (Miopi)",
          title: "Fokus Jarak Jauh Berkurang",
          subtitle: "Bayangan objek jauh jatuh di depan retina",
          explanation:
            "Hasil tes duochrome merah-hijau dan kebiasaan menyipitkan mata mengindikasikan penurunan ketajaman visus jarak jauh.",
          actionAdvice:
            "Segera periksakan mata Anda. Resep lensa minus yang akurat akan membebaskan Anda dari sakit kepala dan mata tegang.",
          topPersona: "minus",
          waMessage: (branchName: string) =>
            `Halo Optik I See You ${branchName}, saya baru selesai skrining penglihatan di website dan ada indikasi mata minus. Mau booking jadwal periksa mata gratis di toko.`,
        };
      }

      if (hasFatigue) {
        return {
          badge: "Kelelahan Akomodasi Digital",
          title: "Otot Mata Bekerja Ekstra",
          subtitle: "Computer Vision Syndrome ringan",
          explanation:
            "Mata Anda sering menegang akibat paparan layar berjam-jam tanpa jeda atau kurangnya proteksi filter sinar biru.",
          actionAdvice:
            "Gunakan lensa perlindungan radiasi Bluechromic dan terapkan aturan jeda 20-20-20 setiap beraktivitas dengan gadget.",
          topPersona: "fatigue",
          waMessage: (branchName: string) =>
            `Halo Optik I See You ${branchName}, saya sering mengalami mata lelah di depan komputer. Mau tanya tentang lensa anti-radiasi Bluechromic dan periksa mata gratis.`,
        };
      }

      return {
        badge: "Penglihatan Prima",
        title: "Visus Normal & Seimbang",
        subtitle: "Kelengkungan kornea dan fokus mata dalam kondisi sangat baik",
        explanation:
          "Hasil tes dial kipas dan duochrome menunjukkan keseimbangan refraksi yang optimal antara mata kanan dan kiri.",
        actionAdvice:
          "Pertahankan kesehatan matamu dengan kacamata anti-UV saat beraktivitas outdoor dan kacamata anti-radiasi saat menatap layar monitor.",
        topPersona: "normal",
        waMessage: (branchName: string) =>
          `Halo Optik I See You ${branchName}, hasil tes penglihatan saya normal. Saya mau lihat koleksi frame kacamata anti-radiasi dan sunglasses ya.`,
      };
    }

    // Default Score Based Evaluation (Eye Health & Glasses Care)
    const percentage = Math.round((totalScore / maxScore) * 100);
    if (percentage >= 80) {
      return {
        badge: "Level: Master Ahli",
        title: `Skor Hebat: ${percentage}/100`,
        subtitle: "Wawasanmu tentang kesehatan mata dan kacamata luar biasa!",
        explanation:
          "Kamu memahami betul cara menjaga kesehatan mata dan teknik merawat kacamata yang benar sesuai standar optik profesional.",
        actionAdvice:
          "Bagikan wawasan ini ke teman-temanmu agar kacamata mereka tetap kinclong dan mata terhindar dari bahaya lelah digital.",
        topPersona: "expert",
        waMessage: (branchName: string) =>
          `Halo Optik I See You ${branchName}, saya baru selesai kuis edukasi mata dengan skor ${percentage}/100! Mau tanya koleksi frame dan promo lensa di cabang ini.`,
      };
    }

    return {
      badge: "Level: Perlu Peningkatan",
      title: `Skor: ${percentage}/100`,
      subtitle: "Ada beberapa kebiasaan merawat mata yang perlu disesuaikan",
      explanation:
        "Banyak mitos kacamata dan kebiasaan menatap gadget yang sering kita abaikan tanpa sadar dapat merusak kenyamanan mata jangka panjang.",
      actionAdvice:
        "Baca penjelasan di tiap pertanyaan tadi dan mampir ke Optik I See You untuk konsultasi gratis dengan refraksionis berlisensi kami.",
      topPersona: "learner",
      waMessage: (branchName: string) =>
        `Halo Optik I See You ${branchName}, saya mau konsultasi kesehatan mata dan cara merawat kacamata yang benar di toko.`,
    };
  }, [module.id, userAnswers, totalScore, maxScore]);

  // Curate 3 real frame products from CATALOG_COLLECTIONS based on the result
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
      // default quiet-luxe
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

    // Default curated frames for eye-health and glasses-care
    return [getItem("clarity-1"), getItem("luxury-1"), getItem("metro-1")].filter(Boolean) as CatalogItem[];
  }, [module.id, evaluation.topPersona]);

  // Helper to get collection slug for links
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
          title: `Hasil Kuis Optik I See You: ${evaluation.title}`,
          text: `Saya baru menyelesaikan ${module.title} di Optik I See You dengan hasil: ${evaluation.title}! Coba sekarang:`,
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-300 select-none">
      <div className="rounded-3xl border-2 border-isy-line bg-white p-6 sm:p-10 shadow-xl text-center flex flex-col items-center">
        {/* Trophy / Ribbon Header */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-white shadow-xl flex items-center justify-center text-amber-900">
            <Trophy className="w-10 h-10 text-amber-900" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-isy-green-deep text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-isy-green-deep/10 border border-isy-green-deep/20 text-xs font-black uppercase tracking-wider text-isy-green-deep mb-3 shadow-xs">
          <Award className="w-3.5 h-3.5 text-isy-green-bright" />
          <span>{evaluation.badge}</span>
        </span>

        {/* Title & Subtitle */}
        <h2 className="font-serif text-3xl sm:text-4xl font-black text-isy-green-deep leading-tight">
          {evaluation.title}
        </h2>
        <p className="text-sm font-semibold text-isy-green-bright mt-2">
          {evaluation.subtitle}
        </p>

        {/* Explanation Card */}
        <div className="w-full my-6 p-5 sm:p-6 rounded-2xl bg-isy-mist/70 border border-isy-line text-left space-y-3">
          <p className="text-xs sm:text-sm text-isy-ink/80 leading-relaxed font-medium">
            {evaluation.explanation}
          </p>
          <div className="pt-3 border-t border-isy-line/80 text-xs text-isy-green-deep font-bold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-isy-green-bright shrink-0 mt-0.5" />
            <span className="leading-relaxed">{evaluation.actionAdvice}</span>
          </div>
        </div>

        {/* ── REAL CATALOG FRAME RECOMMENDATIONS SECTION ── */}
        {recommendedFrames.length > 0 && (
          <div className="w-full mt-4 mb-8 pt-6 border-t border-isy-line text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-isy-green-deep/10 text-isy-green-deep text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-isy-green-bright" />
                  <span>Rekomendasi Frame Katalog Resmi</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-isy-green-deep">
                  Koleksi Frame Pilihan Untukmu
                </h3>
                <p className="text-xs text-isy-ink/70 mt-1">
                  Berdasarkan preferensi kuis, siluet dan material frame ini paling harmonis dengan wajahmu.
                </p>
              </div>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-1.5 text-xs font-black text-isy-green-deep hover:text-isy-green-bright transition-colors shrink-0 group"
              >
                <span>Buka Semua Katalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Frame Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedFrames.map((item) => {
                const colSlug = getCollectionSlug(item.collection);
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-isy-line bg-white p-4 shadow-xs hover:shadow-lg hover:border-isy-green-bright/50 transition-all duration-200"
                  >
                    <div>
                      {/* Frame Image Container */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-isy-mist border border-isy-line/60 mb-3">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Badges */}
                        <span className="absolute top-2 left-2 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-black text-isy-green-deep border border-isy-line shadow-xs">
                          {item.collection}
                        </span>
                        <span className="absolute top-2 right-2 rounded-full bg-isy-green-deep/90 text-white px-2 py-0.5 text-[9px] font-bold shadow-xs">
                          {item.style}
                        </span>
                      </div>

                      {/* Details */}
                      <h4 className="font-serif text-sm font-black text-isy-green-deep line-clamp-1 group-hover:text-isy-green-bright transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-isy-ink/65 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Face Shape Match */}
                      {item.recommendedFor && item.recommendedFor.length > 0 && (
                        <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-isy-line/60">
                          <span className="text-[9.5px] font-bold text-isy-ink/50">Cocok:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.recommendedFor.map((shape) => (
                              <span
                                key={shape}
                                className="rounded bg-isy-mist px-1.5 py-0.5 text-[9px] font-extrabold text-isy-green-deep border border-isy-line/80"
                              >
                                {shape}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-isy-line">
                      <Link
                        href={`/try-on?frame=${item.glassesId || "square-frame"}`}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-isy-green-deep text-white text-[10.5px] font-black uppercase tracking-wider hover:bg-isy-green-bright active:scale-95 transition-all shadow-xs text-center"
                      >
                        <Sparkles className="w-3 h-3 text-isy-green-bright shrink-0" />
                        <span>Coba AR</span>
                      </Link>
                      <Link
                        href={`/katalog?cat=${colSlug}`}
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl border border-isy-line bg-isy-mist text-isy-green-deep text-[10.5px] font-bold hover:bg-white hover:border-isy-green-deep/30 active:scale-95 transition-all text-center"
                      >
                        <ExternalLink className="w-3 h-3 text-isy-green-deep/70 shrink-0" />
                        <span>Katalog</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-xl mx-auto space-y-3">
          {/* Main Booking WA Button */}
          <button
            type="button"
            onClick={() => setIsCSModalOpen(true)}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-isy-green-deep text-white text-xs sm:text-sm font-black uppercase tracking-wider hover:bg-isy-green-bright transition-all active:scale-95 shadow-lg shadow-isy-green-deep/20 cursor-pointer group"
          >
            <MessageCircle className="w-4 h-4 text-isy-green-bright group-hover:text-white transition-colors" />
            <span>Booking Cek Mata Gratis (4 Cabang)</span>
          </button>

          {/* AR Try-on Link */}
          <Link
            href="/try-on"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl border-2 border-isy-line bg-white text-isy-green-deep text-xs sm:text-sm font-black uppercase tracking-wider hover:border-isy-green-bright hover:bg-isy-mist transition-all active:scale-95 shadow-xs"
          >
            <Compass className="w-4 h-4 text-isy-green-bright" />
            <span>Eksplor Semua Kacamata di Virtual AR</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secondary Action Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-isy-line bg-white text-isy-ink/70 text-xs font-bold hover:bg-isy-mist transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Kuis</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-isy-line bg-white text-isy-ink/70 text-xs font-bold hover:bg-isy-mist transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copySuccess ? "Link Tersalin!" : "Bagikan Hasil"}</span>
            </button>
          </div>

          {/* Exit Back to Hub */}
          <button
            type="button"
            onClick={onExit}
            className="w-full py-2.5 text-xs font-bold text-isy-ink/60 hover:text-isy-green-deep transition-colors cursor-pointer mt-2"
          >
            Pilih Kuis Lainnya di Hub
          </button>

          {/* Simple Return to Home */}
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-isy-green-deep/70 hover:text-isy-green-deep transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Utama</span>
          </Link>
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

