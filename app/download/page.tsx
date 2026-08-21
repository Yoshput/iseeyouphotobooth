"use client";

/**
 * app/download/page.tsx
 * Branded Mobile Download Portal for Optik I See You Photobooth.
 * Opened when visitors scan the QR Code on their smartphone!
 */

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { downloadOrShareImage } from "@/lib/saveImage";

function DownloadPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const stripUrl = searchParams?.get("strip") || "";
  const gifUrl = searchParams?.get("gif") || "";

  const [activeTab, setActiveTab] = useState<"strip" | "gif">("strip");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadStrip = async () => {
    if (!stripUrl) return;
    showToast("Menyiapkan foto HD...");
    const res = await downloadOrShareImage(
      stripUrl,
      `iseeyou-photobooth-${Date.now()}.jpg`,
      "Optik I See You — Foto Strip HD"
    );
    if (res.success) {
      showToast(res.method === "share" ? "Buka menu Simpan Gambar!" : "Foto berhasil disimpan!");
    }
  };

  const handleDownloadGif = async () => {
    if (!gifUrl) return;
    showToast("Menyiapkan GIF animasi...");
    const res = await downloadOrShareImage(
      gifUrl,
      `iseeyou-animasi-${Date.now()}.gif`,
      "Optik I See You — Animasi GIF"
    );
    if (res.success) {
      showToast(res.method === "share" ? "Buka menu Simpan Gambar!" : "GIF berhasil disimpan!");
    }
  };

 const handleShareWA = () => {
 handleDownloadStrip();
 setTimeout(() => {
 window.open(
 "https://wa.me/?text=" +
 encodeURIComponent(
 "Lihat hasil foto AR Photobooth aku di @iseeyou.glasses! " + stripUrl
 ),
 "_blank"
 );
 }, 500);
 };

 const handleShareIG = () => {
 handleDownloadStrip();
 setTimeout(() => {
 window.open("https://www.instagram.com/iseeyou.glasses/", "_blank");
 showToast("Foto tersimpan! Unggah ke Instagram Story ");
 }, 500);
 };

 if (!stripUrl && !gifUrl) {
 return (
 <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center bg-isy-mist">
 <Image src="/logo.png" alt="Optik I See You" width={140} height={54} className="mb-4 h-10 w-auto" />
 <h2 className="font-serif text-lg font-bold text-isy-green-deep">Foto Tidak Ditemukan</h2>
 <p className="mt-1 text-xs text-isy-ink/60 max-w-xs">
 URL download tidak valid atau foto sudah kadaluarsa.
 </p>
 <button
 onClick={() => router.push("/photobooth")}
 className="mt-6 rounded-full bg-isy-green-bright px-6 py-2.5 text-xs font-bold text-white shadow-md"
 >
 Coba Photobooth
 </button>
 </div>
 );
 }

 return (
 <main className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-white via-[#f6fbf7] to-[#eaf6ec] p-4 text-isy-ink">
 <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl border border-isy-line space-y-4 my-auto">
 
 {/* Header */}
 <div className="flex flex-col items-center text-center space-y-1">
 <Image src="/logo.png" alt="Optik I See You" width={180} height={70} className="h-10 w-auto" priority />
 <p className="text-[11px] font-bold text-isy-green-bright tracking-widest uppercase">
 AR Photobooth Download Portal
 </p>
 </div>

 {/* Tab Switcher: Strip vs GIF */}
 {gifUrl && (
 <div className="flex rounded-full border border-isy-line bg-isy-mist p-1 text-xs font-bold">
 <button
 onClick={() => setActiveTab("strip")}
 className={`flex-1 rounded-full py-2 transition-all ${
 activeTab === "strip"
 ? "bg-white text-isy-green-deep shadow-sm"
 : "text-isy-ink/50"
 }`}
 >
 Foto Strip HD
 </button>
 <button
 onClick={() => setActiveTab("gif")}
 className={`flex-1 rounded-full py-2 transition-all ${
 activeTab === "gif"
 ? "bg-white text-isy-green-deep shadow-sm"
 : "text-isy-ink/50"
 }`}
 >
 GIF Animasi 
 </button>
 </div>
 )}

 {/* Display Area */}
 <div className="overflow-hidden rounded-2xl border border-isy-line bg-black/5 flex items-center justify-center p-2 min-h-[280px]">
 {activeTab === "strip" || !gifUrl ? (
 /* eslint-disable-next-line @next/next/no-img-element */
 <img
 src={stripUrl}
 alt="Foto Strip Optik I See You"
 className="max-h-[420px] w-full object-contain rounded-xl shadow"
 />
 ) : (
 /* eslint-disable-next-line @next/next/no-img-element */
 <img
 src={gifUrl}
 alt="GIF Animasi Optik I See You"
 className="max-h-[420px] w-full object-contain rounded-xl shadow"
 />
 )}
 </div>

 {/* Download Buttons */}
 <div className="space-y-2">
 {stripUrl && (
 <button
 onClick={handleDownloadStrip}
 className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-isy-green-bright py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-isy-green-deep active:scale-95"
 >
 <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
 <path d="M12 3v13" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" />
 </svg>
 Simpan Foto Strip (HD)
 </button>
 )}

 {gifUrl && (
 <button
 onClick={handleDownloadGif}
 className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-isy-green-bright bg-white py-3.5 text-xs font-black uppercase tracking-wider text-isy-green-deep shadow-sm transition-all hover:bg-isy-mist active:scale-95"
 >
 Simpan GIF Animasi
 </button>
 )}
 </div>

 {/* Social Share Grid */}
 <div className="grid grid-cols-2 gap-2 pt-1">
 <button
 onClick={handleShareWA}
 className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep hover:bg-white transition-all active:scale-95"
 >
 <span> WhatsApp</span>
 </button>
 <button
 onClick={handleShareIG}
 className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist py-2.5 text-xs font-bold text-isy-green-deep hover:bg-white transition-all active:scale-95"
 >
 <span> IG Story</span>
 </button>
 </div>

 {/* Brand Footer */}
 <div className="pt-2 text-center border-t border-isy-line">
 <p className="text-[10px] font-semibold text-isy-ink/50">
 Optik I See You · Purwokerto
 </p>
 <a
 href="https://www.instagram.com/iseeyou.glasses/"
 target="_blank"
 rel="noopener noreferrer"
 className="text-[11px] font-bold text-isy-green-bright hover:underline"
 >
 @iseeyou.glasses
 </a>
 </div>
 </div>

 {toast && (
 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
 <div className="rounded-full bg-isy-green-deep px-5 py-2 text-xs font-semibold text-white shadow-lg">
 {toast}
 </div>
 </div>
 )}
 </main>
 );
}

export default function DownloadPortalPage() {
 return (
 <Suspense fallback={
 <div className="flex min-h-dvh items-center justify-center bg-isy-mist text-xs font-bold text-isy-green-deep">
 Memuat Portal Download…
 </div>
 }>
 <DownloadPortalContent />
 </Suspense>
 );
}
