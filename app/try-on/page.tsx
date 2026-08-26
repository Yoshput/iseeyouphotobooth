"use client";

/**
 * app/try-on/page.tsx
 * Gateway selector between Try-On 2D (Photobooth & Strip) and Try-On 3D (Virtual Reality CAD).
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Camera, Eye, CheckCircle2, Glasses, ShieldCheck } from "lucide-react";

export default function TryOnGatewayPage() {
  return (
    <main className="min-h-screen bg-white text-[#1A2E26] flex flex-col justify-between selection:bg-[#2FA84F]/20">
      {/* Top Navbar */}
      <header className="w-full border-b border-[#E7E2D9] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-isy-line bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-isy-green-deep shadow-xs hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Optik I See You"
              width={120}
              height={45}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>

          <div className="w-24 sm:w-32 flex justify-end">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2FA84F]/10 text-[#2FA84F] text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              AR Virtual
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Title */}
        <div className="text-center max-w-2xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2E26]/5 text-[#1A2E26]/80 text-xs font-bold uppercase tracking-wider mb-3">
            <Glasses className="w-3.5 h-3.5 text-[#2FA84F]" />
            Pilih Pengalaman Try-On
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-[#1A2E26] leading-tight">
            Coba Kacamata Secara Virtual Sesuai Kebutuhan Anda
          </h1>
          <p className="text-xs sm:text-base text-[#1A2E26]/60 mt-2">
            Pilih mode 2D untuk berfoto seru dan cetak strip foto, atau pelajari inovasi 3D fitting virtual kami.
          </p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          {/* Card 1: Try-On 2D (Photobooth Mode) */}
          <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2FA84F] shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider">
                  <Camera className="w-3.5 h-3.5" />
                  Mode 2D Photobooth
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  Siap Digunakan
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2E26] mb-2 group-hover:text-[#2FA84F] transition-colors">
                Try-On 2D &amp; Photobooth Strip
              </h2>
              <p className="text-xs sm:text-sm text-[#1A2E26]/70 mb-6 leading-relaxed">
                Filter kacamata 2D instan untuk berfoto seru. Dilengkapi frame strip kustom, timer countdown, stiker, dan cetak thermal.
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#1A2E26]/80">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2FA84F] shrink-0" />
                  <span>Katalog frame 2D lengkap &amp; filter cantik AI</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2FA84F] shrink-0" />
                  <span>Tata letak strip foto 1x, 2x, 3x, &amp; 4x pose</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2FA84F] shrink-0" />
                  <span>Cetak foto thermal &amp; unduh GIF animasi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2FA84F] shrink-0" />
                  <span>Sangat mulus &amp; ringan di semua HP</span>
                </li>
              </ul>
            </div>

            <Link
              href="/photobooth?mode=ar"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#2FA84F] text-white font-bold text-sm sm:text-base shadow-md shadow-[#2FA84F]/25 hover:bg-[#25873F] active:scale-[0.98] transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Buka Try-On 2D Photobooth</span>
            </Link>
          </div>

          {/* Card 2: Try-On 3D (Virtual Reality Optical Mode) - Dalam Tahap Perbaikan */}
          <div className="relative flex flex-col justify-between bg-gradient-to-b from-[#1A2E26]/90 to-[#12201A]/95 text-white rounded-3xl p-6 sm:p-8 border-2 border-[#1A2E26] shadow-md opacity-90">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Eye className="w-3.5 h-3.5" />
                  Mode 3D CAD
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  🚧 Tahap Perbaikan
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                Try-On 3D Virtual Fitting
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mb-6 leading-relaxed">
                Fitur fitting kacamata 3D Real-Time CAD saat ini sedang dalam proses perbaikan &amp; kalibrasi presisi frame oleh tim Optik I See You.
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-white/85">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400/70 shrink-0" />
                  <span>Model 3D CAD nyata (Aviator, Clubmaster, Round, Acetate)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400/70 shrink-0" />
                  <span>Rotasi kepala 3D penuh (tengok kiri/kanan, dongak/nunduk)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400/70 shrink-0" />
                  <span>Tangkai kacamata 3D melengkung pas di samping telinga</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400/70 shrink-0" />
                  <span>Refleksi pencahayaan studio &amp; lensa transparan jernih</span>
                </li>
              </ul>
            </div>

            <div
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl bg-white/10 text-white/60 font-bold text-sm sm:text-base border border-white/10 cursor-not-allowed select-none"
            >
              <span>🚧 Sedang Dalam Perbaikan (Segera Hadir)</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#1A2E26]/50">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2FA84F]" />
            <span>Privasi Aman: Gambar diproses lokal di perangkat Anda</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div>Tanpa Download Aplikasi (Langsung di Browser)</div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-4 text-center text-[11px] text-[#1A2E26]/40 border-t border-[#E7E2D9]">
        © {new Date().getFullYear()} Optik I See You. All Rights Reserved.
      </footer>
    </main>
  );
}
