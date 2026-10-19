// Penyimpanan file di Supabase Storage (lewat REST API, tanpa SDK).
// Hanya file milik pengguna itu sendiri yang boleh dihapus: nama file selalu diawali
// folder dan id pengguna (lihat app/api/upload/route.js).
// Nama file ini dipertahankan dari versi Vercel Blob supaya import lain tidak berubah.
import { sql } from '@/lib/db';

export const BLOB_DIRS = ['avatars', 'thumbs', 'backgrounds'];

const BASE = () => String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const BUCKET = () => process.env.SUPABASE_BUCKET || 'isengin';
// Kunci lama (service_role) berbentuk JWT dan dikirim juga lewat Authorization. Kunci baru (sb_secret_...)
// bukan JWT: cukup dikirim lewat header apikey.
const headers = (extra = {}) => ({ ...(KEY().startsWith('eyJ') ? { Authorization: `Bearer ${KEY()}` } : {}), apikey: KEY(), ...extra });

export function storageReady() { return !!(BASE() && KEY()); }

// Awalan alamat publik semua file kita, mis. https://xxx.supabase.co/storage/v1/object/public/isengin/
function publicPrefix() { return `${BASE()}/storage/v1/object/public/${BUCKET()}/`; }
export function publicUrl(path) { return publicPrefix() + path.split('/').map(encodeURIComponent).join('/'); }

// Alamat file lama dari Vercel Blob tetap diterima supaya foto yang sudah tersimpan tidak langsung rusak.
// File lama itu tidak ikut dihapus otomatis (lihat ownBlob).
const isLegacy = (u) => { try { const x = new URL(String(u || '')); return x.protocol === 'https:' && x.hostname.endsWith('.blob.vercel-storage.com'); } catch { return false; } };

// Path di dalam bucket (mis. "avatars/2-1729-ab12.jpg") untuk alamat milik kita, atau null.
export function objPath(u) {
  if (!BASE()) return null;
  try {
    const s = String(u || '');
    const pre = publicPrefix();
    if (!s.startsWith(pre)) return null;
    const x = new URL(s);
    return decodeURIComponent(x.pathname.slice(new URL(pre).pathname.length));
  } catch { return null; }
}

export function isBlobUrl(u) { return objPath(u) !== null || isLegacy(u); }

// Apakah alamat ini file Supabase yang diunggah oleh pengguna `id`?
export function ownBlob(u, id) {
  const p = objPath(u);
  return !!p && BLOB_DIRS.some((d) => p.startsWith(`${d}/${id}-`));
}

// Unggah satu file; mengembalikan alamat publiknya.
export async function putFile(path, file, contentType) {
  const r = await fetch(`${BASE()}/storage/v1/object/${BUCKET()}/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': contentType, 'Cache-Control': 'max-age=31536000' }),
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return publicUrl(path);
}

// Hapus banyak file sekaligus (path di dalam bucket).
export async function removePaths(paths) {
  if (!paths.length) return;
  const r = await fetch(`${BASE()}/storage/v1/object/${BUCKET()}`, {
    method: 'DELETE',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

// Daftar file di satu folder: [{ path, createdAt }]. Folder bersarang dilewati.
export async function listDir(dir) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${BASE()}/storage/v1/object/list/${BUCKET()}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ prefix: dir, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    for (const f of rows) if (f.id) out.push({ path: `${dir}/${f.name}`, createdAt: f.created_at });
    if (rows.length < 1000) break;
  }
  return out;
}

// Semua file yang sedang dipakai pengguna: foto profil, gambar link, dan gambar latar.
// strict=true: kalau pembacaan database gagal, lempar error (jangan diam-diam mengembalikan daftar kosong).
// Ini penting untuk penghapusan: daftar kosong palsu akan membuat file yang masih dipakai ikut terhapus.
export async function userBlobs(id, strict = false) {
  const q = (p) => (strict ? p : p.catch(() => []));
  const out = [];
  const u = await q(sql`select photo_url from users where id=${id}`);
  if (u[0]?.photo_url) out.push(u[0].photo_url);
  const b = await q(sql`select bg from users where id=${id}`);
  try { const o = JSON.parse(b[0]?.bg || ''); if (o?.url) out.push(o.url); } catch {}
  const t = await q(sql`select thumb from links where user_id=${id}`);
  for (const r of t) if (r.thumb) out.push(r.thumb);
  return out;
}

// Hapus file lama. Gagal menghapus tidak boleh membuat simpan/hapus akun ikut gagal;
// sisa file akan disapu oleh cron (app/api/cron/blob).
export async function dropBlobs(urls, id) {
  const mine = [...new Set(urls)].filter((u) => ownBlob(u, id)).map(objPath);
  if (!mine.length || !storageReady()) return;
  try { await removePaths(mine); } catch (e) { console.error('Gagal menghapus file lama di Supabase:', e.message); }
}
