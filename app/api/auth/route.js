import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { setSession, clearSession } from '@/lib/auth';
import { hit, clear, ipOf, tooMany } from '@/lib/limit';
const RESERVED = ['api', 'dashboard', 'login', 'admin', 'go', 's', '_next'];
export async function POST(req) {
  const { mode, username = '', password = '', ref = '' } = await req.json();
  if (mode === 'logout') { clearSession(); return Response.json({ ok: true }); }
  const u = String(username).trim().toLowerCase();
  // Saat masuk, kolom nama boleh berisi email yang sudah disimpan di Pengaturan.
  const byEmail = mode !== 'register' && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(u) && u.length <= 120;
  if (!byEmail && (!/^[a-z0-9_]{3,20}$/.test(u) || RESERVED.includes(u)) || String(password).length < 6)
    return Response.json({ error: 'Nama 3-20 huruf/angka/_ (bukan kata terlarang), sandi minimal 6 karakter.' }, { status: 400 });
  const ip = ipOf(req);
  if (mode === 'register') {
    const lim = await hit(`reg:${ip}`, 5, 3600);
    if (lim.over) return tooMany(lim);
    if ((await sql`select 1 from users where username=${u}`).length)
      return Response.json({ error: 'Nama sudah dipakai.' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const r = await sql`insert into users(username,password_hash,display_name) values(${u},${hash},${u}) returning id`;
    // Referral: catat pengundang bila kodenya (nama pengguna) ada. Dipisah supaya daftar tetap jalan walau kolomnya belum ada.
    const code = String(ref).trim().toLowerCase();
    if (/^[a-z0-9_]{3,20}$/.test(code)) {
      try {
        const by = (await sql`select id from users where username=${code} and active is not false`)[0];
        if (by) await sql`update users set referred_by=${by.id} where id=${r[0].id}`;
      } catch (e) { console.error('Referral gagal dicatat (sudah jalankan schema-update.sql?):', e.message); }
    }
    await setSession(r[0].id);
    return Response.json({ ok: true });
  }
  // Login: batasi per alamat IP dan per nama akun (15 menit).
  const byIp = await hit(`login:ip:${ip}`, 30, 900);
  if (byIp.over) return tooMany(byIp);
  const byUser = await hit(`login:u:${u}`, 8, 900);
  if (byUser.over) return tooMany(byUser);
  const r = byEmail ? await sql`select id,password_hash from users where email=${u}`.catch(() => []) : await sql`select id,password_hash from users where username=${u}`;
  if (!r.length || !(await bcrypt.compare(password, r[0].password_hash)))
    return Response.json({ error: 'Nama/email atau sandi salah.' }, { status: 401 });
  await clear(`login:u:${u}`);
  await setSession(r[0].id);
  return Response.json({ ok: true });
}
