"use client";

/**
 * components/ar/Glasses3DRenderer.tsx -- v3 (stable)
 *
 * Camera  : OrthographicCamera -- 1 unit = 1 CSS pixel, pixel-perfect anchor/scale.
 * Rotation: Euler from landmark Z-depth -> Quaternion -> SLERP smoothing.
 *           No gimbal lock, no jitter on fast head turns.
 * Anchor  : 50% eye-midY + 50% nose-bridge Y, then + ipdNorm*Y_OFFSET_FACTOR(0.22)
 *           -> glasses sit at pupil / nose-pad level exactly.
 * Scale   : ipdNorm = Math.abs(rightEye.x - leftEye.x) -- horizontal only, no hypot.
 * Temple  : Per-material clipping planes clip outer 35% of temple arms.
 *
 * DO NOT change rotation logic (computePoseEuler / slerpEMA / quaternion apply).
 * DO NOT change anchor/scale logic (blendedAnchorY / Y_OFFSET_FACTOR / ipdNorm).
 * Tune per-model appearance via manifest.json fields only.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import type { GlassesRendererHandle } from "./GlassesRenderer";
import {
  applyEMA,
  emaAlpha,
  clampScale,
  Y_OFFSET_FACTOR,
  type EMAState,
} from "@/lib/landmarks";
import { computeCoverTransform, videoPxToContainerPx } from "@/lib/videoCover";

const TAU_MS = 60;
const SCALE_DEBUG = true;

interface Props {
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
  model3DSrc?: string;
  frameWidthMm?: number;
  bridgeMm?: number;
  templeMm?: number;
  frameColor?: string;
  metalColor?: string;
  isTinted?: boolean;
  style?: string;
  fitWidthRatio?: number;
  ipdScaleRef?: number;
  yOffsetRatio?: number;
  maxFaces?: number;
  pivotOffset?: { x: number; y: number; z: number };
  rotationOffsetDeg?: { x: number; y: number; z: number };
  templeFadeStart?: number;
}

interface Face3DEMASlot {
  x: EMAState;
  y: EMAState;
  scale: EMAState;
  qw: EMAState;
  qx: EMAState;
  qy: EMAState;
  qz: EMAState;
}

function make3DSlot(): Face3DEMASlot {
  return {
    x:     { value: 0, initialized: false },
    y:     { value: 0, initialized: false },
    scale: { value: 0, initialized: false },
    qw:    { value: 1, initialized: false },
    qx:    { value: 0, initialized: false },
    qy:    { value: 0, initialized: false },
    qz:    { value: 0, initialized: false },
  };
}

function computePoseEuler(
  lm: Array<{ x: number; y: number; z?: number }>,
  videoW: number,
  videoH: number
): { pitch: number; yaw: number; roll: number } {
  const leftEye    = lm[33];
  const rightEye   = lm[263];
  const leftCheek  = lm[234];
  const rightCheek = lm[454];
  const forehead   = lm[10];
  const chin       = lm[152];

  const roll = Math.atan2(
    (rightEye.y - leftEye.y) * videoH,
    (rightEye.x - leftEye.x) * videoW
  );
  const yaw = (leftCheek && rightCheek)
    ? ((rightCheek.z ?? 0) - (leftCheek.z ?? 0)) * 1.8
    : 0;
  const pitch = (forehead && chin)
    ? -((chin.z ?? 0) - (forehead.z ?? 0)) * 1.8
    : 0;

  return { pitch, yaw, roll };
}

function slerpEMA(
  slot: Pick<Face3DEMASlot, "qw" | "qx" | "qy" | "qz">,
  q: THREE.Quaternion,
  alpha: number
): THREE.Quaternion {
  if (!slot.qw.initialized) {
    slot.qw.value = q.w; slot.qw.initialized = true;
    slot.qx.value = q.x; slot.qx.initialized = true;
    slot.qy.value = q.y; slot.qy.initialized = true;
    slot.qz.value = q.z; slot.qz.initialized = true;
    return q.clone();
  }
  const prev = new THREE.Quaternion(slot.qx.value, slot.qy.value, slot.qz.value, slot.qw.value);
  prev.slerp(q, alpha);
  slot.qw.value = prev.w;
  slot.qx.value = prev.x;
  slot.qy.value = prev.y;
  slot.qz.value = prev.z;
  return prev;
}

const Glasses3DRenderer = forwardRef<GlassesRendererHandle, Props>(
  function Glasses3DRenderer(
    {
      width, height, videoWidth, videoHeight,
      model3DSrc,
      frameWidthMm = 138, bridgeMm = 18, templeMm = 140,
      frameColor = "#1a1a1a", metalColor = "#d4af37",
      isTinted = false, style = "Square",
      fitWidthRatio = 1.45, ipdScaleRef = 1.0, yOffsetRatio = 0,
      maxFaces = 4,
      pivotOffset, rotationOffsetDeg, templeFadeStart = 0.65,
    },
    ref
  ) {
    const canvasRef   = useRef<HTMLCanvasElement>(null);
    const sceneRef    = useRef<THREE.Scene | null>(null);
    const cameraRef   = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const modelsRef   = useRef<THREE.Group[]>([]);
    const originalModelsRef = useRef<THREE.Group[]>([]);
    const emaSlots    = useRef<Face3DEMASlot[]>([]);
    const ewaWarmupRef = useRef<number[]>([]);

    useEffect(() => {
      if (!canvasRef.current || width === 0 || height === 0) return;
      const canvas = canvasRef.current;
      const scene  = new THREE.Scene();
      sceneRef.current = scene;

      // OrthographicCamera: 1 unit = 1 CSS pixel (pixel-perfect mapping)
      const camera = new THREE.OrthographicCamera(
        -width / 2, width / 2, height / 2, -height / 2, -2000, 2000
      );
      camera.position.set(0, 0, 500);
      cameraRef.current = camera;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas, alpha: true, antialias: true,
          powerPreference: "high-performance", preserveDrawingBuffer: true,
        });
      } catch (err) {
        console.warn("Glasses3DRenderer WebGL init failed:", err);
        return;
      }
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.localClippingEnabled = true;
      rendererRef.current = renderer;

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      scene.environment = envTexture;

      scene.add(new THREE.AmbientLight(0xffffff, 1.4));
      const kl = new THREE.DirectionalLight(0xffffff, 2.4); kl.position.set(200, 300, 400); scene.add(kl);
      const fl = new THREE.DirectionalLight(0xf0fdf4, 1.2); fl.position.set(-250, -50, 300); scene.add(fl);
      const rl = new THREE.DirectionalLight(0xffffff, 1.5); rl.position.set(0, 400, -300); scene.add(rl);

      const models: THREE.Group[] = [];
      const slots:  Face3DEMASlot[] = [];
      for (let i = 0; i < maxFaces; i++) {
        slots.push(make3DSlot());
        ewaWarmupRef.current.push(0);
        const g = new THREE.Group(); g.visible = false; scene.add(g); models.push(g);
      }
      modelsRef.current = models;
      emaSlots.current  = slots;

      if (model3DSrc && (model3DSrc.endsWith(".glb") || model3DSrc.endsWith(".gltf"))) {
        const loader = new GLTFLoader();
        loader.load(model3DSrc, (gltf) => {
          const rawModel = gltf.scene;
          const box1 = new THREE.Box3().setFromObject(rawModel);
          const cen1 = new THREE.Vector3(); box1.getCenter(cen1);
          if ((box1.max.z - cen1.z) > (cen1.z - box1.min.z) * 1.5) rawModel.rotation.y = Math.PI;

          const box2 = new THREE.Box3().setFromObject(rawModel);
          const size2 = new THREE.Vector3(); const cen2 = new THREE.Vector3();
          box2.getSize(size2); box2.getCenter(cen2);

          const po = pivotOffset ?? { x: 0, y: 0, z: 0 };
          const pivot = new THREE.Group();
          rawModel.position.set(-cen2.x + po.x, -cen2.y + po.y, -box2.max.z + po.z);
          pivot.add(rawModel);

          const normScale = 1.0 / Math.max(size2.x, 0.001);
          pivot.scale.set(normScale, normScale, normScale);

          // Temple fade: clip at ±(templeFadeStart * 0.5) in normalised local space
          // Model spans -0.5..+0.5 after normScale; 0.65*0.5=0.325 clips outer 35%
          const clipDist = (templeFadeStart > 0 && templeFadeStart < 1)
            ? templeFadeStart * 0.5 : Infinity;
          const templeClip = isFinite(clipDist)
            ? [new THREE.Plane(new THREE.Vector3(-1,0,0), clipDist),
               new THREE.Plane(new THREE.Vector3( 1,0,0), clipDist)]
            : [];

          const wrapper = new THREE.Group();
          wrapper.add(pivot);
          const isTransparent = (model3DSrc ?? "").includes("transparan");

          wrapper.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const meshName = (mesh.name ?? "").toLowerCase();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat: THREE.Material) => {
              const std = mat as THREE.MeshStandardMaterial;
              const matName = (std.name ?? "").toLowerCase();
              const isLens = matName.includes("lens") || matName.includes("glass_52") ||
                matName.includes("glass_glass") || matName.includes("cam") ||
                matName.includes("fingerprint") || matName.includes("material.004") ||
                meshName === "object_41" || meshName === "object_45" ||
                meshName === "object_8" || meshName === "johnny_glasses_cam_0";
              const isNosePad = matName.includes("material_0") ||
                meshName === "object_21" || matName.includes("pad");

              if (isLens) {
                std.transparent = true; std.opacity = isTinted ? 0.70 : 0.12;
                std.roughness = 0.05; std.metalness = 0.05; std.depthWrite = false;
                std.color = new THREE.Color(isTinted ? 0x1a1a1a : 0xffffff);
              } else if (isNosePad) {
                std.transparent = true; std.opacity = 0.70; std.roughness = 0.25;
                std.color = new THREE.Color(0xf1f5f9); std.depthWrite = true;
              } else if (isTransparent && (matName.includes("glasses") || meshName.includes("defaultmaterial"))) {
                std.transparent = true; std.opacity = 0.88;
                std.roughness = 0.10; std.metalness = 0.10; std.depthWrite = true;
                std.clippingPlanes = templeClip;
              } else if (matName.includes("gold") || matName.includes("metal") ||
                         matName.includes("silver") || meshName.includes("metal")) {
                std.metalness = 0.90; std.roughness = 0.18;
                std.clippingPlanes = templeClip;
              } else {
                std.roughness = 0.18; std.metalness = 0.20;
                std.clippingPlanes = templeClip;
              }
              std.needsUpdate = true;
            });
          });

          if (rotationOffsetDeg) {
            wrapper.rotation.x += THREE.MathUtils.degToRad(rotationOffsetDeg.x ?? 0);
            wrapper.rotation.y += THREE.MathUtils.degToRad(rotationOffsetDeg.y ?? 0);
            wrapper.rotation.z += THREE.MathUtils.degToRad(rotationOffsetDeg.z ?? 0);
          }

          originalModelsRef.current.push(wrapper);
          modelsRef.current.forEach((m, idx) => {
            scene.remove(m);
            const clone = wrapper.clone(true);
            clone.visible = false;
            scene.add(clone);
            modelsRef.current[idx] = clone;
          });
        }, undefined, (err: unknown) => {
          console.info("GLB load failed:", (err as any)?.message ?? err);
        });
      }

      renderer.render(scene, camera);

      return () => {
        originalModelsRef.current.forEach(wrapper => {
          wrapper.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const mesh = obj as THREE.Mesh;
              mesh.geometry?.dispose();
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
              } else {
                mesh.material?.dispose();
              }
            }
          });
        });
        originalModelsRef.current = [];

        modelsRef.current.forEach((m) => {
          scene.remove(m);
          m.traverse((obj) => {
            if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
            const mat = (obj as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
            else if (mat) (mat as THREE.Material).dispose();
          });
        });
        roomEnv.dispose();
        pmremGenerator.dispose();
        envTexture.dispose();
        renderer.dispose();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, maxFaces, model3DSrc, frameWidthMm, bridgeMm, templeMm,
        frameColor, metalColor, isTinted, style, templeFadeStart]);

    useImperativeHandle(ref, () => ({
      get canvas() { return canvasRef.current; },

      updateFromResult(result: FaceLandmarkerResult, deltaTime = 16.67) {
        const scene    = sceneRef.current;
        const camera   = cameraRef.current;
        const renderer = rendererRef.current;
        const models   = modelsRef.current;
        if (!scene || !camera || !renderer || !videoWidth || !videoHeight) return;

        const transform = computeCoverTransform(videoWidth, videoHeight, width, height);
        const faces     = result.faceLandmarks ?? [];
        const alpha     = emaAlpha(deltaTime, TAU_MS);

        models.forEach((model, i) => {
          const landmarks = faces[i];
          if (!landmarks) {
            if (model) model.visible = false;
            if (emaSlots.current[i]) emaSlots.current[i] = make3DSlot();
            if (ewaWarmupRef.current[i] !== undefined) ewaWarmupRef.current[i] = 0;
            return;
          }
          if (!emaSlots.current[i]) emaSlots.current[i] = make3DSlot();
          const slot = emaSlots.current[i];

          // A. Anchor -- pupil level (same logic as 2D GlassesRenderer)
          const leftEye    = landmarks[33]  || landmarks[133];
          const rightEye   = landmarks[263] || landmarks[362];
          const noseBridge = landmarks[168] || landmarks[6];
          const eyeMidY    = (leftEye.y + rightEye.y) / 2;

          const anchorX    = noseBridge ? noseBridge.x : (leftEye.x + rightEye.x) / 2;
          // ipdNorm: horizontal only, NO diagonal hypot
          const ipdNorm    = Math.abs(rightEye.x - leftEye.x);
          // 50% eye-mid + 50% nose-bridge, then nudge down by Y_OFFSET_FACTOR=0.22
          const blendedY   = noseBridge ? eyeMidY * 0.5 + noseBridge.y * 0.5 : eyeMidY;
          const anchorY    = blendedY + ipdNorm * Y_OFFSET_FACTOR;

          const centerVideoPx = { x: anchorX * videoWidth, y: anchorY * videoHeight };

          // B. Scale: IPD pixels x fitWidthRatio
          const ipdPx    = ipdNorm * videoWidth * transform.scale;
          const rawScale = clampScale(ipdPx * (ipdScaleRef || 1.0) * fitWidthRatio);

          const ccp       = videoPxToContainerPx(centerVideoPx, transform);
          const rawSceneX = ccp.x - width / 2;
          const rawSceneY = -(ccp.y - height / 2) + (yOffsetRatio || 0) * rawScale;

          // C. EMA position & scale
          const smoothX     = applyEMA(slot.x,    rawSceneX, alpha);
          const smoothY     = applyEMA(slot.y,     rawSceneY, alpha);
          const smoothScale = applyEMA(slot.scale, rawScale,  alpha);

          // D. Rotation: Euler Z-depth -> Quaternion -> SLERP
          const { pitch: rp, yaw: ry, roll: rr } = computePoseEuler(landmarks, videoWidth, videoHeight);
          const rawQuat  = new THREE.Quaternion().setFromEuler(new THREE.Euler(rp, ry, -rr, "YXZ"));
          const smoothQ  = slerpEMA(slot, rawQuat, alpha);

          if (SCALE_DEBUG && i === 0) {
            const eu = new THREE.Euler().setFromQuaternion(smoothQ, "YXZ");
            const d = ((slot as any).__d = ((slot as any).__d || 0) + 1);
            if (d % 60 === 0) console.log(`[G3D] scale:${smoothScale.toFixed(0)} yaw:${(eu.y*57.3).toFixed(1)} pitch:${(eu.x*57.3).toFixed(1)}`);
          }

          // E. Apply
          model.position.set(smoothX, smoothY, 0);
          model.quaternion.copy(smoothQ);
          model.scale.set(smoothScale, smoothScale, smoothScale);
          
          ewaWarmupRef.current[i] = (ewaWarmupRef.current[i] || 0) + 1;
          if (ewaWarmupRef.current[i] < 5) {
            model.visible = false;
          } else {
            model.visible = true;
          }
        });

        renderer.render(scene, camera);
      },
    }), [fitWidthRatio, height, ipdScaleRef, videoHeight, videoWidth, width, yOffsetRatio]);

    return (
      <canvas ref={canvasRef} width={width} height={height}
        className="pointer-events-none absolute inset-0 h-full w-full" />
    );
  }
);

export default Glasses3DRenderer;