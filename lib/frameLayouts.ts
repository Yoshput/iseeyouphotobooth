/**
 * Frame layout definitions for the AR photobooth.
 *
 * Output canvas: 1080 × 1440 portrait (A4-like 3:4).
 * Each photo slot is landscape 4:3 (matches webcam output perfectly).
 *
 * Layouts:
 *  1. Solo        – 1 foto besar
 *  2. Duo Strip   – 2 foto vertikal
 *  3. Trio Strip  – 3 foto vertikal
 *  4. Trio Grid   – 1 besar + 2 kecil bawah
 *  5. Quartet Strip – 4 foto vertikal (photobooth classic)
 *  6. Quartet Grid  – 4 foto 2×2
 *  7. Sextet Grid   – 6 foto 2×3
 */

export interface PhotoSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrameLayout {
  id: string;
  label: string;
  sublabel: string;
  numPhotos: number;
  slots: PhotoSlot[];
}

export const OUTPUT_CANVAS = { width: 1080, height: 1440 } as const;

// ── Constants ────────────────────────────────────────────────────────────────
const W   = OUTPUT_CANVAS.width;   // 1080
const H   = OUTPUT_CANVAS.height;  // 1440

const MARGIN   = 44;               // left/right margin
const HEADER_H = 148;              // logo area
const FOOTER_H = 148;              // tagline + IG area
const GAP      = 18;               // gap between photo slots

// Photo area (between header & footer)
const PHOTO_AREA_Y = HEADER_H + GAP;
const PHOTO_AREA_H = H - HEADER_H - FOOTER_H - GAP * 2;   // 1132
const PHOTO_W      = W - MARGIN * 2;                        // 992
const HALF_W       = Math.floor((PHOTO_W - GAP) / 2);      // 487

/** Return a slot height for N equal rows given the available area */
function rowH(rows: number) {
  return Math.floor((PHOTO_AREA_H - GAP * (rows - 1)) / rows);
}

/** Starting Y of row `r` (0-indexed) given the row height `h` */
function rowY(r: number, h: number) {
  return PHOTO_AREA_Y + r * (h + GAP);
}

export const FRAME_LAYOUTS: FrameLayout[] = [
  // 1. Solo (1 Foto) ─────────────────────────────────────────────────────────
  {
    id: "solo",
    label: "1 Foto",
    sublabel: "Solo",
    numPhotos: 1,
    slots: [{ x: MARGIN, y: PHOTO_AREA_Y, w: PHOTO_W, h: PHOTO_AREA_H }],
  },

  // 2. Duo Vertikal (2 Foto Strip) ───────────────────────────────────────────
  {
    id: "duo_vert",
    label: "2 Foto",
    sublabel: "Strip Vertikal",
    numPhotos: 2,
    slots: (() => {
      const h = rowH(2);
      return [
        { x: MARGIN, y: rowY(0, h), w: PHOTO_W, h },
        { x: MARGIN, y: rowY(1, h), w: PHOTO_W, h },
      ];
    })(),
  },

  // 3. Trio Vertikal (3 Foto Strip) ──────────────────────────────────────────
  {
    id: "trio_vert",
    label: "3 Foto",
    sublabel: "Strip Vertikal",
    numPhotos: 3,
    slots: (() => {
      const h = rowH(3);
      return [
        { x: MARGIN, y: rowY(0, h), w: PHOTO_W, h },
        { x: MARGIN, y: rowY(1, h), w: PHOTO_W, h },
        { x: MARGIN, y: rowY(2, h), w: PHOTO_W, h },
      ];
    })(),
  },

  // 4. Trio Grid (1 Besar + 2 Kecil) ─────────────────────────────────────────
  {
    id: "trio_grid",
    label: "3 Foto",
    sublabel: "Grid Kombinasi",
    numPhotos: 3,
    slots: (() => {
      const topH = Math.floor(PHOTO_AREA_H * 0.52);
      const botH = PHOTO_AREA_H - topH - GAP;
      return [
        { x: MARGIN, y: PHOTO_AREA_Y,              w: PHOTO_W, h: topH },
        { x: MARGIN, y: PHOTO_AREA_Y + topH + GAP, w: HALF_W,  h: botH },
        { x: MARGIN + HALF_W + GAP, y: PHOTO_AREA_Y + topH + GAP, w: HALF_W, h: botH },
      ];
    })(),
  },

  // 5. Quartet Strip Vertikal (4 Foto Classic Photobooth) ────────────────────
  {
    id: "quartet_strip",
    label: "4 Foto",
    sublabel: "Strip Klasik",
    numPhotos: 4,
    slots: (() => {
      const h = rowH(4);
      return [
        { x: MARGIN, y: rowY(0, h), w: PHOTO_W, h },
        { x: MARGIN, y: rowY(1, h), w: PHOTO_W, h },
        { x: MARGIN, y: rowY(2, h), w: PHOTO_W, h },
        { x: MARGIN, y: rowY(3, h), w: PHOTO_W, h },
      ];
    })(),
  },

  // 6. Quartet Grid (4 Foto 2×2) ─────────────────────────────────────────────
  {
    id: "quartet_grid",
    label: "4 Foto",
    sublabel: "Grid 2×2",
    numPhotos: 4,
    slots: (() => {
      const h = rowH(2);
      return [
        { x: MARGIN,              y: rowY(0, h), w: HALF_W, h },
        { x: MARGIN + HALF_W + GAP, y: rowY(0, h), w: HALF_W, h },
        { x: MARGIN,              y: rowY(1, h), w: HALF_W, h },
        { x: MARGIN + HALF_W + GAP, y: rowY(1, h), w: HALF_W, h },
      ];
    })(),
  },

  // 7. Sextet Grid (6 Foto 2×3) ──────────────────────────────────────────────
  {
    id: "sextet_grid",
    label: "6 Foto",
    sublabel: "Grid 2×3",
    numPhotos: 6,
    slots: (() => {
      const h = rowH(3);
      return [
        { x: MARGIN,              y: rowY(0, h), w: HALF_W, h },
        { x: MARGIN + HALF_W + GAP, y: rowY(0, h), w: HALF_W, h },
        { x: MARGIN,              y: rowY(1, h), w: HALF_W, h },
        { x: MARGIN + HALF_W + GAP, y: rowY(1, h), w: HALF_W, h },
        { x: MARGIN,              y: rowY(2, h), w: HALF_W, h },
        { x: MARGIN + HALF_W + GAP, y: rowY(2, h), w: HALF_W, h },
      ];
    })(),
  },
];
