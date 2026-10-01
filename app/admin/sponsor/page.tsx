"use client";

import React, { useState, useEffect, useRef } from "react";
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
  HelpCircle,
  Check,
  X,
  FileText,
} from "lucide-react";
import gsap from "gsap";
import { SponsorshipItem } from "@/app/api/sponsor/route";

export default function AdminSponsorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const [items, setItems] = useState<SponsorshipItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  const [isGSheetModalOpen, setIsGSheetModalOpen] = useState(false);

  // GSAP animation refs
  const loginCardRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Check initial authentication and lockout status on mount
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

  // Lockout countdown timer
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

  // GSAP entrance animation for login card
  useEffect(() => {
    if (!isAuthenticated && loginCardRef.current) {
      gsap.fromTo(
        loginCardRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
      );
    }
  }, [isAuthenticated]);

  // GSAP entrance animation for dashboard
  useEffect(() => {
    if (isAuthenticated && dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [isAuthenticated]);

  const triggerErrorShake = () => {
    if (loginCardRef.current) {
      gsap.to(loginCardRef.current, {
        x: 12,
        duration: 0.06,
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
        // Success login transition
        if (loginCardRef.current) {
          gsap.to(loginCardRef.current, {
            scale: 0.96,
            opacity: 0,
            duration: 0.35,
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
        // Failed attempt
        triggerErrorShake();
        if (data.locked) {
          setIsLocked(true);
          setLockoutTimer(data.remainingSeconds || 300);
          setPinError(data.error || "Akses dikunci selama 5 menit karena keamanan.");
        } else {
          setPinError(data.error || "PIN salah. Coba periksa kembali.");
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
    if (dashboardRef.current) {
      gsap.to(dashboardRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.3,
        onComplete: () => {
          try {
            sessionStorage.removeItem("isy_admin_session_token");
          } catch {}
          setIsAuthenticated(false);
          setPinInput("");
        },
      });
    } else {
      try {
        sessionStorage.removeItem("isy_admin_session_token");
      } catch {}
      setIsAuthenticated(false);
      setPinInput("");
    }
  };

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip pengajuan ini?")) return;
    try {
      const res = await fetch(`/api/sponsor?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Error deleting proposal:", err);
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return alert("Belum ada data untuk diexport");

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
    ];

    const rows = items.map((i) => [
      `"${i.id}"`,
      `"${new Date(i.createdAt).toLocaleString("id-ID")}"`,
      `"${i.nama}"`,
      `"${i.instansi}"`,
      `"'${i.whatsapp}"`,
      `"${i.email}"`,
      `"${i.cabang}"`,
      `"${i.namaKegiatan}"`,
      `"${i.tanggalKegiatan}"`,
      `"${i.targetPeserta}"`,
      `"${i.bentukSponsor?.join("; ")}"`,
      `"${i.resumeKegiatan?.replace(/"/g, '""')}"`,
      `"${i.proposalUrl}"`,
      `"${i.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sponsor-OptikISeeYou-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instansi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whatsapp.includes(searchQuery);

    const matchCabang = selectedCabang === "Semua" || item.cabang === selectedCabang;
    const matchStatus = selectedStatus === "Semua" || item.status === selectedStatus;

    return matchSearch && matchCabang && matchStatus;
  });

  const totalCount = items.length;
  const pendingCount = items.filter((i) => i.status === "Menunggu Review").length;
  const approvedCount = items.filter((i) => i.status === "Disetujui").length;
  const rejectedCount = items.filter((i) => i.status === "Ditolak").length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ══════════════════════════════════════════════════════════════════
  // VIEW 1: AUTHENTICATION / LOGIN (IVORY + EMERALD + IOS STYLE)
  // ══════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FAF6EC] text-[#0D2F1D] flex flex-col justify-between p-4 sm:p-8 relative selection:bg-[#116B3C] selection:text-white">
        {/* Ambient Warm Emerald Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-gradient-to-b from-[#116B3C]/10 via-[#FAF6EC]/50 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Top Minimal Bar */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D2F1D]/70 hover:text-[#0D2F1D] transition-all bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#0D2F1D]/10 hover:border-[#0D2F1D]/20 shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#116B3C] bg-[#EAF6EE] px-2.5 py-1 rounded-full border border-[#116B3C]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#116B3C] animate-pulse" />
            <span>Optik I See You Secure</span>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="my-auto py-8">
          <div
            ref={loginCardRef}
            className="w-full max-w-[390px] mx-auto bg-white/95 backdrop-blur-xl border border-[#0D2F1D]/10 rounded-[32px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(13,47,29,0.06)] text-center relative overflow-hidden"
          >
            {/* Top Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-[#EAF6EE] text-[#116B3C] border border-[#116B3C]/20 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Lock className="w-7 h-7 stroke-[1.8]" />
            </div>

            {/* Official Brand Typography: OPTIK I SEE YOU | for every you */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "10px",
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
                  fontSize: "22px",
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
                    fontFamily: "var(--font-dm-serif)",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#116B3C",
                    letterSpacing: "0.18em",
                  }}
                >
                  for every you
                </span>
                <span className="h-[1px] w-4 bg-[#0D2F1D]/20" />
              </div>
            </div>

            <div className="inline-block bg-[#FAF6EC] px-3 py-1 rounded-full border border-[#0D2F1D]/10 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D2F1D]/80">
                Portal Internal &bull; Sponsor Management
              </span>
            </div>

            <p className="text-xs text-[#0D2F1D]/65 leading-relaxed mb-6 font-normal">
              Masukkan Security PIN Staff Marketing untuk mengelola proposal &amp; pengajuan kegiatan.
            </p>

            {/* Security Rate Limit Status */}
            {isLocked ? (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Akses Dikunci Sementara</span>
                </div>
                <p className="text-[11px] text-rose-600/90 leading-tight">
                  Terlalu banyak percobaan PIN salah. Demi keamanan, sistem dibekukan selama:
                </p>
                <div className="text-center py-2">
                  <span className="font-mono text-xl font-black text-rose-700 tracking-wider">
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
                      maxLength={18}
                      disabled={isVerifying || isLocked}
                      placeholder="••••••••••••"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        if (pinError) setPinError("");
                      }}
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#0D2F1D]/15 bg-[#FAF6EC]/70 text-center text-sm font-mono tracking-widest text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] focus:bg-white focus:border-transparent transition-all placeholder:text-[#0D2F1D]/30 placeholder:tracking-normal disabled:opacity-50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-3.5 text-[#0D2F1D]/45 hover:text-[#0D2F1D] transition-colors p-1"
                      tabIndex={-1}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Sisa Kesempatan */}
                {attemptsLeft !== null && attemptsLeft < 5 && !isLocked && (
                  <p className="text-[11px] text-amber-700 font-medium">
                    Sisa percobaan: <span className="font-bold font-mono">{attemptsLeft}</span> kali sebelum dikunci.
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
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Buka Dashboard</span>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="mt-6 pt-4 border-t border-[#0D2F1D]/8 flex items-center justify-center gap-1.5 text-[10.5px] text-[#0D2F1D]/50 font-medium">
              <Lock className="w-3 h-3 text-[#116B3C]" />
              <span>Proteksi Anti-Bruteforce &bull; Enkripsi Session 256-bit</span>
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
  // VIEW 2: ADMIN DASHBOARD (IVORY + EMERALD + IOS STYLE)
  // ══════════════════════════════════════════════════════════════════
  return (
    <main
      ref={dashboardRef}
      className="min-h-screen bg-[#FAF6EC] text-[#0D2F1D] flex flex-col selection:bg-[#116B3C] selection:text-white"
    >
      {/* Top iOS Floating Navigation Header */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#0D2F1D]/10 px-4 sm:px-8 py-3.5 shadow-xs transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Official Brand Typography */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D2F1D]/70 hover:text-[#0D2F1D] transition-colors p-1.5 rounded-xl hover:bg-[#FAF6EC]"
              title="Kembali ke Web Publik"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Beranda</span>
            </Link>

            <span className="text-[#0D2F1D]/20">|</span>

            {/* Official Logo: OPTIK I SEE YOU | for every you */}
            <div className="flex items-center gap-2">
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
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#116B3C",
                  letterSpacing: "0.15em",
                }}
              >
                for every you
              </span>

              <span className="ml-1 rounded-full bg-[#EAF6EE] text-[#116B3C] text-[10px] font-bold px-2 py-0.5 border border-[#116B3C]/20 shadow-xs">
                Sponsor Hub
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsGSheetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#116B3C]/25 bg-[#EAF6EE] hover:bg-[#116B3C] text-[#116B3C] hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Drive / Sheets</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0D2F1D]/15 bg-white hover:bg-[#FAF6EC] text-[#0D2F1D] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-[#0D2F1D]/60 hover:text-rose-600 transition-colors px-2 py-1.5 rounded-xl hover:bg-rose-50 cursor-pointer"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 grow space-y-6">
        {/* iOS Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-3xl border border-[#0D2F1D]/8 bg-white p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#0D2F1D]/60 uppercase tracking-wider">
              Total Pengajuan
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-[#0D2F1D] font-mono tracking-tight">
                {totalCount}
              </span>
              <span className="text-[11px] text-[#0D2F1D]/45 font-medium">Semua data</span>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-300/60 bg-amber-50/70 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Menunggu Review</span>
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-amber-900 font-mono tracking-tight">
                {pendingCount}
              </span>
              <span className="text-[11px] text-amber-700/80 font-medium">Perlu dicek</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#116B3C]/30 bg-[#EAF6EE] p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#116B3C] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#116B3C]" />
              <span>Disetujui</span>
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-[#0D2F1D] font-mono tracking-tight">
                {approvedCount}
              </span>
              <span className="text-[11px] text-[#116B3C] font-medium">Bekerjasama</span>
            </div>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Ditolak / Selesai</span>
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-rose-900 font-mono tracking-tight">
                {rejectedCount}
              </span>
              <span className="text-[11px] text-rose-700/80 font-medium">Arsip</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-3xl border border-[#0D2F1D]/8 bg-white p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#0D2F1D]/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama PIC, instansi, acara, no WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-[#FAF6EC]/50 text-xs text-[#0D2F1D] placeholder:text-[#0D2F1D]/40 focus:outline-none focus:ring-2 focus:ring-[#116B3C] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Filter Cabang */}
            <select
              value={selectedCabang}
              onChange={(e) => setSelectedCabang(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-white text-xs font-semibold text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] cursor-pointer shadow-2xs"
            >
              <option value="Semua">Semua Cabang (4 Kota)</option>
              <option value="Purwokerto">Purwokerto</option>
              <option value="Purbalingga">Purbalingga</option>
              <option value="Wonosobo">Wonosobo</option>
              <option value="Cilacap">Cilacap</option>
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-[#0D2F1D]/10 bg-white text-xs font-semibold text-[#0D2F1D] focus:outline-none focus:ring-2 focus:ring-[#116B3C] cursor-pointer shadow-2xs"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu Review">Menunggu Review</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            {/* Refresh */}
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

        {/* Proposals Table */}
        <div className="rounded-[32px] border border-[#0D2F1D]/8 bg-white overflow-hidden shadow-xs">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-[#0D2F1D]/50 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-[#0D2F1D]/30 stroke-[1.5]" />
              <p className="font-semibold text-sm text-[#0D2F1D]/70">
                {isLoading ? "Memuat data proposal..." : "Belum ada pengajuan sponsorship yang cocok."}
              </p>
              <p className="text-[11px] text-[#0D2F1D]/40">
                Data yang diajukan melalui /sponsor akan langsung otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#0D2F1D]/8 bg-[#FAF6EC]/80 text-[#0D2F1D]/70 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5">Tanggal / ID</th>
                    <th className="py-3.5 px-5">Instansi &amp; PIC</th>
                    <th className="py-3.5 px-5">Nama Acara &amp; Cabang</th>
                    <th className="py-3.5 px-5">Target &amp; Bentuk</th>
                    <th className="py-3.5 px-5">File Proposal</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D2F1D]/6">
                  {filteredItems.map((item) => {
                    const waClean = item.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
                    const chatText = encodeURIComponent(
                      `Halo Kak ${item.nama} (${item.instansi}), mengenai proposal sponsorship "${item.namaKegiatan}" yang diajukan ke Optik I See You #${item.id}:`
                    );

                    return (
                      <tr key={item.id} className="hover:bg-[#FAF6EC]/40 transition-colors">
                        {/* Tanggal & ID */}
                        <td className="py-4 px-5 whitespace-nowrap align-top">
                          <span className="font-mono text-[10px] text-[#0D2F1D]/45 font-bold block">
                            #{item.id}
                          </span>
                          <span className="text-[11px] text-[#0D2F1D]/80 font-medium">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Instansi & PIC */}
                        <td className="py-4 px-5 align-top">
                          <strong className="text-[#0D2F1D] block font-bold text-xs">
                            {item.instansi}
                          </strong>
                          <span className="text-[#0D2F1D]/70 text-[11px] block mt-0.5">
                            PIC: {item.nama}
                          </span>
                          <a
                            href={`https://wa.me/${waClean}?text=${chatText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#116B3C] hover:underline mt-1 bg-[#EAF6EE] px-2 py-0.5 rounded-full border border-[#116B3C]/20 w-fit"
                          >
                            <MessageCircle className="w-3 h-3 text-[#116B3C]" />
                            <span>{item.whatsapp}</span>
                          </a>
                        </td>

                        {/* Nama Acara & Cabang */}
                        <td className="py-4 px-5 align-top">
                          <strong className="text-[#0D2F1D] block font-semibold">
                            {item.namaKegiatan}
                          </strong>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#FAF6EC] border border-[#0D2F1D]/10 text-[10px] font-bold text-[#0D2F1D]/80">
                            Optik {item.cabang}
                          </span>
                          {item.tanggalKegiatan && (
                            <span className="text-[10.5px] text-[#0D2F1D]/60 block mt-1 font-medium">
                              Jadwal: {item.tanggalKegiatan}
                            </span>
                          )}
                        </td>

                        {/* Target & Bentuk Sponsor */}
                        <td className="py-4 px-5 align-top max-w-xs">
                          <span className="text-[#0D2F1D]/90 block font-semibold text-[11px]">
                            {item.targetPeserta} Peserta
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.bentukSponsor?.slice(0, 2).map((b, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#FAF6EC] border border-[#0D2F1D]/10 text-[9.5px] font-medium text-[#0D2F1D]/70"
                              >
                                {b}
                              </span>
                            ))}
                            {item.bentukSponsor?.length > 2 && (
                              <span className="text-[9.5px] text-[#0D2F1D]/50 self-center font-medium">
                                +{item.bentukSponsor.length - 2} lagi
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Proposal Link */}
                        <td className="py-4 px-5 whitespace-nowrap align-top">
                          {item.proposalUrl ? (
                            <a
                              href={item.proposalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#116B3C] font-semibold hover:underline bg-[#EAF6EE] px-2.5 py-1 rounded-xl border border-[#116B3C]/20"
                            >
                              <span>Buka File</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[#0D2F1D]/45 text-[11px] italic">Via Chat WhatsApp</span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-5 whitespace-nowrap align-top">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value as any)
                            }
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer shadow-2xs transition-all ${
                              item.status === "Disetujui"
                                ? "bg-[#EAF6EE] text-[#116B3C] border-[#116B3C]/30"
                                : item.status === "Ditolak"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : item.status === "Dalam Proses"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <option value="Menunggu Review">Menunggu Review</option>
                            <option value="Dalam Proses">Dalam Proses</option>
                            <option value="Disetujui">Disetujui</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-5 text-right whitespace-nowrap align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`https://wa.me/${waClean}?text=${chatText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat PIC di WhatsApp"
                              className="p-2 rounded-xl bg-[#EAF6EE] text-[#116B3C] hover:bg-[#116B3C] hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              title="Hapus Proposal"
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

      {/* ═══ GOOGLE SHEET / DRIVE INTEGRATION MODAL ═══ */}
      {isGSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[32px] border border-[#0D2F1D]/10 bg-white p-6 sm:p-8 shadow-2xl text-left relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF6EE] text-[#116B3C] border border-[#116B3C]/20 flex items-center justify-center">
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
                className="p-1.5 rounded-full hover:bg-[#FAF6EC] text-[#0D2F1D]/50 hover:text-[#0D2F1D] cursor-pointer"
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
                    <code className="block mt-1 p-2 rounded-lg bg-white border border-[#0D2F1D]/10 font-mono text-[10px] text-[#116B3C]">
                      GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
                    </code>
                  </li>
                  <li>
                    Setiap kali ada pemohon yang mengajukan form di <code>/sponsor</code>, sistem akan otomatis mengirim row data baru ke Google Spreadsheet Anda secara instan.
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF6EE] border border-[#116B3C]/20 text-[11.5px] text-[#0D2F1D] space-y-1">
                <p className="font-bold text-[#116B3C]">Keuntungan Metode Ini:</p>
                <p>&bull; 100% Gratis selamanya dari Google Workspace / Drive.</p>
                <p>&bull; File PDF proposal otomatis tersimpan di Google Drive pemohon atau drive optik.</p>
                <p>&bull; Staff marketing cabang mana saja bisa langsung membuka spreadsheet dari HP tanpa install aplikasi tambahan.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#116B3C] text-white font-bold text-xs hover:bg-[#0D2F1D] transition-colors cursor-pointer"
              >
                Tutup &amp; Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
