"use client";

import React from "react";
import { ArrowLeft, Zap, X, Volume2, VolumeX } from "lucide-react";

interface DuolingoProgressBarProps {
  currentStep: number;
  totalSteps: number;
  xpPoints: number;
  isVoiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onBack: () => void;
  onExit: () => void;
}

export default function DuolingoProgressBar({
  currentStep,
  totalSteps,
  xpPoints,
  isVoiceEnabled = true,
  onToggleVoice,
  onBack,
  onExit,
}: DuolingoProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, ((currentStep + 1) / totalSteps) * 100));

  return (
    <header className="w-full max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 select-none">
      {/* Back / Exit Buttons */}
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke pertanyaan sebelumnya"
          className="p-2 rounded-xl text-isy-ink/60 hover:text-isy-green-deep hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onExit}
          aria-label="Keluar dari kuis"
          className="p-2 rounded-xl text-isy-ink/60 hover:text-isy-green-deep hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Duolingo-inspired Tactile Rounded Progress Track */}
      <div className="grow relative h-3.5 sm:h-4 bg-black/10 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-isy-green-bright to-isy-green-deep rounded-full transition-all duration-300 ease-out relative shadow-sm"
          style={{ width: `${percentage}%` }}
        >
          {/* Subtle top gloss line */}
          <div className="absolute top-0.5 inset-x-1.5 h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Step & XP Badge & Voice Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            title={isVoiceEnabled ? "Matikan Suara AI" : "Nyalakan Suara AI"}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isVoiceEnabled
                ? "bg-isy-green-deep/10 border-isy-green-deep/30 text-isy-green-deep"
                : "bg-gray-100 border-gray-200 text-gray-400"
            }`}
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-4 h-4 text-isy-green-deep" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}

        <span className="text-xs font-bold text-isy-ink/60 hidden sm:inline">
          {currentStep + 1} / {totalSteps}
        </span>
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-black text-amber-700 shadow-xs">
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>+{xpPoints} XP</span>
        </div>
      </div>
    </header>
  );
}
