"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.locked && data.waitSeconds) {
          setLockoutSeconds(data.waitSeconds);
        }
        throw new Error(data.error || "Gagal melakukan verifikasi akun.");
      }

      // Success
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Login Card */}
      <div className="my-auto py-8">
        <div className="w-full max-w-[420px] mx-auto bg-white border border-isy-line rounded-3xl p-8 sm:p-10 shadow-sm text-center">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="mb-3 flex items-center justify-center">
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
              <span>Dashboard Admin Terpusat</span>
            </div>
          </div>

          <p className="text-xs text-isy-text-secondary leading-relaxed mb-6 font-normal">
            Masuk dengan akun pengelola resmi untuk mengatur katalog kacamata, softlens, media, dan artikel blog.
          </p>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs font-semibold text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-isy-emerald uppercase tracking-wider pl-1">
                Email Admin
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
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-isy-line bg-isy-ivory/40 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:bg-white focus:outline-none transition-all placeholder:text-isy-text-secondary/50"
                  autoFocus
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-isy-text-secondary" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-isy-emerald uppercase tracking-wider pl-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan password Anda..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  disabled={isLoading}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-isy-emerald py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-isy-emerald-hover cursor-pointer mt-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-isy-line text-center text-[11px] text-isy-text-secondary">
            Akses dibatasi hanya untuk staf resmi Optik I See You.
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-md w-full mx-auto text-center pb-2 text-[11px] text-isy-text-secondary/70">
        © 2026 Optik I See You. Seluruh hak cipta dilindungi undang-undang.
      </div>
    </main>
  );
}
