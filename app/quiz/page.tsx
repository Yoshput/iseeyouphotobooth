"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { QUIZ_QUESTIONS, PERSONAS, QuizPersona, PersonaResult } from "@/lib/quiz";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import ContactCSModal from "@/components/ui/ContactCSModal";

type QuizState = "intro" | "question" | "result";

export default function QuizPage() {
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<QuizPersona, number>>({
    "quiet-luxe": 0,
    "bold-statement": 0,
    "everyday-chic": 0,
    "the-dreamer": 0,
  });
  const [result, setResult] = useState<PersonaResult | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCSModalOpen, setIsCSModalOpen] = useState(false);

  const startQuiz = () => {
    setQuizState("question");
    setCurrentQ(0);
    setScores({
      "quiet-luxe": 0,
      "bold-statement": 0,
      "everyday-chic": 0,
      "the-dreamer": 0,
    });
  };

  const handleAnswer = (answerScores: Partial<Record<QuizPersona, number>>) => {
    if (isTransitioning) return;

    // Update scores
    const newScores = { ...scores };
    Object.entries(answerScores).forEach(([persona, score]) => {
      newScores[persona as QuizPersona] += score;
    });
    setScores(newScores);

    setIsTransitioning(true);
    setTimeout(() => {
      if (currentQ < QUIZ_QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        setIsTransitioning(false);
      } else {
        // Calculate result
        let maxScore = -1;
        let topPersona: QuizPersona = "quiet-luxe"; // fallback
        
        Object.entries(newScores).forEach(([persona, score]) => {
          if (score > maxScore) {
            maxScore = score;
            topPersona = persona as QuizPersona;
          }
        });
        
        const matchedPersona = PERSONAS.find(p => p.id === topPersona) || PERSONAS[0];
        setResult(matchedPersona);
        setQuizState("result");
        setIsTransitioning(false);
      }
    }, 200);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQ(currentQ - 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      setQuizState("intro");
    }
  };

  const generateShareCard = async (persona: PersonaResult) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient (dark green)
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, "#071C12");
    gradient.addColorStop(0.5, "#0E3B27");
    gradient.addColorStop(1, "#116B3C");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative circle
    ctx.beginPath();
    ctx.arc(900, 200, 300, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(17, 107, 60, 0.3)";
    ctx.fill();

    // Text: Brand name at top
    ctx.font = "bold 36px serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("optikiseeyou.com", 540, 100);

    // Frame DNA label
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = "#4ade80"; // green-400
    ctx.fillText("Frame DNA Result", 540, 700);

    // Persona name (big)
    ctx.font = "bold 96px serif";
    ctx.fillStyle = "#FFFFFF";
    
    // Word wrap for long names
    const words = persona.name.split(" ");
    let line = "";
    let y = 830;
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && line !== "") {
        ctx.fillText(line, 540, y);
        line = word + " ";
        y += 110;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Tagline
    ctx.font = "42px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(persona.tagline, 540, y + 140);

    // URL at bottom
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#4ade80";
    ctx.fillText("optikiseeyou.com/quiz", 540, 1820);

    // Download
    const link = document.createElement("a");
    link.download = `frame-dna-${persona.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071C12] via-[#0E3B27] to-[#116B3C] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Top Left: Back to Home Button (Always visible on all quiz states) */}
      <div className="absolute top-6 left-6 z-40">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-xs hover:border-white/40 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
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

      {/* INTRO STATE */}
      {quizState === "intro" && (
        <div className="w-full max-w-md p-6 flex flex-col items-center text-center animate-fade-in z-10 pt-16 sm:pt-0">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo-white.webp"
              alt="Optik I See You"
              width={200}
              height={69}
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Frame DNA</h1>

          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-sm mx-auto">
            Temukan Kacamata yang Mencerminkan Kepribadianmu
          </p>
          <button 
            onClick={startQuiz}
            className="w-full max-w-xs py-4 px-8 bg-isy-green-bright hover:bg-green-400 text-isy-ink font-bold rounded-full text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.4)] cursor-pointer"
          >
            Mulai Quiz &rarr;
          </button>
          <p className="mt-6 text-sm text-white/50">&sim;5 menit</p>
        </div>
      )}

      {/* QUESTION STATE */}
      {quizState === "question" && (
        <div className="w-full max-w-2xl px-6 py-12 flex flex-col min-h-screen pt-20">
          {/* Header & Progress */}
          <div className="w-full mb-8 pt-4">
            {currentQ > 0 ? (
              <button 
                onClick={handleBack}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer mb-6"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Pertanyaan Sebelumnya</span>
              </button>
            ) : (
              <div className="h-9 mb-6" />
            )}
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-isy-green-bright h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQ) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
            <p className="text-sm font-medium text-isy-green-bright tracking-widest uppercase">
              Pertanyaan {currentQ + 1} dari {QUIZ_QUESTIONS.length}
            </p>
          </div>


          {/* Question Content */}
          <div 
            className={`flex-1 flex flex-col justify-center transition-all duration-200 ease-in-out ${
              isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-10 leading-tight">
              {QUIZ_QUESTIONS[currentQ].question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUIZ_QUESTIONS[currentQ].answers.map((ans, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(ans.scores)}
                  className="min-h-[96px] w-full p-5 text-left border border-white/15 bg-white/[0.04] backdrop-blur-md rounded-2xl hover:border-isy-green-bright hover:bg-white/[0.12] transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] group flex items-center gap-4 cursor-pointer"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-emerald-300 border border-white/20 group-hover:bg-isy-green-bright group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm md:text-base font-semibold text-white/90 group-hover:text-white transition-colors leading-snug">
                    {ans.text}
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* RESULT STATE */}
      {quizState === "result" && result && (
        <div className="w-full max-w-3xl px-6 py-12 flex flex-col items-center animate-fade-in min-h-screen pt-20">
          <p className="text-isy-green-bright font-bold tracking-widest uppercase mb-2">Frame DNA Kamu Adalah</p>
          <h1 
            className="text-5xl md:text-6xl font-serif font-bold mb-4 text-center"
            style={{ color: result.primaryColor === '#1A1A2E' || result.primaryColor === '#2D6A4F' ? '#4ade80' : result.primaryColor }} // Ensuring contrast
          >
            {result.name}
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-6 text-center text-white/90">
            "{result.tagline}"
          </p>
          <p className="text-lg text-white/70 text-center max-w-2xl mb-10 leading-relaxed">
            {result.description}
          </p>

          <button 
            onClick={() => generateShareCard(result)}
            className="mb-12 py-3 px-6 rounded-full border border-isy-green-bright text-isy-green-bright hover:bg-isy-green-bright hover:text-isy-ink transition-colors flex items-center gap-2 font-medium"
          >
            Download & Share ke Story &darr;
          </button>

          <div className="w-full h-px bg-white/20 mb-12"></div>

          <h3 className="text-2xl font-serif font-bold mb-6 self-start">Frame yang Cocok Buat Kamu:</h3>
          
          <div className="w-full flex overflow-x-auto pb-6 gap-4 md:grid md:grid-cols-3 md:overflow-visible hide-scrollbar snap-x">
            {CATALOG_COLLECTIONS.filter(c => result.collectionIds.includes(c.id)).map(collection => (
              <div key={collection.id} className="min-w-[240px] w-[240px] md:w-full flex-shrink-0 snap-start bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-colors">
                <div className="relative aspect-square w-full">
                  <Image 
                    src={collection.coverImage}
                    alt={collection.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-1 line-clamp-1">{collection.title}</h4>
                  <p className="text-sm text-white/60 mb-4">{collection.badge}</p>
                  <Link 
                    href={`/katalog?tab=frame&cat=${collection.id}`}
                    className="block w-full text-center py-2 bg-white text-isy-ink rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Lihat Koleksi
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4 mt-10 justify-center">
            <button
              onClick={() => setIsCSModalOpen(true)}
              className="py-4 px-8 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Tanya CS via WhatsApp
            </button>
            <button
              onClick={() => setQuizState("intro")}
              className="py-4 px-8 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* CS Modal */}
      <ContactCSModal 
        isOpen={isCSModalOpen} 
        onClose={() => setIsCSModalOpen(false)} 
        productName={result ? `Hasil Kuis Frame DNA: ${result.name}` : "Kuis Frame DNA"}
      />

    </div>
  );
}
