import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { normSrc } from '@/lib/source';
import { smartTarget, smartHtml } from '@/lib/deeplink';
import { cleanGuard, checkPass, guardHtml } from '@/lib/linkguard';
import { hit, clear, ipOf } from '@/lib/limit';
import { hasCookie, dayCookie } from '@/lib/daily';

const page = (html, status = 200) => new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

// opt.skip: pengaman sudah lolos (sandi benar); opt.post: balas dengan 303 karena permintaan asalnya POST.
async function run(req, { params }, opt = {}) {
  const id = Number(params.id) || 0;
  // Link yang disembunyikan tidak menghitung klik dan tidak diteruskan (pengunjung dikirim ke beranda).
  // Asal klik ditentukan halaman profil dan dibawa lewat ?s=; nilai di luar daftar dianggap "langsung".
  const src = normSrc(new URL(req.url).searchParams.get('s')) || 'langsung';
  // Link berpengaman: peringatan 18+ (lanjut lewat ?ok=1) atau sandi (diperiksa di POST). Klik baru dihitung setelah lolos.
  if (!opt.skip) {
    const g = (await sql`select l.guard, u.username from links l join users u on u.id=l.user_id where l.id=${id} and l.hidden is not true`.catch(() => []))[0];
    const guard = cleanGuard(g?.guard);
    const action = `/go/${id}?s=${encodeURIComponent(src)}`;
    const askOk = guard === 'adult' && new URL(req.url).searchParams.get('ok') !== '1';
    if (guard === 'pass' || askOk) return page(guardHtml({ kind: guard, action, back: `/${g.username}` }));
  }
  let r;
  // Satu pengunjung dihitung sekali per link per hari (cookie sampai 00.00 WIB); klik berikutnya tetap diteruskan.
  const ck = `lc_${id}`;
  const bot = isBot(req.headers.get('user-agent'));
  const seen = hasCookie(req, ck);
  const setCk = !bot && !seen ? dayCookie(req, ck) : null;
  if (bot || seen) {
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
  // Link pintar (selalu aktif): di HP, link ke aplikasi populer dibuka di aplikasinya. Bot dan desktop tetap dialihkan biasa.
  const ua = req.headers.get('user-agent') || '';
  const t = dest && !isBot(ua) ? smartTarget(dest, ua) : null;
  if (t)
    return new Response(smartHtml({ ...t, web: dest }), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...(setCk ? { 'Set-Cookie': setCk } : {}) } });
  // Response.redirect() tidak bisa diberi header, jadi dibuat manual supaya cookie ikut terkirim.
  return new Response(null, { status: opt.post ? 303 : 302, headers: { Location: dest || new URL('/', req.url).toString(), ...(setCk ? { 'Set-Cookie': setCk } : {}) } });
}

export const GET = (req, ctx) => run(req, ctx);

// Kirim sandi untuk link terkunci. Salah sandi dibatasi 8 kali per link per alamat IP per 15 menit.
export async function POST(req, ctx) {
  const id = Number(ctx.params.id) || 0;
  const row = (await sql`select l.guard, l.pass_hash, u.username from links l join users u on u.id=l.user_id where l.id=${id} and l.hidden is not true`.catch(() => []))[0];
  if (!row || cleanGuard(row.guard) !== 'pass') return Response.redirect(new URL(`/go/${id}`, req.url).toString(), 303);
  const src = normSrc(new URL(req.url).searchParams.get('s')) || 'langsung';
  const action = `/go/${id}?s=${encodeURIComponent(src)}`;
  const key = `lp:${id}:${ipOf(req)}`;
  const t = await hit(key, 8, 900);
  if (t.over) return page(guardHtml({ kind: 'pass', action, back: `/${row.username}`, error: `Terlalu banyak percobaan. Coba lagi sekitar ${Math.max(1, Math.ceil(t.wait / 60))} menit lagi.` }), 429);
  const form = await req.formData().catch(() => null);
  if (!checkPass(String(form?.get('pass') || ''), row.pass_hash)) return page(guardHtml({ kind: 'pass', action, back: `/${row.username}`, error: 'Sandi salah.' }), 401);
  await clear(key);
  return run(req, ctx, { skip: true, post: true });
}
