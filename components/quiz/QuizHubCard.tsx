"use client";

import React from "react";
import { Clock, ChevronRight } from "lucide-react";
import { QuizModule } from "@/lib/quiz-data";

interface QuizHubCardProps {
  module: QuizModule;
  onSelect: (module: QuizModule) => void;
}

export default function QuizHubCard({ module, onSelect }: QuizHubCardProps) {
  return (
    <div
      onClick={() => onSelect(module)}
      className="group relative flex flex-col justify-between rounded-3xl border border-black/5 bg-white/95 backdrop-blur-xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-isy-green-deep/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none"
    >
      <div>
        {/* Top Meta: Questions Count & Estimated Time */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {module.questions.length} Pertanyaan
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{module.estimatedMinutes} menit</span>
          </div>
        </div>

        {/* Title & Tagline — Clean, modern, editorial */}
        <div className="mb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-isy-green-deep transition-colors">
            {module.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            {module.tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mt-2 mb-6">
          {module.description}
        </p>
      </div>

      {/* Action Row */}
      <div className="pt-4 border-t border-black/5 flex items-center justify-end">
        <div
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-isy-green-deep text-white text-xs font-semibold shadow-sm group-hover:bg-isy-green-bright transition-all active:scale-95"
        >
          <span>Mulai Konsultasi</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
