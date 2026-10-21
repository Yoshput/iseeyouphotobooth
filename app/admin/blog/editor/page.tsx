"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Globe,
  Tag,
} from "lucide-react";
import { BlogPostItem } from "@/lib/db/types";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import SaveConfirmModal from "@/components/admin/SaveConfirmModal";

const CATEGORIES = [
  { id: "edukasi-mata", label: "Edukasi Mata" },
  { id: "tips-pilih-frame", label: "Tips Pilih Frame" },
  { id: "perawatan-softlens", label: "Perawatan Softlens" },
  { id: "tren-gaya", label: "Tren & Gaya" },
  { id: "info-cabang-promo", label: "Info Cabang & Promo" },
];

function BlogEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");

  const [isLoading, setIsLoading] = useState(Boolean(editSlug));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<"draft" | "published" | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("edukasi-mata");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Tim Optik I See You");
  const [relatedCabang, setRelatedCabang] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    if (!editSlug) return;

    fetch(`/api/admin/blog`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find((p: BlogPostItem) => p.slug === editSlug);
          if (found) {
            setTitle(found.title);
            setSlug(found.slug);
            setCategory(found.category);
            setExcerpt(found.excerpt);
            setCoverImage(found.coverImage);
            setVideoUrl(found.videoUrl || "");
            setContent(found.content);
            setAuthor(found.author || "Tim Optik I See You");
            setRelatedCabang(found.relatedCabang || "");
            setStatus(found.status);
            setSeoTitle(found.seoTitle || "");
            setSeoDescription(found.seoDescription || "");
          }
        }
      })
      .catch((err) => {
        setErrorMessage("Gagal memuat artikel untuk diedit.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [editSlug]);

  const handleSave = (targetStatus?: "draft" | "published") => {
    if (!title.trim() || !category || !excerpt.trim() || !coverImage.trim() || !content.trim()) {
      setErrorMessage("Judul, kategori, ringkasan (excerpt), foto cover, dan isi artikel wajib diisi.");
      return;
    }
    setErrorMessage("");
    setConfirmStatus(targetStatus || "draft");
  };

  const executeSave = async (targetStatus: "draft" | "published") => {
    setIsSaving(true);
    setErrorMessage("");

    const payload = {
      slug: editSlug || slug || undefined,
      title: title.trim(),
      category,
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      videoUrl: videoUrl.trim() || undefined,
      content,
      author: author.trim() || "Tim Optik I See You",
      relatedCabang: relatedCabang.trim() || undefined,
      status: targetStatus,
      seoTitle: seoTitle.trim() || `${title} | Blog Optik I See You`,
      seoDescription: seoDescription.trim() || excerpt.trim(),
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: editSlug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan artikel.");
      }

      setConfirmStatus(null);
      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan artikel.");
      setConfirmStatus(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-isy-emerald gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xs font-semibold">Memuat artikel...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Top Header (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-isy-line">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="rounded-xl border border-isy-line bg-white p-2 text-isy-emerald hover:bg-isy-mist transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald">
              {editSlug ? "Edit Artikel Blog" : "Tulis Artikel Baru"}
            </h2>
            <p className="text-xs text-isy-text-secondary">
              Lengkapi isi konten, foto sampul, dan pengaturan SEO artikel
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-isy-line bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-isy-emerald hover:bg-isy-mist transition-colors shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-isy-emerald px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-isy-green-bright" />
            )}
            <span>{editSlug ? "Simpan Perubahan" : "Terbitkan Artikel"}</span>
          </button>
        </div>
      </div>

      {/* Editor Body (SCROLLABLE AREA) */}
      <div className="flex-1 min-h-0 overflow-y-auto admin-scrollbar pr-1 sm:pr-2 space-y-6">
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

      {/* Editor Grid: Main Form (Left 8 cols) & Sidebar Metadata (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title Card */}
          <div className="rounded-3xl border border-isy-line bg-white p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Judul Artikel *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Beli Kacamata Baru Malah Pusing? Ini Penyebab Sebenarnya!"
                className="w-full rounded-2xl border border-isy-line bg-white p-3.5 text-base sm:text-lg font-bold text-isy-emerald focus:border-isy-emerald focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Ringkasan Singkat (Excerpt) — Ditampilkan pada Card & Meta Deskripsi *
              </label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat seputar isi artikel..."
                className="w-full rounded-xl border border-isy-line bg-white p-3 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            value={content}
            onChange={setContent}
            label="Isi Konten Artikel (Visual Editor & Pratinjau)"
          />
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Box */}
          <div className="rounded-3xl border border-isy-line bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-isy-emerald flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Publikasi & Kategori</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Kategori Artikel *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Status Publikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
              >
                <option value="published">Terbitkan Langsung (Published)</option>
                <option value="draft">Simpan Sebagai Draft</option>
                <option value="archived">Diarsipkan (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Penulis
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tim Optik I See You"
                className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-isy-emerald mb-1">
                Terkait Cabang (Opsional)
              </label>
              <input
                type="text"
                value={relatedCabang}
                onChange={(e) => setRelatedCabang(e.target.value)}
                placeholder="Purwokerto / Cilacap / dll"
                className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink"
              />
            </div>
          </div>

          {/* Cover Media Box */}
          <div className="rounded-3xl border border-isy-line bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-isy-emerald flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Foto Sampul (Cover Image) *</span>
            </h3>

            <div className="relative aspect-[4/3] w-full rounded-2xl bg-isy-ivory border border-isy-line overflow-hidden">
              {coverImage ? (
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-isy-text-secondary">
                  Belum ada foto sampul
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMediaModalOpen(true)}
              className="w-full rounded-xl border border-isy-line bg-isy-mist/60 py-2 text-xs font-bold text-isy-emerald hover:bg-isy-mist transition-colors"
            >
              Pilih dari Media Library
            </button>

            <div>
              <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                URL Video Liputan (Opsional)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../video.mp4"
                className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink"
              />
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="rounded-3xl border border-isy-line bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-isy-emerald flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Pengaturan SEO Artikel</span>
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                Custom SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Otomatis mengikuti judul artikel"
                className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                Custom SEO Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Otomatis mengikuti ringkasan artikel"
                className="w-full rounded-xl border border-isy-line bg-white p-2.5 text-xs text-isy-ink"
              />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(url) => setCoverImage(url)}
        defaultCategory="blog"
      />

      {/* Save / Publish Confirmation Modal */}
      <SaveConfirmModal
        isOpen={confirmStatus !== null}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => executeSave(confirmStatus!)}
        title={confirmStatus === "published" ? "Terbitkan Artikel Blog?" : "Simpan Draft Artikel?"}
        itemName={title}
        description={
          confirmStatus === "published"
            ? `Apakah Anda yakin ingin mempublikasikan artikel "${title}"? Artikel ini akan langsung dapat dibaca oleh seluruh pengunjung website dan diindeks mesin pencari.`
            : `Simpan artikel "${title}" sebagai draft? Artikel ini tersimpan aman di sistem dan belum dapat dilihat oleh publik.`
        }
        confirmText={confirmStatus === "published" ? "Ya, Terbitkan Sekarang" : "Ya, Simpan Draft"}
        isLoading={isSaving}
        variant={confirmStatus === "published" ? "publish" : "save"}
      />
    </div>
  );
}

export default function AdminBlogEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center text-isy-emerald gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xs font-semibold">Memuat editor artikel...</span>
        </div>
      }
    >
      <BlogEditorContent />
    </Suspense>
  );
}
