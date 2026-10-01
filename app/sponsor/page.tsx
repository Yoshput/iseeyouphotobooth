"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  FileText,
  Users,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Award,
  UploadCloud,
  FileUp,
  FileCheck,
  X,
  RefreshCw,
} from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function SponsorPage() {
  const [formData, setFormData] = useState({
    nama: "",
    instansi: "",
    whatsapp: "",
    email: "",
    cabang: "Purwokerto",
    namaKegiatan: "",
    tanggalKegiatan: "",
    targetPeserta: "",
    resumeKegiatan: "",
    bentukSponsor: ["Voucher Diskon Peserta", "Stan Cek Mata Gratis"] as string[],
    proposalUrl: "",
  });

  const [proposalMode, setProposalMode] = useState<"upload" | "link">("upload");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    originalSize: string;
    finalSize: string;
    savedPercentage: number;
    url: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    waUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bentukOptions = [
    "Voucher Diskon Peserta",
    "Stan Cek Mata Gratis di Lokasi",
    "Photobooth AR Event",
    "Merchandise & Doorprize Kacamata",
    "Dana Sponsorship",
    "Media Partner / Publikasi",
  ];

  const handleCheckbox = (option: string) => {
    setFormData((prev) => {
      const exists = prev.bentukSponsor.includes(option);
      if (exists) {
        return {
          ...prev,
          bentukSponsor: prev.bentukSponsor.filter((o) => o !== option),
        };
      } else {
        return {
          ...prev,
          bentukSponsor: [...prev.bentukSponsor, option],
        };
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setUploadError("Hanya file dokumen format PDF (.pdf) yang diperbolehkan.");
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setUploadError("Ukuran file melebihi batas 40MB. Silakan gunakan opsi Tautkan Link Cloud.");
      return;
    }

    setUploadError(null);
    setIsUploadingFile(true);

    try {
      // 1. Dapatkan Presigned URL untuk Direct Upload ke Cloudflare R2 (Bypass Limit 4.5MB Vercel)
      const presignRes = await fetch("/api/sponsor/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "application/pdf",
          fileSize: file.size,
        }),
      });

      const presignJson = await presignRes.json();

      if (presignRes.ok && presignJson.success && presignJson.uploadUrl) {
        // Direct upload dari browser langsung ke Cloudflare R2 via HTTP PUT
        const r2UploadRes = await fetch(presignJson.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/pdf",
          },
          body: file,
        });

        if (r2UploadRes.ok) {
          setUploadedFileInfo({
            name: file.name,
            originalSize: formatBytes(file.size),
            finalSize: formatBytes(file.size),
            savedPercentage: 0,
            url: presignJson.publicUrl,
          });
          setFormData((prev) => ({ ...prev, proposalUrl: presignJson.publicUrl }));
          return;
        } else {
          console.error("Direct R2 upload status error:", r2UploadRes.status);
          if (r2UploadRes.status === 403) {
            setUploadError("Akses upload ditolak (403 Forbidden). Kredensial R2 di Vercel belum diperbarui ke Access Key yang baru.");
            return;
          }
        }
      }

      // 2. Fallback: upload standar via API jika presign tidak aktif
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/sponsor/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setUploadedFileInfo({
          name: file.name,
          originalSize: formatBytes(json.originalSize),
          finalSize: formatBytes(json.finalSize),
          savedPercentage: json.savedPercentage || 0,
          url: json.url,
        });
        setFormData((prev) => ({ ...prev, proposalUrl: json.url }));
      } else {
        setUploadError(
          json.error ||
            "Gagal mengunggah file. Jika ukuran melebihi 4.5MB, gunakan opsi Tautkan Link Cloud."
        );
      }
    } catch (err: any) {
      setUploadError("Gagal mengunggah file PDF proposal. Periksa koneksi internet Anda.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileInfo(null);
    setUploadError(null);
    setFormData((prev) => ({ ...prev, proposalUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Basic validation
    if (!formData.nama || !formData.instansi || !formData.whatsapp || !formData.namaKegiatan) {
      setErrorMsg("Mohon lengkapi seluruh kolom wajib bertanda bintang (*).");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengajukan proposal");
      }

      const proposalId = json.data?.id || `SPN-${Date.now().toString(36).toUpperCase()}`;

      // Build structured WhatsApp message to staff marketing (087778683766)
      const marketingPhone = "6287778683766";
      const message = `*PENGAJUAN PROPOSAL SPONSORSHIP*
*OPTIK I SEE YOU*
────────────────────────────

Halo Kak Yossika (Tim Marketing Optik I See You),
Saya bermaksud mengajukan proposal sponsorship untuk kegiatan kami:

*1. DETAIL ACARA & PENYELENGGARA*
• Nama Acara: *${formData.namaKegiatan}*
• Penyelenggara: ${formData.instansi}
• Penanggung Jawab (PIC): ${formData.nama}
• No. WhatsApp PIC: ${formData.whatsapp}
• Cabang Tertuju: Optik I See You ${formData.cabang}
• Tanggal Acara: ${formData.tanggalKegiatan || "-"}
• Target Peserta: ${formData.targetPeserta || "-"} orang
• Bentuk Kerjasama: ${formData.bentukSponsor.join(", ") || "Fleksibel"}

*2. RINGKASAN KEGIATAN*
"${formData.resumeKegiatan || "Terlampir lengkap di dalam berkas proposal resmi."}"

*3. BERKAS DOKUMEN PROPOSAL*
${formData.proposalUrl || "Akan dilampirkan via chat WhatsApp"}

────────────────────────────
*ID Registrasi Web:* #${proposalId}

Mohon kesediaan waktu Kak Yossika untuk berdiskusi lebih lanjut mengenai bentuk kemitraan ini. Terima kasih banyak!`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${marketingPhone}?text=${encodedMessage}`;

      setSubmittedData({
        id: proposalId,
        waUrl,
      });

      // Automatically open WhatsApp in a new tab for seamless user experience
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan koneksi. Silakan coba lagi.");
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
            Official Partnership • Optik I See You
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kemitraan &amp; Sponsorship Event</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3">
            Ajukan Kerjasama Sponsorship
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            Dukung kesuksesan event kampus, sekolah, komunitas, dan instansimu bersama Optik I See You di 4 cabang resmi: Purwokerto, Purbalingga, Wonosobo, dan Cilacap.
          </p>
        </div>

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 text-center shadow-xs">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5">
              <Award className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Voucher Diskon</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Voucher belanja kacamata untuk seluruh peserta</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 text-center shadow-xs">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Stan Cek Mata</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Pemeriksaan visus komputer gratis on-the-spot</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 text-center shadow-xs">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Photobooth AR</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Interaktif live try-on kacamata untuk crowd event</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/90 backdrop-blur-md p-4 text-center shadow-xs">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-2.5">
              <Building2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Dukungan Dana</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Dana sponsorship &amp; goodie bag merchandise</p>
          </div>
        </div>

        {/* ── SPONSORSHIP APPLICATION FORM ── */}
        <div className="rounded-3xl border border-black/5 bg-white/95 backdrop-blur-xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          {submittedData ? (
            /* Success State */
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pengajuan Terkirim
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-2">
                Terima Kasih, Proposal Anda Telah Diterima!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                Data proposal telah tersimpan di sistem Optik I See You dengan nomor registrasi{" "}
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  #{submittedData.id}
                </span>
                . Silakan klik tombol di bawah untuk melanjutkan chat langsung dengan Staff Marketing kami via WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <a
                  href={submittedData.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-isy-green-deep px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-isy-green-bright transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Buka WhatsApp Marketing Sekarang</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                    setFormData({
                      nama: "",
                      instansi: "",
                      whatsapp: "",
                      email: "",
                      cabang: "Purwokerto",
                      namaKegiatan: "",
                      tanggalKegiatan: "",
                      targetPeserta: "",
                      resumeKegiatan: "",
                      bentukSponsor: ["Voucher Diskon Peserta"],
                      proposalUrl: "",
                    });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Ajukan Proposal Lain</span>
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in duration-150">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: Data PIC & Lembaga */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-black/5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-isy-green-deep" />
                  <span>1. Identitas Penyelenggara &amp; Kontak</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Penanggung Jawab (PIC) <span className="text-rose-500">*</span>
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
                      Lembaga / Kampus / Komunitas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: BEM Telkom University / Karang Taruna"
                      value={formData.instansi}
                      onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp PIC <span className="text-rose-500">*</span>
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Resmi (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="panitia@kampus.ac.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Detail Kegiatan */}
              <div className="pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-black/5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-isy-green-deep" />
                  <span>2. Detail Acara &amp; Target Audiens</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Kegiatan / Acara <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Seminar Nasional Kesehatan Mata 2026"
                      value={formData.namaKegiatan}
                      onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cabang Terdekat <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.cabang}
                      onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all cursor-pointer"
                    >
                      <option value="Purwokerto">Optik I See You Purwokerto</option>
                      <option value="Purbalingga">Optik I See You Purbalingga</option>
                      <option value="Wonosobo">Optik I See You Wonosobo</option>
                      <option value="Cilacap">Optik I See You Cilacap</option>
                      <option value="Semua Cabang">Semua Cabang (Event Regional)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tanggal Pelaksanaan
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalKegiatan}
                      onChange={(e) => setFormData({ ...formData, tanggalKegiatan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Jumlah Peserta
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 300 - 500 orang"
                      value={formData.targetPeserta}
                      onChange={(e) => setFormData({ ...formData, targetPeserta: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bentuk Kemitraan yang Diajukan (Boleh Pilih Lebih dari Satu)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {bentukOptions.map((opt) => {
                      const isChecked = formData.bentukSponsor.includes(opt);
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
                            onChange={() => handleCheckbox(opt)}
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
                    Resume / Ringkasan Singkat Kegiatan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ceritakan gambaran singkat acara, tujuan, dan bagaimana Optik I See You dapat berkolaborasi..."
                    value={formData.resumeKegiatan}
                    onChange={(e) => setFormData({ ...formData, resumeKegiatan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                  />
                </div>
              </div>

              {/* Section 3: Berkas / Link Proposal */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-3 border-b border-black/5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-isy-green-deep" />
                    <span>3. Berkas Proposal Kegiatan</span>
                  </h3>

                  {/* Mode Switcher Tabs */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-black/5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setProposalMode("upload")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        proposalMode === "upload"
                          ? "bg-white text-isy-green-deep shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Upload File PDF Langsung
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposalMode("link")}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        proposalMode === "link"
                          ? "bg-white text-isy-green-deep shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Gunakan Link Cloud (Drive)
                    </button>
                  </div>
                </div>

                {proposalMode === "upload" ? (
                  <div className="space-y-3">
                    {uploadedFileInfo ? (
                      /* Uploaded File Card — Sleek Apple/iOS Style */
                      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-isy-green-deep text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {uploadedFileInfo.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-medium text-slate-600">{uploadedFileInfo.originalSize}</span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Proposal Siap Diajukan</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                          title="Ganti Dokumen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isUploadingFile ? (
                      /* Uploading State */
                      <div className="p-8 rounded-2xl border-2 border-dashed border-emerald-400/80 bg-emerald-50/30 text-center space-y-2">
                        <RefreshCw className="w-6 h-6 mx-auto text-isy-green-deep animate-spin" />
                        <p className="text-xs font-bold text-slate-800">
                          Mengunggah Dokumen Proposal...
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Mohon tunggu sebentar, berkas sedang diproses dengan aman ke server Cloudflare.
                        </p>
                      </div>
                    ) : (
                      /* File Drop Area */
                      <label className="group relative block rounded-2xl border-2 border-dashed border-slate-300 hover:border-isy-green-deep/60 bg-slate-50/70 hover:bg-emerald-50/30 p-6 sm:p-8 text-center transition-all cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-300 text-slate-600 group-hover:text-isy-green-deep flex items-center justify-center mb-3 shadow-xs transition-colors">
                          <UploadCloud className="w-6 h-6 stroke-[1.75]" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-isy-green-deep transition-colors">
                          Klik untuk Memilih File PDF Proposal atau Seret ke Sini
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Format resmi <strong>.PDF</strong> (Maksimal 40MB).
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300/40 text-[10.5px] font-semibold text-emerald-800">
                          <Sparkles className="w-3 h-3" />
                          <span>Penyimpanan Aman Terenkripsi Cloudflare R2</span>
                        </div>
                      </label>
                    )}

                    {uploadError && (
                      <p className="text-rose-600 text-xs font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        {uploadError}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Mode: Google Drive / Dropbox Link */
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Link File Proposal (Google Drive / Dropbox / Cloud Link)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={formData.proposalUrl}
                      onChange={(e) => setFormData({ ...formData, proposalUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-isy-green-deep/30 focus:border-isy-green-deep transition-all"
                    />
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-black/5 text-[11px] text-slate-500 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Tips Google Drive:</strong> Pastikan hak akses file proposal telah diatur ke{" "}
                        <em>&ldquo;Siapa saja yang memiliki link (Anyone with the link)&rdquo;</em> agar tim marketing dapat langsung mereview tanpa izin manual.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-black/5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full bg-isy-green-deep text-white text-xs sm:text-sm font-semibold hover:bg-isy-green-bright transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Mengirimkan Pengajuan..." : "Kirim Pengajuan Sponsorship"}</span>
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Setelah submit, sistem otomatis mengarahkan ke WhatsApp Staff Marketing (0877-7868-3766) untuk konfirmasi langsung.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Fast Contact Callout to Marketing Staff */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl border border-emerald-500/20 bg-emerald-50/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Ada Pertanyaan Kemitraan Cepat?
              </h4>
              <p className="text-[11px] text-slate-600">
                Hubungi langsung Staff Marketing Optik I See You via WhatsApp: <strong>0877-7868-3766</strong>
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6287778683766?text=Halo%20Kak%20Yossika%20(Marketing%20Optik%20I%20See%20You)%2C%20saya%20mau%20konsultasi%20mengenai%20kemitraan%20sponsorship%20acara."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all active:scale-95 shadow-xs flex items-center gap-1.5"
          >
            <span>Chat WhatsApp Marketing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </main>
  );
}
