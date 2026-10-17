import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
export const dynamic = 'force-dynamic';
export async function GET(req, { params }) {
  const id = Number(params.id) || 0;
  let r;
  if (isBot(req.headers.get('user-agent'))) {
    r = await sql`select url from links where id=${id}`;
  } else {
    try {
      // naikkan total klik dan hitungan harian dalam satu perintah
      r = await sql`
        with l as (update links set clicks=clicks+1 where id=${id} returning url, user_id),
        s as (insert into daily_stats(user_id, day, clicks)
              select user_id, (now() at time zone 'Asia/Jakarta')::date, 1 from l
              on conflict (user_id, day) do update set clicks = daily_stats.clicks + 1)
        select url from l`;
    } catch (e) {
      console.error('Gagal mencatat klik harian (sudah jalankan schema-update.sql?):', e.message);
      r = await sql`update links set clicks=clicks+1 where id=${id} returning url`;
    }
  }
  return Response.redirect(r[0]?.url || new URL('/', req.url).toString(), 302);
}
