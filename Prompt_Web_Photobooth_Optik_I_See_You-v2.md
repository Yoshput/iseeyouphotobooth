# System Prompt & PRD: Web AR Photobooth - Optik I See You

Berikut adalah dokumen **Master Prompt & Product Requirements Document (PRD)** komprehensif yang dirancang khusus untuk Anda berikan kepada **Antigravity / AI Coding Assistant** (seperti Cursor, Windsurf, Claude Code, dll.) guna membangun aplikasi web Photobooth interaktif berbasis WebAR untuk Optik **I SEE YOU**.

---

## 📌 PRD & Comprehensive System Prompt for Antigravity

```markdown
# Context & Project Goal
You are an expert Senior Full-Stack Engineer and Creative Web Designer. Your task is to build a modern, high-performance, and aesthetic Web AR Photobooth application for **OPTIK I SEE YOU** (@iseeyou.glasses).

The primary goal of this application is to allow users to take photobooth-style photos online with real-time Virtual Try-On AR Glasses overlays, custom photo strip layouts, dynamic face shape detection for smart frame recommendation, and instant QR Code sharing/download features via Cloud Storage.

---

## 🎨 Branding & Visual Aesthetic Guidelines
- **Brand Name:** OPTIK I SEE YOU
- **Instagram Handle:** @iseeyou.glasses
- **Vibe:** Simple, Aesthetic, Clean, Modern, Youthful, & Playful Optometry.
- **Color Palette:**
  - Primary Accent: Deep Emerald Green (`#0A5C36` / `#116B3C` / `#166534`)
  - Secondary Accent: Soft Mint Green (`#E8F5E9` / `#DCFCE7`)
  - Background: Crisp White with subtle radial soft green gradient blur (`radial-gradient(circle, #E8F5E9 0%, #FFFFFF 80%)`).
  - Text: Dark Charcoal (`#1E293B`) for high legibility, Warm White/Gold accents where applicable.
- **Background Decorative Elements:**
  - Floating semi-transparent 3D/SVG glasses frames drifting slowly in the background (CSS floating keyframe animation).
  - Soft green splash/blob shapes with `blur(80px)` and soft opacity (`0.15 - 0.25`).

---

## 📐 User Flow & Architecture
The web application consists of 3 primary view states or pages:

1. **Landing / Hero Page (`/`)**
   - Header with Optik I See You logo and badge: `● AR PHOTOBOOTH LIVE`.
   - Title: "Coba Kacamata Tanpa Ribet" with subtitle.
   - Main CTA Button: `"MULAI PHOTOBOOTH"` (Deep green, rounded-full, subtle glow).
   - Social proof button: `@iseeyou.glasses`.
   - 3-Step Guide: 1. Pilih Frame -> 2. Foto Langsung -> 3. Share!

2. **Frame / Layout Selection Page (`/select-layout`)**
   - Header banner with dark green background (`#0A5C36`) and Optik I See You branding.
   - Grid selection for photo strip styles:
     - **Sendiri** (1 Foto)
     - **Berdua** (2 Foto - Vertical Strip)
     - **Bertiga** (3 Foto - Vertical Strip)
     - **Berempat** (4 Foto - 2x2 Grid or 4-Strip Vertical)

3. **Photobooth Live Studio (`/photobooth`)**
   - Layout structured similarly to PoseSnap (`https://omrndv.github.io/posesnap/photobooth.html`):
     - **Left Panel (Camera View, Face Scanner & AR Controls):**
       - Video feed with face mesh scanner overlay effect (glowing green grid animation during face scan).
       - Toggle Switch: `[✨ Auto AI Match (Recommended)]` vs `[🕶️ Manual Choose]`.
       - AI Face Scanner HUD: Shows detected face shape (e.g., "Bentuk Wajah: Round/Bulat") and recommended style (e.g., "Kacamata Cocok: Square / Cat-Eye Frame").
       - Live Status Indicator ("Wajah Terdeteksi!", "Kacamata Otomatis Dipasang").
       - Control Buttons: `[Pindai Ulang Wajah]`, `[Jepret Sekali]`, `[Sesi Otomatis (3s Countdown)]`.
     - **Right Panel (Live Preview & Photo Strip Canvas):**
       - Top section: Preview of the last captured shot.
       - Bottom section: Dynamic Photobooth Strip Canvas render (shows progressive photo slots filling up).
       - Fixed Watermark Logo: High-res "OPTIK I SEE YOU" text/vector correctly rendered at top & bottom margins of the photo strip canvas.
       - Action Buttons: 
         - `[Download PNG]` (Direct local download)
         - `[📲 Dapatkan QR Code]` (Triggers background cloud upload to Cloudinary/Supabase & displays popup modal with QR Code to download image on smartphone).
         - `[Foto Ulang]`

---

## 📲 QR Code & Cloud Photo Storage Workflow
Instead of complex Google Drive API service account authorization, implement a seamless Cloud Storage upload flow:

1. **User Clicks "Generate QR Code":**
   - The stitched canvas image (base64 PNG) is sent to a Next.js API route (`/api/upload-photo`).
2. **Cloud Storage Upload Options:**
   - **Cloudinary (Recommended - Free Tier):** Uses Unsigned Upload Preset. Generates a secure CDN URL (`https://res.cloudinary.com/.../photo_strip_xxx.png`).
   - **Supabase Storage (Alternative - Free 1GB):** Bucket `photobooth-strips` with public download link.
3. **QR Code Rendering:**
   - On response, use `qrcode.react` to render a dynamic QR Code inside a clean modal.
   - Scanning the QR Code opens the hosted image page or initiates direct download on the user's mobile browser.
   - Auto-cleanup / TTL option: Optional deletion or expiration setting after 24 hours.

---

## 🔍 AI Face Shape Detection & Glasses Recommendation Matrix
Use MediaPipe Face Landmarker 468 landmarks to calculate facial proportions:
- **Round (Bulat):** Square / Rectangle Frames.
- **Square (Kotak):** Oval / Round Frames.
- **Heart (Hati):** Cat-Eye / Light Wire Frames.
- **Oval (Lonjong):** Aviator / Retro Wayfarer.

---

## 🛠️ Tech Stack & Dependencies
- **Framework:** Next.js 14+ (App Router) / React with Tailwind CSS.
- **Icons & UI:** Lucide React, Framer Motion.
- **QR Code Generator:** `qrcode.react` or `qrcode`.
- **Cloud Upload API:** Cloudinary SDK (`cloudinary`) or `@supabase/supabase-js`.
- **Face Tracking & AR Glasses:** `@mediapipe/tasks-vision` / `@mediapipe/face_mesh`.
- **Canvas Exporting:** HTML5 Canvas `ctx.drawImage` / `html2canvas`.

---

## 💻 Cloud Upload & QR Code Generation Code Snippet

```javascript
// Next.js API Route for uploading base64 photobooth strip to Cloudinary
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: 'optik_i_see_you_photobooth',
      resource_type: 'image',
    });

    return Response.json({ success: true, url: uploadResponse.secure_url });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

```jsx
// Modal QR Code Component
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeModal({ imageUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-[#0A5C36]/20">
        <h3 className="text-xl font-bold text-[#1E293B] mb-1">Scan QR Code</h3>
        <p className="text-xs text-slate-500 mb-4">Scan menggunakan HP kamu untuk mengunduh foto ini</p>
        
        <div className="bg-[#E8F5E9] p-4 rounded-2xl inline-block mb-4 border border-[#0A5C36]/10">
          <QRCodeSVG value={imageUrl} size={200} fgColor="#0A5C36" />
        </div>

        <p className="text-xs text-[#0A5C36] font-medium mb-4 truncate">{imageUrl}</p>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-[#0A5C36] text-white rounded-full font-semibold hover:bg-[#074226] transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 Final Deliverables Checklist for AI Assistant
1. Implement local PNG download AND QR Code cloud upload option.
2. Integrate Cloudinary / Supabase Storage via Next.js API route.
3. Render QR Code inside a styled modal matching Optik I See You aesthetics.
4. Auto-apply recommended AR glasses upon face detection with manual override options.
```
