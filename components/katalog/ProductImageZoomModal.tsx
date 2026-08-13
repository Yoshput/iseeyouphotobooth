"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ZoomImageItem {
  label: string;
  src: string;
}

interface ProductImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images: ZoomImageItem[];
  initialIndex?: number;
}

export default function ProductImageZoomModal({
  isOpen,
  onClose,
  title,
  images,
  initialIndex = 0,
}: ProductImageZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  // Lock body scroll when zoom modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const nextLevel = Math.max(prev - 0.5, 1);
      if (nextLevel === 1) setPosition({ x: 0, y: 0 });
      return nextLevel;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Mouse Drag Panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Scroll Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 3.5));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 select-none">
      {/* ── TOP CONTROL BAR ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/15 bg-black/60 px-4 py-3 sm:px-6 backdrop-blur-md">
        {/* Title & Badge */}
        <div className="min-w-0 flex-1 pr-4">
          <h3 className="font-serif text-base sm:text-lg font-black text-white truncate">
            {title}
          </h3>
          <span className="text-[11px] font-bold text-[#c9a869] block truncate">
            🔍 Mode Zoom HD · {currentImage.label}
          </span>
        </div>

        {/* Image Tabs (If multiple) */}
        {images.length > 1 && (
          <div className="hidden md:flex items-center gap-1.5 bg-white/10 rounded-full p-1 border border-white/15 mr-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  handleResetZoom();
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                  currentIndex === idx
                    ? "bg-[#c9a869] text-black shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-xl bg-white/10 border border-white/20 p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-black"
              title="Perkecil (-)"
            >
              −
            </button>

            <button
              onClick={handleResetZoom}
              className="px-2.5 py-1 text-xs font-extrabold text-[#f3e3ba] hover:bg-white/20 rounded-lg transition-colors"
              title="Reset Ukuran"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-black"
              title="Perbesar (+)"
            >
              +
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-red-600/80 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg hover:bg-red-500 transition-all active:scale-95 border border-white/20"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Tutup</span>
          </button>
        </div>
      </div>

      {/* Mobile Image Selector Bar */}
      {images.length > 1 && (
        <div className="flex md:hidden items-center justify-center gap-2 bg-black/40 px-4 py-2 border-b border-white/10">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                handleResetZoom();
              }}
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                currentIndex === idx
                  ? "bg-[#c9a869] text-black"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {img.label}
            </button>
          ))}
        </div>
      )}

      {/* ── ZOOMABLE IMAGE DISPLAY CANVAS ───────────────────────────────── */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleTap}
        className={`relative flex-1 w-full overflow-hidden flex items-center justify-center p-4 ${
          zoomLevel > 1
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-zoom-in"
        }`}
      >
        <div
          className="relative max-w-full max-h-full transition-transform duration-150 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
          }}
        >
          <div className="relative w-[90vw] max-w-4xl h-[75vh]">
            <Image
              src={currentImage.src}
              alt={currentImage.label}
              fill
              className="object-contain drop-shadow-2xl"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      </div>

      {/* ── BOTTOM HINT & NAV FOOTER ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-white/15 bg-black/60 px-6 py-3 backdrop-blur-md text-xs text-white/80">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="font-medium text-slate-300">
            {zoomLevel > 1
              ? "Geser mouse/jarum untuk menggeser poster poster."
              : "Klik 2x, scroll, atau gunakan tombol (+) untuk zoom poster HD."}
          </span>
        </div>

        <button
          onClick={handleResetZoom}
          className="rounded-lg bg-white/10 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
}
