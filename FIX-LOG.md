# FIX-LOG.md — AR Try-On 3D Glasses: Riwayat Bug & Fix
**Terakhir diupdate:** 2026-08-25

---

## INSIDEN 1 — PerspectiveCamera Merusak Scale & Anchor (2026-08-25)

### Apa yang ter-overwrite tanpa disengaja
Saat mencoba fix rotasi (ganti ke `facialTransformationMatrixes`), sekalian
diganti juga `OrthographicCamera` -> `PerspectiveCamera`. Ini TIDAK diminta
dan menyebabkan regresi besar pada scale & anchor:

| Aspek | Sebelum (benar) | Sesudah (salah) |
|-------|----------------|-----------------|
| Kamera | OrthographicCamera — 1 unit = 1 CSS px | PerspectiveCamera FOCAL=1000px |
| Scale | ipdPx * fitWidthRatio = frame width (px) | SAMA formula tapi unit berbeda (Perspective distorts) |
| Anchor Y | Blended 50/50 + Y_OFFSET 0.22 | Blended 50/50 TANPA Y_OFFSET (ter-skip) |
| Hasil visual | Kacamata di level mata, proporsional | Kacamata mini, naik ke alis/dahi |

### Root cause teknis
- `OrthographicCamera` dengan frustum `[-w/2, w/2, h/2, -h/2]` membuat
  `model.position.x/y` langsung dalam CSS pixels dari canvas-center.
  `model.scale` langsung dalam CSS pixels.
- `PerspectiveCamera` di z=1000 meski FOV dikalibrasi agar mapping z=0 sama,
  tapi saat model di-rotate oleh quaternion, bagian-bagian model bergerak ke
  z != 0, sehingga skala perspektif berubah. Ini menyebabkan kacamata
  tampak lebih kecil dari yang seharusnya.
- Saat rewrite ulang untuk fix rotation source (Euler), baris
  `anchorY = blendedY + ipdNorm * Y_OFFSET_FACTOR` tidak di-copy,
  sehingga glasses naik ke atas (Y_OFFSET_FACTOR=0.22 hilang).

### Yang dikembalikan/diperbaiki
File: `components/ar/Glasses3DRenderer.tsx`

1. **Camera**: kembali ke `OrthographicCamera(-w/2, w/2, h/2, -h/2, -2000, 2000)`
   - `cameraRef` type kembali ke `THREE.OrthographicCamera`

2. **Anchor Y**: ditambahkan kembali `+ ipdNorm * Y_OFFSET_FACTOR` setelah
   blended anchor, sama persis dengan `computeGlassesAnchor()` di `lib/landmarks.ts`

3. **ipdNorm**: konfirmasi tetap `Math.abs(rightEye.x - leftEye.x)` (horizontal
   only, NO `Math.hypot()` diagonal)

4. **Y_OFFSET_FACTOR**: import dari `@/lib/landmarks` (nilai = 0.22, TIDAK diubah)

---

## PANDUAN ANTI-REGRESI — Aturan "Jangan Sentuh" per Aspek

### Aspek ROTASI (JANGAN UBAH tanpa izin user)
File: `components/ar/Glasses3DRenderer.tsx`
- Fungsi: `computePoseEuler()` — Euler dari Z-depth landmark
- Fungsi: `slerpEMA()` — SLERP quaternion smoothing
- Penerapan: `model.quaternion.copy(smoothQ)` — JANGAN ganti ke `model.rotation.set()`
- TAU_MS = 60ms
- Faktor rotasi = 1.8 (di dalam computePoseEuler)
- JANGAN ganti ke `facialTransformationMatrixes` — itu absolute pose, bukan relative

### Aspek SCALE (JANGAN UBAH tanpa izin user)
- `ipdNorm = Math.abs(rightEye.x - leftEye.x)` — horizontal only
- `ipdPx = ipdNorm * videoWidth * transform.scale` — perkalian dengan cover transform
- `rawScale = clampScale(ipdPx * ipdScaleRef * fitWidthRatio)` — dari manifest
- `GLASSES_SCALE_MIN = 50`, `GLASSES_SCALE_MAX = 700` (di `lib/landmarks.ts`)

### Aspek ANCHOR POSITION (JANGAN UBAH tanpa izin user)
- `blendedY = eyeMidY * 0.5 + noseBridge.y * 0.5` — 50/50 blend
- `anchorY = blendedY + ipdNorm * Y_OFFSET_FACTOR` — WAJIB ada nudge ini
- `Y_OFFSET_FACTOR = 0.22` (di `lib/landmarks.ts`, JANGAN ubah nilainya)
- Camera WAJIB `OrthographicCamera` agar anchor pixel-mapping benar

### Aspek CAMERA (JANGAN UBAH tanpa izin user)
- `OrthographicCamera(-w/2, w/2, h/2, -h/2, -2000, 2000)`
- `camera.position.set(0, 0, 500)`
- JANGAN ganti ke PerspectiveCamera — akan merusak scale & anchor

### Aspek TEMPLE FADE (boleh adjust via manifest)
- `templeFadeStart` di manifest.json per model (default 0.65)
- Clip planes di ±(templeFadeStart * 0.5) dalam normalised local space
- `renderer.localClippingEnabled = true` wajib aktif

---

## CARA TUNE YANG AMAN

| Yang ingin diubah | File yang boleh disentuh | Yang TIDAK boleh ikut diubah |
|---|---|---|
| Posisi kacamata naik/turun | `manifest.json` → `yOffsetRatio` | anchor formula, Y_OFFSET_FACTOR |
| Ukuran kacamata besar/kecil | `manifest.json` → `fitWidthRatio` | ipdNorm formula, camera |
| Rotasi kurang/berlebihan | `computePoseEuler()` faktor 1.8 saja | slerpEMA, camera, anchor |
| Gagang terlalu panjang | `manifest.json` → `templeFadeStart` | camera, clipping plane formula |
| Per-model miring sedikit | `manifest.json` → `rotationOffsetDeg` | core rotation logic |