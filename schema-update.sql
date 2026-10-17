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
