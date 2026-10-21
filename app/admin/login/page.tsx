"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Shield,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import AdminCaptcha from "@/components/admin/AdminCaptcha";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noticeParam = searchParams.get("notice");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaData, setCaptchaData] = useState({ answer: "", token: "" });
  const [honeypot, setHoneypot] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Handle countdown if locked out
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    if (!captchaData.answer.trim() || !captchaData.token) {
      setErrorMessage("Silakan selesaikan verifikasi anti-bot (CAPTCHA) terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          captchaAnswer: captchaData.answer.trim(),
          captchaToken: captchaData.token,
          admin_trap_code: honeypot, // Honeypot trap
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.locked && data.waitSeconds) {
          setLockoutSeconds(data.waitSeconds);
        }
        throw new Error(data.error || "Gagal melakukan verifikasi akun.");
      }

      // Login Successful
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto bg-white border border-isy-line rounded-3xl p-6 sm:p-9 shadow-sm text-center">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-5">
        <div className="mb-2 flex items-center justify-center">
          <Image
            src="/logo.webp"
            alt="Optik I See You"
            width={160}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-mist px-3 py-0.5 text-[11px] font-bold text-isy-emerald border border-isy-line">
          <Shield className="h-3.5 w-3.5 text-isy-green-bright" />
          <span>Portal Administrasi Terpusat</span>
        </div>
      </div>

      {/* Prominent Restricted Access Security Warning */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-3.5 text-left mb-5">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Sistem Terproteksi — Akses Terbatas
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              Portal ini khusus bagi staf resmi Optik I See You. Segala aktivitas login, IP, dan perangkat dicatat ke log audit. Akses tanpa hak akan diblokir otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Unauthorized Redirect Warning Pill */}
      {noticeParam === "unauthorized" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left text-xs font-semibold text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>
            Akses Ditolak: Anda mencoba membuka halaman admin tanpa login. Silakan verifikasi identitas Anda terlebih dahulu.
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Rate Limit Lockout Notice */}
      {lockoutSeconds > 0 && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-100/90 p-3 text-left text-xs font-bold text-red-800">
          Akun sementara terkunci demi keamanan. Coba kembali dalam {lockoutSeconds} detik.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Hidden Honeypot Trap for Bots */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="admin_trap_code"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-isy-emerald uppercase tracking-wider pl-1">
            Email Administrator *
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="admin@optikiseeyou.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full rounded-2xl border border-isy-line bg-isy-ivory/40 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:bg-white focus:outline-none transition-all placeholder:text-isy-text-secondary/50"
              autoFocus
            />
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-isy-text-secondary" />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-isy-emerald uppercase tracking-wider pl-1">
            Kata Sandi (Password) *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Masukkan password admin..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full rounded-2xl border border-isy-line bg-isy-ivory/40 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:bg-white focus:outline-none transition-all placeholder:text-isy-text-secondary/50"
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-isy-text-secondary" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 rounded-lg p-1 text-isy-text-secondary hover:text-isy-emerald"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Interactive Anti-Bot CAPTCHA Challenge */}
        <AdminCaptcha
          onVerifyChange={setCaptchaData}
          disabled={isLoading || lockoutSeconds > 0}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || lockoutSeconds > 0}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-isy-emerald py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-isy-emerald-hover active:scale-[0.99] cursor-pointer mt-2 ${
            isLoading || lockoutSeconds > 0 ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memverifikasi Keamanan & Kredensial...</span>
            </>
          ) : (
            <span>Masuk ke Panel Admin</span>
          )}
        </button>
      </form>

      <div className="mt-5 pt-3 border-t border-isy-line text-center text-[10.5px] text-isy-text-secondary">
        Dilindungi sistem enkripsi SHA-256 & Rate Limiter anti brute-force.
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col justify-between bg-isy-ivory p-4 sm:p-8 font-sans selection:bg-isy-green-bright selection:text-white">
      {/* Top Bar Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-isy-emerald hover:text-isy-green-bright transition-colors bg-white/90 px-3.5 py-1.5 rounded-full border border-isy-line shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website</span>
        </Link>
        <span className="text-xs font-bold text-isy-emerald bg-isy-mist px-3 py-1 rounded-full border border-isy-line">
          Portal Internal
        </span>
      </div>

      {/* Login Card with Suspense for useSearchParams */}
      <div className="my-auto py-6">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-isy-emerald" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer Note */}
      <div className="max-w-md w-full mx-auto text-center pb-2 text-[11px] text-isy-text-secondary/70">
        © 2026 Optik I See You. Seluruh hak cipta dilindungi undang-undang.
      </div>
    </main>
  );
}
