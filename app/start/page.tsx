"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-dvh w-full flex-col bg-isy-gradient selection:bg-isy-green-bright selection:text-white">
      {/* ── Top Navbar ──────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-isy-line/60 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 rounded-full border border-isy-line bg-white/90 px-4 py-2 text-xs font-bold text-isy-green-deep shadow-sm transition-all hover:border-isy-green-bright hover:bg-isy-mist active:scale-95"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Home</span>
          </button>

          <Image
            src="/logo.png"
            alt="Optik I See You"
            width={110}
            height={42}
            className="h-8 w-auto object-contain drop-shadow-sm"
            priority
          />
        </div>
      </header>

      {/* ── Hero / Selection Area ─────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-isy-green-bright/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-isy-green-bright">
            Optik I See You
          </span>

          <h1 className="mb-3 font-serif text-3xl font-black text-isy-green-deep sm:text-5xl">
            Mau coba yang mana?
          </h1>
          <p className="mb-10 text-xs font-medium text-isy-ink/60 sm:text-sm">
            Pilih pengalaman scan kacamata AR atau cetak photo strip impianmu
          </p>

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Mode 1: Scan AR Kacamata */}
            <button
              onClick={() => router.push("/try-on")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-green-bright bg-isy-green-deep p-8 text-left text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            >
              {/* Decorative Subtle Ambient Glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-isy-green-bright/30 blur-2xl transition-all group-hover:bg-isy-green-bright/40" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-isy-green-bright backdrop-blur-md border border-white/10 group-hover:bg-isy-green-bright group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm border border-white/10">
                    Direct Scan · 1x Foto
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-black tracking-wide text-white sm:text-3xl">
                    Try On Kacamata
                  </h2>
                  <p className="mt-2 text-xs font-medium text-white/75 leading-relaxed">
                    Try-on kacamata real-time langsung di kamera. Sekali jepret seperti filter Instagram!
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/15 pt-5">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Mulai Try On
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-isy-green-deep shadow transition-transform group-hover:translate-x-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Mode 2: Photobooth */}
            <button
              onClick={() => router.push("/photobooth")}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-8 text-left text-isy-ink shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-isy-green-bright hover:shadow-xl active:scale-[0.98]"
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-isy-mist text-isy-green-deep border border-isy-line group-hover:bg-isy-green-bright/10 group-hover:text-isy-green-bright transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-isy-mist px-3 py-1 text-[10px] font-black uppercase tracking-wider text-isy-green-deep border border-isy-line">
                    Multi-Photo Strip
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-black tracking-wide text-isy-green-deep sm:text-3xl">
                    Photobooth
                  </h2>
                  <p className="mt-2 text-xs font-medium text-isy-ink/60 leading-relaxed">
                    Pilih berbagai layout strip foto klasik, ambil foto bertahap, & buat GIF animasi!
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-between border-t border-isy-line pt-5">
                <span className="text-xs font-black uppercase tracking-wider text-isy-green-deep">
                  Mulai Photobooth
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-isy-green-bright text-white shadow transition-transform group-hover:translate-x-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
