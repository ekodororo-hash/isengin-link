import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { THEME_KEYS, cleanColors, cleanBg } from '@/lib/themes';
import { cleanSocials, parseSocials } from '@/lib/socials';
import { cleanPrice, cleanLabel } from '@/lib/catalog';
import { cleanBtn, cleanFont } from '@/lib/style';
import { isBlobUrl, ownBlob, userBlobs, dropBlobs } from '@/lib/blob';
const fix = (u) => (/^(https?:|mailto:)/i.test(u.trim()) ? u.trim() : 'https://' + u.trim());
async function load(id) {
  const [u, links, daily, sources, extra, look, more] = await Promise.all([
    sql`select username,display_name,bio,theme,photo_url,views from users where id=${id}`,
    sql`select id,title,url,clicks,thumb,hidden,price,old_price,label,kind from links where user_id=${id} order by position,id`
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
  ]);
  return { ...u[0], links: links.map((l) => ({ ...l, thumb: l.thumb || '', hidden: l.hidden === true, price: l.price || '', old_price: l.old_price || '', label: l.label || '', kind: l.kind === 'header' ? 'header' : 'link' })), bg: cleanBg(more[0]?.bg), verified: more[0]?.verified === true, btn_style: cleanBtn(look[0]?.btn_style), font_key: cleanFont(look[0]?.font_key), daily, sources, socials: parseSocials(extra[0]?.socials), colors: cleanColors(extra[0]?.colors) };
}
export async function GET() {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  return Response.json(await load(id));
}
export async function PUT(req) {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const b = await req.json();
  // File Blob yang dipakai sebelum simpan. Dipakai dua kali: hanya alamat milik sendiri (atau yang memang
  // sudah tersimpan di akun ini) yang diterima, dan selisihnya dengan keadaan sesudah simpan dihapus dari Blob.
  const before = await userBlobs(id);
  const allowed = (u) => ownBlob(u, id) || before.includes(u);
  // Gambar hanya boleh berasal dari penyimpanan Vercel Blob (hasil unggahan lewat /api/upload).
  const okThumb = (u) => {
    try {
      const x = new URL(String(u || ''));
      return isBlobUrl(x.href) && x.href.length <= 500 && allowed(x.href) ? x.href : '';
    } catch { return ''; }
  };
  const theme = THEME_KEYS.includes(b.theme) ? b.theme : 'kobalt';
  const photo = b.photo_url && allowed(b.photo_url) ? b.photo_url : null;
  await sql`update users set display_name=${String(b.display_name || '').slice(0, 40)}, bio=${String(b.bio || '').slice(0, 160)}, theme=${theme}, photo_url=${photo} where id=${id}`;
  // Pembatas cukup punya judul; link biasa wajib punya judul dan alamat.
  const links = (b.links || []).filter((l) => (l.kind === 'header' ? l.title?.trim() : l.title?.trim() && l.url?.trim())).slice(0, 30);
  const kept = [], kinds = [], thumbs = [], hiddens = [], prices = [], olds = [], labels = [];
  for (let i = 0; i < links.length; i++) {
    const l = links[i], head = l.kind === 'header', t = l.title.trim().slice(0, 60), url = head ? '' : fix(l.url);
    let lid;
    if (l.id) {
      await sql`update links set title=${t}, url=${url}, position=${i} where id=${Number(l.id)} and user_id=${id}`;
      lid = Number(l.id);
    } else {
      const r = await sql`insert into links(user_id,title,url,position) values(${id},${t},${url},${i}) returning id`;
      lid = r[0].id;
    }
    kept.push(lid);
    kinds.push(head ? 'header' : 'link');
    thumbs.push(head ? '' : okThumb(l.thumb)); hiddens.push(l.hidden === true);
    prices.push(head ? '' : cleanPrice(l.price)); olds.push(head ? '' : cleanPrice(l.old_price)); labels.push(head ? '' : cleanLabel(l.label));
  }
  await sql`delete from links where user_id=${id} and id <> all(${kept})`;
  if (kept.length) {
    try {
      await sql`update links set thumb=v.thumb, hidden=v.hidden
        from (select unnest(${kept}::int[]) as id, unnest(${thumbs}::text[]) as thumb, unnest(${hiddens}::boolean[]) as hidden) v
        where links.id=v.id and links.user_id=${id}`;
    } catch (e) {
      console.error('Gagal menyimpan gambar/sembunyikan link (sudah jalankan schema-update.sql?):', e.message);
      if (thumbs.some(Boolean) || hiddens.some(Boolean)) {
        return Response.json({ error: 'Link tersimpan, tapi gambar/sembunyikan link belum bisa disimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
      }
    }
  }
  if (kept.length) {
    try {
      await sql`update links set price=v.price, old_price=v.old_price, label=v.label
        from (select unnest(${kept}::int[]) as id, unnest(${prices}::text[]) as price, unnest(${olds}::text[]) as old_price, unnest(${labels}::text[]) as label) v
        where links.id=v.id and links.user_id=${id}`;
    } catch (e) {
      console.error('Gagal menyimpan harga/label (sudah jalankan schema-update.sql?):', e.message);
      if (prices.some(Boolean) || olds.some(Boolean) || labels.some(Boolean)) {
        return Response.json({ error: 'Link tersimpan, tapi harga/label belum bisa disimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
      }
    }
  }
  if (kept.length) {
    try {
      await sql`update links set kind=v.kind
        from (select unnest(${kept}::int[]) as id, unnest(${kinds}::text[]) as kind) v
        where links.id=v.id and links.user_id=${id}`;
    } catch (e) {
      console.error('Gagal menyimpan pembatas (sudah jalankan schema-update.sql?):', e.message);
      if (kinds.includes('header')) {
        return Response.json({ error: 'Link tersimpan, tapi pembatas belum bisa disimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
      }
    }
  }
  try {
    await sql`update users set btn_style=${cleanBtn(b.btn_style)}, font_key=${cleanFont(b.font_key)} where id=${id}`;
  } catch (e) {
    console.error('Gagal menyimpan gaya tombol/font (sudah jalankan schema-update.sql?):', e.message);
    if (cleanBtn(b.btn_style) !== 'bulat' || cleanFont(b.font_key) !== 'standar') {
      return Response.json({ error: 'Link dan profil tersimpan, tapi gaya tombol/font belum bisa disimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
    }
  }
  const socials = cleanSocials(b.socials), colors = cleanColors(b.colors);
  try {
    await sql`update users set socials=${JSON.stringify(socials)}, colors=${JSON.stringify(colors)} where id=${id}`;
  } catch (e) {
    console.error('Gagal menyimpan ikon sosial/warna (sudah jalankan schema-update.sql?):', e.message);
    if (Object.keys(socials).length || Object.keys(colors).length) {
      return Response.json({ error: 'Link dan profil tersimpan, tapi ikon sosial/warna belum bisa disimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
    }
  }
  let bg = cleanBg(b.bg);
  if (bg.t === 'image' && !allowed(bg.url)) bg = {};
  try {
    await sql`update users set bg=${JSON.stringify(bg)} where id=${id}`;
  } catch (e) {
    console.error('Gagal menyimpan latar belakang (sudah jalankan schema-update.sql?):', e.message);
    if (bg.t) {
      return Response.json({ error: 'Tersimpan, tapi latar belakang belum bisa disimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
    }
  }
  // Hapus dari Blob file yang tadinya dipakai tapi sekarang tidak (foto/gambar diganti atau dihapus, link dihapus).
  try {
    const after = new Set(await userBlobs(id));
    await dropBlobs(before.filter((u) => !after.has(u)), id);
  } catch (e) {
    console.error('Pembersihan file lama gagal:', e.message);
  }
  return Response.json(await load(id));
}
