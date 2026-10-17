import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);
export async function setSession(id) {
  const t = await new SignJWT({ id }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('30d').sign(key());
  cookies().set('s', t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 2592000 });
}
export function clearSession() { cookies().delete('s'); }
export async function getUserId() {
  const t = cookies().get('s')?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload.id; } catch { return null; }
}
