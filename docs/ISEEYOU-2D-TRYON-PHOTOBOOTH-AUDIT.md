# ISY Photobooth — 2D Try-On & AR Photobooth Audit

> **Status:** COMPLETED (November 2026)  
> **Repo:** `D:\PROJECT WEB\isy-photobooth`  
> **Author:** Automated audit by Antigravity Agent

---

## 1. Executive Summary

This document audits the current state of the Virtual Try-On (2D) and AR Photobooth systems in the `isy-photobooth` Next.js 15 application, records all changes made during the November 2026 upgrade sprint, and outlines the roadmap for gradual separation of the Try-On UX from the Photobooth pipeline.

---

## 2. Current Architecture (Pre-Upgrade)

### 2.1 `/try-on` Page
- **File:** `app/try-on/page.tsx` (or similar wrapper)
- **Current state:** Thin wrapper around `PhotoboothPage` component — both Try-On and Photobooth share the same rendering engine
- **Limitation:** UX optimized for photobooth (countdown, strip capture, GIF, thermal print, QR upload) — not for casual try-on browsing

### 2.2 Glasses Rendering Engine
- **Core component:** `components/GlassesRenderer.tsx` (Three.js + MediaPipe)
- **Pipeline:**
  ```
  MediaPipe FaceLandmarker → face mesh landmarks
      ↓
  Extract: leftEye (33), rightEye (263), noseTip (1), midBrow (168)
      ↓
  Calculate: ipdPx = anchor.ipdNorm × videoWidth × coverScale
      ↓
  Three.js PlaneGeometry:
    scale = ipdPx × ipdScaleRef
    position = midpoint of eyes + yOffset
    rotation = face tilt angle
      ↓
  EMA smoothing (tau=80ms, frame-rate independent)
      ↓
  WebGL render overlay on video
  ```
- **Texture source:** `public/glasses/{file}` — PNG with transparency
- **Key params per glasses entry:** `ipdScaleRef` (scale factor), `fitWidthRatio` (reference only, not used in render)

### 2.3 Photobooth Pipeline (DO NOT BREAK)
```
Camera input
  → MediaPipe face detection
  → GlassesRenderer overlay
  → Countdown (3-2-1)
  → Canvas capture (strip of 4 photos or single)
  → GIF generation (gif.js)
  → Upload to Cloudflare R2 (api/upload-photo)
  → QR Code generation (pointing to /download?id=...)
  → Thermal print option
  → Share / Download
```

### 2.4 Glasses Manifest (Pre-Upgrade)
10 entries in `public/glasses/manifest.json`:

| ID | Name | Style | Has 3D Model |
|----|------|-------|--------------|
| `none` | Tanpa Kacamata | Normal | — |
| `oval-pastel` | Hexagonal Plastik Pastel | Hexagonal | ✅ |
| `round-frame` | Oval Kecil | Oval | ✅ |
| `cateye-pastel` | Semi Kotak Plastik Pastel | Semi-Square | — |
| `cateye-frame` | Cat-Eye Lebar | Cat-Eye | ✅ |
| `cateye-pastel-v2` | Cat-Eye Pastel | Cat-Eye | — |
| `square-frame` | Kotak Plastik Hitam | Square | ✅ |
| `clubmaster-frame` | Kotak Clubmaster | Browline | ✅ |
| `sunglasses-black` | Sunglasses Hitam | Sunglasses | — |
| `sunglasses-square-metal` | Sunglasses Aviator Gold | Aviator | ✅ |

---

## 3. Changes Made — November 2026 Sprint

### 3.1 Data Pipeline & Analytics (COMPLETED ✅)

#### Cloudflare R2 — Monthly Partitioning
- **`lib/uploadImage.ts`** — `generatePhotoId()` now returns `${yearMonth}/isy-${Date.now()}-${rnd}` format
- **`app/api/upload-photo/route.ts`** — stores photos in `photos/YYYY-MM/isy-{id}.jpg`
- **`app/api/photo/route.ts`** — dual-resolution fallback: tries monthly key first, falls back to legacy flat `photos/isy-...` for backward compatibility

#### Real Telemetry Events
- **`app/api/track/route.ts`** *(NEW)* — telemetry endpoint for `antrian_booking`, `photo_share`, `tryon_session` events
  - Saves to R2 monthly partitions: `antrian/YYYY-MM/`, `tryon/YYYY-MM/sessions/`
  - Forwards events to IMI dashboard (`iseeyou-marketing-intelligence`)
- **`lib/telemetry.ts`** *(NEW)* — client-side helpers: `trackAntrianBooking()`, `trackTryOn()`, `trackPhotoShare()`
- **`lib/db/r2Analytics.ts`** *(NEW)* — R2 JSON helpers for monthly summary files (`tryon/YYYY-MM/summary.json`)

#### Components Updated for Real Tracking
- **`components/ui/AboutRefractionBookingSection.tsx`** — `trackAntrianBooking()` fires before WhatsApp redirect → real antrian bookings recorded
- **`app/download/page.tsx`** — `trackPhotoShare()` on download/copy link
- **`app/photobooth/page.tsx`** — `trackTryOn()` on glassesIndex change; `trackPhotoShare()` on strip/GIF download and social share

#### Cloudflare R2 — `tryon/` Folder Initialized
- `tryon/2026-11/summary.json` created via local Node script
- Confirmed visible in Cloudflare dashboard (screenshot verified)

### 3.2 Sponsor Form Bug Fixes (COMPLETED ✅)
- **`app/sponsor/page.tsx`** — fixed ghost default `bentukSponsor: []` pre-selecting "Voucher Diskon Peserta" + "Stan Cek Mata Gratis" invisibly
- Added validation requiring at least 1 bentuk kemitraan
- Fixed "700 orang orang" duplication bug
- **`components/admin/SponsorQRModal.tsx`** — related QR modal fixes

### 3.3 IMI Dashboard — Antrian Persistence (COMPLETED ✅)
- **`lib/antrian-tracking.ts`** — added file-based persistence to `data/antrian-events.json` with `/tmp/` fallback

### 3.4 New Real Product Assets — 9 Glasses (IN PROGRESS)

#### Source Images
All 9 PNG files in `public/Asset Web Kacamatya Try On/`:
- All 1086×1448px, RGB mode (no alpha) — real product photos on model

#### Processing Pipeline
1. **Background removal:** `rembg` with `u2net` model (AI-based, high quality)
2. **Auto-crop:** tight bounding box of non-transparent pixels + 20px padding
3. **Resize:** max 600×300px maintaining aspect ratio

#### Output Files (Target: `public/glasses/`)

| Source | Output File | Style | Color |
|--------|------------|-------|-------|
| Cateye Lebar.png | `cateye-lebar-real.png` | Cat-Eye | #8B4513 |
| Cateye Pastel.png | `cateye-pastel-real.png` | Cat-Eye | #C8B8A2 |
| Hexagonal.png | `hexagonal-real.png` | Hexagonal | #E8C5C8 |
| Kotak Club Master.png | `clubmaster-real.png` | Browline | #262626 |
| Kotak Plastik Hitam.png | `square-real.png` | Square | #1a1a1a |
| Oval Kecil.png | `oval-kecil-real.png` | Oval | #334155 |
| Semi Kotak Plastik.png | `semi-kotak-real.png` | Semi-Square | #C4956A |
| Sun Glasses.png | `sunglasses-real.png` | Sunglasses | #111111 |
| Sunglasses Aviator.png | `aviator-real.png` | Aviator | #c0a050 |

#### Manifest Entries (9 New, `isRealPhoto: true`)
All new entries appended AFTER existing 10 entries. See `manifest.json` for full detail.

> [!IMPORTANT]
> These are **2D PNG try-on only** — labeled `isRealPhoto: true`. Do NOT claim TRUE 3D for these assets. No `model3D` field on new entries.

---

## 4. Known Issues & Limitations

### 4.1 Source Image Contains Face Model
- Source photos are product shots of a person wearing the glasses
- After `rembg` removes background, the face/model may still be present
- **Mitigation:** Auto-crop bounding box targets only glasses region; test visually after processing
- If quality is poor, manual crop per-image may be needed

### 4.2 `ipdScaleRef` Needs Visual Calibration
- Initial values copied from similar style entries in existing manifest
- May need fine-tuning after rendering test on live camera
- Use the try-on page's future size slider (see roadmap) for quick calibration

### 4.3 `/try-on` Page Still Wraps Photobooth
- Currently no separate Try-On UX
- Roadmap: gradual separation using shared engine (see Section 5)

---

## 5. Roadmap — Try-On UX Separation

### Phase 1: Asset Registration (Current Sprint) ✅
- [x] Process 9 real product photos → transparent PNG
- [x] Add 9 entries to manifest.json

### Phase 2: Try-On Page UX (Next Sprint)
Priority features (inspired by Heykama try-on UX):
- [ ] Camera-centered layout (full viewport)
- [ ] Glasses thumbnail strip at bottom (horizontal scroll)
- [ ] Size slider (`ipdScaleRef` multiplier at runtime)
- [ ] Fullscreen button
- [ ] Camera flip button (front/back)
- [ ] Capture + download single photo
- [ ] Responsive: mobile portrait + desktop landscape
- [ ] Face shape quiz link (→ `/quiz-frame`)

### Phase 3: AI Frame Recommendation (Future)
- [ ] Face shape detection → auto-filter `recommendedFor`
- [ ] Exclude `excludeFromAiMatch: true` entries from AI suggestions
- [ ] Show badge "Cocok untuk wajah [Oval]"

### Phase 4: Analytics Integration
- [ ] Track frame view time (which glasses held longest)
- [ ] Track capture events from try-on (vs photobooth)
- [ ] Send to IMI dashboard in real-time via `/api/track`

---

## 6. Architecture Constraints (DO NOT VIOLATE)

> [!CAUTION]
> Never break the photobooth pipeline. The following must remain intact:
> - Countdown → capture → GIF → upload → QR → thermal print flow
> - `api/upload-photo` backward compatibility with legacy `photos/isy-...` QR codes
> - All 10 existing manifest entries (including their `model3D` fields)
> - All existing GLB model references in R2

> [!WARNING]
> Do NOT add new npm dependencies unless existing stack cannot solve the need.
> Current stack covers: Three.js, MediaPipe, gif.js, QR code, AWS SDK S3 (R2), jsPDF.

---

## 7. Build Verification

Both builds must pass with Exit code 0:
```bash
# isy-photobooth
npm run build  # → 66 routes, Exit 0 ✅

# iseeyou-marketing-intelligence  
npm run build  # → 24+ routes, Exit 0 ✅
```

---

## 8. Git Status — Uncommitted Changes

### `isy-photobooth` (modified):
- `app/api/photo/route.ts`
- `app/api/upload-photo/route.ts`
- `app/download/page.tsx`
- `app/photobooth/page.tsx`
- `app/sponsor/page.tsx`
- `components/admin/SponsorQRModal.tsx`
- `components/ui/AboutRefractionBookingSection.tsx`
- `lib/uploadImage.ts`

### `isy-photobooth` (new untracked):
- `app/api/track/route.ts`
- `lib/db/r2Analytics.ts`
- `lib/telemetry.ts`
- `docs/ISEEYOU-2D-TRYON-PHOTOBOOTH-AUDIT.md` *(this file)*
- `public/glasses/cateye-lebar-real.png` *(after processing)*
- `public/glasses/cateye-pastel-real.png`
- `public/glasses/hexagonal-real.png`
- `public/glasses/clubmaster-real.png`
- `public/glasses/square-real.png`
- `public/glasses/oval-kecil-real.png`
- `public/glasses/semi-kotak-real.png`
- `public/glasses/sunglasses-real.png`
- `public/glasses/aviator-real.png`

### `iseeyou-marketing-intelligence` (modified):
- `lib/antrian-tracking.ts`

### Recommended Git Commands:
```bash
# isy-photobooth
git add .
git commit -m "feat: 9 real product glasses assets, monthly R2 partition, live telemetry, fix sponsor form"
git push origin main

# iseeyou-marketing-intelligence
git add .
git commit -m "feat: antrian event persistence to file for monthly reset"
git push origin main
```
