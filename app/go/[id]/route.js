import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { normSrc } from '@/lib/source';
import { smartTarget, smartHtml } from '@/lib/deeplink';
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
      // naikkan total klik, hitungan harian, asal klik, dan hitungan harian per link dalam satu perintah
      r = await sql`
        with l as (update links set clicks=clicks+1 where id=${id} and hidden is not true returning id, url, user_id),
        s as (insert into daily_stats(user_id, day, clicks)
              select user_id, (now() at time zone 'Asia/Jakarta')::date, 1 from l
              on conflict (user_id, day) do update set clicks = daily_stats.clicks + 1),
        c as (insert into click_sources(user_id, day, src, clicks)
              select user_id, (now() at time zone 'Asia/Jakarta')::date, ${src}::text, 1 from l
              on conflict (user_id, day, src) do update set clicks = click_sources.clicks + 1),
        k as (insert into link_stats(link_id, day, clicks)
              select id, (now() at time zone 'Asia/Jakarta')::date, 1 from l
              on conflict (link_id, day) do update set clicks = link_stats.clicks + 1)
        select url from l`;
    } catch (e0) {
      console.error('Gagal mencatat statistik per link (sudah jalankan schema-update.sql?):', e0.message);
      r = null;
    }
    if (!r) try {
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
  const dest0 = r[0]?.url;
  const dest = dest0 && /^(https?:|mailto:)/i.test(dest0.trim()) ? dest0.trim() : '';
  // Link pintar: di HP, link ke aplikasi populer dibuka di aplikasinya. Bot dan desktop tetap dialihkan biasa.
  const ua = req.headers.get('user-agent') || '';
  const t = dest && !isBot(ua) ? smartTarget(dest, ua) : null;
  if (t) {
    const on = (await sql`select u.smart_links from links l join users u on u.id=l.user_id where l.id=${id}`.catch(() => []))[0]?.smart_links;
    if (on !== false)
      return new Response(smartHtml({ ...t, web: dest }), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  }
  return Response.redirect(dest || new URL('/', req.url).toString(), 302);
}
