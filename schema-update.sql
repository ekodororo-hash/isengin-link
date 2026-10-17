alter table users add column if not exists active boolean default true;
alter table users add column if not exists views int default 0;
