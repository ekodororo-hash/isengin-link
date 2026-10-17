alter table users add column if not exists active boolean default true;
alter table users add column if not exists views int default 0;

-- Statistik harian (kunjungan dan klik per hari, zona Asia/Jakarta)
create table if not exists daily_stats(
  user_id int references users(id) on delete cascade,
  day date not null,
  views int not null default 0,
  clicks int not null default 0,
  primary key(user_id, day));

-- Pembatas percobaan login/daftar
create table if not exists rate_limits(
  key text primary key,
  count int not null,
  reset_at timestamptz not null);

-- Asal klik (Instagram, TikTok, dll), dihitung per hari
create table if not exists click_sources(
  user_id int references users(id) on delete cascade,
  day date not null,
  src text not null,
  clicks int not null default 0,
  primary key(user_id, day, src));

-- Ikon sosial media di header profil dan warna kustom (keduanya JSON dalam bentuk teks)
alter table users add column if not exists socials text default '';
alter table users add column if not exists colors text default '';

-- Gambar kecil (thumbnail) di link dan sembunyikan link sementara
alter table links add column if not exists thumb text default '';
alter table links add column if not exists hidden boolean default false;

-- Link katalog produk: harga, harga coret, dan label (promo, baru, terbatas, habis)
alter table links add column if not exists price text default '';
alter table links add column if not exists old_price text default '';
alter table links add column if not exists label text default '';

-- Gaya tombol dan font halaman publik; email opsional di pengaturan akun
alter table users add column if not exists btn_style text default 'bulat';
alter table users add column if not exists font_key text default 'standar';
alter table users add column if not exists email text default '';

-- Email dipakai untuk masuk, jadi harus unik (kolom kosong tidak dihitung)
create unique index if not exists users_email_uniq on users (email) where email <> '';

-- Pembatas antar link ('header' = judul seksi tanpa alamat), latar belakang (JSON teks), dan centang verifikasi
alter table links add column if not exists kind text default 'link';
alter table users add column if not exists bg text default '';
alter table users add column if not exists verified boolean default false;
