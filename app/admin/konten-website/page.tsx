"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Phone,
  MessageCircle,
} from "lucide-react";
import { WebsiteSettings } from "@/lib/db/types";
import { Branch } from "@/lib/branches";
import SaveConfirmModal from "@/components/admin/SaveConfirmModal";

export default function AdminWebsiteContentPage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "branches">("hero");
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
      showToast("Gagal memuat pengaturan konten website.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleBranchChange = (index: number, field: keyof Branch, val: any) => {
    if (!settings) return;
    const updated = [...settings.branches];
    updated[index] = { ...updated[index], [field]: val };
    setSettings({ ...settings, branches: updated });
  };

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
        throw new Error(json.error || "Gagal menyimpan konten website.");
      }

      showToast("Konten website berhasil disimpan dan diperbarui.", "success");
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
        <span className="text-xs font-semibold">Memuat pengaturan konten...</span>
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

      {/* Top Header & Tab Switcher (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <Globe className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Konten Website & Informasi Cabang</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola teks hero beranda, jam operasional, alamat 4 cabang, dan tautan konsultasi WhatsApp
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
            <span>Simpan Perubahan</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-isy-line bg-white rounded-2xl px-6 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "hero"
                ? "border-isy-emerald text-isy-emerald"
                : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
            }`}
          >
            Hero Banner Beranda
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("branches")}
            className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "branches"
                ? "border-isy-emerald text-isy-emerald"
                : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
            }`}
          >
            Informasi 4 Cabang Toko
          </button>
        </div>
      </div>

      {/* Form Content Area (HANYA BAGIAN INI YANG BISA DI-SCROLL KE BAWAH) */}
      <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto admin-scrollbar pr-1 sm:pr-2">
        {/* Hero Form */}
        {activeTab === "hero" && (
          <form onSubmit={handleSaveSubmit} className="space-y-6">
          <div className="rounded-3xl border border-isy-line bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-isy-emerald">
              Hero Section (Halaman Depan)
            </h3>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Headline Utama Hero
              </label>
              <input
                type="text"
                value={settings.heroHeadline}
                onChange={(e) =>
                  setSettings({ ...settings, heroHeadline: e.target.value })
                }
                placeholder="Judul besar di beranda..."
                className="w-full rounded-2xl border border-isy-line bg-white p-3 text-sm font-bold text-isy-emerald focus:border-isy-emerald focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Subheadline / Deskripsi Singkat Hero
              </label>
              <textarea
                rows={3}
                value={settings.heroSubheadline}
                onChange={(e) =>
                  setSettings({ ...settings, heroSubheadline: e.target.value })
                }
                placeholder="Deskripsi singkat pendukung headline..."
                className="w-full rounded-xl border border-isy-line bg-white p-3 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Teks Tombol Aksi Utama (CTA)
                </label>
                <input
                  type="text"
                  value={settings.heroCtaText}
                  onChange={(e) =>
                    setSettings({ ...settings, heroCtaText: e.target.value })
                  }
                  placeholder="Contoh: Coba AR Try-On"
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Tautan Tombol CTA (URL)
                </label>
                <input
                  type="text"
                  value={settings.heroCtaLink}
                  onChange={(e) =>
                    setSettings({ ...settings, heroCtaLink: e.target.value })
                  }
                  placeholder="Contoh: /start"
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-isy-line">
              <span className="text-xs text-isy-text-secondary">
                Perubahan pada teks hero dan CTA akan langsung tampil di beranda website.
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
                <span>Simpan Konten Hero</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Branches Form */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {settings.branches.map((branch, idx) => (
              <div
                key={branch.id}
                className="rounded-3xl border border-isy-line bg-white p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-isy-line pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-isy-emerald" />
                    <h3 className="font-bold text-isy-emerald">{branch.name}</h3>
                  </div>
                  <span className="rounded-full bg-isy-mist px-2.5 py-0.5 text-[10px] font-bold text-isy-emerald border border-isy-line uppercase">
                    {branch.city}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                    Alamat Lengkap Toko
                  </label>
                  <textarea
                    rows={2}
                    value={branch.address}
                    onChange={(e) => handleBranchChange(idx, "address", e.target.value)}
                    className="w-full rounded-xl border border-isy-line bg-white p-2.5 text-xs text-isy-ink"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                      Jam Operasional
                    </label>
                    <input
                      type="text"
                      value={branch.hours}
                      onChange={(e) => handleBranchChange(idx, "hours", e.target.value)}
                      placeholder="Buka 09:00 - 21:00 WIB"
                      className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                      Nomor WhatsApp Cabang
                    </label>
                    <input
                      type="text"
                      value={branch.waNumber || branch.phone}
                      onChange={(e) => handleBranchChange(idx, "waNumber", e.target.value)}
                      placeholder="62895415614261"
                      className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                    Link Google Maps / Lokasi GPS
                  </label>
                  <input
                    type="text"
                    value={branch.googleMapsUrl}
                    onChange={(e) => handleBranchChange(idx, "googleMapsUrl", e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Action Bar for Branches */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 rounded-2xl bg-white border border-isy-line shadow-xs">
            <span className="text-xs text-isy-text-secondary">
              Perubahan jam buka, alamat, dan WhatsApp cabang akan tersinkronisasi di halaman cabang dan sitemap.
            </span>
            <button
              type="button"
              onClick={handleSaveSubmit}
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
              <span>Simpan Data Cabang</span>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Save Confirmation Modal */}
      <SaveConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title={activeTab === "hero" ? "Simpan Konten Hero Beranda?" : "Simpan Data Cabang Toko?"}
        description={
          activeTab === "hero"
            ? "Apakah Anda yakin ingin memperbarui headline, deskripsi, dan tombol CTA halaman depan website? Perubahan akan langsung tampil di beranda."
            : "Apakah Anda yakin ingin memperbarui informasi alamat, jam operasional, dan nomor WhatsApp cabang resmi? Data akan langsung diperbarui di halaman cabang dan kontak website."
        }
        confirmText="Ya, Simpan Perubahan"
        isLoading={isSaving}
        variant="save"
      />
    </div>
  );
}
