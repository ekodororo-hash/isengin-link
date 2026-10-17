import { sql } from '@/lib/db';
export const NOTE_MIN = 10;
export const NOTE_MAX = 300;
export const RETRY_DAYS = 7;   // setelah ditolak, boleh mengajukan lagi
export const MIN_AGE_DAYS = 3; // umur akun minimal

// Syarat otomatis supaya admin tidak perlu memeriksa akun yang masih kosong.
export async function checks(id) {
  const u = (await sql`select bio,photo_url,created_at from users where id=${id}`)[0];
  if (!u) return { list: [], ready: false };
  const n = (await sql`select count(*)::int as n from links where user_id=${id} and hidden is not true and coalesce(kind,'link')='link'`)[0].n;
  const age = (Date.now() - new Date(u.created_at || Date.now()).getTime()) / 86400000;
  const list = [
    { ok: !!u.photo_url, text: 'Foto profil terpasang' },
    { ok: String(u.bio || '').trim().length >= 10, text: 'Bio terisi (minimal 10 karakter)' },
    { ok: n >= 1, text: 'Minimal 1 link yang tampil' },
    { ok: age >= MIN_AGE_DAYS, text: `Akun berumur minimal ${MIN_AGE_DAYS} hari` },
  ];
  return { list, ready: list.every((x) => x.ok) };
}
