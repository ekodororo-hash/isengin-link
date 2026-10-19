import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { getUserId, clearSession } from '@/lib/auth';
import { hit, clear, ipOf, tooMany } from '@/lib/limit';
import { userBlobs, dropBlobs } from '@/lib/blob';
import { removeDomain } from '@/lib/vercel';
import { issueCode, checkCode, dropCodes } from '@/lib/codes';
import { sendMail, codeMail } from '@/lib/mail';
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
  // email_verified_at dan email_codes baru ada setelah schema-update.sql dijalankan; sebelum itu tampil seperti biasa.
  const e = await sql`select email, email_verified_at from users where id=${id}`.catch(async () => sql`select email from users where id=${id}`.catch(() => []));
  const p = await sql`select email from email_codes where user_id=${id} and purpose='verify' and expires_at > now()`.catch(() => []);
  return Response.json({ username: r[0].username, email: e[0]?.email || '', verified: !!e[0]?.email_verified_at, pending: p[0]?.email || '' });
}

// Simpan email (dengan kode verifikasi), ganti sandi, atau batalkan verifikasi yang tertunda.
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

  // Batalkan email yang masih menunggu kode.
  if (b.mode === 'cancel') {
    await dropCodes(id, 'verify');
    return Response.json({ ok: true, pending: '' });
  }

  // Langkah 2: cocokkan kode. Baru setelah benar, email dipasang ke akun dan ditandai terverifikasi.
  if (b.mode === 'verify') {
    const c = await checkCode(id, 'verify', b.code).catch((e) => {
      console.error('Cek kode gagal (sudah jalankan schema-update.sql?):', e.message);
      return { error: 'Verifikasi email belum bisa dipakai. Coba lagi nanti.' };
    });
    if (c.error) return bad(c.error);
    try {
      if ((await sql`select 1 from users where email=${c.email} and id<>${id}`).length) {
        await dropCodes(id, 'verify');
        return bad('Email ini sudah dipakai akun lain.', 409);
      }
      await sql`update users set email=${c.email}, email_verified_at=now() where id=${id}`;
    } catch (e) {
      console.error('Gagal menyimpan email terverifikasi (sudah jalankan schema-update.sql?):', e.message);
      return bad('Email belum bisa disimpan. Jalankan schema-update.sql di database.', 500);
    }
    await dropCodes(id, 'verify');
    return Response.json({ ok: true, email: c.email, verified: true, pending: '' });
  }

  // Langkah 1: email dikosongkan = hapus. Email baru atau yang belum terverifikasi = kirim kode 6 angka.
  const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
  if (!email) {
    try {
      await sql`update users set email='', email_verified_at=null where id=${id}`;
    } catch (e) {
      console.error('Gagal menghapus email (sudah jalankan schema-update.sql?):', e.message);
      return bad('Email belum bisa diubah. Jalankan schema-update.sql di database.', 500);
    }
    await dropCodes(id, 'verify');
    return Response.json({ ok: true, email: '', verified: false, pending: '' });
  }
  if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email)) return bad('Format email belum benar.');
  try {
    const cur = (await sql`select email, email_verified_at from users where id=${id}`)[0];
    if (cur?.email === email && cur.email_verified_at) return Response.json({ ok: true, email, verified: true, pending: '' });
    // Email dipakai untuk masuk, jadi tidak boleh sama dengan akun lain.
    if ((await sql`select 1 from users where email=${email} and id<>${id}`).length) return bad('Email ini sudah dipakai akun lain.', 409);
    const byUser = await hit(`mailv:${id}`, 3, 3600);
    if (byUser.over) return tooMany(byUser);
    const byIp = await hit(`mailv:ip:${ipOf(req)}`, 10, 3600);
    if (byIp.over) return tooMany(byIp);
    const code = await issueCode(id, 'verify', email);
    if (!(await sendMail({ to: email, ...codeMail(code, 'verify') }))) return bad('Email belum bisa dikirim. Coba lagi sebentar lagi.', 502);
  } catch (e) {
    console.error('Kirim kode verifikasi gagal (sudah jalankan schema-update.sql?):', e.message);
    return bad('Email belum bisa disimpan. Jalankan schema-update.sql di database.', 500);
  }
  return Response.json({ ok: true, pending: email });
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
