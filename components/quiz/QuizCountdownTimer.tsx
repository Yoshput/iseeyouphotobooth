"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface QuizCountdownTimerProps {
  durationSeconds?: number;
  isPaused: boolean;
  onTimeout: () => void;
  resetKey: string | number;
}

export default function QuizCountdownTimer({
  durationSeconds = 20,
  isPaused,
  onTimeout,
  resetKey,
}: QuizCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  // Reset timer whenever resetKey (question ID) changes
  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [resetKey, durationSeconds]);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isPaused, onTimeout]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100));

  // iOS Subtle Color Dynamics
  let colorClass = "text-slate-600 border-black/5 bg-black/5";
  let barColor = "bg-isy-green-deep";

  if (timeLeft <= 4) {
    colorClass = "text-rose-600 border-rose-200 bg-rose-50";
    barColor = "bg-rose-500";
  } else if (timeLeft <= 8) {
    colorClass = "text-amber-700 border-amber-200 bg-amber-50";
    barColor = "bg-amber-500";
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors duration-300 ${colorClass}`}
      >
        <Timer className="w-3.5 h-3.5 shrink-0 opacity-80" />
        <span className="tabular-nums font-mono font-semibold">{timeLeft}s</span>
      </div>

      {/* Mini Progress Track */}
      <div className="w-12 sm:w-16 h-1 bg-black/5 rounded-full overflow-hidden hidden sm:block">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
