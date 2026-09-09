"use client";

import React from "react";
import { Compass, Eye, Activity, ShieldCheck, Clock, Zap, ArrowRight } from "lucide-react";
import { QuizModule } from "@/lib/quiz-data";

interface QuizHubCardProps {
  module: QuizModule;
  onSelect: (module: QuizModule) => void;
}

export default function QuizHubCard({ module, onSelect }: QuizHubCardProps) {
  const getIcon = () => {
    switch (module.iconName) {
      case "Compass":
        return <Compass className="w-6 h-6" />;
      case "Eye":
        return <Eye className="w-6 h-6" />;
      case "Activity":
        return <Activity className="w-6 h-6" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6" />;
      default:
        return <Eye className="w-6 h-6" />;
    }
  };

  const getToneClasses = () => {
    switch (module.badgeTone) {
      case "emerald":
        return {
          iconBox: "bg-emerald-100/70 text-emerald-800 border-emerald-300/60",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
          hoverBorder: "hover:border-emerald-500/50",
        };
      case "blue":
        return {
          iconBox: "bg-blue-100/70 text-blue-800 border-blue-300/60",
          badge: "bg-blue-50 text-blue-800 border-blue-200",
          hoverBorder: "hover:border-blue-500/50",
        };
      case "amber":
        return {
          iconBox: "bg-amber-100/70 text-amber-900 border-amber-300/60",
          badge: "bg-amber-50 text-amber-900 border-amber-200",
          hoverBorder: "hover:border-amber-500/50",
        };
      case "purple":
        return {
          iconBox: "bg-purple-100/70 text-purple-800 border-purple-300/60",
          badge: "bg-purple-50 text-purple-800 border-purple-200",
          hoverBorder: "hover:border-purple-500/50",
        };
      default:
        return {
          iconBox: "bg-gray-100 text-gray-800 border-gray-300",
          badge: "bg-gray-50 text-gray-800 border-gray-200",
          hoverBorder: "hover:border-isy-green-bright/50",
        };
    }
  };

  const tone = getToneClasses();

  return (
    <div
      onClick={() => onSelect(module)}
      className={`group relative flex flex-col justify-between rounded-3xl border-2 border-isy-line bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${tone.hoverBorder} cursor-pointer`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-xs ${tone.badge}`}
          >
            {module.badgeLabel}
          </span>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-black text-amber-800">
              <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>+{module.xpReward} XP</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-isy-ink/60">
              <Clock className="w-3.5 h-3.5 text-isy-ink/40" />
              <span>{module.estimatedMinutes} mnt</span>
            </div>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs ${tone.iconBox}`}
          >
            {getIcon()}
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-isy-green-deep leading-snug group-hover:text-isy-green-bright transition-colors">
              {module.title}
            </h3>
            <p className="text-xs text-isy-ink/60 font-medium mt-1 leading-relaxed line-clamp-1">
              {module.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-isy-ink/70 leading-relaxed line-clamp-2 mt-2 mb-6">
          {module.description}
        </p>
      </div>

      {/* Chunky Duolingo-style Action Button */}
      <div className="pt-4 border-t border-isy-line flex items-center justify-between">
        <span className="text-xs font-bold text-isy-green-deep">
          {module.questions.length} Pertanyaan
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-isy-green-deep text-white text-xs font-black uppercase tracking-wider shadow-md group-hover:bg-isy-green-bright group-hover:shadow-lg transition-all active:scale-95"
        >
          <span>Mulai Kuis</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
