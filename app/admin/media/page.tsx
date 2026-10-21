"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Search,
  Upload,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  FolderOpen,
  X,
} from "lucide-react";
import { MediaFile } from "@/lib/db/types";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");

  // Detail / Preview Modal
  const [previewModalFile, setPreviewModalFile] = useState<MediaFile | null>(null);

  // Delete State
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Copied URL state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFiles(json.data);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError("");
      if (!uploadAlt) {
        setUploadAlt(file.name.replace(/\.[^/.]+$/, ""));
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
      formData.append("altText", uploadAlt);
      formData.append("category", uploadCategory);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengunggah file.");
      }

      setUploadModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadAlt("");
      fetchMedia();
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah file media.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setDeleteWarning(null);

    try {
      const res = await fetch(`/api/admin/media?id=${fileToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setDeleteWarning(json.error || "Aset ini tidak dapat dihapus.");
        return;
      }

      setFileToDelete(null);
      if (previewModalFile?.id === fileToDelete.id) {
        setPreviewModalFile(null);
      }
      fetchMedia();
    } catch (err: any) {
      setDeleteWarning(err.message || "Gagal menghapus file media.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.altText && f.altText.toLowerCase().includes(q));

      const matchCategory =
        categoryFilter === "all" || f.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [files, search, categoryFilter]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "WebP Asset";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Top Header & Search Section (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <ImageIcon className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Media Library Terpusat</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola seluruh aset gambar kacamata, softlens, blog, dan media promosi website
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              setUploadError("");
              setUploadModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 shrink-0"
          >
            <Upload className="h-4 w-4 text-isy-green-bright" />
            <span>Unggah Gambar Baru</span>
          </button>
        </div>

        {/* Filter and Search Bar (FIXED) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-isy-line bg-white p-3 shadow-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-isy-text-secondary" />
            <input
              type="text"
              placeholder="Cari gambar berdasarkan nama file atau teks alt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-isy-line bg-isy-ivory/30 pl-10 pr-4 py-2 text-xs sm:text-sm text-isy-text-primary focus:border-isy-emerald focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="katalog-frame">Katalog Frame</option>
              <option value="softlens">Katalog Softlens</option>
              <option value="blog">Blog & Artikel</option>
              <option value="general">Umum</option>
            </select>

            <span className="hidden sm:inline-flex rounded-xl bg-isy-mist px-3 py-2 text-xs font-bold text-isy-emerald border border-isy-line">
              Total: {filteredFiles.length} File
            </span>
          </div>
        </div>
      </div>

      {/* Media Grid Container (HANYA BAGIAN INI YANG BISA DI-SCROLL) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-isy-emerald gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold">Memuat media library...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-isy-text-secondary gap-2 border border-dashed border-isy-line rounded-xl">
            <ImageIcon className="h-10 w-10 text-isy-line" />
            <span className="text-sm font-semibold">Tidak ada file media yang ditemukan.</span>
          </div>
        ) : (
          <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto admin-scrollbar pr-1.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative flex flex-col rounded-2xl border border-isy-line bg-white p-2.5 shadow-xs hover:border-isy-emerald hover:shadow-md transition-all"
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => setPreviewModalFile(file)}
                className="relative aspect-square w-full rounded-xl overflow-hidden bg-isy-ivory mb-2 cursor-pointer"
              >
                <Image
                  src={file.url}
                  alt={file.altText || file.name}
                  fill
                  sizes="200px"
                  className="object-contain p-1 group-hover:scale-105 transition-transform"
                />
              </div>

              {/* File Info */}
              <div className="space-y-0.5">
                <div
                  className="text-xs font-bold text-isy-emerald truncate"
                  title={file.name}
                >
                  {file.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-isy-text-secondary">
                  <span>{formatFileSize(file.sizeBytes)}</span>
                  <span className="rounded bg-isy-mist px-1.5 py-0.2 font-semibold">
                    {file.category}
                  </span>
                </div>
              </div>

              {/* Hover Actions Bar */}
              <div className="mt-2 pt-2 border-t border-isy-line flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy(file.url)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-isy-emerald hover:bg-isy-mist"
                  title="Salin URL gambar"
                >
                  {copiedUrl === file.url ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Salin URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteWarning(null);
                    setFileToDelete(file);
                  }}
                  className="rounded-md p-1 text-isy-text-secondary hover:text-red-600 hover:bg-red-50"
                  title="Hapus media"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal Dialog */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative flex flex-col w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-isy-line overflow-hidden p-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-isy-line pb-4 mb-4">
              <h3 className="text-base font-bold text-isy-emerald flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Unggah File Media Baru</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg p-1 text-isy-text-secondary hover:bg-isy-mist"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-isy-line bg-isy-mist/40 p-6 text-center">
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-36 w-36 rounded-xl overflow-hidden bg-white shadow-sm border border-isy-line">
                      <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
                    </div>
                    <label className="cursor-pointer text-xs font-bold text-isy-emerald hover:underline">
                      Ganti File
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-isy-emerald shadow-xs border border-isy-line mb-2">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-isy-emerald">
                      Pilih gambar dari komputer
                    </span>
                    <span className="text-[11px] text-isy-text-secondary mt-0.5">
                      JPG, PNG, WebP hingga 10MB
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Kategori Aset
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
                >
                  <option value="general">Umum</option>
                  <option value="katalog-frame">Katalog Frame</option>
                  <option value="softlens">Katalog Softlens</option>
                  <option value="blog">Blog & Artikel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-isy-emerald mb-1">
                  Teks Alternatif (Alt Text)
                </label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Deskripsi gambar untuk aksesibilitas dan SEO..."
                  className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs text-isy-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-isy-line">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border border-isy-line px-4 py-2 text-xs font-semibold text-isy-text-primary hover:bg-isy-mist"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className={`flex items-center gap-2 rounded-xl bg-isy-emerald px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover ${
                    !selectedFile || isUploading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <span>Unggah ke Storage</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative flex flex-col w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-isy-line overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-isy-line pb-3 mb-4">
              <h3 className="text-sm font-bold text-isy-emerald truncate max-w-md">
                {previewModalFile.name}
              </h3>
              <button
                onClick={() => setPreviewModalFile(null)}
                className="rounded-lg p-1 text-isy-text-secondary hover:bg-isy-mist"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl bg-isy-ivory border border-isy-line overflow-hidden mb-4">
              <Image
                src={previewModalFile.url}
                alt={previewModalFile.altText || previewModalFile.name}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-isy-line">
                <span className="text-isy-text-secondary">Kategori:</span>
                <span className="font-bold text-isy-emerald">{previewModalFile.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-isy-line">
                <span className="text-isy-text-secondary">Ukuran:</span>
                <span className="font-bold">{formatFileSize(previewModalFile.sizeBytes)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-isy-line">
                <span className="text-isy-text-secondary">Teks Alt:</span>
                <span className="font-semibold text-isy-ink">{previewModalFile.altText || "-"}</span>
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-isy-text-secondary">URL Publik:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewModalFile.url}
                    className="flex-1 rounded-xl border border-isy-line bg-isy-ivory/50 px-3 py-1.5 text-[11px] font-mono text-isy-ink"
                  />
                  <button
                    onClick={() => handleCopy(previewModalFile.url)}
                    className="rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs font-bold text-isy-emerald hover:bg-isy-mist"
                  >
                    Salin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Reference In-Use Safeguard */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-isy-line">
            <h3 className="text-base font-bold text-isy-emerald mb-2">Hapus File Media?</h3>
            <p className="text-xs text-isy-text-secondary leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus aset &quot;{fileToDelete.name}&quot;?
            </p>

            {deleteWarning && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>{deleteWarning}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="rounded-xl border border-isy-line bg-white px-4 py-2 text-xs font-semibold text-isy-text-primary hover:bg-isy-mist"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
              >
                {isDeleting ? "Memeriksa & Menghapus..." : "Hapus Media"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
