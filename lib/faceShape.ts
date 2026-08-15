/**
 * lib/faceShape.ts
 *
 * Detects face shape from MediaPipe 468 landmarks and ranks the glasses
 * catalog against it.
 *
 * Key landmarks used:
 *  - 10  : top forehead
 *  - 152 : chin (bottom)
 *  - 234 : left cheekbone outer
 *  - 454 : right cheekbone outer
 *  - 132 : left jaw angle
 *  - 361 : right jaw angle
 *  - 103 : left forehead temple
 *  - 332 : right forehead temple
 */

export type FaceShape = "Oval" | "Round" | "Square" | "Heart" | "Diamond" | "Oblong";

export interface FaceShapeResult {
  shape: FaceShape;
  shapeId: string;
  recommendedGlassesId: string;
  recommendedStyle: string;
  confidence: number;
}

type Landmark = { x: number; y: number; z: number };

function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const SHAPE_META: Record<FaceShape, { id: string; label: string; glasses: string; style: string; tip: string }> = {
  Oval: {
    id: "oval",
    label: "Oval",
    glasses: "oval-pastel",
    style: "Oval / Pastel Frame",
    tip: "Cocok untuk hampir semua frame!",
  },
  Round: {
    id: "round",
    label: "Round",
    glasses: "square-frame",
    style: "Square / Rectangle Frame",
    tip: "Frame kotak menciptakan keseimbangan.",
  },
  Square: {
    id: "square",
    label: "Square",
    glasses: "round-frame",
    style: "Round / Wire Frame",
    tip: "Frame bulat melembutkan rahang tegas.",
  },
  Heart: {
    id: "heart",
    label: "Heart",
    glasses: "cateye-pastel",
    style: "Cat-Eye / Pastel Frame",
    tip: "Cat-eye menyeimbangkan dagu lancip.",
  },
  Diamond: {
    id: "diamond",
    label: "Diamond",
    glasses: "oval-pastel",
    style: "Round / Cat-Eye Frame",
    tip: "Frame bulat/cat-eye melembutkan tulang pipi tinggi.",
  },
  Oblong: {
    id: "oblong",
    label: "Oblong",
    glasses: "clubmaster-frame",
    style: "Clubmaster / Browline Frame",
    tip: "Frame lebar bikin wajah kelihatan proporsional.",
  },
};

/**
 * Detects the single best-fit shape from 468/478-point landmarks.
 * Ratios used (all relative to cheekbone width, the most stable reference):
 *  - lengthRatio: face height / cheek width      -> tall vs. wide
 *  - jawRatio: jaw width / cheek width            -> narrow vs. wide jaw
 *  - foreheadRatio: forehead width / cheek width  -> narrow vs. wide forehead
 */
export function detectFaceShape(landmarks: Landmark[]): FaceShapeResult {
  const needed = [10, 103, 132, 152, 234, 332, 361, 454];
  if (landmarks.length < 468 || needed.some((i) => !landmarks[i])) {
    return {
      shape: "Oval",
      shapeId: "oval",
      recommendedGlassesId: "oval-pastel",
      recommendedStyle: "Oval / Pastel Frame",
      confidence: 0,
    };
  }

  const faceLength  = dist(landmarks[10], landmarks[152]);
  const cheekWidth  = dist(landmarks[234], landmarks[454]);
  const jawWidth    = dist(landmarks[132], landmarks[361]);
  const foreWidth   = dist(landmarks[103], landmarks[332]);

  const lengthRatio   = faceLength / cheekWidth;
  const jawRatio       = jawWidth / cheekWidth;
  const foreheadRatio = foreWidth / cheekWidth;

  let shape: FaceShape;
  let confidence: number;

  if (lengthRatio > 1.75) {
    shape = "Oblong";
    confidence = Math.min((lengthRatio - 1.75) / 0.3 + 0.6, 1);
  } else if (lengthRatio > 1.45) {
    shape = "Oval";
    confidence = Math.min((lengthRatio - 1.45) / 0.3 + 0.6, 1);
  } else if (lengthRatio < 1.15) {
    shape = "Round";
    confidence = Math.min((1.15 - lengthRatio) / 0.15 + 0.6, 1);
  } else if (jawRatio > 0.85 && foreheadRatio > 0.85) {
    shape = "Square";
    confidence = Math.min(jawRatio * 0.6 + 0.3, 1);
  } else if (foreheadRatio > 0.9 && jawRatio < 0.75) {
    shape = "Heart";
    confidence = Math.min((foreheadRatio - jawRatio) / 0.2 + 0.5, 1);
  } else if (foreheadRatio < 0.85 && jawRatio < 0.8 && lengthRatio > 1.2) {
    shape = "Diamond";
    confidence = Math.min((0.85 - foreheadRatio) / 0.15 + 0.5, 1);
  } else {
    shape = "Oval";
    confidence = 0.5;
  }

  const meta = SHAPE_META[shape];
  return {
    shape,
    shapeId: meta.id,
    recommendedGlassesId: meta.glasses,
    recommendedStyle: meta.style,
    confidence,
  };
}

// -- Ranking across the whole catalog -----------------------------------
export interface GlassesManifestEntry {
  id: string;
  name: string;
  file: string;
  fitWidthRatio: number;
  ipdScaleRef?: number;
  style: string;
  recommendedFor: string[];
  color: string;
  lensType?: string;
  excludeFromAiMatch?: boolean;
}

export interface RankedGlasses extends GlassesManifestEntry {
  matchScore: number; // 0-100
}

/**
 * Scores every item in the catalog against the detected shape and returns
 * them sorted best-first.
 * Opaque/tinted sunglasses (excludeFromAiMatch = true or lensType = 'tinted')
 * are excluded from auto-recommendations so AI Match only recommends transparent frames.
 */
export function rankGlassesForShape(
  shape: FaceShape,
  catalog: GlassesManifestEntry[],
  topN?: number
): RankedGlasses[] {
  const ranked = catalog
    .filter((g) => g.id !== "none" && !g.excludeFromAiMatch && g.lensType !== "tinted")
    .map((g) => {
      let matchScore = 20;
      if (g.recommendedFor.includes(shape)) {
        matchScore = 100;
      } else if (g.recommendedFor.length >= 4) {
        matchScore = 55;
      }
      return { ...g, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return typeof topN === "number" ? ranked.slice(0, topN) : ranked;
}

export { SHAPE_META };
