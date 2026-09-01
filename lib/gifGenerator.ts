/**
 * lib/gifGenerator.ts
 * Generates branded animated GIFs featuring official Optik I See You logo assets,
 * minimalist aesthetic Korean-style frames, and custom 1-photo templates for each theme.
 */

import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { COLOR_FILTERS, type ColorFilter } from "./colorFilters";
import { FRAME_THEMES, type FrameTheme } from "./frameCompositor";

const WHITE_LOGO_SRC = "/logo/LOGO ISY PUTIH-02.png";
const GREEN_LOGO_SRC = "/logo.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = (err) => reject(new Error("Failed to load image for GIF: " + err));
      fallback.src = src;
    };
    img.src = src;
  });
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-Trim Transparent Margins & Logo Drawing Helpers
// ─────────────────────────────────────────────────────────────────────────────

const trimmedCanvasCache = new Map<string, HTMLCanvasElement>();

function getTrimmedCanvas(img: HTMLImageElement | null, cacheKey: string): HTMLCanvasElement | null {
  if (!img || !img.width || !img.height) return null;
  if (trimmedCanvasCache.has(cacheKey)) {
    return trimmedCanvasCache.get(cacheKey)!;
  }

  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = img.naturalWidth || img.width;
  tmpCanvas.height = img.naturalHeight || img.height;
  const tmpCtx = tmpCanvas.getContext("2d", { willReadFrequently: true });
  if (!tmpCtx) return null;

  tmpCtx.drawImage(img, 0, 0);
  const imgData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
  const data = imgData.data;
  const w = tmpCanvas.width;
  const h = tmpCanvas.height;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  let hasPixels = false;

  // Scan for non-transparent pixels (step by 2 for performance)
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const alphaIndex = (y * w + x) * 4 + 3;
      if (data[alphaIndex] > 20) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels || maxX <= minX || maxY <= minY) {
    trimmedCanvasCache.set(cacheKey, tmpCanvas);
    return tmpCanvas;
  }

  // Add 4px padding around cropped logo
  const pad = 4;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
  const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const cropCtx = croppedCanvas.getContext("2d")!;
  cropCtx.drawImage(tmpCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  trimmedCanvasCache.set(cacheKey, croppedCanvas);
  return croppedCanvas;
}

function drawProportionalLogo(
  ctx: CanvasRenderingContext2D,
  logoCanvasOrImg: HTMLCanvasElement | HTMLImageElement | null,
  centerX: number,
  centerY: number,
  maxW: number,
  maxH: number
) {
  if (!logoCanvasOrImg || !logoCanvasOrImg.width || !logoCanvasOrImg.height) return;
  const s = Math.min(maxW / logoCanvasOrImg.width, maxH / logoCanvasOrImg.height);
  const lw = Math.round(logoCanvasOrImg.width * s);
  const lh = Math.round(logoCanvasOrImg.height * s);
  ctx.drawImage(logoCanvasOrImg, centerX - lw / 2, centerY - lh / 2, lw, lh);
}

function drawPhotoInSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  filter: ColorFilter,
  slotX: number,
  slotY: number,
  slotW: number,
  slotH: number,
  radius = 12
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.clip();

  const scale = Math.max(slotW / img.width, slotH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = slotX + (slotW - dw) / 2;
  const dy = slotY + (slotH - dh) / 2;

  ctx.filter = filter.cssFilter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = "none";

  if (filter.drawOverlay) {
    filter.drawOverlay(ctx, dx, dy);
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Frame 4 Pink: "The Moment Pink" (Minimalist Aesthetic Sweet Blush Pink)
// ─────────────────────────────────────────────────────────────────────────────
function drawGifFrame4Pink(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  filter: ColorFilter,
  whiteLogo: HTMLImageElement | null
) {
  // Soft Clean Blush Pink Gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#FFB8D0");
  bg.addColorStop(0.5, "#FFA8C5");
  bg.addColorStop(1, "#FF94B6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Clean White Outer Frame Border
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = Math.round(height * 0.07);
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, Math.round(width * 0.55), 58);

  // Subtitle: Clean Spaced Typography
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText("T H E   M O M E N T", width / 2, logoCenterY + 38);
  ctx.restore();

  // Central Photo Slot (4:3 ratio)
  const slotW = Math.round(width * 0.82);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 14;

  // Soft Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.fill();
  ctx.restore();

  // Draw User Photo
  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Crisp White Border
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Clean Footer
  const footerY = Math.round(height * 0.86);
  ctx.save();
  ctx.textAlign = "center";

  // Tagline in serif
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "italic 700 18px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY);

  // Subtext
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, footerY + 26);

  // Minimalist thin divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, footerY + 44);
  ctx.lineTo(width / 2 + 80, footerY + 44);
  ctx.stroke();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Frame Hijau 3: "Capturing Moments Hijau" (Deep Forest Green & Gold)
// ─────────────────────────────────────────────────────────────────────────────
function drawGifFrameHijau3(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  filter: ColorFilter,
  whiteLogo: HTMLImageElement | null
) {
  // Deep Luxury Bottle Green
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#13492A");
  bg.addColorStop(0.6, "#0E3821");
  bg.addColorStop(1, "#082415");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle Gold/Cream Outer Line
  ctx.save();
  ctx.strokeStyle = "rgba(232, 213, 183, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = Math.round(height * 0.07);
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, Math.round(width * 0.55), 58);

  // Subtitle: "CAPTURING MOMENTS" in Cream
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#E8D5B7";
  ctx.font = "bold 11px 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("C A P T U R I N G   M O M E N T S", width / 2, logoCenterY + 38);
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.82);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 10;

  // Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#0E3821";
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.fill();
  ctx.restore();

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Elegant Cream Border
  ctx.save();
  ctx.strokeStyle = "#E8D5B7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Branding
  const footerY = Math.round(height * 0.86);
  ctx.save();
  ctx.textAlign = "center";

  ctx.fillStyle = "#E8D5B7";
  ctx.font = "italic 700 18px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY);

  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(232, 213, 183, 0.85)";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("@iseeyou.glasses", width / 2, footerY + 26);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Frame Pink 3: "Capturing Moments Pink" (Clean Modern Vibrant Pink)
// ─────────────────────────────────────────────────────────────────────────────
function drawGifFramePink3(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  filter: ColorFilter,
  whiteLogo: HTMLImageElement | null
) {
  // Vibrant Sweet Pink Gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#FF759E");
  bg.addColorStop(0.5, "#FF5A8C");
  bg.addColorStop(1, "#E63973");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // White Border Outline
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = Math.round(height * 0.07);
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, Math.round(width * 0.55), 58);

  // Subtitle
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("C A P T U R I N G   M O M E N T S", width / 2, logoCenterY + 38);
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.82);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 12;

  // Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.fill();
  ctx.restore();

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Crisp White Border
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Branding
  const footerY = Math.round(height * 0.86);
  ctx.save();
  ctx.textAlign = "center";

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "italic 700 18px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY);

  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, footerY + 26);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, footerY + 44);
  ctx.lineTo(width / 2 + 80, footerY + 44);
  ctx.stroke();
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Frame Putih 4: "Boarding Pass ISY" (Clean Minimalist Airplane Ticket)
// ─────────────────────────────────────────────────────────────────────────────
function drawGifFramePutih4(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  filter: ColorFilter,
  greenLogo: HTMLImageElement | null
) {
  // Clean Off-White Ticket Paper
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#FAF9F6");
  bg.addColorStop(1, "#F0EEE9");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Ticket Outer Line
  ctx.save();
  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.restore();

  // Header Bar: Official Green Logo (Trimmed & Crisp) + Ticket Info
  const trimmedLogo = getTrimmedCanvas(greenLogo, "green-logo");
  drawProportionalLogo(ctx, trimmedLogo || greenLogo, Math.round(width * 0.25), 48, Math.round(width * 0.4), 48);

  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = "#116B3C";
  ctx.font = "bold 11px 'Inter', sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("BOARDING PASS  ·  FIRST CLASS", width - 28, 42);

  ctx.fillStyle = "#555555";
  ctx.font = "10px 'Inter', sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("FLIGHT: ISY-2026  ·  GATE: 01", width - 28, 58);

  // Clean Header Divider
  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 76);
  ctx.lineTo(width - 24, 76);
  ctx.stroke();
  ctx.restore();

  // Route Label
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "800 16px 'Inter', sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("RSM  —  ISY  ·  FLIGHT OF LOVE", width / 2, 98);
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.82);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 6;

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Clean Dark Photo Border
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Boarding Ticket Details & Clean Barcode
  const footerY = Math.round(height * 0.85);
  ctx.save();
  ctx.textAlign = "center";

  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, footerY);
  ctx.lineTo(width - 24, footerY);
  ctx.stroke();

  ctx.fillStyle = "#1A1A1A";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("OPTIK I SEE YOU  ·  for every you", width / 2, footerY + 20);

  // Realistic Clean Barcode
  const barW = Math.round(width * 0.55);
  const barX = Math.round((width - barW) / 2);
  const barY = footerY + 30;
  const barH = 26;
  ctx.fillStyle = "#1A1A1A";
  for (let x = 0; x < barW; x += 4) {
    const isThick = ((x * 13) % 7 === 0) || ((x * 7) % 5 === 0);
    const bw = isThick ? 2.5 : 1.2;
    ctx.fillRect(barX + x, barY, bw, barH);
  }

  ctx.font = "10px 'Courier New', monospace";
  ctx.fillStyle = "#444444";
  ctx.fillText("ISY - 2026 - 0826 - 47829  ·  @iseeyou.glasses", width / 2, barY + barH + 14);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Frame Koran Custom: "Frame Koran I See You" (Vintage Editorial Newspaper)
// ─────────────────────────────────────────────────────────────────────────────
function drawGifFrameKoran(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  filter: ColorFilter,
  greenLogo: HTMLImageElement | null
) {
  // Vintage Newspaper Paper
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#F7F5EE");
  bg.addColorStop(1, "#EDE8DC");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Double Border
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Official Logo in Newspaper Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(greenLogo, "green-logo");
  drawProportionalLogo(ctx, trimmedLogo || greenLogo, width / 2, 48, Math.round(width * 0.55), 56);

  // Editorial Subhead
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 9px 'Inter', sans-serif";
  ctx.fillStyle = "#555555";
  ctx.letterSpacing = "2px";
  ctx.fillText("DAILY PHOTO EDITION  ·  EST. 2019", width / 2, 78);

  // Masthead divider lines
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 88);
  ctx.lineTo(width - 28, 88);
  ctx.stroke();
  ctx.restore();

  // Central Photo Slot
  const slotW = 460;
  const slotH = 345;
  const slotX = (width - slotW) / 2;
  const slotY = 106;
  const radius = 4;

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Dark Newspaper Frame
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Photo Caption
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#333333";
  ctx.font = "italic 11px Georgia, serif";
  ctx.fillText("Authentic smile captured at Optik I See You Photobooth.", width / 2, 468);
  ctx.restore();

  // Footer: Newspaper Columns / Headlines
  const footerY = 495;
  ctx.save();
  ctx.textAlign = "center";

  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, footerY);
  ctx.lineTo(width - 28, footerY);
  ctx.stroke();

  ctx.fillStyle = "#1A1A1A";
  ctx.font = "800 15px 'Playfair Display', Georgia, serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("JADI SAHABAT MATA TERBAIK KAMU", width / 2, footerY + 24);

  ctx.font = "11px 'Inter', sans-serif";
  ctx.fillStyle = "#444444";
  ctx.fillText("Periksa Mata Gratis & Koleksi Frame Kacamata Kekinian", width / 2, footerY + 44);

  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillStyle = "#116B3C";
  ctx.fillText("@iseeyou.glasses", width / 2, footerY + 68);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Fallback Renderer (for classic-white, emerald-luxury, etc.)
// ─────────────────────────────────────────────────────────────────────────────
function drawGenericGifFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  filter: ColorFilter,
  theme: FrameTheme,
  logoImg: HTMLImageElement | null
) {
  const MARGIN = 36;
  const HEADER_H = 100;
  const FOOTER_H = 100;

  const slotW = width - MARGIN * 2;
  const slotH = Math.round(slotW * 0.75);
  const slotX = MARGIN;
  const slotY = HEADER_H + Math.round((height - HEADER_H - FOOTER_H - slotH) / 2);

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, theme.bgColor);
  bg.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Dot pattern
  ctx.globalAlpha = 0.04;
  for (let x = 16; x < width; x += 32) {
    for (let y = 16; y < height; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = theme.dotColor;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Top accent bar
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, 0, width, 6);
  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, 6, width, 3);

  // Header Logo / Text (Trimmed & Bold)
  if (logoImg) {
    const trimmedLogo = getTrimmedCanvas(logoImg, logoImg.src || "generic-logo");
    drawProportionalLogo(ctx, trimmedLogo || logoImg, width / 2, HEADER_H / 2 + 4, 260, 65);
  } else {
    ctx.font = "800 24px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OPTIK I SEE YOU", width / 2, HEADER_H / 2 + 4);
  }

  // Divider line
  ctx.strokeStyle = theme.accentBarColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(MARGIN, HEADER_H);
  ctx.lineTo(width - MARGIN, HEADER_H);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Draw Photo
  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, 14);

  // Border stroke
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, 14);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Footer Text & Branding
  const FOOTER_Y = height - FOOTER_H;
  ctx.strokeStyle = theme.accentBarColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(MARGIN, FOOTER_Y);
  ctx.lineTo(width - MARGIN, FOOTER_Y);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const footerCenterY = FOOTER_Y + FOOTER_H / 2 - 4;

  ctx.fillStyle = theme.textColor;
  ctx.font = "italic 700 18px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerCenterY - 10);

  ctx.fillStyle = theme.igColor;
  ctx.font = "bold 14px 'Inter', Arial, sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("@iseeyou.glasses", width / 2, footerCenterY + 14);

  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, height - 9, width, 3);
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, height - 6, width, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Exported Function: createAnimatedGif
// ─────────────────────────────────────────────────────────────────────────────
export async function createAnimatedGif(
  photos: string[],
  themeId = "classic-white",
  colorFilterId = "normal",
  width = 540,
  height = 720,
  delayMs = 450,
  logoSrc = "/logo.png"
): Promise<string> {
  const validPhotos = photos.filter((p) => Boolean(p) && typeof p === "string" && p.startsWith("data:"));
  if (!validPhotos.length) throw new Error("No valid photos provided for GIF");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Unable to create canvas 2d context for GIF");

  const gif = GIFEncoder();
  const theme = FRAME_THEMES.find((t) => t.id === themeId) || FRAME_THEMES[0];
  const filter = COLOR_FILTERS.find((f) => f.id === colorFilterId) || COLOR_FILTERS[0];

  // Pre-load official white and green logos
  let whiteLogo: HTMLImageElement | null = null;
  let greenLogo: HTMLImageElement | null = null;

  try {
    whiteLogo = await loadImage(WHITE_LOGO_SRC);
  } catch {
    whiteLogo = null;
  }

  try {
    greenLogo = await loadImage(GREEN_LOGO_SRC);
  } catch {
    greenLogo = null;
  }

  const isDarkTheme =
    theme.id === "emerald-luxury" ||
    theme.id === "midnight-dark" ||
    theme.id === "vintage-film-bw" ||
    theme.id === "signature-isy-custom" ||
    theme.id === "frame-hijau-3";

  const genericLogo = isDarkTheme ? (whiteLogo || greenLogo) : (greenLogo || whiteLogo);
  let framesWritten = 0;

  for (const src of validPhotos) {
    try {
      const img = await loadImage(src);

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Dispatch to dedicated custom frame renderer if matching
      if (theme.id === "frame-4-pink") {
        drawGifFrame4Pink(ctx, width, height, img, filter, whiteLogo);
      } else if (theme.id === "frame-hijau-3") {
        drawGifFrameHijau3(ctx, width, height, img, filter, whiteLogo);
      } else if (theme.id === "frame-pink-3") {
        drawGifFramePink3(ctx, width, height, img, filter, whiteLogo);
      } else if (theme.id === "frame-putih-4") {
        drawGifFramePutih4(ctx, width, height, img, filter, greenLogo);
      } else if (theme.id === "frame-koran-custom") {
        drawGifFrameKoran(ctx, width, height, img, filter, greenLogo);
      } else {
        drawGenericGifFrame(ctx, width, height, img, filter, theme, genericLogo);
      }

      ctx.restore();

      // Quantize RGBA frame data into GIF palette (128 colors for fast CPU & crisp mobile look)
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const palette = quantize(data, 128);
      const index = applyPalette(data, palette);

      gif.writeFrame(index, width, height, {
        palette,
        delay: delayMs,
        repeat: 0,
      });
      framesWritten++;
    } catch (frameErr) {
      console.warn("Skipping failed GIF frame:", frameErr);
    }
  }

  // Cleanup canvas memory
  canvas.width = 0;
  canvas.height = 0;

  if (framesWritten === 0) {
    throw new Error("Failed to render any frames for GIF");
  }

  gif.finish();
  const bytes = gif.bytes();
  return "data:image/gif;base64," + uint8ArrayToBase64(bytes);
}
