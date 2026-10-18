import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });
const LEVELS = ['pengumuman', 'info', 'penting'];
const fail = (e, msg) => { console.error(msg, e.message); return Response.json({ error: 'Data belum siap. Jalankan schema-update.sql di database.' }, { status: 500 }); };

// Pengumuman terbaru dulu. Hanya satu yang aktif (paling baru) yang tampil di dashboard pengguna.
export async function GET() {
  if (!(await isAdmin())) return no();
  try {
    return Response.json({ items: await sql`select id,text,level,active,created_at from announcements order by id desc limit 30` });
  } catch (e) { return fail(e, 'Daftar pengumuman gagal:'); }
}

export async function POST(req) {
  if (!(await isAdmin())) return no();
  const b = await req.json().catch(() => ({}));
  const text = String(b.text || '').trim().slice(0, 280);
  const level = LEVELS.includes(b.level) ? b.level : 'pengumuman';
  if (text.length < 3) return Response.json({ error: 'Isi pengumuman minimal 3 karakter.' }, { status: 400 });
  try {
    await sql`insert into announcements(text, level, active) values (${text}, ${level}, true)`;
    return Response.json({ ok: true });
  } catch (e) { return fail(e, 'Buat pengumuman gagal:'); }
}

// { id, active } mengaktifkan atau menyembunyikan; { id, remove: true } menghapus.
export async function PATCH(req) {
  if (!(await isAdmin())) return no();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return Response.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  try {
    if (b.remove === true) await sql`delete from announcements where id=${id}`;
    else await sql`update announcements set active=${b.active === true} where id=${id}`;
    return Response.json({ ok: true });
  } catch (e) { return fail(e, 'Ubah pengumuman gagal:'); }
}
