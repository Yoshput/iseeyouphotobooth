/**
 * frameCompositor.ts · Branded photo strip renderer & AR Try-On framed compositor
 */

import type { FrameLayout, PhotoSlot } from "./frameLayouts";
import { OUTPUT_CANVAS } from "./frameLayouts";
import { COLOR_FILTERS } from "./colorFilters";

export interface FrameTheme {
  id: string;
  name: string;
  badge?: string;
  description?: string;
  bgColor: string;
  bgGradEnd: string;
  topBarColor: string;
  accentBarColor: string;
  textColor: string;
  igColor: string;
  slotBg: string;
  slotBorder: string;
  dotColor: string;
  supportedPhotoCounts?: number[];
  supportedLayoutIds?: string[];
}

export const FRAME_THEMES: FrameTheme[] = [
  {
    id: "classic-white",
    name: "Classic White",
    badge: "Favorit",
    description: "Desain khas Optik I See You dengan nuansa putih bersih & hijau elegan.",
    bgColor: "#FFFFFF",
    bgGradEnd: "#EAF6EC",
    topBarColor: "#116B3C",
    accentBarColor: "#2FA84F",
    textColor: "#116B3C",
    igColor: "#2FA84F",
    slotBg: "#EEF6F0",
    slotBorder: "#C8E6C9",
    dotColor: "#166534",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
  {
    id: "emerald-luxury",
    name: "Emerald Luxury",
    badge: "Mewah · Gold",
    description: "Tampilan deep green botol mewah dengan aksen emas yang anggun khas I See You.",
    bgColor: "#0A482A",
    bgGradEnd: "#052917",
    topBarColor: "#2FA84F",
    accentBarColor: "#E2B857",
    textColor: "#FFFFFF",
    igColor: "#E2B857",
    slotBg: "#06361E",
    slotBorder: "#14683C",
    dotColor: "#2FA84F",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
  {
    id: "vintage-film-bw",
    name: "Vintage Film B&W",
    badge: "Tema Retro · 35mm",
    description: "Hitam-putih analog dengan lubang sprocket roll film 35mm, grain, & stamp tanggal retro.",
    bgColor: "#141414",
    bgGradEnd: "#0A0A0A",
    topBarColor: "#000000",
    accentBarColor: "#D4AF37",
    textColor: "#F5F5F5",
    igColor: "#D4AF37",
    slotBg: "#1C1C1C",
    slotBorder: "#333333",
    dotColor: "#2A2A2A",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
  {
    id: "pastel-pink",
    name: "Pastel Cute",
    badge: "Cute · Manis",
    description: "Sentuhan warna pastel blush pink manis & playful ala studio estetik.",
    bgColor: "#FFF5F7",
    bgGradEnd: "#FCE4EC",
    topBarColor: "#EC4899",
    accentBarColor: "#2FA84F",
    textColor: "#831843",
    igColor: "#EC4899",
    slotBg: "#FDF2F8",
    slotBorder: "#FBCFE8",
    dotColor: "#EC4899",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
  {
    id: "frame-koran-custom",
    name: "Frame Koran I See You",
    badge: "Edisi Khusus · Koran",
    description: "Frame Koran Klasik 'Optik i see you ?' edisi khusus dengan layout koran vintage karya manual.",
    bgColor: "#F9F8F6",
    bgGradEnd: "#F2F0EB",
    topBarColor: "#116B3C",
    accentBarColor: "#116B3C",
    textColor: "#1A1A1A",
    igColor: "#116B3C",
    slotBg: "#FFFFFF",
    slotBorder: "#1A1A1A",
    dotColor: "#D0CCC4",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
  {
    id: "signature-isy-custom",
    name: "Signature I See You",
    badge: "Tahap Update",
    description: "Desain frame khas Optik I See You spesial. Desain manual sedang dalam tahap pembaruan.",
    bgColor: "#0E3821",
    bgGradEnd: "#062013",
    topBarColor: "#2FA84F",
    accentBarColor: "#E2B857",
    textColor: "#FFFFFF",
    igColor: "#E2B857",
    slotBg: "#082916",
    slotBorder: "#2FA84F",
    dotColor: "#2FA84F",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
];

export function isThemeCompatibleWithLayout(theme: FrameTheme, layout: FrameLayout): boolean {
  return true;
}

export function getCompatibleThemes(layout: FrameLayout): FrameTheme[] {
  return FRAME_THEMES;
}

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

/**
 * Custom renderer for TEMA 1 — Vintage Film Strip B&W
 */
async function drawVintageFilmStripFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layout: FrameLayout,
  photos: string[],
  logoSrc: string
) {
  // 1. Dark matte film background (#121212)
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, width, height);

  // Outer film borders
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, 54, height);
  ctx.fillRect(width - 54, 0, 54, height);

  // 2. Sprocket Holes (35mm Roll Film Holes) on Left & Right Margins
  const holeW = 24;
  const holeH = 36;
  const holeRadius = 5;
  const holeGap = 48;

  ctx.save();
  for (let y = 24; y < height - 30; y += holeGap) {
    // Left sprocket hole
    ctx.beginPath();
    ctx.roundRect(15, y, holeW, holeH, holeRadius);
    ctx.fillStyle = "#020202";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right sprocket hole
    ctx.beginPath();
    ctx.roundRect(width - 39, y, holeW, holeH, holeRadius);
    ctx.fillStyle = "#020202";
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 3. Film Markings along edges (Kodak/Film text)
  ctx.save();
  ctx.fillStyle = "#D4AF37"; // Golden film text color
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.translate(46, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("KODAK 400TX · OPTIK I SEE YOU 35MM FILM", 0, 0);
  ctx.restore();

  // 4. Photo Slots with B&W / Sepia Filter + Film Slide Border
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i];
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        // Force B&W + Sepia grain filter for Vintage Film Strip theme
        drawCoverImage(ctx, img, slot, "bw-noir", 4);
      } catch {
        drawEmptySlot(ctx, slot, i, FRAME_THEMES[0], 4);
      }
    } else {
      drawEmptySlot(ctx, slot, i, FRAME_THEMES[0], 4);
    }
  }

  // 5. Subtle Random Scratch / Film Dust Overlay Lines
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.2;
  const scratchX = [120, 280, 490, 720, 880];
  scratchX.forEach((sx, idx) => {
    ctx.beginPath();
    ctx.moveTo(sx, 30);
    ctx.lineTo(sx + (idx % 2 === 0 ? 12 : -12), height - 30);
    ctx.stroke();
  });
  ctx.restore();

  // 6. Header / Logo Branding in Retro Gold/White
  const HEADER_H = 130;
  try {
    const logo = await loadImage(logoSrc);
    const maxW = 260, maxH = 90;
    const s = Math.min(maxW / logo.width, maxH / logo.height);
    const lw = logo.width * s;
    const lh = logo.height * s;
    ctx.save();
    ctx.filter = "brightness(0) invert(1)"; // White logo on dark film
    ctx.drawImage(logo, (width - lw) / 2, 20, lw, lh);
    ctx.restore();
  } catch {
    ctx.save();
    ctx.font = "800 42px Georgia, serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("OPTIK I SEE YOU", width / 2, 60);
    ctx.restore();
  }

  // 7. Retro LED Date Stamp at Bottom Right
  ctx.save();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `'${String(year).slice(-2)}  ${month}  ${day}`;

  ctx.font = "bold 28px 'Courier New', monospace";
  ctx.fillStyle = "#FF9900"; // Retro digital orange LED date stamp
  ctx.shadowColor = "rgba(255, 153, 0, 0.6)";
  ctx.shadowBlur = 8;
  ctx.textAlign = "right";
  ctx.fillText(dateStr, width - 68, height - 36);
  ctx.restore();
}

/**
 * Custom renderer for TEMA "News Paper / Magazine Cover Style"
 */
async function drawNewspaperEditorialFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layout: FrameLayout,
  photos: string[],
  colorFilterId: string,
  logoSrc: string
) {
  // 1. Vintage Newsprint Background Tone (#F8F7F3)
  ctx.fillStyle = "#F8F7F3";
  ctx.fillRect(0, 0, width, height);

  // Outer Double Border Line (Classic Newspaper Border)
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 22, width - 44, height - 44);
  ctx.restore();

  const margin = 36;

  // 2. SECTION 1: HEADER / MASTHEAD
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1.5;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillStyle = "#1A1A1A";

  // Left Badge
  ctx.strokeRect(margin, 36, 110, 32);
  ctx.textAlign = "center";
  ctx.fillText("BREAKING NEWS", margin + 55, 56);

  // Right Badge
  ctx.strokeRect(width - margin - 110, 36, 110, 32);
  ctx.fillText("SPECIAL ISSUE", width - margin - 55, 56);

  // Center Masthead: "OPTIK I SEE YOU"
  ctx.font = "900 38px 'Playfair Display', Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText("Optik I See You", width / 2, 58);

  ctx.font = "italic 11px Georgia, serif";
  ctx.fillStyle = "#4A4A4A";
  ctx.fillText("Capture the Moment · See the World · Editorial Edition", width / 2, 78);
  ctx.restore();

  // Double Horizontal Rules under Masthead
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(margin, 90); ctx.lineTo(width - margin, 90); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(margin, 94); ctx.lineTo(width - margin, 94); ctx.stroke();
  ctx.restore();

  // 3. SECTION 2: LARGE ELEGANT SCRIPT HEADLINE
  ctx.save();
  ctx.font = "italic 700 68px 'Playfair Display', 'Brush Script MT', Georgia, serif";
  ctx.fillStyle = "#116B3C"; // Brand green accent
  ctx.textAlign = "center";
  ctx.fillText("See The Moment", width / 2, 160);
  ctx.restore();

  // Headline Metadata Bar (Kategori | Judul | Tanggal)
  const now = new Date();
  const monthNames = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ];
  const dateStr = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(margin, 178); ctx.lineTo(width - margin, 178); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(margin, 204); ctx.lineTo(width - margin, 204); ctx.stroke();

  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillStyle = "#1A1A1A";
  ctx.textAlign = "left";
  ctx.fillText("EDITORIAL ARCHIVE", margin + 6, 194);
  ctx.textAlign = "center";
  ctx.fillText("THE I SEE YOU GAZETTE", width / 2, 194);
  ctx.textAlign = "right";
  ctx.fillText(dateStr, width - margin - 6, 194);
  ctx.restore();

  // 4. SECTION 3: MAIN PHOTO(S) WITH CORNER ORNAMENTS
  // Render photo slots (supports 1 or 2 photos cleanly)
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i];
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        drawCoverImage(ctx, img, slot, colorFilterId || "vintage-warm", 2);
      } catch {
        drawEmptySlot(ctx, slot, i, FRAME_THEMES[0], 2);
      }
    } else {
      drawEmptySlot(ctx, slot, i, FRAME_THEMES[0], 2);
    }
  }

  // Draw Corner Brackets on outer photo bounds
  if (layout.slots.length > 0) {
    const minX = Math.min(...layout.slots.map((s) => s.x));
    const minY = Math.min(...layout.slots.map((s) => s.y));
    const maxX = Math.max(...layout.slots.map((s) => s.x + s.w));
    const maxY = Math.max(...layout.slots.map((s) => s.y + s.h));

    ctx.save();
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 2;
    ctx.strokeRect(minX - 6, minY - 6, (maxX - minX) + 12, (maxY - minY) + 12);

    const bracketSize = 16;
    const corners = [
      { x: minX - 10, y: minY - 10, dx: 1, dy: 1 },
      { x: maxX + 10, y: minY - 10, dx: -1, dy: 1 },
      { x: minX - 10, y: maxY + 10, dx: 1, dy: -1 },
      { x: maxX + 10, y: maxY + 10, dx: -1, dy: -1 },
    ];
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.dy * bracketSize);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + c.dx * bracketSize, c.y);
      ctx.stroke();
    });
    ctx.restore();

    // Caption bar under photo
    const captionY = maxY + 24;
    ctx.save();
    ctx.font = "italic 12px Georgia, serif";
    ctx.fillStyle = "#1A1A1A";
    ctx.textAlign = "left";
    ctx.fillText("FOR EVERY YOU — OPTIK I SEE YOU GAZETTE", minX, captionY);
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Vol. ${now.getFullYear()} — No. ${String(now.getDate()).padStart(3, '0')}/ISY/PHOTO`, maxX, captionY);
    ctx.restore();
  }

  // 5. SECTION 4: FOOTER / EDITORIAL INFO BLOCK
  const FOOTER_Y = height - 160;
  ctx.save();
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(margin, FOOTER_Y); ctx.lineTo(width - margin, FOOTER_Y); ctx.stroke();

  // Footer Column 1: Article Snippet
  ctx.font = "bold 14px Georgia, serif";
  ctx.fillStyle = "#116B3C";
  ctx.fillText("THE ART OF ELEGANCE & CLARITY", margin, FOOTER_Y + 24);

  ctx.font = "11px Georgia, serif";
  ctx.fillStyle = "#333333";
  const articleText = "In an era where style meets vision, Optik I See You brings timeless craftsmanship and modern aesthetics together. Designed for your everyday moments.";
  ctx.fillText(articleText.slice(0, 75), margin, FOOTER_Y + 44);
  ctx.fillText(articleText.slice(75), margin, FOOTER_Y + 60);

  // Footer Column 2: Brand Tagline & Instagram Handle
  ctx.font = "italic 700 16px Georgia, serif";
  ctx.fillStyle = "#1A1A1A";
  ctx.textAlign = "right";
  ctx.fillText("Jadi Sahabat Mata Kamu", width - margin, FOOTER_Y + 24);

  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillStyle = "#116B3C";
  ctx.fillText("@iseeyou.glasses", width - margin, FOOTER_Y + 46);

  ctx.font = "11px Georgia, serif";
  ctx.fillStyle = "#666666";
  ctx.fillText("Optik I See You · Official Photobooth", width - margin, FOOTER_Y + 64);
  ctx.restore();

  // Bottom Accent Bar
  ctx.fillStyle = "#116B3C";
  ctx.fillRect(16, height - 22, width - 32, 6);
}

/**
 * Custom renderer for "Frame Koran Optik I See You" (Frame Koran.png overlay)
 */
async function drawFrameKoranCustomOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layout: FrameLayout,
  photos: string[],
  colorFilterId: string
) {
  // 1. Base Vintage Newsprint Background Tone (#F8F7F3)
  ctx.fillStyle = "#F8F7F3";
  ctx.fillRect(0, 0, width, height);

  // 2. 3 Photo Slot Bounds scaled to 1200x1800 or layout canvas
  // Original Frame Koran dimensions: 1333 x 2000 px
  const koranSlots: PhotoSlot[] = [
    { x: Math.round((20 / 1333) * width), y: Math.round((655 / 2000) * height), w: Math.round((1293 / 1333) * width), h: Math.round((548 / 2000) * height) },
    { x: Math.round((504 / 1333) * width), y: Math.round((1297 / 2000) * height), w: Math.round((324 / 1333) * width), h: Math.round((233 / 2000) * height) },
    { x: Math.round((37 / 1333) * width), y: Math.round((1541 / 2000) * height), w: Math.round((411 / 1333) * width), h: Math.round((391 / 2000) * height) },
  ];

  // Draw user photos in the transparent cutouts underneath
  for (let i = 0; i < koranSlots.length; i++) {
    const slot = koranSlots[i];
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        drawCoverImage(ctx, img, slot, colorFilterId || "normal", 0);
      } catch {
        drawEmptySlot(ctx, slot, i, FRAME_THEMES[0], 0);
      }
    } else {
      drawEmptySlot(ctx, slot, i, FRAME_THEMES[0], 0);
    }
  }

  // 3. Composite transparent PNG Frame Koran overlay on top
  try {
    const overlayImg = await loadImage("/frame photobooth/Frame Koran.png");
    ctx.drawImage(overlayImg, 0, 0, width, height);
  } catch (err) {
    console.warn("Failed to load Frame Koran.png overlay:", err);
  }
}

/**
 * Custom renderer for TEMA "Optical Blueprint" — Engineering/Optik style
 */
async function drawOpticalBlueprintFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layout: FrameLayout,
  photos: string[],
  logoSrc: string
) {
  // 1. Dark engineering blueprint background
  ctx.fillStyle = "#0D1B2A";
  ctx.fillRect(0, 0, width, height);

  // 2. Blueprint Grid lines (fine cyan grid)
  ctx.save();
  const gridSize = 40;
  ctx.strokeStyle = "rgba(0, 180, 216, 0.12)";
  ctx.lineWidth = 0.8;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  // Major grid lines every 200px
  ctx.strokeStyle = "rgba(0, 180, 216, 0.22)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 200) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 200) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  ctx.restore();

  // 3. Blueprint title bar at top
  ctx.save();
  ctx.fillStyle = "rgba(0, 180, 216, 0.15)";
  ctx.fillRect(0, 0, width, 110);
  ctx.strokeStyle = "#00B4D8";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, 110);
  ctx.restore();

  // 4. Glasses silhouette header — draw technical aviator-style frame outline
  const gx = width / 2;
  const gy = 55;
  const lensW = 90;
  const lensH = 38;
  const bridgeGap = 20;
  ctx.save();
  ctx.strokeStyle = "#00B4D8";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "rgba(0, 180, 216, 0.6)";
  ctx.shadowBlur = 10;
  // Left lens oval
  ctx.beginPath();
  ctx.ellipse(gx - bridgeGap / 2 - lensW / 2, gy, lensW / 2, lensH / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Right lens oval
  ctx.beginPath();
  ctx.ellipse(gx + bridgeGap / 2 + lensW / 2, gy, lensW / 2, lensH / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Bridge
  ctx.beginPath();
  ctx.moveTo(gx - bridgeGap / 2, gy - 5);
  ctx.bezierCurveTo(gx - bridgeGap / 4, gy - 14, gx + bridgeGap / 4, gy - 14, gx + bridgeGap / 2, gy - 5);
  ctx.stroke();
  // Left temple arm
  ctx.beginPath();
  ctx.moveTo(gx - bridgeGap / 2 - lensW, gy - 8);
  ctx.lineTo(gx - bridgeGap / 2 - lensW - 70, gy - 6);
  ctx.stroke();
  // Right temple arm
  ctx.beginPath();
  ctx.moveTo(gx + bridgeGap / 2 + lensW, gy - 8);
  ctx.lineTo(gx + bridgeGap / 2 + lensW + 70, gy - 6);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 5. Technical annotations on glasses
  ctx.save();
  ctx.fillStyle = "#00B4D8";
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.textAlign = "center";
  // PD marker between lenses
  ctx.fillText("← PD 64mm →", gx, gy + 28);
  // Lens size annotation
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0, 180, 216, 0.7)";
  ctx.fillText("⌀ 52mm", gx - bridgeGap / 2 - lensW + 5, gy - 24);
  ctx.fillText("⌀ 52mm", gx + bridgeGap / 2 + 5, gy - 24);
  ctx.restore();

  // 6. Brand header: load actual logo with white invert (dark background)
  ctx.save();
  try {
    const logo = await loadImage(logoSrc);
    const maxH = 52;
    const s = Math.min(220 / logo.width, maxH / logo.height);
    const lw = logo.width * s;
    const lh = logo.height * s;
    ctx.filter = "brightness(0) invert(1) opacity(0.9)";
    ctx.drawImage(logo, (width - lw) / 2, 14 + (110 - 14 - lh) / 2, lw, lh);
    ctx.filter = "none";
  } catch {
    // Fallback to text if logo fails
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "rgba(0, 180, 216, 0.85)";
    ctx.textAlign = "center";
    ctx.fillText("OPTIK I SEE YOU", width / 2, 58);
  }
  ctx.textAlign = "right";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillStyle = "rgba(202, 240, 248, 0.5)";
  ctx.fillText(`REF: ISY-${new Date().getFullYear()}-OPT`, width - 20, 104);
  ctx.textAlign = "left";
  ctx.fillText("OPTICAL BLUEPRINT EDITION", 20, 104);
  ctx.restore();

  // 7. Crosshair target markers at corners of photo area
  const cSize = 16;
  const minX = Math.min(...layout.slots.map(s => s.x));
  const minY = Math.min(...layout.slots.map(s => s.y));
  const maxX = Math.max(...layout.slots.map(s => s.x + s.w));
  const maxY = Math.max(...layout.slots.map(s => s.y + s.h));
  const corners2 = [
    { x: minX - 12, y: minY - 12 },
    { x: maxX + 12, y: minY - 12 },
    { x: minX - 12, y: maxY + 12 },
    { x: maxX + 12, y: maxY + 12 },
  ];
  ctx.save();
  ctx.strokeStyle = "rgba(0, 180, 216, 0.8)";
  ctx.lineWidth = 1.5;
  corners2.forEach(({ x, y }) => {
    const dx = x < width / 2 ? 1 : -1;
    const dy = y < height / 2 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * cSize, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy * cSize); ctx.stroke();
    // small dot
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = "#00B4D8"; ctx.fill();
  });
  ctx.restore();

  // 8. Photo slots
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i];
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        drawCoverImage(ctx, img, slot, "normal", 4);
      } catch {
        drawEmptySlot(ctx, slot, i, FRAME_THEMES.find(t => t.id === "optical-blueprint") || FRAME_THEMES[0], 4);
      }
    } else {
      drawEmptySlot(ctx, slot, i, FRAME_THEMES.find(t => t.id === "optical-blueprint") || FRAME_THEMES[0], 4);
    }
    // Slot label: "FRAME 01", "FRAME 02"...
    ctx.save();
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillStyle = "rgba(0, 180, 216, 0.6)";
    ctx.textAlign = "left";
    ctx.fillText(`FRAME ${String(i + 1).padStart(2, "0")}`, slot.x + 8, slot.y + slot.h - 10);
    ctx.restore();
  }

  // 9. Footer — technical specs bar
  const now = new Date();
  const footY = height - 80;
  ctx.save();
  ctx.fillStyle = "rgba(0, 180, 216, 0.12)";
  ctx.fillRect(0, footY, width, 80);
  ctx.strokeStyle = "rgba(0, 180, 216, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, footY); ctx.lineTo(width, footY); ctx.stroke();

  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillStyle = "#00B4D8";
  ctx.textAlign = "left";
  ctx.fillText("SPH: —  CYL: —  AX: —  ADD: —", 20, footY + 24);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(202, 240, 248, 0.8)";
  ctx.fillText("@iseeyou.glasses · OPTIK I SEE YOU", width / 2, footY + 24);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(0, 180, 216, 0.7)";
  ctx.fillText(`DATE: ${now.getDate().toString().padStart(2,"0")}.${(now.getMonth()+1).toString().padStart(2,"0")}.${now.getFullYear()}`, width - 20, footY + 24);

  ctx.font = "9px 'Courier New', monospace";
  ctx.fillStyle = "rgba(202, 240, 248, 0.4)";
  ctx.textAlign = "center";
  ctx.fillText("OPTICAL QUALITY BLUEPRINT · PURWOKERTO · INDONESIA", width / 2, footY + 50);
  ctx.restore();

  // Top accent line
  ctx.fillStyle = "#00B4D8";
  ctx.fillRect(0, 0, width, 3);
  ctx.fillStyle = "rgba(0, 119, 182, 0.8)";
  ctx.fillRect(0, 3, width, 2);
}

/**
 * Custom renderer for TEMA "Lens Flare Gold" — Luxury optic lens bokeh style
 */
async function drawLensFlareGoldFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layout: FrameLayout,
  photos: string[],
  logoSrc: string
) {
  // 1. Deep black background with subtle gold tint at bottom
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#0A0A0A");
  bg.addColorStop(0.6, "#0A0A0A");
  bg.addColorStop(1, "#1A1200");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Lens flare / bokeh circles — concentric gold rings scattered
  const flares = [
    { cx: width * 0.15, cy: height * 0.08, r: 180, alpha: 0.06 },
    { cx: width * 0.82, cy: height * 0.12, r: 140, alpha: 0.07 },
    { cx: width * 0.5, cy: height * 0.5, r: 240, alpha: 0.04 },
    { cx: width * 0.1, cy: height * 0.9, r: 130, alpha: 0.05 },
    { cx: width * 0.88, cy: height * 0.85, r: 160, alpha: 0.06 },
  ];
  ctx.save();
  flares.forEach(({ cx, cy, r, alpha }) => {
    // Multiple ring halos
    [1.0, 0.75, 0.5, 0.3].forEach((rFactor, idx) => {
      const ring = ctx.createRadialGradient(cx, cy, r * rFactor * 0.3, cx, cy, r * rFactor);
      ring.addColorStop(0, `rgba(212, 175, 55, 0)`);
      ring.addColorStop(0.7, `rgba(212, 175, 55, 0)`);
      ring.addColorStop(0.88, `rgba(212, 175, 55, ${alpha * (1 - idx * 0.2)})`);
      ring.addColorStop(1, `rgba(212, 175, 55, 0)`);
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(cx, cy, r * rFactor, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  ctx.restore();

  // 3. Lens flare streak from top-left corner
  ctx.save();
  const flareGrad = ctx.createLinearGradient(0, 0, width * 0.6, height * 0.35);
  flareGrad.addColorStop(0, "rgba(212, 175, 55, 0.18)");
  flareGrad.addColorStop(0.4, "rgba(212, 175, 55, 0.06)");
  flareGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width * 0.7, 0);
  ctx.lineTo(width * 0.15, height * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4. Header — brand title with luxury gold treatment
  const HEADER_H = 140;
  ctx.save();
  // Gold top bar
  const goldBar = ctx.createLinearGradient(0, 0, width, 0);
  goldBar.addColorStop(0, "rgba(212, 175, 55, 0)");
  goldBar.addColorStop(0.3, "#D4AF37");
  goldBar.addColorStop(0.7, "#D4AF37");
  goldBar.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = goldBar;
  ctx.fillRect(0, 0, width, 4);
  ctx.restore();

  // Logo
  try {
    const logo = await loadImage(logoSrc);
    const maxH = 68;
    const s = Math.min(240 / logo.width, maxH / logo.height);
    const lw = logo.width * s;
    const lh = logo.height * s;
    ctx.save();
    ctx.filter = "brightness(0) sepia(1) saturate(3) hue-rotate(5deg)";
    ctx.drawImage(logo, (width - lw) / 2, 18, lw, lh);
    ctx.restore();
  } catch {
    ctx.save();
    ctx.font = "800 44px Georgia, serif";
    ctx.fillStyle = "#D4AF37";
    ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
    ctx.shadowBlur = 12;
    ctx.textAlign = "center";
    ctx.fillText("OPTIK I SEE YOU", width / 2, 70);
    ctx.restore();
  }

  // Optician tagline
  ctx.save();
  ctx.font = "italic 14px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(255, 248, 220, 0.5)";
  ctx.textAlign = "center";
  ctx.fillText("Est. Optical Quality · Since 2010 · Purwokerto", width / 2, HEADER_H - 12);
  ctx.restore();

  // Thin gold divider
  ctx.save();
  const divGrad = ctx.createLinearGradient(0, 0, width, 0);
  divGrad.addColorStop(0, "rgba(212, 175, 55, 0)");
  divGrad.addColorStop(0.5, "rgba(212, 175, 55, 0.8)");
  divGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(width, HEADER_H); ctx.stroke();
  ctx.restore();

  // 5. Photo slots
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i];
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        drawCoverImage(ctx, img, slot, "normal", 8);
      } catch {
        drawEmptySlot(ctx, slot, i, FRAME_THEMES.find(t => t.id === "lens-flare-gold") || FRAME_THEMES[0], 8);
      }
    } else {
      drawEmptySlot(ctx, slot, i, FRAME_THEMES.find(t => t.id === "lens-flare-gold") || FRAME_THEMES[0], 8);
    }
    // Gold corner accents on each slot
    ctx.save();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.7)";
    ctx.lineWidth = 1.5;
    const bSize = 14;
    const slotCorners = [
      { x: slot.x, y: slot.y, dx: 1, dy: 1 },
      { x: slot.x + slot.w, y: slot.y, dx: -1, dy: 1 },
      { x: slot.x, y: slot.y + slot.h, dx: 1, dy: -1 },
      { x: slot.x + slot.w, y: slot.y + slot.h, dx: -1, dy: -1 },
    ];
    slotCorners.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * bSize, c.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + c.dy * bSize);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 6. Footer — Prescription-style text + Instagram handle
  const FOOTER_Y = height - 130;
  ctx.save();
  const footGrad2 = ctx.createLinearGradient(0, 0, width, 0);
  footGrad2.addColorStop(0, "rgba(212, 175, 55, 0)");
  footGrad2.addColorStop(0.5, "rgba(212, 175, 55, 0.6)");
  footGrad2.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.strokeStyle = footGrad2;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, FOOTER_Y); ctx.lineTo(width, FOOTER_Y); ctx.stroke();

  // Rx prescription-style decoration
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillStyle = "rgba(212, 175, 55, 0.25)";
  ctx.textAlign = "left";
  ctx.fillText("℞", 24, FOOTER_Y + 50);

  // Fake prescription data
  ctx.font = "10px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255, 248, 220, 0.35)";
  ctx.textAlign = "left";
  ctx.fillText("R  SPH: —    CYL: —    AX: —    ADD: —", 50, FOOTER_Y + 32);
  ctx.fillText("L  SPH: —    CYL: —    AX: —    PD: 64", 50, FOOTER_Y + 48);

  // Center branding
  ctx.font = "italic 700 24px Georgia, serif";
  ctx.fillStyle = "rgba(255, 248, 220, 0.9)";
  ctx.textAlign = "center";
  ctx.fillText("Jadi Sahabat Mata Kamu", width / 2, FOOTER_Y + 44);

  ctx.font = "bold 20px 'Inter', sans-serif";
  ctx.fillStyle = "#D4AF37";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillText("@iseeyou.glasses", width / 2, FOOTER_Y + 76);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Bottom gold bar
  const goldBarBot = ctx.createLinearGradient(0, 0, width, 0);
  goldBarBot.addColorStop(0, "rgba(212, 175, 55, 0)");
  goldBarBot.addColorStop(0.3, "#D4AF37");
  goldBarBot.addColorStop(0.7, "#D4AF37");
  goldBarBot.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = goldBarBot;
  ctx.fillRect(0, height - 4, width, 4);
}

export async function compositeFrame(
  layout: FrameLayout,
  photos: string[],
  themeId = "classic-white",
  colorFilterId = "normal",
  logoSrc = "/logo.png"
): Promise<string> {
  const theme = FRAME_THEMES.find((t) => t.id === themeId) || FRAME_THEMES[0];
  const width = layout.canvasWidth || 1200;
  const height = layout.canvasHeight || 1800;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Custom theme branch: Vintage Film Strip B&W
  if (themeId === "vintage-film-bw") {
    await drawVintageFilmStripFrame(ctx, width, height, layout, photos, logoSrc);
    return canvas.toDataURL("image/jpeg", 0.93);
  }

  // Custom theme branch: News Paper Editorial
  if (themeId === "newspaper-editorial") {
    await drawNewspaperEditorialFrame(ctx, width, height, layout, photos, colorFilterId, logoSrc);
    return canvas.toDataURL("image/jpeg", 0.93);
  }

  // Custom theme branch: Frame Koran Custom PNG Overlay (Fixed 1200x1800 ratio to prevent squishing)
  if (themeId === "frame-koran-custom") {
    const koranWidth = 1200;
    const koranHeight = 1800;
    const koranCanvas = document.createElement("canvas");
    koranCanvas.width = koranWidth;
    koranCanvas.height = koranHeight;
    const koranCtx = koranCanvas.getContext("2d")!;
    await drawFrameKoranCustomOverlay(koranCtx, koranWidth, koranHeight, layout, photos, colorFilterId);
    return koranCanvas.toDataURL("image/jpeg", 0.93);
  }

  // Custom theme branch: Optical Blueprint
  if (themeId === "optical-blueprint") {
    await drawOpticalBlueprintFrame(ctx, width, height, layout, photos, logoSrc);
    return canvas.toDataURL("image/jpeg", 0.93);
  }

  // Custom theme branch: Lens Flare Gold
  if (themeId === "lens-flare-gold") {
    await drawLensFlareGoldFrame(ctx, width, height, layout, photos, logoSrc);
    return canvas.toDataURL("image/jpeg", 0.93);
  }

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
  ctx.fillText("Jadi Sahabat Mata Kamu", width / 2, footerCenterY - 44);

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
