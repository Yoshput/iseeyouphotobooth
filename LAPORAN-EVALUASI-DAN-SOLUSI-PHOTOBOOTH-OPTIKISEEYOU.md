# 📑 LAPORAN EVALUASI TEKNIS & PROPOSAL SOLUSI
## Optimasi Fitur Photobooth & QR Code Download — Optik I See You
**Website:** [optikiseeyou.com](https://optikiseeyou.com) | **Fitur:** AR Photobooth & QR Download  
**Disiapkan untuk:** Manajemen & Atasan Optik I See You  
**Tanggal:** 30 Agustus 2026  

---

## 1. RINGKASAN EKSEKUTIF (Executive Summary)

Dalam pengujian lapangan dan aktivasi publik (seperti di event Alun-Alun dan stand booth), ditemukan kendala operasional pada fitur Photobooth di mana **QR Code untuk mengunduh foto pelanggan membutuhkan waktu yang sangat lama untuk muncul (loading lama / tersendat)** setelah pemakaian berulang kali.

Hal ini berdampak langsung pada operasional lapangan, di mana staf terpaksa menyimpan foto secara manual dan mengirimkannya satu per satu melalui WhatsApp pelanggan. Laporan ini merinci hasil audit teknis akar permasalahan serta rencana solusi sistemik agar QR Code dapat muncul **seketika (0 Detik / Instan)** tanpa membebani perangkat tablet dan jaringan internet di lokasi event.

---

## 2. TEMUAN & ANALISIS AKAR MASALAH (Root Cause Analysis)

Berdasarkan audit teknis terhadap kodingan sistem dan data bucket penyimpanan **Cloudflare R2**, ditemukan bahwa lambatnya QR Code **bukan karena ukuran file foto yang besar** (file foto sebenarnya hanya ~200 KB), melainkan karena 4 faktor arsitektur berikut:

```
[ ALUR LAMA - BERSIFAT SERIAL & SALING MENGUNCI ]
Pelanggan Selesai Foto 
  ➡️ Tablet Hitung Animasi GIF (Beban CPU Berat)
  ➡️ Tablet Kirim Data ke Server Vercel
  ➡️ Server Vercel Kirim ke Cloudflare R2
  ➡️ Cloudflare Mengirim Respons Balik
  ➡️ ⚠️ BARU QR CODE MUNCUL DI LAYAR (Menunggu 15-30 detik)
```

### A. Alur Pembuatan QR yang Saling Mengunci (*Synchronous Blocking*)
Pada sistem yang berjalan saat ini, komponen QR Code diprogram untuk **dilarang muncul** sebelum server Cloudflare R2 selesai menerima seluruh file (Foto Strip + Animasi GIF). Jika sinyal hotspot di lokasi event sedang tidak stabil, pelanggan akan tertahan di layar *loading spinner*.

### B. Beban Komputasi Animasi GIF di Tablet (*Main Thread CPU Bottleneck*)
Ditemukan bukti fisik di bucket Cloudflare R2 di mana beberapa file `.gif` berukuran **45 Bytes – 49 Bytes** (indikasi proses encoding GIF sempat mengalami kegagalan/hang di browser). Pengolahan warna GIF 256-palet yang berjalan berulang kali di prosesor tablet menyebabkan memori browser terbebani, terutama setelah 5–10 sesi pemakaian berturut-turut.

### C. Latensi Jaringan Jarak Jauh (*Multi-Hop Network Delay*)
Koneksi jaringan di area publik (seperti Alun-Alun) memiliki tingkat kepadatan tinggi pada jalur *upload*. Alur request: `Tablet ➡️ Server Vercel ➡️ Cloudflare R2 ➡️ Kembali ke Tablet` membutuhkan waktu jeda sinyal (latency) yang memperpanjang waktu tunggu tampilan QR Code.

### D. Akumulasi Memori Browser (*Memory Leak*)
Sesi pemotretan berturut-turut tanpa me-refresh halaman browser menyimpan data foto berulang di memori RAM tablet, sehingga performa pada sesi ke-10 jauh lebih lambat dibanding sesi ke-1.

---

## 3. DAMPAK OPERASIONAL & BISNIS

| Area | Dampak yang Terjadi Saat Ini |
| :--- | :--- |
| **Customer Experience** | Pelanggan merasa proses lama dan canggung saat menunggu QR Code muncul di layar. |
| **Konversi Event** | Antrean booth menumpuk sehingga jumlah pengunjung yang mencoba photobooth menjadi terbatas. |
| **Beban Staf Lapangan** | Staf harus melayani pengiriman foto manual via WhatsApp satu per satu, mengalihkan fokus dari promosi kacamata/softlens. |

---

## 4. PROPOSAL SOLUSI TEKNIS (Proposed Solutions)

Untuk mengatasi permasalahan di atas secara permanen, diusulkan penerapan **4 pilar optimasi sistem**:

```
[ ALUR BARU - INSTAN & ASINKRON ]
Pelanggan Selesai Foto
  ├── 🚀 DETIK KE-0: QR Code LANGSUNG MUNCUL DI LAYAR (Pelanggan langsung scan di HP)
  └── ⚙️ BACKGROUND: Foto & GIF di-upload di latar belakang tanpa menghalangi layar
```

### 1. Instant QR Code Generation (0 Detik / Real-Time)
* Sistem akan membuat ID unik unduhan di sisi perangkat terlebih dahulu (contoh: `optikiseeyou.com/download?id=isy-xxxx`).
* **QR Code langsung ditampilkan seketika di layar (0 detik)** begitu pemotretan selesai. Pelanggan bisa langsung mengarahkan kamera HP tanpa melihat *loading spinner*.

### 2. Pengunggahan Asinkron & Terpisah (*Decoupled Background Upload*)
* Foto Strip utama (prioritas 1) di-upload secara instan di latar belakang.
* Animasi GIF (prioritas 2) diproses dan di-upload menyusul tanpa memblokir tampilan layar.

### 3. Pembersihan Memori Otomatis (*Auto Memory Garbage Collection*)
* Setiap kali tombol "Selesai / Mulai Sesi Baru" ditekan, sistem secara otomatis mengosongkan memori RAM canvas dan cache kamera dari pelanggan sebelumnya, menjamin performa sesi ke-100 sama cepatnya dengan sesi ke-1.

### 4. Penanganan Fallback Cerdas (*Smart Resilient Retry*)
* Jika sinyal internet di lokasi sempat terputus sesaat, sistem akan melakukan *retry* otomatis di latar belakang tanpa menampilkan pesan error yang membingungkan pengunjung.

---

## 5. TABEL PERBANDINGAN: SEBELUM VS SESUDAH

| Indikator | Sistem Lama (Saat Ini) | Sistem Baru (Setelah Optimasi) |
| :--- | :--- | :--- |
| **Waktu Muncul QR Code** | 10 – 30 detik (menunggu upload selesai) | **0 Detik (Langsung Muncul Seketika)** |
| **Ketergantungan Sinyal** | Sinyal jelek = Layar macet / QR tidak keluar | **QR tetap langsung keluar & bisa di-scan** |
| **Performa Pemakaian Berulang** | Semakin lama semakin lambat / lag | **Konsisten cepat dari sesi 1 hingga sesi ke-100+** |
| **Operasional Staf** | Manual kirim foto via WhatsApp satu per satu | **100% Otomatis pelanggan download mandiri** |
| **Biaya Infrastruktur** | Tetap menggunakan Cloudflare R2 | **Tetap hemat (tidak ada biaya tambahan)** |

---

## 6. RENCANA EKSEKUSI & ESTIMASI

* **Waktu Pengerjaan:** Cepat & langsung dapat diintegrasikan ke dalam kode proyek saat ini.
* **Risiko Downtime:** **0% (Nol)** — Website tetap dapat berjalan normal dan update langsung ter-deploy melalui Vercel.
* **Kebutuhan Biaya:** **Rp 0,- (Gratis)** — Hanya berupa perbaikan arsitektur kodingan (*client-side logic & API flow*).

---

## 7. KESIMPULAN & REKOMENDASI

Permasalahan lambatnya QR Code bukan berasal dari penyedia penyimpanan Cloudflare R2, melainkan dari alur kodingan yang mengunci tampilan QR sebelum upload selesai.

Dengan menyetujui penerapan solusi **Instant QR Code & Background Upload**, fitur Photobooth Optik I See You akan menjadi sangat cepat, andal untuk event besar di tempat ramai, dan memberikan pengalaman teknologi yang profesional bagi calon konsumen Optik I See You.
