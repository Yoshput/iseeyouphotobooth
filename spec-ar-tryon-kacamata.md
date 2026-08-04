# Spec: AR Try-On Kacamata — Optik I See You

## 1. Flow Final

```
[Buka kamera] 
   -> [Deteksi wajah muncul (MediaPipe)]
   -> [Animasi scan 3D wajah, 2-3 detik]
   -> [Overlay kacamata muncul real-time di wajah]
   -> [Rekomendasi kacamata berdasarkan bentuk wajah ditampilkan di sidebar/carousel]
   -> [User pilih kacamata → preview real-time]
   -> [Tombol "Coba Ini" -> countdown 3-2-1 -> shutter sound + flash -> capture]
   -> [Hasil AR Try-On: foto bersih TANPA watermark]
   -> [Tombol "Tanya Ketersediaan" -> buka WA CS dengan template pesan]
```

Flow ini terpisah total dari flow **Photobooth** (yang tetap pakai frame brand + watermark untuk dokumentasi event).

---

## 2. Tech Stack

| Kebutuhan | Teknologi | Kenapa |
|---|---|---|
| Deteksi wajah & landmark | `@mediapipe/tasks-vision` (Face Landmarker) | Real-time, jalan di browser, gratis, 468 titik landmark |
| Overlay kacamata 3D nempel di wajah | Three.js, anchor ke landmark mata/hidung | Bisa ngikutin rotasi kepala, bukan cuma 2D sticker |
| Animasi scan | Canvas 2D / SVG di atas video feed | Ringan, murni visual, ga butuh AI tambahan |
| Klasifikasi bentuk wajah | Logic custom JS (rasio landmark) | Tidak butuh API eksternal / biaya tambahan |
| Sound effect | Web Audio API / `<audio>` tag | Shutter click sound |

---

## 3. Algoritma Klasifikasi Bentuk Wajah

Pakai landmark index dari MediaPipe Face Landmarker (468 titik). Titik-titik referensi umum:

- **Panjang wajah**: landmark `10` (puncak dahi) → `152` (dagu)
- **Lebar dahi**: landmark `21` ↔ `251`
- **Lebar tulang pipi (cheekbone)**: landmark `234` ↔ `454`
- **Lebar rahang (jaw)**: landmark `172` ↔ `397`

> Catatan: index ini adalah titik acuan umum yang dipakai di implementasi face-shape-detector open source. Karena akurasi bisa geser tergantung sudut kamera, **wajib dikalibrasi**: ambil 10-15 foto sample wajah dengan bentuk berbeda-beda, log rasio-rasio di bawah, baru fine-tune threshold-nya.

```javascript
// Hitung jarak euclidean 2 landmark
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function classifyFaceShape(landmarks) {
  const faceLength   = dist(landmarks[10], landmarks[152]);
  const foreheadW    = dist(landmarks[21], landmarks[251]);
  const cheekboneW   = dist(landmarks[234], landmarks[454]);
  const jawW         = dist(landmarks[172], landmarks[397]);

  const lengthToCheek = faceLength / cheekboneW;
  const jawToCheek     = jawW / cheekboneW;
  const foreheadToJaw  = foreheadW / jawW;

  // Oblong: wajah jauh lebih panjang dari lebar
  if (lengthToCheek > 1.5) return "oblong";

  // Round: panjang ~ lebar, jaw & forehead mirip lebar, rahang lembut
  if (lengthToCheek < 1.2 && jawToCheek > 0.9) return "round";

  // Square: jaw, cheekbone, forehead relatif sama lebar & rahang tegas
  if (jawToCheek > 0.95 && foreheadToJaw > 0.9 && foreheadToJaw < 1.1) return "square";

  // Heart: dahi jauh lebih lebar dari rahang
  if (foreheadToJaw > 1.15) return "heart";

  // Diamond: cheekbone paling lebar, dahi & rahang sama-sama sempit
  if (cheekboneW > foreheadW && cheekboneW > jawW && foreheadToJaw < 1.05 && foreheadToJaw > 0.85) {
    return "diamond";
  }

  // Default paling umum
  return "oval";
}
```

---

## 4. Mapping Bentuk Wajah → Rekomendasi Frame

| Bentuk Wajah | Ciri | Frame Direkomendasikan | Hindari |
|---|---|---|---|
| **Oval** | Panjang & lebar proporsional, dahi sedikit lebih lebar dari rahang | Hampir semua model cocok — geometric, rectangle, aviator | Frame oversized yang nutupin proporsi wajah |
| **Round** | Panjang ≈ lebar, garis rahang lembut, pipi penuh | Rectangle, square, angular — kasih kesan tegas & kontras | Round frame, frame kecil bulat (makin bikin muka keliatan bulat) |
| **Square** | Rahang tegas, dahi & rahang lebar sama, sudut wajah tajam | Round, oval — melembutkan garis wajah | Square/angular frame (nambah kesan kotak) |
| **Heart** | Dahi lebar, rahang & dagu meruncing | Bottom-heavy frame, cat-eye, rimless bawah, round/oval | Frame yang terlalu lebar di atas (nambah kesan top-heavy) |
| **Diamond** | Cheekbone paling lebar, dahi & rahang sempit | Oval, cat-eye, rimless — highlight area mata | Frame sempit/kecil yang nenggelemin cheekbone |
| **Oblong** | Wajah panjang, dahi-pipi-rahang sempit | Frame lebar dengan detail dekoratif di temple, frame tinggi (oversized) | Frame kecil/sempit (nambah kesan makin panjang) |

---

## 5. Animasi Scan (visual only, sebelum rekomendasi muncul)

- Durasi: 2–3 detik
- Style: garis horizontal hijau (sesuai brand color I See You) bergerak dari atas ke bawah wajah, atau dot-dot menyala mengikuti titik landmark
- Teknis: render di `<canvas>` yang di-overlay di atas video feed, posisi sinkron dengan bounding box wajah dari MediaPipe
- Setelah animasi selesai → trigger `classifyFaceShape()` → tampilkan hasil rekomendasi

---

## 6. Pemisahan AR Try-On vs Photobooth (fix bug watermark)

Buat 2 komponen result terpisah, jangan reuse satu komponen dengan flag/conditional:

```
<TryOnResult />     -> foto bersih, tanpa watermark, tanpa frame brand
                       -> tombol "Tanya Ketersediaan" (WA CS)
<PhotoboothResult /> -> foto + frame brand + watermark
                       -> tombol download / share
```

State/route juga dipisah biar ga ada logic bocor:
`/tryon/result` vs `/photobooth/result`

---

## 7. Countdown + Shutter Sound

- State machine: `idle → countdown (3,2,1) → flash+capture → result`
- Asset yang dibutuhin: 1 file shutter sound pendek (`.mp3`/`.wav`), taruh di `/public/sounds/shutter.mp3`
- Flash: overlay putih full-screen opacity 0→1→0 dalam ~150ms bertepatan dengan capture

---

## 8. Label Text

Ganti semua instance:
- ❌ "Scan AR Kacamata"
- ✅ "Try On Kacamata"

---

## 9. Prompt Final untuk Antigravity

```
Implementasikan AR Try-On Kacamata untuk web app Optik I See You dengan spesifikasi berikut:

1. FACE DETECTION & LANDMARK: gunakan @mediapipe/tasks-vision (Face Landmarker) 
   untuk deteksi wajah real-time dari kamera.

2. ANIMASI SCAN: saat wajah pertama terdeteksi, tampilkan animasi scan 
   (garis hijau bergerak / dot landmark menyala) selama 2-3 detik di atas 
   video feed sebelum menampilkan overlay kacamata & rekomendasi.

3. KLASIFIKASI BENTUK WAJAH: hitung rasio landmark (panjang wajah, lebar dahi, 
   lebar cheekbone, lebar rahang) untuk mengklasifikasikan wajah user ke salah 
   satu dari: oval, round, square, heart, diamond, oblong. Gunakan algoritma 
   dan mapping frame di dokumen spec-ar-tryon-kacamata.md (section 3 & 4).

4. OVERLAY KACAMATA 3D: gunakan Three.js, anchor ke landmark mata & hidung, 
   agar kacamata mengikuti rotasi/gerakan kepala secara natural.

5. REKOMENDASI: tampilkan daftar kacamata yang sesuai bentuk wajah user 
   (dari asset yang tersedia) di sidebar/carousel, bisa langsung diklik untuk 
   preview real-time di wajah.

6. CAPTURE FLOW: tombol "Coba Ini" -> countdown 3-2-1 di layar -> shutter sound 
   effect + flash animation -> capture foto.

7. PISAHKAN RESULT AR TRY-ON DARI PHOTOBOOTH: buat komponen/route terpisah. 
   Hasil AR Try-On harus bersih tanpa watermark/frame brand (karena akan 
   dikirim ke CS via WhatsApp). Hasil Photobooth tetap pakai watermark & 
   frame brand seperti sekarang — JANGAN reuse satu komponen untuk keduanya.

8. LABEL TEXT: ganti semua "Scan AR Kacamata" menjadi "Try On Kacamata".

9. TOMBOL CS: setelah capture di AR Try-On, tampilkan tombol "Tanya Ketersediaan" 
   yang membuka WhatsApp dengan template pesan (nomor & format sesuai yang 
   sudah didefinisikan sebelumnya di project).
```

---

**Catatan implementasi:** algoritma klasifikasi bentuk wajah di atas adalah starting point berbasis rasio umum — akurasinya perlu dites & dikalibrasi ulang pakai beberapa sample foto wajah asli sebelum dipakai final, karena posisi kamera/sudut wajah bisa geser hasil rasio.
