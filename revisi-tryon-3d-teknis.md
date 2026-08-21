# Revisi Teknis — Try-On 3D

**Baca dulu sebelum eksekusi:** `AGENT.md` (root project) dan `prd-tryon-3d.md` (satu folder dengan file ini). Dokumen ini adalah brief teknis untuk task spesifik; `AGENT.md` tetap sumber kebenaran untuk aturan umum project.

**Prinsip kerja:** ADDITIVE ONLY. Tidak ada baris di `GlassesRenderer.tsx`, `lib/landmarks.ts`, `lib/videoCover.ts`, atau `lib/mediapipe.ts` yang diubah. Semua pekerjaan ada di file BARU + 2 titik sisipan kecil di file yang sudah ada.

---

## 1. Ringkasan Arsitektur Saat Ini (Konfirmasi dari Kode)

- `hooks/useFaceTracking.ts` menjalankan loop deteksi MediaPipe, callback ke `FaceTracker.tsx` dengan `(result: FaceLandmarkerResult, meta)`.
- `lib/mediapipe.ts` baris 29 & 42: `outputFacialTransformationMatrixes: true` **sudah aktif**. Artinya `result.facialTransformationMatrixes[i].data` (array 16 angka, matriks 4×4 posisi+rotasi+skala kepala per wajah) sudah tersedia di setiap frame — index `i` selaras dengan `result.faceLandmarks[i]`.
- `FaceTracker.tsx` baris ~289-296: pada setiap frame, memanggil `rendererRef.current?.updateFromResult(result, meta.deltaTime)` — `result` yang dikirim adalah objek PENUH dari MediaPipe (bukan cuma landmark), jadi `facialTransformationMatrixes` sudah ikut lewat tanpa perlu perubahan apa pun di titik ini.
- `GlassesRenderer.tsx` mengimplementasikan interface `GlassesRendererHandle { updateFromResult, canvas }`, pakai `THREE.OrthographicCamera` + `PlaneGeometry(1,1)` bertekstur PNG — ini yang disebut render mode "2D" di PRD.
- `public/glasses/manifest.json`: array objek dengan skema `{ id, name, file, fitWidthRatio, ipdScaleRef, style, recommendedFor, color, lensType }`.

## 2. Rencana Perubahan

### 2.1 File BARU

**`components/ar/Glasses3DRenderer.tsx`**
Sibling dari `GlassesRenderer.tsx`, implementasi `GlassesRendererHandle` yang SAMA PERSIS (`updateFromResult`, `canvas`) supaya titik pemanggilan di `FaceTracker.tsx` tidak perlu tahu renderer mana yang aktif di baliknya.

Perbedaan teknis dari `GlassesRenderer.tsx`:

| | `GlassesRenderer.tsx` (2D, existing) | `Glasses3DRenderer.tsx` (BARU) |
|---|---|---|
| Kamera | `THREE.OrthographicCamera` | `THREE.PerspectiveCamera` |
| Geometri | `PlaneGeometry(1,1)` + tekstur PNG | Model `.glb` asli via `GLTFLoader` |
| Sumber posisi/rotasi | `computeGlassesAnchor()` dari landmark mentah (`lib/landmarks.ts`) | `result.facialTransformationMatrixes[i].data` langsung |
| Sumber skala | `fitWidthRatio` × `ipdScaleRef` (rasio, lihat audit Bagian 9) | Dimensi fisik asli (mm) dari `manifest.model3D`, satuan metrik canonical face model MediaPipe |
| Rotasi | Manual: `rotation.z` = roll, `rotation.x`/`rotation.y` = hack kecil "depth illusion" | Penuh: decompose matrix → quaternion asli, ikut yaw/pitch/roll kepala tanpa batas ±sekian derajat |

Kerangka implementasi (ilustratif — sesuaikan ke API Three.js versi `^0.166.0` yang terpasang):

```typescript
"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import type { GlassesRendererHandle } from "./GlassesRenderer"; // reuse interface

interface Props {
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
  model3DSrc: string;      // path ke .glb, dari manifest.model3D.glbFile
  frameWidthMm: number;    // dari manifest.model3D.frameWidthMm
  maxFaces?: number;
}

const Glasses3DRenderer = forwardRef<GlassesRendererHandle, Props>(
  function Glasses3DRenderer({ width, height, videoWidth, videoHeight, model3DSrc, frameWidthMm, maxFaces = 4 }, ref) {
    const canvasRef   = useRef<HTMLCanvasElement>(null);
    const sceneRef    = useRef<THREE.Scene | null>(null);
    const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const modelsRef   = useRef<THREE.Group[]>([]);
    // Smoothing state per wajah — PENTING: smoothing matrix mentah (lerp
    // langsung 16 angka) bisa bikin model skew/distorsi. Decompose dulu ke
    // position/quaternion/scale, smooth masing-masing secara terpisah
    // (position: lerp biasa, quaternion: slerp), baru recompose ke matrix.
    const smoothState = useRef<Array<{
      pos: THREE.Vector3; quat: THREE.Quaternion; scale: THREE.Vector3; init: boolean;
    }>>([]);

    useEffect(() => {
      // setup scene, PerspectiveCamera, WebGLRenderer, lighting rig
      // (boleh reuse konsep 4-light dari GlassesRenderer.tsx: ambient+key+fill+rim,
      //  cuma posisi/intensitas perlu disesuaikan ke ruang perspective, bukan orthographic)
      // ...
      const loader = new GLTFLoader();
      const models: THREE.Group[] = [];
      for (let i = 0; i < maxFaces; i++) {
        loader.load(model3DSrc, (gltf) => {
          const model = gltf.scene.clone();
          model.visible = false;
          // Normalisasi skala model .glb ke frameWidthMm asli SEKALI saat load,
          // supaya di runtime tinggal terapkan transformation matrix apa adanya
          // (skala relatif sudah "benar" secara fisik sejak awal, bukan dihitung
          // ulang tiap frame seperti fitWidthRatio di sistem 2D).
          sceneRef.current?.add(model);
          models[i] = model;
        });
      }
      modelsRef.current = models;
      // cleanup: dispose renderer, traverse & dispose geometry/material tiap model
    }, [width, height, maxFaces, model3DSrc]);

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
      updateFromResult(result: FaceLandmarkerResult, deltaTime = 16.67) {
        const matrices = result.facialTransformationMatrixes ?? [];
        modelsRef.current.forEach((model, i) => {
          const m = matrices[i]?.data;
          if (!model || !m) { if (model) model.visible = false; return; }

          const raw = new THREE.Matrix4().fromArray(m);
          const rawPos = new THREE.Vector3();
          const rawQuat = new THREE.Quaternion();
          const rawScale = new THREE.Vector3();
          raw.decompose(rawPos, rawQuat, rawScale);

          if (!smoothState.current[i]) {
            smoothState.current[i] = {
              pos: rawPos.clone(), quat: rawQuat.clone(), scale: rawScale.clone(), init: true,
            };
          }
          const s = smoothState.current[i];
          const alpha = 1 - Math.exp(-deltaTime / 80); // pola EMA sama seperti lib/landmarks.ts
          s.pos.lerp(rawPos, alpha);
          s.quat.slerp(rawQuat, alpha);   // slerp, BUKAN lerp linear, untuk rotasi
          s.scale.lerp(rawScale, alpha);

          model.position.copy(s.pos);
          model.quaternion.copy(s.quat);
          model.scale.copy(s.scale);
          model.visible = true;
        });
        rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      },
    }));

    return <canvas ref={canvasRef} width={width} height={height} />;
  }
);
export default Glasses3DRenderer;
```

Catatan implementasi kunci yang WAJIB dipertahankan siapa pun yang eksekusi ini:
- **Jangan smoothing matrix 4×4 mentah secara langsung** (lerp per-elemen) — hasilnya distorsi/skewing di sudut ekstrem. Selalu decompose ke position/quaternion/scale dulu, smoothing terpisah, baru pakai.
- Skala fisik model 3D idealnya dinormalisasi SEKALI saat asset diimpor/di-load (disesuaikan ke `frameWidthMm` asli), bukan dihitung ulang tiap frame — ini yang bikin sistem 3D otomatis tidak butuh padanan `fitWidthRatio`/`ipdScaleRef` sama sekali, dan otomatis menghindari kelas bug double-counting yang sudah terjadi di sistem 2D (lihat audit Bagian 9).

### 2.2 File DIMODIFIKASI (minimal, terisolasi)

**`components/ar/FaceTracker.tsx`**
- Tambah prop opsional: `renderMode?: "2d" | "3d"` (default `"2d"` — nol perubahan perilaku kalau prop ini tidak diisi oleh siapa pun yang belum tahu fitur baru).
- Tambah prop terkait: `model3DSrc?: string`, `frameWidthMm?: number` (diteruskan ke `Glasses3DRenderer` saja).
- Di JSX (sekitar baris 458-472, blok "Glasses overlay"): render `<GlassesRenderer>` ATAU `<Glasses3DRenderer>` berdasarkan `renderMode`, TIDAK dua-duanya sekaligus. Titik pemanggilan `rendererRef.current?.updateFromResult(...)` di baris ~294 **tidak berubah sama sekali** karena kedua renderer implement handle interface yang identik.

**`app/photobooth/page.tsx`**
- Tambah state: `const [renderMode3D, setRenderMode3D] = useState(false);`
- Tambah toggle UI baru, TEPAT mengikuti pola toggle "AI Mulus" yang sudah ada di baris ~1260 (pill button, className kondisional pakai token `isy-green-bright`/`isy-green-deep` dari `design.md` — JANGAN pakai warna baru di luar itu). Toggle ini hanya muncul/aktif kalau `glasses.model3D` ada isinya untuk model yang sedang dipilih.
- Kalau user ganti ke model yang `model3D`-nya kosong sementara `renderMode3D === true` → otomatis `setRenderMode3D(false)` (fallback diam-diam ke 2D, bukan state error).

### 2.3 Schema `manifest.json` (Backward-Compatible)

Tambah field OPSIONAL `model3D` per entry. Entry lama tanpa field ini tetap 100% valid apa adanya (2D-only):

```json
{
  "id": "hero-glasses-black",
  "name": "...",
  "file": "hero-glasses-black.png",
  "fitWidthRatio": 1.45,
  "ipdScaleRef": 1.0,
  "style": "...",
  "recommendedFor": [...],
  "color": "#000000",
  "lensType": "open",
  "model3D": {
    "glbFile": "hero-glasses-black.glb",
    "frameWidthMm": 138,
    "bridgeMm": 18,
    "templeMm": 145
  }
}
```

`frameWidthMm`/`bridgeMm`/`templeMm` diambil dari kode ukuran fisik yang tercetak di gagang kacamata asli (format standar industri `lebar□jembatan-gagang`, mis. `52□18-140` → 52+2×18≈ lebar total 138mm — ini beda konsep dari `fitWidthRatio`/`ipdScaleRef` yang murni rasio visual, bukan ukuran fisik nyata).

## 3. Batasan / Jangan Lakukan

Mengutip & menambahkan dari `AGENT.md` yang sudah ada:

- **Jangan** ubah satu baris pun di `GlassesRenderer.tsx`, `lib/landmarks.ts`, `lib/videoCover.ts`, `lib/mediapipe.ts` — arsitektur ini ditandai "final" oleh project owner.
- **Jangan** hapus/ubah field `fitWidthRatio`/`ipdScaleRef` di entry manifest yang sudah ada — sistem 2D tetap jalan dengan nilai itu.
- **Jangan** kirim frame video atau data wajah ke server manapun — model `.glb` dimuat dari `/public` (statis, lokal), sama seperti PNG sekarang, tidak ada permukaan privasi baru.
- **Jangan** tambah dependency SDK AR berbayar (Banuba dkk) — `three` sudah ada di `package.json` (`^0.166.0`), `GLTFLoader` bagian dari `three/examples/jsm`, tidak perlu paket baru.
- **Jangan** pakai tema warna di luar `isy-green-deep`/`isy-green-bright`/`isy-mist` dari `design.md`.
- Kalau tergoda menyatukan sistem skala 2D dan 3D jadi satu — **jangan**, itu di luar scope dan berisiko mengulang histori bug sizing yang sudah pernah terjadi (audit Bagian 9.4).

## 4. Rencana Testing

Mengikuti proses yang sudah pernah dijalani tim ini sendiri (lihat `revisi-photobooth-iseeyou-2026-08-12.md`) — kalibrasi/scaling AR WAJIB ditest di device fisik, tidak bisa ditebak dari kode saja:

- [ ] Load-test di minimal 2 device Android kelas menengah — bandingkan FPS mode 2D vs mode 3D di model kacamata yang sama.
- [ ] Uji rotasi kepala penuh (kiri-kanan, atas-bawah) sampai ±45° — model 3D harus tetap menempel, tidak pecah/melayang/hilang.
- [ ] Toggle 2D↔3D bolak-balik minimal 10× berturut-turut — pastikan tidak ada memory leak (cek `dispose()` geometry/material/texture di setiap unmount/swap) dan kamera tidak re-init.
- [ ] Regression check: screenshot mode 2D untuk seluruh 10 model SEBELUM & SESUDAH task ini, bandingkan — harus identik piksel (tidak ada perubahan tak sengaja).
- [ ] Uji `captureFrame()` (tombol "Try On & Ambil Foto") di mode 3D — pastikan hasil foto menyertakan render 3D dengan benar (fungsi ini generic terhadap canvas apa pun yang aktif di `rendererRef.current.canvas`, harusnya otomatis bekerja, tapi tetap wajib dicek langsung).

## 5. Task Breakdown

1. Siapkan 1 file `.glb` percobaan (boleh model generik sementara untuk uji arsitektur, sebelum aset asli hasil scan/lisensi siap — lihat `prd-tryon-3d.md` §9).
2. Bangun `Glasses3DRenderer.tsx` sesuai kerangka §2.1, test render statis dulu (belum terhubung ke tracking) — pastikan model tampil, terang, proporsional.
3. Hubungkan ke `facialTransformationMatrixes`, uji smoothing (decompose + slerp, BUKAN lerp matrix mentah).
4. Sisipkan prop `renderMode` di `FaceTracker.tsx`, uji switching 2D↔3D via prop dulu (hardcode true/false) sebelum bikin UI toggle-nya.
5. Tambah field `model3D` di 1 entry manifest sebagai percobaan, tambah toggle UI di `page.tsx` mengikuti pola existing.
6. Jalankan seluruh checklist §4 di device fisik.
7. Setelah lolos semua, tambahkan ringkasan perubahan ke bagian `## UPDATE` di `AGENT.md` (pola yang sama seperti revisi-revisi sebelumnya), termasuk mencatat model mana saja yang sudah punya versi 3D — supaya sesi kerja berikutnya tahu tanpa harus baca ulang seluruh kode.
