"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF9F6] p-6 text-center text-[#1a3d2e]">
      <div className="rounded-full bg-[#c9a869]/15 border border-[#c9a869]/30 px-4 py-1.5 text-xs font-black text-[#9a7633] mb-4">
        404 — Halaman Tidak Ditemukan
      </div>
      <h1 className="font-serif text-4xl font-black sm:text-5xl">
        Waduh! Halaman Tidak Ada
      </h1>
      <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-medium">
        Halaman yang kamu cari tidak ditemukan atau mungkin sudah dipindahkan.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[#1a3d2e] px-6 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-isy-green-bright transition-all"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/softlens"
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-[#1a3d2e] shadow-xs hover:border-[#c9a869] transition-all"
        >
          Katalog Softlens
        </Link>
      </div>
    </div>
  );
}
