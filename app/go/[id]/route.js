import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { normSrc } from '@/lib/source';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export async function GET(req, { params }) {
  const id = Number(params.id) || 0;
  // Link yang disembunyikan tidak menghitung klik dan tidak diteruskan (pengunjung dikirim ke beranda).
  // Asal klik ditentukan halaman profil dan dibawa lewat ?s=; nilai di luar daftar dianggap "langsung".
  const src = normSrc(new URL(req.url).searchParams.get('s')) || 'langsung';
  let r;
  if (isBot(req.headers.get('user-agent'))) {
    r = await sql`select url from links where id=${id} and hidden is not true`.catch(() => sql`select url from links where id=${id}`);
  } else {
    try {
      // naikkan total klik, hitungan harian, dan asal klik dalam satu perintah
      r = await sql`
        with l as (update links set clicks=clicks+1 where id=${id} and hidden is not true returning url, user_id),
        s as (insert into daily_stats(user_id, day, clicks)
              select user_id, (now() at time zone 'Asia/Jakarta')::date, 1 from l
              on conflict (user_id, day) do update set clicks = daily_stats.clicks + 1),
        c as (insert into click_sources(user_id, day, src, clicks)
              select user_id, (now() at time zone 'Asia/Jakarta')::date, ${src}::text, 1 from l
              on conflict (user_id, day, src) do update set clicks = click_sources.clicks + 1)
        select url from l`;
    } catch (e) {
      console.error('Gagal mencatat asal klik/cek link tersembunyi (sudah jalankan schema-update.sql?):', e.message);
      try {
        r = await sql`
          with l as (update links set clicks=clicks+1 where id=${id} and hidden is not true returning url, user_id),
          s as (insert into daily_stats(user_id, day, clicks)
                select user_id, (now() at time zone 'Asia/Jakarta')::date, 1 from l
                on conflict (user_id, day) do update set clicks = daily_stats.clicks + 1)
          select url from l`;
      } catch (e2) {
        console.error('Gagal mencatat klik harian (sudah jalankan schema-update.sql?):', e2.message);
        r = await sql`update links set clicks=clicks+1 where id=${id} returning url`;
      }
    }
  }
  return Response.redirect(r[0]?.url || new URL('/', req.url).toString(), 302);
}
