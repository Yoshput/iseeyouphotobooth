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
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = Math.round(height * 0.075);
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, Math.round(width * 0.55), 75);

  // Subtitle: Clean Spaced Typography
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("T H E   M O M E N T", width / 2, logoCenterY + 46);
  ctx.restore();

  // Central Photo Slot (4:3 ratio)
  const slotW = Math.round(width * 0.84);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 18;

  // Soft Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
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
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Clean Footer
  const footerY = Math.round(height * 0.865);
  ctx.save();
  ctx.textAlign = "center";

  // Tagline in serif
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY);

  // Subtext
  ctx.font = "bold 15px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, footerY + 34);

  // Minimalist thin divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 110, footerY + 54);
  ctx.lineTo(width / 2 + 110, footerY + 54);
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
  ctx.strokeStyle = "rgba(232, 213, 183, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = Math.round(height * 0.075);
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, Math.round(width * 0.55), 75);

  // Subtitle: "CAPTURING MOMENTS" in Cream
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#E8D5B7";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.letterSpacing = "5px";
  ctx.fillText("C A P T U R I N G   M O M E N T S", width / 2, logoCenterY + 46);
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.84);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 14;

  // Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#0E3821";
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.fill();
  ctx.restore();

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Elegant Cream Border
  ctx.save();
  ctx.strokeStyle = "#E8D5B7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Branding
  const footerY = Math.round(height * 0.865);
  ctx.save();
  ctx.textAlign = "center";

  ctx.fillStyle = "#E8D5B7";
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY);

  ctx.font = "bold 15px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(232, 213, 183, 0.9)";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, footerY + 34);
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
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = Math.round(height * 0.075);
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, Math.round(width * 0.55), 75);

  // Subtitle
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.letterSpacing = "5px";
  ctx.fillText("C A P T U R I N G   M O M E N T S", width / 2, logoCenterY + 46);
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.84);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 16;

  // Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.fill();
  ctx.restore();

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Crisp White Border
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Branding
  const footerY = Math.round(height * 0.865);
  ctx.save();
  ctx.textAlign = "center";

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY);

  ctx.font = "bold 15px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, footerY + 34);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 110, footerY + 54);
  ctx.lineTo(width / 2 + 110, footerY + 54);
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
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Header Bar: Official Green Logo (Trimmed & Crisp) + Ticket Info
  const trimmedLogo = getTrimmedCanvas(greenLogo, "green-logo");
  drawProportionalLogo(ctx, trimmedLogo || greenLogo, Math.round(width * 0.25), 58, Math.round(width * 0.4), 60);

  ctx.save();
  ctx.textAlign = "right";
  ctx.fillStyle = "#116B3C";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.letterSpacing = "1.8px";
  ctx.fillText("BOARDING PASS  ·  FIRST CLASS", width - 36, 52);

  ctx.fillStyle = "#555555";
  ctx.font = "12px 'Inter', sans-serif";
  ctx.letterSpacing = "1.2px";
  ctx.fillText("FLIGHT: ISY-2026  ·  GATE: 01", width - 36, 72);

  // Clean Header Divider
  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, 94);
  ctx.lineTo(width - 30, 94);
  ctx.stroke();
  ctx.restore();

  // Route Label
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "800 20px 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("RSM  —  ISY  ·  FLIGHT OF LOVE", width / 2, 124);
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.84);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 8;

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Clean Dark Photo Border
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Boarding Ticket Details & Clean Barcode
  const footerY = Math.round(height * 0.85);
  ctx.save();
  ctx.textAlign = "center";

  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, footerY);
  ctx.lineTo(width - 30, footerY);
  ctx.stroke();

  ctx.fillStyle = "#1A1A1A";
  ctx.font = "bold 16px 'Inter', sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("OPTIK I SEE YOU  ·  for every you", width / 2, footerY + 28);

  // Realistic Clean Barcode
  const barW = Math.round(width * 0.6);
  const barX = Math.round((width - barW) / 2);
  const barY = footerY + 40;
  const barH = 34;
  ctx.fillStyle = "#1A1A1A";
  for (let x = 0; x < barW; x += 4) {
    const isThick = ((x * 13) % 7 === 0) || ((x * 7) % 5 === 0);
    const bw = isThick ? 3 : 1.5;
    ctx.fillRect(barX + x, barY, bw, barH);
  }

  ctx.font = "12px 'Courier New', monospace";
  ctx.fillStyle = "#444444";
  ctx.fillText("ISY - 2026 - 0826 - 47829  ·  @iseeyou.glasses", width / 2, barY + barH + 18);
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
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Official Logo in Newspaper Header (Trimmed & Large)
  const trimmedLogo = getTrimmedCanvas(greenLogo, "green-logo");
  drawProportionalLogo(ctx, trimmedLogo || greenLogo, width / 2, 60, Math.round(width * 0.55), 70);

  // Editorial Subhead
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.fillStyle = "#555555";
  ctx.letterSpacing = "3px";
  ctx.fillText("DAILY PHOTO EDITION  ·  EST. 2019", width / 2, 98);

  // Masthead divider lines
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(34, 110);
  ctx.lineTo(width - 34, 110);
  ctx.stroke();
  ctx.restore();

  // Central Photo Slot
  const slotW = Math.round(width * 0.84);
  const slotH = Math.round(slotW * 0.75);
  const slotX = Math.round((width - slotW) / 2);
  const slotY = Math.round(height * 0.17);
  const radius = 6;

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Clean Newspaper Photo Border
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Editorial Signoff
  const footerY = Math.round(height * 0.85);
  ctx.save();
  ctx.textAlign = "center";

  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(34, footerY);
  ctx.lineTo(width - 34, footerY);
  ctx.stroke();

  ctx.fillStyle = "#1A1A1A";
  ctx.font = "italic 700 22px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY + 30);

  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillStyle = "#444444";
  ctx.letterSpacing = "2px";
  ctx.fillText("THE I SEE YOU GAZETTE  ·  @iseeyou.glasses", width / 2, footerY + 56);
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
  const MARGIN = Math.round(width * 0.08);
  const HEADER_H = Math.round(height * 0.14);
  const FOOTER_H = Math.round(height * 0.14);

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
  for (let x = 20; x < width; x += 40) {
    for (let y = 20; y < height; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = theme.dotColor;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Top accent bar
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, 0, width, 8);
  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, 8, width, 4);

  // Header Logo / Text (Trimmed & Bold)
  if (logoImg) {
    const trimmedLogo = getTrimmedCanvas(logoImg, logoImg.src || "generic-logo");
    drawProportionalLogo(ctx, trimmedLogo || logoImg, width / 2, HEADER_H / 2 + 4, Math.round(width * 0.55), 75);
  } else {
    ctx.font = "800 30px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OPTIK I SEE YOU", width / 2, HEADER_H / 2 + 4);
  }

  // Divider line
  ctx.strokeStyle = theme.accentBarColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(MARGIN, HEADER_H);
  ctx.lineTo(width - MARGIN, HEADER_H);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Draw Photo
  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, 18);

  // Border stroke
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, 18);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // Footer Text & Branding
  const FOOTER_Y = height - FOOTER_H;
  ctx.strokeStyle = theme.accentBarColor;
  ctx.lineWidth = 1.5;
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
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerCenterY - 14);

  ctx.fillStyle = theme.igColor;
  ctx.font = "bold 16px 'Inter', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses", width / 2, footerCenterY + 16);

  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, height - 12, width, 4);
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, height - 8, width, 8);
}

// Global cache for logo assets
let cachedWhiteLogo: HTMLImageElement | null = null;
let cachedGreenLogo: HTMLImageElement | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Main Exported Function: createAnimatedGif (Full HD 720x960 & Crisp 256-Color)
// ─────────────────────────────────────────────────────────────────────────────
export async function createAnimatedGif(
  photos: string[],
  themeId = "classic-white",
  colorFilterId = "normal",
  width = 720,
  height = 960,
  delayMs = 420,
  logoSrc = "/logo.png"
): Promise<string> {
  const validPhotos = photos.filter((p) => Boolean(p) && typeof p === "string" && p.startsWith("data:"));
  if (!validPhotos.length) throw new Error("No valid photos provided for GIF");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Unable to create canvas 2d context for GIF");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const gif = GIFEncoder();
  const theme = FRAME_THEMES.find((t) => t.id === themeId) || FRAME_THEMES[0];
  const filter = COLOR_FILTERS.find((f) => f.id === colorFilterId) || COLOR_FILTERS[0];

  // Pre-load official white and green logos once
  if (!cachedWhiteLogo) {
    try {
      cachedWhiteLogo = await loadImage(WHITE_LOGO_SRC);
    } catch {
      cachedWhiteLogo = null;
    }
  }

  if (!cachedGreenLogo) {
    try {
      cachedGreenLogo = await loadImage(GREEN_LOGO_SRC);
    } catch {
      cachedGreenLogo = null;
    }
  }

  const whiteLogo = cachedWhiteLogo;
  const greenLogo = cachedGreenLogo;

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
      // Yield to event loop to keep UI responsive
      await new Promise((resolve) => setTimeout(resolve, 0));

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

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Full 256 colors per frame for pure HD quality, completely eliminating noise / color banding
      const palette = quantize(data, 256);
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

  // Cleanup canvas memory immediately
  canvas.width = 0;
  canvas.height = 0;

  if (framesWritten === 0) {
    throw new Error("Failed to render any frames for GIF");
  }

  gif.finish();
  const bytes = gif.bytes();
  return "data:image/gif;base64," + uint8ArrayToBase64(bytes);
}
