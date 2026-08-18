/**
 * Frame layout definitions for the AR photobooth.
 *
 * Physical Photobooth Print Standards:
 * 1. 2×6 inch Strip (1:3 ratio) — duo_vert, trio_vert, quartet_strip (600 × 1800 px @ 300DPI)
 * 2. 4×6 inch Card (2:3 ratio)  — solo, trio_grid, quartet_grid, sextet_grid (1200 × 1800 px @ 300DPI)
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
  canvasWidth: number;
  canvasHeight: number;
  aspectRatioClass: string; // "aspect-[1/3]" for slender strips vs "aspect-[2/3]" for 4x6 cards
  slots: PhotoSlot[];
}

export const OUTPUT_CANVAS = { width: 1200, height: 1800 } as const;

export const FRAME_LAYOUTS: FrameLayout[] = [
  // 1. Solo (1 Foto / Solo — 4×6 inch card, ratio 2:3) ─────────────────────────
  {
    id: "solo",
    label: "1 Foto",
    sublabel: "Solo Portrait",
    numPhotos: 1,
    canvasWidth: 1200,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[2/3]",
    slots: [{ x: 60, y: 220, w: 1080, h: 1380 }],
  },

  // 2. Trio Vertikal (3 Foto Strip — 2×6 inch strip, ratio 1:3) ────────────────
  {
    id: "trio_vert",
    label: "3 Foto",
    sublabel: "Strip Vertikal",
    numPhotos: 3,
    canvasWidth: 600,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[1/3]",
    slots: [
      { x: 32, y: 160, w: 536, h: 434 },
      { x: 32, y: 612, w: 536, h: 434 },
      { x: 32, y: 1064, w: 536, h: 434 },
    ],
  },

  // 3. Trio Grid (3 Foto Grid Polaroid — 4×6 inch card, ratio 2:3) ─────────────
  {
    id: "trio_grid",
    label: "3 Foto",
    sublabel: "Polaroid Trio",
    numPhotos: 3,
    canvasWidth: 1200,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[2/3]",
    slots: [
      { x: 60, y: 204, w: 1080, h: 650 },
      { x: 60, y: 878, w: 528, h: 558 },
      { x: 612, y: 878, w: 528, h: 558 },
    ],
  },

  // 4. Quartet Grid (4 Foto Polaroid 2×2 — 4×6 inch card, ratio 2:3) ───────────
  {
    id: "quartet_grid",
    label: "4 Foto",
    sublabel: "Polaroid 2×2",
    numPhotos: 4,
    canvasWidth: 1200,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[2/3]",
    slots: [
      { x: 60, y: 204, w: 528, h: 604 },
      { x: 612, y: 204, w: 528, h: 604 },
      { x: 60, y: 832, w: 528, h: 604 },
      { x: 612, y: 832, w: 528, h: 604 },
    ],
  },
];
