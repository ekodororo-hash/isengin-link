import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { hasCookie, dayCookie } from '@/lib/daily';

// Dipanggil sekali dari browser saat halaman profil terbuka (lihat ViewBeacon).
// Satu pengunjung dihitung sekali per halaman per hari WIB; refresh tidak menambah angka.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const username = String(body?.username || '').toLowerCase().slice(0, 40);
  if (!/^[a-z0-9_]{1,40}$/.test(username) || isBot(req.headers.get('user-agent'))) return Response.json({ ok: true, counted: false });
  const u = (await sql`select id from users where username=${username} and active is not false`.catch(() => []))[0];
  if (!u) return Response.json({ ok: true, counted: false });
  const name = `vp_${u.id}`;
  if (hasCookie(req, name)) return Response.json({ ok: true, counted: false });
  try {
    await sql`with a as (update users set views=views+1 where id=${u.id})
      insert into daily_stats(user_id, day, views) values (${u.id}, (now() at time zone 'Asia/Jakarta')::date, 1)
      on conflict (user_id, day) do update set views = daily_stats.views + 1`;
  } catch (e) {
    console.error('Gagal mencatat kunjungan (sudah jalankan schema-update.sql?):', e.message);
    try { await sql`update users set views=views+1 where id=${u.id}`; } catch {}
  }
  return Response.json({ ok: true, counted: true }, { headers: { 'Set-Cookie': dayCookie(req, name), 'Cache-Control': 'no-store' } });
}
