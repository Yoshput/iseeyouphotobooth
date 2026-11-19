"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  Archive,
  AlertTriangle,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import {
  PromoItem,
  PromoPopupSettings,
  PromoCategory,
  PromoStatus,
} from "@/lib/db/types";
import {
  isPromoActive,
  getPromoDisplayStatus,
  formatPromoPeriod,
  getCategoryLabel,
  PROMO_CATEGORIES,
} from "@/lib/promo";
import AdminToast, { useAdminToast } from "@/components/admin/AdminToast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import PromoFormModal from "./PromoFormModal";
import PromoPreviewModal from "./PromoPreviewModal";
import PromoPopupSettingsPanel from "./PromoPopupSettingsPanel";

interface PromoListClientProps {
  initialPromos: PromoItem[];
  initialSettings: PromoPopupSettings;
}

export default function PromoListClient({
  initialPromos,
  initialSettings,
}: PromoListClientProps) {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromos);
  const [settings, setSettings] = useState<PromoPopupSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"list" | "settings">("list");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);
  const [previewPromo, setPreviewPromo] = useState<PromoItem | null>(null);

  // Deletion
  const [promoToDelete, setPromoToDelete] = useState<PromoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const { toast, showToast, dismissToast } = useAdminToast();

  // Metrics
  const now = useMemo(() => new Date(), []);
  const metrics = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    let expired = 0;
    let draft = 0;
    let archived = 0;

    promos.forEach((p) => {
      const st = getPromoDisplayStatus(p, now);
      if (st === "active") active++;
      else if (st === "scheduled") scheduled++;
      else if (st === "expired") expired++;
      else if (st === "draft") draft++;
      else if (st === "archived") archived++;
    });

    return { active, scheduled, expired, draft, archived, total: promos.length };
  }, [promos, now]);

  // Filtered list
  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      // Category filter
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const displaySt = getPromoDisplayStatus(p, now);
        if (statusFilter === "active" && displaySt !== "active") return false;
        if (statusFilter === "scheduled" && displaySt !== "scheduled") return false;
        if (statusFilter === "expired" && displaySt !== "expired") return false;
        if (statusFilter === "draft" && p.status !== "draft") return false;
        if (statusFilter === "archived" && p.status !== "archived") return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        const matchesSubtitle = p.subtitle?.toLowerCase().includes(q);
        const matchesExcerpt = p.excerpt.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug && !matchesSubtitle && !matchesExcerpt) {
          return false;
        }
      }

      return true;
    });
  }, [promos, categoryFilter, statusFilter, search, now]);

  // Handle Form Success (create or edit)
  const handleFormSuccess = (saved: PromoItem) => {
    setPromos((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    showToast(
      editingPromo
        ? `Promo "${saved.title}" berhasil diperbarui.`
        : `Promo "${saved.title}" berhasil ditambahkan.`,
      "success"
    );
  };

  // Quick Status Transition (e.g. publish or archive directly)
  const handleQuickStatusChange = async (id: string, newStatus: PromoStatus) => {
    try {
      const res = await fetch("/api/admin/promos/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengubah status promo.");
      }

      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      showToast(
        newStatus === "published"
          ? "Promo berhasil diterbitkan."
          : newStatus === "archived"
          ? "Promo berhasil diarsipkan."
          : "Promo dikembalikan ke draft.",
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Gagal mengubah status.", "error");
    }
  };

  // Delete Promo
  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/promos?id=${promoToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus promo.");
      }

      setPromos((prev) => prev.filter((p) => p.id !== promoToDelete.id));
      showToast(`Promo "${promoToDelete.title}" berhasil dihapus.`, "success");
      setPromoToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Gagal menghapus promo.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Top Banner (Header & Quick Action) */}
      <div className="flex-shrink-0 rounded-3xl border border-isy-line bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-mist px-3 py-1 text-xs font-bold text-isy-emerald border border-isy-line mb-2">
              <Megaphone className="h-3.5 w-3.5 text-isy-green-bright" />
              <span>Promo & Campaign Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-isy-emerald tracking-tight">
              Kelola Promosi & Program Toko
            </h1>
            <p className="text-xs sm:text-sm text-isy-text-secondary mt-0.5">
              Satu sumber data promo untuk Homepage, Featured Popup, dan Microsite promo.optikiseeyou.com
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setEditingPromo(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-white stroke-[2.5]" />
              <span>Tambah Promo Baru</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Daftar Promo vs Pengaturan Popup */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-isy-emerald text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Daftar Promo ({metrics.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "settings"
                ? "bg-isy-emerald text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Pengaturan Featured Popup</span>
            {settings.enabled && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 min-h-0 overflow-y-auto admin-scrollbar pr-1 sm:pr-2 space-y-5">
        {/* ============================================================== */}
        {/* TAB A: DAFTAR PROMO */}
        {/* ============================================================== */}
        {activeTab === "list" && (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-isy-line bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Promo Aktif
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-emerald-700">{metrics.active}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live Publik
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-isy-line bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Terjadwal
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-amber-700">{metrics.scheduled}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Masa Depan
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-isy-line bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Draft Tersimpan
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-slate-700">{metrics.draft}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Belum Terbit
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-isy-line bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Berakhir / Arsip
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-slate-500">
                    {metrics.expired + metrics.archived}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Selesai
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-isy-line bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari promo berdasarkan judul, ringkasan, atau slug..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white focus:border-[#124734] focus:outline-none"
                  >
                    <option value="all">Semua Status Waktu</option>
                    <option value="active">🟢 Sedang Aktif</option>
                    <option value="scheduled">🟡 Terjadwal</option>
                    <option value="draft">⚪ Draft</option>
                    <option value="expired">🔴 Telah Berakhir</option>
                    <option value="archived">📦 Diarsipkan</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Kategori:
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shrink-0 ${
                    categoryFilter === "all"
                      ? "bg-[#124734] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Semua ({promos.length})
                </button>
                {PROMO_CATEGORIES.map((cat) => {
                  const count = promos.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shrink-0 ${
                        categoryFilter === cat.id
                          ? "bg-[#124734] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promos List Table / Cards */}
            {filteredPromos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-50 text-isy-emerald">
                  <Megaphone className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Belum ada promo yang cocok
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {promos.length === 0
                    ? "Belum ada program promo yang dibuat. Klik tombol di bawah untuk menambahkan promo pertama Anda."
                    : "Tidak ada promo yang sesuai dengan pencarian atau filter yang dipilih."}
                </p>
                {promos.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPromo(null);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#124734] px-4 py-2 text-xs font-bold text-white hover:bg-[#0d2f1d] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Buat Promo Pertama</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-isy-line bg-white overflow-hidden shadow-xs">
                <div className="divide-y divide-slate-100">
                  {filteredPromos.map((promo) => {
                    const displaySt = getPromoDisplayStatus(promo, now);
                    const period = formatPromoPeriod(promo.startAt, promo.endAt);

                    return (
                      <div
                        key={promo.id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Left: Thumbnail & Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Thumbnail */}
                          <div className="relative h-20 w-28 sm:h-22 sm:w-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {promo.heroImageUrl ? (
                              <Image
                                src={promo.heroImageUrl}
                                alt={promo.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-slate-300">
                                <Tag className="h-6 w-6" />
                              </div>
                            )}
                            <div className="absolute top-1.5 left-1.5">
                              <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                {promo.category}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Display status badge */}
                              {displaySt === "active" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Aktif
                                </span>
                              )}
                              {displaySt === "scheduled" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Terjadwal
                                </span>
                              )}
                              {displaySt === "draft" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                                  Draft
                                </span>
                              )}
                              {displaySt === "expired" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                                  Berakhir
                                </span>
                              )}
                              {displaySt === "archived" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                                  Arsip
                                </span>
                              )}

                              {promo.showOnHomepage && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                                  Homepage
                                </span>
                              )}

                              {promo.showInPopup && (
                                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
                                  Popup (Prioritas {promo.popupPriority})
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                              {promo.title}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-1">
                              {promo.excerpt}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {period}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-slate-400 truncate max-w-[200px]">
                                /{promo.slug}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewPromo(promo)}
                            title="Pratinjau Promo"
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPromo(promo);
                              setIsFormOpen(true);
                            }}
                            title="Edit Promo"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                            <span>Edit</span>
                          </button>

                          {/* Quick Status Dropdown */}
                          <select
                            value={promo.status}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                promo.id,
                                e.target.value as PromoStatus
                              )
                            }
                            className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#124734]"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Terbit</option>
                            <option value="archived">Arsip</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setPromoToDelete(promo)}
                            title="Hapus Promo"
                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* TAB B: PENGATURAN POPUP */}
        {/* ============================================================== */}
        {activeTab === "settings" && (
          <PromoPopupSettingsPanel
            settings={settings}
            promos={promos}
            onSettingsSaved={(updated) => setSettings(updated)}
            showToast={showToast}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(promoToDelete)}
        onClose={() => setPromoToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Promo"
        description={`Apakah Anda yakin ingin menghapus promo "${promoToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Promo"
        cancelText="Batal"
        confirmVariant="danger"
        isLoading={isDeleting}
      />

      {/* Promo Form Modal */}
      <PromoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingPromo={editingPromo}
      />

      {/* Preview Modal */}
      {previewPromo && (
        <PromoPreviewModal
          isOpen={Boolean(previewPromo)}
          onClose={() => setPreviewPromo(null)}
          promo={previewPromo}
          initialMode="microsite"
        />
      )}

      {/* Toast Notification */}
      <AdminToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
