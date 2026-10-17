import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { normSrc } from '@/lib/source';
import { smartTarget, smartHtml } from '@/lib/deeplink';
import { cleanGuard, checkPass, guardHtml } from '@/lib/linkguard';
import { hit, clear, ipOf } from '@/lib/limit';
import { effectiveLook } from '@/lib/pro';
import { themeWith } from '@/lib/themes';
import { cleanBtn, cleanFont, fontCss } from '@/lib/style';

// Warna, font, dan bentuk tombol halaman pemilik, supaya halaman perantara terlihat sama dengan halamannya.
async function lookOf(uid) {
  const [a, b, c] = await Promise.all([
    sql`select theme,colors from users where id=${uid}`.catch(() => []),
    sql`select btn_style,font_key from users where id=${uid}`.catch(() => []),
    sql`select (plan_until > now()) as pro from users where id=${uid}`.catch(() => []),
  ]);
  const eff = effectiveLook({ theme: a[0]?.theme, colors: a[0]?.colors, btn_style: cleanBtn(b[0]?.btn_style), font_key: cleanFont(b[0]?.font_key), bg: '' }, c[0]?.pro === true);
  const t = themeWith(eff.theme, eff.colors);
  return { bg: t.bg, ink: t.ink, btn: t.btn, accent: t.accent, style: eff.btn_style, font: fontCss(eff.font_key) };
}
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const page = (html, status = 200) => new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

// opt.skip: pengaman sudah lolos (sandi benar); opt.post: balas dengan 303 karena permintaan asalnya POST.
async function run(req, { params }, opt = {}) {
  const id = Number(params.id) || 0;
  // Link yang disembunyikan tidak menghitung klik dan tidak diteruskan (pengunjung dikirim ke beranda).
  // Asal klik ditentukan halaman profil dan dibawa lewat ?s=; nilai di luar daftar dianggap "langsung".
  const src = normSrc(new URL(req.url).searchParams.get('s')) || 'langsung';
  // Link berpengaman: peringatan 18+ (lanjut lewat ?ok=1) atau sandi (diperiksa di POST). Klik baru dihitung setelah lolos.
  if (!opt.skip) {
    const g = (await sql`select l.guard, u.username, u.id as uid from links l join users u on u.id=l.user_id where l.id=${id} and l.hidden is not true`.catch(() => []))[0];
    const guard = cleanGuard(g?.guard);
    const action = `/go/${id}?s=${encodeURIComponent(src)}`;
    const askOk = guard === 'adult' && new URL(req.url).searchParams.get('ok') !== '1';
    if (guard === 'pass' || askOk) return page(guardHtml({ kind: guard, action, back: `/${g.username}`, look: await lookOf(g.uid) }));
  }
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
  return Response.redirect(dest || new URL('/', req.url).toString(), opt.post ? 303 : 302);
}

export const GET = (req, ctx) => run(req, ctx);

// Kirim sandi untuk link terkunci. Salah sandi dibatasi 8 kali per link per alamat IP per 15 menit.
export async function POST(req, ctx) {
  const id = Number(ctx.params.id) || 0;
  const row = (await sql`select l.guard, l.pass_hash, u.username, u.id as uid from links l join users u on u.id=l.user_id where l.id=${id} and l.hidden is not true`.catch(() => []))[0];
  if (!row || cleanGuard(row.guard) !== 'pass') return Response.redirect(new URL(`/go/${id}`, req.url).toString(), 303);
  const src = normSrc(new URL(req.url).searchParams.get('s')) || 'langsung';
  const action = `/go/${id}?s=${encodeURIComponent(src)}`;
  const key = `lp:${id}:${ipOf(req)}`;
  const look = await lookOf(row.uid);
  const t = await hit(key, 8, 900);
  if (t.over) return page(guardHtml({ kind: 'pass', action, back: `/${row.username}`, look, error: `Terlalu banyak percobaan. Coba lagi sekitar ${Math.max(1, Math.ceil(t.wait / 60))} menit lagi.` }), 429);
  const form = await req.formData().catch(() => null);
  if (!checkPass(String(form?.get('pass') || ''), row.pass_hash)) return page(guardHtml({ kind: 'pass', action, back: `/${row.username}`, look, error: 'Sandi salah.' }), 401);
  await clear(key);
  return run(req, ctx, { skip: true, post: true });
}
