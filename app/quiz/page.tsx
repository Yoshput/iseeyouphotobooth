"use client";

import React, { useState, useEffect, useRef } from "react";
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
  HelpCircle,
  Sparkles,
  ArrowRight,
  Scan,
  Glasses,
  ShieldCheck,
  Award,
  Timer,
  Volume2,
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

  // Gamified interactive state
  const [userAnswers, setUserAnswers] = useState<Record<string, QuizOption>>({});
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  // AI Active Voice & Camera
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
        speakIndonesian("Selamat datang di kalibrasi kacamata Optik I See You. Silakan posisikan wajahmu di depan kamera.");
      }
    } else {
      startQuizSession(module);
    }
  };

  const startQuizSession = (module: QuizModule, stream?: MediaStream | null) => {
    unlockVoiceEngine();
    // Shuffle options dynamically for every quiz session
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
        `Memulai ${module.title}. Soal nomor satu: ${shuffled[0].title}`
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
      // In Frame DNA, gentle timeout prompt without fail state
      setIsTimedOut(true);
      if (isVoiceEnabled) {
        speakIndonesian("Waktu 20 detik selesai. Silakan tentukan preferensi gayamu.");
      }
      return;
    }

    setIsTimedOut(true);
    setIsAnswerConfirmed(true);

    if (isVoiceEnabled) {
      speakIndonesian("Waktu habis! Mari perhatikan pembahasan optik berikut.");
    }
  };

  // Confirm and advance
  const handleConfirmAnswer = () => {
    unlockVoiceEngine();
    if (!selectedModule || !activeQuestion) return;

    // Frame DNA flow: pure preference mapping without right/wrong grading
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
            ? `Tepat sekali! ${selectedOption.explanation}`
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
        <div className="pt-6 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          {/* Hero Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-isy-green-deep/10 border border-isy-green-deep/20 px-4 py-1 text-xs font-black uppercase tracking-wider text-isy-green-deep mb-3 shadow-xs">
              <Award className="w-3.5 h-3.5 text-isy-green-bright" />
              <span>I See You Quiz &amp; Eye Lab</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-isy-green-deep tracking-tight mb-3">
              Asah Otak &amp; Skrining Mata
            </h1>
            <p className="text-xs sm:text-sm text-isy-ink/70 leading-relaxed">
              Dilengkapi Active AI Voice, timer hitung mundur 20 detik, serta uji visual interaktif untuk menguji kesehatan mata dan menemukan kacamata impianmu.
            </p>

            {/* AI Glasses Detector Toggle Switch */}
            <div className="mt-6 inline-flex items-center justify-center gap-3 p-2 rounded-2xl bg-white border border-isy-line shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-isy-green-deep/10 flex items-center justify-center text-isy-green-deep">
                <Scan className="w-4 h-4" />
              </div>
              <div className="text-left text-xs pr-2">
                <span className="font-bold text-isy-green-deep block">
                  Mode Sensor Kacamata
                </span>
                <span className="text-[10px] text-isy-ink/50">
                  {detectorEnabled ? "Pindai wajah & aktifkan live focus cam" : "Langsung mulai tanpa kamera"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetectorEnabled(!detectorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  detectorEnabled ? "bg-isy-green-deep" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    detectorEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4 Quiz Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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

      {/* ── 2. PLAYING VIEW (DUOLINGO STYLE / FRAME DNA) ── */}
      {viewMode === "playing" && selectedModule && activeQuestion && (
        <div className="pt-2 sm:pt-4 pb-48 sm:pb-36 px-4 max-w-2xl mx-auto w-full grow flex flex-col justify-between">
          <div>
            {/* Gamified Top Progress Bar with Voice Toggle */}
            <DuolingoProgressBar
              currentStep={currentQIndex}
              totalSteps={sessionQuestions.length || selectedModule.questions.length}
              xpPoints={selectedModule.xpReward}
              isVoiceEnabled={isVoiceEnabled}
              onToggleVoice={toggleVoice}
              onBack={handleBackQuestion}
              onExit={handleExitQuiz}
            />

            {/* Question Card Header with 20s Countdown Timer */}
            <div className="mt-5 mb-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-isy-green-bright bg-isy-green-bright/10 px-3 py-1 rounded-full inline-block">
                  {isFrameDNA ? "Analisis Frame DNA" : selectedModule.title}
                </span>

                {/* 20s Countdown Timer */}
                <QuizCountdownTimer
                  durationSeconds={20}
                  isPaused={(!isFrameDNA && isAnswerConfirmed) || viewMode !== "playing"}
                  onTimeout={handleTimeout}
                  resetKey={activeQuestion.id}
                />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-isy-green-deep leading-snug">
                {activeQuestion.title}
              </h2>
              {activeQuestion.subtitle && (
                <p className="text-xs sm:text-sm text-isy-ink/70 mt-2 leading-relaxed">
                  {activeQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Timeout Banner Notification */}
            {isTimedOut && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold mb-4 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <Timer className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isFrameDNA
                    ? "Waktu 20 detik selesai. Tentukan pilihan karaktermu di bawah untuk lanjut."
                    : "Waktu 20 detik telah berakhir! Pelajari rangkuman optik di bawah untuk lanjut."}
                </span>
              </div>
            )}

            {/* Interactive Visual Testing (Astigmatic Dial or Duochrome Test) */}
            {activeQuestion.type === "astigmatic-dial" && (
              <VisionScreeningDial type="astigmatic-dial" />
            )}
            {activeQuestion.type === "duochrome-test" && (
              <VisionScreeningDial type="duochrome-test" />
            )}

            {/* Chunky Options with Shuffled A, B, C, D Badges */}
            <div className="space-y-2.5 sm:space-y-3 mt-3.5 sm:mt-5">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOption?.id === option.id;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                let btnClass = "border-2 bg-white text-isy-ink/80 border-isy-line hover:border-isy-green-bright/60 hover:bg-isy-mist/40";

                if (isFrameDNA) {
                  // Frame DNA: Pure preference selection (NO right/wrong exam styling)
                  if (isSelected) {
                    btnClass = "border-2 border-isy-green-deep bg-isy-green-deep/10 text-isy-green-deep font-bold shadow-sm scale-[1.01] ring-2 ring-isy-green-deep/20";
                  }
                } else {
                  // Standard / Screening Quizzes: Duolingo feedback styling
                  if (isSelected) {
                    btnClass = "border-2 border-isy-green-deep bg-isy-green-deep/5 text-isy-green-deep font-bold shadow-sm scale-[1.01]";
                  }
                  if (isAnswerConfirmed) {
                    if (option.isCorrect) {
                      btnClass = "border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                    } else if (isSelected && option.isCorrect === false) {
                      btnClass = "border-2 border-amber-500 bg-amber-50 text-amber-900 font-bold";
                    }
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`w-full p-3 sm:p-4 rounded-2xl flex items-start gap-3 text-left transition-all duration-200 cursor-pointer ${btnClass}`}
                  >
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-colors ${
                        isSelected
                          ? "bg-isy-green-deep text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed grow pt-0.5">
                      {option.text}
                    </span>

                    {/* Status Indicator: Radio Dot for Frame DNA, or Check/X for Educational */}
                    {isFrameDNA ? (
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected ? "border-isy-green-deep bg-white" : "border-gray-300"
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
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Bar with Chunky Feedback & Action */}
          <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-isy-line p-2.5 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
              {/* Feedback Drawer */}
              <div className="w-full sm:grow text-left">
                {isFrameDNA ? (
                  <div className="text-[11px] sm:text-xs p-2 sm:p-2.5 rounded-xl bg-isy-mist border border-isy-line text-isy-ink/80 leading-relaxed animate-in fade-in duration-200 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-isy-green-deep shrink-0" />
                    <div>
                      <span className="font-bold text-isy-green-deep block mb-0.5">
                        Preferensi Frame DNA:
                      </span>
                      <span>
                        {selectedOption
                          ? "Pilihanmu diselaraskan dengan siluet dan material frame katalog resmi."
                          : "Pilih salah satu kebiasaan harianmu di atas untuk lanjut."}
                      </span>
                    </div>
                  </div>
                ) : (
                  isAnswerConfirmed && (selectedOption?.explanation || isTimedOut) && (
                    <div className="text-[11px] sm:text-xs p-2 sm:p-2.5 rounded-xl bg-isy-mist border border-isy-line text-isy-ink/80 leading-relaxed animate-in fade-in duration-200">
                      <span className="font-bold text-isy-green-deep block mb-0.5">
                        Penjelasan Optik:
                      </span>
                      {selectedOption?.explanation ||
                        "Fokus dan pemahaman kesehatan mata bertahap dibentuk dari mengenali prinsip optik harian."}
                    </div>
                  )
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={!selectedOption && !isTimedOut}
                onClick={handleConfirmAnswer}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                  selectedOption || isTimedOut
                    ? "bg-gradient-to-r from-isy-green-bright to-isy-green-deep text-white hover:scale-102 hover:shadow-lg active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
                      : "Lihat Hasil Akhir"
                    : "Periksa Jawaban"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Floating Live Companion Cam HUD */}
          <LiveCompanionCam
            stream={companionStream}
            onToggleCam={() => setCompanionStream(null)}
          />
        </div>
      )}

      {/* ── 3. RESULT VIEW ── */}
      {viewMode === "result" && selectedModule && (
        <div className="pt-6 sm:pt-10 pb-20 px-4 w-full">
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
