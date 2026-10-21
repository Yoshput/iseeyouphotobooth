"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  Search,
  ExternalLink,
  Download,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  LogOut,
  X,
  FileText,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import gsap from "gsap";
import { SponsorshipItem } from "@/app/api/sponsor/route";
import AdminToast, { useAdminToast } from "@/components/admin/AdminToast";

export default function AdminSponsorPage() {
  // ── Authentication States ──────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // ── Data & Filter States ───────────────────────────────────────────────────
  const [items, setItems] = useState<SponsorshipItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // ── Animation Refs ─────────────────────────────────────────────────────────
  const loginCardRef = useRef<HTMLDivElement>(null);

  // ── Check Session Token on Mount ───────────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem("isy_admin_session_token");
      if (storedToken) {
        setIsAuthenticated(true);
      }
    } catch {}

    // Check IP rate-limit / lockout status
    fetch("/api/admin/verify")
      .then((res) => res.json())
      .then((data) => {
        if (data.locked && data.remainingSeconds > 0) {
          setIsLocked(true);
          setLockoutTimer(data.remainingSeconds);
        } else if (typeof data.attemptsLeft === "number") {
          setAttemptsLeft(data.attemptsLeft);
        }
      })
      .catch(() => {});
  }, []);

  // ── Lockout Countdown Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (!isLocked || lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setPinError("");
          setAttemptsLeft(5);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutTimer]);

  // ── GSAP Entrance Animation for Login Card ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated && loginCardRef.current) {
      gsap.fromTo(
        loginCardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [isAuthenticated]);

  const triggerErrorShake = () => {
    if (loginCardRef.current) {
      gsap.to(loginCardRef.current, {
        x: 8,
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(loginCardRef.current, { x: 0 });
        },
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!pinInput.trim()) {
      setPinError("Silakan masukkan PIN otorisasi.");
      triggerErrorShake();
      return;
    }

    setIsVerifying(true);
    setPinError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinError("");
        try {
          sessionStorage.setItem("isy_admin_session_token", data.token);
        } catch {}
      } else {
        triggerErrorShake();
        if (data.locked) {
          setIsLocked(true);
          setLockoutTimer(data.remainingSeconds || 300);
          setPinError(data.error || "Akses dikunci selama 5 menit karena alasan keamanan.");
        } else {
          setPinError(data.error || "PIN salah. Periksa kembali Security PIN Anda.");
          if (typeof data.attemptsLeft === "number") {
            setAttemptsLeft(data.attemptsLeft);
          }
        }
      }
    } catch {
      setPinError("Gagal menghubungi server verifikasi.");
      triggerErrorShake();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("isy_admin_session_token");
    } catch {}
    setIsAuthenticated(false);
    setPinInput("");
    showToast("Berhasil keluar dari sesi admin", "info");
  };

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
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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
      const json = await res.json();
      if (json.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedDetailItem && selectedDetailItem.id === id) {
          setSelectedDetailItem((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(`Status #${id} diperbarui ke "${newStatus}"`, "success");
      } else {
        showToast("Gagal memperbarui status proposal", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Gagal menghubungi server", "error");
    }
  };

  // ── Save Internal Notes ────────────────────────────────────────────────────
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
      const json = await res.json();
      if (json.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedDetailItem.id ? { ...item, catatanInternal: internalNotes } : item
          )
        );
        setSelectedDetailItem((prev) => (prev ? { ...prev, catatanInternal: internalNotes } : null));
        showToast("Catatan internal berhasil disimpan", "success");
      } else {
        showToast("Gagal menyimpan catatan", "error");
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
      const res = await fetch(`/api/sponsor?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        if (selectedDetailItem?.id === itemToDelete.id) {
          setSelectedDetailItem(null);
        }
        showToast(`Proposal #${itemToDelete.id} berhasil dihapus`, "success");
      } else {
        showToast("Gagal menghapus proposal", "error");
      }
    } catch (err) {
      console.error("Error deleting proposal:", err);
      showToast("Gagal menghapus proposal", "error");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  // ── Export CSV with UTF-8 BOM ──────────────────────────────────────────────
  const handleExportCSV = () => {
    if (items.length === 0) {
      showToast("Belum ada data untuk diexport", "info");
      return;
    }

    const headers = [
      "ID",
      "Tanggal Submit",
      "Nama PIC",
      "Instansi",
      "WhatsApp",
      "Email",
      "Cabang",
      "Nama Kegiatan",
      "Tanggal Kegiatan",
      "Target Peserta",
      "Bentuk Sponsor",
      "Resume Kegiatan",
      "Link Proposal",
      "Status",
      "Catatan Internal",
    ];

    const rows = items.map((i) => [
      `"${i.id}"`,
      `"${new Date(i.createdAt).toLocaleString("id-ID")}"`,
      `"${i.nama}"`,
      `"${i.instansi}"`,
      `"'${i.whatsapp}"`,
      `"${i.email || ""}"`,
      `"${i.cabang}"`,
      `"${i.namaKegiatan}"`,
      `"${i.tanggalKegiatan || ""}"`,
      `"${i.targetPeserta || ""}"`,
      `"${(i.bentukSponsor || []).join("; ")}"`,
      `"${(i.resumeKegiatan || "").replace(/"/g, '""')}"`,
      `"${i.proposalUrl || ""}"`,
      `"${i.status}"`,
      `"${(i.catatanInternal || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Sponsor-OptikISeeYou-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("File CSV berhasil diunduh", "success");
  };

  // ── Filtered & Sorted Items ────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          item.nama.toLowerCase().includes(query) ||
          item.instansi.toLowerCase().includes(query) ||
          item.namaKegiatan.toLowerCase().includes(query) ||
          item.whatsapp.includes(query) ||
          item.id.toLowerCase().includes(query) ||
          (item.email && item.email.toLowerCase().includes(query));

        const matchCabang = selectedCabang === "Semua" || item.cabang === selectedCabang;
        const matchStatus = selectedStatus === "Semua" || item.status === selectedStatus;

        return matchSearch && matchCabang && matchStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === "terbaru" ? timeB - timeA : timeA - timeB;
      });
  }, [items, searchQuery, selectedCabang, selectedStatus, sortBy]);

  // Counts
  const totalCount = items.length;
  const pendingCount = items.filter((i) => i.status === "Menunggu Review").length;
  const approvedCount = items.filter((i) => i.status === "Disetujui").length;
  const inProgressCount = items.filter((i) => i.status === "Dalam Proses").length;
  const rejectedCount = items.filter((i) => i.status === "Ditolak").length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean status color badge helper
  const getStatusBadgeStyle = (status: SponsorshipItem["status"]) => {
    switch (status) {
      case "Disetujui":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "Ditolak":
        return "bg-rose-50 text-rose-800 border-rose-300";
      case "Dalam Proses":
        return "bg-blue-50 text-blue-800 border-blue-300";
      default:
        return "bg-amber-50 text-amber-900 border-amber-300";
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // VIEW 1: AUTHENTICATION / LOGIN (CLEAN MODERN SANS, NO AI SLOP)
  // ══════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <main className="h-screen h-dvh w-full overflow-y-auto bg-[#FAF6EC] text-[#0D2F1D] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#116B3C] selection:text-white">
        {/* Top Minimal Bar */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D2F1D]/70 hover:text-[#0D2F1D] transition-colors bg-white/80 px-3.5 py-1.5 rounded-full border border-[#0D2F1D]/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs font-semibold text-[#116B3C] bg-[#EAF6EE] px-3 py-1 rounded-full border border-[#116B3C]/20">
            Optik I See You
          </span>
        </div>

        {/* Centered Login Card */}
        <div className="my-auto py-8">
          <div
            ref={loginCardRef}
            className="w-full max-w-[400px] mx-auto bg-white border border-[#0D2F1D]/10 rounded-3xl p-7 sm:p-9 shadow-sm text-center"
          >
            {/* Brand Logo Header */}
            <div className="flex flex-col items-center justify-center mb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#116B3C] uppercase">
                Optik
              </span>
              <h1 className="text-2xl font-black text-[#0D2F1D] tracking-tight">
                I See You
              </h1>
              <span className="text-xs font-medium text-[#116B3C] italic tracking-wider mt-0.5">
                for every you
              </span>
            </div>

            <div className="inline-block bg-[#FAF6EC] px-3.5 py-1 rounded-full border border-[#0D2F1D]/10 mb-4">
              <span className="text-[11px] font-bold text-[#0D2F1D]/80">
                Portal Admin Sponsorship
              </span>
            </div>

            <p className="text-xs text-[#0D2F1D]/70 leading-relaxed mb-6 font-normal">
              Masukkan Security PIN Staff Marketing untuk mengelola pengajuan sponsor kegiatan.
            </p>

            {/* Security Rate Limit Status */}
            {isLocked ? (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2">
                <span className="text-xs font-bold text-rose-800 block">
                  Akses Dikunci Sementara
                </span>
                <p className="text-xs text-rose-700 leading-tight">
                  Terlalu banyak percobaan PIN salah. Demi keamanan, sistem dibekukan sementara selama:
                </p>
                <div className="text-center py-2">
                  <span className="font-mono text-2xl font-black text-rose-800 tracking-wider">
                    {formatTimer(lockoutTimer)}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-[#0D2F1D]/70 uppercase tracking-wider pl-1">
                    Security PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      maxLength={24}
                      disabled={isVerifying || isLocked}
                      placeholder="Masukkan PIN otorisasi..."
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        if (pinError) setPinError("");
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-[#0D2F1D]/15 bg-[#FAF6EC]/50 text-center text-sm font-mono tracking-widest text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] focus:bg-white transition-all placeholder:text-[#0D2F1D]/35 placeholder:tracking-normal disabled:opacity-50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-3 text-[#0D2F1D]/45 hover:text-[#0D2F1D] transition-colors p-1"
                      tabIndex={-1}
                      title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
                    {pinError}
                  </div>
                )}

                {/* Sisa Kesempatan */}
                {attemptsLeft !== null && attemptsLeft < 5 && !isLocked && (
                  <p className="text-[11px] text-amber-800 font-medium">
                    Sisa percobaan: <span className="font-bold font-mono text-amber-900">{attemptsLeft}</span> kali sebelum dikunci.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || isLocked}
                  className="w-full py-3 px-4 rounded-2xl bg-[#116B3C] hover:bg-[#0D2F1D] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Masuk ke Dashboard</span>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="mt-6 pt-4 border-t border-[#0D2F1D]/8 text-center text-[11px] text-[#0D2F1D]/50 font-normal">
              Sesi terenkripsi dan terlindungi anti-bruteforce
            </div>
          </div>
        </div>

        {/* Bottom Minimal Copyright */}
        <div className="max-w-md w-full mx-auto text-center pb-2 text-[11px] text-[#0D2F1D]/40">
          Hak Cipta Optik I See You. Seluruh hak dilindungi.
        </div>
      </main>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // VIEW 2: ADMIN DASHBOARD
  // ── IMPORTANT ARCHITECTURE:
  // Top Navbar, Stat Cards, Search/Filter, and Counter ARE 100% FIXED!
  // ONLY THE TABLE ITSELF HAS SCROLL!
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen h-dvh w-full overflow-hidden bg-[#FAF6EC] text-[#0D2F1D] flex flex-col font-sans selection:bg-[#116B3C] selection:text-white">
      {/* ── 1. TOP HEADER (Fixed at top, never scrolls) ── */}
      <header className="shrink-0 z-30 bg-white border-b border-[#0D2F1D]/10 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Back Link */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D2F1D]/70 hover:text-[#0D2F1D] transition-colors p-2 rounded-xl hover:bg-[#FAF6EC]"
              title="Kembali ke Beranda Publik"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Beranda</span>
            </Link>

            <span className="text-[#0D2F1D]/20">|</span>

            <div className="flex items-center gap-2.5">
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#116B3C] uppercase">
                  Optik
                </span>
                <span className="text-base font-extrabold text-[#0D2F1D] tracking-tight">
                  I See You
                </span>
              </div>
              <span className="text-[#0D2F1D]/30 font-light text-base">|</span>
              <span className="hidden sm:inline text-xs font-medium text-[#116B3C] italic tracking-wide">
                for every you
              </span>
              <span className="ml-1 rounded-full bg-[#EAF6EE] text-[#116B3C] text-[10px] font-bold px-2.5 py-0.5 border border-[#116B3C]/20">
                Sponsor Hub
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/sponsor"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0D2F1D]/15 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D]/80 hover:text-[#0D2F1D] text-xs font-semibold transition-colors"
              title="Buka form pengajuan sponsorship publik (/sponsor)"
            >
              <span>Form Publik</span>
              <ExternalLink className="w-3 h-3 text-[#116B3C]" />
            </Link>

            <button
              type="button"
              onClick={() => setIsGSheetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#116B3C]/25 bg-[#EAF6EE] hover:bg-[#116B3C] text-[#116B3C] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#0D2F1D]/15 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#116B3C]" />
              <span className="hidden xs:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-[#0D2F1D]/70 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-rose-50 cursor-pointer font-medium"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. FIXED CONTROLS AREA (Stat Cards + Search/Filter + Counter) (NEVER SCROLLS!) ── */}
      <div className="shrink-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 space-y-3">
        {/* Clean Interactive Stat Cards (Click to Filter) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Total Pengajuan */}
          <button
            type="button"
            onClick={() => setSelectedStatus("Semua")}
            className={`rounded-2xl border bg-white p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
              selectedStatus === "Semua"
                ? "border-[#116B3C] ring-2 ring-[#116B3C]/20 shadow-xs"
                : "border-[#0D2F1D]/10 hover:border-[#116B3C]/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0D2F1D]/60 uppercase tracking-wider">
                Total Pengajuan
              </span>
              {selectedStatus === "Semua" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#116B3C] bg-[#EAF6EE] px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#0D2F1D] font-mono">
                {totalCount}
              </span>
              <span className="text-[11px] text-[#0D2F1D]/50 font-medium">Semua data</span>
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
            className={`rounded-2xl border bg-[#EAF6EE] p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
              selectedStatus === "Disetujui"
                ? "border-[#116B3C] ring-2 ring-[#116B3C]/25 shadow-xs"
                : "border-[#116B3C]/20 hover:border-[#116B3C]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#116B3C] uppercase tracking-wider">
                Disetujui
              </span>
              {selectedStatus === "Disetujui" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#116B3C] bg-white px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#0D2F1D] font-mono">
                {approvedCount}
              </span>
              <span className="text-[11px] text-[#116B3C] font-medium">Bekerjasama</span>
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
                Ditolak / Selesai
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
        <div className="rounded-2xl border border-[#0D2F1D]/10 bg-white p-2.5 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-[#0D2F1D]/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari PIC, instansi, acara, no WA, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#0D2F1D]/10 bg-[#FAF6EC]/40 text-xs text-[#0D2F1D] placeholder:text-[#0D2F1D]/40 focus:outline-none focus:ring-2 focus:ring-[#116B3C] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 p-0.5 text-[#0D2F1D]/40 hover:text-[#0D2F1D] transition-colors"
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
                className="px-3 py-2 rounded-xl border border-[#0D2F1D]/10 bg-white text-xs font-semibold text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] cursor-pointer pr-7 appearance-none"
              >
                <option value="Semua">Semua Cabang</option>
                <option value="Purwokerto">Purwokerto</option>
                <option value="Purbalingga">Purbalingga</option>
                <option value="Wonosobo">Wonosobo</option>
                <option value="Cilacap">Cilacap</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-2.5 text-[#0D2F1D]/40">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#0D2F1D]/10 bg-white text-xs font-semibold text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] cursor-pointer pr-7 appearance-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu Review">Menunggu Review</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-2.5 text-[#0D2F1D]/40">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === "terbaru" ? "terlama" : "terbaru"))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#0D2F1D]/10 bg-white hover:bg-[#FAF6EC] text-xs font-semibold text-[#0D2F1D] transition-colors cursor-pointer"
              title={`Urutkan: ${sortBy === "terbaru" ? "Terbaru" : "Terlama"}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#116B3C]" />
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

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadData}
              title="Refresh Data"
              className="p-2 rounded-xl border border-[#0D2F1D]/10 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D] transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#116B3C]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between px-1 text-xs text-[#0D2F1D]/60 font-medium">
          <span>
            Menampilkan <strong className="text-[#0D2F1D] font-bold">{filteredItems.length}</strong> dari {totalCount} total pengajuan
          </span>
          {selectedStatus !== "Semua" && (
            <span className="text-[11px] text-[#116B3C] font-semibold">
              Filter: {selectedStatus}
            </span>
          )}
        </div>
      </div>

      {/* ── 3. TABLE CONTAINER (THIS AND ONLY THIS PART SCROLLS!) ── */}
      <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-4 flex flex-col">
        <div className="flex-1 min-h-0 rounded-2xl border border-[#0D2F1D]/10 bg-white shadow-xs overflow-hidden flex flex-col">
          {/* Scrollable table viewport */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-[#0D2F1D]/50 text-xs space-y-2 px-4">
                <FileText className="w-8 h-8 mx-auto text-[#0D2F1D]/30" />
                <p className="font-bold text-sm text-[#0D2F1D]/80">
                  {isLoading ? "Memuat data proposal..." : "Tidak ada pengajuan yang sesuai filter."}
                </p>
                <p className="text-xs text-[#0D2F1D]/50">
                  Ubah kata kunci pencarian atau reset filter untuk menampilkan semua data.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#0D2F1D]/10 bg-[#FAF6EC] text-[#0D2F1D]/70 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-xs">
                    <th className="py-3 px-4">Tanggal / ID</th>
                    <th className="py-3 px-4">Instansi dan PIC</th>
                    <th className="py-3 px-4">Nama Acara dan Cabang</th>
                    <th className="py-3 px-4">Target dan Bentuk</th>
                    <th className="py-3 px-4">Proposal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D2F1D]/6">
                  {filteredItems.map((item) => {
                    const waClean = item.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
                    const chatText = encodeURIComponent(
                      `Halo Kak ${item.nama} (${item.instansi}), mengenai proposal sponsorship "${item.namaKegiatan}" yang diajukan ke Optik I See You #${item.id}:`
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FAF6EC]/30 transition-colors"
                      >
                        {/* Tanggal & ID */}
                        <td className="py-3 px-4 whitespace-nowrap align-top">
                          <span className="font-mono text-[11px] text-[#0D2F1D]/50 font-bold block">
                            #{item.id}
                          </span>
                          <span className="text-xs text-[#0D2F1D]/80 font-medium block mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] text-[#0D2F1D]/40 font-mono">
                            {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Instansi dan PIC */}
                        <td className="py-3 px-4 align-top max-w-[240px]">
                          <strong className="text-[#0D2F1D] block font-bold text-xs leading-snug">
                            {item.instansi}
                          </strong>
                          <span className="text-[#0D2F1D]/70 text-[11px] block mt-0.5">
                            PIC: <span className="font-medium text-[#0D2F1D]">{item.nama}</span>
                          </span>
                          <a
                            href={`https://wa.me/${waClean}?text=${chatText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[11px] text-[#116B3C] font-mono hover:underline mt-0.5 font-medium"
                          >
                            {item.whatsapp}
                          </a>
                        </td>

                        {/* Nama Acara dan Cabang */}
                        <td className="py-3 px-4 align-top max-w-[240px]">
                          <strong className="text-[#0D2F1D] block font-semibold text-xs leading-snug">
                            {item.namaKegiatan}
                          </strong>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#0D2F1D]/70">
                            <span className="font-medium text-[#116B3C]">Optik {item.cabang}</span>
                            {item.tanggalKegiatan && (
                              <>
                                <span>•</span>
                                <span>{item.tanggalKegiatan}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Target dan Bentuk Sponsor */}
                        <td className="py-3 px-4 align-top max-w-[220px]">
                          <span className="font-semibold text-xs text-[#0D2F1D] block">
                            {item.targetPeserta} Peserta
                          </span>
                          <span
                            className="text-[11px] text-[#0D2F1D]/60 block mt-0.5 line-clamp-1"
                            title={item.bentukSponsor?.join(", ")}
                          >
                            {item.bentukSponsor?.join(", ") || "-"}
                          </span>
                        </td>

                        {/* Proposal Link */}
                        <td className="py-3 px-4 whitespace-nowrap align-top">
                          {item.proposalUrl ? (
                            <a
                              href={item.proposalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#116B3C] font-semibold hover:underline"
                            >
                              <span>Buka File</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          ) : (
                            <span className="text-[#0D2F1D]/40 text-xs italic">Via WhatsApp</span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3 px-4 whitespace-nowrap align-top">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value as any)
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none transition-colors ${getStatusBadgeStyle(
                              item.status
                            )}`}
                          >
                            <option value="Menunggu Review">Menunggu Review</option>
                            <option value="Dalam Proses">Dalam Proses</option>
                            <option value="Disetujui">Disetujui</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right whitespace-nowrap align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Detail Drawer */}
                            <button
                              type="button"
                              onClick={() => setSelectedDetailItem(item)}
                              className="px-2.5 py-1 rounded-lg border border-[#0D2F1D]/15 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Detail
                            </button>

                            {/* WhatsApp Direct Chat */}
                            <a
                              href={`https://wa.me/${waClean}?text=${chatText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg border border-[#116B3C]/30 bg-[#EAF6EE] hover:bg-[#116B3C] hover:text-white text-[#116B3C] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Chat WA
                            </a>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                              title="Hapus proposal"
                            >
                              Hapus
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
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL DRAWER / MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="w-full sm:max-w-xl h-full sm:h-[94vh] bg-white rounded-t-3xl sm:rounded-3xl border border-[#0D2F1D]/10 shadow-xl flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#0D2F1D]/10 bg-[#FAF6EC] flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#116B3C]">
                    #{selectedDetailItem.id}
                  </span>
                  <span className="text-xs text-[#0D2F1D]/60 font-medium">
                    {new Date(selectedDetailItem.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0D2F1D] leading-tight">
                  {selectedDetailItem.namaKegiatan}
                </h3>
                <p className="text-xs text-[#0D2F1D]/70 font-semibold mt-0.5">
                  {selectedDetailItem.instansi}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#0D2F1D]/50 hover:text-[#0D2F1D] cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#0D2F1D]">
              {/* Status Row */}
              <div className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#0D2F1D]/10 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#0D2F1D]">
                  Status Proposal
                </span>
                <select
                  value={selectedDetailItem.status}
                  onChange={(e) =>
                    handleStatusChange(selectedDetailItem.id, e.target.value as any)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none ${getStatusBadgeStyle(
                    selectedDetailItem.status
                  )}`}
                >
                  <option value="Menunggu Review">Menunggu Review</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0D2F1D]/70 uppercase tracking-wider">
                  Informasi PIC dan Kontak
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#0D2F1D]/10">
                  <div>
                    <span className="text-[11px] text-[#0D2F1D]/50 block">Nama PIC:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D]">
                      {selectedDetailItem.nama}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D2F1D]/50 block">Instansi:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D]">
                      {selectedDetailItem.instansi}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D2F1D]/50 block">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${selectedDetailItem.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                        `Halo Kak ${selectedDetailItem.nama} (${selectedDetailItem.instansi}), mengenai proposal sponsorship "${selectedDetailItem.namaKegiatan}" yang diajukan ke Optik I See You #${selectedDetailItem.id}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#116B3C] hover:underline"
                    >
                      {selectedDetailItem.whatsapp} ↗
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D2F1D]/50 block">Email:</span>
                    <span className="text-xs font-medium text-[#0D2F1D]">
                      {selectedDetailItem.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0D2F1D]/70 uppercase tracking-wider">
                  Detail Kegiatan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#0D2F1D]/10">
                  <div>
                    <span className="text-[11px] text-[#0D2F1D]/50 block">Cabang Target:</span>
                    <span className="font-bold text-xs text-[#0D2F1D]">
                      Optik {selectedDetailItem.cabang}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0D2F1D]/50 block">Tanggal Pelaksanaan:</span>
                    <span className="font-bold text-xs text-[#0D2F1D]">
                      {selectedDetailItem.tanggalKegiatan || "-"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] text-[#0D2F1D]/50 block">Target Peserta:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D]">
                      {selectedDetailItem.targetPeserta}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Requested Sponsorship */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0D2F1D]/70 uppercase tracking-wider">
                  Bentuk Sponsorship yang Diajukan
                </h4>
                <div className="p-3.5 rounded-xl border border-[#0D2F1D]/10">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetailItem.bentukSponsor?.length > 0 ? (
                      selectedDetailItem.bentukSponsor.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#EAF6EE] text-[#116B3C] font-semibold text-xs border border-[#116B3C]/20"
                        >
                          {b}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#0D2F1D]/40 italic">Tidak ada rincian</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume / Deskripsi */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0D2F1D]/70 uppercase tracking-wider">
                  Resume dan Deskripsi Kegiatan
                </h4>
                <div className="p-3.5 rounded-xl bg-[#FAF6EC]/60 border border-[#0D2F1D]/10 text-xs leading-relaxed whitespace-pre-line font-normal">
                  {selectedDetailItem.resumeKegiatan || "Tidak ada resume tertulis dari pemohon."}
                </div>
              </div>

              {/* Proposal File */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0D2F1D]/70 uppercase tracking-wider">
                  Berkas Proposal
                </h4>
                {selectedDetailItem.proposalUrl ? (
                  <a
                    href={selectedDetailItem.proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#EAF6EE] border border-[#116B3C]/20 text-[#116B3C] hover:bg-[#116B3C] hover:text-white transition-colors"
                  >
                    <span className="font-bold text-xs">Buka Berkas Proposal PDF</span>
                    <span className="text-xs">↗</span>
                  </a>
                ) : (
                  <div className="p-3.5 rounded-xl border border-[#0D2F1D]/10 text-center text-[#0D2F1D]/50 italic">
                    Berkas proposal dikirim melalui chat WhatsApp.
                  </div>
                )}
              </div>

              {/* Catatan Internal Admin */}
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-xs text-[#0D2F1D]/70 uppercase tracking-wider">
                  Catatan Internal Marketing
                </h4>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Tulis catatan internal di sini..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#0D2F1D]/15 bg-white text-xs text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] transition-all resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={handleSaveInternalNotes}
                      className="px-4 py-1.5 rounded-lg bg-[#116B3C] hover:bg-[#0D2F1D] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingNotes ? "Menyimpan..." : "Simpan Catatan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#0D2F1D]/10 bg-white flex items-center justify-between gap-2 shrink-0">
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
                className="px-4 py-2 rounded-lg bg-[#116B3C] hover:bg-[#0D2F1D] text-white text-xs font-bold transition-colors cursor-pointer"
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
            className="w-full max-w-sm rounded-2xl border border-[#0D2F1D]/10 bg-white p-5 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm text-[#0D2F1D] mb-1.5">
              Hapus Pengajuan Sponsorship?
            </h3>
            <p className="text-xs text-[#0D2F1D]/70 leading-relaxed mb-4">
              Pengajuan dari <strong>{itemToDelete.instansi}</strong> (#{itemToDelete.id}) akan dihapus permanen.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-[#0D2F1D]/15 hover:bg-[#FAF6EC] text-xs font-semibold text-[#0D2F1D] transition-colors cursor-pointer"
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
            className="w-full max-w-lg rounded-2xl border border-[#0D2F1D]/10 bg-white p-6 shadow-xl text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0D2F1D]">
                  Sinkronisasi Google Drive dan Spreadsheet
                </h3>
                <p className="text-xs text-[#0D2F1D]/60 mt-0.5">
                  Koneksi data pengajuan sponsor real-time tanpa database berbayar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EC] text-[#0D2F1D]/50 hover:text-[#0D2F1D] cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#0D2F1D]/80">
              <div className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#0D2F1D]/10 space-y-2">
                <p className="font-semibold text-[#0D2F1D]">Cara kerja webhook otomatis:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#0D2F1D]/75">
                  <li>Buat Google Spreadsheet baru di Google Drive Optik I See You.</li>
                  <li>
                    Buka <strong>Extensions &gt; Apps Script</strong> dan buat endpoint webhook web app sederhana (POST).
                  </li>
                  <li>
                    Masukkan URL Apps Script ke environment variable:
                    <code className="block mt-1 p-2 rounded-lg bg-white border border-[#0D2F1D]/10 font-mono text-[10px] text-[#116B3C] select-all break-all">
                      GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
                    </code>
                  </li>
                  <li>
                    Setiap kali ada pemohon yang mengajukan form di <code>/sponsor</code>, sistem akan otomatis mengirim baris data baru ke Google Spreadsheet Anda secara instan.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EAF6EE] border border-[#116B3C]/20 text-[11.5px] text-[#0D2F1D] space-y-1">
                <p className="font-bold text-[#116B3C]">Keuntungan Metode Ini:</p>
                <p>&bull; 100% Gratis selamanya dari Google Workspace.</p>
                <p>&bull; Berkas PDF proposal otomatis tersimpan di Cloudflare R2 / Drive.</p>
                <p>&bull; Tim marketing cabang mana saja bisa langsung membuka spreadsheet dari ponsel tanpa instal aplikasi.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#116B3C] text-white font-bold text-xs hover:bg-[#0D2F1D] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Accessible Toast */}
      <AdminToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
