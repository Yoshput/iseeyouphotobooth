"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Glasses,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Box,
  Layers,
  Sparkles,
  Upload,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import { FrameItem } from "@/lib/db/types";
import ConfirmModal from "@/components/admin/ConfirmModal";
import SaveConfirmModal from "@/components/admin/SaveConfirmModal";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"];
const FRAME_SHAPES = ["Cat-Eye", "Square", "Oval", "Round", "Browline", "Hexagonal", "Aviator"];

export default function AdminFramesPage() {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shapeFilter, setShapeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFrame, setEditingFrame] = useState<FrameItem | null>(null);
  const [formTab, setFormTab] = useState<"info" | "images" | "specs" | "ar">("info");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formError, setFormError] = useState("");

  // Media Picker Modal States
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<"image" | "specsImage" | "coverImage" | "gallery">("image");

  // Delete Confirm State
  const [frameToDelete, setFrameToDelete] = useState<FrameItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form Field States
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [collection, setCollection] = useState("");
  const [shape, setShape] = useState("Cat-Eye");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [specsImage, setSpecsImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // Dimensions
  const [lensWidth, setLensWidth] = useState<number | undefined>(undefined);
  const [frameWidth, setFrameWidth] = useState<number | undefined>(undefined);
  const [lensHeight, setLensHeight] = useState<number | undefined>(undefined);
  const [bridgeWidth, setBridgeWidth] = useState<number | undefined>(undefined);
  const [templeLength, setTempleLength] = useState<number | undefined>(undefined);

  // AR settings
  const [glassesId, setGlassesId] = useState("");
  const [fitWidthRatio, setFitWidthRatio] = useState<number | undefined>(undefined);
  const [ipdScaleRef, setIpdScaleRef] = useState<number | undefined>(undefined);
  const [model3DGlb, setModel3DGlb] = useState("");
  const [recommendedFor, setRecommendedFor] = useState<string[]>([]);

  // Color variants
  const [colors, setColors] = useState<{ name: string; hex?: string; image?: string }[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#181818");

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/frames");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFrames(json.data);
      }
    } catch (err) {
      showToast("Gagal memuat katalog frame.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const openCreateModal = () => {
    setEditingFrame(null);
    setName("");
    setSku("");
    setCollection("");
    setShape("Cat-Eye");
    setMaterial("");
    setDescription("");
    setImage("");
    setCoverImage("");
    setSpecsImage("");
    setImages([]);
    setIsPublished(true);
    setSortOrder(frames.length + 1);
    setLensWidth(undefined);
    setFrameWidth(undefined);
    setLensHeight(undefined);
    setBridgeWidth(undefined);
    setTempleLength(undefined);
    setGlassesId("");
    setFitWidthRatio(undefined);
    setIpdScaleRef(undefined);
    setModel3DGlb("");
    setRecommendedFor([]);
    setColors([]);
    setFormTab("info");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (frame: FrameItem) => {
    setEditingFrame(frame);
    setName(frame.name);
    setSku(frame.sku || "");
    setCollection(frame.collection);
    setShape(frame.shape);
    setMaterial(frame.material || "");
    setDescription(frame.description || "");
    setImage(frame.image);
    setCoverImage(frame.coverImage || "");
    setSpecsImage(frame.specsImage || "");
    setImages(frame.images || [frame.image]);
    setIsPublished(frame.isPublished);
    setSortOrder(frame.sortOrder || 0);
    setLensWidth(frame.dimensions?.lensWidth);
    setFrameWidth(frame.dimensions?.frameWidth);
    setLensHeight(frame.dimensions?.lensHeight);
    setBridgeWidth(frame.dimensions?.bridgeWidth);
    setTempleLength(frame.dimensions?.templeLength);
    setGlassesId(frame.glassesId || "");
    setFitWidthRatio(frame.fitWidthRatio);
    setIpdScaleRef(frame.ipdScaleRef);
    setModel3DGlb(frame.model3D?.glbFile || "");
    setRecommendedFor(frame.recommendedFor || []);
    setColors(frame.colors || []);
    setFormTab("info");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#181818");
  };

  const handleRemoveColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const toggleFaceShape = (s: string) => {
    if (recommendedFor.includes(s)) {
      setRecommendedFor(recommendedFor.filter((shape) => shape !== s));
    } else {
      setRecommendedFor([...recommendedFor, s]);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetField === "image") {
      setImage(url);
      if (images.length === 0) setImages([url]);
    } else if (mediaTargetField === "specsImage") {
      setSpecsImage(url);
    } else if (mediaTargetField === "coverImage") {
      setCoverImage(url);
    } else if (mediaTargetField === "gallery") {
      if (!images.includes(url)) {
        setImages([...images, url]);
      }
    }
  };

  const handleFormSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !collection.trim() || !shape.trim() || !image.trim()) {
      setFormError("Nama, koleksi, bentuk bingkai, dan foto utama wajib diisi.");
      return;
    }
    setFormError("");
    setShowSaveConfirm(true);
  };

  const executeSave = async () => {
    setIsSaving(true);
    setFormError("");

    const payload: Partial<FrameItem> = {
      id: editingFrame?.id,
      name: name.trim(),
      sku: sku.trim() || undefined,
      collection: collection.trim(),
      shape,
      material: material.trim() || undefined,
      description: description.trim(),
      image: image.trim(),
      coverImage: coverImage.trim() || undefined,
      specsImage: specsImage.trim() || undefined,
      images: images.length > 0 ? images : [image.trim()],
      isPublished,
      sortOrder: Number(sortOrder) || 0,
      dimensions: {
        lensWidth: lensWidth ? Number(lensWidth) : undefined,
        frameWidth: frameWidth ? Number(frameWidth) : undefined,
        lensHeight: lensHeight ? Number(lensHeight) : undefined,
        bridgeWidth: bridgeWidth ? Number(bridgeWidth) : undefined,
        templeLength: templeLength ? Number(templeLength) : undefined,
      },
      glassesId: glassesId.trim() || undefined,
      fitWidthRatio: fitWidthRatio ? Number(fitWidthRatio) : undefined,
      ipdScaleRef: ipdScaleRef ? Number(ipdScaleRef) : undefined,
      model3D: model3DGlb.trim()
        ? {
            name: `${name} 3D`,
            glbFile: model3DGlb.trim(),
            fitWidthRatio: 2.8,
            ipdScaleRef: 1.0,
            yOffsetRatio: 0.0,
            frameColor: colors[0]?.hex || "#181818",
            metalColor: "#d4af37",
            style: shape,
            templeFadeStart: 0.65,
          }
        : undefined,
      recommendedFor,
      colors,
    };

    try {
      const res = await fetch("/api/admin/frames", {
        method: editingFrame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan frame.");
      }

      showToast(
        editingFrame ? `Frame "${name}" berhasil diperbarui.` : "Frame baru berhasil ditambahkan.",
        "success"
      );
      setShowSaveConfirm(false);
      setIsFormOpen(false);
      fetchFrames();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat menyimpan data.");
      setShowSaveConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!frameToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/frames?id=${frameToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus frame.");
      }
      showToast(`Frame "${frameToDelete.name}" berhasil dihapus.`, "success");
      setFrameToDelete(null);
      fetchFrames();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus frame.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFrames = useMemo(() => {
    return frames.filter((f) => {
      const matchSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.collection.toLowerCase().includes(search.toLowerCase()) ||
        (f.sku && f.sku.toLowerCase().includes(search.toLowerCase()));

      const matchShape = shapeFilter === "all" || f.shape === shapeFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" ? f.isPublished : !f.isPublished);

      return matchSearch && matchShape && matchStatus;
    });
  }, [frames, search, shapeFilter, statusFilter]);

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

      {/* Top Header & Search Section (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <Glasses className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Katalog Frame Kacamata</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola model kacamata, koleksi, spesifikasi dimensi, dan sinkronisasi AR Try-On
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 text-isy-green-bright" />
            <span>Tambah Frame Baru</span>
          </button>
        </div>

        {/* Filter and Search Bar (FIXED) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-isy-line bg-white p-3 shadow-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-isy-text-secondary" />
            <input
              type="text"
              placeholder="Cari frame berdasarkan nama, koleksi, atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-isy-line bg-isy-ivory/30 pl-10 pr-4 py-2 text-xs sm:text-sm text-isy-text-primary focus:border-isy-emerald focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={shapeFilter}
              onChange={(e) => setShapeFilter(e.target.value)}
              className="rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
            >
              <option value="all">Semua Bentuk</option>
              {FRAME_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary focus:border-isy-emerald focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="published">Hanya Terbit</option>
              <option value="draft">Hanya Draft</option>
            </select>

            <span className="hidden sm:inline-flex rounded-xl bg-isy-mist px-3 py-2 text-xs font-bold text-isy-emerald border border-isy-line">
              Total: {filteredFrames.length} Frame
            </span>
          </div>
        </div>
      </div>

      {/* Table Box (HANYA BAGIAN INI YANG BISA DI-SCROLL KE BAWAH) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-isy-emerald gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold">Memuat data frame...</span>
          </div>
        ) : filteredFrames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-isy-text-secondary gap-2">
            <Glasses className="h-10 w-10 text-isy-line" />
            <span className="text-sm font-semibold">Tidak ada frame yang sesuai kriteria.</span>
          </div>
        ) : (
          <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto admin-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 border-b border-isy-line bg-[#FAF7F0] text-[11px] font-bold uppercase tracking-wider text-isy-text-secondary backdrop-blur-xs shadow-2xs">
                <tr>
                  <th className="px-4 py-3.5">Produk</th>
                  <th className="px-4 py-3.5">Koleksi & Bentuk</th>
                  <th className="px-4 py-3.5">Fitur AR Try-On</th>
                  <th className="px-4 py-3.5">Varian Warna</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-isy-line">
                {filteredFrames.map((frame) => (
                  <tr key={frame.id} className="hover:bg-isy-mist/30 transition-colors">
                    {/* Column 1: Image & Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-isy-ivory border border-isy-line">
                          {frame.image ? (
                            <Image
                              src={frame.image}
                              alt={frame.name}
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-isy-text-secondary">
                              <Glasses className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-isy-emerald">{frame.name}</div>
                          <div className="text-[11px] text-isy-text-secondary">
                            SKU: {frame.sku || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Collection & Shape */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-isy-text-primary">{frame.collection}</div>
                      <div className="inline-block mt-0.5 rounded-md bg-isy-mist px-2 py-0.5 text-[10px] font-bold text-isy-emerald border border-isy-line">
                        {frame.shape}
                      </div>
                    </td>

                    {/* Column 3: AR Try-On Badge */}
                    <td className="px-4 py-3.5">
                      {frame.glassesId ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                            <Sparkles className="h-3 w-3 text-emerald-600" />
                            <span>AR 2D Siap</span>
                          </span>
                          {frame.model3D && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-800 border border-blue-200">
                              <Box className="h-3 w-3 text-blue-600" />
                              <span>Model 3D Aktif</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-isy-text-secondary/60">Non-AR</span>
                      )}
                    </td>

                    {/* Column 4: Color Variants */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[160px]">
                        {frame.colors && frame.colors.length > 0 ? (
                          frame.colors.map((c, i) => (
                            <span
                              key={i}
                              title={c.name}
                              className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: c.hex || "#999" }}
                            />
                          ))
                        ) : (
                          <span className="text-xs text-isy-text-secondary">-</span>
                        )}
                        <span className="text-[11px] text-isy-text-secondary">
                          ({frame.colors?.length || 0})
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Publish Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          frame.isPublished
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {frame.isPublished ? "Terbit" : "Draft"}
                      </span>
                    </td>

                    {/* Column 6: Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(frame)}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald transition-colors"
                          title="Edit frame"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setFrameToDelete(frame)}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus frame"
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

      {/* Create & Edit Modal Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-isy-line overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-isy-line px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-isy-emerald">
                  {editingFrame ? "Edit Frame Kacamata" : "Tambah Frame Kacamata Baru"}
                </h3>
                <p className="text-xs text-isy-text-secondary">
                  Konfigurasikan informasi katalog, foto, dimensi, dan AR Try-On
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-isy-text-secondary hover:bg-isy-mist"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-isy-line bg-isy-ivory/40 px-6">
              <button
                type="button"
                onClick={() => setFormTab("info")}
                className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                  formTab === "info"
                    ? "border-isy-emerald text-isy-emerald"
                    : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                Informasi Utama
              </button>
              <button
                type="button"
                onClick={() => setFormTab("images")}
                className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                  formTab === "images"
                    ? "border-isy-emerald text-isy-emerald"
                    : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                Foto & Galeri
              </button>
              <button
                type="button"
                onClick={() => setFormTab("specs")}
                className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                  formTab === "specs"
                    ? "border-isy-emerald text-isy-emerald"
                    : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                Dimensi & Varian
              </button>
              <button
                type="button"
                onClick={() => setFormTab("ar")}
                className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                  formTab === "ar"
                    ? "border-isy-emerald text-isy-emerald"
                    : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                AR Try-On & Wajah
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmitAttempt} className="flex flex-col flex-1 overflow-y-auto admin-scrollbar p-6">
              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {formError}
                </div>
              )}

              {/* Tab 1: Info */}
              {formTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Nama Model Frame *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Luna Cat Eye CF33013"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Kode SKU
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Contoh: CF33013"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Koleksi / Series *
                      </label>
                      <input
                        type="text"
                        required
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        placeholder="Contoh: Clarity Series"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Bentuk Bingkai (Shape) *
                      </label>
                      <select
                        value={shape}
                        onChange={(e) => setShape(e.target.value)}
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      >
                        {FRAME_SHAPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Material Frame
                      </label>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Contoh: Acetate, Titanium, TR90"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Urutan Tampil (Sort Order)
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-isy-emerald mb-1">
                      Deskripsi Produk
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tuliskan deskripsi dan keunggulan model frame ini..."
                      className="w-full rounded-xl border border-isy-line bg-white p-3 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 rounded-md border-isy-line text-isy-emerald focus:ring-isy-emerald"
                    />
                    <label htmlFor="isPublished" className="text-xs font-bold text-isy-emerald cursor-pointer">
                      Terbitkan di website publik (/katalog)
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Images */}
              {formTab === "images" && (
                <div className="space-y-5">
                  {/* Hero Image */}
                  <div>
                    <label className="block text-xs font-bold text-isy-emerald mb-1">
                      Foto Utama Produk (Hero Image) *
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-24 w-32 rounded-xl bg-isy-ivory border border-isy-line overflow-hidden flex-shrink-0">
                        {image ? (
                          <Image src={image} alt="Hero" fill className="object-contain p-1" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-isy-text-secondary">
                            Belum dipilih
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetField("image");
                            setMediaPickerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-isy-line bg-white px-3.5 py-1.5 text-xs font-bold text-isy-emerald hover:bg-isy-mist"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Pilih / Unggah Foto Utama</span>
                        </button>
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="Atau masukkan URL / path gambar..."
                          className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-text-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specs Diagram Image */}
                  <div>
                    <label className="block text-xs font-bold text-isy-emerald mb-1">
                      Foto Skema Dimensi / Spec Sheet
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-28 rounded-xl bg-isy-ivory border border-isy-line overflow-hidden flex-shrink-0">
                        {specsImage ? (
                          <Image src={specsImage} alt="Specs" fill className="object-contain p-1" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-isy-text-secondary">
                            Opsional
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetField("specsImage");
                            setMediaPickerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs font-bold text-isy-emerald hover:bg-isy-mist"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Pilih Foto Dimensi</span>
                        </button>
                        <input
                          type="text"
                          value={specsImage}
                          onChange={(e) => setSpecsImage(e.target.value)}
                          placeholder="URL foto spesifikasi..."
                          className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-text-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-isy-emerald">
                        Galeri Foto Tambahan
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTargetField("gallery");
                          setMediaPickerOpen(true);
                        }}
                        className="text-xs font-bold text-isy-emerald hover:underline"
                      >
                        + Tambah Foto ke Galeri
                      </button>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 w-20 rounded-xl bg-isy-ivory border border-isy-line overflow-hidden group"
                        >
                          <Image src={imgUrl} alt={`Galeri ${idx}`} fill className="object-contain p-1" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Specs & Colors */}
              {formTab === "specs" && (
                <div className="space-y-5">
                  <div className="text-xs font-bold text-isy-emerald">
                    Dimensi Kacamata (dalam milimeter / mm)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Lens Width
                      </label>
                      <input
                        type="number"
                        value={lensWidth || ""}
                        onChange={(e) => setLensWidth(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="52"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Frame Width
                      </label>
                      <input
                        type="number"
                        value={frameWidth || ""}
                        onChange={(e) => setFrameWidth(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="125"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Lens Height
                      </label>
                      <input
                        type="number"
                        value={lensHeight || ""}
                        onChange={(e) => setLensHeight(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="41"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Bridge Width
                      </label>
                      <input
                        type="number"
                        value={bridgeWidth || ""}
                        onChange={(e) => setBridgeWidth(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="18"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Temple Length
                      </label>
                      <input
                        type="number"
                        value={templeLength || ""}
                        onChange={(e) => setTempleLength(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="150"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-isy-line">
                    <label className="block text-xs font-bold text-isy-emerald mb-2">
                      Varian Warna Frame
                    </label>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Nama warna (misal: Clear Grey)"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="rounded-xl border border-isy-line px-3 py-1.5 text-xs flex-1 min-w-[140px]"
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="h-8 w-10 cursor-pointer rounded-lg border border-isy-line"
                        title="Pilih kode warna HEX"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="rounded-xl bg-isy-emerald px-3.5 py-1.5 text-xs font-bold text-white hover:bg-isy-emerald-hover"
                      >
                        + Tambah Varian
                      </button>
                    </div>

                    <div className="space-y-2">
                      {colors.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-isy-line bg-isy-mist/40 p-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-4 w-4 rounded-full border border-black/20"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="font-bold text-isy-emerald">{c.name}</span>
                            <span className="text-[10px] text-isy-text-secondary font-mono">
                              ({c.hex})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(i)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: AR Try-On & Recommendations */}
              {formTab === "ar" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-isy-mist border border-isy-line text-xs text-isy-emerald leading-relaxed">
                    <strong>Sinkronisasi AR Otomatis:</strong> Konfigurasi di bawah ini langsung terhubung dengan fitur kamera AR Try-On 2D & 3D di website tanpa merusak aset manifest yang sedang aktif.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Glasses ID di AR Manifest (manifest.json)
                      </label>
                      <input
                        type="text"
                        value={glassesId}
                        onChange={(e) => setGlassesId(e.target.value)}
                        placeholder="Contoh: cateye-frame, square-frame"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink font-mono focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        URL Model 3D (.glb)
                      </label>
                      <input
                        type="text"
                        value={model3DGlb}
                        onChange={(e) => setModel3DGlb(e.target.value)}
                        placeholder="https://.../glasses.glb"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Fit Width Ratio AR (~1.4 - 1.5)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={fitWidthRatio || ""}
                        onChange={(e) => setFitWidthRatio(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="1.44"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink font-mono focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        IPD Scale Ref (~1.0 - 1.05)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ipdScaleRef || ""}
                        onChange={(e) => setIpdScaleRef(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="1.02"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink font-mono focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-isy-emerald mb-2">
                      Rekomendasi Bentuk Wajah (AI Face Matching)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FACE_SHAPES.map((shapeName) => {
                        const isSelected = recommendedFor.includes(shapeName);
                        return (
                          <button
                            key={shapeName}
                            type="button"
                            onClick={() => toggleFaceShape(shapeName)}
                            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-isy-emerald text-white shadow-xs"
                                : "bg-isy-ivory text-isy-text-secondary border border-isy-line hover:border-isy-emerald"
                            }`}
                          >
                            {shapeName} {isSelected && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-isy-line">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-isy-line bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-isy-text-primary hover:bg-isy-mist"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center gap-2 rounded-xl bg-isy-emerald px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover ${
                    isSaving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingFrame ? "Simpan Perubahan" : "Tambahkan Frame"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        defaultCategory="katalog-frame"
      />

      {/* Save Confirmation Modal */}
      <SaveConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title={editingFrame ? "Simpan Perubahan Frame?" : "Tambahkan Frame Baru?"}
        itemName={name}
        description={`Apakah Anda yakin ingin ${
          editingFrame ? "memperbarui data" : "menambahkan frame baru"
        } "${name}" ke katalog? Perubahan foto, varian, dan konfigurasi AR akan langsung tampil di halaman katalog publik.`}
        confirmText={editingFrame ? "Ya, Simpan Perubahan" : "Ya, Tambah Frame"}
        isLoading={isSaving}
        variant="save"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(frameToDelete)}
        onClose={() => setFrameToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Frame Kacamata?"
        description={`Apakah Anda yakin ingin menghapus "${frameToDelete?.name}" dari katalog? Tindakan ini akan menghapus frame secara permanen dari website.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus Frame"}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
