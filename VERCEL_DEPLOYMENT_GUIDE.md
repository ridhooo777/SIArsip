# Panduan Deployment SIArsip (Laravel + Inertia React + MySQL) ke Vercel

Dokumen ini berisi panduan lengkap deployment aplikasi **SIArsip** berbasis **Laravel + Inertia.js (React)** dengan database **MySQL**.

---

## 1. Persiapan Environment Variables di Vercel

Sebelum atau saat melakukan deployment, masukkan **Environment Variables** berikut di menu **Project Settings > Environment Variables** pada Dashboard Vercel:

| Key Variable | Deskripsi / Contoh Nilai |
| :--- | :--- |
| `APP_NAME` | `SIArsip` |
| `APP_ENV` | `production` |
| `APP_KEY` | Key Laravel (contoh: `base64:UP0J5zahEBVJflG/eOoLmaZ0yY61coClz3tpf4CfmhA=`) |
| `APP_DEBUG` | `false` |
| `APP_URL` | URL domain Vercel Anda (contoh: `https://siarsip.vercel.app`) |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | Host Server MySQL Anda (misal host dari PlanetScale, Aiven, Railway, dsb.) |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | Nama database MySQL (`siarsip`) |
| `DB_USERNAME` | Username MySQL |
| `DB_PASSWORD` | Password MySQL |

---

## 2. Cara Deployment via GitHub / Vercel Dashboard

1. **Push Perubahan ke Repository GitHub**:
   ```bash
   git add .
   git commit -m "Restored Laravel Inertia React UI and MySQL serverless setup for Vercel"
   git push origin main
   ```

2. **Hubungkan ke Vercel**:
   - Buka [vercel.com](https://vercel.com) dan login.
   - Klik **"Add New..."** -> **"Project"**.
   - Impor repositori GitHub `SIArsip`.

3. **Konfigurasi Project Settings**:
   - **Framework Preset**: Other (atau Laravel)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty / Default (karena routing ditangani oleh `api/index.php` & Vercel Serverless PHP)

4. **Masukkan Environment Variables**:
   - Masukkan daftar variabel environment MySQL di atas (`DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_KEY`).

5. Klik **Deploy**. Vercel akan otomatis menjalankan `npm run build` untuk menghasilkan bundel frontend Inertia dan mengeksekusi fungsi serverless PHP (`vercel-php`).
