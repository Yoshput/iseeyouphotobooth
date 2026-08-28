# AGENT.MD — SEO & Local SEO Implementation
### Project: Optik I See You (optikiseeyou.com)
### Repo: Yoshput/iseeyouphotobooth — Next.js 15 (static export) + React 18 + TypeScript + Tailwind

Paste seluruh isi file ini sebagai instruksi ke Antigravity. Ini task teknis SEO murni —
JANGAN sentuh logic AR try-on / face tracking / Three.js yang sudah stabil, kecuali diminta eksplisit di sini.

---

## 0. KONTEKS BISNIS (wajib dibaca dulu)

Optik I See You punya 4 cabang aktif:

| Cabang | Alamat | Jam Buka | WhatsApp |
|---|---|---|---|
| Purwokerto | Jl. Sunan Ampel No.5, Sidamulya, Kedungmalang, Kec. Sumbang, Kabupaten Banyumas, Jawa Tengah 53124 | Buka, tutup pukul 21.00 (cek jam lengkap di GBP) | 0895-4156-14261 |
| Purbalingga | Jl. Onje No.1, Purbalingga | Senin–Jumat 11.00–20.00, Sabtu–Minggu 09.00–21.00 | 0822-3486-2322 |
| Wonosobo | Kabupaten Wonosobo, Jawa Tengah | Setiap hari 09.00–18.00 | 0897-7129-039 |
| Cilacap | Kabupaten Cilacap, Jawa Tengah | Setiap hari 09.00–21.00 | 0851-3593-0533 |

> ⚠️ Verifikasi ulang alamat lengkap Purbalingga/Wonosobo/Cilacap dari Google Business Profile masing-masing sebelum dipakai di schema — alamat di schema HARUS identik persis (karakter-per-karakter kalau bisa) dengan alamat di GBP. Kalau ada perbedaan, tanyakan ke user dulu, jangan mengarang.

Tujuan proyek ini: membuat Google mengindeks & memahami situs sepenuhnya, sehingga saat orang search
"optik i see you", "optik i see you purwokerto", "optik i see you purbalingga", "optik i see you wonosobo",
"optik i see you cilacap", "optik i see you glasses" — website ini muncul dominan di halaman 1 dengan
sitelinks, mendampingi (bukan menggantikan) hasil Google Maps/Local Pack yang sudah bagus.

---

## 1. TASK: Audit & fix canonical domain + redirect

1. Cek konfigurasi Vercel Domains: pastikan **satu** domain jadi primary (rekomendasi: `https://optikiseeyou.com` tanpa www, karena itu yang dipakai di semua materi promosi/GBP/IG bio saat ini), dan `www.optikiseeyou.com` di-redirect 301 permanen ke versi non-www.
2. Grep seluruh codebase untuk hardcoded URL yang tidak konsisten (`www.optikiseeyou.com` vs `optikiseeyou.com`) di:
   - `next.config.js` (metadataBase, images.domains, dsb)
   - Semua file yang generate `<meta>` OG/Twitter tags
   - `sitemap.xml` generator
   - `robots.txt`
3. Set `metadataBase` di `app/layout.tsx` (Next.js App Router) ke domain kanonik final, contoh:
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://optikiseeyou.com'),
  // ...
}
```
4. Tambahkan `alternates.canonical` di setiap route/page metadata agar tiap halaman punya `<link rel="canonical">` yang benar dan absolut.

---

## 2. TASK: robots.txt

Buat/update `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://optikiseeyou.com/sitemap.xml
```
Pastikan tidak ada `Disallow` yang tidak sengaja memblokir `/katalog`, `/softlens`, `/photobooth`, `/try-on`, atau assets penting (gambar produk) yang dibutuhkan untuk Google Images/Shopping.

---

## 3. TASK: Perluas sitemap.xml dengan halaman cabang baru

Sitemap saat ini sudah benar untuk 8 URL yang ada. Setelah Task 5 (halaman cabang) selesai, update
sitemap generator (kemungkinan di `app/sitemap.ts` kalau pakai Next.js App Router native sitemap, atau
script custom) supaya otomatis include:
```
https://optikiseeyou.com/cabang/purwokerto
https://optikiseeyou.com/cabang/purbalingga
https://optikiseeyou.com/cabang/wonosobo
https://optikiseeyou.com/cabang/cilacap
```
dengan `priority: 0.9`, `changefreq: monthly`.

Kalau pakai Next.js App Router native sitemap (`app/sitemap.ts`), contoh:
```ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://optikiseeyou.com'
  const branches = ['purwokerto', 'purbalingga', 'wonosobo', 'cilacap']
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/try-on`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/start`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/photobooth`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/katalog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/softlens`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/download`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/kebijakan-privasi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...branches.map((b) => ({
      url: `${base}/cabang/${b}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  ]
}
```

---

## 4. TASK: JSON-LD Structured Data — Organization + WebSite (Sitelinks Search Box)

Tambahkan di root layout (`app/layout.tsx`), sebagai `<script type="application/ld+json">` yang di-inject
sekali di homepage (atau di semua halaman via layout — Organization/WebSite boleh diulang di setiap halaman,
Google akan dedupe):

```tsx
function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Optik I See You",
    "alternateName": "I See You Glasses",
    "url": "https://optikiseeyou.com",
    "logo": "https://optikiseeyou.com/logo.png",
    "sameAs": [
      "https://www.instagram.com/iseeyou.glasses",
      "https://www.tiktok.com/@iseeyou.glasses",
      "https://maps.google.com/?cid=GANTI_DENGAN_CID_GBP_PURWOKERTO"
      // tambahkan Facebook / GBP cabang lain kalau ada URL resminya
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+62895-4156-14261",
        "contactType": "customer service",
        "areaServed": "ID",
        "availableLanguage": "Indonesian"
      }
    ]
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Optik I See You",
    "url": "https://optikiseeyou.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://optikiseeyou.com/katalog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```
Panggil kedua komponen ini di dalam `<head>`/body root layout, render sekali di seluruh app.

> Catatan jujur: Sitelinks Search Box (kotak pencarian di bawah hasil brand) makin jarang muncul di UI
> Google modern walau schema-nya valid — tapi menambahkannya tetap best practice dan tidak merugikan;
> manfaat utamanya justru untuk memperkuat entity `WebSite`/`Organization` yang menopang sitelinks biasa
> dan Knowledge Panel.

---

## 5. TASK: Buat halaman cabang (`/cabang/[slug]`) + LocalBusiness/Optician schema per cabang

Ini task PALING PENTING untuk query "optik i see you [nama kota]".

1. Buat route dinamis `app/cabang/[slug]/page.tsx` (atau 4 halaman statis terpisah kalau lebih gampang
   di struktur static export saat ini — ikuti pola yang sudah ada di project).
2. Tiap halaman cabang wajib berisi (konten unik, bukan copy-paste antar cabang):
   - H1: `Optik I See You [Kota]`
   - Alamat lengkap (harus identik dengan GBP)
   - Jam operasional per hari
   - Nomor WhatsApp cabang (tombol klik-to-chat)
   - Embed Google Maps (iframe pakai place_id cabang tsb)
   - 3-5 foto toko/cabang tsb (bukan foto generic dari cabang lain)
   - Minimal 1 paragraf deskripsi unik (150-300 kata) tentang cabang itu — layanan, keunggulan lokasi, dsb
   - Tombol CTA: "Cek Katalog", "Coba Try-On AR", "Chat via WhatsApp"
   - Link balik ke halaman cabang lain (internal linking antar cabang)
3. `metadata` per halaman cabang, contoh untuk Purbalingga:
```ts
export const metadata: Metadata = {
  title: 'Optik I See You Purbalingga — Kacamata, Softlens & Try-On AR | Jl. Onje No.1',
  description: 'Optik I See You cabang Purbalingga, Jl. Onje No.1. Cek mata gratis, ratusan pilihan frame kacamata, softlens, dan coba kacamata virtual (AR Try-On) sebelum datang. Buka Senin-Jumat 11.00-20.00, Sabtu-Minggu 09.00-21.00.',
  alternates: { canonical: 'https://optikiseeyou.com/cabang/purbalingga' },
}
```
4. Tambahkan JSON-LD `Optician` (subtype dari LocalBusiness, paling akurat untuk toko optik) di tiap
   halaman cabang:
```tsx
const purbalinggaSchema = {
  "@context": "https://schema.org",
  "@type": "Optician",
  "name": "Optik I See You Purbalingga",
  "image": "https://optikiseeyou.com/cabang/purbalingga-storefront.jpg",
  "url": "https://optikiseeyou.com/cabang/purbalingga",
  "telephone": "+62822-3486-2322",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Onje No.1",
    "addressLocality": "Purbalingga",
    "addressRegion": "Jawa Tengah",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "GANTI_DENGAN_LAT_ASLI",
    "longitude": "GANTI_DENGAN_LNG_ASLI"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "11:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "09:00",
      "closes": "21:00"
    }
  ],
  "parentOrganization": {
    "@type": "Organization",
    "name": "Optik I See You",
    "url": "https://optikiseeyou.com"
  }
}
```
Duplikasi & sesuaikan pola ini untuk Purwokerto (`LocalBusiness`/`Optician`), Wonosobo, dan Cilacap —
ambil koordinat lat/lng asli dari Google Maps masing-masing cabang (klik kanan pin di Google Maps →
koordinat muncul), JANGAN reka-reka koordinat.

---

## 6. TASK: BreadcrumbList schema

Tambahkan di semua halaman non-home (katalog, softlens, cabang, dsb), contoh untuk halaman katalog:
```tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Beranda", "item": "https://optikiseeyou.com" },
    { "@type": "ListItem", "position": 2, "name": "Katalog", "item": "https://optikiseeyou.com/katalog" }
  ]
}
```
Sesuaikan array `itemListElement` per halaman (untuk halaman cabang: Beranda → Lokasi → [Nama Cabang]).

---

## 7. TASK: FAQPage schema di halaman Pertanyaan (page 9 di landing page)

Ambil isi FAQ yang sudah ada di section "Pertanyaan" di homepage, convert ke schema:
```tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apakah cek mata di Optik I See You gratis?",
      "acceptedAnswer": { "@type": "Answer", "text": "Ya, cek mata menggunakan alat refractometer untuk mengetahui minus mata dan rekomendasi lensa yang cocok tersedia gratis di semua cabang." }
    }
    // ... tambahkan semua Q&A yang sudah ada di section Pertanyaan, isi teks jawaban HARUS sama
    // persis dengan konten yang ditampilkan di halaman (jangan bikin klaim baru)
  ]
}
```
> Wajib: teks pertanyaan & jawaban di schema harus identik dengan yang tampil visual di halaman —
> Google akan menganggap spam kalau schema berbeda dari konten yang terlihat user.

---

## 8. TASK: Open Graph & Twitter Card per halaman

Pastikan tiap halaman (bukan cuma homepage) punya OG image unik & relevan (misal halaman cabang pakai
foto storefront cabang itu, halaman katalog pakai foto produk unggulan). Ini tidak langsung memengaruhi
ranking tapi memperkuat CTR dan konsistensi entity saat dibagikan/di-crawl.

---

## 9. TASK: Perbaiki halaman yang gagal diindeks (dari GSC: 2 "discovered not indexed", 1 "crawled not indexed")

1. Buka GSC → Pengindeksan → Halaman → klik tiap baris masalah untuk lihat daftar URL persis yang kena.
2. Untuk tiap URL itu:
   - Cek apakah halaman render dengan cepat & punya konten teks asli (bukan cuma canvas/JS kosong) —
     Googlebot butuh teks yang bisa dibaca tanpa menunggu animasi GSAP/Three.js selesai render.
   - Pastikan tidak ada `noindex` meta tag tidak sengaja ke-set.
   - Pastikan halaman tidak butuh interaksi user (klik/scroll) untuk memunculkan konten utama.
3. Setelah fix, di GSC pakai "Inspeksi URL" → "Minta pengindeksan" untuk tiap URL yang sudah dibenerin.

---

## 10. TASK: Internal linking pass

Audit navbar, footer, dan homepage — pastikan **setiap** halaman penting (termasu 4 halaman cabang baru)
bisa dicapai dengan link langsung dari homepage/navbar/footer, idealnya dalam 1-2 klik. Ini membantu Google
menganggap halaman-halaman tersebut cukup penting untuk dijadikan calon sitelinks.

Struktur navbar footer yang direkomendasikan (tambahan bagian "Lokasi"):
```
Footer → Lokasi Kami
  - Optik I See You Purwokerto
  - Optik I See You Purbalingga
  - Optik I See You Wonosobo
  - Optik I See You Cilacap
```

---

## 11. Setelah semua di-deploy: langkah manual di Google Search Console (dikerjakan user, bukan Antigravity)

1. GSC → Peta Situs → submit ulang `https://optikiseeyou.com/sitemap.xml`.
2. GSC → Inspeksi URL → tes tiap URL utama & 4 halaman cabang baru → klik "Minta pengindeksan".
3. GSC → Pengalaman → Data Web Inti → cek tidak ada isu performa parah (LCP/CLS) terutama karena
   animasi GSAP/Three.js yang berat.
4. GSC → Peningkatan → cek apakah "Item Daftar Breadcrumb" dan "Pertanyaan Umum" mulai terdeteksi
   (butuh beberapa hari-minggu setelah deploy).
5. Google Rich Results Test (search.google.com/test/rich-results) → paste tiap URL, pastikan semua
   schema di atas valid tanpa error sebelum & sesudah deploy.
6. Google Business Profile (business.google.com) → untuk tiap 4 cabang: pastikan field Website mengarah
   ke halaman `/cabang/[slug]` masing-masing, bukan homepage generik.

---

## 12. Yang TIDAK perlu dikerjakan Antigravity di task ini
- Jangan ubah logic AR try-on, face tracking, 3D model, atau alur foto/print.
- Jangan ubah desain visual/branding yang sudah di-approve user sebelumnya kecuali untuk kebutuhan
  konten unik per halaman cabang (foto, teks) di atas.
- Jangan hardcode data lat/lng, alamat, atau CID Google Maps yang belum dikonfirmasi user — tandai
  dengan komentar `// TODO: verifikasi dari GBP` kalau data belum pasti, jangan mengarang angka.

---

## Ringkasan urutan eksekusi
1. Fix domain kanonik + redirect (Task 1)
2. robots.txt (Task 2)
3. JSON-LD Organization + WebSite di root layout (Task 4)
4. Buat 4 halaman cabang + Optician schema (Task 5) ← paling besar effort-nya
5. Breadcrumb + FAQ schema (Task 6, 7)
6. Update sitemap.ts include halaman cabang (Task 3)
7. Internal linking pass (Task 10)
8. Fix halaman gagal index (Task 9)
9. Deploy → lanjut ke langkah manual GSC & GBP (Task 11, dikerjakan user)
