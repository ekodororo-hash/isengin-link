import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';

// Statistik rentang waktu. Gratis: 7 dan 30 hari. Pro: ditambah 90 hari, Semua (yang tercatat harian), dan tanggal sendiri (maks 1 tahun).
// Semua tanggal memakai zona Jakarta, sama dengan yang dicatat di daily_stats, click_sources, dan link_stats.
const MAX_CUSTOM = 366;
const DAY = 86400000;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const ms = (s) => Date.parse(s + 'T00:00:00Z');
const valid = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(ms(s)) === s;
const bad = (error, status = 400) => Response.json({ error }, { status });

export async function GET(req) {
  const id = await getUserId();
  if (!id) return bad('Belum masuk.', 401);
  const q = new URL(req.url).searchParams;
  const range = q.get('range') || '30';
  if (!['7', '30', '90', 'all', 'custom'].includes(range)) return bad('Rentang tidak dikenal.');

  const plan = await sql`select (plan_until > now()) as pro, (created_at at time zone 'Asia/Jakarta')::date::text as made from users where id=${id}`.catch(() => []);
  const pro = plan[0]?.pro === true;
  if (!pro && !['7', '30'].includes(range)) return bad('Rentang ini khusus paket Pro. Lihat halaman Paket.', 403);

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  // Tanggal paling awal yang bisa dipilih: hari pertama yang tercatat di statistik harian (atau tanggal akun dibuat bila belum ada).
  const first = await sql`select min(day)::text as d from daily_stats where user_id=${id}`.catch(() => []);
  const minDay = first[0]?.d || plan[0]?.made || today;

  let from, to = today;
  if (range === 'all') from = minDay;
  else if (range === 'custom') {
    from = q.get('from'); to = q.get('to');
    if (!valid(from) || !valid(to)) return bad('Tanggal tidak valid.');
    if (to > today) to = today;
    if (from < minDay) from = minDay;
    if (from > to) return bad('Tanggal mulai harus sebelum tanggal akhir.');
    if ((ms(to) - ms(from)) / DAY + 1 > MAX_CUSTOM) return bad('Rentang tanggal paling lama 1 tahun.');
  } else from = iso(ms(today) - (Number(range) - 1) * DAY);

  const [daily, sources, linkDays] = await Promise.all([
    sql`select to_char(d,'YYYY-MM-DD') as day, coalesce(s.views,0)::int as views, coalesce(s.clicks,0)::int as clicks
        from generate_series(${from}::date, ${to}::date, interval '1 day') d
        left join daily_stats s on s.user_id=${id} and s.day=d::date order by d`,
    sql`select src, sum(clicks)::int as clicks from click_sources
        where user_id=${id} and day between ${from}::date and ${to}::date
        group by src order by 2 desc`,
    sql`select ls.link_id, to_char(ls.day,'YYYY-MM-DD') as day, ls.clicks
        from link_stats ls join links l on l.id=ls.link_id
        where l.user_id=${id} and ls.day between ${from}::date and ${to}::date
        order by ls.day`,
  ]).catch((e) => { console.error('Statistik gagal (sudah jalankan schema-update.sql?):', e.message); return [null, null, null]; });
  if (!daily) return bad('Statistik belum bisa dimuat. Coba lagi.', 500);
  return Response.json({ pro, range, from, to, today, min_day: minDay, daily, sources, link_days: linkDays });
}
