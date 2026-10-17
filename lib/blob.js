// Pembersihan file di Vercel Blob. Hanya file milik pengguna itu sendiri yang boleh dihapus:
// nama file selalu diawali folder dan id pengguna (lihat app/api/upload/route.js).
import { del } from '@vercel/blob';
import { sql } from '@/lib/db';

export const BLOB_DIRS = ['avatars', 'thumbs', 'backgrounds'];

export function isBlobUrl(u) {
  try {
    const x = new URL(String(u || ''));
    return x.protocol === 'https:' && x.hostname.endsWith('.blob.vercel-storage.com');
  } catch { return false; }
}

// Apakah alamat ini file Blob yang diunggah oleh pengguna `id`?
export function ownBlob(u, id) {
  if (!isBlobUrl(u)) return false;
  try {
    const p = decodeURIComponent(new URL(u).pathname);
    return BLOB_DIRS.some((d) => p.startsWith(`/${d}/${id}-`));
  } catch { return false; }
}

// Semua file Blob yang sedang dipakai pengguna: foto profil, gambar link, dan gambar latar.
export async function userBlobs(id) {
  const out = [];
  const u = await sql`select photo_url from users where id=${id}`.catch(() => []);
  if (u[0]?.photo_url) out.push(u[0].photo_url);
  const b = await sql`select bg from users where id=${id}`.catch(() => []);
  try { const o = JSON.parse(b[0]?.bg || ''); if (o?.url) out.push(o.url); } catch {}
  const t = await sql`select thumb from links where user_id=${id}`.catch(() => []);
  for (const r of t) if (r.thumb) out.push(r.thumb);
  return out;
}

// Hapus file lama. Gagal menghapus tidak boleh membuat simpan/hapus akun ikut gagal;
// sisa file akan disapu oleh cron (app/api/cron/blob).
export async function dropBlobs(urls, id) {
  const mine = [...new Set(urls)].filter((u) => ownBlob(u, id));
  if (!mine.length || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try { await del(mine); } catch (e) { console.error('Gagal menghapus file lama di Blob:', e.message); }
}
