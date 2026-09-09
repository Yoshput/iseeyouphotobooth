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

  // Color dynamics
  let colorClass = "text-isy-green-deep border-isy-line bg-white";
  let barColor = "bg-isy-green-bright";
  let pulseClass = "";

  if (timeLeft <= 4) {
    colorClass = "text-rose-600 border-rose-300 bg-rose-50";
    barColor = "bg-rose-500";
    pulseClass = "animate-pulse";
  } else if (timeLeft <= 8) {
    colorClass = "text-amber-700 border-amber-300 bg-amber-50";
    barColor = "bg-amber-500";
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black shadow-xs transition-colors duration-300 ${colorClass} ${pulseClass}`}
      >
        <Timer className="w-3.5 h-3.5 shrink-0" />
        <span className="tabular-nums font-mono">{timeLeft}s</span>
      </div>

      {/* Mini Progress Track */}
      <div className="w-16 sm:w-24 h-2 bg-black/10 rounded-full overflow-hidden p-0.5 shadow-inner hidden sm:block">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
