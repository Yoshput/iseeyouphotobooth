"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  UserCheck,
  UserX,
  X,
  Lock,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
} from "lucide-react";
import { AuditLog } from "@/lib/db/types";
import { SafeAdminUser } from "@/lib/auth/guard";
import ConfirmModal from "@/components/admin/ConfirmModal";

import AdminToast, { useAdminToast } from "@/components/admin/AdminToast";
export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeAdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [auditModuleFilter, setAuditModuleFilter] = useState("all");

  // Create User Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "admin">("admin");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete User Modal
  const [userToDelete, setUserToDelete] = useState<SafeAdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast — shared accessible AdminToast hook
  const { toast, showToast, dismissToast } = useAdminToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, auditRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/audit"),
      ]);

      const usersJson = await usersRes.json();
      const auditJson = await auditRes.json();

      if (usersJson.success && Array.isArray(usersJson.data)) {
        setUsers(usersJson.data);
      }
      if (auditJson.success && Array.isArray(auditJson.data)) {
        setAuditLogs(auditJson.data);
      }
    } catch {
      showToast("Gagal memuat data pengguna dan log audit.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setModalError("Nama, email, dan password wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setModalError("Password minimal terdiri dari 8 karakter.");
      return;
    }

    setIsSavingUser(true);
    setModalError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal membuat akun.");
      }

      showToast(`Akun admin "${name}" berhasil dibuat.`, "success");
      setIsCreateOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Gagal menambahkan akun admin.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus akun.");
      }
      showToast(`Akun "${userToDelete.name}" berhasil dihapus.`, "success");
      setUserToDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus akun.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (auditModuleFilter === "all") return true;
    return log.module === auditModuleFilter;
  });

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Shared Accessible Toast */}
      <AdminToast toast={toast} onDismiss={dismissToast} />
      {/* Top Header & Tab Switcher (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Pengguna & Audit Keamanan</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola hak akses akun staf admin dan pantau seluruh catatan audit aktivitas konten
            </p>
          </div>

          {activeTab === "users" && (
            <button
              onClick={() => {
                setModalError("");
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4 text-isy-green-bright" />
              <span>Tambah Admin Baru</span>
            </button>
          )}
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-isy-line bg-white rounded-2xl px-6 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "users"
                ? "border-isy-emerald text-isy-emerald"
                : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
            }`}
          >
            Daftar Akun Admin ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "audit"
                ? "border-isy-emerald text-isy-emerald"
                : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
            }`}
          >
            Catatan Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Users Tab (SCROLLABLE TABLE) */}
      {activeTab === "users" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-isy-emerald gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xs font-semibold">Memuat daftar admin...</span>
            </div>
          ) : (
            <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto admin-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 border-b border-isy-line bg-[#FAF7F0] text-[11px] font-bold uppercase tracking-wider text-isy-text-secondary backdrop-blur-xs shadow-2xs">
                  <tr>
                    <th className="px-4 py-3.5">Nama & Profil</th>
                    <th className="px-4 py-3.5">Email Akses</th>
                    <th className="px-4 py-3.5">Peran (Role)</th>
                    <th className="px-4 py-3.5">Login Terakhir</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-isy-line">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-isy-mist/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-bold text-isy-emerald">{u.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-isy-text-primary">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            u.role === "owner"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-isy-text-secondary text-xs">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString("id-ID")
                          : "Belum pernah login"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Aktif</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus akun"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col space-y-3">
          <div className="flex-shrink-0 flex items-center justify-between bg-white p-3 rounded-2xl border border-isy-line shadow-xs">
            <span className="text-xs font-bold text-isy-text-secondary">
              Filter Modul Audit:
            </span>
            <select
              value={auditModuleFilter}
              onChange={(e) => setAuditModuleFilter(e.target.value)}
              className="rounded-xl border border-isy-line bg-isy-ivory/30 px-3 py-1.5 text-xs font-semibold text-isy-text-primary focus:border-isy-emerald focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Modul</option>
              <option value="auth">Autentikasi (Login/Logout)</option>
              <option value="frames">Katalog Frame</option>
              <option value="softlens">Katalog Softlens</option>
              <option value="blog">Blog & Artikel</option>
              <option value="media">Media Library</option>
              <option value="settings">Konten & Pengaturan</option>
              <option value="users">Pengguna Admin</option>
            </select>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs">
            <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto admin-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 border-b border-isy-line bg-[#FAF7F0] text-[11px] font-bold uppercase tracking-wider text-isy-text-secondary backdrop-blur-xs shadow-2xs">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Akun & Email</th>
                    <th className="px-4 py-3">Perangkat / Device</th>
                    <th className="px-4 py-3">Aksi & Modul</th>
                    <th className="px-4 py-3">Detail Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-isy-line">
                  {filteredLogs.map((log) => {
                    const deviceName = log.device || (log.details?.device as string | undefined);
                    const isMobile = log.deviceType === "mobile" || deviceName?.toLowerCase().includes("hp") || deviceName?.toLowerCase().includes("iphone") || deviceName?.toLowerCase().includes("android");
                    const isTablet = log.deviceType === "tablet" || deviceName?.toLowerCase().includes("ipad") || deviceName?.toLowerCase().includes("tablet");

                    return (
                      <tr key={log.id} className="hover:bg-isy-mist/30">
                        <td className="px-4 py-3 text-xs text-isy-text-secondary whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-isy-emerald">
                            {log.userName || (log.details?.userName as string) || "Admin"}
                          </div>
                          <div className="text-[11px] text-isy-text-secondary">
                            {log.userEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {deviceName ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF7F0] border border-isy-line px-2.5 py-1 text-xs font-semibold text-[#183C30]">
                              {isMobile ? (
                                <Smartphone className="h-3.5 w-3.5 text-emerald-700" />
                              ) : isTablet ? (
                                <Tablet className="h-3.5 w-3.5 text-emerald-700" />
                              ) : (
                                <Laptop className="h-3.5 w-3.5 text-emerald-700" />
                              )}
                              <span>{deviceName}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-isy-text-secondary/60">-</span>
                          )}
                          {log.ipAddress && log.ipAddress !== "127.0.0.1" && log.ipAddress !== "::1" && (
                            <div className="text-[10px] text-isy-text-secondary/60 mt-0.5">
                              IP: {log.ipAddress}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block rounded-md bg-isy-mist px-2 py-0.5 text-[10px] font-bold text-isy-emerald border border-isy-line mr-2">
                            {log.module}
                          </span>
                          <span className="font-bold text-xs uppercase">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-isy-ink font-mono max-w-xs truncate">
                          {log.details ? (
                            log.details.message || log.details.reason ? (
                              <span className="font-sans font-medium text-isy-text-primary">
                                {log.details.message || log.details.reason}
                              </span>
                            ) : (
                              JSON.stringify(log.details)
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-isy-line"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-isy-line pb-3 mb-4">
              <h3 className="text-base font-bold text-isy-emerald flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Tambah Akun Admin Baru</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-isy-text-secondary hover:bg-isy-mist"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Nama Lengkap Admin *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Staff Marketing"
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Email Login *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rian@optikiseeyou.com"
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Kata Sandi (Password) *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter..."
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Peran Akses (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm text-isy-ink"
                >
                  <option value="admin">Admin (Kelola Katalog & Konten)</option>
                  <option value="owner">Owner (Kelola Semua + Pengguna)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-isy-line">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-isy-line px-4 py-2 text-xs font-semibold text-isy-text-primary hover:bg-isy-mist"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className={`flex items-center gap-2 rounded-xl bg-isy-emerald px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover ${
                    isSavingUser ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSavingUser ? "Membuat Akun..." : "Buat Akun Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirm */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akun Admin?"
        description={`Apakah Anda yakin ingin menghapus akses admin untuk "${userToDelete?.name}" (${userToDelete?.email})? Akun ini tidak akan dapat login kembali.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus Akun"}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
