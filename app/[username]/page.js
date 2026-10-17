import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { themeStyle, bgStyle } from '@/lib/themes';
import { socialList } from '@/lib/socials';
import { detectSource } from '@/lib/source';
import { fmtPrice, labelText, cleanLabel } from '@/lib/catalog';
import { cleanBtn, cleanFont, fontCss } from '@/lib/style';
import { NamedIcon } from '../icons';
import Verified from '../Verified';
import Report from './Report';
import { cleanGuard } from '@/lib/linkguard';
import LinkRow from './LinkRow';
import { effectiveLook, thumbOk } from '@/lib/pro';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const find = async (name) =>
  (await sql`select id,username,display_name,bio,theme,photo_url,active from users where username=${String(name).toLowerCase()}`)[0];
export async function generateMetadata({ params }) {
  const u = await find(params.username);
  if (!u || u.active === false) return { title: 'Halaman tidak ditemukan – isengin.site', robots: { index: false } };
  const name = u.display_name || u.username;
  const desc = u.bio || `Semua link ${name} ada di satu halaman.`;
  const url = `/${u.username}`;
  return {
    title: `${name} (@${u.username}) – isengin.site`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: name, description: desc, url, siteName: 'isengin.site', type: 'profile', locale: 'id_ID' },
    twitter: { card: 'summary_large_image', title: name, description: desc },
  };
}
export default async function Profile({ params, searchParams }) {
  const u = await find(params.username);
  if (!u || u.active === false) notFound();
  if (!isBot(headers().get('user-agent'))) {
    // Menghitung kunjungan tidak boleh sampai membuat halaman gagal dibuka.
    try {
      await sql`with a as (update users set views=views+1 where id=${u.id})
        insert into daily_stats(user_id, day, views) values (${u.id}, (now() at time zone 'Asia/Jakarta')::date, 1)
        on conflict (user_id, day) do update set views = daily_stats.views + 1`;
    } catch (e) {
      console.error('Gagal mencatat kunjungan (sudah jalankan schema-update.sql?):', e.message);
      try { await sql`update users set views=views+1 where id=${u.id}`; } catch {}
    }
  }
  const links = await sql`select id,title,url,thumb,price,old_price,label,kind,featured,guard from links where user_id=${u.id} and hidden is not true order by position,id`
    .catch(() => sql`select id,title,url,thumb,price,old_price,label,kind from links where user_id=${u.id} and hidden is not true order by position,id`)
    .catch(() => sql`select id,title,url,thumb,price,old_price,label from links where user_id=${u.id} and hidden is not true order by position,id`)
    .catch(() => sql`select id,title,url,thumb from links where user_id=${u.id} and hidden is not true order by position,id`)
    .catch((e) => { console.error('Kolom thumb/hidden belum ada (jalankan schema-update.sql):', e.message); return sql`select id,title,url from links where user_id=${u.id} order by position,id`; });
  // Ikon sosial dan warna kustom dibaca terpisah supaya halaman tetap terbuka walau schema-update.sql belum dijalankan.
  const extra = (await sql`select socials,colors from users where id=${u.id}`.catch((e) => { console.error('Kolom socials/colors belum ada (jalankan schema-update.sql):', e.message); return []; }))[0] || {};
  const socials = socialList(extra.socials);
  // Asal pengunjung dicatat di tiap link lewat ?s=, lalu dihitung saat link diklik.
  const h = headers();
  const sp = searchParams || {};
  const param = [sp.src, sp.utm_source, sp.ref].find((v) => typeof v === 'string' && v);
  const src = detectSource({ param, referer: h.get('referer'), ua: h.get('user-agent'), ownHost: (h.get('host') || '').split(':')[0].replace(/^www\./, '').toLowerCase() });
  // Latar belakang dan centang verifikasi dibaca terpisah supaya halaman tetap terbuka walau schema-update.sql belum dijalankan.
  const more = (await sql`select bg,verified from users where id=${u.id}`.catch(() => []))[0] || {};
  const pro = (await sql`select (plan_until > now()) as pro from users where id=${u.id}`.catch(() => []))[0]?.pro === true;
  const look = (await sql`select btn_style,font_key from users where id=${u.id}`.catch(() => []))[0] || {};
  const name = u.display_name || u.username;
  // Fitur Pro (tema Neo/Neon, font dan gaya tombol tertentu, warna kustom, latar gambar) hanya tampil bila paket aktif.
  const eff = effectiveLook({ theme: u.theme, font_key: cleanFont(look.font_key), btn_style: cleanBtn(look.btn_style), colors: extra.colors, bg: more.bg }, pro);
  return (
    <div className="stage" style={themeStyle(eff.theme, eff.colors)}>
    <div className="phone" data-t={eff.theme} data-b={eff.btn_style} data-f={eff.font_key} style={{ ...themeStyle(eff.theme, eff.colors), ...bgStyle(eff.bg, eff.theme, eff.colors), '--pfont': fontCss(eff.font_key) }}>
      <main className="pub">
        {u.photo_url ? <img className="ava" src={u.photo_url} alt={name} /> : <div className="ava" aria-hidden="true">{name[0].toUpperCase()}</div>}
        <h1 className="name">{name}{more.verified === true && <Verified />}</h1>
        {u.bio && <p className="bio">{u.bio}</p>}
        {socials.length > 0 && (
          <div className="socials">
            {socials.map((x) => <a key={x.key} className="soc" href={x.href} aria-label={x.label} rel="noopener noreferrer" target={/^https?:/i.test(x.href) ? '_blank' : undefined}><NamedIcon name={x.key} /></a>)}
          </div>
        )}
        {links.map((l, i) => {
          if (l.kind === 'header') return <h2 key={l.id} className="phead"><span>{l.title}</span></h2>;
          const price = fmtPrice(l.price), old = fmtPrice(l.old_price), lab = cleanLabel(l.label);
          const th = thumbOk(links, i, pro) ? l.thumb : '';
          const cat = !!(price || old || lab);
          return (
            <LinkRow
              key={l.id}
              title={l.title}
              url={cleanGuard(l.guard) === 'pass' ? '' : l.url}
              feat={l.featured === true}
              guard={cleanGuard(l.guard)}
              th={th}
              cat={cat}
              soldout={lab === 'habis'}
              labelKey={lab}
              labelDisplay={lab ? labelText(lab) : ''}
              price={price}
              old={old}
              href={`/go/${l.id}?s=${src}`}
              pageUsername={u.username}
              pageName={name}
            />
          );
        })}
        {/* tombol lapor selalu tampil, termasuk di akun Pro */}
        {!pro && <div className="foot">Dibuat di <a href={`${(process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '')}/?ref=${u.username}`}>isengin.site</a></div>}
        <div className="foot legal-links">
          <Report username={u.username} inline /> · <a href="/privasi">Kebijakan Privasi</a> · <a href="/syarat">Syarat Layanan</a>
        </div>
      </main>
    </div>
    </div>
  );
}
