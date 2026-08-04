"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { CATALOG_COLLECTIONS, type CatalogItem } from "@/lib/catalog";
import manifestRaw from "@/public/glasses/manifest.json";
import { csWhatsappUrl } from "@/lib/branches";

interface ManifestGlasses {
  id: string;
  name: string;
  file: string;
  style: string;
  recommendedFor: string[];
  color: string;
}

const manifest = (manifestRaw as ManifestGlasses[]).filter((g) => g.id !== "none");

export default function CatalogPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [specsModalImage, setSpecsModalImage] = useState<string | null>(null);

  // Combine collections and virtual manifest items
  const allItems: CatalogItem[] = [
    ...CATALOG_COLLECTIONS.flatMap((c) => c.items),
    ...manifest.map((m) => ({
      id: `virtual-${m.id}`,
      name: m.name,
      collection: "Koleksi AR Virtual",
      image: m.file ? `/glasses/${m.file}` : "/catalog-glasses.jpg",
      style: m.style,
      recommendedFor: m.recommendedFor,
      description: `Frame model ${m.style} favorit dengan pilihan warna menarik.`,
      glassesId: m.id,
    })),
  ];

  const filteredItems =
    selectedCategory === "all"
      ? allItems
      : selectedCategory === "cat-eye"
      ? allItems.filter((item) => item.style.toLowerCase().includes("cat"))
      : selectedCategory === "square"
      ? allItems.filter((item) => item.style.toLowerCase().includes("square"))
      : selectedCategory === "round"
      ? allItems.filter((item) => item.style.toLowerCase().includes("round") || item.style.toLowerCase().includes("wire"))
      : allItems;

  return (
    <main className="min-h-dvh w-full bg-isy-gradient selection:bg-isy-green-bright selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-isy-white border-b border-isy-line px-6 py-12 text-center">
        <div className="mx-auto max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-isy-green-bright/30 bg-isy-green-bright/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-isy-green-bright">
            Katalog Optik I See You
          </span>
          <h1 className="font-serif text-3xl font-black text-isy-green-deep sm:text-5xl">
            Koleksi Frame Terlengkap
          </h1>
          <p className="mx-auto max-w-xl text-xs font-medium text-isy-ink/60 sm:text-sm leading-relaxed">
            Temukan kacamata impianmu dan coba langsung di wajah kamu secara real-time pakai AR Try-On Kamera!
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "Semua Frame" },
            { id: "cat-eye", label: "Cat-Eye Edition" },
            { id: "square", label: "Square & Rectangle" },
            { id: "round", label: "Round & Retro Wire" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-isy-green-deep text-white shadow-md"
                  : "border border-isy-line bg-white text-isy-ink/70 hover:border-isy-green-bright hover:text-isy-green-deep"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Catalog Collections Banner */}
        {selectedCategory === "all" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {CATALOG_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                className="group relative overflow-hidden rounded-3xl border border-isy-line bg-white p-6 shadow-md transition-all hover:shadow-xl hover:border-isy-green-bright/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-isy-green-bright/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-isy-green-bright">
                    {col.badge}
                  </span>
                  <span className="text-xs font-bold text-isy-ink/40">
                    {col.items.length} Model
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-black text-isy-green-deep">
                  {col.title}
                </h3>
                <p className="mt-1 text-xs text-isy-ink/60 leading-relaxed">
                  {col.description}
                </p>

                <div className="mt-4 relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-isy-mist border border-isy-line">
                  <Image
                    src={col.coverImage}
                    alt={col.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Catalog Items Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-isy-line pb-4">
            <h2 className="font-serif text-2xl font-black text-isy-green-deep">
              Daftar Frame ({filteredItems.length})
            </h2>
            <p className="text-xs text-isy-ink/50 font-medium">
              Klik &quot;Try On AR&quot; untuk langsung coba di kamera
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-isy-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-isy-green-bright/50 hover:shadow-xl"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-isy-mist border border-isy-line/60">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />

                    <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-isy-green-deep shadow border border-isy-line">
                      {item.style}
                    </span>

                    {item.specsImage && (
                      <button
                        onClick={() => setSpecsModalImage(item.specsImage!)}
                        className="absolute bottom-3 right-3 rounded-full bg-isy-green-deep/90 text-white px-2.5 py-1 text-[10px] font-bold shadow backdrop-blur-md hover:bg-isy-green-bright transition-colors"
                      >
                        Lihat Specs
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-isy-green-bright">
                        {item.collection}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-black text-isy-green-deep leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-isy-ink/65 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Recommended Face Shapes */}
                    <div className="pt-1 flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] font-bold text-isy-ink/40">Rekomendasi Wajah:</span>
                      {item.recommendedFor.map((shape) => (
                        <span
                          key={shape}
                          className="rounded-md bg-isy-mist px-2 py-0.5 text-[9.5px] font-extrabold text-isy-green-deep border border-isy-line"
                        >
                          {shape}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-2 gap-2 pt-4 border-t border-isy-line">
                  <button
                    onClick={() =>
                      router.push(
                        `/photobooth?mode=ar${
                          item.glassesId ? `&glasses=${item.glassesId}` : ""
                        }`
                      )
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-isy-green-bright py-2.5 text-xs font-black uppercase tracking-wider text-white shadow transition-all hover:bg-isy-green-deep active:scale-95"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Try On AR
                  </button>

                  <a
                    href={csWhatsappUrl(item.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-isy-green-deep bg-white py-2.5 text-xs font-bold text-isy-green-deep transition-all hover:bg-isy-mist active:scale-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 3C8.82 3 3 8.82 3 16c0 2.36.64 4.57 1.76 6.48L3 29l6.73-1.73A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.12 18.08c-.26.73-1.51 1.4-2.08 1.48-.57.08-1.1.36-3.71-.77-3.14-1.36-5.15-4.52-5.3-4.73-.15-.21-1.22-1.63-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.58-.38.78-.38h.56c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.08.14.13.31.03.5-.1.19-.14.31-.28.47-.15.16-.3.36-.43.48-.14.12-.29.25-.12.5.16.24.72 1.19 1.55 1.92 1.07.95 1.97 1.24 2.21 1.38.24.13.38.11.52-.07.14-.18.59-.69.75-.93.16-.23.32-.19.54-.11.22.08 1.39.66 1.63.78.24.12.4.18.46.28.06.1.06.56-.2 1.29z" />
                    </svg>
                    Tanya WA
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Preview Modal */}
      {specsModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          onClick={() => setSpecsModalImage(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-3xl bg-white p-4 shadow-2xl space-y-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-isy-line pb-3 px-2">
              <h4 className="font-serif text-lg font-black text-isy-green-deep">
                Product Specification
              </h4>
              <button
                onClick={() => setSpecsModalImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-isy-mist text-isy-ink/60 hover:bg-isy-line"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-[4/3] w-full bg-isy-mist rounded-2xl overflow-hidden border border-isy-line">
              <Image
                src={specsModalImage}
                alt="Product Specifications"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
