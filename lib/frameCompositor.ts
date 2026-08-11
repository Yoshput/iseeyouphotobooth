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
    description: "Desain khas Optik I See You dengan nuansa hijau elegan & bersih.",
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
    id: "vintage-film-bw",
    name: "Vintage Film B&W",
    badge: "Tema Baru · 35mm",
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
    id: "newspaper-editorial",
    name: "News Paper Editorial",
    badge: "Trending · 1-2 Foto",
    description: "Khusus 1 atau 2 Foto: Sampul majalah/koran edisi khusus Optik I See You dengan headline script besar & layout majalah vintage.",
    bgColor: "#F9F8F6",
    bgGradEnd: "#F2F0EB",
    topBarColor: "#116B3C",
    accentBarColor: "#116B3C",
    textColor: "#1A1A1A",
    igColor: "#116B3C",
    slotBg: "#EFECE6",
    slotBorder: "#1A1A1A",
    dotColor: "#D0CCC4",
    supportedPhotoCounts: [1, 2],
    supportedLayoutIds: ["solo", "duo_vert"],
  },
  {
    id: "emerald-luxury",
    name: "Emerald Luxury",
    description: "Tampilan deep green mewah dengan aksen emas yang anggun.",
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
    id: "vintage-warm",
    name: "Vintage Warm",
    description: "Warna krem hangat ala foto polaroid klasik.",
    bgColor: "#FDF9F0",
    bgGradEnd: "#F3ECE0",
    topBarColor: "#8C6239",
    accentBarColor: "#C69C6D",
    textColor: "#4A3525",
    igColor: "#8C6239",
    slotBg: "#F7F0E3",
    slotBorder: "#E2D5C3",
    dotColor: "#8C6239",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
  {
    id: "pastel-pink",
    name: "Pastel Cute",
    description: "Sentuhan warna pastel manis & playful.",
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
    id: "midnight-dark",
    name: "Midnight Dark",
    description: "Nuansa gelap kontemporer dengan aksen neon jernih.",
    bgColor: "#121815",
    bgGradEnd: "#090D0B",
    topBarColor: "#2FA84F",
    accentBarColor: "#10B981",
    textColor: "#F3F4F6",
    igColor: "#2FA84F",
    slotBg: "#1C2420",
    slotBorder: "#2A3630",
    dotColor: "#2FA84F",
    supportedPhotoCounts: [1, 2, 3, 4, 6],
  },
];

export function isThemeCompatibleWithLayout(theme: FrameTheme, layout: FrameLayout): boolean {
  if (theme.supportedLayoutIds && theme.supportedLayoutIds.length > 0) {
    return theme.supportedLayoutIds.includes(layout.id);
  }
  if (theme.supportedPhotoCounts && theme.supportedPhotoCounts.length > 0) {
    return theme.supportedPhotoCounts.includes(layout.numPhotos);
  }
  return true;
}

export function getCompatibleThemes(layout: FrameLayout): FrameTheme[] {
  return FRAME_THEMES.filter((theme) => isThemeCompatibleWithLayout(theme, layout));
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
  ctx.fillText("Jadi Sahabat Mata Kamu ✨", width - margin, FOOTER_Y + 24);

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
