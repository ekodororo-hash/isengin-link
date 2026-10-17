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
| `CRON_SECRET` | Teks acak panjang. Dipakai Vercel Cron untuk memanggil `/api/cron/blob` (pembersih file Blob yatim). Tanpa ini endpoint menolak semua permintaan |
| `MIDTRANS_SERVER_KEY` | Server key Midtrans (Settings > Access Keys). Tanpa ini tombol bayar menolak |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk produksi; selain itu memakai sandbox |
| `PRO_PRICE_MONTH`, `PRO_PRICE_YEAR` | Harga Pro dalam rupiah (bawaan 29000 dan 290000) |
| `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | Untuk mendaftarkan domain kustom ke project lewat API Vercel. Team ID hanya bila project ada di Team |
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

## Fitur tambahan

- **Link katalog produk**: tiap link bisa diberi harga, harga coret, dan label (Promo, Baru, Stok terbatas, Habis). Kolom `price`, `old_price`, `label` pada tabel `links`.
- **Seret dan lepas** untuk mengurutkan link (ikon titik-titik di tiap baris; tombol panah tetap ada).
- **Gaya tombol dan font** di Tampilan, disimpan di kolom `btn_style` dan `font_key`; daftar pilihan ada di `lib/style.js`.
- **Pengaturan** (`/dashboard/pengaturan`, API `/api/account`): email opsional, ganti sandi (sandi baru minimal 8 karakter, ada meter kekuatan), dan hapus akun (konfirmasi nama pengguna dan sandi). Kolom `email` pada tabel `users`.
- Jalankan `schema-update.sql` lagi sebelum memakai semua fitur di atas.

## Pembersihan Blob, pembatas, latar belakang, verifikasi

- **Pembersihan Blob**: saat Simpan, file yang tidak lagi dipakai (foto profil, gambar link, gambar latar, atau gambar milik link yang dihapus) langsung dihapus dari Vercel Blob. Hapus akun (oleh pengguna maupun admin) ikut menghapus semua filenya. Hanya file milik pengguna itu (nama diawali `avatars/<id>-`, `thumbs/<id>-`, atau `backgrounds/<id>-`) yang bisa dihapus, dan server menolak alamat Blob milik pengguna lain saat menyimpan. Unggahan yang tidak jadi disimpan disapu cron harian (`vercel.json`, 03.00 WIB, `/api/cron/blob`) setelah lewat 24 jam. Isi `CRON_SECRET` di Vercel lalu Redeploy.
- **Pembatas antar link**: di Link, tombol “Tambah pembatas” membuat judul seksi tanpa alamat (kolom `kind = 'header'` pada tabel `links`). Pembatas bisa diseret, disembunyikan, dan dihapus seperti link, tapi tidak punya klik, harga, atau gambar. Dihitung dalam batas 30 item.
- **Latar belakang**: di Tampilan, pilih warna tema, gradasi dua warna (3 arah), atau gambar (dipudarkan ke warna latar tema, 0–90%). Disimpan sebagai JSON di kolom `users.bg`; gambar diunggah dengan `kind=bg` ke folder `backgrounds/`. Gradasi ikut tampil di gambar preview saat link dibagikan; gambar latar tidak.
- **Verified badge**: admin memberi atau mencabut centang di `/admin/pengguna` (kolom `users.verified`). Pengguna tidak bisa mengubahnya sendiri. Centang tampil di samping nama di halaman publik dan pratinjau dashboard.
- Jalankan `schema-update.sql` lagi (menambah `links.kind`, `users.bg`, `users.verified`) sebelum deploy.

## Paket Pro, domain kustom, statistik per link, 404, transaksi

- **Paket Gratis dan Pro** (`/dashboard/paket`): Pro membuka statistik harian per link 30 hari (gratis 7 hari), domain kustom, dan menghilangkan tulisan “Dibuat di isengin.site”. Batas link tidak dibedakan, jadi tidak ada data pengguna lama yang terpotong. Harga di env `PRO_PRICE_*`; paket 30 dan 365 hari, tanpa perpanjangan otomatis, dan perpanjangan ditambahkan setelah masa aktif yang tersisa. Aturan paket ada di `lib/plan.js`.
- **Pembayaran Midtrans** (Snap, tanpa SDK, `lib/midtrans.js`): `POST /api/billing` membuat pesanan (tabel `payments`) lalu mengarahkan ke halaman bayar Midtrans. Paket aktif hanya setelah webhook `POST /api/billing/webhook` lolos tiga pemeriksaan: tanda tangan SHA-512, status dicek ulang langsung ke API Midtrans, dan nominal sama dengan pesanan. Webhook aman dipanggil berulang (pesanan lunas tidak memperpanjang dua kali). **Atur di dashboard Midtrans: Settings, Configuration, Payment Notification URL = `https://isengin.site/api/billing/webhook`.** Admin bisa memberi atau mencabut Pro manual di `/admin/pengguna` (berguna untuk uji coba).
- **Domain kustom** (`/dashboard/domain`, khusus Pro): pengguna mengetik domain, server mendaftarkannya ke project Vercel lewat API (`lib/vercel.js`), pengguna mengatur DNS (CNAME `cname.vercel-dns.com` untuk subdomain, A `76.76.21.21` untuk domain utama), lalu klik Cek status. `middleware.js` mengalihkan beranda (`/`) di domain selain domain utama ke `app/domain/[host]`, yang hanya melayani domain berstatus `active` milik akun yang masih Pro. Path lain (`/go/...`) berjalan normal. Domain dilepas dari Vercel saat pengguna melepasnya atau akunnya dihapus. Kolom: `users.custom_domain`, `users.domain_status`.
- **Statistik per link**: klik dicatat per hari di tabel `link_stats` (ikut perintah SQL `/go/<id>` yang sama). Ringkasan punya kartu “Peringkat link” (Semua, 7 hari, 30 hari) dengan grafik harian per link. Klik sebelum fitur ini dipasang hanya ada di total.
- **Halaman 404** (`app/not-found.js`): menawarkan “ambil nama ini” bila alamatnya berbentuk nama pengguna yang masih kosong, atau pesan lain bila akunnya ada tapi nonaktif.
- **Simpan jadi satu transaksi** (`PUT /api/me`): profil, tampilan, dan semua link disimpan lewat `sql.transaction` (4 perintah, tanpa query per link). Gagal berarti tidak ada yang berubah. Konsekuensinya fallback “kolom belum ada” saat menyimpan dihapus: **`schema-update.sql` wajib sudah dijalankan**, kalau belum simpan gagal dengan pesan yang jelas. Membaca data tetap tahan terhadap kolom yang belum ada.
- Jalankan `schema-update.sql` lagi (menambah `link_stats`, `users.plan_until`, `users.custom_domain`, `users.domain_status`, `payments`).

## Centang untuk pengguna, referral, link pintar

**Jalankan `schema-update.sql` lagi sebelum deploy** (menambah tabel `verify_requests`, kolom `users.referred_by`, `ref_rewarded_at`, `smart_links`).

- **Ajukan centang** (`/dashboard/pengaturan`, API `/api/verify`): pengguna harus memenuhi syarat otomatis (foto, bio minimal 10 karakter, minimal 1 link tampil, akun berumur 3 hari) lalu menulis alasan atau bukti akun resmi. Admin menyetujui atau menolak di `/admin/pengguna` (bagian Pengajuan centang); penolakan membawa alasan dan pengajuan bisa diulang setelah 7 hari. Batas 3 pengajuan per hari per akun. Aturan ada di `lib/verify.js`.
- **Referral** (`/dashboard/undang`, API `/api/referral`): kode undangan adalah nama pengguna, dipakai lewat `isengin.site/?ref=nama`. Link “Dibuat di isengin.site” di halaman gratis juga membawa kode pemilik halaman. Hadiah (+7 hari Pro untuk pengundang dan +7 untuk teman) dibayarkan sekali per teman setelah akunnya berumur 24 jam dan punya minimal 1 link tampil, maksimal 10 teman berhadiah per akun. Dihitung saat pengundang membuka halaman Undang atau Paket (`lib/referral.js`, satu perintah SQL sehingga aman diulang). Angka hadiah diubah di bagian atas `lib/referral.js`.
- **Link pintar** (`lib/deeplink.js`, dipakai `app/go/[id]/route.js`): di HP, link ke YouTube, Instagram, TikTok, Facebook, X, Threads, WhatsApp, Telegram, Spotify, Tokopedia, Shopee, dan Lazada lewat halaman perantara singkat yang mencoba membuka aplikasinya, lalu jatuh ke web setelah sekitar 1,6 detik. Android memakai `intent://` dengan alamat cadangan; iOS memakai skema aplikasi untuk pola yang jelas (YouTube, profil Instagram, WhatsApp, Telegram, Spotify), sisanya dialihkan biasa. Bot dan desktop tidak terpengaruh, klik tetap dihitung. Pengguna bisa mematikannya di Pengaturan (`users.smart_links`).

## Halaman admin

`/admin` (ringkasan), `/admin/pengguna` (cari, saring, lalu Kelola per akun: Pro, centang, status, hapus), `/admin/centang` (pengajuan centang dan daftar akun bercentang), `/admin/referral` (pengundang teratas dan undangan terbaru, API `/api/admin/referral`). Jumlah pengajuan yang menunggu tampil di menu.

## Keamanan dan moderasi, impor Linktree, langkah awal

**Jalankan `schema-update.sql` lagi sebelum deploy** (menambah tabel `reports`).

- **Pemeriksaan alamat link** (`lib/safe.js`, dipakai `PUT /api/me` dan impor): hanya `http`, `https`, `mailto`; menolak alamat dengan nama pengguna/sandi di dalamnya (`https://bank.com@situs-lain.com`), alamat IP langsung, dan domain di env `BLOCKED_DOMAINS` (pisahkan dengan koma). Bila env `SAFE_BROWSING_KEY` (kunci API Google Safe Browsing) diisi, link yang baru ditambahkan ikut dicek ke Google; kalau layanannya gagal, link tetap diterima. `/go/<id>` juga tidak meneruskan alamat selain http/https/mailto.
- **Laporkan halaman**: tombol di kaki halaman publik (`app/[username]/Report.js`, API `POST /api/report`, tanpa login). Maks. 6 laporan per IP per jam dan 1 laporan per IP per halaman per hari. Admin menanganinya di `/admin/laporan` (API `/api/admin/laporan`): Nonaktifkan halaman atau Abaikan laporan. Jumlah halaman yang dilaporkan tampil di menu admin.
- **Impor dari Linktree** (Link, bagian atas; API `POST /api/import`): server mengambil `https://linktr.ee/<nama>` (nama divalidasi ketat), membaca data JSON halamannya (`lib/linktree.js`), dan mengembalikan daftar link. Link ditambahkan ke daftar di layar dan baru tersimpan setelah Simpan. Maks. 6 impor per akun per jam. **Bergantung pada bentuk halaman Linktree; kalau Linktree mengubahnya, perbaiki `lib/linktree.js`.**
- **Langkah awal** (Ringkasan dashboard, `app/dashboard/Langkah.js`): foto, bio, link pertama, tampilan, dan kunjungan pertama. Status dihitung dari data akun, tanpa kolom baru, dan kartunya hilang sendiri bila semua selesai.
