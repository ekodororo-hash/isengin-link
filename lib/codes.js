import crypto from 'crypto';
import { sql } from '@/lib/db';

// Kode 6 angka sekali pakai untuk verifikasi email dan reset sandi.
// Di database hanya tersimpan HMAC-nya. Tiap pengecekan menambah `attempts` secara atomik,
// jadi permintaan paralel pun tidak bisa menebak lebih dari MAX_TRIES kali per kode.
export const CODE_TTL_MIN = 10;
export const MAX_TRIES = 5;

const hash = (purpose, uid, code) =>
  crypto.createHmac('sha256', process.env.AUTH_SECRET || '').update(`${purpose}:${uid}:${code}`).digest('hex');
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Buat kode baru (menggantikan kode lama keperluan yang sama) dan kembalikan kode mentahnya untuk dikirim.
export async function issueCode(uid, purpose, email) {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await sql`insert into email_codes(user_id, purpose, email, code_hash, attempts, expires_at)
    values (${uid}, ${purpose}, ${email}, ${hash(purpose, uid, code)}, 0, now() + make_interval(mins => ${CODE_TTL_MIN}::int))
    on conflict (user_id, purpose) do update set email = excluded.email, code_hash = excluded.code_hash,
      attempts = 0, expires_at = excluded.expires_at, created_at = now()`;
  if (Math.random() < 0.02) await sql`delete from email_codes where expires_at < now() - interval '1 day'`.catch(() => {});
  return code;
}

// Cek kode. Hasil: { ok: true, email } atau { error }.
export async function checkCode(uid, purpose, code) {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return { error: 'Kode terdiri dari 6 angka.' };
  const r = await sql`update email_codes set attempts = attempts + 1
    where user_id = ${uid} and purpose = ${purpose} and expires_at > now() and attempts < ${MAX_TRIES}
    returning email, code_hash, attempts`;
  if (!r.length) return { error: 'Kode sudah kedaluwarsa atau terlalu sering salah. Minta kode baru.' };
  if (!same(r[0].code_hash, hash(purpose, uid, c))) {
    const left = MAX_TRIES - r[0].attempts;
    return { error: left > 0 ? `Kode salah. Sisa ${left} percobaan.` : 'Kode salah dan sudah tidak berlaku. Minta kode baru.' };
  }
  return { ok: true, email: r[0].email };
}

export const dropCodes = (uid, purpose) =>
  purpose
    ? sql`delete from email_codes where user_id = ${uid} and purpose = ${purpose}`.catch(() => {})
    : sql`delete from email_codes where user_id = ${uid}`.catch(() => {});
