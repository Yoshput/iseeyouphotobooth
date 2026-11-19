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
  matchReasons?: string[];
  isRecommended?: boolean;
}

export interface FrameMatchDetail {
  score: number; // 0 - 100
  isRecommended: boolean;
  reasons: string[];
  contrastScore: number;
  proportionScore: number;
  styleScore: number;
  colorScore: number;
}

/**
 * Calculates a transparent, multi-criteria compatibility score (0-100)
 * between a face shape and a specific glasses model with natural Indonesian explanations.
 */
export function calculateFrameMatch(
  shape: FaceShape,
  frame: GlassesManifestEntry
): FrameMatchDetail {
  if (frame.id === "none" || frame.excludeFromAiMatch || frame.lensType === "tinted") {
    return {
      score: 0,
      isRecommended: false,
      reasons: ["Frame netral atau kacamata hitam tidak diikutsertakan dalam kalkulasi AI Match."],
      contrastScore: 0,
      proportionScore: 0,
      styleScore: 0,
      colorScore: 0,
    };
  }

  const isExplicitlyRecommended = frame.recommendedFor.includes(shape);
  const reasons: string[] = [];

  // 1. Contrast Score (max 40 pts)
  let contrastScore = 20;
  if (isExplicitlyRecommended) {
    contrastScore = 40;
    switch (shape) {
      case "Round":
        reasons.push("Bentuk bersudut tegas menciptakan kontras visual yang mempertegas struktur wajah bulat.");
        break;
      case "Square":
        reasons.push("Lengkungan halus frame melembutkan sudut rahang tegas untuk tampilan lebih harmonis.");
        break;
      case "Heart":
        reasons.push("Desain frame menyeimbangkan proporsi dahi lebar dan dagu lancip secara elegan.");
        break;
      case "Oblong":
        reasons.push("Proporsi frame lebar dan berkarakter membagi dimensi wajah panjang agar tampak lebih proporsional.");
        break;
      case "Diamond":
        reasons.push("Kontur geometris menonjolkan keindahan tulang pipi tanpa menambah kesan lebar di pelipis.");
        break;
      case "Oval":
        reasons.push("Proporsi alami wajah oval sangat harmonis dengan struktur garis frame ini.");
        break;
    }
  } else if (shape === "Oval") {
    contrastScore = 36;
    reasons.push("Struktur wajah oval fleksibel dan serasi dengan siluet frame ini.");
  } else if (frame.recommendedFor.length >= 4) {
    contrastScore = 28;
    reasons.push("Siluet serbaguna yang cukup adaptif dengan kontur wajah kamu.");
  } else {
    contrastScore = 15;
  }

  // 2. Proportion & Width Balance (max 30 pts)
  let proportionScore = 25;
  const ratio = frame.fitWidthRatio || 1.45;
  if (ratio >= 1.44 && ratio <= 1.52) {
    proportionScore = 30;
    reasons.push("Lebar frame proporsional membingkai pelipis tanpa menekan sisi samping wajah.");
  } else if (ratio > 1.52) {
    proportionScore = 26;
    reasons.push("Ukuran frame memberikan kesan bold dan stylish di wajah.");
  } else {
    proportionScore = 24;
  }

  // 3. Browline & Bridge Harmony (max 20 pts)
  let styleScore = 18;
  const lowerStyle = (frame.style || "").toLowerCase();
  if (lowerStyle.includes("browline") || lowerStyle.includes("clubmaster")) {
    styleScore = 20;
    reasons.push("Garis atas frame mengikuti lengkung alami alis dan mempertegas area mata.");
  } else if (lowerStyle.includes("cat-eye")) {
    styleScore = 19;
    reasons.push("Sudut atas yang sedikit terangkat memberikan efek mata lebih segar dan ekspresif.");
  } else {
    styleScore = 17;
  }

  // 4. Color & Material Balance (max 10 pts)
  const colorScore = 9;

  const totalScore = Math.min(100, Math.round(contrastScore + proportionScore + styleScore + colorScore));
  const isRecommended = totalScore >= 75 || isExplicitlyRecommended;

  return {
    score: totalScore,
    isRecommended,
    reasons,
    contrastScore,
    proportionScore,
    styleScore,
    colorScore,
  };
}

/**
 * Rolling-window stabilizer to eliminate shape classification jitter across video frames.
 */
export class FaceShapeStabilizer {
  private history: FaceShape[] = [];
  private windowSize: number;

  constructor(windowSize = 12) {
    this.windowSize = windowSize;
  }

  push(shape: FaceShape): FaceShape {
    this.history.push(shape);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    // Return the majority shape in the history window
    const counts = new Map<FaceShape, number>();
    for (const s of this.history) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }

    let bestShape: FaceShape = shape;
    let maxCount = 0;
    for (const [s, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        bestShape = s;
      }
    }
    return bestShape;
  }

  reset() {
    this.history = [];
  }
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
      const match = calculateFrameMatch(shape, g);
      return {
        ...g,
        matchScore: match.score,
        matchReasons: match.reasons,
        isRecommended: match.isRecommended,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return typeof topN === "number" ? ranked.slice(0, topN) : ranked;
}

export { SHAPE_META };
