# System Prompt & PRD: Web AR Photobooth - Optik I See You

Berikut adalah dokumen **Master Prompt & Product Requirements Document (PRD)** komprehensif yang dirancang khusus untuk Anda berikan kepada **Antigravity / AI Coding Assistant** (seperti Cursor, Windsurf, Claude Code, dll.) guna membangun aplikasi web Photobooth interaktif berbasis WebAR untuk Optik **I SEE YOU**.

---

## 📌 PRD & Comprehensive System Prompt for Antigravity

```markdown
# Context & Project Goal
You are an expert Senior Full-Stack Engineer and Creative Web Designer. Your task is to build a modern, high-performance, and aesthetic Web AR Photobooth application for **OPTIK I SEE YOU** (@iseeyou.glasses).

The primary goal of this application is to allow users to take photobooth-style photos online with real-time Virtual Try-On AR Glasses overlays, custom photo strip layouts, and immediate downloading/sharing features.

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
  - Subtle green splash/blob shapes with `blur(80px)` and soft opacity (`0.15 - 0.25`).

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
   - Bottom social footer.

3. **Photobooth Live Studio (`/photobooth`)**
   - Layout structured similarly to PoseSnap (`https://omrndv.github.io/posesnap/photobooth.html`):
     - **Left Panel (Camera View & AR Controls):**
       - Video feed from user webcam with face tracking overlay.
       - Real-time Face Tracking via **MediaPipe Face Landmarker** or **FaceFilter JS / Jeeliz / MindAR**.
       - Automatic Virtual Glasses Overlay on user's face (Cat Eye, Titanium, Metro Sleek, Oval, Retro Square).
       - Live Status Indicator (e.g., "Wajah Terdeteksi", "Pilih kacamata favoritmu").
       - Control Buttons: `[Mulai Kamera]`, `[Jepret Sekali]`, `[Sesi Otomatis (3s Countdown)]`, `[Ganti Filter Kacamata]`.
     - **Right Panel (Live Preview & Photo Strip Canvas):**
       - Top section: Preview of the last captured shot.
       - Bottom section: Dynamic Photobooth Strip Canvas render (shows progressive photo slots filling up).
       - Action Buttons: `[Download Photo Strip (PNG)]`, `[Bagikan ke WhatsApp/IG]`, `[Foto Ulang]`.

---

## 🛠️ Tech Stack & Dependencies
- **Framework:** Next.js 14+ (App Router) / React with Tailwind CSS.
- **Icons & UI:** Lucide React, Framer Motion (for smooth floating glasses animations & modal transitions).
- **Face Tracking & AR Glasses:**
  - `@mediapipe/face_mesh` or `@mediapipe/tasks-vision` for 468 landmark detection.
  - HTML5 Canvas / Three.js overlay rendering glasses PNG/SVG dynamically positioned at landmark coordinates (Left eye: `33`, Right eye: `263`, Nose bridge: `168` / `6`).
- **Canvas Exporting:** `html2canvas` or native HTML5 Canvas `ctx.drawImage` to stitch multi-shot photos into a high-res printable photobooth strip with branded watermark & date.

---

## 🕶️ AR Glasses Filter Feature Details
- Provide an interactive selector/carousel below or beside the video camera:
  - **Glasses Options:**
    1. *Titanium Edition (Silver/Black Thin Frame)*
    2. *Cat Eye Edition (Trendy Acetate)*
    3. *Metro Sleek (Retro Wire Oval)*
    4. *Clear Vision / Anti-Radiasi (Transparent Frame)*
    5. *Sunnies Dark (Black Tinted Lenses)*
- **Tracking Logic:**
  - Track head rotation (pitch, yaw, roll) and distance to scale glasses size automatically.
  - Smooth interpolation (lerp) to prevent jitter.

---

## 📸 Photo Capture & Photobooth Strip Generation
- **Countdown Timer:** 3.. 2.. 1.. Flash effect (white screen flash overlay for 150ms).
- **Session Auto Capture:** Capture N photos sequentially based on selected grid style with a 3-second delay between shots.
- **Strip Layout Customization:**
  - Frame Background Color Options: Classic White, Deep Green `#0A5C36`, Light Mint `#E8F5E9`, Charcoal.
  - Header/Footer Branding on Strip: "OPTIK I SEE YOU" typography logo, date stamp, and Instagram `@iseeyou.glasses`.

---

## 💻 Implementation Code Snippet (MediaPipe AR Overlay Example)

```javascript
import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function ARCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedGlasses, setSelectedGlasses] = useState('/glasses/cateye.png');

  useEffect(() => {
    let faceLandmarker;
    let animationFrameId;

    const setupMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      startCamera();
    };

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    };

    const predictWebcam = async () => {
      if (videoRef.current && canvasRef.current && faceLandmarker) {
        const results = await faceLandmarker.detectForVideo(videoRef.current, performance.now());
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          // Key points: 33 (left eye outer), 263 (right eye outer), 168 (nose bridge)
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const nose = landmarks[168];

          const dx = (rightEye.x - leftEye.x) * canvasRef.current.width;
          const dy = (rightEye.y - leftEye.y) * canvasRef.current.height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          const glassesImg = new Image();
          glassesImg.src = selectedGlasses;

          const glassesWidth = distance * 2.2;
          const glassesHeight = glassesWidth * (glassesImg.height / glassesImg.width || 0.4);

          ctx.save();
          ctx.translate(nose.x * canvasRef.current.width, nose.y * canvasRef.current.height);
          ctx.rotate(angle);
          ctx.drawImage(
            glassesImg,
            -glassesWidth / 2,
            -glassesHeight / 2,
            glassesWidth,
            glassesHeight
          );
          ctx.restore();
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setupMediaPipe();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [selectedGlasses]);

  return (
    <div className="relative w-full max-w-xl rounded-2xl overflow-hidden border-4 border-[#0A5C36]/20 shadow-2xl">
      <video ref={videoRef} autoPlay playsInline className="w-full h-auto scale-x-[-1]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1]" />
    </div>
  );
}
```

---

## 🎯 Final Deliverables Checklist for AI Assistant
1. Produce clean, modular React / Next.js code.
2. Ensure responsive design for both Desktop and Mobile Web browsers.
3. Apply smooth micro-interactions, green aesthetic gradients, and floating glasses backdrop.
4. Implement face-tracking overlay for AR glasses filters seamlessly during live preview and photo capture.
5. Provide automatic photo strip stitching and high-resolution PNG download.
```
