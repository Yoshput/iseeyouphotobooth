"use client";

/**
 * components/ui/AboutRefractionBookingSection.tsx
 *
 * "Tentang Kami & Cek Mata Gratis":
 * - Accurately framed optometric refraction & digital autorefractor consultation
 * - Interactive online appointment booking widget auto-forwarding to branch WhatsApp.
 */

import { useState } from "react";
import Image from "next/image";
import { BRANCHES } from "@/lib/branches";

export default function AboutRefractionBookingSection() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("purwokerto");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("Siang (12.00 - 15.00 WIB)");

  const selectedBranch =
    BRANCHES.find((b) => b.id === selectedBranchId) || BRANCHES[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Mohon masukkan nama Anda.");
      return;
    }

    const message = `Halo Optik I See You Cabang ${selectedBranch.city},

Saya ingin reservasi Cek Mata Gratis & Konsultasi Kacamata:
- *Nama:* ${customerName.trim()}
- *No. WhatsApp:* ${customerPhone.trim() || "-"}
- *Cabang Tujuan:* ${selectedBranch.city}
- *Rencana Tanggal:* ${bookingDate || "Hari ini / Besok"}
- *Waktu Kunjungan:* ${bookingTime}

Mohon konfirmasi ketersediaan slotnya ya. Terima kasih!`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${selectedBranch.waNumber}?text=${encodedMsg}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="antrian-cek-mata" className="relative w-full overflow-hidden bg-white px-6 py-20 sm:py-28 border-t border-isy-line/60">
      <div className="mx-auto max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT 7-cols: Story & Framing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/25 bg-isy-green-bright/10 px-4 py-1.5 shadow-2xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-isy-green-deep">
              TENTANG KAMI &bull; TERPERCAYA SEJAK 2019
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-black text-isy-green-deep leading-tight">
            Cek Mata Gratis
            <br />
            <span className="text-isy-green-bright italic">&amp; Konsultasi Refraksi Akurat</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-isy-ink/75 leading-relaxed">
            <p>
              Berdiri sejak tahun 2019, <strong>Optik I See You</strong> hadir dengan dedikasi memberikan solusi penglihatan jernih, nyaman, dan gaya kacamata estetik modern. Kami menyediakan <strong>Layanan Cek Mata Gratis</strong> menggunakan perangkat <em>Autorefractor (Refractometer Digital)</em> komputerisasi terkini serta <em>Trial Lens Set</em> lengkap.
            </p>
            <p>
              Staf refraksionis berpengalaman kami akan membantu mengukur tingkat minus (miopia), silinder (astigmatisme), hingga plus (presbiopia) secara presisi, lalu memberikan rekomendasi lensa dan frame yang paling pas dengan gaya hidup serta bentuk wajahmu.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-isy-line bg-isy-mist/40 p-4 space-y-1">
              <h4 className="text-xs font-bold text-isy-green-deep">Refraktometer Digital</h4>
              <p className="text-[11px] text-isy-ink/60">Pengukuran akurat dalam hitungan detik</p>
            </div>
            <div className="rounded-2xl border border-isy-line bg-isy-mist/40 p-4 space-y-1">
              <h4 className="text-xs font-bold text-isy-green-deep">Trial Lens Fitting</h4>
              <p className="text-[11px] text-isy-ink/60">Uji coba kenyamanan lensa secara langsung</p>
            </div>
            <div className="rounded-2xl border border-isy-line bg-isy-mist/40 p-4 space-y-1">
              <h4 className="text-xs font-bold text-isy-green-deep">100% Gratis</h4>
              <p className="text-[11px] text-isy-ink/60">Tanpa biaya &amp; bebas konsultasi model</p>
            </div>
          </div>
        </div>

        {/* RIGHT 5-cols: Interactive Quick Booking Widget */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border-2 border-isy-green-bright/30 bg-gradient-to-b from-white to-isy-ivory/50 p-6 sm:p-8 shadow-xl shadow-isy-green-bright/5 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-isy-green-bright">
                RESERVASI ONLINE CEPAT
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-isy-green-deep">
                Jadwalkan Cek Mata Gratis
              </h3>
              <p className="text-xs text-isy-ink/60">
                Pilih cabang &amp; waktu kunjungan, pesan terkirim otomatis ke WhatsApp cabang:
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Branch Selection Cards */}
              <div>
                <label className="block text-[11px] font-bold text-isy-ink/70 mb-1.5">
                  Pilih Cabang Optik I See You:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BRANCHES.map((b) => {
                    const isSelected = b.id === selectedBranchId;
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-isy-green-bright bg-isy-green-bright/10 text-isy-green-deep ring-2 ring-isy-green-bright/30 shadow-xs"
                            : "border-isy-line bg-white text-isy-ink/75 hover:border-isy-green-bright/50 hover:bg-isy-mist/30"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-black">{b.city}</span>
                          {isSelected ? (
                            <span className="h-2 w-2 rounded-full bg-isy-green-bright ring-2 ring-white" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-isy-line" />
                          )}
                        </div>
                        <span className="text-[10px] text-isy-ink/55 truncate mt-1">
                          {b.address.split(",")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label htmlFor="booking-name" className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                  Nama Lengkap:
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  aria-label="Nama Lengkap"
                  placeholder="Contoh: Rina Melati"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                />
              </div>

              {/* Phone / WA */}
              <div>
                <label htmlFor="booking-phone" className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                  Nomor WhatsApp:
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  aria-label="Nomor WhatsApp"
                  placeholder="08xxxxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                />
              </div>

              {/* Visit Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="booking-date" className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                    Tanggal Rencana:
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    aria-label="Tanggal Rencana Kunjungan"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label htmlFor="booking-time" className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                    Pilihan Waktu:
                  </label>
                  <select
                    id="booking-time"
                    aria-label="Pilihan Waktu Kunjungan"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full rounded-xl border border-isy-line bg-white px-2.5 py-2 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                  >
                    <option value="Pagi (09.00 - 12.00 WIB)">Pagi (09.00 - 12.00)</option>
                    <option value="Siang (12.00 - 15.00 WIB)">Siang (12.00 - 15.00)</option>
                    <option value="Sore (15.00 - 18.00 WIB)">Sore (15.00 - 18.00)</option>
                    <option value="Malam (18.00 - 21.00 WIB)">Malam (18.00 - 21.00)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button with Selected Branch Notice */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-isy-green-bright py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-isy-green-bright/25 transition-all hover:bg-emerald-600 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="shrink-0 text-white"
                  >
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.212 8.212 0 0 1-5.82 2.41h-.01c-1.38 0-2.73-.35-3.92-1.02l-.28-.16-2.9.76.77-2.83-.18-.29a8.196 8.196 0 0 1-1.25-4.39c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
                  </svg>
                  <span>Kirim Reservasi ke Cabang {selectedBranch.city} →</span>
                </button>
                <p className="text-[10px] text-center text-isy-ink/50">
                  Pesan otomatis terkirim ke CS WhatsApp Cabang {selectedBranch.city} ({selectedBranch.phone})
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
