"use client";

import React from "react";

interface VisionScreeningDialProps {
  type: "astigmatic-dial" | "duochrome-test";
}

export default function VisionScreeningDial({ type }: VisionScreeningDialProps) {
  if (type === "astigmatic-dial") {
    // 12 primary clock positions (every 30 deg), with 3 lines per bundle like standard optometric dial
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    return (
      <div className="w-full max-w-sm mx-auto my-4 p-4 rounded-2xl bg-white border border-isy-line shadow-xs flex flex-col items-center select-none">
        <span className="text-[11px] font-bold text-isy-ink/60 uppercase tracking-wider mb-2">
          Astigmatic Clock Dial
        </span>
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg viewBox="-120 -120 240 240" className="w-full h-full">
            {/* Center circle */}
            <circle cx="0" cy="0" r="8" fill="#116B3C" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#E5E7EB" strokeWidth="2" />

            {/* Dial lines grouped by clock hours */}
            {hours.map((hour) => {
              const deg = (hour * 30) - 90; // 12 at top (-90deg)
              const rad = (deg * Math.PI) / 180;
              const textR = 105;
              const tx = textR * Math.cos(rad);
              const ty = textR * Math.sin(rad) + 4; // slight vertical align

              return (
                <g key={hour}>
                  {/* Central main radiating line */}
                  <line
                    x1={20 * Math.cos(rad)}
                    y1={20 * Math.sin(rad)}
                    x2={88 * Math.cos(rad)}
                    y2={88 * Math.sin(rad)}
                    stroke="#1A1A1A"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  {/* Flanking sub-line 1 (-3 deg) */}
                  <line
                    x1={22 * Math.cos(rad - 0.05)}
                    y1={22 * Math.sin(rad - 0.05)}
                    x2={84 * Math.cos(rad - 0.05)}
                    y2={84 * Math.sin(rad - 0.05)}
                    stroke="#333333"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  {/* Flanking sub-line 2 (+3 deg) */}
                  <line
                    x1={22 * Math.cos(rad + 0.05)}
                    y1={22 * Math.sin(rad + 0.05)}
                    x2={84 * Math.cos(rad + 0.05)}
                    y2={84 * Math.sin(rad + 0.05)}
                    stroke="#333333"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  {/* Hour number label */}
                  <text
                    x={tx}
                    y={ty}
                    fontSize="11"
                    fontWeight="bold"
                    fill="#4B5563"
                    textAnchor="middle"
                  >
                    {hour}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="mt-2 text-[11px] text-center text-isy-ink/60 max-w-xs leading-relaxed">
          Tutup satu mata bergantian. Apakah ada angka/garis yang terlihat lebih hitam pekat dibanding garis lainnya?
        </p>
      </div>
    );
  }

  if (type === "duochrome-test") {
    return (
      <div className="w-full max-w-md mx-auto my-4 p-4 rounded-2xl bg-white border border-isy-line shadow-xs flex flex-col items-center select-none">
        <span className="text-[11px] font-bold text-isy-ink/60 uppercase tracking-wider mb-2">
          Duochrome Red-Green Focus Test
        </span>

        {/* Split Box */}
        <div className="w-full grid grid-cols-2 rounded-xl overflow-hidden shadow-inner border border-black/10 h-32 sm:h-36">
          {/* Red Chamber */}
          <div className="bg-[#D32F2F] flex flex-col items-center justify-center p-3 text-black">
            <div className="flex items-center gap-3">
              {/* High contrast optotypes */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[6px] border-black flex items-center justify-center font-black text-xl sm:text-2xl font-mono">
                8
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-[5px] border-black flex items-center justify-center font-black text-base font-mono">
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
              {/* High contrast optotypes */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[6px] border-black flex items-center justify-center font-black text-xl sm:text-2xl font-mono">
                8
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-[5px] border-black flex items-center justify-center font-black text-base font-mono">
                E
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-2 text-black/70">
              HIJAU
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-center text-isy-ink/60 max-w-sm leading-relaxed">
          Karakter angka &amp; lingkaran di latar warna mana yang terlihat lebih kontras, tegas, dan tebal?
        </p>
      </div>
    );
  }

  return null;
}
