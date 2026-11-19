# CHANGELOG: Advanced Virtual Try-On Engine
**Project:** Optik I See You — Virtual Try-On Engine
**Branch:** `feat/advanced-virtual-try-on-engine`
**Date:** 19 November 2026
**Author:** Senior Full-Stack & Computer Vision Specialist

---

## 1. Computer Vision & Landmarks Calibration
- **Nasion & Eye-Span Alignment (`lib/landmarks.ts`):**
  - Calibrated `Y_OFFSET_FACTOR` from `-0.075` to `-0.090` to position the glasses bridge securely at the upper nasion/inner canthi level.
  - Eliminated frame sagging ("keturunan") so the browline sits naturally flush underneath the eyebrows.
  - Ensured pupil center aligns with the optical focal center of each lens across selfie camera distances.
- **Frame Sizing Proportions (`public/glasses/manifest.json`):**
  - Recalibrated `fitWidthRatio` (1.48–1.50) and `ipdScaleRef` (1.02) across all authentic photographic frames (`clubmaster-real`, `cateye-pastel`, `hexagonal-rose-gold`, `square-plastik-real`, `oval-kecil-real`, `semi-kotak-real`, `cateye-lebar-real`).
  - Fixed undersized appearance ("kurang gede") to match physical adult frame temple widths.

## 2. WebGL & Three.js Architecture
- **Texture Disposal Pipeline (`components/ar/GlassesRenderer.tsx`):**
  - Eliminated multiple disposal calls on shared texture instances. Shared texture is now cleanly disposed once upon unmount or asset swap.
  - Mitigated WebGL 2.0 `texImage3D: FLIP_Y or PREMULTIPLY_ALPHA` collision warnings by ensuring clean texture unpack and context isolation.
  - Added canvas `webglcontextlost` and `webglcontextrestored` safety listeners to gracefully handle GPU context interruptions without crashing the UI.

## 3. Hybrid 2D + 3D Virtual Try-On
- **Dual-Mode Try-On Engine (`components/try-on/TryOnExperience.tsx`):**
  - Integrated 2D Photographic Realism (default) with Interactive 3D AR for frames with verified GLB models hosted on Cloudflare R2.
  - Seamless toggle `[2D Real] [3D AR]` in the camera header.
  - Graceful fallback: If GLB asset is unavailable, the system safely retains high-performance 2D rendering.

## 4. Smart AI Face Shape Recommendation
- **Multi-Criteria Compatibility Engine (`lib/faceShape.ts`):**
  - Replaced legacy binary scoring with multi-factor scoring (0–100):
    - Face-to-frame geometric contrast (up to 40 pts).
    - Proportions & IPD balance (up to 30 pts).
    - Browline & bridge style harmony (up to 20 pts).
    - Color tone & material balance (up to 10 pts).
  - Transparent explanations in natural Indonesian explaining *why* the frame complements the detected face structure.
- **Temporal Stability (`FaceShapeStabilizer`):**
  - Integrated rolling-window majority voting (14-frame buffer) to eliminate rapid face shape label jitter during natural head movements.
  - Preserved manual shape override selector (Diamond, Oval, Round, Square, Heart, Oblong) with instant "Auto AI" restoration.

## 5. Frame Comparison & Shopping Experience
- **Side-by-Side Comparison Modal (`components/try-on/TryOnExperience.tsx`):**
  - Added "Bandingkan Frame" feature comparing Frame A (current active) with Frame B (selectable from catalog).
  - Displays high-resolution photos, shape, style, material, physical dimensions, AI compatibility scores, and 1-click switch.
- **Authentic WhatsApp Branch Routing (`lib/branches.ts`):**
  - Integrated branch selector directly into the Try-On consultation flow (Purwokerto, Purbalingga, Wonosobo, Cilacap).
  - Auto-populates pre-filled message with frame name, branch location, and face shape recommendation.

## 6. Security & CSP Hardening
- **CSP Headers (`next.config.ts`):**
  - Added `https://static.cloudflareinsights.com` to `script-src`.
  - Added `https://cloudflareinsights.com`, `https://*.cloudflareinsights.com`, and `https://*.supabase.co` to `connect-src`.
