"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Clock,
  Loader2,
} from "lucide-react";
import { BlogPostItem } from "@/lib/db/types";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete Confirm State
  const [postToDelete, setPostToDelete] = useState<BlogPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPosts(json.data);
      }
    } catch {
      showToast("Gagal memuat artikel blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleToggleStatus = async (post: BlogPostItem) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: post.slug, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setPosts((prev) =>
        prev.map((p) => (p.slug === post.slug ? { ...p, status: newStatus } : p))
      );
      showToast(
        `Status artikel "${post.title}" diubah ke "${newStatus}".`,
        "success"
      );
    } catch {
      showToast("Gagal mengubah status artikel.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog?slug=${postToDelete.slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      showToast(`Artikel "${postToDelete.title}" berhasil dihapus.`, "success");
      setPostToDelete(null);
      fetchPosts();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus artikel.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);

      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [posts, search, categoryFilter, statusFilter]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "edukasi-mata":
        return "Edukasi Mata";
      case "tips-pilih-frame":
        return "Tips Pilih Frame";
      case "perawatan-softlens":
        return "Perawatan Softlens";
      case "tren-gaya":
        return "Tren & Gaya";
      case "info-cabang-promo":
        return "Info Cabang & Promo";
      default:
        return category;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Toast */}
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

      {/* Top Header & Search Section (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Blog & Artikel Edukasi</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola artikel edukasi mata, tips pemilihan kacamata, perawatan softlens, dan publikasi SEO
            </p>
          </div>

          <Link
            href="/admin/blog/editor"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 text-isy-green-bright" />
            <span>Tulis Artikel Baru</span>
          </Link>
        </div>

        {/* Search and Filters (FIXED) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-isy-line bg-white p-3 shadow-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-isy-text-secondary" />
            <input
              type="text"
              placeholder="Cari artikel berdasarkan judul atau ringkasan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-isy-line bg-isy-ivory/30 pl-10 pr-4 py-2 text-xs sm:text-sm text-isy-text-primary focus:border-isy-emerald focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="edukasi-mata">Edukasi Mata</option>
              <option value="tips-pilih-frame">Tips Pilih Frame</option>
              <option value="perawatan-softlens">Perawatan Softlens</option>
              <option value="tren-gaya">Tren & Gaya</option>
              <option value="info-cabang-promo">Info Cabang & Promo</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="published">Hanya Terbit</option>
              <option value="draft">Hanya Draft</option>
              <option value="archived">Diarsipkan</option>
            </select>

            <span className="hidden sm:inline-flex rounded-xl bg-isy-mist px-3 py-2 text-xs font-bold text-isy-emerald border border-isy-line">
              Total: {filteredPosts.length} Artikel
            </span>
          </div>
        </div>
      </div>

      {/* Articles Table (HANYA BAGIAN INI YANG BISA DI-SCROLL KE BAWAH) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-isy-emerald gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold">Memuat artikel blog...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-isy-text-secondary gap-2">
            <BookOpen className="h-10 w-10 text-isy-line" />
            <span className="text-sm font-semibold">Tidak ada artikel yang sesuai kriteria.</span>
          </div>
        ) : (
          <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto admin-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 border-b border-isy-line bg-[#FAF7F0] text-[11px] font-bold uppercase tracking-wider text-isy-text-secondary backdrop-blur-xs shadow-2xs">
                <tr>
                  <th className="px-4 py-3.5">Artikel</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Penulis & Tanggal</th>
                  <th className="px-4 py-3.5">Waktu Baca</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-isy-line">
                {filteredPosts.map((post) => (
                  <tr key={post.slug} className="hover:bg-isy-mist/30 transition-colors">
                    {/* Column 1: Image & Title */}
                    <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-isy-ivory border border-isy-line">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-isy-text-secondary">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/blog/editor?slug=${post.slug}`}
                            className="font-bold text-isy-emerald hover:underline line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          <div className="text-[11px] text-isy-text-secondary line-clamp-1">
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Category */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block rounded-md bg-isy-mist px-2.5 py-0.5 text-[11px] font-bold text-isy-emerald border border-isy-line whitespace-nowrap">
                        {getCategoryLabel(post.category)}
                      </span>
                    </td>

                    {/* Column 3: Author & Date */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-isy-text-primary">{post.author}</div>
                      <div className="text-[11px] text-isy-text-secondary">
                        {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Column 4: Reading time */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-isy-text-secondary">
                        <Clock className="h-3 w-3" />
                        <span>{post.readingTime} min</span>
                      </span>
                    </td>

                    {/* Column 5: Status */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(post)}
                        title="Klik untuk ubah status"
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-transform active:scale-95 ${
                          post.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : post.status === "draft"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {post.status === "published"
                          ? "Terbit"
                          : post.status === "draft"
                          ? "Draft"
                          : "Arsip"}
                      </button>
                    </td>

                    {/* Column 6: Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald"
                            title="Lihat artikel di website publik"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/editor?slug=${post.slug}`}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald"
                          title="Edit artikel"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus artikel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Artikel Blog?"
        description={`Apakah Anda yakin ingin menghapus artikel "${postToDelete?.title}"? Tindakan ini akan menghapus artikel secara permanen.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus Artikel"}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
