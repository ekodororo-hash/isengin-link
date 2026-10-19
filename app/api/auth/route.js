import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { setSession, clearSession } from '@/lib/auth';
import { hit, clear, ipOf, tooMany } from '@/lib/limit';
import { MAX_REWARDED } from '@/lib/referral';
import { RESERVED } from '@/lib/reserved';
import { issueCode, checkCode, dropCodes } from '@/lib/codes';
import { sendMail, codeMail } from '@/lib/mail';
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const bad = (error, status = 400) => Response.json({ error }, { status });
export async function POST(req) {
  const { mode, username = '', password = '', ref = '', email = '', code = '' } = await req.json();
  if (mode === 'logout') { clearSession(); return Response.json({ ok: true }); }
  // Lupa sandi, langkah 1: kirim kode 6 angka ke email yang sudah diverifikasi.
  // Sengaja memberi tahu bila email tidak terdaftar atau belum diverifikasi (lebih jelas bagi pengguna).
  // Konsekuensinya email bisa ditebak, jadi percobaan dibatasi ketat per IP dan per email.
  if (mode === 'forgot') {
    const em = String(email).trim().toLowerCase().slice(0, 120);
    const ip = ipOf(req);
    const byIp = await hit(`forgot:ip:${ip}`, 8, 3600);
    if (byIp.over) return tooMany(byIp);
    if (!EMAIL_RE.test(em)) return bad('Format email belum benar.');
    const byMail = await hit(`forgot:e:${em}`, 3, 3600);
    if (byMail.over) return tooMany(byMail);
    try {
      const u = (await sql`select id, email_verified_at from users where email=${em} and active is not false`)[0];
      if (!u) return bad('Email tidak terdaftar.', 404);
      if (!u.email_verified_at) return bad('Email ini belum diverifikasi, jadi belum bisa dipakai reset sandi. Hubungi admin.', 403);
      const c = await issueCode(u.id, 'reset', em);
      if (!(await sendMail({ to: em, ...codeMail(c, 'reset') }))) {
        await dropCodes(u.id, 'reset');
        return bad('Email belum bisa dikirim. Coba lagi sebentar lagi.', 502);
      }
    } catch (e) {
      console.error('Kirim kode reset gagal (sudah jalankan schema-update.sql?):', e.message);
      return bad('Reset sandi belum bisa dipakai. Coba lagi nanti.', 500);
    }
    return Response.json({ ok: true });
  }
  // Lupa sandi, langkah 2: cek kode, pasang sandi baru, tutup sesi lama, lalu langsung masuk.
  if (mode === 'reset') {
    const em = String(email).trim().toLowerCase().slice(0, 120);
    const pw = String(password);
    const byIp = await hit(`reset:ip:${ipOf(req)}`, 20, 3600);
    if (byIp.over) return tooMany(byIp);
    if (pw.length < 8) return bad('Sandi baru minimal 8 karakter.');
    if (pw.length > 100) return bad('Sandi baru terlalu panjang.');
    const WRONG = 'Kode salah atau sudah kedaluwarsa. Minta kode baru.';
    if (!EMAIL_RE.test(em)) return bad(WRONG);
    try {
      const u = (await sql`select id, username from users where email=${em} and email_verified_at is not null and active is not false`)[0];
      if (!u) return bad(WRONG);
      const c = await checkCode(u.id, 'reset', code);
      if (c.error) return bad(c.error);
      if (c.email !== em) return bad(WRONG);
      await sql`update users set password_hash=${await bcrypt.hash(pw, 10)}, pw_changed_at=now() where id=${u.id}`;
      await dropCodes(u.id);
      await clear(`login:u:${u.username}`);
      await setSession(u.id);
      return Response.json({ ok: true });
    } catch (e) {
      console.error('Reset sandi gagal (sudah jalankan schema-update.sql?):', e.message);
      return bad('Reset sandi belum bisa dipakai. Coba lagi nanti.', 500);
    }
  }
  const u = String(username).trim().toLowerCase();
  // Saat masuk, kolom nama boleh berisi email yang sudah disimpan di Pengaturan.
  const byEmail = mode !== 'register' && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(u) && u.length <= 120;
  if (!byEmail && (!/^[a-z0-9_]{3,20}$/.test(u) || RESERVED.includes(u)) || String(password).length < 6)
    return Response.json({ error: 'Nama minimal 3 huruf, sandi minimal 6 karakter.' }, { status: 400 });
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
        // Batas MAX_REWARDED teman per pengundang: bila sudah penuh, pendaftar tetap dibuat tapi tidak tercatat sebagai undangan
        // (satu perintah, jadi dua pendaftaran bersamaan tidak melewati batas).
        if (by) await sql`update users set referred_by=${by.id} where id=${r[0].id}
          and (select count(*) from users x where x.referred_by=${by.id}) < ${MAX_REWARDED}`;
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
    return Response.json({ error: 'Nama, email atau sandi salah.' }, { status: 401 });
  await clear(`login:u:${u}`);
  await setSession(r[0].id);
  return Response.json({ ok: true });
}
