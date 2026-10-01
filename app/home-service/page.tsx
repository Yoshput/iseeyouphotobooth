"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Users,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Glasses,
  Home,
  Check,
} from "lucide-react";
import { CS_BRANCHES } from "@/components/ui/ContactCSModal";

export default function HomeServicePage() {
  const [selectedBranchId, setSelectedBranchId] = useState("purwokerto");
  const [formData, setFormData] = useState({
    nama: "",
    whatsapp: "",
    alamat: "",
    tanggal: "",
    waktu: "10:00",
    jumlahOrang: "1 - 2 Orang",
    layanan: ["Periksa Mata Komputerisasi", "Pilihan Frame Kacamata"],
    catatan: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    waUrl: string;
    branchName: string;
  } | null>(null);

  const layananOptions = [
    "Periksa Mata Komputerisasi",
    "Pilihan Frame Kacamata di Rumah",
    "Ganti Lensa (Minus/Silinder/Bluechromic)",
    "Pemeriksaan Mata Lansia / Tirah Baring",
    "Konsultasi Softlens",
  ];

  const handleLayananToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.layanan.includes(item);
      if (exists) {
        return { ...prev, layanan: prev.layanan.filter((l) => l !== item) };
      } else {
        return { ...prev, layanan: [...prev.layanan, item] };
      }
    });
  };

  const currentBranch =
    CS_BRANCHES.find((b) => b.id === selectedBranchId) || CS_BRANCHES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.nama || !formData.whatsapp || !formData.alamat || !formData.tanggal) {
      alert("Mohon lengkapi nama, nomor WhatsApp, alamat, dan tanggal kunjungan.");
      setIsSubmitting(false);
      return;
    }

    try {
      const bookingData = {
        nama: formData.nama,
        whatsapp: formData.whatsapp,
        cabang: currentBranch.name,
        alamat: formData.alamat,
        jadwal: `${formData.tanggal} pukul ${formData.waktu} WIB`,
        jumlahOrang: formData.jumlahOrang,
        layanan: formData.layanan,
        catatan: formData.catatan,
      };

      const res = await fetch("/api/home-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const json = await res.json();
      const bookingId = json.data?.id || `HS-${Date.now().toString(36).toUpperCase()}`;

      // Build structured WhatsApp message to selected branch
      const message = `Halo CS Optik I See You *${currentBranch.name}*,

Saya ingin melakukan pemesanan jadwal *Home Service (Periksa Mata di Rumah/Kantor)*:

👤 *Nama Pemesan*: ${formData.nama}
📱 *No. WhatsApp*: ${formData.whatsapp}
📍 *Alamat Kunjungan*:
${formData.alamat}

📅 *Jadwal Kunjungan*: ${formData.tanggal} pukul ${formData.waktu} WIB
👥 *Jumlah Orang*: ${formData.jumlahOrang}
👓 *Layanan yang Dibutuhkan*:
${formData.layanan.map((l) => `• ${l}`).join("\n")}
${formData.catatan ? `\n📝 *Catatan Khusus*: ${formData.catatan}` : ""}

(ID Booking Web: #${bookingId})

Mohon konfirmasi ketersediaan jadwal tim refraksionis ke lokasi saya. Terima kasih!`;

      const encoded = encodeURIComponent(message);
      const waUrl = `https://wa.me/${currentBranch.phoneWa}?text=${encoded}`;

      setSubmittedData({
        id: bookingId,
        waUrl,
        branchName: currentBranch.name,
      });

      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kendala saat mengirim booking. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-isy-ivory text-isy-ink select-none flex flex-col justify-between">
      <Navbar />

      <div className="pt-4 sm:pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Top Navigation Row (Strictly Top Left) */}
        <div className="flex items-center justify-between w-full mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-xs font-semibold text-slate-700 hover:text-isy-green-deep hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Beranda</span>
          </Link>

          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
            VIP Home Service • Optik I See You
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>Layanan Periksa Mata di Rumah</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3">
            Home Service Optik I See You
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            Tidak sempat ke optik? Tim optometri berlisensi kami siap datang langsung ke kediaman atau kantor Anda dengan membawa alat komputer lengkap dan 100+ pilihan frame kacamata.
          </p>
        </div>

        {/* Home Service Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Alat Komputer Lengkap</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Pemeriksaan visus refraksi presisi standar optik</p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
              <Glasses className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Bawa 100+ Frame Pilihan</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Bisa coba langsung santai bareng keluarga di rumah</p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Ramah Lansia &amp; Balita</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Cocok untuk orang tua yang sulit bepergian keluar</p>
            </div>
          </div>
        </div>

        {/* ── HOME SERVICE FORM ── */}
        <div className="rounded-3xl border border-black/5 bg-white/95 backdrop-blur-xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          {submittedData ? (
            /* Success State */
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pemesanan Tercatat
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-2">
                Booking Home Service Berhasil!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                Permintaan Home Service untuk <strong>Optik I See You {submittedData.branchName}</strong> telah tercatat dengan ID{" "}
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  #{submittedData.id}
                </span>
                . Silakan klik tombol di bawah untuk melanjutkan chat langsung dengan CS cabang terkait.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <a
                  href={submittedData.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-isy-green-deep px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-isy-green-bright transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Buka Chat WhatsApp CS {submittedData.branchName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Pesan Jadwal Lain</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Pilih Cabang Terdekat */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-isy-green-deep" />
                  <span>1. Pilih Cabang Optik I See You Terdekat</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CS_BRANCHES.map((b) => {
                    const isSelected = selectedBranchId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                            : "bg-slate-50/60 border-black/5 text-slate-600 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-xs font-bold block">{b.name}</strong>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{b.address}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Data Pemesan & Lokasi */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-isy-green-deep" />
                  <span>2. Identitas Pemesan &amp; Alamat Kunjungan</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Rina / Bpk. Hendra"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">
                        +62
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="81234567890"
                        value={formData.whatsapp.replace(/^(\+?62|0)/, "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            whatsapp: "0" + e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Lengkap &amp; Patokan Rumah/Kantor <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Contoh: Jl. Ahmad Yani No. 12, Kel. Kranji (Depan Masjid Al-Ikhlas pagar hitam)"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                  />
                </div>
              </div>

              {/* Step 3: Waktu & Jumlah Orang */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-isy-green-deep" />
                  <span>3. Jadwal Kunjungan &amp; Rencana Pemeriksaan</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilihan Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimasi Jam Kunjungan
                    </label>
                    <select
                      value={formData.waktu}
                      onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all cursor-pointer"
                    >
                      <option value="09:00">09:00 WIB (Pagi)</option>
                      <option value="10:30">10:30 WIB (Pagi)</option>
                      <option value="13:30">13:30 WIB (Siang)</option>
                      <option value="15:30">15:30 WIB (Sore)</option>
                      <option value="19:00">19:00 WIB (Malam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Jumlah Orang yang Diperiksa
                    </label>
                    <select
                      value={formData.jumlahOrang}
                      onChange={(e) => setFormData({ ...formData, jumlahOrang: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all cursor-pointer"
                    >
                      <option value="1 Orang">1 Orang</option>
                      <option value="2 - 3 Orang">2 - 3 Orang (Keluarga)</option>
                      <option value="4 - 6 Orang">4 - 6 Orang (Keluarga Besar)</option>
                      <option value="Rombongan Kantor (> 6 orang)">Rombongan Kantor (&gt; 6 orang)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Layanan yang Diinginkan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {layananOptions.map((opt) => {
                      const isChecked = formData.layanan.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-emerald-50/60 border-emerald-500/40 text-emerald-950 font-semibold"
                              : "bg-slate-50 border-black/5 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleLayananToggle(opt)}
                            className="rounded text-isy-green-deep focus:ring-isy-green-deep h-4 w-4"
                          />
                          <span className="text-xs">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Keluhan Mata / Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mata sering perih di depan laptop, ingin coba frame bulat titanium"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-black/5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full bg-isy-green-deep text-white text-xs sm:text-sm font-semibold hover:bg-isy-green-bright transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Menyiapkan Jadwal..."
                      : `Booking Home Service via CS Optik ${currentBranch.name}`}
                  </span>
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Setelah klik kirim, sistem akan langsung menghubungkan Anda ke WhatsApp CS Optik I See You {currentBranch.name} ({currentBranch.phoneDisplay}) untuk konfirmasi jam kedatangan.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
