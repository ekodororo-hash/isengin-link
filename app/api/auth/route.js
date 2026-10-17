import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { setSession, clearSession } from '@/lib/auth';
import { hit, clear, ipOf, tooMany } from '@/lib/limit';
const RESERVED = ['api', 'dashboard', 'login', 'admin', 'go', 's', '_next'];
export async function POST(req) {
  const { mode, username = '', password = '' } = await req.json();
  if (mode === 'logout') { clearSession(); return Response.json({ ok: true }); }
  const u = String(username).toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u) || RESERVED.includes(u) || String(password).length < 6)
    return Response.json({ error: 'Nama 3-20 huruf/angka/_ (bukan kata terlarang), sandi minimal 6 karakter.' }, { status: 400 });
  const ip = ipOf(req);
  if (mode === 'register') {
    const lim = await hit(`reg:${ip}`, 5, 3600);
    if (lim.over) return tooMany(lim);
    if ((await sql`select 1 from users where username=${u}`).length)
      return Response.json({ error: 'Nama sudah dipakai.' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const r = await sql`insert into users(username,password_hash,display_name) values(${u},${hash},${u}) returning id`;
    await setSession(r[0].id);
    return Response.json({ ok: true });
  }
  // Login: batasi per alamat IP dan per nama akun (15 menit).
  const byIp = await hit(`login:ip:${ip}`, 30, 900);
  if (byIp.over) return tooMany(byIp);
  const byUser = await hit(`login:u:${u}`, 8, 900);
  if (byUser.over) return tooMany(byUser);
  const r = await sql`select id,password_hash from users where username=${u}`;
  if (!r.length || !(await bcrypt.compare(password, r[0].password_hash)))
    return Response.json({ error: 'Nama atau sandi salah.' }, { status: 401 });
  await clear(`login:u:${u}`);
  await setSession(r[0].id);
  return Response.json({ ok: true });
}
