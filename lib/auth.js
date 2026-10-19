import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);
export async function setSession(id) {
  const t = await new SignJWT({ id }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(key());
  cookies().set('s', t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 2592000 });
}
export function clearSession() { cookies().delete('s'); }
export async function getUserId() {
  const t = cookies().get('s')?.value;
  if (!t) return null;
  let p;
  try { p = (await jwtVerify(t, key())).payload; } catch { return null; }
  // Sesi yang dibuat sebelum sandi direset (users.pw_changed_at) tidak berlaku lagi; akun yang sudah dihapus juga ditolak.
  // Bila kolom belum ada (schema-update.sql belum dijalankan) atau database error, sesi tetap dianggap sah.
  try {
    const r = await sql`select 1 from users where id=${p.id} and (pw_changed_at is null or floor(extract(epoch from pw_changed_at)) <= ${Number(p.iat || 0)}::numeric)`;
    return r.length ? p.id : null;
  } catch { return p.id; }
}
export async function setAdmin() {
  const t = await new SignJWT({ admin: true }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
  cookies().set('a', t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 604800 });
}
export function clearAdmin() { cookies().delete('a'); }
export async function isAdmin() {
  const t = cookies().get('a')?.value;
  if (!t) return false;
  try { return (await jwtVerify(t, key())).payload.admin === true; } catch { return false; }
}
