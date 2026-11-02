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
} from "lucide-react";

interface SponsorQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function SponsorQRModal({
  isOpen,
  onClose,
  onShowToast,
}: SponsorQRModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [standeeTheme, setStandeeTheme] = useState<"clean" | "emerald">("clean");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const sponsorUrl = "https://optikiseeyou.com/sponsor";

  // Generate high-resolution QR Code pointing directly to sponsor link
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const darkColor = standeeTheme === "emerald" ? "#0F3E34" : "#183C30";

    QRCode.toDataURL(sponsorUrl, {
      width: 800,
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
  }, [isOpen, standeeTheme]);

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
        onShowToast("Link optikiseeyou.com/sponsor berhasil disalin", "success");
      }
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Download raw QR code only
  const handleDownloadQROnly = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = "QR_Sponsor_Optik_I_See_You.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onShowToast) {
      onShowToast("QR Code berhasil diunduh", "success");
    }
  };

  // Download Standee — HANYA LOGO OPTIK I SEE YOU & QR CODE
  const handleDownloadStandee = async () => {
    if (!qrCodeDataUrl) return;

    const canvas = document.createElement("canvas");
    const width = 800;
    const height = 940;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = standeeTheme === "emerald";

    // 1. Background
    if (isDark) {
      ctx.fillStyle = "#0F3E34";
      ctx.fillRect(0, 0, width, height);

      // Subtle outer border
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      roundRect(ctx, 24, 24, width - 48, height - 48, 28);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Subtle outer border
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#E2E8F0";
      roundRect(ctx, 24, 24, width - 48, height - 48, 28);
      ctx.stroke();
    }

    // Helper to load image safely
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = src;
      });
    };

    // Load logo & QR code
    const [logoImg, qrImg] = await Promise.all([
      loadImage(isDark ? "/logo/logo-isy-putih-cropped.png" : "/logo.png"),
      loadImage(qrCodeDataUrl),
    ]);

    // 2. Logo Optik I See You
    const topY = 60;
    if (logoImg.width > 0 && logoImg.height > 0) {
      const maxLogoW = 340;
      const scale = maxLogoW / logoImg.width;
      const drawW = logoImg.width * scale;
      const drawH = logoImg.height * scale;
      ctx.drawImage(logoImg, (width - drawW) / 2, topY, drawW, drawH);
    } else {
      ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = isDark ? "#FFFFFF" : "#183C30";
      ctx.fillText("OPTIK I SEE YOU", width / 2, topY + 60);
    }

    // 3. QR Code Container Card
    const qrCardSize = 580;
    const qrCardX = (width - qrCardSize) / 2;
    const qrCardY = 200;

    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    roundRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 28);
    ctx.fill();
    ctx.shadowColor = "transparent";

    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.2)" : "#E2E8F0";
    roundRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 28);
    ctx.stroke();

    // Draw QR Image inside
    const qrInnerSize = 500;
    const qrInnerX = (width - qrInnerSize) / 2;
    const qrInnerY = qrCardY + (qrCardSize - qrInnerSize) / 2;
    ctx.drawImage(qrImg, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);

    // 4. Clean Link Pill at Bottom
    const urlY = qrCardY + qrCardSize + 32;
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.12)" : "#F1F5F9";
    roundRect(ctx, width / 2 - 210, urlY, 420, 50, 25);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.2)" : "#CBD5E1";
    roundRect(ctx, width / 2 - 210, urlY, 420, 50, 25);
    ctx.stroke();

    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = isDark ? "#FFFFFF" : "#0F3E34";
    ctx.fillText("optikiseeyou.com/sponsor", width / 2, urlY + 32);

    // Trigger Download
    const link = document.createElement("a");
    link.download = `QR_Sponsor_Optik_I_See_You_${standeeTheme}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast("QR Sponsor berhasil diunduh!", "success");
    }
  };

  // Helper for rounded rectangle in canvas
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

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-isy-line overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-isy-line bg-isy-mist/30 flex items-center justify-between gap-3 shrink-0">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-isy-emerald">
              QR Barcode Sponsor
            </h3>
            <p className="text-xs text-isy-text-secondary mt-0.5">
              Langsung membuka <strong>optikiseeyou.com/sponsor</strong> saat di-scan
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
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[78vh] space-y-4 admin-scrollbar">
          {/* Theme Toggle & Quick Copy */}
          <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setStandeeTheme("clean")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  standeeTheme === "emerald"
                    ? "bg-isy-emerald text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Emerald
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Tersalin" : "Salin Link"}</span>
            </button>
          </div>

          {/* Clean Standee Preview Card — HANYA LOGO OPTIK I SEE YOU & QR CODE */}
          <div
            ref={printAreaRef}
            id="sponsor-standee-print"
            className={`rounded-3xl border transition-all p-6 sm:p-8 text-center relative overflow-hidden shadow-sm flex flex-col items-center justify-center space-y-5 ${
              standeeTheme === "emerald"
                ? "bg-[#0F3E34] text-white border-emerald-900"
                : "bg-white text-isy-emerald border-slate-200"
            }`}
          >
            {/* 1. Logo Optik I See You */}
            <div className="flex justify-center items-center pt-2">
              {standeeTheme === "emerald" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/logo/logo-isy-putih-cropped.png"
                  alt="Optik I See You"
                  className="h-11 sm:h-14 w-auto object-contain"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/logo.png"
                  alt="Optik I See You"
                  className="h-11 sm:h-14 w-auto object-contain"
                />
              )}
            </div>

            {/* 2. QR Code (Langsung ke Link Sponsor) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              {isGenerating || !qrCodeDataUrl ? (
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                  <span className="text-xs text-slate-400">Memuat QR...</span>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrCodeDataUrl}
                  alt="QR Barcode Sponsor"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded select-none"
                />
              )}
            </div>

            {/* 3. Clean Link Pill */}
            <div
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold inline-flex items-center gap-2 ${
                standeeTheme === "emerald"
                  ? "bg-white/10 text-white border border-white/15"
                  : "bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              <span>optikiseeyou.com/sponsor</span>
              <a
                href={sponsorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                title="Buka link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-isy-line bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadQROnly}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Download QR code saja"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Download QR Saja</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadStandee}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-isy-emerald hover:bg-isy-emerald-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Standee (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
