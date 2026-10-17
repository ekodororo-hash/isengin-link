import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { setSession, clearSession } from '@/lib/auth';
const RESERVED = ['api', 'dashboard', 'login', 'admin', 'go'];
export async function POST(req) {
  const { mode, username = '', password = '' } = await req.json();
  if (mode === 'logout') { clearSession(); return Response.json({ ok: true }); }
  const u = username.toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u) || RESERVED.includes(u) || password.length < 6)
    return Response.json({ error: 'Nama 3-20 huruf/angka/_ (bukan kata terlarang), sandi minimal 6 karakter.' }, { status: 400 });
  if (mode === 'register') {
    if ((await sql`select 1 from users where username=${u}`).length)
      return Response.json({ error: 'Nama sudah dipakai.' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const r = await sql`insert into users(username,password_hash,display_name) values(${u},${hash},${u}) returning id`;
    await setSession(r[0].id);
    return Response.json({ ok: true });
  }
  const r = await sql`select id,password_hash from users where username=${u}`;
  if (!r.length || !(await bcrypt.compare(password, r[0].password_hash)))
    return Response.json({ error: 'Nama atau sandi salah.' }, { status: 401 });
  await setSession(r[0].id);
  return Response.json({ ok: true });
}
