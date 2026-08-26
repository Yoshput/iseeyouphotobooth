# ROTATION-FIX-SUMMARY.md
# AR Try-On 3D — Perbaikan Rotasi Kacamata (Gagang Mengikuti Kepala)

**Tanggal:** 2026-08-25  
**Status:** ✅ Build berhasil, 0 TypeScript errors

---

## Masalah yang Diperbaiki

Gagang (temple arm) kacamata 3D konsisten "mengambang" ke arah pipi/udara,
tidak mengikuti orientasi kepala — terutama saat kepala menoleh atau mendongak.
Ini terjadi di **semua** model GLB, bukan 1-2 aset.

**Akar masalah:**
- Rotasi sebelumnya dihitung manual dari Z-depth landmark 2D (yaw via `dzCheeks`, pitch via `dzHead`) → tidak akurat, terutama untuk yaw
- Menggunakan `OrthographicCamera` → tidak ada perspektif depth, gagang terlihat datar
- Tidak ada temple fade → gagang rigid terlihat "meleset" dari telinga

---

## File yang Diubah

### 1. `components/ar/Glasses3DRenderer.tsx` — Rewrite Total (v3)

**Perubahan kunci:**

#### ① Sumber Rotasi: `facialTransformationMatrixes` → Quaternion
```ts
// SEBELUM (v2): Euler manual dari landmark Z-depth
const { pitch, yaw, roll } = compute3DPose(landmarks, videoWidth, videoHeight);
model.rotation.set(pitch, yaw, -roll, "YXZ");

// SESUDAH (v3): Matrix 4×4 dari MediaPipe → Quaternion langsung
const matData = result.facialTransformationMatrixes[i]?.data;
const rawQuat = matrixToQuaternion(matData); // column-major → THREE.Quaternion
const smoothQuat = slerpEMA(slot, rawQuat, alpha); // SLERP, bukan Euler lerp
model.quaternion.copy(smoothQuat);
```

MediaPipe sudah menghitung 6DOF head pose (posisi X/Y/Z + rotasi yaw/pitch/roll penuh) di ruang kamera — jauh lebih akurat dari rekonstruksi manual landmark Z.

**Mirror fix:** `quat.y = -quat.y` untuk mengimbangi CSS `-scaleX` pada video feed.

#### ② SLERP Quaternion Smoothing (menggantikan EMA per-Euler-axis)
```ts
function slerpEMA(slot, q, alpha): THREE.Quaternion {
  // Gunakan THREE.Quaternion.slerp() bukan lerp per-komponen
  // → tidak ada gimbal lock, tidak ada jitter saat kepala menoleh cepat
  prev.slerp(q, alpha);
}
```

#### ③ PerspectiveCamera (menggantikan OrthographicCamera)
```ts
// SEBELUM: OrthographicCamera — tidak ada depth perspective
const camera = new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, -2000, 2000);

// SESUDAH: PerspectiveCamera — FOV dari focal length virtual 1000px
const FOCAL_PX = 1000;
const vFovDeg  = (2 * Math.atan(height / 2 / FOCAL_PX) * 180) / Math.PI;
const camera   = new THREE.PerspectiveCamera(vFovDeg, width / height, 1, 5000);
camera.position.set(0, 0, FOCAL_PX);
```

Dengan PerspectiveCamera, gagang yang menjauh dari kamera akan tampak lebih pendek secara visual (foreshortening) — persis seperti kacamata fisik.

#### ④ Temple Fade (clipping plane)
```ts
// Potong gagang di 65% panjangnya (configurable via templeFadeStart prop)
const clipDist = size2.x * normScale * templeFadeStart; // ~0.65
const clipPlaneRight = new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipDist);
const clipPlaneLeft  = new THREE.Plane(new THREE.Vector3( 1, 0, 0), clipDist);
// Diterapkan ke material gagang via clippingPlanes[]
renderer.localClippingEnabled = true; // wajib aktif
```

Gagang hanya dirender sampai 65% panjangnya → bagian ujung yang tidak bisa menyentuh telinga secara presisi disembunyikan.

#### ⑤ Per-model Props Baru
```ts
pivotOffset?:       { x, y, z }   // koreksi origin pivot (Three.js units)
rotationOffsetDeg?: { x, y, z }   // fine-tune rotasi per-model (derajat)
templeFadeStart?:   number         // 0–1, fraksi panjang gagang yang visible
```

---

### 2. `components/ar/FaceTracker.tsx`

- Ditambahkan `pivotOffset`, `rotationOffsetDeg`, `templeFadeStart` ke Props interface
- Diteruskan ke `<Glasses3DRenderer />` di JSX render

---

### 3. `app/photobooth/page.tsx`

- `Model3DMeta` interface diperluas dengan `pivotOffset`, `rotationOffsetDeg`, `templeFadeStart`
- `<FaceTracker />` call diperluas dengan ketiga prop baru dari `glasses.model3D`

---

### 4. `public/glasses/manifest.json`

Ditambahkan field baru ke setiap entri `model3D`:
```json
{
  "pivotOffset": { "x": 0, "y": 0, "z": 0 },
  "rotationOffsetDeg": { "x": 0, "y": 0, "z": 0 },
  "templeFadeStart": 0.65
}
```

Nilai default = 0/0/0 dan 0.65. Untuk fine-tune per-model tanpa edit GLB:
- Edit `pivotOffset` jika pivot model tidak di center nose bridge
- Edit `rotationOffsetDeg` jika model sedikit miring
- Edit `templeFadeStart` untuk mengatur seberapa panjang gagang yang tampak (0.5 = setengah, 0.8 = lebih panjang)

---

## Cara Test Manual (QA Checklist)

Buka `http://localhost:3000/try-on` → klik **"Buka Try-On 3D Sekarang"** → pilih kacamata 3D

| # | Kondisi | Yang Diharapkan |
|---|---------|-----------------|
| 1 | **Wajah lurus ke kamera** | Frame + gagang simetris kiri-kanan |
| 2 | **Kepala menoleh ±15° kanan/kiri** | Gagang yang menjauh tampak lebih pendek (foreshortening 3D), frame ikut rotate |
| 3 | **Kepala mendongak/menunduk** | Frame ikut miring ke atas/bawah mengikuti pitch |
| 4 | **Gerakan kepala cepat** | Tidak ada snap/lompatan tiba-tiba (SLERP smooth) |
| 5 | **Ganti ke kacamata berbeda** | Gagang tampak terpotong di ~65% panjang (tidak menjulur keluar frame wajah) |

---

## Debug Mode

Set `SCALE_DEBUG = true` di `components/ar/Glasses3DRenderer.tsx` untuk melihat:
- `ipdPx`, `scale` (ukuran frame di canvas)
- `yaw`, `pitch`, `roll` (derajat) dari quaternion
- `matrixAvailable` — apakah facialTransformationMatrixes berhasil dibaca
