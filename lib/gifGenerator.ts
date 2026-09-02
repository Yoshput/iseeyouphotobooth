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

  // Scan for non-transparent pixels
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
  ctx.drawImage(logoCanvasOrImg, Math.round(centerX - lw / 2), Math.round(centerY - lh / 2), lw, lh);
}

function drawPhotoInSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  filter: ColorFilter,
  slotX: number,
  slotY: number,
  slotW: number,
  slotH: number,
  radius = 16
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
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Official White Logo in Header (Crisply Proportioned & Centered)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = 66;
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, 260, 48);

  // Subtitle: Clean Spaced Typography without overlap
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "4px";
  ctx.fillText("T H E   M O M E N T", width / 2, 116);
  ctx.restore();

  // Central Photo Slot (Clean 580x500 portrait)
  const slotW = 580;
  const slotH = 500;
  const slotX = Math.round((width - slotW) / 2);
  const slotY = 146;
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
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Clean Footer
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Tagline in serif
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, 742);

  // Subtext
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, 782);

  // Minimalist thin divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 814);
  ctx.lineTo(width / 2 + 90, 814);
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
  bg.addColorStop(0.5, "#0E3821");
  bg.addColorStop(1, "#082415");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle Gold/Cream Outer Line
  ctx.save();
  ctx.strokeStyle = "rgba(232, 213, 183, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Official White Logo in Header
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = 66;
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, 260, 48);

  // Subtitle: "CAPTURING MOMENTS" in Cream (Properly spaced below logo)
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#E8D5B7";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("CAPTURING MOMENTS", width / 2, 116);
  ctx.restore();

  // Central Photo Slot
  const slotW = 580;
  const slotH = 500;
  const slotX = Math.round((width - slotW) / 2);
  const slotY = 146;
  const radius = 16;

  // Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 18;
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
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Branding
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#E8D5B7";
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, 742);

  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(232, 213, 183, 0.9)";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, 782);

  ctx.strokeStyle = "rgba(232, 213, 183, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 814);
  ctx.lineTo(width / 2 + 90, 814);
  ctx.stroke();
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
  bg.addColorStop(0, "#FF6B97");
  bg.addColorStop(0.5, "#F74E82");
  bg.addColorStop(1, "#DF2C68");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // White Border Outline
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.restore();

  // Official White Logo in Header (Trimmed & Perfectly Scaled)
  const trimmedLogo = getTrimmedCanvas(whiteLogo, "white-logo");
  const logoCenterY = 66;
  drawProportionalLogo(ctx, trimmedLogo || whiteLogo, width / 2, logoCenterY, 260, 48);

  // Subtitle: Clean Typography (No overlap with logo!)
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("CAPTURING MOMENTS", width / 2, 116);
  ctx.restore();

  // Central Photo Slot
  const slotW = 580;
  const slotH = 500;
  const slotX = Math.round((width - slotW) / 2);
  const slotY = 146;
  const radius = 16;

  // Photo Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 18;
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
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.stroke();
  ctx.restore();

  // Footer: Branding
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, 742);

  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, 782);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 814);
  ctx.lineTo(width / 2 + 90, 814);
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
  drawProportionalLogo(ctx, trimmedLogo || greenLogo, Math.round(width * 0.24), 58, 170, 44);

  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#116B3C";
  ctx.font = "bold 12px 'Inter', sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("BOARDING PASS · FIRST CLASS", width - 36, 48);

  ctx.fillStyle = "#666666";
  ctx.font = "11px 'Inter', sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("FLIGHT: ISY-2026 · GATE: 01", width - 36, 68);

  // Clean Header Divider
  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, 88);
  ctx.lineTo(width - 30, 88);
  ctx.stroke();
  ctx.restore();

  // Route Label
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "800 17px 'Inter', sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("RSM  —  ISY  ·  FLIGHT OF LOVE", width / 2, 116);
  ctx.restore();

  // Central Photo Slot
  const slotW = 580;
  const slotH = 500;
  const slotX = Math.round((width - slotW) / 2);
  const slotY = 144;
  const radius = 10;

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
  const footerY = 710;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "#2B2B2B";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, footerY);
  ctx.lineTo(width - 30, footerY);
  ctx.stroke();

  ctx.fillStyle = "#1A1A1A";
  ctx.font = "bold 15px 'Inter', sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("OPTIK I SEE YOU  ·  for every you", width / 2, footerY + 28);

  // Realistic Clean Barcode
  const barW = Math.round(width * 0.55);
  const barX = Math.round((width - barW) / 2);
  const barY = footerY + 44;
  const barH = 30;
  ctx.fillStyle = "#1A1A1A";
  for (let x = 0; x < barW; x += 4) {
    const isThick = ((x * 13) % 7 === 0) || ((x * 7) % 5 === 0);
    const bw = isThick ? 3 : 1.5;
    ctx.fillRect(barX + x, barY, bw, barH);
  }

  ctx.font = "11px 'Courier New', monospace";
  ctx.fillStyle = "#555555";
  ctx.fillText("ISY - 2026 - 0826 - 47829  ·  @iseeyou.glasses", width / 2, barY + barH + 16);
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
  ctx.strokeRect(20, 20, width - 40, height - 40);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Official Logo in Newspaper Header
  const trimmedLogo = getTrimmedCanvas(greenLogo, "green-logo");
  drawProportionalLogo(ctx, trimmedLogo || greenLogo, width / 2, 58, 250, 46);

  // Editorial Subhead
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px 'Inter', sans-serif";
  ctx.fillStyle = "#555555";
  ctx.letterSpacing = "2.5px";
  ctx.fillText("DAILY PHOTO EDITION  ·  EST. 2019", width / 2, 98);

  // Masthead divider lines
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(34, 114);
  ctx.lineTo(width - 34, 114);
  ctx.stroke();
  ctx.restore();

  // Central Photo Slot
  const slotW = 580;
  const slotH = 500;
  const slotX = Math.round((width - slotW) / 2);
  const slotY = 142;
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
  const footerY = 712;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(34, footerY);
  ctx.lineTo(width - 34, footerY);
  ctx.stroke();

  ctx.fillStyle = "#1A1A1A";
  ctx.font = "italic 700 22px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY + 28);

  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillStyle = "#555555";
  ctx.letterSpacing = "1.5px";
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
  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, theme.bgColor);
  bg.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Dot pattern
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let x = 20; x < width; x += 40) {
    for (let y = 20; y < height; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = theme.dotColor;
      ctx.fill();
    }
  }
  ctx.restore();

  // Top accent bar
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, 0, width, 8);
  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, 8, width, 4);

  // Header Logo / Text (Trimmed & Proportioned)
  if (logoImg) {
    const trimmedLogo = getTrimmedCanvas(logoImg, logoImg.src || "generic-logo");
    drawProportionalLogo(ctx, trimmedLogo || logoImg, width / 2, 62, 260, 48);
  } else {
    ctx.save();
    ctx.font = "800 26px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OPTIK I SEE YOU", width / 2, 62);
    ctx.restore();
  }

  // Divider line
  ctx.save();
  ctx.strokeStyle = theme.accentBarColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(40, 108);
  ctx.lineTo(width - 40, 108);
  ctx.stroke();
  ctx.restore();

  // Draw Photo
  const slotW = 580;
  const slotH = 500;
  const slotX = Math.round((width - slotW) / 2);
  const slotY = 142;
  const radius = 18;

  // Photo shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.fill();
  ctx.restore();

  drawPhotoInSlot(ctx, img, filter, slotX, slotY, slotW, slotH, radius);

  // Border stroke
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, radius);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // Footer Text & Branding
  const footerY = 712;
  ctx.save();
  ctx.strokeStyle = theme.accentBarColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(40, footerY);
  ctx.lineTo(width - 40, footerY);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = theme.textColor;
  ctx.font = "italic 700 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("for every you", width / 2, footerY + 28);

  ctx.fillStyle = theme.igColor;
  ctx.font = "bold 13px 'Inter', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("@iseeyou.glasses  ·  optikiseeyou.com", width / 2, footerY + 58);
  ctx.restore();

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
      // Yield before heavy CPU ops (quantize can take 200-500ms per frame)
      await new Promise((resolve) => setTimeout(resolve, 0));
      const palette = quantize(data, 256);
      // Yield again after quantize to keep UI alive
      await new Promise((resolve) => setTimeout(resolve, 0));
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

  // Clear logo canvas cache to prevent unbounded memory growth
  trimmedCanvasCache.clear();

  if (framesWritten === 0) {
    throw new Error("Failed to render any frames for GIF");
  }

  gif.finish();
  const bytes = gif.bytes();
  return "data:image/gif;base64," + uint8ArrayToBase64(bytes);
}

