"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  Camera,
  X,
  ZoomIn,
} from "lucide-react";
import { CS_BRANCHES } from "@/components/ui/ContactCSModal";

interface HomeServiceGalleryItem {
  id: string;
  image: string;
  category: string;
  title: string;
  desc: string;
}

const HOME_SERVICE_GALLERY: HomeServiceGalleryItem[] = [
  {
    id: "periksa-mata",
    image: "/home-service-gallery/hs-fitting.webp",
    category: "Pemeriksaan Digital",
    title: "Peralatan Cek Mata Lengkap Tiba di Lokasi",
    desc: "Refraksionis membawa alat autorefractor komputer dan koper trial lens set untuk memeriksa visus (minus, plus, silinder) secara akurat di tempat Anda.",
  },
  {
    id: "pilihan-frame",
    image: "/home-service-gallery/hs-frame-selection.webp",
    category: "Pilihan Koleksi",
    title: "100+ Pilihan Frame Kacamata Dibawa Langsung",
    desc: "Kotak display bertingkat berisi puluhan frame tren kekinian siap dicoba santai sepuasnya tanpa rasa canggung atau terburu-buru.",
  },
  {
    id: "suasana-keluarga",
    image: "/home-service-gallery/hs-consultation.webp",
    category: "Keluarga & Santai",
    title: "Coba Bareng Keluarga & Minta Pendapat Langsung",
    desc: "Sangat ideal untuk keluarga: ayah, ibu, anak, hingga lansia bisa periksa mata bersamaan sambil santai berdiskusi di ruang tamu rumah.",
  },
  {
    id: "kunjungan-kantor",
    image: "/home-service-gallery/hs-office-visit.webp",
    category: "Instansi & Kantor",
    title: "Layanan Kolektif Kantor, Komunitas & Instansi",
    desc: "Kami juga rutin melayani pemeriksaan mata terpadu untuk karyawan perusahaan, kantor pemerintahan, komunitas, hingga perkumpulan arisan.",
  },
  {
    id: "fitting-presisi",
    image: "/home-service-gallery/hs-team-service.webp",
    category: "Pelayanan Ahli",
    title: "Konsultasi Lensa Spesifik & Fitting Proporsional",
    desc: "Edukasi kebutuhan lensa seperti Bluechromic anti radiasi gadget, progresif lansia, serta penyetelan frame agar presisi dan nyaman seharian.",
  },
  {
    id: "uji-visus",
    image: "/home-service-gallery/hs-eye-test.webp",
    category: "Standar Optometri",
    title: "Uji Ketajaman Penglihatan Bebas Pusing",
    desc: "Standar uji visus jarak jauh menggunakan Snellen chart untuk memastikan hasil kacamata jernih, tajam, dan tidak menyebabkan mata lelah.",
  },
];

export default function HomeServicePage() {
  const [selectedBranchId, setSelectedBranchId] = useState("purwokerto");
  const [selectedPhoto, setSelectedPhoto] = useState<HomeServiceGalleryItem | null>(null);

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

      <div className="pt-4 sm:pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Top Navigation Row */}
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
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans text-slate-900 tracking-tight mb-3 text-center">
            Home Service Optik I See You
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto text-center">
            Tidak sempat ke optik? Tim optometri berlisensi kami siap datang langsung ke kediaman atau kantor Anda dengan membawa alat komputer lengkap dan 100+ pilihan frame kacamata.
          </p>
        </div>

        {/* Home Service Features — Clean, Minimalist, No Icon Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12">
          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-5 text-center shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Alat Komputer Lengkap</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Pemeriksaan visus refraksi presisi standar optik</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-5 text-center shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Bawa 100+ Frame Pilihan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Bisa coba langsung santai bareng keluarga di rumah</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-5 text-center shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Ramah Lansia &amp; Balita</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Cocok untuk orang tua yang sulit bepergian keluar</p>
          </div>
        </div>

        {/* ═══ REAL DOCUMENTATION & VISUAL SHOWCASE ═══ */}
        <section className="mb-14 sm:mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-sans text-slate-900 tracking-tight">
              Seperti Apa Suasana Home Service?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              Intip dokumentasi pengalaman nyata saat tim refraksionis Optik I See You melayani pemeriksaan mata dan pemilihan frame langsung di kediaman &amp; kantor pelanggan:
            </p>
          </div>

          {/* Clean 6-Card Visual Grid with Smooth Shadows and Zero Text Overlay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {HOME_SERVICE_GALLERY.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group relative flex flex-col justify-between rounded-3xl border border-black/5 bg-white/95 p-4 shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1.5 cursor-pointer"
              >
                {/* 100% Clean Image Container with smooth shadow & zoom */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xs group-hover:shadow-md transition-all duration-500 ease-out">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Zoom Hint on Hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold shadow-lg">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Lihat Foto Penuh</span>
                    </span>
                  </div>
                </div>

                {/* Editorial Details below the photo (Zero text overlay on the photo object) */}
                <div className="pt-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 mb-2">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-isy-green-deep transition-colors leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-isy-green-deep group-hover:text-isy-green-bright transition-colors">
                    <span>Lihat Dokumentasi</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
              <div className="text-center sm:text-left pb-2 border-b border-black/5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-isy-green-deep">Formulir Reservasi</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Atur Jadwal Kunjungan ke Tempat Anda
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data di bawah ini untuk mengonfirmasi jadwal refraksionis terdekat ke lokasi Anda.
                </p>
              </div>

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
                        className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-600 shadow-sm ring-1 ring-emerald-600"
                            : "bg-white border-black/10 hover:border-black/20 hover:bg-slate-50/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? "text-emerald-950" : "text-slate-800"
                            }`}
                          >
                            {b.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{b.address}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Form Identitas & Alamat */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-isy-green-deep" />
                  <span>2. Data Pemesan &amp; Lokasi Kunjungan</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat Lengkap Kunjungan (Rumah / Kantor) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Contoh: Jl. Ringin Tirto No. 12, Bancarkembar, Purwokerto Utara (Dekat Lapangan Bancarkembar)"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                  />
                </div>
              </div>

              {/* Step 3: Waktu & Jumlah Orang */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-isy-green-deep" />
                  <span>3. Jadwal &amp; Jumlah Orang yang Diperiksa</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tanggal Kunjungan *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Perkiraan Jam
                    </label>
                    <select
                      value={formData.waktu}
                      onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    >
                      <option value="09:00">09:00 WIB (Pagi)</option>
                      <option value="10:00">10:00 WIB (Pagi)</option>
                      <option value="11:00">11:00 WIB (Siang)</option>
                      <option value="13:00">13:00 WIB (Siang)</option>
                      <option value="14:00">14:00 WIB (Sore)</option>
                      <option value="15:30">15:30 WIB (Sore)</option>
                      <option value="16:30">16:30 WIB (Sore)</option>
                      <option value="19:00">19:00 WIB (Malam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Jumlah Orang yang Periksa
                    </label>
                    <select
                      value={formData.jumlahOrang}
                      onChange={(e) => setFormData({ ...formData, jumlahOrang: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    >
                      <option value="1 Orang">1 Orang</option>
                      <option value="2 Orang">2 Orang</option>
                      <option value="3 - 4 Orang (Keluarga)">3 - 4 Orang (Keluarga)</option>
                      <option value="5 - 10 Orang (Rombongan)">5 - 10 Orang (Rombongan)</option>
                      <option value="Lebih dari 10 Orang (Kantor/Komunitas)">Lebih dari 10 Orang (Kantor/Komunitas)</option>
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

      {/* ═══ LIGHTBOX MODAL FOR PHOTO ZOOM ═══ */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[3/4] w-full bg-slate-900">
              <Image
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 512px"
              />
            </div>

            <div className="p-6 bg-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 mb-2">
                {selectedPhoto.category}
              </span>
              <h3 className="font-serif text-xl font-bold text-slate-900 leading-snug mb-2">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedPhoto.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
