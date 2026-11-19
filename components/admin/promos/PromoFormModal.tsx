"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  Plus,
  Trash2,
  Clock,
  Layers,
  Layout,
  ExternalLink,
} from "lucide-react";
import {
  PromoItem,
  PromoCategory,
  PromoStatus,
  PromoDetailLayout,
  PromoCollageLayout,
  PromoGalleryItem,
} from "@/lib/db/types";
import { slugify, PROMO_CATEGORIES } from "@/lib/promo";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import PromoPreviewModal from "./PromoPreviewModal";

interface PromoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: PromoItem) => void;
  editingPromo: PromoItem | null;
}

export default function PromoFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingPromo,
}: PromoFormModalProps) {
  const [activeTab, setActiveTab] = useState<
    "info" | "period" | "media" | "layout" | "placement"
  >("info");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PromoCategory>("special");

  // Period
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [hasEndDate, setHasEndDate] = useState(true);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59");

  // Media
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageAlt, setHeroImageAlt] = useState("");
  const [galleryImages, setGalleryImages] = useState<PromoGalleryItem[]>([]);
  const [collageLayout, setCollageLayout] = useState<PromoCollageLayout>("grid-2");

  // Media picker target: "hero" | "gallery"
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"hero" | "gallery">("hero");

  // Layout & CTA
  const [detailLayout, setDetailLayout] = useState<PromoDetailLayout>("image-left");
  const [ctaLabel, setCtaLabel] = useState("Lihat Promo");
  const [ctaUrl, setCtaUrl] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  // Placement & Publication
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [showInPopup, setShowInPopup] = useState(false);
  const [popupPriority, setPopupPriority] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<PromoStatus>("draft");

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Populate fields on edit or reset on create
  useEffect(() => {
    if (editingPromo) {
      setTitle(editingPromo.title);
      setSlug(editingPromo.slug);
      setIsSlugCustomized(true);
      setSubtitle(editingPromo.subtitle || "");
      setExcerpt(editingPromo.excerpt || "");
      setDescription(editingPromo.description || "");
      setCategory(editingPromo.category);

      // Parse start date & time
      if (editingPromo.startAt) {
        const start = new Date(editingPromo.startAt);
        if (!isNaN(start.getTime())) {
          setStartDate(start.toISOString().split("T")[0]);
          setStartTime(
            start.toTimeString().substring(0, 5) || "00:00"
          );
        }
      }

      // Parse end date & time
      if (editingPromo.endAt) {
        setHasEndDate(true);
        const end = new Date(editingPromo.endAt);
        if (!isNaN(end.getTime())) {
          setEndDate(end.toISOString().split("T")[0]);
          setEndTime(end.toTimeString().substring(0, 5) || "23:59");
        }
      } else {
        setHasEndDate(false);
        setEndDate("");
      }

      setHeroImageUrl(editingPromo.heroImageUrl || "");
      setHeroImageAlt(editingPromo.heroImageAlt || editingPromo.title);
      setGalleryImages(editingPromo.galleryImages || []);
      setCollageLayout(editingPromo.collageLayout || "grid-2");
      setDetailLayout(editingPromo.detailLayout || "image-left");
      setCtaLabel(editingPromo.ctaLabel || "Lihat Promo");
      setCtaUrl(editingPromo.ctaUrl || "");
      setTermsAndConditions(editingPromo.termsAndConditions || "");
      setShowOnHomepage(editingPromo.showOnHomepage ?? true);
      setShowInPopup(editingPromo.showInPopup ?? false);
      setPopupPriority(editingPromo.popupPriority || 0);
      setSortOrder(editingPromo.sortOrder || 0);
      setStatus(editingPromo.status || "draft");
    } else {
      // Defaults for new promo
      setTitle("");
      setSlug("");
      setIsSlugCustomized(false);
      setSubtitle("");
      setExcerpt("");
      setDescription("");
      setCategory("special");

      // Default start: today
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
      setStartTime("00:00");

      // Default end: 30 days ahead
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      setHasEndDate(true);
      setEndDate(nextMonth.toISOString().split("T")[0]);
      setEndTime("23:59");

      setHeroImageUrl("");
      setHeroImageAlt("");
      setGalleryImages([]);
      setCollageLayout("grid-2");
      setDetailLayout("image-left");
      setCtaLabel("Lihat Promo");
      setCtaUrl("");
      setTermsAndConditions(
        "1. Berlaku di seluruh cabang resmi Optik I See You.\n2. Tidak dapat digabungkan dengan promo lainnya kecuali dinyatakan khusus.\n3. Berlaku selama persediaan masih ada."
      );
      setShowOnHomepage(true);
      setShowInPopup(false);
      setPopupPriority(0);
      setSortOrder(0);
      setStatus("draft");
    }

    setActiveTab("info");
    setFormError("");
  }, [editingPromo, isOpen]);

  // Handle title change and auto-slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val));
    }
    if (!heroImageAlt) {
      setHeroImageAlt(val);
    }
  };

  // Construct draft object for live preview
  const constructCurrentPromoDraft = (): PromoItem => {
    const startIso = startDate ? `${startDate}T${startTime}:00+07:00` : new Date().toISOString();
    const endIso = hasEndDate && endDate ? `${endDate}T${endTime}:00+07:00` : undefined;

    return {
      id: editingPromo?.id || "preview-id",
      slug: slug || "promo-preview",
      title: title || "Judul Promo Preview",
      subtitle: subtitle || undefined,
      excerpt: excerpt || "Ringkasan informasi promo untuk ditampilkan di kartu...",
      description: description || "Deskripsi lengkap mengenai penawaran promo...",
      category,
      status,
      startAt: startIso,
      endAt: endIso,
      heroImageUrl,
      heroImageAlt: heroImageAlt || title,
      galleryImages,
      detailLayout,
      collageLayout,
      ctaLabel,
      ctaUrl,
      termsAndConditions,
      showOnHomepage,
      showInPopup,
      popupPriority,
      sortOrder,
      createdAt: editingPromo?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Judul promo wajib diisi.");
      setActiveTab("info");
      return;
    }

    if (!excerpt.trim()) {
      setFormError("Ringkasan promo wajib diisi untuk kartu tampilan.");
      setActiveTab("info");
      return;
    }

    if (!startDate) {
      setFormError("Tanggal mulai promo wajib dipilih.");
      setActiveTab("period");
      return;
    }

    if (hasEndDate && !endDate) {
      setFormError("Tanggal berakhir promo wajib dipilih.");
      setActiveTab("period");
      return;
    }

    // Build ISO timestamps in Asia/Jakarta context (+07:00)
    const startIso = `${startDate}T${startTime || "00:00"}:00+07:00`;
    let endIso: string | undefined = undefined;

    if (hasEndDate && endDate) {
      endIso = `${endDate}T${endTime || "23:59"}:00+07:00`;
      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        setFormError("Waktu berakhir promo harus lebih lanjut daripada waktu mulai.");
        setActiveTab("period");
        return;
      }
    }

    if (status === "published" && !heroImageUrl.trim()) {
      setFormError("Promo yang berstatus Terbit wajib memiliki Gambar Utama (Hero Image).");
      setActiveTab("media");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: editingPromo?.id,
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        subtitle: subtitle.trim() || undefined,
        excerpt: excerpt.trim(),
        description: description.trim(),
        category,
        status,
        startAt: startIso,
        endAt: endIso,
        heroImageUrl: heroImageUrl.trim(),
        heroImageAlt: heroImageAlt.trim() || title.trim(),
        galleryImages,
        detailLayout,
        collageLayout,
        ctaLabel: ctaLabel.trim() || undefined,
        ctaUrl: ctaUrl.trim() || undefined,
        termsAndConditions: termsAndConditions.trim() || undefined,
        showOnHomepage,
        showInPopup,
        popupPriority: Number(popupPriority) || 0,
        sortOrder: Number(sortOrder) || 0,
      };

      const res = await fetch("/api/admin/promos", {
        method: editingPromo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan data promo.");
      }

      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      console.error("Save promo error:", err);
      setFormError(err.message || "Terjadi kesalahan saat menyimpan promo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaSelect = (url: string, alt?: string) => {
    if (mediaPickerTarget === "hero") {
      setHeroImageUrl(url);
      if (alt && !heroImageAlt) setHeroImageAlt(alt);
    } else if (mediaPickerTarget === "gallery") {
      setGalleryImages((prev) => [...prev, { url, alt: alt || `Galeri promo ${prev.length + 1}` }]);
    }
    setMediaPickerOpen(false);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-form-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div className="relative flex flex-col w-full max-w-4xl h-[92vh] max-h-[860px] bg-white rounded-3xl shadow-2xl border border-isy-line overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-isy-mist border-b border-isy-line">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-isy-emerald text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="promo-form-modal-title"
                  className="text-base font-extrabold text-isy-emerald"
                >
                  {editingPromo ? "Edit Promo & Penawaran" : "Tambah Promo Baru"}
                </h2>
                <p className="text-xs text-isy-text-secondary">
                  Kelola konten promo untuk Homepage, Featured Popup, dan Microsite
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-isy-line bg-white px-3.5 py-2 text-xs font-bold text-isy-emerald hover:bg-isy-mist transition-colors shadow-2xs"
              >
                <Eye className="h-4 w-4 text-isy-green-bright" />
                <span>Pratinjau</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Form"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-shrink-0 px-6 pt-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "info"
                  ? "border-[#124734] text-[#124734]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              1. Informasi Utama
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("period")}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "period"
                  ? "border-[#124734] text-[#124734]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              2. Periode Waktu
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "media"
                  ? "border-[#124734] text-[#124734]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              3. Media & Kolase
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("layout")}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "layout"
                  ? "border-[#124734] text-[#124734]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              4. Tata Letak & CTA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("placement")}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === "placement"
                  ? "border-[#124734] text-[#124734]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              5. Penempatan & Status
            </button>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="flex-shrink-0 mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Content Body */}
          <form
            id="promo-editor-form"
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 admin-scrollbar"
          >
            {/* ── TAB 1: INFORMASI UTAMA ── */}
            {activeTab === "info" && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Promo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Promo Spesial Weekend — Diskon Frame 20%"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Slug URL Promo <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      promo.optikiseeyou.com/{slug || "slug-otomatis"}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsSlugCustomized(true);
                    }}
                    placeholder="diskon-frame-weekend"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subjudul / Tagline Singkat
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Contoh: Khusus Pembelian Kacamata Resep Lengkap"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kategori Promo <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROMO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all ${
                          category === cat.id
                            ? "border-[#124734] bg-emerald-50/50 text-[#124734] shadow-xs ring-1 ring-[#124734]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{cat.label}</span>
                          {category === cat.id && (
                            <Check className="h-4 w-4 text-[#124734]" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {cat.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ringkasan Promo (Untuk Kartu & Popup) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Ringkasan 1-2 kalimat untuk kartu homepage dan popup modal..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deskripsi Lengkap Promo
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan penawaran, keunggulan, cakupan produk, dan cara klaim promo..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>
              </div>
            )}

            {/* ── TAB 2: PERIODE WAKTU ── */}
            {activeTab === "period" && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-bold">Standar Waktu: Asia/Jakarta (WIB)</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Sistem membandingkan tanggal dan jam aktif secara otomatis di server. Promo yang belum masuk periode akan berstatus Terjadwal, dan yang melewati tanggal akhir akan otomatis Berakhir.
                    </p>
                  </div>
                </div>

                {/* Start Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jam Mulai (WIB)
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                    />
                  </div>
                </div>

                {/* Perpetual Toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="hasEndDateToggle"
                    checked={!hasEndDate}
                    onChange={(e) => setHasEndDate(!e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#124734] focus:ring-[#124734]"
                  />
                  <label htmlFor="hasEndDateToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Promo Berjalan Terus (Tanpa Batas Tanggal Akhir)
                  </label>
                </div>

                {/* End Date & Time */}
                {hasEndDate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tanggal Berakhir <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required={hasEndDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Berakhir (WIB)
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: MEDIA & KOLASE ── */}
            {activeTab === "media" && (
              <div className="space-y-6">
                {/* Hero Image */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Gambar Utama (Hero Image) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget("hero");
                        setMediaPickerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#124734] hover:underline"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-[#2FA84F]" />
                      <span>Pilih dari Media Library</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Thumbnail preview */}
                    <div className="relative h-28 w-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                      {heroImageUrl ? (
                        <Image
                          src={heroImageUrl}
                          alt="Hero preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <ImageIcon className="h-6 w-6 mx-auto mb-1 stroke-[1.5]" />
                          <span className="text-[10px]">Belum ada gambar</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={heroImageUrl}
                        onChange={(e) => setHeroImageUrl(e.target.value)}
                        placeholder="https://... atau klik Pilih dari Media Library"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                      />
                      <input
                        type="text"
                        value={heroImageAlt}
                        onChange={(e) => setHeroImageAlt(e.target.value)}
                        placeholder="Alt text gambar (deskripsi aksesibilitas)"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                      />
                    </div>
                  </div>
                </div>

                {/* Collage Template Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilihan Layout Kolase Galeri
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "grid-2", label: "Grid 2 Kolom", desc: "Foto berdampingan seimbang" },
                      { id: "grid-3", label: "Grid 3 Kolom", desc: "3 foto per baris" },
                      { id: "masonry", label: "Masonry Estetik", desc: "Tinggi dinamis bervariasi" },
                      { id: "split-hero", label: "Split Hero", desc: "1 besar + pendamping" },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setCollageLayout(col.id as PromoCollageLayout)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          collageLayout === col.id
                            ? "border-[#124734] bg-emerald-50/50 text-[#124734] ring-1 ring-[#124734]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{col.label}</span>
                          {collageLayout === col.id && <Check className="h-3.5 w-3.5 text-[#124734]" />}
                        </div>
                        <p className="text-[10px] text-slate-500">{col.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gallery Additional Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Galeri Gambar Tambahan ({galleryImages.length})
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Tambahkan foto produk, kacamata, suasana toko, atau bukti promo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget("gallery");
                        setMediaPickerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#124734] hover:text-[#124734] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#2FA84F]" />
                      <span>Tambah Gambar</span>
                    </button>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
                      Belum ada gambar tambahan di galeri kolase.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt || `Galeri ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            aria-label="Hapus gambar galeri"
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-90 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 4: TATA LETAK & CTA ── */}
            {activeTab === "layout" && (
              <div className="space-y-4">
                {/* Detail Layout Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Posisi Gambar pada Halaman Detail & Popup
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "image-left", title: "Gambar di Kiri, Teks di Kanan (Default)", desc: "Tata letak standar sesuai identitas visual optik" },
                      { id: "image-right", title: "Teks di Kiri, Gambar di Kanan", desc: "Variasi editorial untuk kampanye khusus" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDetailLayout(opt.id as PromoDetailLayout)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          detailLayout === opt.id
                            ? "border-[#124734] bg-emerald-50/50 text-[#124734] ring-1 ring-[#124734]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{opt.title}</span>
                          {detailLayout === opt.id && <Check className="h-4 w-4 text-[#124734]" />}
                        </div>
                        <p className="text-[11px] text-slate-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Tombol Aksi (CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Contoh: Ambil Promo, Chat WhatsApp, atau Coba Frame AR"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>

                {/* CTA URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Tujuan Tombol Aksi
                  </label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="Contoh: https://wa.me/6281390977209, /katalog, /cabang, dll."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Syarat dan Ketentuan Promo
                  </label>
                  <textarea
                    rows={4}
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    placeholder="Tuliskan butir syarat dan ketentuan promo..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#124734] focus:outline-none focus:ring-1 focus:ring-[#124734]"
                  />
                </div>
              </div>
            )}

            {/* ── TAB 5: PENEMPATAN & STATUS ── */}
            {activeTab === "placement" && (
              <div className="space-y-5">
                {/* Publication Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Publikasi Promo <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "draft", label: "Simpan Draft", desc: "Hanya tersimpan di CMS admin, tidak tampil publik" },
                      { id: "published", label: "Terbitkan (Published)", desc: "Tampil di homepage/microsite sesuai periode" },
                      { id: "archived", label: "Arsipkan (Archived)", desc: "Selesai/disimpan, disembunyikan dari publik" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id as PromoStatus)}
                        className={`text-left p-3.5 rounded-2xl border transition-all ${
                          status === st.id
                            ? "border-[#124734] bg-emerald-50/50 text-[#124734] ring-1 ring-[#124734]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{st.label}</span>
                          {status === st.id && <Check className="h-4 w-4 text-[#124734]" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{st.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Homepage Checkbox */}
                <div className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <label htmlFor="showOnHomepageToggle" className="text-xs font-bold text-slate-800 block cursor-pointer">
                      Tampilkan di Section Promo Homepage
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Menampilkan kartu promo ini pada area promo & penawaran di homepage optikiseeyou.com
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="showOnHomepageToggle"
                    checked={showOnHomepage}
                    onChange={(e) => setShowOnHomepage(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#124734] focus:ring-[#124734] cursor-pointer"
                  />
                </div>

                {/* Featured Popup Checkbox */}
                <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="showInPopupToggle" className="text-xs font-bold text-slate-800 block cursor-pointer">
                        Jadikan Kandidat Featured Popup Homepage
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Promo ini dapat muncul sebagai modal popup unggulan saat pengunjung membuka homepage
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="showInPopupToggle"
                      checked={showInPopup}
                      onChange={(e) => setShowInPopup(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-[#124734] focus:ring-[#124734] cursor-pointer"
                    />
                  </div>

                  {showInPopup && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-600 font-medium">
                        Prioritas Tampil Popup (Semakin tinggi semakin diutamakan):
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={popupPriority}
                        onChange={(e) => setPopupPriority(Number(e.target.value) || 0)}
                        className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-[#124734] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Sort Order */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Urutan Tampil (Sort Order)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Angka lebih kecil tampil lebih awal pada daftar kartu
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                    className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-[#124734] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="flex-shrink-0 px-6 py-4 bg-isy-mist border-t border-isy-line flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-isy-line bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-isy-line bg-white px-4 py-2.5 text-xs font-bold text-[#124734] hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Eye className="h-4 w-4 text-[#2FA84F]" />
                <span>Pratinjau</span>
              </button>

              <button
                type="submit"
                form="promo-editor-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>{editingPromo ? "Simpan Perubahan" : "Simpan Promo"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        defaultCategory="promo"
      />

      {/* Live Preview Modal */}
      <PromoPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        promo={constructCurrentPromoDraft()}
        initialMode="microsite"
      />
    </>
  );
}
