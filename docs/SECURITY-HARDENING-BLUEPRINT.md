# 🛡️ BLUEPRINT REMEDIASI KEAMANAN & PULL REQUEST (PR) HARDENING
## Target Domain: `optikiseeyou.com`
**Role:** Lead / Senior Application Security Engineer  
**Tanggal Audit:** September 2026  
**Referensi:** WebGuard Sentinel Hyperion Assessment  
**Baseline Score:** 64 / 100 (Grade D, Level 3: Defined & Basic Defense)  
**Target Posture:** 95+ / 100 (Grade A+, Level 5: Resilient & Adaptive Defense)

---

## 1. RINGKASAN AUDIT & ANALISIS ANCAMAN

Berdasarkan hasil evaluasi **WebGuard Sentinel Hyperion**:
1. **Perimeter Exposure (Critical Risk):**
   Origin server (`216.198.79.1`, AWS AS16509) terekspos langsung ke publik tanpa layer proteksi Web Application Firewall (WAF) aktif di edge. Seluruh bot scanning otomatis, scraping, dan HTTP request flood langsung menyentuh backend application.
2. **Missing Security Headers (Hardening 44%):**
   Origin belum memancarkan header pertahanan modern (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). Hal ini membuka celah terhadap serangan Cross-Site Scripting (XSS), Iframe Clickjacking, and MIME sniffing.
3. **Integritas DNS & Email Spoofing (15%):**
   TXT Record SPF dan DMARC berstatus `MISSING` (Policy: NONE). Domain rentan dipalsukan untuk phishing atau Business Email Compromise (BEC) atas nama `optikiseeyou.com`.
4. **Cache Exposure pada Endpoint Dinamis / API:**
   Header `Cache-Control: no-store` wajib dipaksakan pada endpoint transaksi dan API guna mencegah perantara proxy/ISP atau browser caching menyimpan data sensitif.
5. **Potensi Eksploitasi File Sensitif:**
   Perlu pertahanan lapis ganda (*defense-in-depth*) di level web server (Nginx / Apache) untuk memblokir akses ke ekstensi file cadangan (.sql, .db, .sqlite), backup (.tar.gz, .zip, .bak), dan environment (.env, .git).

---

## 2. PERUBAHAN TEKNIS CODEBASE (PULL REQUEST OVERVIEW)

### A. Next.js Configuration (`next.config.ts`)
Menerapkan generator header keamanan native pada seluruh route (`/:path*`) dan mematikan cache pada API (`/api/:path*`):
* **`Content-Security-Policy`**:
  * Mengisolasi origin (`default-src 'self' https://optikiseeyou.com`)
  * Mengizinkan runtime MediaPipe AI & WebAssembly (`script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net`)
  * Mengizinkan font Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`)
  * Mengizinkan koneksi Cloudflare R2, Cloudinary, dan PeerJS WebRTC
  * Mengunci framing dan clickjacking (`frame-ancestors 'none'`, `object-src 'none'`)
  * Mengamankan form redirection (`form-action 'self' https://api.whatsapp.com https://wa.me`)
* **`Strict-Transport-Security`**: `max-age=31536000; includeSubDomains; preload` (HSTS 1 tahun)
* **`X-Frame-Options`**: `DENY`
* **`X-Content-Type-Options`**: `nosniff`
* **`Referrer-Policy`**: `strict-origin-when-cross-origin`
* **`Permissions-Policy`**: `camera=(self), microphone=(), geolocation=(), browsing-topics=()`
* **`X-DNS-Prefetch-Control`**: `on`
* **`X-XSS-Protection`**: `1; mode=block`
* **`Cache-Control` (API)**: `no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`

### B. Vercel Edge Headers (`vercel.json`)
Menerapkan header keamanan di layer Vercel CDN Edge network agar setiap response yang dikirimkan melalui Vercel Edge memiliki proteksi identik.

### C. Nginx Production Configuration (`nginx/optikiseeyou.conf`)
Menyediakan template konfigurasi Nginx *hardened* untuk origin server AWS EC2 / Linux VPS:
* **Anti-Leak Rules**: Memblokir akses ke `/\.(?!well-known)`, `.sql`, `.sqlite`, `.db`, `.bak`, `.zip`, `.tar.gz`, `.env`, `.git`, `.json`, `composer.*`, `package.*` dengan `return 404;`.
* **Rate Limiting**: `limit_req_zone` (15 req/s burst 25) & `limit_conn_zone` (20 conn) untuk meredam pemindaian bot otomatis.
* **Server Tokens**: `server_tokens off;` untuk menyembunyikan identitas versi Nginx.
* **Cache-Control Enforcement**: Penegakan `no-store` pada `/api/`.

### D. Apache Web Server Configuration (`public/.htaccess`)
Konfigurasi file `.htaccess` siap pakai untuk lingkungan server Apache dengan rule mod_rewrite & mod_headers untuk memblokir file tersembunyi dan menginjeksi security headers.

### E. Robots.txt Hardening (`app/robots.ts`)
Menambahkan direktif `disallow: ["/api/", "/remote-camera", "/download/"]` guna mencegah bot/crawler mesin pencari mengindeks endpoint internal dan link download sementara.

### F. Dependency Vulnerability Resolution
* Menjalankan audit dependensi npm (`npm audit fix`).
* Memperbaiki celah pada paket internal (`nanoid`, `sharp`, dependensi Next.js).
* Memverifikasi build Next.js 15 berhasil 100% tanpa regresi.

---

## 3. PANDUAN IMPLEMENTASI PERIMETER & DNS (EXTERNAL CONFIGURATION)

### A. Konfigurasi DNS Anti-Spoofing (Prioritas P2 - Dalam 14 Hari)
Buka DNS Manager penyedia domain Anda (Cloudflare, Route53, RumahWeb, Niagahoster, dll.) dan tambahkan TXT Record berikut:

#### 1. SPF (Sender Policy Framework)
Jika domain **TIDAK** digunakan untuk mengirim email langsung:
```text
Type:  TXT
Host:  @ (atau optikiseeyou.com)
Value: v=spf1 -all
TTL:   3600
```
*(Jika menggunakan Google Workspace, ganti Value menjadi: `v=spf1 include:_spf.google.com -all`)*

#### 2. DMARC (Domain-based Message Authentication)
```text
Type:  TXT
Host:  _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@optikiseeyou.com; pct=100; adkim=s; aspf=s
TTL:   3600
```

---

### B. Konfigurasi Web Application Firewall (WAF) (Prioritas P1 - Dalam 7 Hari)

Untuk memitigasi peringatan perimeter origin server terekspos (`216.198.79.1`):
1. **Gunakan Cloudflare Proxy (Orange Cloud):**
   * Arahkan NS (Nameservers) domain ke Cloudflare.
   * Aktifkan **Proxied status (Orange Cloud)** pada Record A (`optikiseeyou.com` -> IP origin).
   * Pada menu **Security > WAF**:
     * Aktifkan *Cloudflare Managed Ruleset* (OWASP Core Ruleset).
     * Aktifkan *Bot Fight Mode* untuk memblokir automated crawlers & scraper jahat.
   * Pada menu **SSL/TLS**:
     * Pilih mode **Full (Strict)**.
     * Aktifkan **Always Use HTTPS** dan **HTTP Strict Transport Security (HSTS)**.
2. **Kunci Port Origin Server (Security Group AWS):**
   * Di AWS EC2 Security Group, batasi port `80` dan `443` hanya menerima koneksi dari IP Cloudflare ([Cloudflare IP Ranges](https://www.cloudflare.com/ips/)). Hal ini mencegah penyerang membypass WAF dengan langsung menembak IP origin `216.198.79.1`.

---

## 4. DAFTAR FILE YANG DIMODIFIKASI / DITAMBAHKAN

| Status | File Path | Deskripsi |
|---|---|---|
| **MODIFY** | `next.config.ts` | Penambahan CSP, HSTS, X-Frame-Options, X-Content-Type-Options, & Cache-Control |
| **MODIFY** | `vercel.json` | Penambahan edge security headers & no-store policy untuk deployment Vercel |
| **MODIFY** | `app/robots.ts` | Penambahan disallow rules untuk endpoint API dan utilitas internal |
| **MODIFY** | `app/api/upload-photo/route.ts` | Hardening header `Cache-Control: no-store` langsung pada response handler |
| **MODIFY** | `package-lock.json` | Resolusi dependensi rentan melalui `npm audit fix` |
| **NEW** | `nginx/optikiseeyou.conf` | Konfigurasi production Nginx dengan rate limiting & pemblokiran file sensitif |
| **NEW** | `public/.htaccess` | Konfigurasi Apache untuk perlindungan file .env, .git, .sql, dan security headers |
| **NEW** | `docs/SECURITY-HARDENING-BLUEPRINT.md` | Dokumentasi master remedi dan panduan konfigurasi DNS/WAF |

---

## 5. CARA VERIFIKASI HASIL

1. **Verifikasi Build:**
   ```bash
   npm run build
   ```
2. **Verifikasi Header Keamanan Lokal:**
   ```bash
   npm run start
   curl -I http://localhost:3000/
   curl -I http://localhost:3000/api/photo?id=test
   ```
3. **Verifikasi Online Pasca-Deploy:**
   * Cek skor di [SecurityHeaders.com](https://securityheaders.com/?q=optikiseeyou.com) (Target: **Grade A / A+**).
   * Cek email authentication di [DMARC Analyzer](https://mxtoolbox.com/dmarc.aspx).
   * Lakukan re-scan menggunakan WebGuard Sentinel Hyperion.
