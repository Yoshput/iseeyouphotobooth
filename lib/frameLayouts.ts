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
    sublabel: "Solo",
    numPhotos: 1,
    canvasWidth: 1200,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[2/3]",
    slots: [{ x: 60, y: 220, w: 1080, h: 1380 }],
  },

  // 2. Duo Vertikal (2 Foto Strip — 2×6 inch strip, ratio 1:3) ────────────────
  {
    id: "duo_vert",
    label: "2 Foto",
    sublabel: "Strip Vertikal",
    numPhotos: 2,
    canvasWidth: 600,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[1/3]",
    slots: [
      { x: 32, y: 160, w: 536, h: 660 },
      { x: 32, y: 840, w: 536, h: 660 },
    ],
  },

  // 3. Trio Vertikal (3 Foto Strip — 2×6 inch strip, ratio 1:3) ────────────────
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

  // 4. Trio Grid (3 Foto Grid Kombinasi — 4×6 inch card, ratio 2:3) ────────────
  {
    id: "trio_grid",
    label: "3 Foto",
    sublabel: "Grid Kombinasi",
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

  // 5. Trio Koran Editorial (3 Foto Frame Koran — 4×6 inch card, ratio 2:3) ────
  {
    id: "trio_koran",
    label: "3 Foto",
    sublabel: "Frame Koran",
    numPhotos: 3,
    canvasWidth: 1200,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[2/3]",
    slots: [
      { x: 18, y: 590, w: 1164, h: 493 },
      { x: 454, y: 1167, w: 292, h: 210 },
      { x: 33, y: 1387, w: 370, h: 352 },
    ],
  },

  // 5. Quartet Strip Vertikal (4 Foto Strip Klasik — 2×6 inch strip, ratio 1:3)
  {
    id: "quartet_strip",
    label: "4 Foto",
    sublabel: "Strip Klasik",
    numPhotos: 4,
    canvasWidth: 600,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[1/3]",
    slots: [
      { x: 32, y: 144, w: 536, h: 338 },
      { x: 32, y: 496, w: 536, h: 338 },
      { x: 32, y: 848, w: 536, h: 338 },
      { x: 32, y: 1200, w: 536, h: 338 },
    ],
  },

  // 6. Quartet Grid (4 Foto Grid 2×2 — 4×6 inch card, ratio 2:3) ─────────────
  {
    id: "quartet_grid",
    label: "4 Foto",
    sublabel: "Grid 2×2",
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

  // 7. Sextet Grid (6 Foto Grid 2×3 — 4×6 inch card, ratio 2:3) ─────────────
  {
    id: "sextet_grid",
    label: "6 Foto",
    sublabel: "Grid 2×3",
    numPhotos: 6,
    canvasWidth: 1200,
    canvasHeight: 1800,
    aspectRatioClass: "aspect-[2/3]",
    slots: [
      { x: 60, y: 200, w: 530, h: 400 },
      { x: 610, y: 200, w: 530, h: 400 },
      { x: 60, y: 620, w: 530, h: 400 },
      { x: 610, y: 620, w: 530, h: 400 },
      { x: 60, y: 1040, w: 530, h: 400 },
      { x: 610, y: 1040, w: 530, h: 400 },
    ],
  },
];
