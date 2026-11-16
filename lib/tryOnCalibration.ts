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
    scaleMultiplier: 1.0,
    offsetX: 0,
    offsetY: 0,
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
    scaleMultiplier: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotationOffset: 0,
    style: "Rounded hexagonal",
    material: "Metal",
    color: "#B76E79",
    recommendedFor: ["Square", "Oblong", "Heart", "Diamond"],
  },
  // Backward compatibility alias for earlier real asset IDs
  "cateye-pastel-real": {
    id: "cateye-pastel-real",
    name: "Cateye Pastel",
    asset: "/glasses/cateye-pastel.png",
    scaleMultiplier: 1.0,
    offsetX: 0,
    offsetY: 0,
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
    scaleMultiplier: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotationOffset: 0,
    style: "Rounded hexagonal",
    material: "Metal",
    color: "#B76E79",
    recommendedFor: ["Square", "Oblong", "Heart", "Diamond"],
  },
  "clubmaster-real": {
    id: "clubmaster-real",
    name: "Kotak Clubmaster Real",
    asset: "/glasses/clubmaster-real.png",
    scaleMultiplier: 1.0,
    offsetX: 0,
    offsetY: -3,
    rotationOffset: 0,
    style: "Browline",
    material: "Acetate & Metal",
    color: "#262626",
    recommendedFor: ["Oval", "Round", "Square", "Heart"],
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
    scaleMultiplier: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotationOffset: 0,
    style: "Universal",
    material: "Standard",
    color: "#94a3b8",
    recommendedFor: ["Oval", "Round", "Square"],
  };
}
