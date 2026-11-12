"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  X,
  Download,
  Printer,
  Copy,
  ExternalLink,
  QrCode,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface SponsorQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
  defaultHeadline?: string;
  defaultSubtitle?: string;
  targetUrl?: string;
}

// Koleksi Aset Foto Asli Kacamata Optik I See You
const GLASSES_OPTIONS = [
  {
    id: "champagne",
    name: "Champagne Gold",
    tag: "Luxury Metal",
    src: "/glasses/hero-glasses-champagne.png",
  },
  {
    id: "black",
    name: "Obsidian Black",
    tag: "Classic Acetate",
    src: "/glasses/hero-glasses-black.png",
  },
  {
    id: "aviator",
    name: "Aviator Silver",
    tag: "Titanium Frame",
    src: "/glasses/aviator-silver.png",
  },
  {
    id: "clubmaster",
    name: "Clubmaster Retro",
    tag: "Vintage Edition",
    src: "/glasses/clubmaster-black.png",
  },
  {
    id: "none",
    name: "Tanpa Kacamata",
    tag: "Minimalis",
    src: "",
  },
] as const;

export default function SponsorQRModal({
  isOpen,
  onClose,
  onShowToast,
  defaultHeadline = "Silakan Scan QR Code di Sini",
  defaultSubtitle = "Arahkan kamera smartphone Anda untuk membuka form pengajuan sponsorship & kolaborasi resmi",
  targetUrl = "https://optikiseeyou.com/sponsor",
}: SponsorQRModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [standeeTheme, setStandeeTheme] = useState<"clean" | "emerald">("clean");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Pilihan aset kacamata asli untuk penambah estetika stand akrilik
  const [selectedGlassesId, setSelectedGlassesId] = useState<string>("champagne");

  // Customizable text state with default values requested by user & boss
  const [headline, setHeadline] = useState<string>(defaultHeadline);
  const [subtitle, setSubtitle] = useState<string>(defaultSubtitle);
  const [badgeText, setBadgeText] = useState<string>("OFFICIAL PARTNERSHIP");
  const [showCustomize, setShowCustomize] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const sponsorUrl = targetUrl;
  const displayUrl = sponsorUrl.replace(/^https?:\/\//, "");

  const activeGlasses =
    GLASSES_OPTIONS.find((g) => g.id === selectedGlassesId) || GLASSES_OPTIONS[0];

  // Generate high-resolution QR Code
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const darkColor = standeeTheme === "emerald" ? "#0F3E34" : "#183C30";

    QRCode.toDataURL(sponsorUrl, {
      width: 900,
      margin: 1,
      color: {
        dark: darkColor,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        if (isMounted) {
          setQrCodeDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error("Gagal generate QR Code sponsor:", err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, standeeTheme, sponsorUrl]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Copy URL
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sponsorUrl);
      setIsCopied(true);
      if (onShowToast) {
        onShowToast(`Link ${displayUrl} berhasil disalin`, "success");
      }
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Reset text customizations to default
  const handleResetText = () => {
    setHeadline(defaultHeadline);
    setSubtitle(defaultSubtitle);
    setBadgeText("OFFICIAL PARTNERSHIP");
    setSelectedGlassesId("champagne");
    if (onShowToast) {
      onShowToast("Teks & model kacamata dikembalikan ke bawaan", "info");
    }
  };

  // Download raw QR code only
  const handleDownloadQROnly = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `QR_Code_Optik_I_See_You_${standeeTheme}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onShowToast) {
      onShowToast("QR Code berhasil diunduh", "success");
    }
  };

  // Helper for rounded rectangle in canvas (cross-browser)
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Wrap text cleanly on canvas according to max pixel width
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // Download Standee PNG (High-Res 1:1, compact & proportional, with real glasses photo asset & realistic shadows)
  const handleDownloadStandee = async () => {
    if (!qrCodeDataUrl) return;

    // Ensure Plus Jakarta Sans is loaded in the browser before rendering canvas
    if (typeof document !== "undefined" && document.fonts) {
      try {
        await Promise.all([
          document.fonts.load("800 32px 'Plus Jakarta Sans'"),
          document.fonts.load("600 14px 'Plus Jakarta Sans'"),
          document.fonts.load("700 12px 'Plus Jakarta Sans'"),
        ]);
        await document.fonts.ready;
      } catch {
        // Fallback gracefully if fonts load is interrupted
      }
    }

    const canvas = document.createElement("canvas");
    // Standard high-res portrait standee format (ratio ~ 1 : 1.28, perfect for acrylic table tent)
    const width = 720;
    const height = 920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = standeeTheme === "emerald";

    // 1. Background Fill with realistic ambient card depth
    if (isDark) {
      ctx.fillStyle = "#0F3E34";
      ctx.fillRect(0, 0, width, height);

      // Outer delicate frame with balanced padding
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      roundRect(ctx, 22, 22, width - 44, height - 44, 28);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Outer delicate frame with balanced padding
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#E2E8F0";
      roundRect(ctx, 22, 22, width - 44, height - 44, 28);
      ctx.stroke();
    }

    // Helper to load image safely
    const loadImage = (src: string): Promise<HTMLImageElement | null> => {
      if (!src) return Promise.resolve(null);
      return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    // Load logo, QR code, and real glasses photo
    const [logoImg, qrImg, glassesImg] = await Promise.all([
      loadImage(isDark ? "/logo/logo-isy-putih-cropped.png" : "/logo.png"),
      loadImage(qrCodeDataUrl),
      activeGlasses.src ? loadImage(activeGlasses.src) : Promise.resolve(null),
    ]);

    // 2. Brand Logo
    const logoY = 44;
    const maxLogoW = 270;
    const maxLogoH = 68;
    let drawLogoW = maxLogoW;
    let drawLogoH = maxLogoH;

    if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
      const scale = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height);
      drawLogoW = logoImg.width * scale;
      drawLogoH = logoImg.height * scale;
      ctx.drawImage(logoImg, (width - drawLogoW) / 2, logoY, drawLogoW, drawLogoH);
    } else {
      ctx.font = "800 32px 'Plus Jakarta Sans', Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = isDark ? "#FFFFFF" : "#0F3E34";
      ctx.fillText("OPTIK I SEE YOU", width / 2, logoY + 45);
    }

    // 3. Category / Partnership Badge (PJS font bold)
    const badgeY = logoY + drawLogoH + 12;
    const badgeW = 196;
    const badgeH = 26;
    const badgeX = (width - badgeW) / 2;

    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "#ECFDF5";
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 13);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.22)" : "#A7F3D0";
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 13);
    ctx.stroke();

    ctx.font = "800 11px 'Plus Jakarta Sans', Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isDark ? "#34D399" : "#047857";
    ctx.fillText(badgeText.toUpperCase(), width / 2, badgeY + badgeH / 2);

    // 4. Headline: "Silakan Scan QR Code di Sini" (PJS ExtraBold)
    const titleY = badgeY + badgeH + 32;
    ctx.font = "800 30px 'Plus Jakarta Sans', Poppins, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = isDark ? "#FFFFFF" : "#0F3E34";
    ctx.fillText(headline, width / 2, titleY);

    // 5. Subtitle / Instruction (PJS font medium)
    ctx.font = "600 13px 'Plus Jakarta Sans', Poppins, -apple-system, sans-serif";
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.82)" : "#475569";
    const subLines = wrapText(ctx, subtitle, 580);
    const subStartY = titleY + 20;
    subLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, subStartY + index * 18);
    });

    const subEndY = subStartY + (subLines.length - 1) * 18;

    // 6. REAL GLASSES PHOTO ACCENT (with Realistic Soft Cast Shadow)
    let qrCardStartY = subEndY + 20;

    if (glassesImg && glassesImg.width > 0 && glassesImg.height > 0) {
      const glassesY = subEndY + 16;
      const maxGlassesW = 260;
      const maxGlassesH = 76;
      const gScale = Math.min(
        maxGlassesW / glassesImg.width,
        maxGlassesH / glassesImg.height
      );
      const drawGW = glassesImg.width * gScale;
      const drawGH = glassesImg.height * gScale;
      const drawGX = (width - drawGW) / 2;

      // Realistic Soft Cast Shadow beneath glasses
      ctx.save();
      ctx.shadowColor = isDark
        ? "rgba(0, 0, 0, 0.45)"
        : "rgba(0, 0, 0, 0.18)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(glassesImg, drawGX, glassesY, drawGW, drawGH);
      ctx.restore();

      qrCardStartY = glassesY + drawGH + 18;
    }

    // 7. QR Code Card Container (Pure White Card with Realistic Multi-layer Shadow)
    const qrCardSize = 400;
    const qrCardX = (width - qrCardSize) / 2;
    const qrCardY = qrCardStartY;

    // Outer card drop-shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 24);
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.2)" : "#E2E8F0";
    roundRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 24);
    ctx.stroke();

    // Draw QR image inside (pure clean card without distracting lines)
    if (qrImg) {
      const qrInnerSize = 340;
      const qrInnerX = (width - qrInnerSize) / 2;
      const qrInnerY = qrCardY + (qrCardSize - qrInnerSize) / 2;
      ctx.drawImage(qrImg, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);
    }

    // 8. Clean Link Pill (PJS Bold)
    const urlY = qrCardY + qrCardSize + 16;
    const urlW = 370;
    const urlH = 40;
    const urlX = (width - urlW) / 2;

    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "#F1F5F9";
    roundRect(ctx, urlX, urlY, urlW, urlH, 20);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.22)" : "#CBD5E1";
    roundRect(ctx, urlX, urlY, urlW, urlH, 20);
    ctx.stroke();

    ctx.font = "800 14.5px 'Plus Jakarta Sans', monospace, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isDark ? "#FFFFFF" : "#0F3E34";
    ctx.fillText(displayUrl, width / 2, urlY + urlH / 2);

    // 9. Official Branch Credentials & Brand Footer (No empty gap at bottom)
    const footerY = urlY + urlH + 24;
    ctx.font = "800 11.5px 'Plus Jakarta Sans', Poppins, sans-serif";
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.85)" : "#1E293B";
    ctx.fillText(
      "OPTIK I SEE YOU  •  KACAMATA & PERIKSA MATA TERPERCAYA",
      width / 2,
      footerY
    );

    ctx.font = "600 11.5px 'Plus Jakarta Sans', Poppins, sans-serif";
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.65)" : "#64748B";
    ctx.fillText(
      "Purwokerto  •  Purbalingga  •  Wonosobo  •  Cilacap",
      width / 2,
      footerY + 17
    );

    ctx.font = "500 10.5px 'Plus Jakarta Sans', Poppins, sans-serif";
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.45)" : "#94A3B8";
    ctx.fillText("Instagram: @optikiseeyou.glasses", width / 2, footerY + 33);

    // Trigger Download
    const link = document.createElement("a");
    link.download = `QR_Standee_Optik_I_See_You_${standeeTheme}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast("Standee akrilik kacamata berdesain elegan berhasil diunduh!", "success");
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Specific CSS to print standee cleanly centered on paper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #sponsor-standee-print,
          #sponsor-standee-print * {
            visibility: visible !important;
          }
          #sponsor-standee-print {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 135mm !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            margin: 0 !important;
            padding: 8mm !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            z-index: 999999 !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-isy-line overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150 text-left font-pjs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-isy-line bg-isy-mist/30 flex items-center justify-between gap-3 shrink-0">
            <div>
              <h3 className="font-pjs font-extrabold text-base sm:text-lg text-isy-emerald">
                Desain Standee Akrilik Meja
              </h3>
              <p className="text-xs text-isy-text-secondary mt-0.5 font-pjs">
                Standee cabang resmi untuk scan langsung ke <strong>{displayUrl}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-isy-line bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-isy-text-secondary transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[78vh] space-y-3.5 admin-scrollbar">
            {/* Top Toolbar: Theme Toggle & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 text-xs font-pjs">
                <button
                  type="button"
                  onClick={() => setStandeeTheme("clean")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    standeeTheme === "clean"
                      ? "bg-white text-isy-emerald shadow-2xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Putih Bersih
                </button>
                <button
                  type="button"
                  onClick={() => setStandeeTheme("emerald")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    standeeTheme === "emerald"
                      ? "bg-isy-emerald text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Emerald Signature
                </button>
              </div>

              <div className="flex items-center gap-1.5 font-pjs">
                <button
                  type="button"
                  onClick={() => setShowCustomize((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    showCustomize
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                  }`}
                  title="Sesuaikan kata-kata & model kacamata standee"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sesuaikan Desain</span>
                  {showCustomize ? (
                    <ChevronUp className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                  title="Salin tautan web"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{isCopied ? "Tersalin" : "Salin Link"}</span>
                </button>
              </div>
            </div>

            {/* Optional Customization Drawer: Text & Glasses Frame Selector */}
            {showCustomize && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3.5 animate-in fade-in duration-150 font-pjs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Pilihan Aksen Kacamata &amp; Teks Standee
                  </span>
                  <button
                    type="button"
                    onClick={handleResetText}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Bawaan
                  </button>
                </div>

                {/* Glasses Photo Asset Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Pilih Model Kacamata (Foto Asli Produk):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GLASSES_OPTIONS.map((glasses) => {
                      const isSelected = selectedGlassesId === glasses.id;
                      return (
                        <button
                          key={glasses.id}
                          type="button"
                          onClick={() => setSelectedGlassesId(glasses.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white border-isy-emerald shadow-sm ring-2 ring-isy-emerald/20 text-isy-emerald font-bold"
                              : "bg-white/80 border-slate-200 hover:bg-white text-slate-700 font-medium"
                          }`}
                        >
                          {glasses.src ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={glasses.src}
                              alt={glasses.name}
                              className="h-8 w-auto object-contain my-0.5 filter drop-shadow-sm"
                            />
                          ) : (
                            <span className="h-8 flex items-center text-xs text-slate-400">
                              (Polos)
                            </span>
                          )}
                          <span className="text-[11px] font-bold truncate max-w-full">
                            {glasses.name}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {glasses.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Customization */}
                <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Judul Ajakan:
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Silakan Scan QR Code di Sini"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-emerald-200 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 font-pjs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Deskripsi Panduan:
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Arahkan kamera HP Anda untuk membuka form..."
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-emerald-200 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-pjs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Standee Preview Card (1:1 with Canvas Download & Print, with Real Glasses Photo & Realistic Shadows) */}
            <div
              ref={printAreaRef}
              id="sponsor-standee-print"
              className={`rounded-3xl border transition-all p-5 sm:p-6 text-center relative overflow-hidden shadow-lg flex flex-col items-center justify-center space-y-3 font-pjs ${
                standeeTheme === "emerald"
                  ? "bg-[#0F3E34] text-white border-emerald-900 shadow-emerald-950/20"
                  : "bg-white text-isy-emerald border-slate-200 shadow-slate-200/80"
              }`}
            >
              {/* 1. Logo Optik I See You */}
              <div className="flex justify-center items-center pt-0.5">
                {standeeTheme === "emerald" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/logo/logo-isy-putih-cropped.png"
                    alt="Optik I See You"
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/logo.png"
                    alt="Optik I See You"
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                )}
              </div>

              {/* 2. Official Badge */}
              <div
                className={`px-3 py-0.5 rounded-full text-[10px] font-pjs font-extrabold tracking-wider uppercase inline-flex items-center gap-1.5 ${
                  standeeTheme === "emerald"
                    ? "bg-white/12 text-emerald-300 border border-white/20"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                <span>{badgeText}</span>
              </div>

              {/* 3. Header Text: Prominent PJS ExtraBold */}
              <div className="space-y-1 max-w-sm mx-auto">
                <h4
                  className={`font-pjs font-extrabold text-lg sm:text-xl tracking-tight leading-snug ${
                    standeeTheme === "emerald" ? "text-white" : "text-isy-emerald"
                  }`}
                >
                  {headline}
                </h4>

                <p
                  className={`font-pjs font-medium text-[11px] sm:text-xs leading-relaxed max-w-xs mx-auto ${
                    standeeTheme === "emerald"
                      ? "text-white/80"
                      : "text-slate-600"
                  }`}
                >
                  {subtitle}
                </p>
              </div>

              {/* 4. REAL GLASSES PHOTO ACCENT (with Realistic Soft Shadow) */}
              {activeGlasses.src && (
                <div className="relative flex justify-center items-center py-1 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeGlasses.src}
                    alt={activeGlasses.name}
                    className={`h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter ${
                      standeeTheme === "emerald"
                        ? "drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]"
                        : "drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)]"
                    }`}
                  />
                </div>
              )}

              {/* 5. QR Code Card Container (Pure Clean White with Multi-layer Shadow) */}
              <div className="relative p-3.5 sm:p-4 rounded-2xl bg-white shadow-[0_10px_25px_-4px_rgba(0,0,0,0.1),0_4px_10px_-2px_rgba(0,0,0,0.05)] border border-slate-200/90 flex flex-col items-center justify-center">
                {isGenerating || !qrCodeDataUrl ? (
                  <div className="w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center bg-gray-50 rounded-xl font-pjs">
                    <span className="text-xs text-slate-400">Memuat QR...</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Barcode Sponsor"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded select-none"
                  />
                )}
              </div>

              {/* 6. Clean Link Pill */}
              <div
                className={`px-4 py-1.5 rounded-full font-pjs font-bold text-xs inline-flex items-center gap-2 ${
                  standeeTheme === "emerald"
                    ? "bg-white/12 text-white border border-white/20"
                    : "bg-slate-50 text-slate-800 border border-slate-200"
                }`}
              >
                <span>{displayUrl}</span>
                <a
                  href={sponsorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  title="Buka link langsung"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 7. Official Branch Footnote */}
              <div
                className={`pt-0.5 space-y-0.5 text-[10px] leading-tight font-pjs ${
                  standeeTheme === "emerald"
                    ? "text-white/70"
                    : "text-slate-600"
                }`}
              >
                <p className="font-pjs font-extrabold tracking-wide text-slate-800 dark:text-white">
                  Optik I See You • Kacamata &amp; Periksa Mata
                </p>
                <p className="opacity-80 font-medium">
                  Purwokerto • Purbalingga • Wonosobo • Cilacap
                </p>
                <p className="opacity-60 text-[9px] pt-0.5">
                  Instagram: @optikiseeyou.glasses
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-isy-line bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0 font-pjs">
            <button
              type="button"
              onClick={handleDownloadQROnly}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs font-pjs"
              title="Download QR code saja tanpa standee"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Saja</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs font-pjs"
                title="Cetak kartu standee"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStandee}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-isy-emerald hover:bg-isy-emerald-hover text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 font-pjs"
                title="Download standee lengkap berkualitas tinggi (PNG)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Standee (PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
