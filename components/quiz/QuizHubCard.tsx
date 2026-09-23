"use client";

import React from "react";
import { Compass, Eye, Activity, ShieldCheck, Clock, ChevronRight } from "lucide-react";
import { QuizModule } from "@/lib/quiz-data";

interface QuizHubCardProps {
  module: QuizModule;
  onSelect: (module: QuizModule) => void;
}

export default function QuizHubCard({ module, onSelect }: QuizHubCardProps) {
  const getIcon = () => {
    const iconClass = "w-6 h-6 stroke-[1.75]";
    switch (module.iconName) {
      case "Compass":
        return <Compass className={iconClass} />;
      case "Eye":
        return <Eye className={iconClass} />;
      case "Activity":
        return <Activity className={iconClass} />;
      case "ShieldCheck":
        return <ShieldCheck className={iconClass} />;
      default:
        return <Eye className={iconClass} />;
    }
  };

  const getToneClasses = () => {
    switch (module.badgeTone) {
      case "emerald":
        return {
          iconBox: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
          badge: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
          accent: "text-emerald-700",
        };
      case "blue":
        return {
          iconBox: "bg-blue-500/10 text-blue-800 border-blue-500/20",
          badge: "bg-blue-500/10 text-blue-800 border-blue-500/20",
          accent: "text-blue-700",
        };
      case "amber":
        return {
          iconBox: "bg-amber-500/10 text-amber-900 border-amber-500/20",
          badge: "bg-amber-500/10 text-amber-900 border-amber-500/20",
          accent: "text-amber-800",
        };
      case "purple":
        return {
          iconBox: "bg-purple-500/10 text-purple-800 border-purple-500/20",
          badge: "bg-purple-500/10 text-purple-800 border-purple-500/20",
          accent: "text-purple-700",
        };
      default:
        return {
          iconBox: "bg-slate-100 text-slate-800 border-slate-200",
          badge: "bg-slate-100 text-slate-800 border-slate-200",
          accent: "text-slate-700",
        };
    }
  };

  const tone = getToneClasses();

  return (
    <div
      onClick={() => onSelect(module)}
      className="group relative flex flex-col justify-between rounded-3xl border border-black/5 bg-white/90 backdrop-blur-xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-isy-green-deep/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${tone.badge}`}
          >
            {module.badgeLabel}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{module.estimatedMinutes} menit</span>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs ${tone.iconBox}`}
          >
            {getIcon()}
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-isy-green-deep transition-colors">
              {module.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-1">
              {module.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mt-2 mb-6">
          {module.description}
        </p>
      </div>

      {/* iOS Action Row */}
      <div className="pt-4 border-t border-black/5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          {module.questions.length} Pertanyaan
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-isy-green-deep text-white text-xs font-semibold shadow-sm hover:bg-isy-green-bright transition-all active:scale-95 cursor-pointer"
        >
          <span>Mulai Konsultasi</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
