# Brief Perbaikan AR Try-On 3D — Kacamata Tidak Pas di Wajah (Gagang Tidak Mengarah ke Telinga)

**Project:** isy-photobooth (Optik I See You)
**Mode bermasalah:** `?mode=3d` (GLB models, folder `public/glasses/models3D/*`)
**Referensi kualitas target:** https://www.transitions.com/id/virtual-try-on/

---

## 1. Diagnosis dari Screenshot

Dari 7 screenshot yang dikirim, semua kacamata 3D (oval metal gold, hexagonal crystal, kotak plastik hitam, kotak clubmaster, sunglasses aviator gold, dst) punya pola kegagalan yang **sama persis**:

1. **Frame depan (bridge + lens) posisinya kurang lebih benar** — nempel di area mata/hidung.
2. **Gagang (temple arm) kanan selalu "mengambang"** — terlihat lurus menjulur ke arah pipi/udara, tidak menekuk atau mengarah ke telinga. Ini paling kelihatan di foto oval metal gold dan kotak clubmaster — gagangnya nembus ke depan pipi, bukan ke samping menuju telinga.
3. Ini terjadi **konsisten di semua model**, bukan cuma 1-2 model → artinya ini **bukan masalah aset per-model**, tapi masalah di level **rotasi/orientasi objek 3D relatif terhadap kepala**.

Kesimpulan: file `Ringkasan Perbaikan AR Try-On 3D` (screenshot ke-8) yang sudah dikerjakan Antigravity sebelumnya **hanya membenahi translasi & skala** (anchor Y, offset, IPD, scale) — itu memang perlu, tapi **tidak menyentuh akar masalah gagang**, yaitu:

> **Rotasi kacamata 3D saat ini dihitung dari data yang tidak cukup (kemungkinan cuma dari 2D landmark / vektor mata untuk roll saja), padahal untuk gagang bisa "mengarah ke telinga" dengan benar, kacamata butuh rotasi penuh 3-axis (yaw, pitch, roll) mengikuti orientasi kepala di ruang 3D — bukan cuma posisi 2D di layar.**

Kalau kepala menoleh sedikit (yaw) atau mendongak (pitch), tapi objek kacamata cuma di-translate mengikuti titik mata di layar tanpa di-*rotate* sesuai orientasi kepala yang sebenarnya, hasilnya: frame depan kelihatan "nempel" (karena translasi benar), tapi gagang menjulur ke arah kamera bukan ke arah telinga (karena rotasi salah/tidak ada).

Ini juga menjelaskan kenapa **"beberapa frame yang pas dan benar, tapi tidak semua"** — kebetulan pas ketika wajah user menghadap kamera nyaris lurus (yaw & pitch mendekati nol), rotasi yang salah jadi tidak kelihatan. Begitu kepala miring sedikit saja, gagang langsung "konyol".

---

## 2. Kenapa Transitions.com / Ditto / Ray-Ban Virtual Mirror Bisa Rapi

Sistem try-on kelas produksi seperti Transitions memakai pipeline seperti ini:

- **6DOF head pose** (posisi X/Y/Z + rotasi yaw/pitch/roll penuh) dari face tracker, bukan cuma titik-titik landmark 2D.
- Objek kacamata **diletakkan sebagai child dari sebuah "head anchor" 3D** yang transform-nya = transform kepala. Jadi kacamata otomatis ikut rotasi kepala secara natural (parent-child transform), bukan dihitung ulang manual tiap frame.
- Model kacamata sudah **di-rigging/di-siapkan supaya origin (pivot) ada tepat di titik tengah nose bridge**, dengan sumbu forward yang konsisten di semua aset.
- Panjang gagang biasanya **sengaja tidak dibuat menyentuh telinga secara fisik** — karena tiap wajah beda lebar/bentuk telinga, gagang statis (rigid mesh, non-bending) yang "dipaksa nempel ke telinga" justru sering terlihat aneh. Solusinya: gagang di-render pendek/di-fade sebelum titik telinga, sehingga mata tidak sempat menilai apakah dia "pas" ke telinga atau tidak — fokus visual tetap di frame depan.

---

## 3. Rencana Perbaikan (untuk dieksekusi di Antigravity)

### A. Ganti sumber rotasi: pakai 6DOF pose dari MediaPipe langsung

Kalau saat ini rotasi dihitung manual dari 2 titik landmark mata (misal `Math.atan2` dari leftEye/rightEye untuk roll saja), **ganti ke `facialTransformationMatrixes`** milik MediaPipe FaceLandmarker — ini API bawaan yang sudah menghitung transform 4x4 kepala (posisi + rotasi penuh) di ruang kamera, jadi tidak perlu rekonstruksi manual dari titik 2D.

Langkah:
1. Saat inisialisasi `FaceLandmarker`, pastikan opsi `outputFacialTransformationMatrixes: true` diaktifkan.
2. Di hasil deteksi tiap frame, ambil `result.facialTransformationMatrixes[0].data` (matrix 4x4 kepala).
3. Convert matrix ini ke `THREE.Matrix4`, lalu `decompose()` jadi `position`, `quaternion`, `scale`.
4. Terapkan `quaternion` ini **langsung** ke object 3D kacamata (bukan Euler manual per-axis), supaya rotasi 3-axis kepala terbawa semua — termasuk yaw yang selama ini kemungkinan diabaikan.
5. EMA smoothing tetap dipakai, tapi smoothing dilakukan di level **quaternion (slerp)**, bukan di sudut Euler mentah — slerp mencegah "gimbal lock"/jitter aneh saat kepala menoleh cepat.

### B. Sinkronkan skala & FOV kamera (Three.js) dengan kamera device

Kalau renderer 3D pakai `OrthographicCamera` atau FOV yang tidak match kamera video, hasil rotasi tetap akan terlihat "melenceng" walau datanya sudah benar, karena perspektif render tidak sama dengan perspektif video asli.

- Gunakan `PerspectiveCamera` di Three.js dengan FOV yang disesuaikan ke resolusi & aspect ratio video capture.
- Posisi kamera 3D virtual harus konsisten dengan asumsi posisi kamera device (biasanya di titik (0,0,0), menghadap -Z).

### C. Standarisasi tiap file GLB (checklist wajib per aset)

Untuk **setiap** file di `models3D/`, `models3D/brille`, `models3D/glasses`, `models3D/glasses1`, `models3D/glasses2`, dan semua `.glb` lepas (cyberpunk_johnny_silverhand_glasses.glb, glasses_kotak_frame_coklat.glb, glasses_transparan.glb, metal_round_glasses.glb, sunglasses_v2.glb, dll), cek & benerin di Blender (atau via script gltf-transform) sebelum dipakai:

| # | Cek | Kenapa penting |
|---|---|---|
| 1 | **Origin/pivot model** ada tepat di titik tengah nose bridge (antara 2 lensa) | Kalau pivot beda-beda tiap file, hasil anchor jadi tidak konsisten walau kode sama |
| 2 | **Forward axis** konsisten (disarankan -Z menghadap depan, +Y ke atas) di semua model | Kalau ada file yang forward-nya +X, dia akan miring 90° saat pipeline yang sama diterapkan |
| 3 | **Scale real-world** — lebar frame (bridge ke bridge, atau lens kiri ke lens kanan) dalam satuan meter yang masuk akal (~0.13–0.14m untuk lebar total kacamata dewasa) | Supaya scale otomatis dari IPD lebih akurat dan tidak perlu koefisien "ajaib" per model |
| 4 | **Gagang (temple) tidak dalam pose "terbuka lebar" hasil render produk e-commerce**, tapi pose "terpasang di kepala" (menekuk ke dalam ~5-10°) | Model kacamata yang di-scan dalam posisi "terbuka flat" akan selalu terlihat "melebar" saat dipakaikan ke wajah |
| 5 | Hapus/rapikan file duplikat: `glasses_kotak frame coklat.glb` (ada spasi) vs `glasses_kotak_frame_coklat.glb` — kemungkinan file redundant, bikin bingung manifest | Kebersihan aset, hindari salah load |

### D. Solusi pragmatis untuk gagang yang tidak "pas ke telinga" (rekomendasi untuk demo)

Karena mesh GLB itu **rigid/kaku** (tidak bisa menekuk otomatis mengikuti lebar kepala tiap orang secara real-time tanpa rigging skeletal + deteksi titik telinga), ada 2 opsi realistis untuk deadline demo:

**Opsi 1 — Crop/fade gagang (direkomendasikan untuk demo, cepat & konsisten)**
- Potong panjang gagang yang dirender jadi lebih pendek (kira-kira sampai area pelipis, sebelum titik yang biasanya "meleset"), lalu beri gradient alpha fade di ujungnya.
- Efeknya: mata user tidak sempat menilai "nyambung ke telinga atau enggak", fokus visual tetap di frame depan (yang sudah rapi kalau langkah A-C dikerjakan). Ini pendekatan yang dipakai banyak try-on app komersial untuk kasus serupa.
- Implementasi: di material gagang, gunakan vertex alpha atau texture mask yang fade di 30% panjang terakhir gagang, atau langsung geometry-clip pakai `THREE.Plane` sebagai clipping plane per objek kacamata.

**Opsi 2 — Deteksi titik telinga & bengkokkan gagang secara dinamis (untuk versi produksi, bukan demo Aug ini)**
- Model kacamata perlu di-rig dengan bone di sambungan hinge (persis di ujung frame depan/awal gagang).
- MediaPipe FaceLandmarker sudah menyediakan landmark area pelipis/telinga (index ~234 kiri, ~454 kanan pada face mesh 468 titik) yang bisa dipakai sebagai target arah.
- Setiap frame, hitung sudut antara hinge point dan target telinga, lalu rotate bone gagang ke sudut itu (IK sederhana 1 bone, bukan full IK chain).
- Ini investasi dev yang jauh lebih besar (perlu re-rigging semua aset GLB) — realistis untuk roadmap pasca-launch, bukan untuk demo minggu ini.

**Rekomendasi:** untuk deadline Aug 2026 & kebutuhan "5 kacamata demo pas", pakai **Opsi 1 + perbaikan A/B/C**. Itu sudah cukup untuk membuat frame depan akurat dan gagang tidak "konyol", tanpa perlu re-rigging semua 14 file aset.

### E. Manifest per-model (biar tidak pakai angka "ajaib" global)

Tetap simpan kalibrasi kecil per model di `manifest.json` (yang sudah ada `ipdScaleRef`), tapi tambah field baru:

```json
{
  "id": "kotak-clubmaster-metal",
  "file": "models3D/glasses2/kotak_clubmaster.glb",
  "ipdScaleRef": 0.062,
  "pivotOffset": { "x": 0, "y": 0, "z": 0 },
  "rotationOffsetDeg": { "x": 0, "y": 0, "z": 0 },
  "templeFadeStart": 0.65
}
```

- `pivotOffset` & `rotationOffsetDeg`: koreksi kecil kalau setelah proses standarisasi Blender (langkah C) masih ada 1-2 model yang sedikit meleset — ini fallback manual per-model, bukan pengganti fix global di A/B.
- `templeFadeStart`: dari 0-1, di titik berapa (persen panjang gagang) fade mulai diterapkan.

---

## 4. Prompt Siap Pakai untuk Antigravity

Salin blok di bawah ini langsung ke Antigravity:

```
Saya butuh perbaikan pada fitur AR Try-On 3D (mode=3d) di project ini.

MASALAH UTAMA:
Frame depan kacamata (bridge + lensa) sudah cukup pas di posisi mata/hidung,
tapi gagang (temple arm) sisi kanan konsisten mengambang/menjulur ke arah
pipi, tidak mengikuti orientasi kepala dengan benar — terutama saat kepala
sedikit menoleh atau mendongak. Ini terjadi di SEMUA model 3D, bukan cuma
1-2 aset, jadi kemungkinan besar akar masalahnya di logika ROTASI objek
3D, bukan di aset per-model.

YANG SAYA MINTA DIKERJAKAN, URUT:

1. Cari kode yang menghitung rotasi kacamata 3D saat ini (kemungkinan di
   file terkait FaceTracker / GlassesRenderer / useFaceTracking / landmarks
   di project ini). Cek apakah rotasi dihitung manual dari 2 titik landmark
   mata (cuma roll), atau sudah pakai full head pose.

2. Ganti sumber rotasi ke `facialTransformationMatrixes` dari MediaPipe
   FaceLandmarker:
   - Pastikan `outputFacialTransformationMatrixes: true` di opsi
     FaceLandmarker.
   - Ambil matrix 4x4 dari `result.facialTransformationMatrixes[0].data`
     tiap frame, convert ke THREE.Matrix4, lalu decompose() jadi position +
     quaternion.
   - Terapkan quaternion ini langsung ke object Three.js kacamata (bukan
     Euler manual per-axis).
   - Ganti smoothing dari lerp sudut Euler ke `quaternion.slerp()` supaya
     tidak ada gimbal lock / jitter saat kepala menoleh cepat.

3. Cek kamera Three.js yang dipakai untuk render kacamata 3D — pastikan
   pakai PerspectiveCamera dengan FOV yang disesuaikan ke resolusi/aspect
   ratio video capture device, bukan OrthographicCamera atau FOV
   sembarangan, supaya rotasi yang benar juga terlihat benar secara visual.

4. Tambahkan fitur "temple fade": potong/fade-kan bagian ujung gagang
   (kira-kira 30-35% panjang terakhir) supaya tidak terlihat jelas kalau
   ujung gagang tidak presisi menyentuh telinga user (karena bentuk mesh
   GLB kaku/rigid, tidak realistis dibuat menekuk otomatis ke tiap bentuk
   wajah tanpa rigging tambahan). Bisa pakai vertex alpha gradient di
   material gagang, atau clipping plane per objek.

5. Update manifest.json tiap model kacamata di public/glasses/models3D/
   untuk menambahkan field opsional per-model: pivotOffset (x,y,z),
   rotationOffsetDeg (x,y,z), dan templeFadeStart (0-1) — sebagai koreksi
   kecil fallback kalau ada 1-2 model yang setelah fix di atas masih
   sedikit meleset, tanpa perlu edit ulang model 3D-nya.

6. Setelah semua perbaikan di atas, tolong buat 1 file
   ROTATION-FIX-SUMMARY.md yang menjelaskan: file mana yang diubah,
   fungsi mana yang diganti, dan cara test manualnya (goyangkan kepala
   kiri-kanan & atas-bawah pelan-pelan di depan kamera, gagang harus tetap
   terlihat konsisten mengikuti arah kepala, tidak menjulur ke pipi).

Jangan ubah logika translasi/scale yang sudah diperbaiki sebelumnya
(anchor Y blended, Y_OFFSET_FACTOR 0.22, IPD murni horizontal, pose factor
1.6, EMA 60ms) — fokus HANYA pada sumber rotasi + kamera + temple fade
seperti di atas.
```

---

## 5. Cara Test Setelah Antigravity Selesai (QA Checklist)

Jangan langsung percaya "keliatan pas pas doang" — cek 4 kondisi ini:

1. **Wajah lurus menghadap kamera** — frame + gagang harus simetris kiri-kanan.
2. **Kepala menoleh ±15° ke kanan/kiri** — gagang sisi yang menjauh dari kamera harus ikut memendek secara visual (foreshortening), bukan tetap lurus kaku ke pipi.
3. **Kepala mendongak/menunduk sedikit** — frame harus ikut miring mengikuti sudut pitch, bukan tetap datar horizontal.
4. **Gerak cepat kepala** — tidak ada delay/lag berlebihan, tidak ada "lompatan" tiba-tiba (tanda quaternion slerp bekerja dengan benar, bukan Euler lerp).

Kalau ke-4 kondisi ini lolos untuk minimal 5 model yang jadi target demo, baru aman dianggap "beres" untuk ditunjukkan ke atasan/client.
