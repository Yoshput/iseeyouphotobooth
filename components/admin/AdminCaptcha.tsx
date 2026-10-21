"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";

interface AdminCaptchaProps {
  onVerifyChange: (data: { answer: string; token: string }) => void;
  disabled?: boolean;
}

export default function AdminCaptcha({ onVerifyChange, disabled }: AdminCaptchaProps) {
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    setAnswer("");
    onVerifyChange({ answer: "", token: "" });

    try {
      const res = await fetch("/api/admin/auth/captcha", { credentials: "omit" });
      const data = await res.json();
      if (data.success && data.data) {
        setQuestion(data.data.question);
        setToken(data.data.token);
      } else {
        throw new Error(data.error || "Gagal memuat CAPTCHA");
      }
    } catch {
      setFetchError("Gagal memuat kode keamanan. Klik refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [onVerifyChange]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleInputChange = (val: string) => {
    setAnswer(val);
    onVerifyChange({ answer: val, token });
  };

  return (
    <div className="space-y-2 rounded-2xl border border-isy-line bg-isy-ivory/50 p-3.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-isy-emerald">
          <ShieldCheck className="h-3.5 w-3.5 text-isy-green-bright" />
          <span>Verifikasi Anti-Bot (CAPTCHA) *</span>
        </label>
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={disabled || isLoading}
          title="Muat ulang kode keamanan"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin text-isy-emerald" : ""}`} />
          <span>Acak Ulang</span>
        </button>
      </div>

      {fetchError ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={fetchChallenge}
            className="font-bold underline text-xs"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Visual Challenge Box */}
          <div
            className="flex-1 relative flex items-center justify-center rounded-xl border border-isy-line/80 bg-white px-3 py-2 select-none overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(#124734 0.75px, transparent 0.75px), radial-gradient(#2FA84F 0.75px, #FFFFFF 0.75px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            {/* Ambient security wave overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

            <span className="relative z-10 font-mono text-sm sm:text-base font-extrabold tracking-wider text-isy-emerald filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {isLoading ? "Menyiapkan verifikasi..." : question}
            </span>
          </div>

          {/* Answer Input */}
          <div className="sm:w-36">
            <input
              type="text"
              required
              disabled={disabled || isLoading}
              value={answer}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Hasil / Kode"
              className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-center text-xs sm:text-sm font-bold text-isy-emerald placeholder:font-normal placeholder:text-isy-text-secondary/50 focus:border-isy-emerald focus:bg-white focus:outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        </div>
      )}

      <p className="text-[10px] text-isy-text-secondary/70 leading-tight">
        Selesaikan verifikasi angka/kode di atas untuk membuktikan akses Anda bukan bot otomatis.
      </p>
    </div>
  );
}
