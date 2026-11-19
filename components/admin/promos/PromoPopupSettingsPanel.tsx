"use client";

import { useState } from "react";
import {
  Sparkles,
  Clock,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  HelpCircle,
  Layers,
  Monitor,
} from "lucide-react";
import { PromoItem, PromoPopupSettings, PromoDetailLayout } from "@/lib/db/types";
import PromoPreviewModal from "./PromoPreviewModal";

interface PromoPopupSettingsPanelProps {
  settings: PromoPopupSettings;
  promos: PromoItem[];
  onSettingsSaved: (updated: PromoPopupSettings) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export default function PromoPopupSettingsPanel({
  settings,
  promos,
  onSettingsSaved,
  showToast,
}: PromoPopupSettingsPanelProps) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [featuredPromoId, setFeaturedPromoId] = useState(settings.featuredPromoId || "");
  const [frequency, setFrequency] = useState(settings.frequency || "once-per-session");
  const [delayMs, setDelayMs] = useState(settings.delayMs || 1500);
  const [layout, setLayout] = useState<PromoDetailLayout>(settings.layout || "image-left");

  const [isSaving, setIsSaving] = useState(false);
  const [previewPromo, setPreviewPromo] = useState<PromoItem | null>(null);

  const activeCandidates = promos.filter(
    (p) => p.status === "published"
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: Partial<PromoPopupSettings> = {
        enabled,
        featuredPromoId: featuredPromoId.trim() || undefined,
        frequency,
        delayMs: Number(delayMs) || 1500,
        layout,
      };

      const res = await fetch("/api/admin/promos/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan pengaturan popup.");
      }

      onSettingsSaved(json.data);
      showToast("Pengaturan featured popup berhasil diperbarui.", "success");
    } catch (err: any) {
      console.error("Save popup settings error:", err);
      showToast(err.message || "Gagal menyimpan pengaturan popup.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPopup = () => {
    let target = promos.find((p) => p.id === featuredPromoId);
    if (!target) {
      target = promos.find((p) => p.showInPopup && p.status === "published") || promos[0];
    }
    if (target) {
      setPreviewPromo(target);
    } else {
      showToast("Belum ada promo yang dapat dipratinjau.", "info");
    }
  };

  return (
    <div className="rounded-3xl border border-isy-line bg-white p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#124734] border border-emerald-200 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#2FA84F]" />
            <span>Featured Promo Popup Homepage</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#124734]">
            Pengaturan Modal Unggulan Pengunjung
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur kemunculan modal promosi interaktif ketika pengunjung membuka homepage optikiseeyou.com
          </p>
        </div>

        <button
          type="button"
          onClick={handlePreviewPopup}
          className="inline-flex items-center gap-2 rounded-xl border border-isy-line bg-white px-4 py-2.5 text-xs font-bold text-[#124734] hover:bg-isy-mist transition-colors shadow-2xs self-start"
        >
          <Eye className="h-4 w-4 text-[#2FA84F]" />
          <span>Simulasi Tampilan Popup</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle On / Off */}
        <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Aktifkan Featured Promo Popup
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Jika dinonaktifkan, tidak ada popup promosi yang akan muncul di homepage
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#124734]"></div>
          </label>
        </div>

        {enabled && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Promo Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Promo yang Dijadikan Unggulan Popup
              </label>
              <select
                value={featuredPromoId}
                onChange={(e) => setFeaturedPromoId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
              >
                <option value="">
                  ⭐ Otomatis: Pilih dari kandidat popup aktif dengan prioritas tertinggi
                </option>
                {activeCandidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (Kategori: {p.category.toUpperCase()})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Jika admin memilih satu promo spesifik, promo tersebut akan diprioritaskan tampil selama periode promo masih aktif.
              </p>
            </div>

            {/* Frequency selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Frekuensi Kemunculan Popup ke Pengunjung
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "once-per-session",
                    title: "Sekali per Sesi Browser (Default)",
                    desc: "Muncul sekali per kunjungan tab/jendela. Tidak mengganggu saat klik halaman lain.",
                  },
                  {
                    id: "once-per-day",
                    title: "Sekali per 24 Jam",
                    desc: "Hanya muncul satu kali dalam sehari untuk pengunjung yang sama.",
                  },
                  {
                    id: "always",
                    title: "Selalu Muncul (Mode Uji Coba)",
                    desc: "Popup akan selalu muncul setiap kali homepage di-refresh (khusus testing).",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFrequency(item.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      frequency === item.id
                        ? "border-[#124734] bg-emerald-50/50 text-[#124734] ring-1 ring-[#124734]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{item.title}</span>
                      {frequency === item.id && <Check className="h-4 w-4 text-[#124734]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Delay & Layout Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delay Timing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jeda Tampil Setelah Homepage Siap (Milidetik)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    step={50}
                    value={delayMs}
                    onChange={(e) => setDelayMs(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-[#124734] focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    ({(delayMs / 1000).toFixed(2)} detik)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Standar cepat instan (ala Optik Melawai): 100 - 200 ms agar langsung tampil seketika saat halaman terbuka.
                </p>
              </div>

              {/* Layout Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Posisi Komposisi Desktop Popup
                </label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as PromoDetailLayout)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 bg-white focus:border-[#124734] focus:outline-none"
                >
                  <option value="image-left">Gambar di Kiri, Konten di Kanan (Standar)</option>
                  <option value="image-right">Konten di Kiri, Gambar di Kanan</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pada layar ponsel mobile, gambar otomatis berada di atas secara vertikal.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 text-white" />
                <span>Simpan Pengaturan Popup</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewPromo && (
        <PromoPreviewModal
          isOpen={Boolean(previewPromo)}
          onClose={() => setPreviewPromo(null)}
          promo={previewPromo}
          initialMode="popup"
        />
      )}
    </div>
  );
}
