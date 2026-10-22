"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Download,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  X,
  FileText,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { SponsorshipItem } from "@/lib/db/sponsorships";
import AdminToast, { useAdminToast } from "@/components/admin/AdminToast";

export default function AdminSponsorPage() {
  // ── Data & Filter States ───────────────────────────────────────────────────
  const [items, setItems] = useState<SponsorshipItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama">("terbaru");

  // ── Modals & Drawers ───────────────────────────────────────────────────────
  const [isGSheetModalOpen, setIsGSheetModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<SponsorshipItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SponsorshipItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Internal Notes State (Inside Detail Modal) ────────────────────────────
  const [internalNotes, setInternalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // ── Quick Toast Notification — shared accessible component ───────────────
  const { toast, showToast, dismissToast } = useAdminToast();

  // ── Fetch Sponsorship Data ─────────────────────────────────────────────────
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sponsor");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Failed to load sponsorship data:", err);
      showToast("Gagal memuat data proposal", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync internal notes state when detail item changes
  useEffect(() => {
    if (selectedDetailItem) {
      setInternalNotes(selectedDetailItem.catatanInternal || "");
    }
  }, [selectedDetailItem]);

  // ── Update Status Handler ──────────────────────────────────────────────────
  const handleStatusChange = async (id: string, newStatus: SponsorshipItem["status"]) => {
    try {
      const res = await fetch("/api/sponsor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedDetailItem && selectedDetailItem.id === id) {
          setSelectedDetailItem((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(`Status berhasil diubah ke: ${newStatus}`, "success");
      } else {
        showToast(data.error || "Gagal mengubah status proposal", "error");
      }
    } catch {
      showToast("Gagal menghubungi server untuk update status", "error");
    }
  };

  // ── Save Internal Notes Handler ────────────────────────────────────────────
  const handleSaveInternalNotes = async () => {
    if (!selectedDetailItem) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch("/api/sponsor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDetailItem.id,
          catatanInternal: internalNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedDetailItem.id
              ? { ...item, catatanInternal: internalNotes }
              : item
          )
        );
        setSelectedDetailItem((prev) =>
          prev ? { ...prev, catatanInternal: internalNotes } : null
        );
        showToast("Catatan internal berhasil disimpan", "success");
      } else {
        showToast(data.error || "Gagal menyimpan catatan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan catatan", "error");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // ── Delete Proposal Handler ────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sponsor?id=${encodeURIComponent(itemToDelete.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        if (selectedDetailItem?.id === itemToDelete.id) {
          setSelectedDetailItem(null);
        }
        setItemToDelete(null);
        showToast("Proposal berhasil dihapus", "success");
      } else {
        showToast(data.error || "Gagal menghapus proposal", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menghapus proposal", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Export CSV Handler ─────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (items.length === 0) {
      showToast("Tidak ada data untuk diekspor", "info");
      return;
    }

    const headers = [
      "ID",
      "Tanggal Pengajuan",
      "Instansi / Organisasi",
      "Nama PIC",
      "WhatsApp",
      "Email",
      "Cabang ISY",
      "Nama Kegiatan",
      "Tanggal Kegiatan",
      "Target Peserta",
      "Bentuk Sponsor",
      "Status",
      "Proposal URL",
      "Catatan Internal",
    ];

    const rows = items.map((i) => [
      i.id,
      new Date(i.createdAt).toLocaleString("id-ID"),
      `"${(i.instansi || "").replace(/"/g, '""')}"`,
      `"${(i.nama || "").replace(/"/g, '""')}"`,
      `'${i.whatsapp}`,
      i.email || "",
      i.cabang || "",
      `"${(i.namaKegiatan || "").replace(/"/g, '""')}"`,
      i.tanggalKegiatan || "",
      i.targetPeserta || "",
      `"${(i.bentukSponsor || []).join(", ").replace(/"/g, '""')}"`,
      i.status || "Menunggu Review",
      i.proposalUrl || "",
      `"${(i.catatanInternal || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sponsorship_Optik_I_See_You_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data proposal berhasil diekspor ke CSV", "success");
  };

  // ── Filter & Search Logic ──────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Cabang filter
        if (selectedCabang !== "Semua" && item.cabang !== selectedCabang) {
          return false;
        }
        // Status filter
        if (selectedStatus !== "Semua" && item.status !== selectedStatus) {
          return false;
        }
        // Search query
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchInstansi = item.instansi?.toLowerCase().includes(q);
          const matchNama = item.nama?.toLowerCase().includes(q);
          const matchAcara = item.namaKegiatan?.toLowerCase().includes(q);
          const matchWA = item.whatsapp?.includes(q);
          const matchId = item.id?.toLowerCase().includes(q);
          return matchInstansi || matchNama || matchAcara || matchWA || matchId;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortBy === "terbaru" ? dateB - dateA : dateA - dateB;
      });
  }, [items, selectedCabang, selectedStatus, searchQuery, sortBy]);

  // ── Stat Counter Computations ──────────────────────────────────────────────
  const totalCount = items.length;
  const pendingCount = items.filter((i) => i.status === "Menunggu Review").length;
  const approvedCount = items.filter((i) => i.status === "Disetujui").length;
  const rejectedCount = items.filter((i) => i.status === "Ditolak").length;

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Shared Accessible Toast */}
      <AdminToast toast={toast} onDismiss={dismissToast} />

      {/* ── 1. TOP HEADER & CONTROLS (FIXED — Tidak Ikut Ter-scroll) ── */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <FileSpreadsheet className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Proposal Sponsorship</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola pengajuan proposal sponsor kegiatan masuk, status approval, dan sinkronisasi data
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/sponsor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-isy-line bg-white hover:bg-isy-mist text-isy-emerald text-xs font-bold transition-colors shadow-xs"
              title="Buka form pengajuan sponsorship publik (/sponsor)"
            >
              <span>Form Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsGSheetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-isy-line bg-white hover:bg-isy-mist text-isy-emerald text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-isy-line bg-white hover:bg-isy-mist text-isy-emerald text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-isy-emerald hover:bg-isy-emerald-hover text-white text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* Clean Interactive Stat Cards (Click to Filter) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Total Pengajuan */}
          <button
            type="button"
            onClick={() => setSelectedStatus("Semua")}
            className={`rounded-2xl border bg-white p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
              selectedStatus === "Semua"
                ? "border-isy-emerald ring-2 ring-isy-emerald/20 shadow-xs"
                : "border-isy-line hover:border-isy-emerald/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-isy-text-secondary uppercase tracking-wider">
                Total Pengajuan
              </span>
              {selectedStatus === "Semua" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-isy-emerald bg-isy-mist px-2 py-0.5 rounded-full border border-isy-line">
                  Aktif
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-isy-emerald font-mono">
                {totalCount}
              </span>
              <span className="text-[11px] text-isy-text-secondary font-medium">Semua data</span>
            </div>
          </button>

          {/* Card 2: Menunggu Review */}
          <button
            type="button"
            onClick={() => setSelectedStatus("Menunggu Review")}
            className={`rounded-2xl border bg-amber-50/70 p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
              selectedStatus === "Menunggu Review"
                ? "border-amber-500 ring-2 ring-amber-500/25 shadow-xs bg-amber-50"
                : "border-amber-200 hover:border-amber-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                Menunggu Review
              </span>
              {selectedStatus === "Menunggu Review" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                {pendingCount}
              </span>
              <span className="text-[11px] text-amber-900/80 font-medium">Perlu dicek</span>
            </div>
          </button>

          {/* Card 3: Disetujui */}
          <button
            type="button"
            onClick={() => setSelectedStatus("Disetujui")}
            className={`rounded-2xl border bg-emerald-50/70 p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
              selectedStatus === "Disetujui"
                ? "border-isy-emerald ring-2 ring-isy-emerald/25 shadow-xs bg-emerald-50"
                : "border-emerald-200 hover:border-emerald-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-isy-emerald uppercase tracking-wider">
                Disetujui
              </span>
              {selectedStatus === "Disetujui" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-isy-emerald bg-white px-2 py-0.5 rounded-full border border-isy-line">
                  Aktif
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-isy-emerald font-mono">
                {approvedCount}
              </span>
              <span className="text-[11px] text-isy-green-bright font-medium">Bekerjasama</span>
            </div>
          </button>

          {/* Card 4: Ditolak / Selesai */}
          <button
            type="button"
            onClick={() => setSelectedStatus("Ditolak")}
            className={`rounded-2xl border bg-rose-50/70 p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
              selectedStatus === "Ditolak"
                ? "border-rose-400 ring-2 ring-rose-400/25 shadow-xs bg-rose-50"
                : "border-rose-200 hover:border-rose-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                Ditolak
              </span>
              {selectedStatus === "Ditolak" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-900 bg-rose-100 px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-950 font-mono">
                {rejectedCount}
              </span>
              <span className="text-[11px] text-rose-900/80 font-medium">Arsip</span>
            </div>
          </button>
        </div>

        {/* Clean Search & Filter Bar */}
        <div className="rounded-2xl border border-isy-line bg-white p-2.5 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-isy-text-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari PIC, instansi, acara, no WA, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-isy-line bg-isy-mist/40 text-xs text-isy-emerald placeholder:text-isy-text-secondary focus:outline-none focus:ring-2 focus:ring-isy-emerald focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 p-0.5 text-isy-text-secondary hover:text-isy-emerald transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {/* Filter Cabang */}
            <div className="relative">
              <select
                value={selectedCabang}
                onChange={(e) => setSelectedCabang(e.target.value)}
                className="px-3 py-2 rounded-xl border border-isy-line bg-white text-xs font-semibold text-isy-emerald focus:outline-none focus:ring-2 focus:ring-isy-emerald cursor-pointer pr-7 appearance-none"
              >
                <option value="Semua">Semua Cabang</option>
                <option value="Purwokerto">Purwokerto</option>
                <option value="Purbalingga">Purbalingga</option>
                <option value="Wonosobo">Wonosobo</option>
                <option value="Cilacap">Cilacap</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-2.5 text-isy-text-secondary">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-isy-line bg-white text-xs font-semibold text-isy-emerald focus:outline-none focus:ring-2 focus:ring-isy-emerald cursor-pointer pr-7 appearance-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu Review">Menunggu Review</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-2.5 text-isy-text-secondary">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === "terbaru" ? "terlama" : "terbaru"))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-isy-line bg-white hover:bg-isy-mist text-xs font-semibold text-isy-emerald transition-colors cursor-pointer"
              title={`Urutkan: ${sortBy === "terbaru" ? "Terbaru" : "Terlama"}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-isy-emerald" />
              <span className="capitalize">{sortBy}</span>
            </button>

            {/* Reset Button */}
            {(selectedCabang !== "Semua" || selectedStatus !== "Semua" || searchQuery !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCabang("Semua");
                  setSelectedStatus("Semua");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Reset filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between px-1 text-xs text-isy-text-secondary font-medium">
          <span>
            Menampilkan <strong className="text-isy-emerald font-bold">{filteredItems.length}</strong> dari {totalCount} total pengajuan
          </span>
          {selectedStatus !== "Semua" && (
            <span className="text-[11px] text-isy-emerald font-semibold">
              Filter: {selectedStatus}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. TABLE CONTAINER (SCROLLABLE BODY) ── */}
      <div className="flex-1 min-h-0 rounded-2xl border border-isy-line bg-white shadow-xs overflow-hidden flex flex-col">
        {/* Scrollable table viewport */}
        <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto admin-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-isy-text-secondary text-xs space-y-2 px-4">
              <FileText className="w-8 h-8 mx-auto text-isy-text-secondary/40" />
              <p className="font-bold text-sm text-isy-emerald">
                {isLoading ? "Memuat data proposal..." : "Tidak ada pengajuan yang sesuai filter."}
              </p>
              <p className="text-xs text-isy-text-secondary">
                Ubah kata kunci pencarian atau reset filter untuk menampilkan semua data.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-isy-line bg-isy-mist/50 text-isy-emerald font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-xs">
                  <th className="py-3 px-4">Tanggal / ID</th>
                  <th className="py-3 px-4">Instansi dan PIC</th>
                  <th className="py-3 px-4">Nama Acara dan Cabang</th>
                  <th className="py-3 px-4">Target dan Bentuk</th>
                  <th className="py-3 px-4">Proposal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-isy-line">
                {filteredItems.map((item) => {
                  const waClean = item.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
                  const chatText = encodeURIComponent(
                    `Halo Kak ${item.nama} (${item.instansi}), mengenai proposal sponsorship "${item.namaKegiatan}" yang diajukan ke Optik I See You #${item.id}:`
                  );

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-isy-mist/30 transition-colors"
                    >
                      {/* Tanggal & ID */}
                      <td className="py-3 px-4 whitespace-nowrap align-top">
                        <span className="font-mono text-[11px] text-isy-text-secondary font-bold block">
                          #{item.id}
                        </span>
                        <span className="text-xs text-isy-emerald font-medium block mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-isy-text-secondary/60 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Instansi dan PIC */}
                      <td className="py-3 px-4 align-top max-w-[240px]">
                        <strong className="text-isy-emerald block font-bold text-xs leading-snug">
                          {item.instansi}
                        </strong>
                        <span className="text-isy-text-secondary text-[11px] block mt-0.5">
                          PIC: <span className="font-medium text-isy-emerald">{item.nama}</span>
                        </span>
                        <a
                          href={`https://wa.me/${waClean}?text=${chatText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-[11px] text-isy-emerald font-mono hover:underline mt-0.5 font-medium"
                        >
                          {item.whatsapp}
                        </a>
                      </td>

                      {/* Nama Acara dan Cabang */}
                      <td className="py-3 px-4 align-top max-w-[240px]">
                        <span className="text-xs font-semibold text-isy-emerald block leading-snug">
                          {item.namaKegiatan}
                        </span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-block text-[10px] font-bold text-isy-emerald bg-isy-mist px-2 py-0.5 rounded-md border border-isy-line">
                            Cabang: {item.cabang}
                          </span>
                          <span className="text-[10px] text-isy-text-secondary">
                            Tgl: {item.tanggalKegiatan || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Target Peserta & Bentuk Sponsor */}
                      <td className="py-3 px-4 align-top max-w-[200px]">
                        <span className="text-[11px] text-isy-text-secondary block">
                          Target: <strong className="text-isy-emerald">{item.targetPeserta || "-"}</strong>
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(item.bentukSponsor) && item.bentukSponsor.length > 0 ? (
                            item.bentukSponsor.map((b, idx) => (
                              <span
                                key={idx}
                                className="text-[9.5px] font-medium bg-isy-mist px-1.5 py-0.5 rounded text-isy-emerald border border-isy-line"
                              >
                                {b}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-isy-text-secondary italic">Tidak ditentukan</span>
                          )}
                        </div>
                      </td>

                      {/* Proposal File */}
                      <td className="py-3 px-4 whitespace-nowrap align-top">
                        {item.proposalUrl ? (
                          <a
                            href={item.proposalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-isy-line bg-isy-mist/50 hover:bg-isy-emerald hover:text-white text-isy-emerald text-xs font-semibold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Buka PDF</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-isy-text-secondary italic">Via WhatsApp</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap align-top">
                        <select
                          value={item.status || "Menunggu Review"}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as SponsorshipItem["status"]
                            )
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border appearance-none pr-6 relative cursor-pointer focus:outline-none focus:ring-2 ${
                            item.status === "Disetujui"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-500"
                              : item.status === "Menunggu Review"
                              ? "bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-500"
                              : item.status === "Dalam Proses"
                              ? "bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500"
                              : "bg-rose-50 text-rose-800 border-rose-200 focus:ring-rose-500"
                          }`}
                        >
                          <option value="Menunggu Review">Menunggu Review</option>
                          <option value="Dalam Proses">Dalam Proses</option>
                          <option value="Disetujui">Disetujui</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>
                      </td>

                      {/* Aksi Button */}
                      <td className="py-3 px-4 whitespace-nowrap text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(item)}
                            className="px-2.5 py-1 rounded-lg border border-isy-line bg-white hover:bg-isy-mist text-xs font-semibold text-isy-emerald transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Proposal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL DRAWER / MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-xl max-h-[90vh] rounded-2xl border border-isy-line bg-white shadow-xl flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-isy-line bg-isy-mist/40 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-isy-text-secondary font-bold">
                    #{selectedDetailItem.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedDetailItem.status === "Disetujui"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedDetailItem.status === "Menunggu Review"
                        ? "bg-amber-100 text-amber-800"
                        : selectedDetailItem.status === "Dalam Proses"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {selectedDetailItem.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-isy-emerald mt-1">
                  {selectedDetailItem.instansi}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 rounded-full hover:bg-isy-mist text-isy-text-secondary hover:text-isy-emerald cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 admin-scrollbar">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-isy-mist/30 border border-isy-line text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                    Nama PIC
                  </span>
                  <span className="font-semibold text-isy-emerald block mt-0.5">
                    {selectedDetailItem.nama}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                    No WhatsApp
                  </span>
                  <span className="font-mono font-medium text-isy-emerald block mt-0.5">
                    {selectedDetailItem.whatsapp}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                    Email
                  </span>
                  <span className="text-isy-emerald block mt-0.5 truncate">
                    {selectedDetailItem.email || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                    Cabang Pilihan
                  </span>
                  <span className="font-bold text-isy-emerald block mt-0.5">
                    {selectedDetailItem.cabang}
                  </span>
                </div>
              </div>

              {/* Rincian Kegiatan */}
              <div className="p-3.5 rounded-xl bg-isy-mist/30 border border-isy-line text-xs space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                    Nama Kegiatan
                  </span>
                  <span className="font-bold text-isy-emerald block mt-0.5">
                    {selectedDetailItem.namaKegiatan}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-isy-line">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                      Tanggal Pelaksanaan
                    </span>
                    <span className="text-isy-emerald block mt-0.5">
                      {selectedDetailItem.tanggalKegiatan || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                      Target Peserta
                    </span>
                    <span className="text-isy-emerald block mt-0.5">
                      {selectedDetailItem.targetPeserta || "-"}
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-isy-line">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-isy-text-secondary block">
                    Bentuk Dukungan Diajukan
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Array.isArray(selectedDetailItem.bentukSponsor) &&
                    selectedDetailItem.bentukSponsor.length > 0 ? (
                      selectedDetailItem.bentukSponsor.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200"
                        >
                          {b}
                        </span>
                      ))
                    ) : (
                      <span className="text-isy-text-secondary italic">Tidak ada rincian</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume / Deskripsi */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs text-isy-emerald uppercase tracking-wider">
                  Resume dan Deskripsi Kegiatan
                </h4>
                <div className="p-3.5 rounded-xl bg-isy-mist/30 border border-isy-line text-xs leading-relaxed whitespace-pre-line font-normal text-isy-emerald">
                  {selectedDetailItem.resumeKegiatan || "Tidak ada resume tertulis dari pemohon."}
                </div>
              </div>

              {/* Proposal File */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs text-isy-emerald uppercase tracking-wider">
                  Berkas Proposal
                </h4>
                {selectedDetailItem.proposalUrl ? (
                  <a
                    href={selectedDetailItem.proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-isy-emerald hover:text-white transition-colors"
                  >
                    <span className="font-bold text-xs">Buka Berkas Proposal PDF</span>
                    <span className="text-xs">↗</span>
                  </a>
                ) : (
                  <div className="p-3.5 rounded-xl border border-isy-line text-center text-isy-text-secondary italic text-xs">
                    Berkas proposal dikirim melalui chat WhatsApp.
                  </div>
                )}
              </div>

              {/* Catatan Internal Admin */}
              <div className="space-y-1.5 pt-1">
                <h4 className="font-bold text-xs text-isy-emerald uppercase tracking-wider">
                  Catatan Internal Marketing
                </h4>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Tulis catatan internal di sini..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-isy-line bg-white text-xs text-isy-emerald focus:outline-none focus:ring-2 focus:ring-isy-emerald transition-all resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={handleSaveInternalNotes}
                      className="px-4 py-1.5 rounded-lg bg-isy-emerald hover:bg-isy-emerald-hover text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingNotes ? "Menyimpan..." : "Simpan Catatan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-isy-line bg-white flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const toDel = selectedDetailItem;
                  setSelectedDetailItem(null);
                  setItemToDelete(toDel);
                }}
                className="px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Hapus Proposal
              </button>

              <a
                href={`https://wa.me/${selectedDetailItem.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                  `Halo Kak ${selectedDetailItem.nama} (${selectedDetailItem.instansi}), mengenai proposal sponsorship "${selectedDetailItem.namaKegiatan}" yang diajukan ke Optik I See You #${selectedDetailItem.id}:`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-isy-emerald hover:bg-isy-emerald-hover text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Chat WhatsApp PIC
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-sm rounded-2xl border border-isy-line bg-white p-5 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm text-isy-emerald mb-1.5">
              Hapus Pengajuan Sponsorship?
            </h3>
            <p className="text-xs text-isy-text-secondary leading-relaxed mb-4">
              Pengajuan dari <strong>{itemToDelete.instansi}</strong> (#{itemToDelete.id}) akan dihapus permanen.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-isy-line hover:bg-isy-mist text-xs font-semibold text-isy-emerald transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          GOOGLE SHEET / DRIVE INTEGRATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {isGSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-lg rounded-2xl border border-isy-line bg-white p-6 shadow-xl text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-isy-emerald">
                  Sinkronisasi Google Drive dan Spreadsheet
                </h3>
                <p className="text-xs text-isy-text-secondary mt-0.5">
                  Koneksi data pengajuan sponsor real-time tanpa database berbayar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-isy-mist text-isy-text-secondary hover:text-isy-emerald cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-isy-emerald">
              <div className="p-3.5 rounded-xl bg-isy-mist/50 border border-isy-line space-y-2">
                <p className="font-semibold text-isy-emerald">Cara kerja webhook otomatis:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-isy-text-secondary">
                  <li>Buat Google Spreadsheet baru di Google Drive Optik I See You.</li>
                  <li>
                    Buka <strong>Extensions &gt; Apps Script</strong> dan buat endpoint webhook web app sederhana (POST).
                  </li>
                  <li>
                    Masukkan URL Apps Script ke environment variable:
                    <code className="block mt-1 p-2 rounded-lg bg-white border border-isy-line font-mono text-[10px] text-isy-emerald select-all break-all">
                      GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
                    </code>
                  </li>
                  <li>
                    Setiap kali ada pemohon yang mengajukan form di <code>/sponsor</code>, sistem akan otomatis mengirim baris data baru ke Google Spreadsheet Anda secara instan.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11.5px] text-emerald-900 space-y-1">
                <p className="font-bold text-emerald-950">Keuntungan Metode Ini:</p>
                <p>&bull; 100% Gratis selamanya dari Google Workspace.</p>
                <p>&bull; Berkas PDF proposal otomatis tersimpan di Cloudflare R2 / Drive.</p>
                <p>&bull; Tim marketing cabang mana saja bisa langsung membuka spreadsheet dari ponsel tanpa instal aplikasi.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-isy-emerald text-white font-bold text-xs hover:bg-isy-emerald-hover transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
