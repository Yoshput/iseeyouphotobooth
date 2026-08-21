import * as THREE from "three";

export interface Glasses3DConfig {
  frameColor?: string | number;
  metalColor?: string | number;
  isTinted?: boolean;
  style?: "Square" | "Hexagonal" | "Oval" | "Cat-Eye" | "Browline" | "Sunglasses" | "Semi-Square" | string;
  frameWidthMm?: number;
  bridgeMm?: number;
  templeMm?: number;
}

/**
 * Creates an ultra-sleek, luxury-grade procedural 3D glasses model in Three.js.
 * Normalized to 1.0 width (spans -0.5 to +0.5).
 */
export function createGlasses3DModel(config: Glasses3DConfig = {}): THREE.Group {
  const {
    frameColor = "#1a1a1a",
    metalColor = "#d4af37",
    isTinted = false,
    style = "Square",
  } = config;

  const root = new THREE.Group();
  root.name = "Luxury_Glasses_3D_Model";

  const fColor = new THREE.Color(frameColor);
  const mColor = new THREE.Color(metalColor);

  // ── Luxury Materials with High Specularity & Clearcoat ─────────────────────
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: fColor,
    roughness: 0.12,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
  });

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: mColor,
    roughness: 0.15,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
  });

  // Optical Lens with subtle anti-reflective coating
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: isTinted ? new THREE.Color("#18221c") : new THREE.Color("#f4f9f8"),
    transmission: isTinted ? 0.65 : 0.96,
    opacity: isTinted ? 0.92 : 0.88,
    transparent: true,
    roughness: 0.02,
    ior: 1.52,
    reflectivity: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const padMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    roughness: 0.2,
    transmission: 0.6,
  });

  // ── Luxury Frame Proportions (Thin, Delicate, Modern) ───────────────────────
  const totalW = 1.0;
  const bridgeW = 0.12;
  const singleRimW = (totalW - bridgeW) / 2; // ~0.44
  const halfW = singleRimW / 2;              // ~0.22
  const halfH = halfW * 0.74;                // ~0.162 (sleek optical ratio)
  const tubeRadius = 0.0095;                 // sleek luxury thin rim
  const templeLength = 1.05;

  // ── Sleek Rim Curves ───────────────────────────────────────────────────────
  function buildRimShape(s: string, w: number, h: number): THREE.Shape {
    const shape = new THREE.Shape();
    const sLower = s.toLowerCase();

    if (sLower.includes("hexagonal")) {
      const hw = w * 0.96;
      const hh = h * 0.96;
      shape.moveTo(-hw * 0.5, hh);
      shape.lineTo(hw * 0.5, hh);
      shape.lineTo(hw, 0.0);
      shape.lineTo(hw * 0.62, -hh);
      shape.lineTo(-hw * 0.62, -hh);
      shape.lineTo(-hw, 0.0);
      shape.closePath();
    } else if (sLower.includes("cat-eye") || sLower.includes("cateye")) {
      const r = w * 0.28;
      shape.moveTo(-w + r, -h);
      shape.lineTo(w - r, -h);
      shape.quadraticCurveTo(w, -h, w * 1.06, -h * 0.3);
      shape.lineTo(w * 1.12, h * 1.08);
      shape.quadraticCurveTo(w * 0.75, h * 1.05, 0, h * 0.92);
      shape.lineTo(-w * 0.75, h * 0.92);
      shape.quadraticCurveTo(-w, h * 0.75, -w, -h * 0.3);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);
    } else if (sLower.includes("oval") || sLower.includes("round")) {
      shape.absellipse(0, 0, w, h * 1.05, 0, Math.PI * 2, true, 0);
    } else if (sLower.includes("browline") || sLower.includes("clubmaster")) {
      const r = w * 0.22;
      shape.moveTo(-w + r, -h);
      shape.lineTo(w - r, -h);
      shape.quadraticCurveTo(w, -h, w, 0);
      shape.lineTo(w, h * 0.98);
      shape.lineTo(-w, h * 0.98);
      shape.lineTo(-w, 0);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);
    } else {
      // Classic Square / Rectangular with smooth luxury bevel
      const r = Math.min(w, h) * 0.35;
      shape.moveTo(-w + r, -h);
      shape.lineTo(w - r, -h);
      shape.quadraticCurveTo(w, -h, w, -h + r);
      shape.lineTo(w, h - r);
      shape.quadraticCurveTo(w, h, w - r, h);
      shape.lineTo(-w + r, h);
      shape.quadraticCurveTo(-w, h, -w, h - r);
      shape.lineTo(-w, -h + r);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);
    }

    return shape;
  }

  function createRimMesh(cx: number) {
    const rimGroup = new THREE.Group();
    const shape = buildRimShape(style, halfW, halfH);

    const points = shape.getPoints(48);
    const path3D = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      path3D.add(
        new THREE.LineCurve3(
          new THREE.Vector3(points[i].x, points[i].y, 0),
          new THREE.Vector3(points[i + 1].x, points[i + 1].y, 0)
        )
      );
    }
    path3D.add(
      new THREE.LineCurve3(
        new THREE.Vector3(points[points.length - 1].x, points[points.length - 1].y, 0),
        new THREE.Vector3(points[0].x, points[0].y, 0)
      )
    );

    const isMetalStyle = style.toLowerCase().includes("metal") || style.toLowerCase().includes("round");
    const activeMat = isMetalStyle ? metalMat : frameMat;

    const tubeGeo = new THREE.TubeGeometry(path3D, 72, tubeRadius, 10, true);
    const rimMesh = new THREE.Mesh(tubeGeo, activeMat);
    rimGroup.add(rimMesh);

    // Browline extra luxury top acetate bar
    if (style.toLowerCase().includes("browline") || style.toLowerCase().includes("clubmaster")) {
      const topBarGeo = new THREE.BoxGeometry(halfW * 2.05, 0.038, 0.024);
      const topBarMesh = new THREE.Mesh(topBarGeo, frameMat);
      topBarMesh.position.set(0, halfH * 0.98, 0.004);
      rimGroup.add(topBarMesh);
    }

    // Optical Lens
    const lensGeo = new THREE.ShapeGeometry(shape, 32);
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.z = 0.001;
    rimGroup.add(lensMesh);

    rimGroup.position.x = cx;
    return rimGroup;
  }

  const eyeOffset = bridgeW / 2 + halfW;

  // ── Left Rim & Right Rim ───────────────────────────────────────────────────
  const leftRim = createRimMesh(eyeOffset);
  const rightRim = createRimMesh(-eyeOffset);
  root.add(leftRim);
  root.add(rightRim);

  // ── Delicate Metal Bridge ──────────────────────────────────────────────────
  const bridgeCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-bridgeW * 0.52, halfH * 0.15, 0.003),
    new THREE.Vector3(0, halfH * 0.38, 0.016),
    new THREE.Vector3(bridgeW * 0.52, halfH * 0.15, 0.003)
  );
  const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 20, 0.008, 8, false);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, metalMat);
  root.add(bridgeMesh);

  // ── Nose Pads (Bantalan Hidung Silikon Tipis) ──────────────────────────────
  [-1, 1].forEach((side) => {
    const px = side * (bridgeW * 0.44);
    const padArmCurve = new THREE.LineCurve3(
      new THREE.Vector3(px, 0.01, 0),
      new THREE.Vector3(px * 0.85, -0.045, -0.035)
    );
    const armGeo = new THREE.TubeGeometry(padArmCurve, 8, 0.0035, 6, false);
    const armMesh = new THREE.Mesh(armGeo, metalMat);
    root.add(armMesh);

    const padGeo = new THREE.SphereGeometry(0.015, 10, 10);
    padGeo.scale(0.7, 1.4, 0.5);
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(px * 0.85, -0.045, -0.038);
    padMesh.rotation.y = side * 0.35;
    root.add(padMesh);
  });

  // ── Sleek Luxury Temples (Tangkai Kacamata 3D Ramping) ─────────────────────
  [-1, 1].forEach((side) => {
    const startX = side * (eyeOffset + halfW * 0.98);
    const startY = halfH * 0.32;
    const startZ = 0;

    // Small Gold/Silver Hinge Accent
    const hingeGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.024, 10);
    const hingeMesh = new THREE.Mesh(hingeGeo, metalMat);
    hingeMesh.position.set(startX, startY, startZ - 0.006);
    root.add(hingeMesh);

    // Temple curve extending horizontally straight back towards ears
    const templeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(startX + side * 0.012, startY, -templeLength * 0.30),
      new THREE.Vector3(startX + side * 0.006, startY - 0.005, -templeLength * 0.65),
      new THREE.Vector3(startX - side * 0.015, startY - 0.05, -templeLength * 0.90), // ear bend
      new THREE.Vector3(startX - side * 0.025, startY - 0.12, -templeLength * 1.02), // temple tip
    ]);

    const templeGeo = new THREE.TubeGeometry(templeCurve, 40, 0.0085, 8, false);
    const templeMesh = new THREE.Mesh(templeGeo, frameMat);
    root.add(templeMesh);

    // Metal accent band near hinge
    const accentGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.015, 8);
    const accentMesh = new THREE.Mesh(accentGeo, metalMat);
    accentMesh.position.set(startX + side * 0.008, startY, -0.04);
    accentMesh.rotation.x = Math.PI / 2;
    root.add(accentMesh);
  });

  return root;
}
