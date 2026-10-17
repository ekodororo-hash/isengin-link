import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { getUserId, clearSession } from '@/lib/auth';
import { hit, clear, tooMany } from '@/lib/limit';
import { userBlobs, dropBlobs } from '@/lib/blob';
import { removeDomain } from '@/lib/vercel';
const MIN_PASS = 8;
const needLogin = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });
const bad = (error, status = 400) => Response.json({ error }, { status });

// Cek sandi saat ini; salah berkali-kali dibatasi supaya tidak bisa ditebak.
async function checkPassword(id, password) {
  const lim = await hit(`acct:${id}`, 6, 900);
  if (lim.over) return { res: tooMany(lim) };
  const r = await sql`select username,password_hash from users where id=${id}`;
  if (!r.length || !password || !(await bcrypt.compare(String(password), r[0].password_hash))) return { res: bad('Sandi saat ini salah.', 403) };
  await clear(`acct:${id}`);
  return { user: r[0] };
}

export async function GET() {
  const id = await getUserId();
  if (!id) return needLogin();
  const r = await sql`select username from users where id=${id}`;
  if (!r.length) return needLogin();
  const e = await sql`select email from users where id=${id}`.catch(() => []);
  const sm = await sql`select smart_links from users where id=${id}`.catch(() => []);
  return Response.json({ username: r[0].username, email: e[0]?.email || '', smart: sm[0]?.smart_links !== false });
}

// Simpan email (opsional) atau ganti sandi.
export async function PUT(req) {
  const id = await getUserId();
  if (!id) return needLogin();
  const b = await req.json().catch(() => ({}));
  if (b.mode === 'password') {
    const next = String(b.next || '');
    if (next.length < MIN_PASS) return bad(`Sandi baru minimal ${MIN_PASS} karakter.`);
    if (next.length > 100) return bad('Sandi baru terlalu panjang.');
    const c = await checkPassword(id, b.current);
    if (c.res) return c.res;
    if (next === String(b.current)) return bad('Sandi baru harus berbeda dari sandi saat ini.');
    await sql`update users set password_hash=${await bcrypt.hash(next, 10)} where id=${id}`;
    return Response.json({ ok: true });
  }
  if (b.mode === 'smart') {
    try { await sql`update users set smart_links=${b.smart === true} where id=${id}`; }
    catch (e) {
      console.error('Kolom smart_links belum ada (jalankan schema-update.sql):', e.message);
      return bad('Belum bisa disimpan. Jalankan schema-update.sql di database.', 500);
    }
    return Response.json({ ok: true, smart: b.smart === true });
  }
  const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
  if (email && !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email)) return bad('Format email belum benar.');
  try {
    // Email dipakai untuk masuk, jadi tidak boleh sama dengan akun lain.
    if (email && (await sql`select 1 from users where email=${email} and id<>${id}`).length) return bad('Email ini sudah dipakai akun lain.', 409);
    await sql`update users set email=${email} where id=${id}`;
  } catch (e) {
    console.error('Kolom email belum ada (jalankan schema-update.sql):', e.message);
    return bad('Email belum bisa disimpan. Jalankan schema-update.sql di database.', 500);
  }
  return Response.json({ ok: true, email });
}

// Hapus akun beserta semua link dan statistiknya (ikut terhapus lewat relasi di database).
export async function DELETE(req) {
  const id = await getUserId();
  if (!id) return needLogin();
  const b = await req.json().catch(() => ({}));
  const c = await checkPassword(id, b.password);
  if (c.res) return c.res;
  if (String(b.confirm || '').trim().toLowerCase() !== c.user.username) return bad('Ketik nama pengguna dengan benar untuk konfirmasi.');
  const files = await userBlobs(id);
  const dom = (await sql`select custom_domain from users where id=${id}`.catch(() => []))[0]?.custom_domain;
  await sql`delete from users where id=${id}`;
  await removeDomain(dom);
  await dropBlobs(files, id);
  clearSession();
  return Response.json({ ok: true });
}
