/**
 * lib/gifGenerator.ts
 * Generates branded animated GIFs featuring the full Optik I See You frame watermark,
 * header logo, footer tagline, Instagram handle, and frame color themes!
 */

import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { COLOR_FILTERS } from "./colorFilters";
import { FRAME_THEMES, type FrameTheme } from "./frameCompositor";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for GIF"));
    img.src = src;
  });
}

export async function createAnimatedGif(
  photos: string[],
  themeId = "classic-white",
  colorFilterId = "normal",
  width = 540,
  height = 720,
  delayMs = 450,
  logoSrc = "/logo.png"
): Promise<string> {
  if (!photos.length) throw new Error("No photos provided for GIF");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const gif = GIFEncoder();
  const theme = FRAME_THEMES.find((t) => t.id === themeId) || FRAME_THEMES[0];
  const filter = COLOR_FILTERS.find((f) => f.id === colorFilterId) || COLOR_FILTERS[0];

  // Preload logo image
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(logoSrc);
  } catch {
    logoImg = null;
  }

  // Measurements targeting 540x720 frame
  const MARGIN = 36;
  const HEADER_H = 100;
  const FOOTER_H = 100;

  const slotW = width - MARGIN * 2; // 468
  const slotH = Math.round(slotW * 0.75); // 351 (4:3 aspect ratio)
  const slotX = MARGIN;
  const slotY = HEADER_H + Math.round((height - HEADER_H - FOOTER_H - slotH) / 2);

  for (const src of photos) {
    const img = await loadImage(src);

    ctx.save();

    // ── Background ──────────────────────────────────────────────────────────
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

    // ── Top accent bar ──────────────────────────────────────────────────────
    ctx.fillStyle = theme.topBarColor;
    ctx.fillRect(0, 0, width, 6);
    ctx.fillStyle = theme.accentBarColor;
    ctx.fillRect(0, 6, width, 3);

    // ── Header Logo / Text ──────────────────────────────────────────────────
    if (logoImg) {
      const maxW = 200, maxH = 65;
      const s = Math.min(maxW / logoImg.width, maxH / logoImg.height);
      const lw = logoImg.width * s;
      const lh = logoImg.height * s;

      if (theme.id === "emerald-luxury" || theme.id === "midnight-dark") {
        ctx.save();
        ctx.filter = "brightness(0) invert(1)";
        ctx.drawImage(logoImg, (width - lw) / 2, 10 + (HEADER_H - 10 - lh) / 2, lw, lh);
        ctx.restore();
      } else {
        ctx.drawImage(logoImg, (width - lw) / 2, 10 + (HEADER_H - 10 - lh) / 2, lw, lh);
      }
    } else {
      ctx.font = "800 28px Georgia, serif";
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

    // ── Photo Slot (Object Cover with Color Filter) ─────────────────────────
    const radius = 14;
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

    // Inner shadow overlay
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(slotX, slotY, slotW, slotH, radius);
    const shadow = ctx.createLinearGradient(slotX, slotY, slotX, slotY + slotH);
    shadow.addColorStop(0, "rgba(0,0,0,0.18)");
    shadow.addColorStop(0.2, "rgba(0,0,0,0)");
    shadow.addColorStop(0.8, "rgba(0,0,0,0)");
    shadow.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = shadow;
    ctx.fill();
    ctx.restore();

    // Border stroke
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(slotX, slotY, slotW, slotH, radius);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // ── Footer Text & Branding ──────────────────────────────────────────────
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

    // Tagline
    ctx.fillStyle = theme.textColor;
    ctx.font = "italic 700 20px Georgia, 'Times New Roman', serif";
    ctx.fillText("Jadi Sahabat Mata Kamu ✨", width / 2, footerCenterY - 22);

    // IG handle
    ctx.fillStyle = theme.igColor;
    ctx.font = "bold 17px 'Inter', Arial, sans-serif";
    ctx.fillText("@iseeyou.glasses", width / 2, footerCenterY + 8);

    // Location
    ctx.fillStyle = theme.textColor;
    ctx.font = "13px 'Inter', Arial, sans-serif";
    ctx.globalAlpha = 0.7;
    ctx.fillText("Optik I See You · Purwokerto", width / 2, footerCenterY + 32);
    ctx.globalAlpha = 1;

    // ── Bottom accent bar ──────────────────────────────────────────────────
    ctx.fillStyle = theme.accentBarColor;
    ctx.fillRect(0, height - 9, width, 3);
    ctx.fillStyle = theme.topBarColor;
    ctx.fillRect(0, height - 6, width, 6);

    ctx.restore();

    // Quantize RGBA frame data into GIF palette
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay: delayMs,
      repeat: 0,
    });
  }

  gif.finish();
  const bytes = gif.bytes();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "image/gif" });
  return URL.createObjectURL(blob);
}
