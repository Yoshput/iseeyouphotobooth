"use client";

/**
 * GlassesRenderer.tsx · Three.js AR glasses overlay
 *
 * SCALING FORMULA (single-factor, no double-counting):
 *
 *   ipdPx         = anchor.ipdNorm × videoWidth × coverScale
 *                 = outer-eye-span converted to CSS pixels on the canvas
 *
 *   glassesWidthPx = ipdPx × ipdScaleRef
 *
 * ipdScaleRef is the ONLY multiplier — it expresses "frame width / IPD".
 * fitWidthRatio is NOT used in the scale calculation; it is kept in the
 * manifest only for legacy reference. Using both would double-count.
 *
 * EMA SMOOTHING (delta-time aware):
 *   alpha = 1 - exp(-deltaTime / 80ms)
 *   Consistent smoothing at 20-60 fps.
 *
 * DEBUG: set SCALE_DEBUG = true to log values to console (every 60 frames).
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  computeGlassesAnchor,
  applyEMA,
  emaAlpha,
  clampScale,
  type EMAState,
} from "@/lib/landmarks";
import { computeCoverTransform, videoPxToContainerPx } from "@/lib/videoCover";

export interface GlassesRendererHandle {
  updateFromResult: (result: FaceLandmarkerResult, deltaTime?: number) => void;
  canvas: HTMLCanvasElement | null;
}

interface Props {
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
  glassesSrc: string;
  fitWidthRatio: number;
  /** Per-model frame-width ÷ IPD calibration ratio (from manifest.ipdScaleRef). */
  ipdScaleRef?: number;
  maxFaces?: number;
}

/** EMA states for one face slot. */
interface FaceEMASlot {
  x:     EMAState;
  y:     EMAState;
  scale: EMAState;
  roll:  EMAState;
}

function makeFaceSlot(): FaceEMASlot {
  return {
    x:     { value: 0, initialized: false },
    y:     { value: 0, initialized: false },
    scale: { value: 0, initialized: false },
    roll:  { value: 0, initialized: false },
  };
}

/** EMA time constant — 80ms gives stable smoothing at 20-60fps. */
const TAU_MS = 80;

/**
 * Set to true to enable per-frame scale diagnostics in the browser console
 * (logs once every 60 frames for face slot 0 only).
 * Keep false in production.
 */
const SCALE_DEBUG = true;

const GlassesRenderer = forwardRef<GlassesRendererHandle, Props>(
  function GlassesRenderer(
    {
      width,
      height,
      videoWidth,
      videoHeight,
      glassesSrc,
      fitWidthRatio,
      ipdScaleRef = 1.5,
      maxFaces = 4,
    },
    ref
  ) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const sceneRef     = useRef<THREE.Scene | null>(null);
    const cameraRef    = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
    const meshesRef    = useRef<THREE.Mesh[]>([]);
    // Per-asset aspect ratio (height/width) read from the real PNG once loaded.
    const aspectRef    = useRef(0.36);
    // Per-face EMA state slots
    const emaSlots     = useRef<FaceEMASlot[]>([]);
    // Counter for throttled debug logging
    const debugFrameCounter = useRef(0);


    // ── Build / rebuild scene whenever viewport size changes ──────────────
    useEffect(() => {
      if (!canvasRef.current || width === 0 || height === 0) return;

      const scene = new THREE.Scene();

      const camera = new THREE.OrthographicCamera(
        -width / 2, width / 2, height / 2, -height / 2, 0.1, 20
      );
      camera.position.z = 10;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      // ── Lighting ──────────────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
      keyLight.position.set(-width * 0.3, height * 0.5, 8);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.35);
      fillLight.position.set(width * 0.3, -height * 0.2, 5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
      rimLight.position.set(width * 0.2, -height * 0.4, 4);
      scene.add(rimLight);

      // ── Load texture + create meshes ──────────────────────────────────
      const loader = new THREE.TextureLoader();
      const texture = loader.load(glassesSrc, (tex) => {
        const img = tex.image as HTMLImageElement;
        if (img?.width && img?.height) {
          aspectRef.current = img.height / img.width;
        }
      });
      texture.colorSpace = THREE.SRGBColorSpace;

      const meshes: THREE.Mesh[] = [];
      for (let i = 0; i < maxFaces; i++) {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          roughness: 0.35,
          metalness: 0.15,
          side: THREE.FrontSide,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        mesh.visible = false;
        scene.add(mesh);
        meshes.push(mesh);
      }

      // Initialise / reset EMA slots for each face
      emaSlots.current = Array.from({ length: maxFaces }, makeFaceSlot);

      sceneRef.current    = scene;
      cameraRef.current   = camera;
      rendererRef.current = renderer;
      meshesRef.current   = meshes;

      return () => {
        renderer.dispose();
        meshes.forEach((m) => {
          m.geometry.dispose();
          (m.material as THREE.MeshStandardMaterial).map?.dispose();
          (m.material as THREE.Material).dispose();
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, maxFaces]);

    // ── Swap texture when glasses type changes ────────────────────────────
    useEffect(() => {
      if (!meshesRef.current.length) return;

      // Reset EMA when switching glasses so new frame starts unsmoothed
      emaSlots.current = Array.from({ length: maxFaces }, makeFaceSlot);

      const newTexture = new THREE.TextureLoader().load(glassesSrc, (tex) => {
        const img = tex.image as HTMLImageElement;
        if (img?.width && img?.height) {
          aspectRef.current = img.height / img.width;
        }
      });
      newTexture.colorSpace = THREE.SRGBColorSpace;
      meshesRef.current.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();
        mat.map = newTexture;
        mat.needsUpdate = true;
      });
    }, [glassesSrc, maxFaces]);

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,

      updateFromResult(result: FaceLandmarkerResult, deltaTime = 16.67) {
        const scene    = sceneRef.current;
        const camera   = cameraRef.current;
        const renderer = rendererRef.current;
        const meshes   = meshesRef.current;
        if (!scene || !camera || !renderer || !videoWidth || !videoHeight) return;

        const transform = computeCoverTransform(videoWidth, videoHeight, width, height);
        const faces     = result.faceLandmarks ?? [];
        const alpha     = emaAlpha(deltaTime, TAU_MS);

        meshes.forEach((mesh, i) => {
          const landmarks = faces[i];
          if (!landmarks) {
            mesh.visible = false;
            // Reset slot so next appearance starts fresh (no stale EMA value)
            if (emaSlots.current[i]) {
              emaSlots.current[i] = makeFaceSlot();
            }
            return;
          }

          // Ensure slot exists (guard for hot-reload / edge cases)
          if (!emaSlots.current[i]) {
            emaSlots.current[i] = makeFaceSlot();
          }
          const slot = emaSlots.current[i];

          // ── Anchor in video-pixel space ─────────────────────────────
          const anchor = computeGlassesAnchor(landmarks, videoWidth, videoHeight);

          const centerVideoPx = {
            x: anchor.centerNormalized.x * videoWidth,
            y: anchor.centerNormalized.y * videoHeight,
          };
          const centerContainerPx = videoPxToContainerPx(centerVideoPx, transform);

          const rawSceneX = centerContainerPx.x - width / 2;
          const rawSceneY = -(centerContainerPx.y - height / 2);

          // ── IPD-based scale (authoritative formula) ─────────────────
          // Formula: glassesWidthPx = ipdPx × ipdScaleRef × fitWidthRatio
          //  - ipdPx: outer eye span converted to canvas CSS pixels
          //  - fitWidthRatio: base model fit ratio from manifest (e.g. 1.42 - 1.48)
          //  - ipdScaleRef: per-model fine-tuning calibration multiplier (default ~1.0)
          const ipdPx    = anchor.ipdNorm * videoWidth * transform.scale;
          const rawScale = clampScale(ipdPx * ipdScaleRef * fitWidthRatio);

          // ── Debug logging (SCALE_DEBUG = true logs every 60 frames) ─
          if (SCALE_DEBUG && i === 0) {
            debugFrameCounter.current++;
            if (debugFrameCounter.current % 60 === 0) {
              console.log(
                `[GlassesRenderer Debug]\n` +
                `  ipdNorm        : ${anchor.ipdNorm.toFixed(4)}\n` +
                `  videoWidth     : ${videoWidth}px\n` +
                `  coverScale     : ${transform.scale.toFixed(4)}\n` +
                `  ipdPx          : ${ipdPx.toFixed(2)}px\n` +
                `  ipdScaleRef    : ${ipdScaleRef}\n` +
                `  fitWidthRatio  : ${fitWidthRatio}\n` +
                `  aspectRef      : ${aspectRef.current.toFixed(4)}\n` +
                `  glassesWidthPx : ${rawScale.toFixed(2)}px (rawScale)\n` +
                `  container      : ${width}×${height}px`
              );
            }
          }

          // ── Apply EMA smoothing (all in canvas-pixel / radian space) ─
          const smoothX     = applyEMA(slot.x,     rawSceneX,   alpha);
          const smoothY     = applyEMA(slot.y,      rawSceneY,   alpha);
          const smoothScale = applyEMA(slot.scale,  rawScale,    alpha);
          const smoothRoll  = applyEMA(slot.roll,   anchor.roll, alpha);

          // ── Apply to mesh ────────────────────────────────────────────
          mesh.position.set(smoothX, smoothY, 0);

          mesh.rotation.z = -smoothRoll;
          // Subtle X-rotation from roll creates a 3D depth illusion
          mesh.rotation.x = smoothRoll * 0.18;
          // Slight Y-rotation based on horizontal off-center position
          const xNorm = (anchor.centerNormalized.x - 0.5) * 2; // -1 to +1
          mesh.rotation.y = -xNorm * 0.12;

          const aspect = aspectRef.current;
          mesh.scale.set(smoothScale, smoothScale * aspect, 1);
          mesh.visible = true;
        });

        renderer.render(scene, camera);
      },
    }));

    return <canvas ref={canvasRef} width={width} height={height} />;
  }
);

export default GlassesRenderer;
