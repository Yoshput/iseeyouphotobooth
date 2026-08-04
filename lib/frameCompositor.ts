/**
 * frameCompositor.ts · Branded photo strip renderer & AR Try-On framed compositor
 */

import type { FrameLayout, PhotoSlot } from "./frameLayouts";
import { OUTPUT_CANVAS } from "./frameLayouts";
import { COLOR_FILTERS } from "./colorFilters";

export interface FrameTheme {
  id: string;
  name: string;
  bgColor: string;
  bgGradEnd: string;
  topBarColor: string;
  accentBarColor: string;
  textColor: string;
  igColor: string;
  slotBg: string;
  slotBorder: string;
  dotColor: string;
}

export const FRAME_THEMES: FrameTheme[] = [
  {
    id: "classic-white",
    name: "Classic White",
    bgColor: "#FFFFFF",
    bgGradEnd: "#EAF6EC",
    topBarColor: "#116B3C",
    accentBarColor: "#2FA84F",
    textColor: "#116B3C",
    igColor: "#2FA84F",
    slotBg: "#EEF6F0",
    slotBorder: "#C8E6C9",
    dotColor: "#166534",
  },
  {
    id: "emerald-luxury",
    name: "Emerald Luxury",
    bgColor: "#0A482A",
    bgGradEnd: "#052917",
    topBarColor: "#2FA84F",
    accentBarColor: "#E2B857",
    textColor: "#FFFFFF",
    igColor: "#E2B857",
    slotBg: "#06361E",
    slotBorder: "#14683C",
    dotColor: "#2FA84F",
  },
  {
    id: "vintage-warm",
    name: "Vintage Warm",
    bgColor: "#FDF9F0",
    bgGradEnd: "#F3ECE0",
    topBarColor: "#8C6239",
    accentBarColor: "#C69C6D",
    textColor: "#4A3525",
    igColor: "#8C6239",
    slotBg: "#F7F0E3",
    slotBorder: "#E2D5C3",
    dotColor: "#8C6239",
  },
  {
    id: "pastel-pink",
    name: "Pastel Cute",
    bgColor: "#FFF5F7",
    bgGradEnd: "#FCE4EC",
    topBarColor: "#EC4899",
    accentBarColor: "#2FA84F",
    textColor: "#831843",
    igColor: "#EC4899",
    slotBg: "#FDF2F8",
    slotBorder: "#FBCFE8",
    dotColor: "#EC4899",
  },
  {
    id: "midnight-dark",
    name: "Midnight Dark",
    bgColor: "#121815",
    bgGradEnd: "#090D0B",
    topBarColor: "#2FA84F",
    accentBarColor: "#10B981",
    textColor: "#F3F4F6",
    igColor: "#2FA84F",
    slotBg: "#1C2420",
    slotBorder: "#2A3630",
    dotColor: "#2FA84F",
  },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`compositor: failed to load ${src}`));
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: PhotoSlot,
  colorFilterId = "normal",
  radius = 16
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slot.x, slot.y, slot.w, slot.h, radius);
  ctx.clip();

  const scale = Math.max(slot.w / img.width, slot.h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = slot.x + (slot.w - dw) / 2;
  const dy = slot.y + (slot.h - dh) / 2;

  const filter = COLOR_FILTERS.find((f) => f.id === colorFilterId) || COLOR_FILTERS[0];
  ctx.filter = filter.cssFilter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = "none";

  if (filter.drawOverlay) {
    filter.drawOverlay(ctx, dx, dy);
  }

  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slot.x, slot.y, slot.w, slot.h, radius);
  const shadow = ctx.createLinearGradient(slot.x, slot.y, slot.x, slot.y + slot.h);
  shadow.addColorStop(0, "rgba(0,0,0,0.18)");
  shadow.addColorStop(0.2, "rgba(0,0,0,0)");
  shadow.addColorStop(0.8, "rgba(0,0,0,0)");
  shadow.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = shadow;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slot.x, slot.y, slot.w, slot.h, radius);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawEmptySlot(
  ctx: CanvasRenderingContext2D,
  slot: PhotoSlot,
  index: number,
  theme: FrameTheme,
  radius = 16
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(slot.x, slot.y, slot.w, slot.h, radius);
  ctx.fillStyle = theme.slotBg;
  ctx.fill();
  ctx.strokeStyle = theme.slotBorder;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = `bold ${Math.round(slot.h * 0.18)}px Inter, Arial, sans-serif`;
  ctx.fillStyle = theme.slotBorder;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), slot.x + slot.w / 2, slot.y + slot.h / 2);
  ctx.restore();
}

export async function compositeFrame(
  layout: FrameLayout,
  photos: string[],
  themeId = "classic-white",
  colorFilterId = "normal",
  logoSrc = "/logo.png"
): Promise<string> {
  const theme = FRAME_THEMES.find((t) => t.id === themeId) || FRAME_THEMES[0];
  const { width, height } = OUTPUT_CANVAS;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

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
  ctx.globalAlpha = 1;
  ctx.restore();

  // Top accent bar
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, 0, width, 10);
  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, 10, width, 4);

  // Header area
  const HEADER_H = 148;
  try {
    const logo = await loadImage(logoSrc);
    const maxW = 300, maxH = 120;
    const s = Math.min(maxW / logo.width, maxH / logo.height);
    const lw = logo.width * s;
    const lh = logo.height * s;

    if (theme.id === "emerald-luxury" || theme.id === "midnight-dark") {
      ctx.save();
      ctx.filter = "brightness(0) invert(1)";
      ctx.drawImage(logo, (width - lw) / 2, 14 + (HEADER_H - 14 - lh) / 2, lw, lh);
      ctx.restore();
    } else {
      ctx.drawImage(logo, (width - lw) / 2, 14 + (HEADER_H - 14 - lh) / 2, lw, lh);
    }
  } catch {
    ctx.save();
    ctx.font = "800 52px Georgia, serif";
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OPTIK I SEE YOU", width / 2, HEADER_H / 2 + 7);
    ctx.restore();
  }

  // Divider
  const divY = HEADER_H;
  ctx.save();
  const divGrad = ctx.createLinearGradient(0, divY, width, divY);
  divGrad.addColorStop(0, "rgba(0,0,0,0)");
  divGrad.addColorStop(0.5, theme.accentBarColor);
  divGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, divY);
  ctx.lineTo(width, divY);
  ctx.stroke();
  ctx.restore();

  // Photo slots
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i];
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        drawCoverImage(ctx, img, slot, colorFilterId);
      } catch {
        drawEmptySlot(ctx, slot, i, theme);
      }
    } else {
      drawEmptySlot(ctx, slot, i, theme);
    }
  }

  // Footer divider
  const FOOTER_Y = height - 148;
  ctx.save();
  const fDivGrad = ctx.createLinearGradient(0, FOOTER_Y, width, FOOTER_Y);
  fDivGrad.addColorStop(0, "rgba(0,0,0,0)");
  fDivGrad.addColorStop(0.5, theme.accentBarColor);
  fDivGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = fDivGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, FOOTER_Y);
  ctx.lineTo(width, FOOTER_Y);
  ctx.stroke();
  ctx.restore();

  // Footer text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const footerCenterY = FOOTER_Y + (height - 14 - FOOTER_Y) / 2;

  ctx.fillStyle = theme.textColor;
  ctx.font = "italic 700 36px Georgia, 'Times New Roman', serif";
  ctx.fillText("Jadi Sahabat Mata Kamu ✨", width / 2, footerCenterY - 44);

  ctx.fillStyle = theme.igColor;
  ctx.font = "bold 30px 'Inter', Arial, sans-serif";
  ctx.fillText("@iseeyou.glasses", width / 2, footerCenterY + 4);

  ctx.fillStyle = theme.textColor;
  ctx.font = "22px 'Inter', Arial, sans-serif";
  ctx.globalAlpha = 0.75;
  ctx.fillText("Optik I See You · Purwokerto", width / 2, footerCenterY + 48);
  ctx.globalAlpha = 1;

  // Bottom accent bars
  ctx.fillStyle = theme.accentBarColor;
  ctx.fillRect(0, height - 14, width, 4);
  ctx.fillStyle = theme.topBarColor;
  ctx.fillRect(0, height - 10, width, 10);

  return canvas.toDataURL("image/jpeg", 0.93);
}

/**
 * Composites a branded AR Try-On frame photo:
 * - Header: "Try On — Optik I See You"
 * - Tagline: "for every you" (DM Serif Display style)
 * - Optional glasses model badge
 * - Footer: "@iseeyou.glasses · Optik I See You"
 */
export async function compositeArTryOnFrame(
  photoUrl: string,
  arGlassesName?: string,
  logoSrc = "/logo.png"
): Promise<string> {
  const canvas = document.createElement("canvas");
  const img = await loadImage(photoUrl);

  const padding = 36;
  const headerHeight = 130;
  const footerHeight = 90;

  const width = img.width + padding * 2;
  const height = img.height + headerHeight + footerHeight + padding;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;

  // White gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#FFFFFF");
  bg.addColorStop(1, "#F4F9F5");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Top accent bars
  ctx.fillStyle = "#116B3C";
  ctx.fillRect(0, 0, width, 8);
  ctx.fillStyle = "#2FA84F";
  ctx.fillRect(0, 8, width, 4);

  // Draw Logo & "Try On — Optik I See You" Header
  try {
    const logo = await loadImage(logoSrc);
    const maxH = 54;
    const scale = maxH / logo.height;
    const lw = logo.width * scale;
    ctx.drawImage(logo, padding, 24, lw, maxH);
  } catch (err) {
    ctx.fillStyle = "#116B3C";
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText("OPTIK I SEE YOU", padding, 55);
  }

  // Draw "Try On" Badge
  ctx.save();
  ctx.fillStyle = "#116B3C";
  ctx.font = "bold 22px 'Inter', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Try On — Optik I See You", width - padding, 48);

  // Draw "for every you" Slogan in DM Serif style
  ctx.fillStyle = "#000000";
  ctx.font = "24px 'DM Serif Display', Georgia, serif";
  ctx.fillText("for every you", width - padding, 82);
  ctx.restore();

  // Draw Main Photo
  const photoY = headerHeight;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding, photoY, img.width, img.height, 20);
  ctx.clip();
  ctx.drawImage(img, padding, photoY, img.width, img.height);
  ctx.restore();

  // Photo border
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(padding, photoY, img.width, img.height, 20);
  ctx.strokeStyle = "rgba(17, 107, 60, 0.25)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Optional Glasses Model Overlay Badge on Photo
  if (arGlassesName) {
    ctx.save();
    const badgeY = photoY + img.height - 54;
    const badgeX = padding + 16;
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 260, 38, 12);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px 'Inter', sans-serif";
    ctx.fillText(`Model: ${arGlassesName}`, badgeX + 16, badgeY + 24);
    ctx.restore();
  }

  // Footer
  const footerY = photoY + img.height + 36;
  ctx.save();
  ctx.fillStyle = "#116B3C";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("@iseeyou.glasses · Optik I See You Purwokerto", width / 2, footerY);
  ctx.restore();

  // Bottom accent bar
  ctx.fillStyle = "#116B3C";
  ctx.fillRect(0, height - 8, width, 8);

  return canvas.toDataURL("image/jpeg", 0.95);
}
