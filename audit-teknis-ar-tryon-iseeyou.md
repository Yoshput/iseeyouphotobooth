# Audit Teknis: Virtual Try-On Transitions.com vs AR Photobooth Optik I See You

**Tujuan dokumen:** Membedah cara kerja virtual try-on di transitions.com/id/virtual-try-on/, membandingkan dengan kondisi AR Photobooth di optikiseeyou.com/photobooth?mode=ar, dan menerjemahkannya jadi rencana teknis yang bisa langsung dieksekusi developer/coding agent (Antigravity + Gemini).

**Catatan jujur soal metode:** Riset ini disusun dari dokumentasi resmi FittingBox (vendor try-on Transitions), dokumentasi resmi Google MediaPipe, dan struktur halaman kedua situs. Analisis ini *tidak* mencakup uji coba kamera/JS secara langsung (live testing) di kedua situs, jadi kualitas tracking real — goyang, delay, akurasi di berbagai bentuk wajah — tetap perlu dites langsung di HP asli, bukan cuma dibaca dari dokumen ini. Bagian 2.2 kasih cara cepat buat cek itu sendiri.

---

## Ringkasan Eksekutif

1. **Transitions.com bukan bikin dari nol.** Try-on mereka jalan di atas engine FittingBox — perusahaan Prancis spesialis AR try-on kacamata sejak 2006, dipakai 4.000+ klien dan ~10 juta sesi/bulan.
2. **"Kece"-nya bukan dari 1 fitur, tapi pipeline 4 lapis** yang saling menopang: deteksi wajah presisi real-time → 3D asset asli dengan auto-sizing → rendering yang menghormati bayangan/oklusi → alur UX yang mulus & privasi jelas. Kalau satu lapis lemah, hasilnya berasa "filter Instagram", bukan alat bantu belanja.
3. **Bisa direplikasi tanpa kontrak enterprise.** Building block inti yang dipakai FittingBox (landmark wajah 3D + transformation matrix real-time) sekarang tersedia gratis lewat Google MediaPipe Face Landmarker, tinggal dirender pakai Three.js. Ini realistis buat dikerjakan coding agent.
4. **Titik paling menentukan "pas di semua wajah"** ada di kalibrasi skala — menyambungkan ukuran fisik asli tiap frame (mm) ke data wajah user, bukan sekadar resize visual sampai "kelihatan pas". Detail lengkap di Bagian 5.
5. Ada 3 jalur teknologi dengan trade-off berbeda (Bagian 4) — mulai dari jalur open-source dulu (paling cocok dikerjakan Antigravity), commercial SDK sebagai jalan pintas kalau butuh cepat.

---

## Bagian 1 — Audit: Cara Kerja Try-On Transitions.com

### 1.1 Vendor di Baliknya

Fitur "Coba Pakai Virtual" di transitions.com dijalankan pakai teknologi FittingBox, bukan sistem in-house Transitions/EssilorLuxottica. FittingBox berdiri sejak 2006 di Labège, Prancis, memegang 16 paten internasional terkait AR try-on, dan diklaim dipakai 4.000+ klien dengan ~10 juta sesi try-on per bulan — dari optik independen sampai e-retailer besar.

Transitions sendiri merilis versi try-on-nya untuk memamerkan 7 varian warna lensa Signature GEN 8 di berbagai model frame, lengkap fitur capture foto di tiap tahap perubahan warna — karena lensa Transitions memang photochromic (berubah warna kena cahaya), jadi try-on-nya butuh simulasi lensa juga, bukan cuma frame.

### 1.2 Pipeline 4 Lapis

```
[Kamera User]
      |
      v
+----------------------------+
| 1. DETEKSI & TRACKING       |  -> titik wajah real-time: sudut mata,
|    WAJAH                    |     jembatan hidung, kontur pipi, arah kepala
+----------------------------+
      |
      v
+----------------------------+
| 2. ASET 3D & AUTO-SIZING    |  -> dimensi fisik asli frame (mm) dicocokkan
|                              |     ke proporsi wajah user
+----------------------------+
      |
      v
+----------------------------+
| 3. RENDERING REAL-TIME &    |  -> bayangan, refleksi lensa, oklusi rambut/
|    REALISME                 |     jari, frame "nempel" bukan "ditempel"
+----------------------------+
      |
      v
+----------------------------+
| 4. ALUR UX & PRIVASI        |  -> izin kamera, ganti warna/frame instan,
|                              |     capture, semua diproses di browser
+----------------------------+
```

**Lapis 1 — Deteksi & Tracking Wajah.** Sistem mendeteksi titik-titik wajah standar yang ada di semua wajah manusia — sudut mata, jembatan hidung, kontur pipi, orientasi kepala — lalu men-tracking titik-titik itu di setiap frame video secara real-time. Ini yang bikin frame kacamata "nempel" dan tetap stabil walau user gerak/miringin kepala. FittingBox eksplisit bilang deteksi ini cuma pakai titik matematis standar (mata, hidung, mulut, telinga) — bukan rekonstruksi geometri wajah lengkap — makanya mereka bisa klaim tidak menyimpan/mengidentifikasi wajah user.

**Lapis 2 — Aset 3D & Auto-Sizing.** Setiap frame di katalog FittingBox adalah digital twin 3D asli (bukan foto 2D ditempel), lengkap geometri bidang lensa dan definisi material. Untuk ukuran, mereka kombinasikan dimensi fisik asli frame + jarak antar-landmark wajah, dan — kalau tersedia — pupillary distance (PD) asli user untuk presisi ekstra. Katalog 3D mereka diklaim 195.000+ referensi dari 1.200+ brand.

**Lapis 3 — Rendering Real-Time & Realisme.** Di sinilah bedanya "kelihatan kece" vs "kelihatan kayak stiker". Engine menghitung bayangan, refleksi lensa konsisten dengan pencahayaan sekitar, dan — penting — oklusi: kalau rambut/jari lewat di depan wajah, itu harus kelihatan di depan kacamata, bukan kacamata numpuk di atasnya. FittingBox punya fitur "frame removal" untuk menghapus kacamata asli yang sedang dipakai user sebelum me-render kacamata virtual, biar tidak dobel.

**Lapis 4 — Alur UX & Privasi.** Dari sisi user: izin kamera dengan pesan jelas kegunaannya → live preview → ganti warna/frame instan tanpa reload → capture foto untuk disimpan/dibagikan. Semua diproses live di browser user; FittingBox menegaskan gambar wajah tidak disimpan atau dikirim ke server mereka — cuma data statistik penggunaan anonim (jumlah sesi, referensi produk yang dicoba).

---

## Bagian 2 — Kondisi Optik I See You Saat Ini

### 2.1 Yang Kelihatan dari Struktur Halaman

Dari struktur halaman `optikiseeyou.com/photobooth?mode=ar`, ini "AR Photobooth" dengan framing yang berbeda dari Transitions:

- **Transitions** = alat bantu **keputusan belanja**: coba dulu, bandingkan warna/frame, baru putuskan beli.
- **Optik I See You** = alat **engagement/konten sosial**: pilih dulu format cetak (strip 2×6, card 4×6, grid — total 8 pilihan layout), baru masuk sesi AR, hasilnya bisa dicetak/dibagikan ke Instagram (@iseeyou.glasses).

Dua-duanya valid, cuma tujuannya beda: satu jualan lensa premium ke calon pembeli yang lagi riset, satu lagi menarik trafik & bikin konten di 4 cabang toko (Purwokerto, Purbalingga, Wonosobo, Cilacap). Tapi karena "kece"-nya try-on Transitions yang jadi acuan: teknologi intinya (deteksi wajah + render kacamata) sebenarnya bisa dipakai di kedua use-case sekaligus — engine yang sama, cuma UI depannya beda flow.

Halaman ini juga sudah PWA-capable (bisa di-"install" ke homescreen), artinya fondasi teknisnya cukup modern untuk ditambah AR engine yang lebih berat.

### 2.2 Batasan Analisis Ini + Cara Cek Cepat Sendiri

Analisis ini terbatas pada struktur/metadata halaman, tanpa menjalankan sesi kamera live. Jadi belum ada kepastian soal: seberapa presisi tracking-nya sekarang, ada delay/lag atau tidak, akurat di bentuk wajah/pencahayaan apa saja, dan library apa yang sebenarnya dipakai saat ini.

Cara cepat tim dev cek sendiri (5 menit):
1. Buka `optikiseeyou.com/photobooth?mode=ar` di Chrome desktop.
2. Klik kanan → Inspect → tab **Network**, filter `JS`, reload halaman.
3. Cari nama library di daftar file yang ter-load — kalau ada `mediapipe`, `tensorflow`, `banuba`, `jeeliz`, atau `fittingbox`, itu menunjukkan fondasi yang dipakai sekarang.
4. Tab **Console** juga sering menampilkan log inisialisasi SDK AR-nya.

Info ini penting untuk Antigravity nanti — supaya jelas apakah membangun dari nol atau upgrade dari yang sudah ada.

---

## Bagian 3 — Gap Analysis

| Aspek | Transitions (FittingBox) | Yang Perlu Divalidasi di I See You | Rekomendasi |
|---|---|---|---|
| Deteksi wajah | Real-time, stabil di berbagai sudut kepala | Cek stabilitas saat kepala miring/gerak cepat | Pakai MediaPipe Face Landmarker (transformation matrix) |
| Kualitas aset | 3D digital twin asli per SKU, bukan gambar 2D | Cek apakah frame sekarang model 3D atau overlay 2D | Prioritaskan 3D untuk SKU terlaris dulu, bukan seluruh katalog sekaligus |
| Auto-sizing | Dimensi fisik asli + data wajah (+ PD opsional) | Cek apakah ukuran frame berubah ikut jarak wajah ke kamera | Implementasi skala berbasis mm (lihat Bagian 5) |
| Oklusi (rambut/tangan) | Ditangani eksplisit, ada fitur frame-removal | Sering jadi titik lemah di implementasi sederhana | Depth-mask dari face mesh (murah, tanpa AI segmentasi tambahan) |
| Ganti produk | Instan, tanpa re-scan wajah dari nol | Cek delay saat ganti pilihan | Pisahkan proses "deteksi wajah" dari "load aset" di kode |
| Privasi | Diproses di browser, tidak disimpan, kebijakan jelas | Perlu dicek & didokumentasikan | Tegaskan di UI: "diproses di HP kamu, foto tidak diupload" |
| Output | Download foto per tahap warna | Sudah ada (fitur cetak strip/card) — nilai plus I See You | Pertahankan, ini bisa jadi diferensiasi vs Transitions |

---

## Bagian 4 — Tiga Jalur Teknologi

### Tier 1 — Custom / Open-Source (paling cocok dikerjakan Antigravity dari nol)

- **Face tracking:** Google MediaPipe Face Landmarker (`@mediapipe/tasks-vision`) — 478 titik wajah 3D + transformation matrix, jalan di browser via WebAssembly/GPU, gratis, tanpa API key, tanpa biaya per-sesi.
- **Rendering 3D:** Three.js — load model kacamata (format `.glb`/`.gltf`), overlay di atas video kamera pakai WebGL canvas.
- **Biaya lisensi:** Rp0 untuk software. Biaya riil ada di effort digitalisasi 3D tiap frame (lihat Bagian 5) dan jam kerja developer.
- **Cocok kalau:** mau kontrol penuh, tidak mau tergantung vendor luar, dan siap invest waktu dev untuk pipeline aset 3D sendiri.

### Tier 2 — SDK Komersial Menengah

- **Banuba Face AR SDK** — WebAR SDK khusus glasses try-on, trial gratis 14 hari, tracking dasar 68 titik wajah dengan jangkauan sudut kepala -90° s/d +90°, harga berdasarkan platform + fitur + MAU (kontak sales untuk kuota).
- **Perfect Corp (YouCam)** — punya fitur AR eyewear yang bisa generate render 3D "cukup" dari 3 foto produk saja (bukan photogrammetry penuh) — relevan kalau katalog frame banyak dan tidak realistis di-scan 3D satu per satu.
- **Cocok kalau:** mau realisme tinggi cepat, effort digitalisasi katalog jadi concern utama, dan ada budget bulanan untuk lisensi.

### Tier 3 — Enterprise (vendor yang sama persis dipakai Transitions)

- **FittingBox langsung** — kalau targetnya benar-benar "identik" dengan Transitions, ini vendor aslinya. Tapi ini enterprise B2B (harga custom by request, biasanya termasuk biaya digitalisasi katalog per SKU), lebih masuk akal untuk skala brand nasional/multi-negara ketimbang optik regional 4 cabang.
- **Catatan:** FittingBox memegang beberapa paten internasional soal metode try-on mereka. Ini bukan berarti konsep "deteksi wajah + overlay 3D kacamata" dimonopoli — banyak vendor lain (Banuba, Perfect Corp, ModiFace, dst.) implementasi versi sendiri secara independen — tapi kalau opsi ini nanti diseriusin di level enterprise, ada baiknya legal/tim dev cek dokumentasi resmi FittingBox soal lingkup klaim patennya. Ini bukan nasihat hukum, cuma poin wajar untuk dicek.

| | Tier 1: Open-Source | Tier 2: SDK Komersial | Tier 3: Enterprise |
|---|---|---|---|
| Biaya bulanan | Rp0 (cuma hosting) | Menengah (mulai puluhan-ratusan $/bulan tergantung fitur+MAU) | Tinggi, custom quote |
| Waktu ke rilis | Lebih lama (bangun dari nol) | Cepat (plug-in SDK) | Cepat, tapi proses procurement lama |
| Kepemilikan kode | Penuh | Bergantung SDK vendor | Bergantung vendor |
| Effort digitalisasi katalog | Manual per SKU (bisa pakai app scan foto seperti Polycam/KIRI Engine) | Sebagian dibantu vendor (mis. Perfect Corp dari 3 foto) | Dibantu penuh vendor (biaya termasuk) |
| Paling pas untuk | Dikerjakan coding agent seperti Antigravity | Butuh cepat, budget ada | Skala besar, brand nasional |

---

## Bagian 5 — Inti Algoritma: Biar "Pas" di Semua Wajah

Ini bagian yang langsung menjawab concern utama. Ada beberapa masalah teknis terpisah yang sering ketuker jadi "satu masalah fitting" doang, padahal beda-beda:

### 5.1 Skala (ukuran frame beneran proporsional, bukan cuma "kelihatan pas")

Ini akar dari kenapa try-on murahan sering kelihatan aneh: kacamatanya di-resize manual sampai "kelihatan enak di layar", bukan berdasarkan ukuran fisik asli. Padahal semua frame kacamata sudah punya kode ukuran standar industri yang tercetak di bagian dalam gagang — format **lebar-lensa (mm) □ lebar-jembatan (mm) - panjang-gagang (mm)**, misalnya `52□18-140`. Itu bukan angka sembarangan, itu data yang harus dicatat per SKU di database katalog.

Di sisi wajah user, MediaPipe Face Landmarker menghitung geometri wajah dalam satuan metrik nyata (cm/mm), bukan cuma posisi piksel di layar — karena dia mencocokkan model wajah kanonik (ukuran rata-rata manusia dewasa) ke wajah yang terdeteksi, lalu menghasilkan transformation matrix yang sudah termasuk faktor skala. Konsekuensinya: kalau aset 3D kacamata disiapkan (di-align) satu kali terhadap model wajah kanonik itu dengan skala mm yang benar, lalu di-runtime tinggal dikalikan transformation matrix yang sama — otomatis ukurannya proporsional ke wajah user tanpa perlu logika resize manual tiap sesi.

Jarak antar-pupil (PD) orang dewasa umumnya disebut berkisar 54–74mm tergantung individu, dengan rata-rata di sekitar 60–65mm — variasinya cukup lebar. Ini kenapa kalau sistem cuma pakai satu angka rata-rata yang di-hardcode, hasilnya pas untuk kebanyakan orang tapi meleset untuk yang di ujung distribusi (wajah lebih kecil/lebar dari rata-rata). FittingBox sendiri punya opsi tambahan: kalau user tahu PD aslinya (dari resep kacamata lama), itu dipakai untuk koreksi presisi ekstra di atas estimasi otomatis.

### 5.2 Posisi & Rotasi Real-Time

Transformation matrix yang sama dari 5.1 juga membawa data rotasi & posisi kepala. Ini yang bikin kacamata ikut miring saat kepala menunduk/menoleh, nempel presisi di titik jembatan hidung, bukan "melayang" di depan wajah. Secara teknis, tiap SKU kacamata butuh kalibrasi posisi sekali di awal (menentukan titik pivot di jembatan hidung sebagai titik nol objek 3D-nya) — ini kerjaan satu kali per SKU, bukan per user.

### 5.3 Oklusi (Rambut/Tangan Menutupi Muka)

Biar kacamata tidak "mengambang" saat ada rambut atau jari lewat di depan wajah: bikin mesh 3D wajah dari 478 titik landmark yang sama (MediaPipe sudah menyediakan data triangulasi wajahnya), render mesh itu cuma ke depth buffer (bukan warna) di WebGL — supaya objek yang lebih dekat ke kamera (rambut, tangan) otomatis "menutupi" kacamata secara visual lewat depth-test standar, tanpa perlu model AI segmentasi tambahan yang berat.

### 5.4 Kalibrasi & Testing Lintas Wajah

Poin ini sering kelewat: sebelum dianggap "selesai", perlu testing manual di kombinasi wajah yang representatif — bentuk wajah beda (bulat, oval, kotak, lonjong), ukuran beda (kecil-besar), dan pencahayaan beda (indoor redup vs outdoor terang, karena akurasi deteksi landmark sensitif ke pencahayaan). Untuk konteks Indonesia, tambahkan satu skenario spesifik: **wajah dengan hijab/penutup kepala** — perlu dicek apakah landmark detector tetap stabil saat sebagian frame wajah (dahi, sisi kepala) tertutup kain, karena ini akan jadi pengalaman umum untuk sebagian besar calon pelanggan.

Contoh pola inisialisasi (ilustratif untuk referensi awal developer — bukan kode siap pakai, tetap cek dokumentasi resmi MediaPipe untuk versi/URL model terbaru):

```javascript
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
);

const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: "<url model resmi dari docs MediaPipe>", delegate: "GPU" },
  outputFacialTransformationMatrixes: true,
  runningMode: "VIDEO",
  numFaces: 1,
});

// tiap frame video:
const result = faceLandmarker.detectForVideo(videoElement, performance.now());
const matrix = result.facialTransformationMatrixes[0].data; // posisi+rotasi+skala kepala
glassesObject3D.matrix.fromArray(matrix); // terapkan ke model kacamata di Three.js
glassesObject3D.matrixAutoUpdate = false;
```

---

## Bagian 6 — Checklist UX Biar "Kece" (bukan cuma akurat secara teknis)

- Copy izin kamera yang jelas manfaatnya ("Coba kacamata langsung di wajahmu, foto tidak disimpan") — bukan cuma prompt default browser.
- Ganti warna/frame instan tanpa re-scan wajah dari nol (pisahkan proses deteksi wajah dari proses load aset produk).
- Preload aset 3D produk populer di background saat user masih di layar pilih layout, biar pas masuk AR tidak ada jeda loading.
- Tampilan before/after atau perbandingan 2 frame berdampingan.
- Capture & langsung bisa cetak strip/card (fitur ini sudah ada di I See You — pertahankan, ini nilai tambah yang Transitions justru tidak punya).
- Indikator jelas kalau lagi "mencari wajah" vs "wajah terdeteksi, siap coba" — biar user tidak bingung saat belum ter-detect.

---

## Bagian 7 — Pertimbangan Khusus Konteks Indonesia

- **Device target:** mayoritas user kemungkinan besar Android kelas menengah, bukan iPhone terbaru. MediaPipe (WASM+WebGL) sudah teruji jalan di device kelas ini, tapi tetap wajib load-test di 2-3 HP Android low-mid (bukan cuma di laptop dev).
- **Ukuran aset:** pakai format `.glb` terkompresi (Draco/Meshopt) biar loading tetap cepat di koneksi seluler kota-kota seperti Purbalingga/Wonosobo/Cilacap yang rata-rata bandwidth-nya tidak sekencang Jakarta.
- **HTTPS wajib:** akses kamera browser (`getUserMedia`) cuma jalan di HTTPS — pastikan setup hosting/CDN sudah benar sebelum development AR dimulai.
- **Browser default Android:** test juga di Chrome Android & Samsung Internet, bukan cuma desktop Chrome — kadang ada perbedaan perilaku permission kamera.

---

## Bagian 8 — Brief Siap Tempel untuk Antigravity

Bagian ini bisa langsung di-copy sebagai instruksi awal ke Antigravity.

```
KONTEKS
Website: optikiseeyou.com/photobooth?mode=ar (AR Photobooth kacamata, 4 cabang optik di Jawa Tengah)
Acuan kualitas: transitions.com/id/virtual-try-on (powered by FittingBox -- lihat dokumen audit terlampir)
Goal: Tingkatkan realisme & akurasi fitting AR try-on kacamata di halaman photobooth,
tanpa lisensi vendor enterprise, dengan stack open-source.

TUGAS
1. Audit source code halaman photobooth saat ini: identifikasi library AR/face-tracking
   yang sudah dipakai (cek Network tab & package.json). Laporkan sebelum eksekusi apapun.
2. Implementasikan/upgrade face tracking pakai Google MediaPipe Face Landmarker
   (@mediapipe/tasks-vision), running mode VIDEO, aktifkan outputFacialTransformationMatrixes.
3. Bangun layer rendering 3D pakai Three.js, overlay di atas <video> feed kamera,
   sinkron ke transformation matrix dari face landmarker per frame.
4. Implementasikan auto-sizing berbasis skala mm: tiap SKU kacamata di database harus
   punya field ukuran fisik asli (format lebar_lensa-lebar_jembatan-panjang_gagang, mm),
   dan proses alignment 3D asset ke canonical face model dilakukan sekali per SKU
   (bukan dihitung ulang tiap sesi user).
5. Tambahkan occlusion handling: render face mesh (dari landmark yang sama) ke depth
   buffer saja, supaya rambut/tangan yang lebih dekat ke kamera menutupi kacamata secara natural.
6. Pastikan proses ganti warna/frame tidak memicu re-deteksi wajah dari nol (pisahkan
   state "wajah terdeteksi" dari state "aset produk yang ditampilkan").
7. Load-test di minimal 2 device Android kelas menengah, ukur FPS & delay deteksi.
8. Sertakan UI state: "mencari wajah" vs "wajah terdeteksi", copy izin kamera yang jelas,
   dan tegaskan foto tidak diupload ke server (proses di browser).

BATASAN
- Jangan simpan/upload frame video wajah user ke server manapun -- proses harus 100% client-side.
- Kompres semua 3D asset kacamata (.glb + Draco) untuk device kelas menengah & koneksi seluler.
- Pertahankan fitur existing: pilihan layout cetak (strip/card/grid) dan output ke Instagram.

DELIVERABLE
- Demo berjalan di staging dengan minimal 3 SKU kacamata terdigitalisasi penuh (3D + data ukuran mm).
- Dokumentasi singkat cara menambah SKU baru ke pipeline (untuk tim non-teknis di toko).
```

---

## Sumber

- FittingBox — dokumentasi produk, FAQ, dan blog teknis: fittingbox.com
- Press coverage peluncuran Transitions x FittingBox (OptikNow, VisionMonday, Astorino Eye Center)
- Google — MediaPipe Face Landmarker documentation: ai.google.dev/edge/mediapipe
- Banuba — dokumentasi Face AR SDK & pricing guide: banuba.com
- Perfect Corp — rilis AR 3D eyewear try-on: businesswire.com
