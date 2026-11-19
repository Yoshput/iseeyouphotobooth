/**
 * Calibration configuration per eyeglass product.
 * Stores individual fitting adjustments (scale, X/Y offsets, rotation)
 * so adjustments to one frame never unintentionally affect another.
 */

export interface FrameCalibration {
  id: string;
  name: string;
  asset: string;
  scaleMultiplier: number;
  offsetX: number;
  offsetY: number;
  rotationOffset: number;
  style: string;
  material: string;
  color: string;
  recommendedFor: string[];
}

export const FRAME_CALIBRATIONS: Record<string, FrameCalibration> = {
  "cateye-pastel": {
    id: "cateye-pastel",
    name: "Cateye Pastel",
    asset: "/glasses/cateye-pastel.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Soft cat-eye",
    material: "Translucent acetate",
    color: "#C8B8A2",
    recommendedFor: ["Heart", "Oval", "Round", "Diamond"],
  },
  "hexagonal-rose-gold": {
    id: "hexagonal-rose-gold",
    name: "Hexagonal Rose Gold",
    asset: "/glasses/hexagonal-rose-gold.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Rounded hexagonal",
    material: "Metal",
    color: "#B76E79",
    recommendedFor: ["Diamond", "Square", "Oblong", "Heart"],
  },
  "cateye-pastel-real": {
    id: "cateye-pastel-real",
    name: "Cateye Pastel",
    asset: "/glasses/cateye-pastel.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Soft cat-eye",
    material: "Translucent acetate",
    color: "#C8B8A2",
    recommendedFor: ["Heart", "Oval", "Round", "Diamond"],
  },
  "hexagonal-real": {
    id: "hexagonal-real",
    name: "Hexagonal Rose Gold",
    asset: "/glasses/hexagonal-rose-gold.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Rounded hexagonal",
    material: "Metal",
    color: "#B76E79",
    recommendedFor: ["Diamond", "Square", "Oblong", "Heart"],
  },
  "clubmaster-real": {
    id: "clubmaster-real",
    name: "Kotak Clubmaster Real",
    asset: "/glasses/clubmaster-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 2,
    rotationOffset: 0,
    style: "Browline",
    material: "Acetate & Metal",
    color: "#262626",
    recommendedFor: ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"],
  },
  "cateye-lebar-real": {
    id: "cateye-lebar-real",
    name: "Cat-Eye Lebar Real",
    asset: "/glasses/cateye-lebar-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Cat-Eye",
    material: "Acetate",
    color: "#18251F",
    recommendedFor: ["Heart", "Oval", "Round", "Diamond", "Square"],
  },
  "square-plastik-real": {
    id: "square-plastik-real",
    name: "Kotak Plastik Hitam Real",
    asset: "/glasses/square-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Square",
    material: "Acetate",
    color: "#18251F",
    recommendedFor: ["Round", "Oval", "Oblong"],
  },
  "oval-kecil-real": {
    id: "oval-kecil-real",
    name: "Oval Kecil Real",
    asset: "/glasses/oval-kecil-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Oval",
    material: "Acetate",
    color: "#4B3621",
    recommendedFor: ["Square", "Oblong", "Diamond"],
  },
  "semi-kotak-real": {
    id: "semi-kotak-real",
    name: "Semi Kotak Plastik Real",
    asset: "/glasses/semi-kotak-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Semi-Square",
    material: "Acetate",
    color: "#2B2D2F",
    recommendedFor: ["Heart", "Oval", "Round", "Diamond"],
  },
  "sunglasses-real": {
    id: "sunglasses-real",
    name: "Sun Glasses Hitam Real",
    asset: "/glasses/sunglasses-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Sunglasses",
    material: "Acetate",
    color: "#0F0F0F",
    recommendedFor: ["Oval", "Heart", "Diamond", "Square"],
  },
  "aviator-real": {
    id: "aviator-real",
    name: "Sunglasses Aviator Real",
    asset: "/glasses/aviator-real.png",
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Aviator",
    material: "Metal",
    color: "#D4AF37",
    recommendedFor: ["Square", "Oval", "Heart", "Diamond"],
  },
};

/** Get calibration for a given product ID, with sensible default fallbacks. */
export function getFrameCalibration(id: string): FrameCalibration {
  if (FRAME_CALIBRATIONS[id]) {
    return FRAME_CALIBRATIONS[id];
  }
  return {
    id,
    name: id,
    asset: `/glasses/${id}.png`,
    scaleMultiplier: 0.88,
    offsetX: 0,
    offsetY: 1,
    rotationOffset: 0,
    style: "Universal",
    material: "Standard",
    color: "#94a3b8",
    recommendedFor: ["Oval", "Round", "Square"],
  };
}
