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
    <section id="cek-mata" className="relative w-full overflow-hidden bg-white px-6 py-20 sm:py-28 border-t border-isy-line/60">
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

            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              {/* Branch Selection */}
              <div>
                <label className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                  Pilih Cabang Optik I See You:
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs font-semibold text-isy-green-deep focus:border-isy-green-bright focus:outline-none shadow-2xs"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      Cabang {b.city} ({b.address.split(",")[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Melati"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                />
              </div>

              {/* Phone / WA */}
              <div>
                <label className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                  Nomor WhatsApp:
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                />
              </div>

              {/* Visit Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                    Tanggal Rencana:
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs text-isy-ink focus:border-isy-green-bright focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-isy-ink/70 mb-1">
                    Pilihan Waktu:
                  </label>
                  <select
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-isy-green-bright py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-isy-green-bright/25 transition-all hover:bg-emerald-600 active:scale-95 flex items-center justify-center gap-2"
              >
                <Image src="/logo/Logo-Whatsapp.png" alt="WA" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
                <span>Reservasi Cek Mata Gratis via WA →</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
