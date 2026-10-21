"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Eye,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  X,
  Loader2,
  Sparkles,
  Droplet,
  Package,
} from "lucide-react";
import { SoftlensItem } from "@/lib/db/types";
import { SoftlensVariant } from "@/lib/softlens";
import ConfirmModal from "@/components/admin/ConfirmModal";
import SaveConfirmModal from "@/components/admin/SaveConfirmModal";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import AdminToast, { useAdminToast } from "@/components/admin/AdminToast";

const CATEGORIES = ["Softlens", "Aksesoris dan Perawatan"] as const;
const COLOR_FAMILIES = [
  { id: "natural", label: "Natural & Bening" },
  { id: "brown", label: "Cokelat (Brown)" },
  { id: "grey", label: "Abu-Abu (Grey)" },
  { id: "hazel", label: "Hazel & Gold" },
  { id: "colorful", label: "Anti Blue Light / Warna" },
  { id: "accessory", label: "Cairan & Aksesoris" },
] as const;

export default function AdminSoftlensPage() {
  const [softlensList, setSoftlensList] = useState<SoftlensItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SoftlensItem | null>(null);
  const [formTab, setFormTab] = useState<"info" | "specs" | "variants">("info");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formError, setFormError] = useState("");

  // Media Picker Modal
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetIndex, setMediaTargetIndex] = useState<number | "cover">("cover");

  // Delete Confirm State
  const [itemToDelete, setItemToDelete] = useState<SoftlensItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast — shared accessible component
  const { toast, showToast, dismissToast } = useAdminToast();

  // Form Fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<"Softlens" | "Aksesoris dan Perawatan">("Softlens");
  const [type, setType] = useState<"lens" | "accessory">("lens");
  const [colorFamily, setColorFamily] = useState<SoftlensItem["colorFamily"]>("natural");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState("");
  const [diameter, setDiameter] = useState("");
  const [waterContent, setWaterContent] = useState("");
  const [usageDuration, setUsageDuration] = useState("");
  const [volume, setVolume] = useState("");
  const [basePrice, setBasePrice] = useState<number>(35000);
  const [hasPriceRange, setHasPriceRange] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [badgeText, setBadgeText] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // Variants list
  const [variants, setVariants] = useState<SoftlensVariant[]>([]);

  // Variant create input
  const [varName, setVarName] = useState("");
  const [varPrice, setVarPrice] = useState<number>(35000);
  const [varHex, setVarHex] = useState("#8B5A2B");
  const [varImage, setVarImage] = useState("");

  const fetchSoftlens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/softlens");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSoftlensList(json.data);
      }
    } catch (err) {
      showToast("Gagal memuat katalog softlens.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftlens();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setBrand("");
    setCategory("Softlens");
    setType("lens");
    setColorFamily("natural");
    setCoverImage("");
    setDescription("");
    setSpecs(["High Oxygen", "All Day Comfort"]);
    setSpecInput("");
    setDiameter("14.5 mm");
    setWaterContent("42%");
    setUsageDuration("6 Bulan");
    setVolume("");
    setBasePrice(35000);
    setHasPriceRange(false);
    setMaxPrice(undefined);
    setBadgeText("");
    setIsPublished(true);
    setSortOrder(softlensList.length + 1);
    setVariants([]);
    setFormTab("info");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (item: SoftlensItem) => {
    setEditingItem(item);
    setName(item.name);
    setBrand(item.brand || "");
    setCategory(item.category);
    setType(item.type);
    setColorFamily(item.colorFamily);
    setCoverImage(item.coverImage);
    setDescription(item.description);
    setSpecs(item.specs || []);
    setSpecInput("");
    setDiameter(item.diameter || "");
    setWaterContent(item.waterContent || "");
    setUsageDuration(item.usageDuration || "");
    setVolume(item.volume || "");
    setBasePrice(item.basePrice);
    setHasPriceRange(item.hasPriceRange || false);
    setMaxPrice(item.maxPrice);
    setBadgeText(item.badgeText || "");
    setIsPublished(item.isPublished);
    setSortOrder(item.sortOrder || 0);
    setVariants(item.variants || []);
    setFormTab("info");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleAddSpec = () => {
    if (!specInput.trim()) return;
    if (!specs.includes(specInput.trim())) {
      setSpecs([...specs, specInput.trim()]);
    }
    setSpecInput("");
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!varName.trim()) return;
    const newVariant: SoftlensVariant = {
      id: `var-${Date.now().toString(36)}`,
      name: varName.trim(),
      colorFamily,
      hex: varHex,
      image: varImage.trim() || coverImage,
      price: varPrice || basePrice,
      priceFormatted: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(varPrice || basePrice),
    };
    setVariants([...variants, newVariant]);
    setVarName("");
    setVarImage("");
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetIndex === "cover") {
      setCoverImage(url);
    } else if (typeof mediaTargetIndex === "number") {
      const updated = [...variants];
      if (updated[mediaTargetIndex]) {
        updated[mediaTargetIndex].image = url;
        setVariants(updated);
      }
    }
  };

  const handleFormSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !coverImage.trim() || typeof basePrice !== "number") {
      setFormError("Nama produk, kategori, foto sampul, dan harga dasar wajib diisi.");
      return;
    }
    setFormError("");
    setShowSaveConfirm(true);
  };

  const executeSave = async () => {
    setIsSaving(true);
    setFormError("");

    const payload: Partial<SoftlensItem> = {
      id: editingItem?.id,
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      type: category === "Aksesoris dan Perawatan" ? "accessory" : "lens",
      colorFamily,
      coverImage: coverImage.trim(),
      description: description.trim(),
      specs,
      diameter: diameter.trim() || undefined,
      waterContent: waterContent.trim() || undefined,
      usageDuration: usageDuration.trim() || undefined,
      volume: volume.trim() || undefined,
      isAccessory: category === "Aksesoris dan Perawatan",
      basePrice: Number(basePrice),
      hasPriceRange: Boolean(hasPriceRange),
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      badgeText: badgeText.trim() || undefined,
      variants,
      isPublished,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      const res = await fetch("/api/admin/softlens", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan produk softlens.");
      }

      showToast(
        editingItem ? `Produk "${name}" berhasil diperbarui.` : "Produk softlens berhasil ditambahkan.",
        "success"
      );
      setShowSaveConfirm(false);
      setIsFormOpen(false);
      fetchSoftlens();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat menyimpan data.");
      setShowSaveConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/softlens?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus produk.");
      }
      showToast(`Produk "${itemToDelete.name}" berhasil dihapus.`, "success");
      setItemToDelete(null);
      fetchSoftlens();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus produk.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return softlensList.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        item.variants.some((v) => v.name.toLowerCase().includes(q));

      const matchCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" ? item.isPublished : !item.isPublished);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [softlensList, search, categoryFilter, statusFilter]);

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Shared Accessible Toast */}
      <AdminToast toast={toast} onDismiss={dismissToast} />

      {/* Top Header & Search Section (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald flex items-center gap-2.5">
              <Eye className="h-6 w-6 sm:h-7 sm:w-7 text-isy-emerald" />
              <span>Katalog Softlens & Perawatan</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Kelola varian lensa kontak warna, lensa bening, cairan pembersih, dan harga resmi
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 text-isy-green-bright" />
            <span>Tambah Softlens Baru</span>
          </button>
        </div>

        {/* Search and Filters (FIXED) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-isy-line bg-white p-3 shadow-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-isy-text-secondary" />
            <input
              type="text"
              placeholder="Cari softlens berdasarkan nama, brand, atau varian..."
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
              <option value="Softlens">Softlens</option>
              <option value="Aksesoris dan Perawatan">Aksesoris & Perawatan</option>
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
              Total: {filteredItems.length} Produk
            </span>
          </div>
        </div>
      </div>

      {/* Table Box (HANYA BAGIAN INI YANG BISA DI-SCROLL KE BAWAH) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-isy-emerald gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold">Memuat katalog softlens...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-isy-text-secondary gap-2">
            <Eye className="h-10 w-10 text-isy-line" />
            <span className="text-sm font-semibold">Tidak ada produk yang sesuai kriteria.</span>
          </div>
        ) : (
          <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto admin-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 border-b border-isy-line bg-[#FAF7F0] text-[11px] font-bold uppercase tracking-wider text-isy-text-secondary backdrop-blur-xs shadow-2xs">
                <tr>
                  <th className="px-4 py-3.5">Produk</th>
                  <th className="px-4 py-3.5">Kategori & Brand</th>
                  <th className="px-4 py-3.5">Spesifikasi</th>
                  <th className="px-4 py-3.5">Harga Resmi</th>
                  <th className="px-4 py-3.5">Varian</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-isy-line">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-isy-mist/30 transition-colors">
                    {/* Column 1: Image & Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-isy-ivory border border-isy-line">
                          {item.coverImage ? (
                            <Image
                              src={item.coverImage}
                              alt={item.name}
                              fill
                              sizes="50px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-isy-text-secondary">
                              <Eye className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-isy-emerald">{item.name}</div>
                          {item.badgeText && (
                            <span className="inline-block rounded-md bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200 mt-0.5">
                              {item.badgeText}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Category & Brand */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-isy-text-primary">
                        {item.brand || "Optik I See You"}
                      </div>
                      <div className="inline-block mt-0.5 rounded-md bg-isy-mist px-2 py-0.5 text-[10px] font-bold text-isy-emerald border border-isy-line">
                        {item.category}
                      </div>
                    </td>

                    {/* Column 3: Specs */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-isy-text-secondary space-y-0.5">
                        {item.diameter && <div>Dia: {item.diameter}</div>}
                        {item.waterContent && <div>Kadar Air: {item.waterContent}</div>}
                        {item.volume && <div>Volume: {item.volume}</div>}
                        {item.usageDuration && <div>Masa: {item.usageDuration}</div>}
                      </div>
                    </td>

                    {/* Column 4: Price */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-isy-emerald font-mono">
                        {item.basePriceFormatted}
                      </div>
                      {item.hasPriceRange && item.maxPriceFormatted && (
                        <div className="text-[10px] text-isy-text-secondary">
                          s/d {item.maxPriceFormatted}
                        </div>
                      )}
                    </td>

                    {/* Column 5: Variants */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-isy-text-primary">
                        {item.variants?.length || 0} Varian
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap max-w-[120px]">
                        {item.variants?.slice(0, 4).map((v, i) => (
                          <span
                            key={i}
                            title={v.name}
                            className="h-3 w-3 rounded-full border border-black/20"
                            style={{ backgroundColor: v.hex || "#999" }}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Column 6: Publish Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          item.isPublished
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {item.isPublished ? "Terbit" : "Draft"}
                      </span>
                    </td>

                    {/* Column 7: Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald transition-colors"
                          title="Edit produk"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="rounded-lg p-2 text-isy-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus produk"
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
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-isy-line px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-isy-emerald">
                  {editingItem ? "Edit Produk Softlens" : "Tambah Produk Softlens Baru"}
                </h3>
                <p className="text-xs text-isy-text-secondary">
                  Konfigurasikan informasi katalog, harga resmi, spesifikasi, dan varian warna
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
                Informasi & Harga
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
                Spesifikasi Teknis
              </button>
              <button
                type="button"
                onClick={() => setFormTab("variants")}
                className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                  formTab === "variants"
                    ? "border-isy-emerald text-isy-emerald"
                    : "border-transparent text-isy-text-secondary hover:text-isy-emerald"
                }`}
              >
                Varian Warna ({variants.length})
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmitAttempt} className="flex flex-col flex-1 overflow-y-auto admin-scrollbar p-6">
              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {formError}
                </div>
              )}

              {/* Tab 1: Info & Price */}
              {formTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Nama Produk / Series *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Exoticon ICE N°5"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Nama Merek / Brand
                      </label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Contoh: Exoticon, Living Color, X2"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Kategori Produk *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Keluarga Warna Utama
                      </label>
                      <select
                        value={colorFamily}
                        onChange={(e) => setColorFamily(e.target.value as any)}
                        className="w-full rounded-xl border border-isy-line bg-white px-3 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      >
                        {COLOR_FAMILIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-isy-emerald mb-1">
                        Teks Badge Promo (Opsional)
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="Contoh: Best Seller, K-Beauty"
                        className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="rounded-2xl border border-isy-line bg-isy-mist/30 p-4 space-y-3">
                    <div className="text-xs font-bold text-isy-emerald">
                      Pengaturan Harga Resmi (Rupiah)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                          Harga Dasar (IDR) *
                        </label>
                        <input
                          type="number"
                          required
                          value={basePrice}
                          onChange={(e) => setBasePrice(Number(e.target.value))}
                          placeholder="55000"
                          className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-isy-emerald"
                        />
                        <span className="text-[10px] text-isy-text-secondary">
                          Format:{" "}
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(basePrice)}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            id="hasRange"
                            checked={hasPriceRange}
                            onChange={(e) => setHasPriceRange(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-isy-line text-isy-emerald"
                          />
                          <label htmlFor="hasRange" className="text-[11px] font-semibold text-isy-text-secondary cursor-pointer">
                            Rentang Harga (Max Price)
                          </label>
                        </div>
                        {hasPriceRange && (
                          <input
                            type="number"
                            value={maxPrice || ""}
                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Contoh: 60000"
                            className="w-full rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-isy-ink"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-xs font-bold text-isy-emerald mb-1">
                      Foto Sampul Produk *
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-xl bg-isy-ivory border border-isy-line overflow-hidden flex-shrink-0">
                        {coverImage ? (
                          <Image src={coverImage} alt="Cover" fill className="object-contain p-1" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-isy-text-secondary">
                            Belum ada
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTargetIndex("cover");
                            setMediaPickerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-isy-line bg-white px-3.5 py-1.5 text-xs font-bold text-isy-emerald hover:bg-isy-mist"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Pilih dari Media Library</span>
                        </button>
                        <input
                          type="text"
                          value={coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          placeholder="URL / path foto..."
                          className="w-full rounded-xl border border-isy-line bg-white px-3 py-1.5 text-xs text-isy-text-primary"
                        />
                      </div>
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
                      placeholder="Tuliskan deskripsi produk softlens ini..."
                      className="w-full rounded-xl border border-isy-line bg-white p-3 text-xs sm:text-sm text-isy-ink focus:border-isy-emerald focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="softlensPublished"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 rounded-md border-isy-line text-isy-emerald focus:ring-isy-emerald"
                    />
                    <label htmlFor="softlensPublished" className="text-xs font-bold text-isy-emerald cursor-pointer">
                      Terbitkan di website publik (/softlens & /katalog)
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Specs */}
              {formTab === "specs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Diameter (mm)
                      </label>
                      <input
                        type="text"
                        value={diameter}
                        onChange={(e) => setDiameter(e.target.value)}
                        placeholder="14.5 mm"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Kadar Air (%)
                      </label>
                      <input
                        type="text"
                        value={waterContent}
                        onChange={(e) => setWaterContent(e.target.value)}
                        placeholder="42%"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Masa Pakai
                      </label>
                      <input
                        type="text"
                        value={usageDuration}
                        onChange={(e) => setUsageDuration(e.target.value)}
                        placeholder="6 Bulan"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-isy-text-secondary mb-1">
                        Volume (Cairan)
                      </label>
                      <input
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        placeholder="150ML"
                        className="w-full rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-isy-emerald mb-1">
                      Highlight Fitur & Spesifikasi
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={specInput}
                        onChange={(e) => setSpecInput(e.target.value)}
                        placeholder="Tambah tag fitur (misal: UV Protection, For Sensitive Eyes)"
                        className="flex-1 rounded-xl border border-isy-line px-3 py-1.5 text-xs text-isy-ink"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        className="rounded-xl bg-isy-emerald px-4 py-1.5 text-xs font-bold text-white hover:bg-isy-emerald-hover"
                      >
                        + Tambah
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {specs.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full bg-isy-mist px-3 py-1 text-xs font-semibold text-isy-emerald border border-isy-line"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(i)}
                            className="text-isy-text-secondary hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Variants */}
              {formTab === "variants" && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-isy-emerald">
                    Kelola Varian Warna Produk
                  </div>

                  {/* Add Variant Box */}
                  <div className="rounded-2xl border border-isy-line bg-isy-ivory/50 p-4 space-y-3">
                    <div className="text-xs font-semibold text-isy-emerald">
                      Tambah Varian Baru
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={varName}
                        onChange={(e) => setVarName(e.target.value)}
                        placeholder="Nama Varian (misal: Brown)"
                        className="rounded-xl border border-isy-line px-3 py-1.5 text-xs bg-white"
                      />
                      <input
                        type="number"
                        value={varPrice}
                        onChange={(e) => setVarPrice(Number(e.target.value))}
                        placeholder="Harga (Rp)"
                        className="rounded-xl border border-isy-line px-3 py-1.5 text-xs font-mono bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={varHex}
                          onChange={(e) => setVarHex(e.target.value)}
                          className="h-8 w-10 rounded border border-isy-line cursor-pointer"
                        />
                        <span className="text-[11px] font-mono text-isy-text-secondary">{varHex}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="rounded-xl bg-isy-emerald px-3 py-1.5 text-xs font-bold text-white hover:bg-isy-emerald-hover"
                      >
                        + Tambah Varian
                      </button>
                    </div>
                  </div>

                  {/* Variant List */}
                  <div className="space-y-2">
                    {variants.map((v, i) => (
                      <div
                        key={v.id || i}
                        className="flex items-center justify-between rounded-xl border border-isy-line bg-white p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-5 w-5 rounded-full border border-black/20 flex-shrink-0"
                            style={{ backgroundColor: v.hex || "#999" }}
                          />
                          <div>
                            <div className="font-bold text-isy-emerald">{v.name}</div>
                            <div className="text-[11px] font-mono text-isy-text-secondary">
                              {v.priceFormatted || `Rp ${v.price.toLocaleString("id-ID")}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTargetIndex(i);
                              setMediaPickerOpen(true);
                            }}
                            className="rounded-lg border border-isy-line px-2.5 py-1 text-[11px] font-semibold text-isy-emerald hover:bg-isy-mist"
                          >
                            {v.image ? "Ganti Foto Varian" : "Pilih Foto"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(i)}
                            className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
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
                    <span>{editingItem ? "Simpan Perubahan" : "Tambahkan Produk"}</span>
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
        defaultCategory="softlens"
      />

      {/* Save Confirmation Modal */}
      <SaveConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title={editingItem ? "Simpan Perubahan Softlens?" : "Tambahkan Softlens Baru?"}
        itemName={name}
        description={`Apakah Anda yakin ingin ${
          editingItem ? "memperbarui data produk" : "menambahkan produk baru"
        } "${name}" ke katalog? Varian warna, foto, spesifikasi diameter, dan harga resmi akan langsung tampil di halaman /softlens.`}
        confirmText={editingItem ? "Ya, Simpan Perubahan" : "Ya, Tambah Produk"}
        isLoading={isSaving}
        variant="save"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Produk Softlens?"
        description={`Apakah Anda yakin ingin menghapus "${itemToDelete?.name}" dari katalog? Tindakan ini akan menghapus produk secara permanen dari website.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus Produk"}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
