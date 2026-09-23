"use client";

import React from "react";

interface VisionScreeningDialProps {
  type: "astigmatic-dial" | "duochrome-test";
}

export default function VisionScreeningDial({ type }: VisionScreeningDialProps) {
  if (type === "astigmatic-dial") {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    return (
      <div className="w-full max-w-sm mx-auto my-4 p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center select-none">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Astigmatic Clock Dial
        </span>
        <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
          <svg viewBox="-120 -120 240 240" className="w-full h-full">
            {/* Center circle */}
            <circle cx="0" cy="0" r="7" fill="#116B3C" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />

            {/* Dial lines grouped by clock hours */}
            {hours.map((hour) => {
              const deg = (hour * 30) - 90;
              const rad = (deg * Math.PI) / 180;
              const textR = 105;
              const tx = textR * Math.cos(rad);
              const ty = textR * Math.sin(rad) + 4;

              return (
                <g key={hour}>
                  {/* Central main radiating line */}
                  <line
                    x1={20 * Math.cos(rad)}
                    y1={20 * Math.sin(rad)}
                    x2={88 * Math.cos(rad)}
                    y2={88 * Math.sin(rad)}
                    stroke="#0F172A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Flanking sub-line 1 */}
                  <line
                    x1={22 * Math.cos(rad - 0.05)}
                    y1={22 * Math.sin(rad - 0.05)}
                    x2={84 * Math.cos(rad - 0.05)}
                    y2={84 * Math.sin(rad - 0.05)}
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Flanking sub-line 2 */}
                  <line
                    x1={22 * Math.cos(rad + 0.05)}
                    y1={22 * Math.sin(rad + 0.05)}
                    x2={84 * Math.cos(rad + 0.05)}
                    y2={84 * Math.sin(rad + 0.05)}
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Hour label */}
                  <text
                    x={tx}
                    y={ty}
                    fontSize="10"
                    fontWeight="600"
                    fill="#64748B"
                    textAnchor="middle"
                  >
                    {hour}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="mt-2 text-[11px] text-center text-slate-500 max-w-xs leading-relaxed">
          Tutup satu mata secara bergantian. Periksa apakah ada angka/garis yang terlihat lebih hitam pekat dibanding garis lain.
        </p>
      </div>
    );
  }

  if (type === "duochrome-test") {
    return (
      <div className="w-full max-w-md mx-auto my-4 p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center select-none">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Duochrome Red-Green Focus Test
        </span>

        {/* Split Box */}
        <div className="w-full grid grid-cols-2 rounded-2xl overflow-hidden shadow-inner border border-black/10 h-32 sm:h-36">
          {/* Red Chamber */}
          <div className="bg-[#D32F2F] flex flex-col items-center justify-center p-3 text-black">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[5px] border-black flex items-center justify-center font-bold text-xl sm:text-2xl font-mono">
                8
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-[4px] border-black flex items-center justify-center font-bold text-base font-mono">
                E
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2 text-black/70">
              MERAH
            </span>
          </div>

          {/* Green Chamber */}
          <div className="bg-[#2E7D32] flex flex-col items-center justify-center p-3 text-black">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[5px] border-black flex items-center justify-center font-bold text-xl sm:text-2xl font-mono">
                8
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-[4px] border-black flex items-center justify-center font-bold text-base font-mono">
                E
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2 text-black/70">
              HIJAU
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-center text-slate-500 max-w-sm leading-relaxed">
          Karakter di dalam kotak warna mana yang tampak lebih tegas, pekat, dan tajam bagi kedua matamu?
        </p>
      </div>
    );
  }

  return null;
}
