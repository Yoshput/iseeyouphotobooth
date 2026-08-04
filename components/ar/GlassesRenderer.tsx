"use client";

/**
 * GlassesRenderer.tsx · Three.js AR glasses overlay
 *
 * Upgraded with 3D lighting:
 * - AmbientLight (soft fill)
 * - DirectionalLight from top-left (key light for 3D depth)
 * - Uses MeshStandardMaterial so lights actually affect appearance
 * - Subtle y-tilt based on head roll for added depth illusion
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { computeGlassesAnchor } from "@/lib/landmarks";
import { computeCoverTransform, videoPxToContainerPx } from "@/lib/videoCover";

export interface GlassesRendererHandle {
 updateFromResult: (result: FaceLandmarkerResult) => void;
 canvas: HTMLCanvasElement | null;
}

interface Props {
 width: number;
 height: number;
 videoWidth: number;
 videoHeight: number;
 glassesSrc: string;
 fitWidthRatio: number;
 maxFaces?: number;
}

const GlassesRenderer = forwardRef<GlassesRendererHandle, Props>(
 function GlassesRenderer(
 { width, height, videoWidth, videoHeight, glassesSrc, fitWidthRatio, maxFaces = 4 },
 ref
 ) {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const sceneRef = useRef<THREE.Scene | null>(null);
 const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
 const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
 const meshesRef = useRef<THREE.Mesh[]>([]);
 // Real per-asset aspect ratio (height/width), read from the actual PNG once
 // loaded. A hardcoded guess here was the main reason glasses looked
 // squished/misaligned — every asset has a different crop, so this MUST be
 // measured, never assumed. 0.36 is just a placeholder until the real
 // image loads (~1 frame).
 const aspectRef = useRef(0.36);

 // ── Build / rebuild scene whenever viewport size changes ──────────────────
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
 // Enable shadow-like rendering
 renderer.shadowMap.enabled = false;
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = 1.1;

 // ── Lighting for 3D depth illusion ──────────────────────────────────────
 // Ambient: soft fill so dark areas aren't pitch black
 const ambient = new THREE.AmbientLight(0xffffff, 0.85);
 scene.add(ambient);

 // Key light: top-left, angled down — creates highlights on lenses/frame
 const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
 keyLight.position.set(-width * 0.3, height * 0.5, 8);
 scene.add(keyLight);

 // Fill light: right side, softer
 const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.35);
 fillLight.position.set(width * 0.3, -height * 0.2, 5);
 scene.add(fillLight);

 // Rim light: from below-right for lens glare effect
 const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
 rimLight.position.set(width * 0.2, -height * 0.4, 4);
 scene.add(rimLight);

 // ── Load texture + create meshes ────────────────────────────────────────
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
 // Use MeshStandardMaterial (PBR) — responds to lights unlike MeshBasicMaterial
 const material = new THREE.MeshStandardMaterial({
 map: texture,
 transparent: true,
 roughness: 0.35, // semi-glossy (like plastic/metal frames)
 metalness: 0.15, // slight metallic sheen
 side: THREE.FrontSide,
 });
 const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
 mesh.visible = false;
 scene.add(mesh);
 meshes.push(mesh);
 }

 sceneRef.current = scene;
 cameraRef.current = camera;
 rendererRef.current = renderer;
 meshesRef.current = meshes;

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

 // ── Swap texture when glasses type changes ────────────────────────────────
 useEffect(() => {
 if (!meshesRef.current.length) return;
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
 }, [glassesSrc]);

 useImperativeHandle(ref, () => ({
 canvas: canvasRef.current,
 updateFromResult(result: FaceLandmarkerResult) {
 const scene = sceneRef.current;
 const camera = cameraRef.current;
 const renderer = rendererRef.current;
 const meshes = meshesRef.current;
 if (!scene || !camera || !renderer || !videoWidth || !videoHeight) return;

 const transform = computeCoverTransform(videoWidth, videoHeight, width, height);
 const faces = result.faceLandmarks ?? [];

 meshes.forEach((mesh, i) => {
 const landmarks = faces[i];
 if (!landmarks) { mesh.visible = false; return; }

 const anchor = computeGlassesAnchor(landmarks, videoWidth, videoHeight);
 const centerVideoPx = {
 x: anchor.centerNormalized.x * videoWidth,
 y: anchor.centerNormalized.y * videoHeight,
 };
 const centerContainerPx = videoPxToContainerPx(centerVideoPx, transform);

 const sceneX = centerContainerPx.x - width / 2;
 const sceneY = -(centerContainerPx.y - height / 2);

 const glassesWidth = anchor.eyeSpanPx * transform.scale * fitWidthRatio;
 const aspect = aspectRef.current; // measured from the real PNG, not guessed

 mesh.position.set(sceneX, sceneY, 0);

 // Z-rotation follows head roll
 mesh.rotation.z = -anchor.roll;

 // Subtle X-rotation based on roll adds 3D tilt depth illusion
 // (small angle: max ~10 degrees at extreme roll)
 mesh.rotation.x = anchor.roll * 0.18;

 // Slight Y-rotation based on horizontal position relative to center
 // simulates perspective when face is off-center
 const xNorm = (anchor.centerNormalized.x - 0.5) * 2; // -1 to +1
 mesh.rotation.y = -xNorm * 0.12;

 mesh.scale.set(glassesWidth, glassesWidth * aspect, 1);
 mesh.visible = true;
 });

 renderer.render(scene, camera);
 },
 }));

 return <canvas ref={canvasRef} width={width} height={height} />;
 }
);

export default GlassesRenderer;
