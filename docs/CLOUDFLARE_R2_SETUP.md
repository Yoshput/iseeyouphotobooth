# Panduan Konfigurasi Cloudflare R2 & Auto-Delete 7 Hari (Optik I See You)

Dokumen ini menjelaskan langkah-langkah setup **Cloudflare R2 Object Storage** untuk penyimpanan foto photobooth online Optik I See You (`https://optikiseeyou.com`).

---

## 1. Buat Bucket di Cloudflare R2
1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Di sidebar kiri, klik **R2** > **Create bucket**.
3. Beri nama bucket: `iseeyou-photobooth-photos` (atau sesuai preferensi Anda).
4. Biarkan Location Default (**Automatic**) lalu klik **Create Bucket**.

---

## 2. Buat R2 API Token (Kredensial S3)
1. Di halaman utama R2, klik **Manage R2 API Tokens** (di sebelah kanan).
2. Klik **Create API token**.
3. Konfigurasi token:
   - **Token name**: `photobooth-uploader`
   - **Permissions**: **Object Read & Write** (atau Admin Read & Write).
   - **Specify bucket**: Pilih bucket `iseeyou-photobooth-photos` yang baru dibuat.
   - **TTL**: Biarkan *Forever* (atau sesuai kebijakan keamanan).
4. Klik **Create API Token**.
5. Salin dan simpan nilai berikut:
   - **Access Key ID** $\rightarrow$ masukkan ke `R2_ACCESS_KEY_ID`
   - **Secret Access Key** $\rightarrow$ masukkan ke `R2_SECRET_ACCESS_KEY`
   - **Account ID** (bisa dilihat di URL dashboard / endpoint R2) $\rightarrow$ masukkan ke `R2_ACCOUNT_ID`

---

## 3. Aktifkan Public Access / Custom Domain
Agar foto dan QR code dapat diakses oleh HP pengunjung secara publik:
1. Buka bucket `iseeyou-photobooth-photos` di Cloudflare Dashboard.
2. Masuk ke tab **Settings**.
3. Pada bagian **Public Access**:
   - Opsi A (Cepat): Klik **Allow Access** pada **R2.dev subdomain** (contoh: `https://pub-xxxxxxxxxxxx.r2.dev`).
   - Opsi B (Custom Domain Rekomendasi): Klik **Connect Domain** (misal: `photos.optikiseeyou.com`).
4. Salin URL public domain tersebut $\rightarrow$ masukkan ke `NEXT_PUBLIC_R2_PUBLIC_DOMAIN` / `R2_PUBLIC_DOMAIN`.

---

## 4. Konfigurasi Environment Variables di Vercel
Tambahkan variabel berikut di **Vercel Project** > **Settings** > **Environment Variables** (dan di file lokal `.env.local`):

| Key | Contoh Value | Keterangan |
|---|---|---|
| `R2_ACCOUNT_ID` | `a1b2c3d4e5f67890...` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | `7a8b9c0d...` | R2 API Access Key ID |
| `R2_SECRET_ACCESS_KEY` | `99f8e7d6c5b4a3...` | R2 API Secret Access Key |
| `R2_BUCKET_NAME` | `iseeyou-photobooth-photos` | Nama bucket R2 |
| `R2_PUBLIC_DOMAIN` | `https://photos.optikiseeyou.com` | Public domain R2 (tanpa trailing slash) |
| `NEXT_PUBLIC_R2_PUBLIC_DOMAIN` | `https://photos.optikiseeyou.com` | Public domain R2 untuk client download |
| `NEXT_PUBLIC_SITE_URL` | `https://optikiseeyou.com` | Base URL website produksi |

---

## 5. Setup Auto-Delete 7 Hari (Object Lifecycle Rule)
Cloudflare R2 memiliki fitur penghapusan otomatis bawaan di level bucket tanpa perlu membuat server cron job:

1. Buka bucket `iseeyou-photobooth-photos` di Cloudflare Dashboard.
2. Masuk ke tab **Settings**.
3. Scroll ke bawah ke bagian **Object Lifecycle Rules** lalu klik **Add rule**.
4. Konfigurasi aturan:
   - **Rule name**: `auto-delete-7-days`
   - **Prefix / Path**: Biarkan kosong (atau isi `photos/` untuk foto photobooth).
   - **Action**: Pilih **Delete object**.
   - **Age / Days after upload**: Masukkan **`7`** (hari).
5. Klik **Save rule**.

> [!NOTE]
> Setelah aturan aktif, setiap foto yang berumur lebih dari 7 hari akan dihapus secara otomatis dan permanen oleh Cloudflare. Jika pengunjung mencoba membuka QR lama, halaman download akan otomatis menampilkan pesan *"Foto sudah tidak tersedia, sudah melewati masa penyimpanan 7 hari"*.
