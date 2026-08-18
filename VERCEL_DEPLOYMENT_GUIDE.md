# Panduan Deployment SIArsip ke Vercel

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deploy aplikasi **SIArsip** (Vite React Frontend + Vercel Serverless Functions Backend + Supabase Database) ke **Vercel**.

---

## 1. Persiapan Environment Variables di Vercel

Sebelum atau saat melakukan deployment, pastikan Anda menambahkan **Environment Variables** berikut di menu **Project Settings > Environment Variables** di Dashboard Vercel:

| Key Variable | Deskripsi / Contoh Nilai |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL Proyek Supabase Anda (contoh: `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Anon Public Key dari Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Proyek Supabase Anda (digunakan oleh serverless function `/api`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key dari Supabase (akses rahasia untuk backend `/api`) |

---

## 2. Cara Deployment (Pilih Salah Satu)

### Opsi A: Deployment Otomatis via GitHub / Vercel Dashboard (Rekomendasi)

1. **Push Proyek ke Repository GitHub**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and serverless setup"
   git push origin main
   ```

2. **Hubungkan ke Vercel**:
   - Buka [vercel.com](https://vercel.com) dan login.
   - Klik **"Add New..."** -> **"Project"**.
   - Impor repositori GitHub `SIArsip`.

3. **Konfigurasi Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Masukkan Environment Variables**:
   - Masukkan `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, dan `SUPABASE_SERVICE_ROLE_KEY`.

5. Klik **Deploy**. Vercel akan otomatis memproses frontend Vite dan fungsi API serverless di `/api`.

---

### Opsi B: Deployment via Vercel CLI

Jika Anda ingin melakukan deploy langsung dari terminal komputer Anda:

1. Install Vercel CLI secara global (jika belum):
   ```bash
   npm install -g vercel
   ```

2. Login ke akun Vercel Anda:
   ```bash
   vercel login
   ```

3. Jalankan perintah deploy di folder proyek:
   ```bash
   vercel
   ```
   *Ikuti instruksi di layar (pilih nama proyek, default settings, dll).*

4. Untuk deploy ke lingkungan Production:
   ```bash
   vercel --prod
   ```

---

## 3. Catatan Penting Mengenai Fitur

- **Single Page Application (SPA)**: File `vercel.json` sudah mengonfigurasi *rewrites* sehingga navigasi halaman seperti `/documents`, `/categories`, dan `/reports` tidak akan mengembalikan error 404 saat direfresh.
- **Serverless API Endpoints**: Seluruh file di folder `/api/*.js` akan otomatis dibundel menjadi Vercel Serverless Functions berbasis Node.js yang berkomunikasi langsung dengan database Supabase Anda.
- **Database & Storage**: Semua data dan berkas dokumen tersimpan dengan aman di Supabase Database & Supabase Storage.
