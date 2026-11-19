# Audit dan Spesifikasi Eksekusi
## Promo Management System Optik I See You

**Tanggal audit:** 19 November 2026  
**Website:** https://optikiseeyou.com/  
**Repository:** https://github.com/Yoshput/iseeyouphotobooth  
**Branch acuan:** `main`  
**Target halaman promo:** https://promo.optikiseeyou.com/  
**Target CMS:** https://optikiseeyou.com/admin  
**Executor:** Antigravity  
**Model eksekusi:** Gemini 3.8 Flash  

> Dokumen ini merupakan hasil audit sumber publik dan spesifikasi implementasi. Audit ini tidak mengubah kode, database, DNS, maupun deployment. Antigravity wajib memeriksa ulang working tree, branch, environment, dan konfigurasi produksi sebelum melakukan perubahan.

---

# 1. Tujuan Pengembangan

Bangun **Promo Management System** yang terintegrasi dengan website dan CMS Optik I See You.

Admin harus dapat membuat, mengubah, menjadwalkan, menerbitkan, mengarsipkan, dan menghapus promo dari dashboard. Admin tidak perlu mengubah source code setiap kali toko memiliki program promosi baru.

Satu data promo harus dapat digunakan pada tiga tempat:

1. **Homepage `optikiseeyou.com`**  
   Menampilkan section promo mingguan, bulanan, dan promo spesial.

2. **Featured promo popup**  
   Menampilkan satu promo unggulan ketika pengunjung membuka homepage. Popup mengambil konten dari promo yang dipilih admin.

3. **Promo microsite `promo.optikiseeyou.com`**  
   Menampilkan seluruh promo yang sedang aktif, halaman detail setiap promo, gambar kolase, deskripsi, periode, dan syarat ketentuan.

Materi promosi, foto, judul, deskripsi, dan ketentuan kampanye akan disediakan kemudian. Untuk tahap pengembangan ini, bangun sistem dan komponennya terlebih dahulu. Jangan membuat klaim promo, harga, diskon, hadiah, atau materi kampanye fiktif. Jangan memasukkan data dummy ke production.

## Prinsip utama

- Satu sumber data promo untuk semua kanal.
- Semua konten promo dapat dikelola dari CMS.
- Tidak membuat sistem penyimpanan kedua yang berdiri sendiri.
- Tidak merombak fitur website yang sudah berjalan.
- Tidak mengganggu Photobooth, AR Try-On, katalog frame, softlens, blog, cabang, reservasi, dan autentikasi admin.
- Desain bersih, ringan, responsif, dan mudah digunakan.
- Gunakan identitas visual Optik I See You, bukan menyalin warna atau identitas Optik Melawai dari gambar referensi.
- Jangan menambahkan animasi, ornamen, border, shadow, atau bentuk dekoratif secara berlebihan.

---

# 2. Hasil Audit Awal

## 2.1 Website publik

Homepage yang diperiksa memiliki navigasi dan konten utama berikut:

- Katalog
- Photobooth
- Cabang
- Home Service
- Sponsor
- Quiz Frame
- Blog
- Try On AR
- Koleksi frame
- Layanan pemeriksaan mata
- Fasilitas pemeriksaan dan mesin faset
- Ulasan pelanggan
- Artikel edukasi
- Informasi cabang
- FAQ

Pada struktur homepage yang dapat diperiksa, belum ditemukan navigasi atau section khusus yang berfungsi sebagai pusat promosi. Karena itu, fitur promo perlu ditambahkan sebagai modul baru, bukan menggantikan section yang sudah ada.

**Rekomendasi penempatan:** tambahkan section Promo setelah area hero atau setelah section koleksi pilihan, sesuai hasil pemeriksaan layout aktual di browser. Section harus terlihat tanpa mendominasi konten utama.

## 2.2 Stack repository

Berdasarkan `package.json` dan file konfigurasi yang diperiksa:

| Komponen | Teknologi |
|---|---|
| Framework | Next.js 15.1.x |
| Routing | Next.js App Router |
| UI | React 18 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS 3 |
| Icon | Lucide React |
| Animasi | GSAP |
| SDK penyimpanan objek | AWS SDK S3 |
| Penyimpanan media/data | Cloudflare R2 melalui adapter yang ada |
| SDK Supabase | Terpasang sebagai dependency |

Jangan menambahkan library UI atau animasi baru sebelum memeriksa apakah kebutuhan dapat dipenuhi oleh komponen dan dependency yang sudah tersedia.

## 2.3 Struktur CMS yang sudah tersedia

`components/admin/AdminSidebar.tsx` menunjukkan modul berikut:

- Dashboard
- Katalog Frame
- Katalog Softlens
- Blog & Artikel
- Media Library
- Konten Website
- Pengaturan Global
- Proposal Sponsor
- Pengguna & Audit, khusus role `owner`

Belum ditemukan menu khusus Promo pada navigasi CMS yang diperiksa.

**Perubahan yang dibutuhkan:** tambahkan menu **Promo & Campaign** pada sidebar CMS. Ikuti pola navigasi, layout, modal, toast, form, dan tabel yang sudah dipakai modul admin lain.

Media Library sudah tersedia. Gunakan kembali fasilitas tersebut untuk mengunggah dan memilih gambar promo. Hindari membuat sistem upload kedua.

## 2.4 Temuan penting tentang penyimpanan data

File `lib/db/storage.ts` memperlihatkan bahwa `readStore()` dan `writeStore()` menggunakan Cloudflare R2 dengan pola key:

`db/{collectionName}.json`

Kode juga memiliki fallback ke filesystem lokal.

File `lib/db/repository.ts` menggunakan adapter tersebut untuk mengelola koleksi seperti frame, softlens, blog, media, settings, user, session, dan audit log.

Walaupun dependency `@supabase/supabase-js` tersedia di `package.json`, jalur repository CMS yang diperiksa menggunakan adapter R2. Jangan menganggap Supabase sebagai sumber data produksi hanya karena SDK-nya terpasang.

### Risiko yang wajib ditangani

1. `writeStore()` menangkap kegagalan penulisan ke R2 dan melanjutkan fallback ke filesystem lokal.
2. Pada lingkungan serverless, filesystem lokal tidak boleh dianggap sebagai penyimpanan permanen.
3. Pola repository yang membaca seluruh array, mengubah data, lalu menulis ulang satu file JSON dapat menimbulkan konflik jika dua admin menyimpan data secara bersamaan.
4. Antarmuka tidak boleh menampilkan status berhasil jika penyimpanan permanen gagal.

### Arahan untuk executor

Sebelum membuat repository promo:

- Periksa konfigurasi environment produksi dan pastikan adapter penyimpanan yang benar-benar aktif.
- Periksa seluruh penggunaan `readStore()`, `writeStore()`, Supabase, dan Cloudflare R2.
- Pertahankan satu sumber data yang menjadi sumber kebenaran.
- Jangan membuat tabel Supabase baru sebelum membuktikan bahwa database tersebut memang digunakan untuk data CMS produksi.
- Jika R2 JSON masih menjadi sumber data CMS, buat mekanisme penyimpanan promo yang menangani kegagalan tulis secara tegas. Evaluasi strategi per-record object atau mekanisme conditional write/version check untuk mencegah perubahan saling menimpa.
- Jangan melakukan fallback diam-diam ke filesystem lokal untuk operasi tulis production.
- Jika ternyata database relasional sudah menjadi sumber data CMS produksi, gunakan database tersebut dan ikuti migration serta authorization pattern yang berlaku.
- Dokumentasikan keputusan penyimpanan yang dipilih dan alasannya.

## 2.5 Autentikasi dan otorisasi

Repository memiliki:

- Cookie session `isy_admin_session`.
- Verifikasi session melalui `getServerAdminSession()` dan `verifySession()`.
- API guard melalui `authenticateAdminRequest()`.
- Role `owner` dan `admin`.
- Middleware yang saat ini memiliki matcher `/admin/:path*`.

Jangan mengganti atau melemahkan mekanisme autentikasi yang ada.

Semua operasi admin promo harus memeriksa session dan hak akses di server. Pemeriksaan UI atau middleware cookie saja tidak cukup untuk melindungi API.

Gunakan kebijakan role yang konsisten dengan modul CMS yang sudah ada. Jangan memberikan hak akses tambahan tanpa dasar dari aturan role saat ini.

## 2.6 Audit log

Pada `lib/db/types.ts`, tipe `AuditLog.module` belum mencantumkan modul promo.

Perluas tipe tersebut secara konsisten, misalnya dengan nilai `promos`, lalu catat aktivitas berikut:

- Membuat promo.
- Mengubah promo.
- Menjadwalkan promo.
- Menerbitkan promo.
- Menonaktifkan atau mengarsipkan promo.
- Menghapus promo.
- Mengubah promo unggulan popup.

Log harus menggunakan identitas admin yang sedang login. Jangan mencatat password, token session, atau data sensitif.

## 2.7 Identitas visual

Dokumen CMS yang sudah ada menetapkan identitas visual Optik I See You:

- `isy-ivory`: `#F8F5ED`
- `isy-emerald`: `#124734`
- `isy-green-bright`: `#2FA84F`
- `isy-mist`: `#F3F8F4`
- `isy-line`: `#E3E7DF`
- Font Poppins dan Playfair sesuai penggunaan aktual.

Gunakan token yang sudah tersedia di `tailwind.config.ts`. Periksa `design.md` dan komponen aktual sebelum membuat styling.

Gambar Optik Melawai yang diberikan pengguna hanya menjadi referensi komposisi popup: gambar pada satu sisi dan informasi pada sisi lainnya. Jangan menyalin warna merah, logo, teks, hadiah, atau identitas visual kompetitor.

## 2.8 Subdomain dan deployment

Repository memiliki `vercel.json`, tetapi keberadaan file tersebut tidak membuktikan bahwa domain produksi saat ini dikelola melalui project Vercel yang sama. Executor harus memeriksa dashboard hosting dan DNS sebelum menentukan konfigurasi final.

`next.config.ts` dan `vercel.json` juga memuat security header, termasuk CSP dan HSTS `includeSubDomains`. Implementasi subdomain wajib memperhatikan:

- HTTPS dan sertifikat SSL yang valid.
- Host routing yang benar.
- CSP `connect-src` dan sumber gambar.
- Penggunaan URL API relatif agar tidak menimbulkan masalah CORS lintas subdomain.
- Tidak memperluas cakupan cookie admin ke seluruh subdomain tanpa kebutuhan.
- Tidak membuka route admin pada microsite promo.

Pada kode saat audit, matcher middleware masih terbatas pada route admin. Jika host-based routing membutuhkan middleware untuk semua request, perubahan matcher harus dilakukan dengan hati-hati dan seluruh proteksi admin harus tetap berfungsi.

---

# 3. Arsitektur yang Direkomendasikan

## 3.1 Arsitektur satu aplikasi

Gunakan satu repository, satu deployment aplikasi jika hosting mendukung, dan satu sumber data promo.

```text
                    CMS ADMIN
             optikiseeyou.com/admin
                       |
                       v
              PROMO MANAGEMENT
              CRUD + Scheduling
              Media Library
              Popup Settings
                       |
                       v
             PROMO DATA REPOSITORY
           Satu sumber data produksi
                       |
          +------------+------------+
          |            |            |
          v            v            v
     HOMEPAGE      POPUP        PROMO MICROSITE
     Section       Featured     promo.optikiseeyou.com
     Promo         Campaign     Listing + Detail
```

Jangan membuat database promo terpisah untuk homepage dan microsite. Jangan menyalin data promo secara manual ke dua halaman.

## 3.2 Pemetaan route

Route publik microsite:

| URL publik | Fungsi |
|---|---|
| `https://promo.optikiseeyou.com/` | Daftar seluruh promo yang aktif |
| `https://promo.optikiseeyou.com/[slug]` | Detail satu promo |
| `https://optikiseeyou.com/` | Homepage dan section promo |
| `https://optikiseeyou.com/admin/promosi` | Dashboard pengelolaan promo |

Route internal Next.js dapat menggunakan namespace `/promo`:

- `/promo`
- `/promo/[slug]`

Pada subdomain, request diarahkan secara internal ke route tersebut menggunakan host-based rewrite. URL yang terlihat pengunjung tetap menggunakan `promo.optikiseeyou.com`.

Jika hosting saat ini tidak mendukung pemetaan domain ke deployment yang sama, executor boleh mengajukan alternatif deployment terpisah. Namun, aplikasi terpisah tetap wajib menggunakan repository data dan API yang sama. Jangan membuat database duplikat.

## 3.3 Konfigurasi subdomain

Jika project memang menggunakan Vercel:

1. Periksa domain utama sudah terhubung ke project yang benar.
2. Tambahkan `promo.optikiseeyou.com` melalui Project Settings > Domains.
3. Ambil nilai DNS yang diberikan oleh dashboard Vercel.
4. Tambahkan record CNAME pada penyedia DNS domain.
5. Tunggu verifikasi domain dan penerbitan SSL.
6. Uji domain dengan HTTPS.
7. Pastikan domain utama tetap mengarah ke homepage utama.

Jangan menggunakan nilai CNAME generik dari dokumentasi sebagai nilai final. Gunakan nilai spesifik yang diberikan oleh dashboard project.

Jika domain menggunakan Cloudflare atau penyedia DNS lain, ikuti instruksi hosting yang benar. Jangan mengubah nameserver, A record, atau CNAME domain utama tanpa alasan dan persetujuan.

**Catatan akses:** executor dapat menyiapkan kode routing dan memberikan instruksi DNS. Jika tidak memiliki akses ke akun domain atau hosting, jangan mengklaim subdomain sudah aktif. Tandai konfigurasi DNS sebagai pekerjaan yang menunggu akses pemilik domain.

---

# 4. Spesifikasi Data Promo

Buat tipe `PromoItem` mengikuti konvensi tipe dan repository yang sudah ada.

Field minimum yang direkomendasikan:

| Field | Fungsi |
|---|---|
| `id` | ID unik |
| `slug` | URL detail promo |
| `title` | Judul promo |
| `subtitle` | Subjudul |
| `excerpt` | Ringkasan untuk kartu |
| `description` | Deskripsi lengkap |
| `category` | `weekly`, `monthly`, atau `special` |
| `status` | `draft`, `published`, atau `archived` |
| `startAt` | Waktu mulai |
| `endAt` | Waktu berakhir |
| `heroMediaId` | ID gambar utama dari Media Library |
| `galleryMediaIds` | Daftar ID gambar tambahan |
| `detailLayout` | `image-left` atau `image-right` |
| `collageLayout` | Pilihan layout kolase yang didukung UI |
| `ctaLabel` | Label tombol aksi |
| `ctaUrl` | URL tujuan tombol |
| `termsAndConditions` | Syarat dan ketentuan |
| `showOnHomepage` | Tampilkan pada section homepage |
| `showInPopup` | Jadikan kandidat popup |
| `popupPriority` | Prioritas jika terdapat beberapa kandidat |
| `sortOrder` | Urutan tampil |
| `seoTitle` | Judul SEO |
| `seoDescription` | Deskripsi SEO |
| `createdAt` | Waktu pembuatan |
| `updatedAt` | Waktu perubahan |
| `createdBy` | Admin pembuat |
| `updatedBy` | Admin terakhir yang mengubah |

Gunakan timezone `Asia/Jakarta` untuk input dan tampilan periode. Simpan timestamp secara konsisten dalam format ISO 8601.

## 4.1 Aturan status dan visibilitas

Status yang disimpan:

- `draft`: belum dipublikasikan.
- `published`: sudah diterbitkan, tetapi visibilitas tetap mengikuti periode.
- `archived`: tidak ditampilkan secara publik.

Status tampilan dapat dihitung dari waktu:

- Terjadwal: `published` tetapi `startAt` masih di masa depan.
- Aktif: `published`, waktu sekarang berada di antara `startAt` dan `endAt`.
- Berakhir: `published`, tetapi `endAt` sudah lewat.
- Draft: belum diterbitkan.
- Diarsipkan: sengaja disembunyikan oleh admin.

Promo hanya boleh muncul di halaman publik jika statusnya `published` dan waktu saat ini berada dalam periode yang diizinkan. Jika `endAt` kosong, perlakukan sebagai promo tanpa batas akhir hanya jika form admin memang mengizinkannya.

Jangan mengandalkan status dari browser. Filter visibilitas wajib dilakukan di server.

## 4.2 Validasi data

- Slug harus unik.
- Judul wajib diisi.
- Kategori wajib dipilih.
- `startAt` harus lebih awal daripada `endAt`.
- Promo yang dipublikasikan wajib memiliki gambar utama.
- URL CTA harus berupa URL HTTPS yang valid atau path internal yang aman.
- Gambar harus berasal dari Media Library atau mekanisme upload resmi yang sudah ada.
- Deskripsi harus dirender dengan aman. Jangan memasukkan HTML mentah dari pengguna tanpa sanitasi.
- Gambar harus memiliki alt text.
- Promo yang dihapus tidak boleh meninggalkan referensi gambar yang merusak Media Library.

---

# 5. Fitur Homepage

Tambahkan section **Promo & Penawaran** pada homepage.

## 5.1 Tampilan section

Section harus memiliki:

- Judul section.
- Deskripsi pendek yang dapat diubah dari CMS jika sesuai dengan pola pengaturan konten yang ada.
- Filter atau tab kategori:
  - Semua Promo
  - Promo Mingguan
  - Promo Bulanan
  - Promo Spesial
- Kartu promo dengan gambar.
- Judul dan periode promo.
- Ringkasan singkat.
- Tombol `Lihat Promo`.
- CTA `Lihat Semua Promo` menuju `https://promo.optikiseeyou.com/`.

Tampilkan hanya promo yang memenuhi syarat publikasi dan tanggal aktif. Urutan mengikuti `sortOrder` atau prioritas yang ditetapkan admin.

Batasi jumlah kartu homepage agar section tetap ringkas. Nilai awal yang disarankan adalah maksimal 3 kartu per tampilan, dengan opsi melihat seluruh promo pada microsite.

## 5.2 Tampilan kartu

- Gunakan gambar utama atau komposisi kolase.
- Rasio gambar konsisten.
- Judul mudah dibaca.
- Periode promo terlihat jelas.
- CTA tidak terlalu besar.
- Hindari badge dan dekorasi yang berlebihan.
- Gunakan border dan shadow seperlunya.
- Pada mobile, kartu tersusun satu kolom atau carousel yang dapat di-swipe dengan kontrol yang jelas.

Jika belum ada promo aktif, section dapat disembunyikan atau menampilkan empty state yang dirancang khusus. Jangan menampilkan kartu contoh palsu.

---

# 6. Featured Promo Popup

Popup merupakan salah satu fitur utama.

## 6.1 Perilaku popup

- Tampil pada homepage setelah konten utama siap.
- Tampilkan maksimal satu promo unggulan dalam satu waktu.
- Ambil data dari promo yang dipilih admin.
- Promo harus berstatus `published` dan masih dalam periode aktif.
- Jika tidak ada promo unggulan yang valid, jangan tampilkan popup.
- Default tampil satu kali per sesi browser.
- Admin dapat mengatur frekuensi tampil, minimal pilihan `sekali per sesi` dan `sekali per 24 jam`.
- Sediakan pengaturan aktif/nonaktif popup.
- Sediakan pengaturan jeda tampil yang wajar, dengan default sekitar 1,5 detik setelah homepage siap.
- Popup tidak boleh tampil di dashboard admin, halaman login, Photobooth, AR Try-On, atau halaman microsite promo.
- Tombol close harus berfungsi.
- Tombol Escape harus menutup popup.
- Klik backdrop boleh menutup popup jika tidak mengganggu pengalaman pengguna.
- Setelah ditutup, popup tidak boleh muncul kembali terus-menerus selama periode dismiss yang berlaku.

Gunakan penyimpanan status dismiss yang aman di browser, misalnya `sessionStorage` untuk frekuensi sesi atau mekanisme timestamp untuk frekuensi 24 jam. Jangan menyimpan data sensitif.

## 6.2 Desain popup

Desktop:

```text
+------------------------------------------------------+
|                                      [ CLOSE ]       |
|                                                      |
|  +----------------------+  +----------------------+  |
|  |                      |  | JUDUL PROMO          |  |
|  |                      |  |                      |  |
|  |     GAMBAR PROMO     |  | Ringkasan promo      |  |
|  |     / KOLASE         |  | Periode promo        |  |
|  |                      |  |                      |  |
|  |                      |  | [ LIHAT PROMO ]      |  |
|  +----------------------+  +----------------------+  |
|                                                      |
+------------------------------------------------------+
```

- Layout dua kolom.
- Gambar di kiri dan informasi di kanan sebagai default.
- Admin dapat memilih layout gambar kanan dan teks kiri jika diperlukan.
- Tombol `Lihat Promo` menuju detail promo terkait pada subdomain.
- Tombol close terlihat jelas.
- Popup memiliki ukuran maksimal dan tidak memenuhi seluruh viewport secara berlebihan.

Mobile:

- Layout berubah menjadi satu kolom.
- Gambar berada di atas.
- Informasi dan CTA berada di bawah.
- Tombol close tetap mudah dijangkau.
- Tidak ada horizontal overflow.

## 6.3 Aksesibilitas popup

- Gunakan dialog semantik.
- Atur focus management dan kembalikan fokus setelah dialog ditutup.
- Dukung keyboard.
- Hormati `prefers-reduced-motion`.
- Pastikan kontras teks dan tombol memadai.
- Jangan membuat popup yang tidak bisa ditutup.
- Jangan menggunakan animasi panjang atau efek yang mengganggu.

---

# 7. Promo Microsite

Target: `https://promo.optikiseeyou.com/`

Microsite harus terasa sebagai bagian dari brand Optik I See You, tetapi memiliki fokus khusus pada informasi promosi.

## 7.1 Halaman utama promo

Elemen halaman:

1. Header dengan logo Optik I See You.
2. Navigasi sederhana.
3. Judul utama, misalnya `Promo & Penawaran`.
4. Deskripsi singkat.
5. Promo unggulan.
6. Filter kategori.
7. Daftar promo dalam bentuk kartu atau kolase.
8. Periode setiap promo.
9. Tombol untuk membuka detail.
10. Footer dengan tautan kembali ke website utama.

Kategori:

- Mingguan.
- Bulanan.
- Spesial.

Kategori harus berasal dari data CMS, bukan daftar konten hardcoded.

Jika tidak ada promo aktif pada kategori tertentu, tampilkan empty state yang informatif. Jangan menampilkan promo kedaluwarsa sebagai promo aktif.

## 7.2 Halaman detail promo

Setiap promo memiliki halaman detail berdasarkan slug.

Struktur desktop:

```text
+------------------------------------------------------+
| LOGO                         NAVIGASI                 |
+------------------------------------------------------+
|                                                      |
|  +----------------------+  +----------------------+  |
|  |                      |  | JUDUL PROMO          |  |
|  |                      |  | Subjudul             |  |
|  |   HERO IMAGE         |  |                      |  |
|  |                      |  | Deskripsi lengkap    |  |
|  |                      |  | Periode              |  |
|  +----------------------+  | [ CTA ]              |  |
|                            +----------------------+  |
|                                                      |
|  GALERI / KOLEKSI GAMBAR PROMO                       |
|                                                      |
|  SYARAT DAN KETENTUAN                                |
|                                                      |
+------------------------------------------------------+
```

Ketentuan:

- Gambar dan teks dapat berganti posisi sesuai `detailLayout`.
- Galeri mendukung lebih dari satu gambar.
- Layout kolase mengikuti `collageLayout`.
- Informasi periode terlihat jelas.
- Syarat dan ketentuan dapat dibaca dengan nyaman.
- CTA mengarah ke URL yang diatur admin.
- Tambahkan navigasi kembali ke seluruh promo.
- Pada mobile, gambar dan teks ditumpuk secara vertikal.
- Jangan membuat layout yang terlalu padat atau menggunakan banyak container bersarang.

## 7.3 SEO

- Setiap promo memiliki metadata berdasarkan judul dan deskripsi.
- Gunakan canonical URL pada domain promo.
- Buat metadata Open Graph untuk share.
- Tambahkan sitemap promo jika sesuai dengan struktur SEO yang sudah ada.
- Promo draft, archived, dan promo yang tidak aktif tidak boleh masuk sitemap publik.
- Pastikan slug menghasilkan URL yang stabil.
- Hindari duplikasi halaman yang dapat diindeks antara domain utama dan subdomain.

---

# 8. Modul CMS Admin: Promo & Campaign

Route yang disarankan: `/admin/promosi`.

Tambahkan menu **Promo & Campaign** pada sidebar. Ikuti struktur dan pola komponen CMS yang sudah ada.

## 8.1 Halaman daftar promo

Tampilkan:

- Judul promo.
- Thumbnail.
- Kategori.
- Periode.
- Status.
- Status tampil di homepage.
- Status featured popup.
- Terakhir diperbarui.
- Aksi edit, preview, arsipkan, dan hapus.

Sediakan:

- Pencarian berdasarkan judul.
- Filter kategori.
- Filter status.
- Filter promo aktif, terjadwal, dan berakhir.
- Tombol `Tambah Promo`.
- Empty state saat belum ada promo.
- Konfirmasi sebelum menghapus.

## 8.2 Form tambah dan edit promo

Bagi form ke beberapa kelompok agar mudah dipahami.

### A. Informasi utama

- Judul promo.
- Slug otomatis dari judul, tetapi dapat diedit.
- Subjudul.
- Ringkasan.
- Deskripsi lengkap.
- Kategori: mingguan, bulanan, spesial.

### B. Periode promo

- Tanggal mulai.
- Jam mulai jika diperlukan.
- Tanggal berakhir.
- Jam berakhir jika diperlukan.
- Tampilan timezone Asia/Jakarta.

### C. Media promo

- Pilih gambar utama dari Media Library.
- Upload gambar tambahan melalui mekanisme yang sudah tersedia.
- Pilih beberapa gambar untuk kolase.
- Atur urutan gambar.
- Pilih layout kolase yang tersedia.
- Isi alt text.
- Tampilkan preview sebelum disimpan.

Jangan membuat media uploader kedua jika upload dan Media Library yang ada masih dapat digunakan.

### D. Detail tampilan

- Layout gambar kiri atau kanan.
- Pilihan template kolase.
- Label CTA.
- URL CTA.
- Syarat dan ketentuan.

### E. Penempatan promo

- Tampilkan di homepage.
- Jadikan kandidat popup.
- Atur prioritas popup.
- Atur urutan tampil.
- Preview popup.
- Preview halaman detail.

### F. Publikasi

- Simpan draft.
- Terbitkan.
- Jadwalkan berdasarkan tanggal mulai.
- Arsipkan.
- Hapus dengan konfirmasi.

## 8.3 Pengaturan popup

Buat panel pengaturan popup yang mudah ditemukan.

Pengaturan minimum:

- Popup aktif/nonaktif.
- Promo yang dipilih.
- Frekuensi tampil.
- Jeda tampil.
- Preview desktop.
- Preview mobile.

Jika admin memilih promo baru sebagai featured popup, sistem harus menjelaskan bahwa promo sebelumnya akan diganti atau dinonaktifkan sebagai featured. Hindari beberapa popup yang saling berebut tampil.

## 8.4 Dashboard ringkasan promo

Jika sesuai dengan pola dashboard saat ini, tampilkan ringkasan sederhana:

- Promo aktif.
- Promo terjadwal.
- Draft.
- Promo berakhir.

Jangan menambahkan grafik atau statistik yang tidak memiliki data nyata.

---

# 9. Repository, API, dan Keamanan

## 9.1 Repository

Tambahkan fungsi sesuai pola `lib/db/repository.ts`, misalnya:

- `getPromos()`
- `getPromoById()`
- `getPromoBySlug()`
- `getPublicPromos()`
- `getFeaturedPopupPromo()`
- `savePromo()`
- `deletePromo()`
- `archivePromo()`

Nama akhir boleh mengikuti konvensi repository aktual.

Pisahkan fungsi untuk admin dan publik. Fungsi publik hanya boleh mengembalikan promo yang sudah diterbitkan dan berada pada periode aktif.

## 9.2 API

Gunakan route handler atau pola server action yang konsisten dengan project.

Kebutuhan:

- Public read untuk homepage dan microsite.
- Admin create.
- Admin update.
- Admin delete.
- Admin publish.
- Admin archive.
- Admin preview.

Semua endpoint mutasi admin harus memanggil server-side authorization guard yang sesuai.

Jangan pernah mengirim data draft atau arsip melalui endpoint publik.

Gunakan validasi input di server. Jangan hanya mengandalkan validasi form di browser.

## 9.3 Cache dan pembaruan konten

Setelah admin menyimpan atau menerbitkan promo:

- Homepage harus mengambil data terbaru.
- Popup harus menggunakan promo unggulan terbaru.
- Microsite harus memperlihatkan data terbaru.
- Promo yang kedaluwarsa harus otomatis berhenti tampil berdasarkan pemeriksaan waktu.
- Jangan membuat admin harus menunggu deployment untuk melihat perubahan konten.

Gunakan strategi cache dan invalidasi yang sesuai dengan pola Next.js project. Jika data dibuat dinamis, pastikan tidak ada cache publik yang menampilkan draft atau promo yang sudah tidak aktif.

## 9.4 Keamanan

- Pertahankan session admin yang sudah ada.
- Gunakan `authenticateAdminRequest()` atau guard yang sesuai untuk API admin.
- Periksa role pada setiap operasi.
- Validasi slug dan URL CTA.
- Sanitasi konten rich text.
- Batasi tipe MIME dan ukuran file upload sesuai aturan upload yang sudah ada.
- Jangan mengekspos environment variable atau secret ke client.
- Jangan memperluas cookie admin ke `.optikiseeyou.com` hanya demi microsite.
- Jangan memperbolehkan microsite publik mengakses endpoint mutasi admin.
- Catat perubahan melalui audit log.
- Pastikan kegagalan penyimpanan ditampilkan sebagai error, bukan sukses palsu.

---

# 10. Aturan Host-Based Routing

Implementasikan host routing berdasarkan versi Next.js dan konfigurasi deployment yang benar-benar terpasang.

Target perilaku:

| Host | Request | Hasil |
|---|---|---|
| `optikiseeyou.com` | `/` | Homepage utama |
| `optikiseeyou.com` | `/admin` | CMS admin |
| `promo.optikiseeyou.com` | `/` | Internal rewrite ke `/promo` |
| `promo.optikiseeyou.com` | `/nama-promo` | Internal rewrite ke `/promo/nama-promo` |
| `promo.optikiseeyou.com` | `/_next/...` | Asset Next.js normal |
| `promo.optikiseeyou.com` | `/api/...` | API yang memang diperlukan, tanpa rewrite halaman |

Catatan implementasi:

1. Normalisasi hostname, termasuk port saat development.
2. Terapkan rewrite hanya untuk host promo.
3. Jangan me-rewrite asset statis.
4. Jangan me-rewrite API menjadi route halaman.
5. Jangan membuat redirect loop.
6. Jangan menjalankan pemeriksaan session admin pada halaman publik promo.
7. Jika route `/admin` dibuka melalui subdomain promo, arahkan ke domain utama atau tolak akses dengan aman.
8. Pertahankan proteksi route `/admin` pada domain utama.
9. Jika matcher middleware diperluas dari `/admin/:path*`, uji ulang semua skenario autentikasi.
10. Gunakan request URL relatif untuk komunikasi API dari setiap host agar tidak menimbulkan kebutuhan CORS yang tidak perlu.

Repository saat audit menggunakan Next.js 15.1.x. Jangan mengubah `middleware.ts` menjadi `proxy.ts` kecuali versi Next.js benar-benar sudah di-upgrade dan perubahan tersebut memang diperlukan.

---

# 11. Standar UI dan UX

Target visual: **clean optical studio, modern, minimal, premium, dan mudah dibaca.**

## Wajib

- Gunakan warna brand Optik I See You.
- Gunakan tipografi yang sudah ditetapkan.
- Berikan whitespace yang cukup.
- Gunakan satu sistem radius yang konsisten.
- Gunakan border tipis seperlunya.
- Gunakan shadow hanya jika membantu pemisahan elemen.
- Gunakan ukuran gambar yang konsisten.
- Gunakan komposisi kolase yang teratur.
- Berikan feedback saat loading, simpan, berhasil, dan gagal.
- Sediakan empty state dan error state.
- Pastikan tampilan mobile tidak mengalami horizontal overflow.

## Hindari

- Banyak bentuk dekoratif bertumpuk.
- Double border atau container bersarang tanpa fungsi.
- Lingkaran, blob, gradient, dan ornament yang tidak memiliki fungsi.
- Shadow tebal pada setiap kartu.
- Badge berulang pada setiap elemen.
- Animasi yang bergerak terus-menerus.
- Font terlalu banyak.
- Popup yang terlalu besar di mobile.
- Layout yang menyerupai dashboard template generik.
- Warna merah Optik Melawai sebagai warna utama.
- Placeholder gambar yang terlihat seperti materi promo sungguhan.

## Responsiveness

Uji minimal pada lebar:

- 320 px.
- 375 px.
- 390 px.
- 768 px.
- 1024 px.
- 1440 px.

Pastikan popup, section homepage, daftar promo, detail promo, form admin, dan Media Library tetap nyaman digunakan.

---

# 12. Tahapan Implementasi

## Tahap 0. Repository dan environment audit

- Baca seluruh instruksi repository, termasuk `AGENT.md`, `design.md`, dan dokumen CMS yang sudah ada.
- Periksa working tree dan branch aktif.
- Jangan menimpa perubahan developer yang belum di-commit.
- Periksa konfigurasi hosting, domain, DNS, R2, dan database.
- Catat baseline build dan screenshot sebelum perubahan.
- Pastikan sumber data produksi yang sebenarnya.

Output tahap ini: catatan audit teknis singkat dan keputusan arsitektur penyimpanan serta subdomain.

## Tahap 1. Data model dan persistence

- Buat tipe `PromoItem`.
- Buat repository promo.
- Buat validasi data.
- Pastikan write operation dapat diverifikasi.
- Pastikan tidak ada data yang hilang saat update.
- Integrasikan audit log.
- Gunakan Media Library yang sudah ada.

Jangan lanjut ke tampilan publik sebelum penyimpanan dasar bekerja.

## Tahap 2. CMS Promo & Campaign

- Tambahkan menu sidebar.
- Buat halaman daftar.
- Buat form tambah/edit.
- Buat upload dan pemilihan gambar.
- Buat preview kolase.
- Buat pengaturan homepage dan popup.
- Buat publikasi dan penjadwalan.
- Uji authorization dan persistence.

## Tahap 3. Promo microsite

- Buat `/promo`.
- Buat `/promo/[slug]`.
- Buat kategori mingguan, bulanan, dan spesial.
- Buat daftar promo dan empty state.
- Buat detail dengan komposisi gambar dan teks.
- Buat galeri kolase.
- Tambahkan metadata SEO.

## Tahap 4. Integrasi homepage

- Tambahkan section promo.
- Hubungkan section ke repository promo.
- Tambahkan CTA ke subdomain.
- Pastikan promo dapat berubah tanpa deployment ulang.

## Tahap 5. Featured popup

- Buat popup dari promo unggulan.
- Hubungkan dengan pengaturan admin.
- Buat frekuensi tampil dan dismiss.
- Implementasikan aksesibilitas.
- Uji desktop dan mobile.
- Pastikan popup tidak mengganggu halaman lain.

## Tahap 6. Subdomain

- Implementasikan host-based rewrite.
- Konfigurasikan custom domain pada hosting jika akses tersedia.
- Tambahkan DNS record sesuai instruksi provider.
- Verifikasi HTTPS dan SSL.
- Uji listing, detail, asset, API, dan halaman 404.

## Tahap 7. QA dan laporan

- Jalankan type check.
- Jalankan lint dengan perintah yang sesuai versi project.
- Jalankan production build.
- Uji seluruh acceptance criteria.
- Uji fitur lama.
- Buat laporan perubahan dan bukti pengujian.
- Jangan deploy ke production tanpa persetujuan pemilik.

---

# 13. Acceptance Criteria

Implementasi dianggap selesai jika seluruh kondisi berikut terpenuhi.

## CMS

- [ ] Menu Promo & Campaign muncul pada sidebar.
- [ ] Admin dapat membuat promo.
- [ ] Admin dapat mengedit promo.
- [ ] Admin dapat menyimpan draft.
- [ ] Admin dapat menerbitkan promo.
- [ ] Admin dapat menjadwalkan periode promo.
- [ ] Admin dapat mengarsipkan promo.
- [ ] Admin dapat menghapus promo dengan konfirmasi.
- [ ] Admin dapat memilih gambar utama dan beberapa gambar tambahan.
- [ ] Admin dapat mengatur layout gambar kiri/kanan.
- [ ] Admin dapat memilih layout kolase.
- [ ] Admin dapat mengatur CTA dan syarat ketentuan.
- [ ] Admin dapat memilih promo untuk homepage.
- [ ] Admin dapat memilih satu promo unggulan popup.
- [ ] Preview desktop dan mobile berfungsi.
- [ ] Perubahan tercatat di audit log.
- [ ] Data tetap tersedia setelah refresh dan deployment baru.

## Homepage

- [ ] Section promo muncul berdasarkan data CMS.
- [ ] Kategori mingguan, bulanan, dan spesial berfungsi.
- [ ] Promo yang belum aktif tidak ditampilkan.
- [ ] Promo kedaluwarsa tidak ditampilkan sebagai promo aktif.
- [ ] CTA menuju microsite atau detail promo yang benar.
- [ ] Empty state bekerja ketika belum ada promo aktif.

## Popup

- [ ] Popup mengambil konten dari CMS.
- [ ] Popup hanya menampilkan promo valid.
- [ ] Maksimal satu popup tampil.
- [ ] Popup tidak muncul jika tidak ada promo unggulan.
- [ ] Frekuensi tampil sesuai pengaturan.
- [ ] Tombol close berfungsi.
- [ ] Escape berfungsi.
- [ ] Popup tidak muncul di route yang dikecualikan.
- [ ] Popup responsif pada mobile.
- [ ] Fokus keyboard dan aksesibilitas bekerja.

## Microsite

- [ ] `promo.optikiseeyou.com` dapat dibuka dengan HTTPS.
- [ ] Halaman daftar promo berfungsi.
- [ ] Filter kategori berfungsi.
- [ ] Detail promo berdasarkan slug berfungsi.
- [ ] Kolase dan galeri tampil benar.
- [ ] CTA berfungsi.
- [ ] Syarat dan ketentuan terbaca.
- [ ] Promo tidak aktif tidak bocor ke halaman publik.
- [ ] SEO metadata dan canonical sesuai.
- [ ] Tidak ada error asset, CORS, atau redirect loop.

## Regression

- [ ] Homepage utama tetap berfungsi.
- [ ] Login dan logout admin tetap berfungsi.
- [ ] Role owner dan admin tetap sesuai aturan.
- [ ] Katalog frame tetap berfungsi.
- [ ] Softlens tetap berfungsi.
- [ ] Blog tetap berfungsi.
- [ ] Media Library tetap berfungsi.
- [ ] Photobooth tetap berfungsi.
- [ ] AR Try-On tetap berfungsi.
- [ ] Halaman cabang dan reservasi tetap berfungsi.
- [ ] Tidak ada error TypeScript.
- [ ] Production build berhasil.
- [ ] Tidak ada data lama yang hilang.

---

# 14. Instruksi Eksekusi untuk Antigravity

Salin instruksi berikut sebagai mandat kerja. Buka repository lokal di Antigravity dan gunakan model **Gemini 3.8 Flash**.

## ANTIGRAVITY EXECUTION PROMPT

Kamu bertindak sebagai Senior Full-Stack Engineer, Next.js Architect, Backend Engineer, UI/UX Engineer, dan QA Engineer.

Tugasmu adalah mengimplementasikan Promo Management System untuk website Optik I See You berdasarkan dokumen ini. Jangan berhenti pada analisis atau membuat rencana tambahan. Lakukan audit repository lokal, implementasikan fitur, jalankan pengujian, perbaiki error, dan buat laporan hasil.

### A. Sebelum coding

1. Baca dokumen ini secara lengkap.
2. Baca `AGENT.md`, `design.md`, `PLAN-CMS-ISEEYOU-PREMIUM-UX.md`, dan seluruh instruksi project yang relevan.
3. Periksa branch, working tree, file yang berubah, dan commit terakhir.
4. Jangan menghapus atau menimpa perubahan yang sudah ada.
5. Periksa versi dependency dan pola implementasi CMS.
6. Periksa `lib/db/repository.ts`, `lib/db/storage.ts`, `lib/db/types.ts`, `lib/auth/session.ts`, `lib/auth/guard.ts`, `middleware.ts`, `next.config.ts`, `vercel.json`, Media Library, dan seluruh API admin yang relevan.
7. Verifikasi storage produksi yang aktif. Jangan menganggap Supabase aktif hanya karena SDK terpasang.
8. Verifikasi konfigurasi hosting dan domain. Jangan menganggap DNS sudah dapat diubah.
9. Buat branch kerja baru, misalnya `feat/promo-management-system`.
10. Catat baseline sebelum perubahan.

### B. Saat implementasi

1. Bangun satu sistem promo dengan satu sumber data.
2. Integrasikan CMS, homepage, popup, dan microsite.
3. Gunakan Media Library yang sudah ada.
4. Ikuti pola autentikasi dan otorisasi yang sudah ada.
5. Tambahkan audit log untuk aktivitas promo.
6. Tangani kegagalan penyimpanan secara eksplisit.
7. Hindari kehilangan data akibat concurrent update.
8. Buat public read dan admin mutation secara terpisah.
9. Gunakan server-side validation.
10. Buat promo yang aktif berdasarkan periode Asia/Jakarta.
11. Jangan menampilkan draft, archived, atau promo kedaluwarsa pada halaman publik.
12. Implementasikan popup yang dapat ditutup dan memiliki frekuensi tampil yang terkontrol.
13. Implementasikan host-based routing hanya setelah memeriksa perilaku middleware dan deployment aktual.
14. Gunakan URL API relatif jika memungkinkan.
15. Jangan memperluas cookie admin ke semua subdomain.
16. Gunakan design token dan komponen project yang sudah tersedia.
17. Jangan menambahkan dependency baru tanpa alasan teknis yang jelas.
18. Jangan mengubah fitur Photobooth, AR Try-On, katalog, blog, dan halaman cabang di luar kebutuhan integrasi.
19. Jangan membuat materi promosi palsu. Jika data kosong, tampilkan empty state.
20. Jangan menampilkan pesan sukses jika database atau storage gagal menyimpan data.

### C. Standar hasil UI

Hasil akhir harus terlihat seperti produk web profesional, bukan template dashboard AI.

Gunakan layout yang rapi, hierarki tipografi jelas, whitespace seimbang, dan komponen konsisten. Hindari double shapes, border bertumpuk, shadow berlebihan, ornamen dekoratif, gradient yang tidak perlu, badge berulang, dan animasi yang tidak memiliki fungsi.

Popup harus mengikuti referensi komposisi dua kolom, tetapi tetap memakai identitas Optik I See You. Pada mobile, susun gambar di atas dan konten di bawah.

Semua halaman wajib responsif dan nyaman digunakan dengan mouse, touch, serta keyboard.

### D. Testing wajib

Jalankan perintah yang sesuai dengan project:

```bash
npm ci
npx tsc --noEmit
npm run build
```

Periksa script lint yang tersedia di `package.json`, lalu jalankan lint dengan cara yang kompatibel.

Uji:

- CRUD promo.
- Upload dan pemilihan media.
- Jadwal promo.
- Promo aktif dan kedaluwarsa.
- Popup featured.
- Dismiss popup.
- Homepage section.
- Listing dan detail microsite.
- Mobile responsive.
- Authentication dan authorization.
- Storage persistence.
- Error jaringan dan kegagalan penyimpanan.
- Seluruh fitur lama yang berisiko terdampak.

Jangan menulis bahwa pengujian lulus jika belum benar-benar dijalankan.

### E. Deployment

Jangan push langsung ke `main`. Jangan melakukan deployment production tanpa persetujuan.

Jika akses Vercel tersedia, siapkan konfigurasi domain pada project yang benar. Jika akses DNS tidak tersedia, selesaikan kode dan berikan instruksi record DNS yang harus ditambahkan berdasarkan nilai aktual dari dashboard hosting.

Jangan mengklaim `promo.optikiseeyou.com` sudah aktif sebelum DNS, routing, dan SSL benar-benar diverifikasi.

### F. Laporan akhir wajib

Buat laporan yang memuat:

1. Ringkasan fitur yang berhasil dibuat.
2. Daftar file yang ditambahkan.
3. Daftar file yang diubah.
4. Perubahan struktur data dan repository.
5. Keputusan penyimpanan data.
6. Perubahan API dan keamanan.
7. Implementasi routing subdomain.
8. Hasil type check.
9. Hasil lint.
10. Hasil production build.
11. Hasil QA desktop dan mobile.
12. Screenshot sebelum dan sesudah.
13. Hal yang belum dapat diverifikasi.
14. Instruksi DNS dan deployment yang masih membutuhkan akses pemilik.

**Definisi selesai:** fitur promo bekerja dari CMS sampai seluruh halaman publik, data tersimpan secara permanen, popup berfungsi, subdomain siap atau sudah terverifikasi sesuai akses yang tersedia, dan fitur lama tidak mengalami regresi.

Jangan mengganti implementasi dengan mockup. Jangan berhenti setelah membuat UI statis. Implementasikan alur data dan interaksi sebenarnya.

---

# 15. Sumber Audit

## Website dan repository

- Website publik: https://optikiseeyou.com/
- Repository: https://github.com/Yoshput/iseeyouphotobooth
- `package.json`: https://github.com/Yoshput/iseeyouphotobooth/blob/main/package.json
- `AGENT.md`: https://github.com/Yoshput/iseeyouphotobooth/blob/main/AGENT.md
- `design.md`: https://github.com/Yoshput/iseeyouphotobooth/blob/main/design.md
- CMS premium UX plan: https://github.com/Yoshput/iseeyouphotobooth/blob/main/PLAN-CMS-ISEEYOU-PREMIUM-UX.md
- CMS executor prompt: https://github.com/Yoshput/iseeyouphotobooth/blob/main/PROMPT-ANTIGRAVITY-CMS-ISEEYOU.md
- Repository data layer: https://github.com/Yoshput/iseeyouphotobooth/blob/main/lib/db/repository.ts
- Storage adapter: https://github.com/Yoshput/iseeyouphotobooth/blob/main/lib/db/storage.ts
- CMS types: https://github.com/Yoshput/iseeyouphotobooth/blob/main/lib/db/types.ts
- Admin sidebar: https://github.com/Yoshput/iseeyouphotobooth/blob/main/components/admin/AdminSidebar.tsx
- Auth session: https://github.com/Yoshput/iseeyouphotobooth/blob/main/lib/auth/session.ts
- Auth guard: https://github.com/Yoshput/iseeyouphotobooth/blob/main/lib/auth/guard.ts
- Middleware: https://github.com/Yoshput/iseeyouphotobooth/blob/main/middleware.ts
- Next config: https://github.com/Yoshput/iseeyouphotobooth/blob/main/next.config.ts
- Vercel config: https://github.com/Yoshput/iseeyouphotobooth/blob/main/vercel.json

## Referensi deployment

- Vercel custom domain: https://vercel.com/docs/domains/set-up-custom-domain
- Vercel routing middleware: https://vercel.com/docs/routing-middleware
- Vercel rewrites: https://vercel.com/docs/routing/rewrites

---

**Akhir dokumen.**
