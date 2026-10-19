import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { THEME_KEYS, DEFAULT_THEME, cleanColors, cleanBg } from '@/lib/themes';
import { cleanSocials, parseSocials } from '@/lib/socials';
import { cleanPrice, cleanLabel } from '@/lib/catalog';
import { cleanBtn, cleanFont } from '@/lib/style';
import { urlProblem, flaggedUrls } from '@/lib/safe';
import { PRO_THEMES, PRO_FONTS, PRO_BTNS, FREE_THUMBS } from '@/lib/pro';
import { cleanGuard, hashPass, PASS_MIN, PASS_MAX } from '@/lib/linkguard';
import { isBlobUrl, ownBlob, userBlobs, dropBlobs } from '@/lib/blob';
import { pending, pendingBonus } from '@/lib/referral';
const fix = (u) => (/^(https?:|mailto:)/i.test(u.trim()) ? u.trim() : 'https://' + u.trim());
async function load(id) {
  const [u, links, daily, sources, extra, look, more, plan] = await Promise.all([
    sql`select username,display_name,bio,theme,photo_url,views from users where id=${id}`,
    sql`select id,title,url,clicks,thumb,hidden,price,old_price,label,kind,featured,guard,(coalesce(pass_hash,'') <> '') as has_pass from links where user_id=${id} order by position,id`
      .catch(() => sql`select id,title,url,clicks,thumb,hidden,price,old_price,label,kind from links where user_id=${id} order by position,id`)
      .catch(() => sql`select id,title,url,clicks,thumb,hidden,price,old_price,label from links where user_id=${id} order by position,id`)
      .catch(() => sql`select id,title,url,clicks,thumb,hidden from links where user_id=${id} order by position,id`)
      .catch((e) => { console.error('Kolom thumb/hidden belum ada (jalankan schema-update.sql):', e.message); return sql`select id,title,url,clicks from links where user_id=${id} order by position,id`; }),
    // 30 hari terakhir (zona Jakarta), hari tanpa data diisi 0
    sql`select to_char(d,'YYYY-MM-DD') as day, coalesce(s.views,0)::int as views, coalesce(s.clicks,0)::int as clicks
        from generate_series(((now() at time zone 'Asia/Jakarta')::date - 29)::timestamp, (now() at time zone 'Asia/Jakarta')::date::timestamp, interval '1 day') d
        left join daily_stats s on s.user_id=${id} and s.day=d::date order by d`.catch((e) => { console.error('Statistik harian gagal (sudah jalankan schema-update.sql?):', e.message); return []; }),
    // asal klik 30 hari terakhir, terbanyak dulu
    sql`select src, sum(clicks)::int as clicks from click_sources
        where user_id=${id} and day >= ((now() at time zone 'Asia/Jakarta')::date - 29)
        group by src order by 2 desc`.catch((e) => { console.error('Asal klik gagal (sudah jalankan schema-update.sql?):', e.message); return []; }),
    sql`select socials,colors from users where id=${id}`.catch((e) => { console.error('Kolom socials/colors belum ada (jalankan schema-update.sql):', e.message); return []; }),
    sql`select btn_style,font_key from users where id=${id}`.catch(() => []),
    sql`select bg,verified from users where id=${id}`.catch(() => []),
    sql`select (plan_until > now()) as pro, plan_until from users where id=${id}`.catch(() => []),
  ]);
  const pro = plan[0]?.pro === true;
  // Statistik per link: Pro 30 hari, gratis 7 hari (zona Jakarta). Hanya hari yang ada isinya.
  const linkDays = await sql`select ls.link_id, to_char(ls.day,'YYYY-MM-DD') as day, ls.clicks
      from link_stats ls join links l on l.id=ls.link_id
      where l.user_id=${id} and ls.day >= ((now() at time zone 'Asia/Jakarta')::date - ${pro ? 29 : 6}::int)
      order by ls.day`.catch((e) => { console.error('Statistik per link gagal (sudah jalankan schema-update.sql?):', e.message); return []; });
  return { ...u[0], links: links.map((l) => ({ ...l, thumb: l.thumb || '', hidden: l.hidden === true, price: l.price || '', old_price: l.old_price || '', label: l.label || '', kind: l.kind === 'header' ? 'header' : 'link', featured: l.featured === true, guard: cleanGuard(l.guard), has_pass: l.has_pass === true })), announce: (await sql`select id,text,level from announcements where active order by id desc limit 1`.catch(() => []))[0] || null, bg: cleanBg(more[0]?.bg), verified: more[0]?.verified === true, pro, plan_until: plan[0]?.plan_until || null, stat_days: pro ? 30 : 7, link_days: linkDays, btn_style: cleanBtn(look[0]?.btn_style), font_key: cleanFont(look[0]?.font_key), daily, sources, socials: parseSocials(extra[0]?.socials), colors: cleanColors(extra[0]?.colors) };
}
export async function GET() {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  // ref_gift: hadiah pengundang yang siap diklaim; ref_bonus: bonus undangan milik pengguna ini. Keduanya untuk modal setelah login (null bila tidak ada).
  // Belum ada yang dibayar sampai pengguna klik Klaim sendiri.
  const [data, gift, bonus] = await Promise.all([load(id), pending(id).catch(() => null), pendingBonus(id).catch(() => null)]);
  return Response.json({ ...data, ref_gift: gift, ref_bonus: bonus });
}
export async function PUT(req) {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const b = await req.json();
  // File Blob yang dipakai sebelum simpan. Dipakai dua kali: hanya alamat milik sendiri (atau yang memang
  // sudah tersimpan di akun ini) yang diterima, dan selisihnya dengan keadaan sesudah simpan dihapus dari penyimpanan.
  const before = await userBlobs(id);
  const allowed = (u) => ownBlob(u, id) || before.includes(u);
  // Gambar hanya boleh berasal dari penyimpanan Supabase (hasil unggahan lewat /api/upload).
  const okThumb = (u) => {
    try {
      const x = new URL(String(u || ''));
      return isBlobUrl(x.href) && x.href.length <= 500 && allowed(x.href) ? x.href : '';
    } catch { return ''; }
  };
  const theme = THEME_KEYS.includes(b.theme) ? b.theme : DEFAULT_THEME;
  const photo = b.photo_url && allowed(b.photo_url) ? b.photo_url : null;
  let bg = cleanBg(b.bg);
  if (bg.t === 'image' && !allowed(bg.url)) bg = {};

  // Pembatas cukup punya judul; link biasa wajib punya judul dan alamat.
  const links = (b.links || []).filter((l) => (l.kind === 'header' ? l.title?.trim() : l.title?.trim() && l.url?.trim())).slice(0, 30);
  // Keamanan: tolak alamat yang tidak aman, dan (bila SAFE_BROWSING_KEY diisi) alamat baru yang ditandai berbahaya oleh Google.
  const have = new Set((await sql`select url from links where user_id=${id}`.catch(() => [])).map((r) => r.url));
  const urls = [];
  for (const l of links) {
    if (l.kind === 'header') continue;
    const u = fix(l.url);
    const why = urlProblem(u);
    if (why) return Response.json({ error: `Link “${l.title.trim().slice(0, 40)}” ditolak: ${why}` }, { status: 400 });
    if (!have.has(u)) urls.push(u);
  }
  // Link bersandi: sandi baru minimal PASS_MIN karakter; kalau dikosongkan, sandi lama dipertahankan (harus sudah ada).
  const oldHash = new Map((await sql`select id, pass_hash from links where user_id=${id}`.catch(() => [])).map((r) => [Number(r.id), r.pass_hash || '']));
  for (const l of links) {
    if (l.kind === 'header' || cleanGuard(l.guard) !== 'pass') continue;
    const np = typeof l.pass === 'string' ? l.pass : '';
    const label = `Link “${l.title.trim().slice(0, 40)}”`;
    if (np && (np.length < PASS_MIN || np.length > PASS_MAX)) return Response.json({ error: `${label}: sandi harus ${PASS_MIN}-${PASS_MAX} karakter.` }, { status: 400 });
    if (!np && !(l.id && oldHash.get(Number(l.id)))) return Response.json({ error: `${label}: isi sandi untuk mengunci link ini.` }, { status: 400 });
  }
  const bad = await flaggedUrls(urls);
  if (bad.length) return Response.json({ error: `Alamat ini ditandai berbahaya oleh Google Safe Browsing dan tidak bisa disimpan: ${bad.slice(0, 3).join(', ')}` }, { status: 400 });
  // Dua kelompok kolom paralel: link yang sudah ada (punya id, diubah) dan yang baru (ditambah).
  const cols = () => ({ id: [], title: [], url: [], position: [], thumb: [], hidden: [], price: [], old_price: [], label: [], kind: [], featured: [], guard: [], pass_hash: [] });
  const old = cols(), fresh = cols();
  let feat = 0; // paling banyak 2 link sorotan
  links.forEach((l, i) => {
    const head = l.kind === 'header', c = l.id ? old : fresh;
    if (l.id) c.id.push(Number(l.id));
    c.title.push(l.title.trim().slice(0, 60));
    c.url.push(head ? '' : fix(l.url));
    c.position.push(i);
    c.thumb.push(head ? '' : okThumb(l.thumb));
    c.hidden.push(l.hidden === true);
    c.price.push(head ? '' : cleanPrice(l.price));
    c.old_price.push(head ? '' : cleanPrice(l.old_price));
    c.label.push(head ? '' : cleanLabel(l.label));
    c.kind.push(head ? 'header' : 'link');
    const g = head ? '' : cleanGuard(l.guard);
    c.featured.push(!head && l.featured === true && !l.hidden && ++feat <= 2);
    c.guard.push(g);
    c.pass_hash.push(g !== 'pass' ? '' : (typeof l.pass === 'string' && l.pass ? hashPass(l.pass) : (l.id ? oldHash.get(Number(l.id)) || '' : '')));
  });

  // Fitur Pro: pengguna gratis tidak bisa memilih atau mengubah ke pilihan Pro. Nilai lama yang sudah tersimpan boleh tetap
  // (tidak dihapus, hanya tidak tampil di halaman publik), jadi menyimpan halaman lain tidak gagal gara-gara itu.
  const st = (await sql`select (plan_until > now()) as pro, theme, btn_style, font_key, colors, bg from users where id=${id}`.catch(() => []))[0];
  if (st && st.pro !== true) {
    const needPro = (what) => Response.json({ error: `${what} khusus paket Pro. Lihat halaman Paket.` }, { status: 403 });
    const font = cleanFont(b.font_key), btn = cleanBtn(b.btn_style), col = cleanColors(b.colors);
    if (PRO_THEMES.includes(theme) && theme !== st.theme) return needPro('Tema ini');
    if (PRO_FONTS.includes(font) && font !== st.font_key) return needPro('Font ini');
    if (PRO_BTNS.includes(btn) && btn !== st.btn_style) return needPro('Gaya tombol ini');
    if (Object.keys(col).length && JSON.stringify(col) !== JSON.stringify(cleanColors(st.colors))) return needPro('Warna kustom');
    if (bg.t === 'image' && bg.url !== cleanBg(st.bg).url) return needPro('Latar gambar');
    const had = new Set((await sql`select thumb from links where user_id=${id}`.catch(() => [])).map((r) => r.thumb).filter(Boolean));
    const all = [...old.thumb, ...fresh.thumb].filter(Boolean);
    if (all.length > FREE_THUMBS && all.some((u) => !had.has(u))) return needPro(`Gambar link lebih dari ${FREE_THUMBS}`);
  }

  // Semua perubahan dalam satu transaksi: kalau satu langkah gagal, tidak ada yang berubah (tidak ada simpan setengah jalan).
  // Urutannya penting: hapus dulu link yang dibuang, baru ubah yang lama, terakhir tambah yang baru.
  try {
    await sql.transaction([
      sql`update users set display_name=${String(b.display_name || '').slice(0, 40)}, bio=${String(b.bio || '').slice(0, 160)}, theme=${theme}, photo_url=${photo},
          btn_style=${cleanBtn(b.btn_style)}, font_key=${cleanFont(b.font_key)},
          socials=${JSON.stringify(cleanSocials(b.socials))}, colors=${JSON.stringify(cleanColors(b.colors))}, bg=${JSON.stringify(bg)}
          where id=${id}`,
      sql`delete from links where user_id=${id} and id <> all(${old.id}::int[])`,
      sql`update links set title=v.title, url=v.url, position=v.position, thumb=v.thumb, hidden=v.hidden,
          price=v.price, old_price=v.old_price, label=v.label, kind=v.kind,
          featured=v.featured, guard=v.guard, pass_hash=v.pass_hash
          from unnest(${old.id}::int[], ${old.title}::text[], ${old.url}::text[], ${old.position}::int[], ${old.thumb}::text[], ${old.hidden}::boolean[],
                      ${old.price}::text[], ${old.old_price}::text[], ${old.label}::text[], ${old.kind}::text[],
                      ${old.featured}::boolean[], ${old.guard}::text[], ${old.pass_hash}::text[])
            as v(id,title,url,position,thumb,hidden,price,old_price,label,kind,featured,guard,pass_hash)
          where links.id=v.id and links.user_id=${id}`,
      sql`insert into links(user_id,title,url,position,thumb,hidden,price,old_price,label,kind,featured,guard,pass_hash)
          select ${id}::int, v.title, v.url, v.position, v.thumb, v.hidden, v.price, v.old_price, v.label, v.kind, v.featured, v.guard, v.pass_hash
          from unnest(${fresh.title}::text[], ${fresh.url}::text[], ${fresh.position}::int[], ${fresh.thumb}::text[], ${fresh.hidden}::boolean[],
                      ${fresh.price}::text[], ${fresh.old_price}::text[], ${fresh.label}::text[], ${fresh.kind}::text[],
                      ${fresh.featured}::boolean[], ${fresh.guard}::text[], ${fresh.pass_hash}::text[])
            as v(title,url,position,thumb,hidden,price,old_price,label,kind,featured,guard,pass_hash)`,
    ]);
  } catch (e) {
    console.error('Gagal menyimpan (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Gagal menyimpan, tidak ada yang berubah. Pastikan schema-update.sql sudah dijalankan, lalu coba lagi.' }, { status: 500 });
  }

  // Hapus dari penyimpanan file yang tadinya dipakai tapi sekarang tidak (foto/gambar diganti atau dihapus, link dihapus).
  try {
    const after = new Set(await userBlobs(id, true)); // strict: bila gagal membaca, jangan hapus apa pun
    await dropBlobs(before.filter((u) => !after.has(u)), id);
  } catch (e) {
    console.error('Pembersihan file lama gagal:', e.message);
  }
  return Response.json(await load(id));
}
