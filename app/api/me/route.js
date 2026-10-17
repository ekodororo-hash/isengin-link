import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';
const THEMES = ['kobalt', 'permen', 'hutan'];
const fix = (u) => (/^(https?:|mailto:)/i.test(u.trim()) ? u.trim() : 'https://' + u.trim());
async function load(id) {
  const u = (await sql`select username,display_name,bio,theme,photo_url,views from users where id=${id}`)[0];
  const links = await sql`select id,title,url,clicks from links where user_id=${id} order by position,id`;
  return { ...u, links };
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
  const theme = THEMES.includes(b.theme) ? b.theme : 'kobalt';
  await sql`update users set display_name=${String(b.display_name || '').slice(0, 40)}, bio=${String(b.bio || '').slice(0, 160)}, theme=${theme}, photo_url=${b.photo_url || null} where id=${id}`;
  const links = (b.links || []).filter((l) => l.title?.trim() && l.url?.trim()).slice(0, 30);
  const kept = [];
  for (let i = 0; i < links.length; i++) {
    const l = links[i], t = l.title.trim().slice(0, 60), url = fix(l.url);
    if (l.id) {
      await sql`update links set title=${t}, url=${url}, position=${i} where id=${Number(l.id)} and user_id=${id}`;
      kept.push(Number(l.id));
    } else {
      const r = await sql`insert into links(user_id,title,url,position) values(${id},${t},${url},${i}) returning id`;
      kept.push(r[0].id);
    }
  }
  await sql`delete from links where user_id=${id} and id <> all(${kept})`;
  return Response.json(await load(id));
}
