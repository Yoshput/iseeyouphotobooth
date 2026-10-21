"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, CircleHelp } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface AdminHeaderProps {
  onMenuClick: () => void;
  user?: {
    name: string;
    email: string;
    role: "owner" | "admin";
  };
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 sm:h-20 w-full shrink-0 items-center justify-between border-b border-isy-line bg-white/95 px-3 sm:px-8 backdrop-blur-md">
        {/* Left: Mobile Toggle & Welcome */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-isy-line p-2 text-isy-emerald hover:bg-isy-mist lg:hidden shrink-0 touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Buka navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-isy-emerald sm:text-base truncate">
              Optik I See You — Panel Admin
            </h1>
            <p className="hidden text-xs text-isy-text-secondary sm:block">
              Kelola katalog kacamata, softlens, artikel, dan konten website terpusat
            </p>
          </div>
        </div>

        {/* Right: User Profile, Tour Replay & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Interactive Guided Tour Replay Button */}
          <button
            type="button"
            data-tour="admin-help"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("admin:start-tour"));
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-isy-line bg-isy-mist/70 px-2.5 py-1.5 text-xs font-bold text-isy-emerald hover:bg-isy-emerald hover:text-white transition-all touch-manipulation shadow-2xs"
            title="Buka panduan interaktif dashboard"
            aria-label="Buka panduan dashboard"
          >
            <CircleHelp className="h-4 w-4 shrink-0 text-isy-green-bright" />
            <span className="hidden md:inline">Panduan</span>
          </button>

          {user && (
            <div
              data-tour="header-user"
              className="flex items-center gap-2 sm:gap-3 rounded-full border border-isy-line bg-isy-ivory/60 py-1 pl-1.5 pr-2.5 sm:py-1.5 sm:pl-3 sm:pr-4 shadow-2xs"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-isy-emerald text-white text-[11px] sm:text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-bold text-isy-emerald leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-isy-text-secondary">{user.email}</div>
              </div>
              <span
                className={`rounded-full px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                  user.role === "owner"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-isy-line text-isy-text-secondary hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation"
            title="Keluar dari Admin"
            aria-label="Keluar dari Panel Admin"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari Panel Admin?"
        description="Apakah Anda yakin ingin mengakhiri sesi admin ini? Anda harus login kembali untuk mengakses panel pengelola konten."
        confirmText={isLoggingOut ? "Mengakhiri sesi..." : "Keluar"}
      />
    </>
  );
}
