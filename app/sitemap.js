import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');

// Peta situs untuk mesin pencari: halaman umum, ditambah halaman pengguna aktif yang sudah punya minimal satu link
// (halaman kosong tidak ikut supaya tidak diindeks). Batas protokol sitemap: 50.000 alamat per berkas.
export default async function sitemap() {
  const now = new Date();
  const pages = [
    { path: '', priority: 1 },
    { path: '/fitur', priority: 0.8 },
    { path: '/tentang-kami', priority: 0.5 },
    { path: '/privasi', priority: 0.3 },
    { path: '/syarat', priority: 0.3 },
  ].map((p) => ({ url: SITE + p.path, lastModified: now, priority: p.priority }));

  let rows = [];
  try {
    rows = await sql`select u.username from users u
      where u.active is not false
        and exists (select 1 from links l where l.user_id=u.id and l.hidden is not true)
      order by u.id limit 49000`;
  } catch {
    // Kolom hidden belum ada (schema-update.sql belum dijalankan): hitung semua link.
    rows = await sql`select u.username from users u
      where u.active is not false
        and exists (select 1 from links l where l.user_id=u.id)
      order by u.id limit 49000`.catch(() => []);
  }
  const users = rows.map((r) => ({ url: `${SITE}/${r.username}`, lastModified: now, priority: 0.6 }));
  return [...pages, ...users];
}
