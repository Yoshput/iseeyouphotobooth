"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  QUIZ_MODULES,
  QuizModule,
  QuizOption,
  QuizQuestionItem,
} from "@/lib/quiz-data";
import DuolingoProgressBar from "@/components/quiz/DuolingoProgressBar";
import VisionScreeningDial from "@/components/quiz/VisionScreeningDial";
import GlassesDetectorModal from "@/components/quiz/GlassesDetectorModal";
import QuizHubCard from "@/components/quiz/QuizHubCard";
import QuizResultCard from "@/components/quiz/QuizResultCard";
import QuizCountdownTimer from "@/components/quiz/QuizCountdownTimer";
import LiveCompanionCam from "@/components/quiz/LiveCompanionCam";
import { speakIndonesian, stopSpeaking, unlockVoiceEngine } from "@/lib/voice";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Scan,
  Timer,
  Compass,
} from "lucide-react";

type QuizViewMode = "hub" | "playing" | "result";

// Helper to randomize options dynamically for each session
function prepareSessionQuestions(questions: QuizQuestionItem[]): QuizQuestionItem[] {
  return questions.map((q) => {
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return {
      ...q,
      options: shuffled,
    };
  });
}

export default function QuizPage() {
  const [viewMode, setViewMode] = useState<QuizViewMode>("hub");
  const [selectedModule, setSelectedModule] = useState<QuizModule | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Interactive diagnostic state
  const [userAnswers, setUserAnswers] = useState<Record<string, QuizOption>>({});
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  // Active Voice & Camera
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [companionStream, setCompanionStream] = useState<MediaStream | null>(null);

  // Glasses AI Scanner
  const [isDetectorOpen, setIsDetectorOpen] = useState(false);
  const [isGlassesVerified, setIsGlassesVerified] = useState(false);
  const [detectorEnabled, setDetectorEnabled] = useState(true);

  // Check if active quiz is Frame DNA (style-persona)
  const isFrameDNA = selectedModule?.id === "style-persona";

  // Stop audio on unmount or page change
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Notify Navbar to hide mobile bottom navbar ONLY during active quiz gameplay
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (viewMode === "playing") {
        document.body.setAttribute("data-quiz-playing", "true");
      } else {
        document.body.removeAttribute("data-quiz-playing");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-quiz-playing");
      }
    };
  }, [viewMode]);

  // Active question derived from shuffled session questions
  const activeQuestion: QuizQuestionItem | null =
    sessionQuestions.length > 0 && sessionQuestions[currentQIndex]
      ? sessionQuestions[currentQIndex]
      : selectedModule
      ? selectedModule.questions[currentQIndex]
      : null;

  // Speak question automatically when question changes in playing mode
  useEffect(() => {
    if (viewMode === "playing" && activeQuestion && isVoiceEnabled) {
      speakIndonesian(activeQuestion.title);
    }
  }, [viewMode, activeQuestion, isVoiceEnabled]);

  // Start a Quiz from Hub
  const handleSelectModule = (module: QuizModule) => {
    unlockVoiceEngine();
    setSelectedModule(module);
    if (detectorEnabled && !isGlassesVerified) {
      setIsDetectorOpen(true);
      if (isVoiceEnabled) {
        speakIndonesian("Selamat datang di kalibrasi kacamata Optik I See You. Silakan posisikan wajah di depan kamera.");
      }
    } else {
      startQuizSession(module);
    }
  };

  const startQuizSession = (module: QuizModule, stream?: MediaStream | null) => {
    unlockVoiceEngine();
    const shuffled = prepareSessionQuestions(module.questions);
    setSelectedModule(module);
    setSessionQuestions(shuffled);
    setCurrentQIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setIsTimedOut(false);
    setCurrentScore(0);
    if (stream) setCompanionStream(stream);
    setViewMode("playing");

    if (isVoiceEnabled) {
      speakIndonesian(
        `Memulai ${module.title}. Pertanyaan pertama: ${shuffled[0].title}`
      );
    }
  };

  const handleDetectorProceed = (glassesDetected: boolean, stream?: MediaStream | null) => {
    unlockVoiceEngine();
    setIsGlassesVerified(glassesDetected);
    setIsDetectorOpen(false);
    if (selectedModule) {
      startQuizSession(selectedModule, stream);
    }
  };

  // Option selection
  const handleOptionClick = (option: QuizOption) => {
    unlockVoiceEngine();
    if (!isFrameDNA && isAnswerConfirmed) return;
    setSelectedOption(option);
  };

  // Timeout handler when 20 seconds run out
  const handleTimeout = () => {
    if (isAnswerConfirmed || !selectedModule) return;

    if (isFrameDNA) {
      setIsTimedOut(true);
      if (isVoiceEnabled) {
        speakIndonesian("Waktu 20 detik selesai. Silakan tentukan preferensi gayamu.");
      }
      return;
    }

    setIsTimedOut(true);
    setIsAnswerConfirmed(true);

    if (isVoiceEnabled) {
      speakIndonesian("Waktu habis. Mari perhatikan pembahasan optik berikut.");
    }
  };

  // Confirm and advance
  const handleConfirmAnswer = () => {
    unlockVoiceEngine();
    if (!selectedModule || !activeQuestion) return;

    // Frame DNA flow: pure preference mapping
    if (isFrameDNA) {
      if (!selectedOption) return;

      const newAnswers = { ...userAnswers, [activeQuestion.id]: selectedOption };
      setUserAnswers(newAnswers);
      setCurrentScore((prev) => prev + 25);
      goToNextStep(newAnswers);
      return;
    }

    // Standard Educational / Screening Quizzes flow:
    if (!selectedOption && isTimedOut) {
      goToNextStep();
      return;
    }

    if (!selectedOption) return;

    const newAnswers = { ...userAnswers, [activeQuestion.id]: selectedOption };
    setUserAnswers(newAnswers);

    const optionScore = selectedOption.scoreWeight ?? 0;
    setCurrentScore((prev) => prev + optionScore);

    const hasFeedback = Boolean(selectedOption.explanation || selectedOption.isCorrect !== undefined);

    if (hasFeedback && !isAnswerConfirmed) {
      setIsAnswerConfirmed(true);
      if (isVoiceEnabled && selectedOption.explanation) {
        speakIndonesian(
          selectedOption.isCorrect
            ? `Tepat sekali. ${selectedOption.explanation}`
            : `Perhatikan: ${selectedOption.explanation}`
        );
      }
      return;
    }

    goToNextStep(newAnswers);
  };

  const goToNextStep = (finalAnswers?: Record<string, QuizOption>) => {
    const totalQuestions = sessionQuestions.length || selectedModule?.questions.length || 0;

    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerConfirmed(false);
      setIsTimedOut(false);
    } else {
      stopSpeaking();
      setViewMode("result");
    }
  };

  const handleBackQuestion = () => {
    if (currentQIndex > 0) {
      stopSpeaking();
      setCurrentQIndex((prev) => prev - 1);
      setSelectedOption(null);
      setIsAnswerConfirmed(false);
      setIsTimedOut(false);
    }
  };

  const handleExitQuiz = () => {
    stopSpeaking();
    setViewMode("hub");
    setSelectedModule(null);
    setSessionQuestions([]);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setIsTimedOut(false);
  };

  const toggleVoice = () => {
    unlockVoiceEngine();
    if (isVoiceEnabled) {
      stopSpeaking();
      setIsVoiceEnabled(false);
    } else {
      setIsVoiceEnabled(true);
      if (activeQuestion) {
        speakIndonesian(activeQuestion.title);
      }
    }
  };

  return (
    <main className="min-h-screen bg-isy-ivory text-isy-ink select-none flex flex-col justify-between">
      <Navbar />

      {/* ── 1. HUB VIEW ── */}
      {viewMode === "hub" && (
        <div className="pt-4 sm:pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          {/* Top Bar with Home Return Link strictly on TOP LEFT */}
          <div className="flex items-center justify-between w-full mb-6 sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-xs font-semibold text-slate-700 hover:text-isy-green-deep hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali ke Beranda</span>
            </Link>

            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              Optik I See You • Vision &amp; Frame Lab
            </span>
          </div>

          {/* Hero Header (Apple Editorial Style) */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-3.5 py-1 text-xs font-semibold text-slate-700 mb-3">
              <span>Vision &amp; Style Diagnostic</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3">
              Konsultasi &amp; Skrining Penglihatan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
              Pilih modul analisis Frame DNA, skrining refraksi mandiri, atau uji wawasan kesehatan mata harian Anda.
            </p>

            {/* iOS Sensor Switch */}
            <div className="mt-6 inline-flex items-center justify-center gap-3 p-2 px-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Scan className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="text-left text-xs pr-2">
                <span className="font-semibold text-slate-900 block">
                  Sensor Kacamata AI
                </span>
                <span className="text-[10px] text-slate-400">
                  {detectorEnabled ? "Pindai wajah & aktifkan Focus Cam" : "Mulai langsung tanpa kamera"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetectorEnabled(!detectorEnabled)}
                aria-label="Toggle sensor kacamata"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  detectorEnabled ? "bg-isy-green-deep" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    detectorEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4 Diagnostic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {QUIZ_MODULES.map((module) => (
              <QuizHubCard
                key={module.id}
                module={module}
                onSelect={handleSelectModule}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 2. PLAYING VIEW ── */}
      {viewMode === "playing" && selectedModule && activeQuestion && (
        <div className="pt-2 sm:pt-4 pb-44 sm:pb-36 px-4 max-w-2xl mx-auto w-full grow flex flex-col justify-between">
          <div>
            {/* iOS Top Navigation Bar with Progress and Sound */}
            <DuolingoProgressBar
              currentStep={currentQIndex}
              totalSteps={sessionQuestions.length || selectedModule.questions.length}
              moduleTitle={selectedModule.badgeLabel}
              isVoiceEnabled={isVoiceEnabled}
              onToggleVoice={toggleVoice}
              onBack={handleBackQuestion}
              onExit={handleExitQuiz}
            />

            {/* Question Header with Timer */}
            <div className="mt-4 mb-4">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">
                  {isFrameDNA ? "Analisis Frame DNA" : selectedModule.title}
                </span>

                <QuizCountdownTimer
                  durationSeconds={20}
                  isPaused={(!isFrameDNA && isAnswerConfirmed) || viewMode !== "playing"}
                  onTimeout={handleTimeout}
                  resetKey={activeQuestion.id}
                />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                {activeQuestion.title}
              </h2>
              {activeQuestion.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  {activeQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Timeout Alert Banner */}
            {isTimedOut && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium mb-4 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <Timer className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isFrameDNA
                    ? "Waktu 20 detik selesai. Silakan pilih opsi karaktermu untuk melanjutkan."
                    : "Waktu 20 detik berakhir. Pelajari ulasan optik di bawah untuk melanjutkan."}
                </span>
              </div>
            )}

            {/* Interactive Visual Testing */}
            {activeQuestion.type === "astigmatic-dial" && (
              <VisionScreeningDial type="astigmatic-dial" />
            )}
            {activeQuestion.type === "duochrome-test" && (
              <VisionScreeningDial type="duochrome-test" />
            )}

            {/* iOS Selection Option Cards */}
            <div className="space-y-2.5 sm:space-y-3 mt-3.5 sm:mt-5">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOption?.id === option.id;
                const letter = String.fromCharCode(65 + idx);

                let btnClass =
                  "border border-black/5 bg-white/90 text-slate-700 hover:border-black/15 hover:bg-white active:scale-[0.99] shadow-[0_1px_4px_rgba(0,0,0,0.02)]";

                if (isFrameDNA) {
                  if (isSelected) {
                    btnClass =
                      "border-isy-green-deep bg-emerald-50/50 text-slate-900 font-medium shadow-sm ring-1 ring-isy-green-deep/20";
                  }
                } else {
                  if (isSelected) {
                    btnClass =
                      "border-isy-green-deep bg-emerald-50/50 text-slate-900 font-medium shadow-sm";
                  }
                  if (isAnswerConfirmed) {
                    if (option.isCorrect) {
                      btnClass =
                        "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
                    } else if (isSelected && option.isCorrect === false) {
                      btnClass =
                        "border-rose-400 bg-rose-50 text-rose-950 font-medium";
                    }
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl flex items-start gap-3 text-left transition-all duration-200 cursor-pointer ${btnClass}`}
                  >
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-isy-green-deep text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed grow pt-0.5">
                      {option.text}
                    </span>

                    {/* iOS Status Indicator */}
                    {isFrameDNA ? (
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected ? "border-isy-green-deep bg-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-isy-green-deep animate-in zoom-in-50 duration-150" />
                        )}
                      </div>
                    ) : (
                      <>
                        {isAnswerConfirmed && option.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {isAnswerConfirmed && isSelected && option.isCorrect === false && (
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* iOS Floating Bottom Bar with Explanation & Primary CTA */}
          <div className="fixed bottom-0 inset-x-0 bg-white/85 backdrop-blur-2xl border-t border-black/5 p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
              {/* Feedback / Educational Drawer */}
              <div className="w-full sm:grow text-left">
                {isFrameDNA ? (
                  <div className="text-[11px] sm:text-xs p-2.5 rounded-2xl bg-slate-50 border border-black/5 text-slate-600 leading-relaxed flex items-center gap-2">
                    <Compass className="w-4 h-4 text-isy-green-deep shrink-0 stroke-[1.75]" />
                    <div>
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Analisis Karakter Frame:
                      </span>
                      <span>
                        {selectedOption
                          ? "Preferensi tersimpan. Lanjut untuk rekomendasi koleksi yang tepat."
                          : "Pilih salah satu kebiasaan harian di atas untuk melanjutkan."}
                      </span>
                    </div>
                  </div>
                ) : (
                  isAnswerConfirmed && (selectedOption?.explanation || isTimedOut) && (
                    <div className="text-[11px] sm:text-xs p-2.5 rounded-2xl bg-slate-50 border border-black/5 text-slate-700 leading-relaxed animate-in fade-in duration-200">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Ulasan Refraksi &amp; Kesehatan:
                      </span>
                      {selectedOption?.explanation ||
                        "Pemahaman refraksi dan kesehatan mata dibangun dari mengenali tanda-tanda visual harian."}
                    </div>
                  )
                )}
              </div>

              {/* Primary Action Button (Apple Pill Style) */}
              <button
                type="button"
                disabled={!selectedOption && !isTimedOut}
                onClick={handleConfirmAnswer}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  selectedOption || isTimedOut
                    ? "bg-isy-green-deep text-white hover:bg-isy-green-bright active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>
                  {isFrameDNA
                    ? currentQIndex < (sessionQuestions.length || selectedModule.questions.length) - 1
                      ? "Lanjut ke Pertanyaan Berikutnya"
                      : "Lihat Hasil Analisis Frame DNA"
                    : isAnswerConfirmed
                    ? currentQIndex < (sessionQuestions.length || selectedModule.questions.length) - 1
                      ? "Pertanyaan Berikutnya"
                      : "Lihat Hasil Konsultasi"
                    : "Konfirmasi Jawaban"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Companion Cam */}
          <LiveCompanionCam
            stream={companionStream}
            onToggleCam={() => setCompanionStream(null)}
          />
        </div>
      )}

      {/* ── 3. RESULT VIEW ── */}
      {viewMode === "result" && selectedModule && (
        <div className="pt-4 sm:pt-8 pb-20 px-4 w-full">
          <QuizResultCard
            module={selectedModule}
            userAnswers={userAnswers}
            totalScore={currentScore}
            maxScore={(sessionQuestions.length || selectedModule.questions.length) * 25}
            onRestart={() => startQuizSession(selectedModule, companionStream)}
            onExit={handleExitQuiz}
          />
        </div>
      )}

      {/* ── 4. GLASSES DETECTOR MODAL ── */}
      <GlassesDetectorModal
        isOpen={isDetectorOpen}
        onClose={() => setIsDetectorOpen(false)}
        onProceed={handleDetectorProceed}
        isVoiceEnabled={isVoiceEnabled}
      />
    </main>
  );
}
