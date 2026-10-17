import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import { isBot } from '@/lib/bot';
import { themeStyle } from '@/lib/themes';
import { LinkIcon } from '../icons';
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
export default async function Profile({ params }) {
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
  const links = await sql`select id,title,url from links where user_id=${u.id} order by position,id`;
  const name = u.display_name || u.username;
  return (
    <div className="phone" data-t={u.theme} style={themeStyle(u.theme)}>
      <main className="pub">
        {u.photo_url ? <img className="ava" src={u.photo_url} alt={name} /> : <div className="ava" aria-hidden="true">{name[0].toUpperCase()}</div>}
        <h1 className="name">{name}</h1>
        {u.bio && <p className="bio">{u.bio}</p>}
        {links.map((l) => (
          <a key={l.id} className="plink" href={`/go/${l.id}`}>
            <LinkIcon url={l.url} /><span className="pt">{l.title}</span><span className="psp" aria-hidden="true" />
          </a>
        ))}
        <div className="foot">Dibuat di <a href="/">isengin.site</a></div>
      </main>
    </div>
  );
}
