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

const SHAPE_META: Record<
  FaceShape,
  {
    id: string;
    label: string;
    glasses: string;
    style: string;
    tip: string;
    matchFrameIds: string[];
  }
> = {
  Diamond: {
    id: "diamond",
    label: "Diamond",
    glasses: "hexagonal-rose-gold",
    style: "Hexagonal & Cat-Eye",
    tip: "Wajah Diamond memiliki tulang pipi tegas dengan dahi dan dagu lebih ramping. Frame Hexagonal atau Cat-Eye menyeimbangkan garis wajah dengan sangat ideal!",
    matchFrameIds: ["hexagonal-rose-gold", "cateye-pastel", "cateye-lebar-real", "semi-kotak-real", "clubmaster-real"],
  },
  Oval: {
    id: "oval",
    label: "Oval",
    glasses: "clubmaster-real",
    style: "Clubmaster & Browline",
    tip: "Wajah oval memiliki proporsi alami yang seimbang. Hampir semua frame cocok, terutama Clubmaster atau Cat-Eye yang menonjolkan struktur wajah!",
    matchFrameIds: ["clubmaster-real", "cateye-pastel", "cateye-lebar-real", "square-plastik-real", "semi-kotak-real"],
  },
  Round: {
    id: "round",
    label: "Round (Bulat)",
    glasses: "square-plastik-real",
    style: "Kotak / Rectangular",
    tip: "Frame bersudut tegas seperti model Kotak menciptakan kontras dimensi tegas yang mempertegas garis wajah bulat.",
    matchFrameIds: ["square-plastik-real", "clubmaster-real", "semi-kotak-real", "cateye-pastel"],
  },
  Square: {
    id: "square",
    label: "Square (Kotak)",
    glasses: "oval-kecil-real",
    style: "Oval & Hexagonal Halus",
    tip: "Frame oval atau rounded hexagonal melembutkan garis rahang yang tegas dan memberikan keseimbangan visual harmonis.",
    matchFrameIds: ["oval-kecil-real", "hexagonal-rose-gold", "clubmaster-real"],
  },
  Heart: {
    id: "heart",
    label: "Heart (Hati)",
    glasses: "cateye-pastel",
    style: "Soft Cat-Eye & Semi-Kotak",
    tip: "Cat-eye pastel atau semi-kotak menyeimbangkan dagu lancip dengan dahi yang lebih lebar, menonjolkan tulang pipi dengan anggun.",
    matchFrameIds: ["cateye-pastel", "cateye-lebar-real", "semi-kotak-real", "hexagonal-rose-gold"],
  },
  Oblong: {
    id: "oblong",
    label: "Oblong (Panjang)",
    glasses: "clubmaster-real",
    style: "Clubmaster & Frame Lebar",
    tip: "Frame lebar dan berkarakter seperti Clubmaster membuat wajah panjang terlihat lebih proporsional.",
    matchFrameIds: ["clubmaster-real", "hexagonal-rose-gold", "square-plastik-real", "oval-kecil-real"],
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
      recommendedGlassesId: "clubmaster-real",
      recommendedStyle: "Clubmaster / Browline Frame",
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

  if (lengthRatio > 1.62) {
    shape = "Oblong";
    confidence = Math.min((lengthRatio - 1.62) / 0.3 + 0.65, 1);
  } else if (jawRatio >= 0.84 && foreheadRatio >= 0.84 && lengthRatio < 1.35) {
    shape = "Square";
    confidence = Math.min(jawRatio * 0.6 + 0.35, 1);
  } else if (lengthRatio < 1.22 && jawRatio > 0.78) {
    shape = "Round";
    confidence = Math.min((1.22 - lengthRatio) / 0.15 + 0.65, 1);
  } else if (foreheadRatio >= 0.86 && (foreheadRatio - jawRatio) > 0.13) {
    shape = "Heart";
    confidence = Math.min((foreheadRatio - jawRatio) / 0.2 + 0.55, 1);
  } else if (foreheadRatio < 0.83 && jawRatio < 0.79 && lengthRatio >= 1.18) {
    shape = "Diamond";
    confidence = Math.min((0.83 - foreheadRatio) / 0.15 + 0.65, 1);
  } else {
    shape = "Oval";
    confidence = 0.6;
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
