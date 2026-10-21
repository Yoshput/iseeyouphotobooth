"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Search,
  Check,
  Image as ImageIcon,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { MediaFile } from "@/lib/db/types";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText?: string) => void;
  currentUrl?: string;
  defaultCategory?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  defaultCategory = "general",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedFile(null);
      setPreviewUrl(null);
      setAltText("");
      setUploadError("");
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError("");
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("altText", altText);
      formData.append("category", defaultCategory);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengunggah gambar.");
      }

      // Success: auto-select uploaded file
      onSelect(json.data.url, json.data.altText);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()));
    const matchCategory =
      categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-isy-line overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-isy-line px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-isy-emerald">
                Pilih atau Unggah Media
              </h3>
              <p className="text-xs text-isy-text-secondary">
                Pilih aset dari Media Library atau upload gambar baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-isy-text-secondary hover:bg-isy-mist"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-isy-line bg-isy-ivory/50 px-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "library"
                ? "border-isy-emerald text-isy-emerald"
                : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Media Library ({mediaList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "upload"
                ? "border-isy-emerald text-isy-emerald"
                : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Unggah Gambar Baru</span>
          </button>
        </div>

        {/* Tab Content: Library */}
        {activeTab === "library" && (
          <div className="flex flex-col flex-1 overflow-hidden p-6">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-isy-text-secondary" />
                <input
                  type="text"
                  placeholder="Cari gambar berdasarkan nama file atau alt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white pl-9 pr-4 py-2 text-xs sm:text-sm text-isy-text-primary focus:border-isy-emerald focus:outline-none"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm text-isy-text-primary focus:border-isy-emerald focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="katalog-frame">Katalog Frame</option>
                <option value="softlens">Katalog Softlens</option>
                <option value="blog">Blog & Artikel</option>
                <option value="general">Umum</option>
              </select>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto admin-scrollbar pr-1.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-isy-emerald gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-xs font-semibold">Memuat media library...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-isy-text-secondary gap-2 border border-dashed border-isy-line rounded-xl">
                  <ImageIcon className="h-8 w-8 text-isy-line" />
                  <span className="text-sm font-semibold">Tidak ada file media yang sesuai.</span>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="mt-2 text-xs font-bold text-isy-emerald underline"
                  >
                    Unggah file baru sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredMedia.map((m) => {
                    const isSelected = currentUrl === m.url;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelect(m.url, m.altText);
                          onClose();
                        }}
                        className={`group relative flex flex-col rounded-xl border p-2 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? "border-isy-emerald bg-isy-mist ring-2 ring-isy-emerald/30"
                            : "border-isy-line bg-white hover:border-isy-emerald"
                        }`}
                      >
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-isy-ivory mb-2">
                          <Image
                            src={m.url}
                            alt={m.altText || m.name}
                            fill
                            sizes="180px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 rounded-full bg-isy-emerald p-1 text-white shadow-xs">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] font-bold text-isy-emerald truncate">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-isy-text-secondary truncate">
                          {m.category}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Upload */}
        {activeTab === "upload" && (
          <form
            onSubmit={handleUploadSubmit}
            className="flex flex-col flex-1 overflow-y-auto p-6 space-y-5"
          >
            {uploadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {uploadError}
              </div>
            )}

            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-isy-line bg-isy-mist/40 p-8 text-center transition-colors hover:border-isy-emerald">
              {previewUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-44 w-44 rounded-xl overflow-hidden bg-white shadow-sm border border-isy-line">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <label className="cursor-pointer text-xs font-bold text-isy-emerald hover:underline">
                    Ganti file terpilih
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-isy-emerald shadow-xs border border-isy-line mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-isy-emerald">
                    Klik untuk memilih file gambar
                  </span>
                  <span className="mt-1 text-xs text-isy-text-secondary">
                    PNG, JPG, WebP, GIF hingga 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {selectedFile && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-isy-emerald mb-1">
                    Teks Alternatif (Alt Text) — Rekomendasi SEO
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Contoh: Kacamata Titanium Bulat Rose Gold Optik I See You"
                    className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2.5 text-xs sm:text-sm text-isy-text-primary focus:border-isy-emerald focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-isy-line">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-isy-line bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary hover:bg-isy-mist"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className={`flex items-center gap-2 rounded-xl bg-isy-emerald px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-isy-emerald-hover ${
                  !selectedFile || isUploading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Unggah & Gunakan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
