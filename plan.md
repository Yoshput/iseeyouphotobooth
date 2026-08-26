# PLAN — AR Try-On 3D "Style Kacamatamoo", Khas I See You

**Dibuat:** 26 Agustus 2026
**Scope:** `app/photobooth` (mode 3D) + `app/try-on` — optikiseeyou.com
**Repo:** `Yoshput/iseeyouphotobooth` (branch `main`)
**Berdasarkan:** audit langsung ke kode di GitHub, bukan asumsi

---

## 0. TL;DR

**Bisa, gas.** Tapi ada 1 temuan penting dari hasil audit kode: fix rotasi gagang yang sempat dicoba tanggal 25 Agustus itu **cuma kepasang separuh**. Bagian paling krusial — baca rotasi kepala asli dari MediaPipe — ternyata **tidak jalan** di kode yang sekarang live, padahal datanya sudah tersedia. Kabar baiknya: ini artinya fix-nya lebih simpel dari kelihatannya, karena infrastrukturnya sudah ada, tinggal disambung.

Deadline akhir Agustus = ±5 hari dari sekarang. Plan ini dipecah 3 tier biar yang paling ngaruh dikerjain duluan, bukan numpuk semua sekaligus.

---

## 1. Analisis Referensi Kacamatamoo

Dari foto yang dikirim — kios "AI Recognition" dengan tablet, brand KACAMATAMOO:

**Pola UX yang bagus dan layak diadopsi:**
- Kamera/preview wajah jadi elemen utama layar (bukan katalog produk yang jadi fokus)
- Filter bertingkat 3 lapis: **Types → Material → Colors**, masing-masing baris chip horizontal terpisah
- Status aktif jelas: pill terisi warna solid (Types/Material), swatch dengan ring border (Colors)
- Footer 2 tombol dengan hierarki jelas: **Back** (outline, kiri) vs **CTA utama** (solid, kanan) — "Check our availability"
- Subtitle kecil di kanan atas ("AI-Powered Virtual Try-On System") — nambah kredibilitas tanpa makan tempat
- Chrome minim, banyak white space, fokus ke wajah customer

**Yang HARUS diubah biar jadi "khas I See You", bukan tempelan Kacamatamoo:**

| Elemen Kacamatamoo | Versi I See You |
|---|---|
| Background kios teal/mint | Ivory `#FAF6EC` (token `isy-ivory` yang sudah dipakai di homepage) |
| Aksen hijau-teal generic | `isy-green-bright` `#2FA84F` (CTA), `isy-green-deep` `#1B4332` (teks aktif) |
| Font generic sans | `Inter` (body) + `Playfair Display` (judul) — sudah jadi identitas situs |
| Label "Types/Material/Colors" | "Tipe / Material / Warna" — konsisten Bahasa Indonesia kayak copy lain di situs |
| CTA "Check our availability" | Reuse flow WA "Tanya Stok" yang sudah jadi (bukan bikin baru) |
| Badge generic AI | Badge "AI Match" — sudah ada di produk kamu, tinggal dipakai ulang di layar ini |

Intinya: **pola interaksinya dipakai, bukan tampilannya.** Struktur 3-filter + camera-first + 2-button footer itu solid secara UX, tapi semua permukaan visualnya di-swap total pakai token brand yang sudah establish di `tailwind.config.ts`.

---

## 2. Root Cause — Kenapa Gagang Masih "Ngambang" (Hasil Audit Kode)

### 2.1 Yang benar-benar jalan sekarang di `components/ar/Glasses3DRenderer.tsx`

Komentar di kepala file bilang ini "v3 (stable)" dan rotasinya dari "Euler from landmark Z-depth". Fungsi intinya:

```ts
function computePoseEuler(lm, videoW, videoH) {
  const yaw = ((rightCheek.z ?? 0) - (leftCheek.z ?? 0)) * 1.8;
  const pitch = -((chin.z ?? 0) - (forehead.z ?? 0)) * 1.8;
  // ...
}
```

Ini **estimasi kasar** dari selisih Z dua-tiga titik landmark, dikali angka 1.8 yang ditentukan manual (bukan hasil kalkulasi geometris). Ini bukan head-pose solve yang sebenarnya — cuma proxy. Wajar kalau hasilnya kadang meleset, dan wajar juga kalau lebih parah di satu sisi (laporan bug kamu: "terutama sisi kanan") karena landmark cheek kiri/kanan gak selalu confidence-nya simetris.

### 2.2 Yang seharusnya jalan (dan datanya SUDAH ada, tinggal gak dipakai)

Cek `lib/mediapipe.ts` — konfigurasi FaceLandmarker kamu:

```ts
outputFacialTransformationMatrixes: true,  // sudah ON, di GPU path DAN CPU fallback
```

Artinya MediaPipe **sudah menghitung** matrix rotasi kepala 6DOF yang akurat (hasil face-model fit internal, bukan proxy) di setiap frame — tersedia di `result.facialTransformationMatrixes[i].data`. Tapi `Glasses3DRenderer.tsx` **tidak pernah membaca field ini**. Datanya lewat begitu saja.

### 2.3 Kenapa ada gap antara dokumentasi dan kode

`ROTATION-FIX-SUMMARY.md` (tanggal 25 Agustus, sama dengan tanggal bug report) mendeskripsikan v3 yang seharusnya pakai `facialTransformationMatrixes` → quaternion + `PerspectiveCamera` (ganti dari Orthographic). Tapi kode yang live sekarang **masih pakai `OrthographicCamera`** dan **masih pakai `computePoseEuler()` manual** — bukan quaternion dari matrix.

Yang KEPASANG dari eksperimen itu cuma: SLERP smoothing, temple-fade clipping (65%), dan props `pivotOffset`/`rotationOffsetDeg` per-model. Yang DIBATALKAN: sumber rotasi dan ganti kamera.

Dugaan paling masuk akal: ganti ke `PerspectiveCamera` merusak sistem anchor pixel-perfect yang sekarang (posisi/scale dihitung asumsi 1 unit Three.js = 1 px CSS, itu properti khusus Orthographic), jadi seluruh percobaan di-rollback bareng — padahal bagian rotasi (matrix→quaternion) sebenarnya AMAN dipisah dan gak nyentuh sistem anchor sama sekali.

**Catatan proses:** komentar di file bilang "DO NOT change rotation logic" — ini sekarang justru mengunci logic yang jadi sumber bug. Setelah Fix #1 di bawah selesai dan lolos QA, comment ini perlu diupdate biar gak bikin bingung dev/agent berikutnya.

---

## 3. Rencana Perbaikan — Gagang Sampai ke Belakang Telinga

### 3.1 Fix #1 (prioritas tertinggi, risiko rendah): pakai `facialTransformationMatrixes`

Ganti HANYA sumber rotasi, jangan sentuh kamera atau anchor math. Ini isolated dan gampang di-test sendiri.

```ts
// Tambahan helper (bisa taruh di lib/landmarks.ts)
function quaternionFromFacialMatrix(matrixData: number[]): THREE.Quaternion {
  const m = new THREE.Matrix4().fromArray(matrixData); // column-major, cocok format MediaPipe
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();
  m.decompose(pos, q, scale); // ambil rotasi murni, buang translation & scale
  return q;
}
```

Di `updateFromResult()`, ganti blok D:

```ts
// SEBELUM
const { pitch: rp, yaw: ry, roll: rr } = computePoseEuler(landmarks, videoWidth, videoHeight);
const rawQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rp, ry, -rr, "YXZ"));

// SESUDAH — fallback tetap dipertahankan buat device/frame yang matrix-nya kosong
const matData = result.facialTransformationMatrixes?.[i]?.data;
const rawQuat = matData
  ? quaternionFromFacialMatrix(matData)
  : new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...Object.values(computePoseEuler(landmarks, videoWidth, videoHeight)), "YXZ")
    );
rawQuat.y *= -1; // mirror-fix video CSS -scaleX (selfie) — tanda persis perlu dicek pas testing pertama
const smoothQ = slerpEMA(slot, rawQuat, alpha);
```

`computePoseEuler()` **tidak usah dihapus** — biarin jadi fallback kalau matrix kosong (device lama/frame drop). Ini satu-satunya perubahan di Fix #1: kamera tetap Orthographic, anchor/scale tetap seperti sekarang.

### 3.2 Fix #2: kalibrasi per-model yang belum pernah dilakukan

Cek `public/glasses/manifest.json` — **keenam** entry yang punya `model3D` semuanya masih `pivotOffset: {0,0,0}` dan `rotationOffsetDeg: {0,0,0}` — nilai default, belum pernah disentuh. Infrastruktur kalibrasinya udah ada (termasuk `SCALE_DEBUG=true` yang udah built-in buat lihat yaw/pitch/scale live), cuma emang belum pernah dipakai satu-satu:

| id | Model 3D | Status kalibrasi |
|---|---|---|
| `oval-pastel` | Hexagonal Crystal Transparan | belum |
| `round-frame` | Oval Bulat Metal Gold | belum |
| `cateye-frame` | Sunglasses Bellagio Havana | belum |
| `square-frame` | Kotak Plastik Hitam | belum |
| `clubmaster-frame` | Kotak Clubmaster Metal | belum |
| `sunglasses-square-metal` | Sunglasses Aviator Gold | belum |

Model-model ini asalnya dari aset generik (nama file kayak `cyberpunk_johnny_silverhand_glasses.glb` jelas dari marketplace 3D umum, bukan hasil scan produk asli toko) — jadi origin/pivot masing-masing GLB gak konsisten satu sama lain. Setelah Fix #1 beres, lakuin kalibrasi manual keenamnya: `rotationOffsetDeg` dulu (biar simetris pas hadap depan), baru `pivotOffset` (kalau nose bridge meleset), baru `templeFadeStart` (biar panjang gagang yang keliatan pas).

### 3.3 Fix #3: kompresi GLB — ada yang 11MB!

```
cyberpunk_johnny_silverhand_glasses.glb   11 MB   ← dipakai utk "Sunglasses Aviator Gold"
glasses_kotak_frame_coklat.glb             5.0 MB  ← "Kotak Plastik Hitam"
sunglasses_v2.glb                          4.0 MB  ← "Cat-Eye Lebar"
glasses_transparan.glb                     1.5 MB
metal_round_glasses.glb                    597 KB
glasses1/glasses01.glb                     427 KB  ← bukti ukuran kecil itu mungkin
```

11MB buat 1 model kacamata di web try-on yang bakal diakses pengunjung mall pakai data seluler itu risiko besar buat "aman stabil" — bisa bikin load lama/gagal di koneksi lemah, apalagi pas event booth rame. Target: semua GLB di bawah ~1.5MB pakai `gltf-transform` (`npx @gltf-transform/cli optimize --texture-compress webp`).

**Peringatan teknis:** di `Glasses3DRenderer.tsx`, deteksi material lensa/nosepad pakai exact match nama mesh (`meshName === "object_41"`, dll) — nama default dari software 3D asal file. Kompresi/re-export BISA mengganti nama-nama ini secara diam-diam, dan kalau itu terjadi lensa bisa jadi solid/opaque lagi. **Wajib re-test isLens/isNosePad setelah setiap kompresi**, jangan asumsikan aman.

### 3.4 Pertimbangan khusus: gagang + hijab/kerudung

`audit-teknis-ar-tryon-iseeyou.md` kamu sendiri sudah nyatet ini secara umum ("perlu dicek apakah landmark detector tetap stabil saat sebagian frame wajah tertutup kain... ini akan jadi pengalaman umum untuk sebagian besar calon pelanggan") — dan foto referensi Kacamatamoo yang kamu kirim juga modelnya pakai hijab. Ini relevan LANGSUNG ke fitur gagang-ke-telinga:

Untuk user berhijab, telinga fisik tertutup kain — MediaPipe cuma track kontur wajah yang keliatan, gak bisa "menembus" kain. Bukan berarti fitur ini gagal buat mereka, tapi kalibrasinya beda: gagang idealnya fade/berhenti di titik yang wajar sebelum menyentuh area yang ketutup kain, bukan dipaksa memanjang sampai "belakang telinga" secara literal. `templeFadeStart` yang sekarang (0.6–0.65) sudah di rentang aman buat ini — jangan dinaikin coba bikin gagang makin panjang tanpa testing pakai user berhijab dulu.

**Actionable:** masukin skenario wajah berhijab sebagai test case UTAMA di QA (bukan edge case), dari hari pertama testing — bukan ditambah belakangan.

### 3.5 Kenapa `PerspectiveCamera` BELUM sekarang

`OrthographicCamera` bikin gagang yang menjauh secara Z gak mengecil (gak ada foreshortening) — itu benar sebagai limitasi. Tapi ganti ke Perspective berarti seluruh sistem anchor/scale pixel-perfect (yang sekarang jalan stabil untuk posisi X/Y kacamata) harus dihitung ulang dari nol pakai FOV/depth math. Itu perubahan besar, risiko tinggi, dan payoff visualnya lebih kecil dibanding fix rotasi (masalah utama laporan bug itu "gagang salah arah", bukan "gagang gak mengecil pas nunduk"). **Dorong ke Tier 3**, dikerjain santai pasca-deadline dengan siklus testing sendiri — jangan dipaksa masuk minggu ini.

---

## 4. UI Filter Tipe / Material / Warna — Khas I See You

### 4.1 Data model: tambah field `material` ke `manifest.json`

Field ini belum ada sama sekali di manifest kamu sekarang. Usulan mapping awal berdasarkan nama & `metalColor` yang sudah ada di data:

| id | name | style | usulan `material` |
|---|---|---|---|
| `oval-pastel` | Hexagonal Plastik Pastel | Hexagonal | `plastic` |
| `round-frame` | Oval Kecil | Oval | `metal` |
| `cateye-frame` | Cat-Eye Lebar | Cat-Eye | `plastic` |
| `square-frame` | Kotak Plastik Hitam | Square | `plastic` |
| `clubmaster-frame` | Kotak Clubmaster | Browline | `mixed` |
| `sunglasses-square-metal` | Sunglasses Aviator Gold | Aviator | `metal` |

4 entry 2D-only lainnya di manifest belum sempat kecek detail-nya — sisain kolom ini kosong dulu di data, isi belakangan pas kamu review katalognya. Untuk baris **Types**, jangan hardcode daftar manual — generate otomatis dari nilai unik field `style` yang sudah ada di manifest, biar konsisten kalau nambah kacamata baru.

### 4.2 Komponen: `FilterChipRow` (extend pola `TimerChips` yang sudah ada)

Kamu sudah punya `TimerChips` dan strip chip kacamata di `app/photobooth/page.tsx` (baris ~1396-1430) dengan styling pill yang sudah mateng:

```tsx
className={`... ${isSelected
  ? "border-isy-green-bright bg-isy-green-bright/10 text-isy-green-deep shadow-md"
  : "border-isy-line bg-white text-isy-ink/60 hover:border-isy-green-bright/50"}`}
```

Generalisasi pola ini jadi 1 komponen reusable `components/ar/FilterChipRow.tsx`, dipakai 3x (Tipe/Material/Warna) di atas strip pilihan kacamata yang sudah ada. Baris Warna pakai swatch bulat kecil — pola yang sama persis dengan dot warna yang sudah ada di tiap chip kacamata sekarang (`<div className="h-2 w-2 rounded-full" style={{backgroundColor: g.color}} />`), tinggal diperbesar jadi elemen pilihan sendiri.

Filter dari ketiga baris ini tinggal nambah `.filter()` ke `activeGlassesList` yang sudah ada di `useMemo` — bukan bikin state management baru dari nol.

### 4.3 Token styling (dari `tailwind.config.ts`, sudah final — tinggal pakai)

```
isy-white        #FFFFFF
isy-ivory        #FAF6EC   ← background panel filter
isy-mist         #F3F8F4
isy-green-deep   #1B4332   ← teks/label aktif
isy-green-bright #2FA84F   ← CTA & border chip aktif
isy-ink          #16241C   ← teks default
isy-line         #E3ECE6   ← border chip non-aktif
font: Inter (body), Playfair Display (heading)
```

### 4.4 Layout ringkas

Camera preview tetap jadi elemen terbesar di atas (sudah begitu). Di bawahnya, 3 baris filter compact — label pendek kiri ("Tipe", "Material", "Warna") + chip/swatch scroll horizontal kanan, background `isy-ivory` biar beda dari canvas putih video. Footer 2 tombol: kiri outline "Kembali", kanan solid `isy-green-bright` — reuse CTA WA "Tanya Stok" yang sudah jadi, jangan bikin flow CS baru.

---

## 5. Roadmap Eksekusi

### TIER 1 — Wajib, sebelum deadline (±5 hari)
1. Fix #1: swap sumber rotasi ke `facialTransformationMatrixes` (isolated, ~1 file)
2. Smoke test di device asli pakai QA checklist §7 di bawah — termasuk skenario hijab dari hari pertama
3. Fix #2: kalibrasi manual 6 model 3D yang ada (pakai `SCALE_DEBUG` yang sudah built-in)
4. Fix #3: kompresi GLB terberat (11MB, 5MB, 4MB) + re-verify material matching

### TIER 2 — Kalau Tier 1 sudah aman
5. Tambah field `material` ke manifest + isi 6 entry di atas
6. Bangun `FilterChipRow` + 3 baris filter (Tipe/Material/Warna) di atas strip kacamata
7. Reskin panel filter pakai token `isy-*` sesuai §4.3–4.4

### TIER 3 — Pasca-deadline / produksi jangka panjang
8. `PerspectiveCamera` + re-derive anchor math dengan depth-aware projection (lihat §3.5)
9. Ganti aset GLB generik dengan scan/model custom dari kacamata fisik toko (bukan lagi demo-only batch)
10. Perluas taksonomi Tipe/Material ke seluruh katalog situs, bukan cuma try-on

---

## 6. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Fix #1 bawa regresi baru | Isolasi ke 1 fungsi, jangan sentuh kamera/anchor; test pakai tabel QA §7 sebelum lanjut ke fix lain |
| Kalibrasi 6 model makan waktu mepet deadline | Cukup kalibrasi batch demo (5 kacamata yang udah jadi target awal), sisanya nyusul |
| Kompresi GLB diam-diam ganti nama mesh → lensa jadi opaque | Wajib re-test isLens/isNosePad tiap habis kompresi, jangan asumsi aman |
| Skenario hijab ternyata nemu masalah landmark yang lebih dalam | Test dari HARI PERTAMA, bukan di akhir — kalau ada temuan besar, itu worth tau lebih awal |
| Field `material` subjektif/salah klasifikasi | Pakai tabel usulan di §4.1 sebagai draft, boleh dikoreksi toko belakangan, gak nge-block rilis |

---

## 7. QA Checklist — "Aman Stabil, Jelas Gambarnya"

Lanjutin 5 baris yang sudah ada di `ROTATION-FIX-SUMMARY.md`, tambah baris ini:

| # | Kondisi | Yang Diharapkan |
|---|---|---|
| 6 | **Wajah dengan hijab/kerudung** | Gagang fade wajar sebelum area tertutup kain, tracking tetap stabil (dahi/sisi kepala tertutup) |
| 7 | **6 model 3D, satu-satu** | Semua simetris kiri-kanan saat hadap depan (bukti kalibrasi §3.2 selesai) |
| 8 | **Koneksi 3G/4G lambat (throttle)** | Model GLB ≤1.5MB masing-masing, load tidak >3-4 detik |
| 9 | **Lintas device** | Android, iOS Safari, MacBook, tablet — sesuai requirement stabilitas kamu yang sudah ada |
| 10 | **Ganti-ganti kacamata cepat via filter baru** | Tidak ada flicker/crash saat filter Tipe/Material/Warna dipakai berturutan |

---

## 8. Prompt Siap Pakai — Fix #1 (Prioritas Pertama)

```
Perbaiki sumber rotasi kacamata 3D di components/ar/Glasses3DRenderer.tsx.

KONTEKS: outputFacialTransformationMatrixes sudah true di lib/mediapipe.ts,
tapi Glasses3DRenderer.tsx masih pakai computePoseEuler() (estimasi manual
dari landmark Z-depth) alih-alih result.facialTransformationMatrixes yang
sudah tersedia dan lebih akurat.

TUGAS:
1. Tambah helper quaternionFromFacialMatrix(matrixData) di lib/landmarks.ts
   — pakai THREE.Matrix4.fromArray().decompose() untuk ambil quaternion murni.
2. Di updateFromResult(), ganti blok rotasi (D): baca
   result.facialTransformationMatrixes?.[i]?.data, convert ke quaternion.
   Kalau data itu undefined, FALLBACK ke computePoseEuler() yang lama
   (jangan dihapus).
3. Terapkan mirror-fix (negate salah satu axis quaternion) untuk video
   selfie yang di-mirror CSS -scaleX — cek tandanya langsung di device asli.

JANGAN UBAH: OrthographicCamera, sistem anchor/scale (blendedAnchorY,
Y_OFFSET_FACTOR, ipdNorm), SLERP smoothing, temple-fade clipping,
pivotOffset/rotationOffsetDeg per-model. Semua itu sudah stabil, biarkan.

SETELAH SELESAI: update komentar di kepala file (baris 1-17) supaya
mencerminkan sumber rotasi yang baru, dan jalankan QA checklist 10 baris
di plan.md §7 sebelum lanjut ke fix berikutnya.
```
