import { sql } from '@/lib/db';
import { del } from '@vercel/blob';
import { setAdmin, clearAdmin, isAdmin } from '@/lib/auth';
import { hit, clear, ipOf, tooMany } from '@/lib/limit';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });
export async function POST(req) {
  const { mode, username, password } = await req.json();
  if (mode === 'logout') { clearAdmin(); return Response.json({ ok: true }); }
  const ip = ipOf(req);
  const lim = await hit(`admin:${ip}`, 8, 900);
  if (lim.over) return tooMany(lim);
  const { ADMIN_USER, ADMIN_PASS } = process.env;
  if (!ADMIN_USER || !ADMIN_PASS || username !== ADMIN_USER || password !== ADMIN_PASS)
    return Response.json({ error: 'Nama atau sandi admin salah.' }, { status: 401 });
  await clear(`admin:${ip}`);
  await setAdmin();
  return Response.json({ ok: true });
}
export async function GET() {
  if (!(await isAdmin())) return no();
  const users = await sql`select u.id,u.username,u.active,u.views,count(l.id)::int as links,coalesce(sum(l.clicks),0)::int as clicks from users u left join links l on l.user_id=u.id group by u.id order by u.id desc`;
  return Response.json({ users });
}
export async function PATCH(req) {
  if (!(await isAdmin())) return no();
  const { id, active } = await req.json();
  await sql`update users set active=${!!active} where id=${Number(id)}`;
  return Response.json({ ok: true });
}
// Hapus akun beserta link dan statistiknya (cascade di database), lalu fotonya.
export async function DELETE(req) {
  if (!(await isAdmin())) return no();
  const { id } = await req.json();
  const r = await sql`delete from users where id=${Number(id)} returning photo_url`;
  const photo = r[0]?.photo_url;
  if (photo && photo.includes('blob.vercel-storage.com')) { try { await del(photo); } catch {} }
  return Response.json({ ok: true, deleted: r.length });
}
