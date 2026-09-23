"use client";

import React from "react";
import { ChevronLeft, X, Volume2, VolumeX } from "lucide-react";

interface DuolingoProgressBarProps {
  currentStep: number;
  totalSteps: number;
  xpPoints?: number;
  isVoiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onBack: () => void;
  onExit: () => void;
  moduleTitle?: string;
}

export default function DuolingoProgressBar({
  currentStep,
  totalSteps,
  isVoiceEnabled = true,
  onToggleVoice,
  onBack,
  onExit,
  moduleTitle,
}: DuolingoProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, ((currentStep + 1) / totalSteps) * 100));

  return (
    <header className="w-full max-w-2xl mx-auto px-1 py-3 flex items-center justify-between gap-3 select-none">
      {/* Top Left Navigation Button (iOS NavigationBar Style) */}
      <div className="flex items-center">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali ke pertanyaan sebelumnya"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden xs:inline">Kembali</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onExit}
            aria-label="Keluar dari kuis"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Batal</span>
          </button>
        )}
      </div>

      {/* Center: iOS Minimalist Progress Bar */}
      <div className="grow max-w-xs sm:max-w-sm flex flex-col items-center gap-1.5 px-2">
        <div className="flex items-center justify-between w-full text-[11px] font-medium text-slate-500 tracking-tight">
          <span>{moduleTitle ? moduleTitle : "Progress"}</span>
          <span className="tabular-nums font-mono">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-isy-green-deep rounded-full transition-all duration-400 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Right: Audio Control & Exit */}
      <div className="flex items-center gap-1.5">
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            title={isVoiceEnabled ? "Matikan Suara AI" : "Nyalakan Suara AI"}
            aria-label={isVoiceEnabled ? "Matikan Suara" : "Nyalakan Suara"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isVoiceEnabled
                ? "bg-isy-green-deep/10 text-isy-green-deep hover:bg-isy-green-deep/20"
                : "bg-black/5 text-slate-400 hover:bg-black/10"
            }`}
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-4 h-4 text-isy-green-deep" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}

        {currentStep > 0 && (
          <button
            type="button"
            onClick={onExit}
            title="Keluar ke Hub"
            aria-label="Keluar ke Hub"
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
