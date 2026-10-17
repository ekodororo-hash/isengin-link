# isengin.site link-in-bio

Halaman link-in-bio (mirip Linktree) dengan Next.js, database Neon, dan penyimpanan foto Vercel Blob.

## Halaman

| Alamat | Untuk | Keterangan |
|---|---|---|
| `/` | Umum | Halaman depan, daftar dan masuk |
| `/dashboard` | Pengguna | Ringkasan (statistik klik dan kunjungan) |
| `/dashboard/link` | Pengguna | Tambah, ubah, hapus link |
| `/dashboard/tampilan` | Pengguna | Pilih tema dengan pratinjau |
| `/dashboard/profil` | Pengguna | Foto, nama tampilan, bio |
| `/dashboard/bagikan` | Pengguna | Salin link dan unduh kode QR |
| `/admin` | Pemilik situs | Login terpisah; ringkasan situs |
| `/admin/pengguna` | Pemilik situs | Daftar pengguna, aktifkan, nonaktifkan, atau hapus akun |
| `/nama` | Pengunjung | Halaman publik tiap pengguna |
| `/go/<id>` | Pengunjung | Menghitung klik lalu mengarahkan ke link tujuan |

## Environment variable

| Nama | Isi |
|---|---|
| `DATABASE_URL` | Connection string Neon (Connect di dashboard Neon, lengkap dengan `?sslmode=require`) |
| `AUTH_SECRET` | Teks acak panjang, mis. hasil `openssl rand -base64 32`. Rahasia, jangan di-commit |
| `ADMIN_USER` | Nama login untuk `/admin` (terpisah dari akun pengguna) |
| `ADMIN_PASS` | Sandi login untuk `/admin`. Pakai yang kuat |
| `BLOB_READ_WRITE_TOKEN` | Terisi otomatis saat Vercel Blob disambungkan ke project |
| `NEXT_PUBLIC_SITE_URL` | Alamat situs, mis. `https://isengin.site`. Dipakai untuk kode QR dan gambar preview saat link dibagikan |

Setelah mengubah environment variable di Vercel, lakukan **Redeploy**.

## Pasang dari nol

1. **Neon**: buat project, buka SQL Editor, jalankan `schema.sql`, lalu `schema-update.sql` (kolom `active` dan `views`, tabel `daily_stats` untuk statistik harian, dan `rate_limits` untuk batas percobaan login). Kalau database sudah jalan, cukup jalankan `schema-update.sql` lagi. Aman diulang, dan **harus dijalankan sebelum deploy versi ini**.
2. **GitHub**: push proyek ini ke repo.
3. **Vercel**: import repo. Di Storage, buat **Blob** dan sambungkan ke project. Isi semua environment variable di atas.
4. **Deploy**, lalu di Settings, Domains, tambahkan `isengin.site` dan ikuti petunjuk DNS.

## Jalankan lokal

```
cp .env.example .env.local   # isi nilainya, termasuk ADMIN_USER dan ADMIN_PASS
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Struktur singkat

```
app/
  page.js, landing.css        halaman depan
  dashboard/                  layout + data bersama (DashContext), page.js, link/, tampilan/, profil/
  admin/                      layout + login (AdminContext), page.js, pengguna/
  [username]/page.js          halaman publik
  go/[id]/route.js            hitung klik
  api/auth, api/me, api/upload, api/admin
  Shell.js, Loader.js         kerangka sidebar dan animasi loading
  panel.css                   gaya dasbor dan admin (neobrutalism, responsif)
lib/db.js, lib/auth.js        koneksi Neon dan sesi login
lib/themes.js                 daftar tema (tambah tema cukup di sini)
lib/limit.js                  pembatas percobaan login/daftar (disimpan di database)
lib/bot.js                    penyaring crawler agar kunjungan/klik tidak membengkak
lib/source.js                 menebak asal klik (Instagram, TikTok, dll)
lib/socials.js                ikon sosial media di header profil (validasi dan alamat)
app/icons.js                  ikon link, dipilih otomatis dari alamat (WhatsApp, Instagram, dll)
app/[username]/opengraph-image.js   gambar preview saat link dibagikan
schema.sql, schema-update.sql skema database
```

## Catatan

- Di HP (lebar di bawah 860px), sidebar berubah jadi bilah atas dengan tombol hamburger yang membuka menu; tombol Escape atau pindah halaman menutupnya.
- Halaman publik pengguna memakai tema pilihan penggunanya (kobalt, permen, hutan).
- Menonaktifkan pengguna di admin hanya menyembunyikan halaman publiknya; orangnya masih bisa login.
- Nama yang dilarang (`api`, `dashboard`, `login`, `admin`, `go`) dan batas 30 link per pengguna diatur di kode.

## Catatan

- **Preview WhatsApp/Instagram** disimpan oleh aplikasi mereka dan bisa baru berubah setelah beberapa hari. Untuk memaksa segar, pakai Sharing Debugger Facebook (berlaku juga untuk Instagram).
- **Statistik harian** baru terisi sejak versi ini dipasang. Klik dan kunjungan sebelumnya hanya ada sebagai total.
- **Asal klik** dicatat per hari di tabel `click_sources` dan tampil di Ringkasan (30 hari terakhir). Asal ditebak dari parameter `?src=` (atau `utm_source`), lalu domain referer, lalu aplikasi pembuka. WhatsApp dan beberapa aplikasi tidak mengirim asal, jadi tercatat "Langsung / tidak diketahui" kecuali linknya diberi `?src=whatsapp`. Hanya nama yang dikenal (lihat `lib/source.js`) yang dicatat.
- **Ikon sosial media** (Instagram, WhatsApp, TikTok, YouTube, Facebook, X, Telegram, email) diatur di Profil dan tampil di bawah bio. Kliknya langsung ke tujuan, tidak lewat `/go`, jadi tidak masuk hitungan klik.
- **Warna kustom** (latar, teks, tombol, aksen) diatur di Tampilan dan menimpa warna tema. Memilih tema lain mengosongkan warna kustom. Dashboard memberi peringatan bila kontras teks terlalu rendah.
- **Gambar di link**: tiap link bisa diberi gambar kecil persegi (dipotong dari tengah, diperkecil di peramban, diunggah ke Vercel Blob lewat `/api/upload` dengan `kind=thumb`). Gambar lama tidak otomatis dihapus dari Blob saat diganti atau dihapus. Server hanya menerima alamat gambar dari domain `*.blob.vercel-storage.com`.
- **Sembunyikan link**: toggle di tiap link. Link tersembunyi tidak tampil di halaman publik, tidak dihitung kliknya, dan alamat `/go/<id>`-nya mengarah ke beranda. Statistik lama link itu tetap tersimpan.
- Ikon sosial dan warna kustom disimpan di kolom `socials` dan `colors` (JSON teks) pada tabel `users`. Gambar link dan sembunyikan link memakai kolom `thumb` dan `hidden` pada tabel `links`. Jalankan `schema-update.sql` sebelum memakai fitur-fitur ini.
- **Batas percobaan**: login 8 kali per akun dan 30 kali per alamat IP per 15 menit; daftar 5 kali per IP per jam; login admin 8 kali per IP per 15 menit.
