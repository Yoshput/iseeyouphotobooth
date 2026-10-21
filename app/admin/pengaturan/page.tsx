"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  Share2,
  Phone,
} from "lucide-react";
import { WebsiteSettings } from "@/lib/db/types";
import SaveConfirmModal from "@/components/admin/SaveConfirmModal";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch {
      showToast("Gagal memuat pengaturan global.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setShowSaveConfirm(true);
  };

  const executeSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan pengaturan.");
      }

      showToast("Pengaturan global berhasil disimpan.", "success");
      setShowSaveConfirm(false);
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan pengaturan.", "error");
      setShowSaveConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-isy-emerald gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xs font-semibold">Memuat pengaturan global...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold shadow-xl border animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-red-50 text-red-900 border-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-isy-line">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
            <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
            <span>Pengaturan Global & SEO</span>
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
            Konfigurasi metadata SEO mesin pencari, kontak CS resmi, dan integrasi sosial media
          </p>
        </div>

        <button
          onClick={() => handleSaveSubmit()}
          disabled={isSaving}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 shrink-0 ${
            isSaving ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4 text-isy-green-bright" />
          )}
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      <form id="admin-table-scroll" onSubmit={handleSaveSubmit} className="flex-1 min-h-0 overflow-y-auto admin-scrollbar pr-1 sm:pr-2 space-y-6">
        {/* SEO Settings Card */}
        <div className="rounded-3xl border border-isy-line bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-isy-emerald flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <span>Pengaturan SEO Global (Search Engine Optimization)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-isy-emerald mb-1">
              Global Meta Title Website
            </label>
            <input
              type="text"
              value={settings.globalSeoTitle}
              onChange={(e) =>
                setSettings({ ...settings, globalSeoTitle: e.target.value })
              }
              placeholder="Optik I See You | Kacamata Trendy & Softlens Resmi"
              className="w-full rounded-2xl border border-isy-line bg-white p-3 text-xs sm:text-sm text-isy-ink font-semibold focus:border-isy-emerald focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-isy-emerald mb-1">
              Global Meta Description
            </label>
            <textarea
              rows={3}
              value={settings.globalSeoDescription}
              onChange={(e) =>
                setSettings({ ...settings, globalSeoDescription: e.target.value })
              }
              placeholder="Deskripsi default website untuk cuplikan Google..."
              className="w-full rounded-xl border border-isy-line bg-white p-3 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
            />
          </div>
        </div>

        {/* Contact and Social Links */}
        <div className="rounded-3xl border border-isy-line bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-isy-emerald flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <span>Kontak CS & Tautan Media Sosial</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Nomor Telepon CS Utama
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings({ ...settings, contactPhone: e.target.value })
                }
                placeholder="0895-4156-14261"
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                WhatsApp Konsultasi Resmi (Format 62...)
              </label>
              <input
                type="text"
                value={settings.contactWhatsapp}
                onChange={(e) =>
                  setSettings({ ...settings, contactWhatsapp: e.target.value })
                }
                placeholder="62895415614261"
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Tautan Profil Instagram Resmi
              </label>
              <input
                type="text"
                value={settings.instagramUrl}
                onChange={(e) =>
                  setSettings({ ...settings, instagramUrl: e.target.value })
                }
                placeholder="https://www.instagram.com/iseeyou.glasses/"
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Tautan Toko Shopee Resmi
              </label>
              <input
                type="text"
                value={settings.shopeeUrl}
                onChange={(e) =>
                  setSettings({ ...settings, shopeeUrl: e.target.value })
                }
                placeholder="https://shopee.co.id/iseeyou.id"
                className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink"
              />
            </div>
          </div>

          {/* Bottom Save Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-isy-line">
            <span className="text-xs text-isy-text-secondary">
              Perubahan pada SEO, nomor CS, dan media sosial akan langsung terintegrasi ke seluruh website publik.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 ${
                isSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-isy-green-bright" />
              )}
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Save Confirmation Modal */}
      <SaveConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title="Simpan Pengaturan Global & SEO?"
        description="Apakah Anda yakin ingin menyimpan perubahan pada pengaturan website, nomor kontak CS, dan link media sosial? Data ini akan langsung aktif di seluruh website publik."
        confirmText="Ya, Simpan Pengaturan"
        isLoading={isSaving}
        variant="save"
      />
    </div>
  );
}
