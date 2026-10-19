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
alter table users add column if not exists verified_at timestamptz;

-- Statistik per link (klik per hari)
create table if not exists link_stats(
  link_id int references links(id) on delete cascade,
  day date not null,
  clicks int not null default 0,
  primary key(link_id, day));

-- Paket Pro: plan_until kosong atau sudah lewat = gratis
alter table users add column if not exists plan_until timestamptz;

-- Domain kustom (hanya Pro). domain_status: '' | 'pending' | 'active'
alter table users add column if not exists custom_domain text;
alter table users add column if not exists domain_status text default '';
create unique index if not exists users_domain_uniq on users (custom_domain) where custom_domain is not null;

-- Riwayat pembayaran (catatan tetap ada walau akun dihapus)
create table if not exists payments(
  order_id text primary key,
  user_id int references users(id) on delete set null,
  plan text not null,
  amount int not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  paid_at timestamptz);
create index if not exists payments_user on payments(user_id);

-- Pengajuan centang verifikasi oleh pengguna (status: pending | rejected; yang disetujui dihapus dari sini dan users.verified jadi true)
create table if not exists verify_requests(
  user_id int primary key references users(id) on delete cascade,
  note text not null default '',
  status text not null default 'pending',
  reason text default '',
  created_at timestamptz default now(),
  decided_at timestamptz);

-- Program referral: siapa yang mengundang, dan kapan hadiahnya sudah dibayarkan
alter table users add column if not exists created_at timestamptz default now();
alter table users add column if not exists referred_by int references users(id) on delete set null;
alter table users add column if not exists ref_rewarded_at timestamptz;
create index if not exists users_referred_by on users(referred_by);

-- Link pintar: buka link YouTube, Instagram, dll langsung di aplikasinya (bisa dimatikan pengguna)
alter table users add column if not exists smart_links boolean default true;

-- Laporan halaman dari pengunjung (status: open | dismissed | actioned)
create table if not exists reports(
  id serial primary key,
  user_id int references users(id) on delete cascade,
  reason text not null,
  detail text default '',
  status text not null default 'open',
  created_at timestamptz default now(),
  handled_at timestamptz);
create index if not exists reports_open on reports(status, user_id);

-- Link sorotan, pengaman link (peringatan 18+ atau sandi), pengumuman dari admin
alter table links add column if not exists featured boolean default false;
alter table links add column if not exists guard text default '';
alter table links add column if not exists pass_hash text default '';
create table if not exists announcements(
  id serial primary key,
  text text not null,
  level text not null default 'info',
  active boolean not null default true,
  created_at timestamptz default now());

-- Pengaturan situs yang diubah dari halaman admin (pembayaran dan domain). Mengalahkan Environment Variables Vercel bila diisi.
create table if not exists site_settings(
  key text primary key,
  value text not null,
  updated_at timestamptz default now());

-- Klaim hadiah referral dipisah: ref_rewarded_at = pengundang sudah klaim hadiah untuk teman ini,
-- ref_bonus_at = teman itu sudah klaim bonus undangannya sendiri.
-- Hadiah yang sudah dibayarkan sebelum kolom ini ada dianggap bonusnya sudah diklaim (hanya sekali, saat kolom dibuat).
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='users' and column_name='ref_bonus_at') then
    alter table users add column ref_bonus_at timestamptz;
    update users set ref_bonus_at = ref_rewarded_at where ref_rewarded_at is not null;
  end if;
end $$;

-- Verifikasi email dan reset sandi lewat kode 6 angka (dikirim lewat Resend).
-- email_verified_at: email akun sudah dibuktikan milik pengguna. pw_changed_at: sesi login yang lebih lama dari ini tidak berlaku lagi.
alter table users add column if not exists email_verified_at timestamptz;
alter table users add column if not exists pw_changed_at timestamptz;
-- Satu kode aktif per pengguna per keperluan ('verify' = email baru di Pengaturan, 'reset' = lupa sandi). Yang disimpan hanya hash-nya.
create table if not exists email_codes(
  id serial primary key,
  user_id int references users(id) on delete cascade,
  purpose text not null,
  email text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz default now());
create unique index if not exists email_codes_uniq on email_codes (user_id, purpose);

-- Jadwal tayang link (tampil mulai show_at, hilang sejak hide_at; kosong = tanpa batas) dan alamat usaha/toko di profil
alter table links add column if not exists show_at timestamptz;
alter table links add column if not exists hide_at timestamptz;
alter table users add column if not exists store_name text default '';
alter table users add column if not exists store_addr text default '';
