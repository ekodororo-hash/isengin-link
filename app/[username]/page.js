import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  return { title: `${params.username} – isengin.site` };
}
export default async function Profile({ params }) {
  const u = (await sql`select id,username,display_name,bio,theme,photo_url from users where username=${params.username.toLowerCase()}`)[0];
  if (!u) notFound();
  const links = await sql`select id,title from links where user_id=${u.id} order by position,id`;
  const name = u.display_name || u.username;
  return (
    <div className="phone" data-t={u.theme}>
      <main className="pub">
        {u.photo_url ? <img className="ava" src={u.photo_url} alt={name} /> : <div className="ava" aria-hidden="true">{name[0].toUpperCase()}</div>}
        <h1 className="name">{name}</h1>
        {u.bio && <p className="bio">{u.bio}</p>}
        {links.map((l) => <a key={l.id} className="plink" href={`/go/${l.id}`}>{l.title}</a>)}
        <div className="foot">Dibuat di <a href="/">isengin.site</a></div>
      </main>
    </div>
  );
}
