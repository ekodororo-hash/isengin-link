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
| `/admin` | Pemilik situs | Login terpisah; ringkasan situs |
| `/admin/pengguna` | Pemilik situs | Daftar pengguna, aktifkan atau nonaktifkan halaman |
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

Setelah mengubah environment variable di Vercel, lakukan **Redeploy**.

## Pasang dari nol

1. **Neon**: buat project, buka SQL Editor, jalankan `schema.sql`, lalu `schema-update.sql` (menambah kolom `active` dan `views`). Kalau database sudah jalan, cukup jalankan `schema-update.sql`.
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
schema.sql, schema-update.sql skema database
```

## Catatan

- Di HP (lebar di bawah 860px), sidebar berubah jadi bilah atas dengan tombol hamburger yang membuka menu; tombol Escape atau pindah halaman menutupnya.
- Halaman publik pengguna memakai tema pilihan penggunanya (kobalt, permen, hutan).
- Menonaktifkan pengguna di admin hanya menyembunyikan halaman publiknya; orangnya masih bisa login.
- Nama yang dilarang (`api`, `dashboard`, `login`, `admin`, `go`) dan batas 30 link per pengguna diatur di kode.
