import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import { themeStyle, bgStyle, themeWith, cleanBg } from '@/lib/themes';
import { socialList } from '@/lib/socials';
import { detectSource } from '@/lib/source';
import { fmtPrice, labelText, cleanLabel } from '@/lib/catalog';
import { cleanBtn, cleanFont, fontCss } from '@/lib/style';
import { NamedIcon } from '../icons';
import Verified from '../Verified';
import Report from './Report';
import { cleanGuard } from '@/lib/linkguard';
import LinkRow from './LinkRow';
import EmbedBox from './EmbedBox';
import QrisButton from './QrisButton';
import { embedOf } from '@/lib/embed';
import HomePromo from './HomePromo';
import ViewBeacon from './ViewBeacon';
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
  // Kunjungan dihitung dari browser lewat <ViewBeacon /> (1 per pengunjung per hari), bukan di sini.
  // Jadwal tayang: link muncul mulai show_at dan hilang sejak hide_at (kosong = tanpa batas).
  const links = await sql`select id,title,url,thumb,price,old_price,label,kind,featured,guard from links where user_id=${u.id} and hidden is not true and (show_at is null or show_at <= now()) and (hide_at is null or hide_at > now()) order by position,id`
    .catch(() => sql`select id,title,url,thumb,price,old_price,label,kind,featured,guard from links where user_id=${u.id} and hidden is not true order by position,id`)
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
  const store = (await sql`select store_name, store_addr from users where id=${u.id}`.catch(() => []))[0] || {};
  const storeAddr = String(store.store_addr || '').trim();
  const name = u.display_name || u.username;
  // Fitur Pro (tema Neon dan tema berwarna lain, font dan gaya tombol tertentu, warna kustom, latar gambar) hanya tampil bila paket aktif.
  const eff = effectiveLook({ theme: u.theme, font_key: cleanFont(look.font_key), btn_style: cleanBtn(look.btn_style), colors: extra.colors, bg: more.bg }, pro);
  // Warna tepi halaman (juga di belakang bilah navigasi HP) mengikuti latar halaman, bukan biru bawaan situs.
  const eb = cleanBg(eff.bg);
  const edge = eb.t === 'gradient' ? eb.c2 : themeWith(eff.theme, eff.colors).bg;
  return (
    <div className="stage" style={themeStyle(eff.theme, eff.colors)}>
    <style>{`html,body{background:${edge}}`}</style>
    <div className="phone" data-t={eff.theme} data-b={eff.btn_style} data-f={eff.font_key} style={{ ...themeStyle(eff.theme, eff.colors), ...bgStyle(eff.bg, eff.theme, eff.colors), '--pfont': fontCss(eff.font_key) }}>
      <main className="pub">
        <div className="pub-top">
        <ViewBeacon username={u.username} />
        {!pro && <HomePromo pageUsername={u.username} pageName={name} />}
        <Report username={u.username} name={name} />
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
          if (l.kind === 'embed') { const e = embedOf(l.url); return e ? <EmbedBox key={l.id} {...e} title={l.title} /> : null; }
          if (l.kind === 'qris') return l.url ? <QrisButton key={l.id} title={l.title || 'QRIS'} img={l.url} pageUsername={u.username} pageName={name} /> : null;
          const price = fmtPrice(l.price), old = fmtPrice(l.old_price), lab = cleanLabel(l.label);
          const th = thumbOk(links, i, pro) ? l.thumb : '';
          const cat = !!(price || old); // rata kiri hanya untuk link berharga; label saja tetap rata tengah
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
        {storeAddr && (
          <div className="pstore">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
            <div className="pstore-t">
              {store.store_name && <b>{store.store_name}</b>}
              <span>{storeAddr}</span>
            </div>
            <a className="pstore-go" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([store.store_name, storeAddr].filter(Boolean).join(' '))}`} target="_blank" rel="noopener noreferrer">Buka peta</a>
          </div>
        )}
        </div>
        <div className="pub-bottom">
        {/* titik tiga lapor (kanan atas) selalu tampil, termasuk di akun Pro */}
        {!pro && <div className="foot">Dibuat di <a href={`${(process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '')}/?ref=${u.username}`}>isengin.site</a></div>}
        <div className="foot legal-links">
          <a href="/fitur">Fitur</a> · <a href="/tentang-kami">Tentang Kami</a> · <a href="/privasi">Kebijakan Privasi</a> · <a href="/syarat">Syarat Layanan</a>
        </div>
        </div>
      </main>
    </div>
    </div>
  );
}
