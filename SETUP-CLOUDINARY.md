# Setup Cloudinary untuk QR Scan Foto

Fitur **QR Scan** memungkinkan pengunjung memindai QR code dari layar kiosk dan langsung membuka/menyimpan foto di HP mereka.

Foto diunggah langsung dari browser ke Cloudinary via **unsigned upload preset** — tidak butuh server atau API route (static export friendly).

---

## Langkah Setup

### 1. Buat akun Cloudinary (gratis)
Daftar di [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)

Tier gratis cukup untuk event: 25 GB storage + 25 GB bandwidth/bulan.

---

### 2. Buat Upload Preset (Unsigned)

Di Cloudinary Dashboard:
1. Buka **Settings** → **Upload** → tab **Upload presets**
2. Klik **Add upload preset**
3. Isi:
   - **Preset name**: `preset_photobooth` (atau nama lain sesukamu)
   - **Signing mode**: `Unsigned`
   - **Folder**: `isy-photobooth`
   - (Opsional) di bagian **Upload manipulations** kamu bisa set auto-expire via transformation
4. Klik **Save**

---

### 3. Copy Cloud Name

Di halaman utama Cloudinary Dashboard, lihat bagian **Product Environment** — ada **Cloud name** (contoh: `ysrkt8my`).

---

### 4. Set Environment Variables

Di file `.env.local` (root project):

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

Contoh (sesuai nilai di project ini):

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ysrkt8my
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=preset_photobooth
```

---

### 5. Restart Dev Server

```bash
npm run dev
```

---

## Catatan Keamanan

- Upload preset bersifat **unsigned** — URL upload preset bisa dilihat di browser, tapi ini aman karena:
  - Semua yang bisa dilakukan hanyalah **upload** foto (bukan delete/baca akun)
  - Kamu bisa set **max file size**, **allowed formats**, dan **folder** di preset untuk membatasi abuse
  - Cloudinary punya rate limiting bawaan
- Jangan set secret API key di `NEXT_PUBLIC_*` — unsigned preset sudah cukup

---

## Troubleshooting

| Symptom | Kemungkinan Penyebab |
|---|---|
| "QR tidak tersedia" + error Cloudinary | Cloud name atau preset salah / belum disimpan |
| QR muncul tapi link tidak bisa dibuka | URL Cloudinary valid — cek koneksi internet HP |
| Upload lambat | Foto resolusi tinggi — normal, ~1-3 detik |
| "QR belum aktif" tampil | Env var belum diset atau dev server belum restart |
