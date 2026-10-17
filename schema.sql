create table if not exists users(
  id serial primary key, username text unique not null, password_hash text not null,
  display_name text, bio text default '', theme text default 'kobalt', photo_url text,
  created_at timestamptz default now());
create table if not exists links(
  id serial primary key, user_id int references users(id) on delete cascade,
  title text not null, url text not null, position int default 0, clicks int default 0);
