"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  Trash2,
  Download,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Users,
  AlertTriangle,
  LogOut,
  Check,
  X,
  FileText,
  Filter,
  ArrowUpDown,
  Mail,
  MapPin,
  RotateCcw,
  Sparkles,
  Info,
  BookmarkCheck,
} from "lucide-react";
import gsap from "gsap";
import { SponsorshipItem } from "@/app/api/sponsor/route";

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

  // ── Quick Toast Notification ───────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  };

  // ── Animation Refs ─────────────────────────────────────────────────────────
  const loginCardRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [isAuthenticated]);

  const triggerErrorShake = () => {
    if (loginCardRef.current) {
      gsap.to(loginCardRef.current, {
        x: 10,
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
        if (loginCardRef.current) {
          gsap.to(loginCardRef.current, {
            scale: 0.96,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setIsAuthenticated(true);
              setPinError("");
              try {
                sessionStorage.setItem("isy_admin_session_token", data.token);
              } catch {}
            },
          });
        } else {
          setIsAuthenticated(true);
          try {
            sessionStorage.setItem("isy_admin_session_token", data.token);
          } catch {}
        }
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

    // Prepend UTF-8 BOM (\uFEFF) so Excel displays Indonesian characters flawlessly
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

  // Status color pill helper
  const getStatusBadgeStyle = (status: SponsorshipItem["status"]) => {
    switch (status) {
      case "Disetujui":
        return "bg-emerald-50 text-emerald-800 border-emerald-300/80 hover:bg-emerald-100";
      case "Ditolak":
        return "bg-rose-50 text-rose-800 border-rose-300/80 hover:bg-rose-100";
      case "Dalam Proses":
        return "bg-blue-50 text-blue-800 border-blue-300/80 hover:bg-blue-100";
      default:
        return "bg-amber-50 text-amber-900 border-amber-300/80 hover:bg-amber-100";
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // VIEW 1: AUTHENTICATION / LOGIN (LUXURY IVORY + EMERALD)
  // ══════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <main className="h-screen h-dvh w-full overflow-y-auto bg-[#FAF6EC] text-[#0D2F1D] flex flex-col justify-between p-4 sm:p-8 relative selection:bg-[#116B3C] selection:text-white">
        {/* Soft Ambient Radial Warm Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-gradient-to-b from-[#116B3C]/12 via-[#FAF6EC]/40 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Top Minimal Bar */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D2F1D]/75 hover:text-[#0D2F1D] transition-all bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#0D2F1D]/10 hover:border-[#0D2F1D]/25 shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#116B3C] bg-[#EAF6EE] px-3 py-1 rounded-full border border-[#116B3C]/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#116B3C] animate-pulse" />
            <span>Optik I See You Secure</span>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="my-auto py-8">
          <div
            ref={loginCardRef}
            className="w-full max-w-[410px] mx-auto bg-white/95 backdrop-blur-2xl border border-[#0D2F1D]/10 rounded-[32px] p-7 sm:p-9 shadow-[0_24px_60px_rgba(13,47,29,0.08)] text-center relative overflow-hidden"
          >
            {/* Top Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-[#EAF6EE] text-[#116B3C] border border-[#116B3C]/25 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Lock className="w-7 h-7 stroke-[1.8]" />
            </div>

            {/* Official Brand Typography: OPTIK I SEE YOU | for every you */}
            <div className="flex flex-col items-center justify-center mb-3">
              <div
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  color: "#116B3C",
                  textTransform: "uppercase",
                }}
              >
                OPTIK
              </div>
              <div
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#0D2F1D",
                  letterSpacing: "0.02em",
                  lineHeight: 1.1,
                }}
              >
                I SEE YOU
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-[1px] w-4 bg-[#0D2F1D]/20" />
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#116B3C",
                    letterSpacing: "0.18em",
                    fontStyle: "italic",
                  }}
                >
                  for every you
                </span>
                <span className="h-[1px] w-4 bg-[#0D2F1D]/20" />
              </div>
            </div>

            <div className="inline-block bg-[#FAF6EC] px-3.5 py-1 rounded-full border border-[#0D2F1D]/10 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D2F1D]/80">
                Portal Internal &bull; Sponsor Management Hub
              </span>
            </div>

            <p className="text-xs text-[#0D2F1D]/65 leading-relaxed mb-6 font-normal">
              Masukkan Security PIN Staff Marketing untuk mengelola pengajuan sponsor event & kampus.
            </p>

            {/* Security Rate Limit Status */}
            {isLocked ? (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Akses Dikunci Sementara</span>
                </div>
                <p className="text-[11.5px] text-rose-600 leading-tight">
                  Terlalu banyak percobaan PIN salah. Demi keamanan, sistem dibekukan sementara selama:
                </p>
                <div className="text-center py-2">
                  <span className="font-mono text-2xl font-black text-rose-700 tracking-wider">
                    {formatTimer(lockoutTimer)}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-[#0D2F1D]/75 uppercase tracking-wider pl-1">
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
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#0D2F1D]/15 bg-[#FAF6EC]/60 text-center text-sm font-mono tracking-widest text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] focus:bg-white focus:border-transparent transition-all placeholder:text-[#0D2F1D]/35 placeholder:tracking-normal disabled:opacity-50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-3.5 text-[#0D2F1D]/45 hover:text-[#0D2F1D] transition-colors p-1"
                      tabIndex={-1}
                      title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#116B3C] hover:bg-[#0D2F1D] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#116B3C]/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Otorisasi...</span>
                    </>
                  ) : (
                    <span>Buka Sponsor Dashboard</span>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="mt-6 pt-4 border-t border-[#0D2F1D]/8 flex items-center justify-center gap-2 text-[10.5px] text-[#0D2F1D]/55 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#116B3C]" />
              <span>Proteksi Anti-Bruteforce &bull; Session Token Terenkripsi</span>
            </div>
          </div>
        </div>

        {/* Bottom Minimal Copyright */}
        <div className="max-w-md w-full mx-auto text-center pb-2 text-[11px] text-[#0D2F1D]/45">
          &copy; {new Date().getFullYear()} Optik I See You. Hak Cipta Dilindungi.
        </div>
      </main>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // VIEW 2: ADMIN DASHBOARD (FIXED HEADER + INDEPENDENT SCROLL)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div
      ref={dashboardRef}
      className="h-screen h-dvh w-full overflow-hidden bg-[#FAF6EC] text-[#0D2F1D] flex flex-col selection:bg-[#116B3C] selection:text-white"
    >
      {/* ── TOP HEADER (Always Fixed at Top, Never Scrolls Away) ── */}
      <header
        ref={headerRef}
        className="shrink-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#0D2F1D]/10 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Official Brand Typography & Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D2F1D]/75 hover:text-[#0D2F1D] transition-colors p-2 rounded-xl hover:bg-[#FAF6EC]"
              title="Kembali ke Beranda Publik"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Beranda</span>
            </Link>

            <span className="text-[#0D2F1D]/20">|</span>

            {/* Official Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col" style={{ lineHeight: 1 }}>
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "8.5px",
                    fontWeight: 700,
                    letterSpacing: "0.25em",
                    color: "#116B3C",
                    textTransform: "uppercase",
                  }}
                >
                  OPTIK
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "15px",
                    fontWeight: 900,
                    color: "#0D2F1D",
                    letterSpacing: "0.02em",
                  }}
                >
                  I SEE YOU
                </span>
              </div>

              <span className="text-[#0D2F1D]/30 font-light text-base">|</span>

              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#116B3C",
                  letterSpacing: "0.15em",
                  fontStyle: "italic",
                }}
              >
                for every you
              </span>

              <span className="ml-1 rounded-full bg-[#EAF6EE] text-[#116B3C] text-[10px] font-bold px-2.5 py-0.5 border border-[#116B3C]/20 shadow-2xs">
                Sponsor Hub
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Link to Public Form */}
            <Link
              href="/sponsor"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0D2F1D]/12 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D]/80 hover:text-[#0D2F1D] text-xs font-semibold transition-all shadow-2xs"
              title="Buka form pengajuan sponsorship publik (/sponsor)"
            >
              <span>Form Publik</span>
              <ExternalLink className="w-3 h-3 text-[#116B3C]" />
            </Link>

            <button
              type="button"
              onClick={() => setIsGSheetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#116B3C]/25 bg-[#EAF6EE] hover:bg-[#116B3C] text-[#116B3C] hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#0D2F1D]/15 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
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

      {/* ── SCROLLABLE CONTENT AREA (ONLY this container scrolls!) ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full focus:outline-none"
      >
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-36">
          {/* iOS Interactive Statistics Cards (Clickable Quick Filters) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Total Pengajuan */}
            <button
              type="button"
              onClick={() => setSelectedStatus("Semua")}
              className={`rounded-3xl border bg-white p-5 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                selectedStatus === "Semua"
                  ? "border-[#116B3C] ring-2 ring-[#116B3C]/20 shadow-md"
                  : "border-[#0D2F1D]/10 hover:border-[#116B3C]/40"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-[#0D2F1D]/60 uppercase tracking-wider">
                  Total Pengajuan
                </span>
                {selectedStatus === "Semua" && (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#116B3C] bg-[#EAF6EE] px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-3xl font-black text-[#0D2F1D] font-mono tracking-tight">
                  {totalCount}
                </span>
                <span className="text-[11px] text-[#0D2F1D]/50 font-medium">Semua data</span>
              </div>
            </button>

            {/* 2. Menunggu Review */}
            <button
              type="button"
              onClick={() => setSelectedStatus("Menunggu Review")}
              className={`rounded-3xl border bg-amber-50/80 p-5 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                selectedStatus === "Menunggu Review"
                  ? "border-amber-500 ring-2 ring-amber-500/25 shadow-md bg-amber-50"
                  : "border-amber-200/90 hover:border-amber-400"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Menunggu Review</span>
                </span>
                {selectedStatus === "Menunggu Review" && (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-3xl font-black text-amber-900 font-mono tracking-tight">
                  {pendingCount}
                </span>
                <span className="text-[11px] text-amber-800/80 font-medium">Perlu dicek</span>
              </div>
            </button>

            {/* 3. Disetujui */}
            <button
              type="button"
              onClick={() => setSelectedStatus("Disetujui")}
              className={`rounded-3xl border bg-[#EAF6EE] p-5 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                selectedStatus === "Disetujui"
                  ? "border-[#116B3C] ring-2 ring-[#116B3C]/25 shadow-md bg-emerald-50"
                  : "border-[#116B3C]/25 hover:border-[#116B3C]/50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-[#116B3C] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Disetujui</span>
                </span>
                {selectedStatus === "Disetujui" && (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#116B3C] bg-white px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-3xl font-black text-[#0D2F1D] font-mono tracking-tight">
                  {approvedCount}
                </span>
                <span className="text-[11px] text-[#116B3C] font-medium">Bekerjasama</span>
              </div>
            </button>

            {/* 4. Ditolak / Selesai */}
            <button
              type="button"
              onClick={() => setSelectedStatus("Ditolak")}
              className={`rounded-3xl border bg-rose-50/70 p-5 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                selectedStatus === "Ditolak"
                  ? "border-rose-400 ring-2 ring-rose-400/25 shadow-md bg-rose-50"
                  : "border-rose-200 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Ditolak / Selesai</span>
                </span>
                {selectedStatus === "Ditolak" && (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-3xl font-black text-rose-900 font-mono tracking-tight">
                  {rejectedCount}
                </span>
                <span className="text-[11px] text-rose-700/80 font-medium">Arsip</span>
              </div>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="rounded-3xl border border-[#0D2F1D]/8 bg-white p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-[#0D2F1D]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari PIC, instansi, acara, no WA, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-[#FAF6EC]/50 text-xs text-[#0D2F1D] placeholder:text-[#0D2F1D]/45 focus:outline-none focus:ring-2 focus:ring-[#116B3C] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 p-0.5 text-[#0D2F1D]/40 hover:text-[#0D2F1D] transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters & Sort */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
              {/* Filter Cabang */}
              <div className="relative">
                <select
                  value={selectedCabang}
                  onChange={(e) => setSelectedCabang(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-white text-xs font-semibold text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] cursor-pointer shadow-2xs pr-8 appearance-none"
                >
                  <option value="Semua">Semua Cabang (4 Kota)</option>
                  <option value="Purwokerto">Cabang Purwokerto</option>
                  <option value="Purbalingga">Cabang Purbalingga</option>
                  <option value="Wonosobo">Cabang Wonosobo</option>
                  <option value="Cilacap">Cabang Cilacap</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-3 text-[#0D2F1D]/40">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Filter Status */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-white text-xs font-semibold text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] cursor-pointer shadow-2xs pr-8 appearance-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu Review">Menunggu Review</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-3 text-[#0D2F1D]/40">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Sort By Date */}
              <button
                type="button"
                onClick={() => setSortBy((prev) => (prev === "terbaru" ? "terlama" : "terbaru"))}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-white hover:bg-[#FAF6EC] text-xs font-semibold text-[#0D2F1D] transition-colors shadow-2xs cursor-pointer active:scale-95"
                title={`Urutkan: ${sortBy === "terbaru" ? "Terbaru ke Terlama" : "Terlama ke Terbaru"}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#116B3C]" />
                <span className="capitalize">{sortBy}</span>
              </button>

              {/* Reset Filters button if any filter active */}
              {(selectedCabang !== "Semua" || selectedStatus !== "Semua" || searchQuery !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCabang("Semua");
                    setSelectedStatus("Semua");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Reset semua filter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {/* Refresh Button */}
              <button
                type="button"
                onClick={loadData}
                title="Refresh Data Proposal"
                className="p-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D] transition-colors cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#116B3C]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between px-2 text-xs text-[#0D2F1D]/60 font-medium">
            <span>
              Menampilkan <strong className="text-[#0D2F1D] font-bold">{filteredItems.length}</strong> dari {totalCount} total pengajuan
            </span>
            {selectedStatus !== "Semua" && (
              <span className="text-[11px] text-[#116B3C] font-semibold">
                Filter status: {selectedStatus}
              </span>
            )}
          </div>

          {/* Proposals Table Card with Sticky Table Header */}
          <div className="rounded-[32px] border border-[#0D2F1D]/8 bg-white shadow-xs overflow-hidden flex flex-col">
            {filteredItems.length === 0 ? (
              <div className="py-24 text-center text-[#0D2F1D]/50 text-xs space-y-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6EC] border border-[#0D2F1D]/10 text-[#0D2F1D]/40 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="font-bold text-base text-[#0D2F1D]/80">
                  {isLoading ? "Memuat data proposal..." : "Tidak ada pengajuan yang sesuai filter."}
                </p>
                <p className="text-xs text-[#0D2F1D]/50 max-w-sm mx-auto">
                  {searchQuery || selectedCabang !== "Semua" || selectedStatus !== "Semua"
                    ? "Coba ubah kata kunci pencarian atau reset filter untuk melihat data lainnya."
                    : "Data yang diajukan pemohon melalui formulir /sponsor akan otomatis tercatat di sini."}
                </p>
                {(searchQuery || selectedCabang !== "Semua" || selectedStatus !== "Semua") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCabang("Semua");
                      setSelectedStatus("Semua");
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#116B3C] text-white text-xs font-bold shadow-xs hover:bg-[#0D2F1D] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Semua Filter</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#0D2F1D]/10 bg-[#FAF6EC]/90 text-[#0D2F1D]/75 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-md">
                      <th className="py-4 px-5">Tanggal / ID</th>
                      <th className="py-4 px-5">Instansi &amp; PIC</th>
                      <th className="py-4 px-5">Nama Acara &amp; Cabang</th>
                      <th className="py-4 px-5">Target &amp; Bentuk</th>
                      <th className="py-4 px-5">Proposal</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0D2F1D]/6">
                    {filteredItems.map((item) => {
                      const waClean = item.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
                      const chatText = encodeURIComponent(
                        `Halo Kak ${item.nama} (${item.instansi}), mengenai pengajuan sponsorship "${item.namaKegiatan}" yang diajukan ke Optik I See You #${item.id}:`
                      );

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FAF6EC]/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedDetailItem(item)}
                        >
                          {/* Tanggal & ID */}
                          <td className="py-4 px-5 whitespace-nowrap align-top">
                            <span className="font-mono text-[10.5px] text-[#0D2F1D]/55 font-bold block">
                              #{item.id}
                            </span>
                            <span className="text-[11.5px] text-[#0D2F1D]/85 font-medium block mt-0.5">
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

                          {/* Instansi & PIC */}
                          <td className="py-4 px-5 align-top max-w-[240px]">
                            <strong className="text-[#0D2F1D] block font-bold text-xs leading-snug">
                              {item.instansi}
                            </strong>
                            <span className="text-[#0D2F1D]/75 text-[11px] block mt-0.5">
                              PIC: <span className="font-semibold text-[#0D2F1D]">{item.nama}</span>
                            </span>
                            <div className="mt-1.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={`https://wa.me/${waClean}?text=${chatText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#116B3C] bg-[#EAF6EE] hover:bg-[#116B3C] hover:text-white px-2.5 py-0.5 rounded-full border border-[#116B3C]/20 transition-all shadow-2xs"
                                title="Kirim chat WhatsApp ke PIC"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>{item.whatsapp}</span>
                              </a>
                            </div>
                          </td>

                          {/* Nama Acara & Cabang */}
                          <td className="py-4 px-5 align-top max-w-[240px]">
                            <strong className="text-[#0D2F1D] block font-semibold text-xs leading-snug">
                              {item.namaKegiatan}
                            </strong>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF6EC] border border-[#0D2F1D]/10 text-[10px] font-bold text-[#0D2F1D]/80">
                                Optik {item.cabang}
                              </span>
                              {item.tanggalKegiatan && (
                                <span className="text-[10.5px] text-[#0D2F1D]/60 font-medium">
                                  {item.tanggalKegiatan}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Target & Bentuk Sponsor */}
                          <td className="py-4 px-5 align-top max-w-[220px]">
                            <span className="text-[#0D2F1D] block font-semibold text-[11px]">
                              {item.targetPeserta} Peserta
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.bentukSponsor?.slice(0, 2).map((b, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-[#FAF6EC] border border-[#0D2F1D]/10 text-[9.5px] font-medium text-[#0D2F1D]/75"
                                >
                                  {b}
                                </span>
                              ))}
                              {item.bentukSponsor?.length > 2 && (
                                <span className="text-[9.5px] text-[#0D2F1D]/55 self-center font-semibold">
                                  +{item.bentukSponsor.length - 2} lagi
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Proposal Link */}
                          <td className="py-4 px-5 whitespace-nowrap align-top" onClick={(e) => e.stopPropagation()}>
                            {item.proposalUrl ? (
                              <a
                                href={item.proposalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-[#116B3C] font-semibold hover:underline bg-[#EAF6EE] hover:bg-[#116B3C] hover:text-white px-3 py-1 rounded-xl border border-[#116B3C]/20 transition-all shadow-2xs"
                                title="Buka file proposal PDF di tab baru"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Buka File</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[#0D2F1D]/45 text-[11px] italic">Via WhatsApp</span>
                            )}
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-4 px-5 whitespace-nowrap align-top" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(item.id, e.target.value as any)
                              }
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer shadow-2xs transition-all ${getStatusBadgeStyle(
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
                          <td className="py-4 px-5 text-right whitespace-nowrap align-top" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Detail Drawer */}
                              <button
                                type="button"
                                onClick={() => setSelectedDetailItem(item)}
                                title="Lihat Detail Lengkap Proposal"
                                className="p-2 rounded-xl bg-white border border-[#0D2F1D]/10 text-[#0D2F1D]/70 hover:bg-[#FAF6EC] hover:text-[#0D2F1D] transition-all shadow-2xs cursor-pointer active:scale-95"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp Direct Chat */}
                              <a
                                href={`https://wa.me/${waClean}?text=${chatText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat PIC di WhatsApp"
                                className="p-2 rounded-xl bg-[#EAF6EE] text-[#116B3C] hover:bg-[#116B3C] hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => setItemToDelete(item)}
                                title="Hapus Pengajuan"
                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PROPOSAL DETAIL DRAWER / MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/45 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-xl h-full sm:h-[94vh] bg-white rounded-t-[32px] sm:rounded-[32px] border border-[#0D2F1D]/10 shadow-2xl flex flex-col overflow-hidden text-left animate-in slide-in-from-bottom sm:slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#0D2F1D]/10 bg-[#FAF6EC]/80 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#116B3C] bg-[#EAF6EE] px-2.5 py-0.5 rounded-full border border-[#116B3C]/20">
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
                <h3 className="font-bold text-lg text-[#0D2F1D] leading-tight">
                  {selectedDetailItem.namaKegiatan}
                </h3>
                <p className="text-xs text-[#0D2F1D]/70 font-semibold mt-0.5">
                  {selectedDetailItem.instansi}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-2 rounded-full hover:bg-white text-[#0D2F1D]/50 hover:text-[#0D2F1D] cursor-pointer transition-colors"
                title="Tutup Detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#0D2F1D]">
              {/* Status Update Strip */}
              <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-[#0D2F1D]/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#0D2F1D]/60 uppercase tracking-wider block">
                    Status Proposal
                  </span>
                  <span className="text-xs font-bold text-[#0D2F1D]">
                    {selectedDetailItem.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedDetailItem.status}
                    onChange={(e) =>
                      handleStatusChange(selectedDetailItem.id, e.target.value as any)
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border focus:outline-none cursor-pointer shadow-2xs ${getStatusBadgeStyle(
                      selectedDetailItem.status
                    )}`}
                  >
                    <option value="Menunggu Review">Menunggu Review</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              {/* Contact PIC Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#0D2F1D]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Informasi Kontak PIC</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-[#0D2F1D]/10 shadow-2xs">
                  <div>
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">Nama Lengkap PIC:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D]">
                      {selectedDetailItem.nama}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">Instansi / Organisasi:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D]">
                      {selectedDetailItem.instansi}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${selectedDetailItem.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                        `Halo Kak ${selectedDetailItem.nama} (${selectedDetailItem.instansi}), mengenai proposal sponsorship "${selectedDetailItem.namaKegiatan}" yang diajukan ke Optik I See You #${selectedDetailItem.id}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#116B3C] hover:underline mt-0.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{selectedDetailItem.whatsapp}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">Email:</span>
                    {selectedDetailItem.email ? (
                      <a
                        href={`mailto:${selectedDetailItem.email}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[#0D2F1D]/85 hover:underline mt-0.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#0D2F1D]/50" />
                        <span>{selectedDetailItem.email}</span>
                      </a>
                    ) : (
                      <span className="text-[#0D2F1D]/40 italic">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#0D2F1D]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Detail Kegiatan &amp; Target</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-[#0D2F1D]/10 shadow-2xs">
                  <div>
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">Cabang Target:</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EC] border border-[#0D2F1D]/10 font-bold text-xs text-[#0D2F1D]">
                      Optik {selectedDetailItem.cabang}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">Tanggal Kegiatan:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D] block mt-0.5">
                      {selectedDetailItem.tanggalKegiatan || "-"}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10.5px] text-[#0D2F1D]/50 block">Target Peserta:</span>
                    <strong className="text-xs font-bold text-[#0D2F1D]">
                      {selectedDetailItem.targetPeserta}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Requested Sponsorship Types */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#0D2F1D]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Bentuk Sponsorship yang Diajukan</span>
                </h4>
                <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-white border border-[#0D2F1D]/10 shadow-2xs">
                  {selectedDetailItem.bentukSponsor?.length > 0 ? (
                    selectedDetailItem.bentukSponsor.map((b, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EAF6EE] text-[#116B3C] font-semibold text-xs border border-[#116B3C]/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{b}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[#0D2F1D]/45 italic">Tidak spesifik</span>
                  )}
                </div>
              </div>

              {/* Resume / Deskripsi Kegiatan */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#0D2F1D]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Resume &amp; Deskripsi Kegiatan</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#FAF6EC]/80 border border-[#0D2F1D]/10 text-xs text-[#0D2F1D]/85 leading-relaxed whitespace-pre-line font-normal">
                  {selectedDetailItem.resumeKegiatan || "Tidak ada resume tertulis."}
                </div>
              </div>

              {/* Proposal PDF File Link */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#0D2F1D]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Berkas Proposal</span>
                </h4>
                {selectedDetailItem.proposalUrl ? (
                  <a
                    href={selectedDetailItem.proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#EAF6EE] border border-[#116B3C]/25 hover:bg-[#116B3C] hover:text-white transition-all text-[#116B3C] group shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 shrink-0" />
                      <div>
                        <strong className="block text-xs font-bold">
                          Buka Berkas Proposal PDF
                        </strong>
                        <span className="text-[11px] opacity-80 block truncate max-w-xs">
                          {selectedDetailItem.proposalUrl}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-[#0D2F1D]/10 text-center text-[#0D2F1D]/50 italic text-xs">
                    Pemohon tidak melampirkan file link (berkas dikirim melalui WhatsApp).
                  </div>
                )}
              </div>

              {/* Internal Notes / Catatan Tim Marketing */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-[#0D2F1D]/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#116B3C]" />
                  <span>Catatan Internal Tim Marketing</span>
                </h4>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Tulis catatan internal di sini (misal: 'Sudah di-follow up WA tgl 18 Okt, minta kirim revisi kuota voucher')..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-[#0D2F1D]/15 bg-white text-xs text-[#0D2F1D] placeholder:text-[#0D2F1D]/40 focus:outline-none focus:ring-2 focus:ring-[#116B3C] transition-all resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={handleSaveInternalNotes}
                      className="px-4 py-2 rounded-xl bg-[#116B3C] hover:bg-[#0D2F1D] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSavingNotes ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan Catatan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#0D2F1D]/10 bg-white flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const toDel = selectedDetailItem;
                  setSelectedDetailItem(null);
                  setItemToDelete(toDel);
                }}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Proposal</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedDetailItem.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                    `Halo Kak ${selectedDetailItem.nama} (${selectedDetailItem.instansi}), mengenai proposal sponsorship "${selectedDetailItem.namaKegiatan}" yang diajukan ke Optik I See You #${selectedDetailItem.id}:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#116B3C] hover:bg-[#0D2F1D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-[32px] border border-[#0D2F1D]/10 bg-white p-6 sm:p-7 shadow-2xl text-left relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
            </div>

            <h3 className="font-bold text-base text-[#0D2F1D] mb-1.5">
              Hapus Pengajuan Sponsorship?
            </h3>
            <p className="text-xs text-[#0D2F1D]/70 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus arsip pengajuan dari{" "}
              <strong className="text-[#0D2F1D] font-bold">{itemToDelete.instansi}</strong> (
              <span className="font-mono font-semibold">#{itemToDelete.id}</span>)? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#0D2F1D]/15 hover:bg-[#FAF6EC] text-xs font-bold text-[#0D2F1D] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          GOOGLE SHEET / DRIVE INTEGRATION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {isGSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-[32px] border border-[#0D2F1D]/10 bg-white p-6 sm:p-8 shadow-2xl text-left relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF6EE] text-[#116B3C] border border-[#116B3C]/20 flex items-center justify-center shadow-2xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0D2F1D]">
                    Sinkronisasi Google Drive &amp; Spreadsheet
                  </h3>
                  <p className="text-xs text-[#0D2F1D]/60">
                    Koneksi data pengajuan sponsor real-time tanpa database berbayar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EC] text-[#0D2F1D]/50 hover:text-[#0D2F1D] cursor-pointer transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#0D2F1D]/80">
              <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-[#0D2F1D]/10 space-y-2">
                <p className="font-semibold text-[#0D2F1D]">Cara kerja webhook otomatis:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-[#0D2F1D]/75">
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

              <div className="p-4 rounded-2xl bg-[#EAF6EE] border border-[#116B3C]/20 text-[11.5px] text-[#0D2F1D] space-y-1">
                <p className="font-bold text-[#116B3C]">Keuntungan Metode Ini:</p>
                <p>&bull; 100% Gratis selamanya dari Google Workspace / Drive.</p>
                <p>&bull; Berkas PDF proposal otomatis tersimpan di Cloudflare R2 / Drive.</p>
                <p>&bull; Staff marketing cabang mana saja bisa langsung membuka spreadsheet dari HP tanpa instal aplikasi.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#116B3C] text-white font-bold text-xs hover:bg-[#0D2F1D] transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Tutup dan Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          FLOATING QUICK TOAST NOTIFICATION
      ══════════════════════════════════════════════════════════════════ */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0D2F1D] text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
