import { list, del } from '@vercel/blob';
import { sql } from '@/lib/db';
import { BLOB_DIRS } from '@/lib/blob';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GRACE = 24 * 3600 * 1000; // unggahan baru diberi waktu 1 hari (mungkin belum disimpan pengguna)
const path = (u) => { try { return decodeURIComponent(new URL(u).pathname).replace(/^\//, ''); } catch { return String(u); } };

// Menyapu file Blob yang tidak dipakai siapa pun: unggahan yang tidak jadi disimpan,
// atau sisa dari versi lama yang tidak menghapus file. Dipanggil Vercel Cron (lihat vercel.json).
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
    return Response.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: 'Blob belum tersambung.' }, { status: 503 });
  try {
    // Kalau salah satu query ini gagal (mis. schema-update.sql belum jalan), berhenti: lebih baik tidak menghapus apa pun.
    const used = new Set();
    for (const r of await sql`select photo_url from users where photo_url is not null`) used.add(path(r.photo_url));
    for (const r of await sql`select thumb from links where thumb is not null and thumb <> ''`) used.add(path(r.thumb));
    for (const r of await sql`select bg from users where bg is not null and bg <> ''`) {
      try { const o = JSON.parse(r.bg); if (o?.url) used.add(path(o.url)); } catch {}
    }
    const stale = [];
    let seen = 0;
    for (const dir of BLOB_DIRS) {
      let cursor;
      do {
        const r = await list({ prefix: `${dir}/`, cursor, limit: 1000 });
        for (const b of r.blobs) {
          seen++;
          if (!used.has(b.pathname) && Date.now() - new Date(b.uploadedAt).getTime() > GRACE) stale.push(b.url);
        }
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
    }
    for (let i = 0; i < stale.length; i += 100) await del(stale.slice(i, i + 100));
    return Response.json({ checked: seen, deleted: stale.length });
  } catch (e) {
    console.error('Cron pembersih Blob gagal:', e.message);
    return Response.json({ error: 'Gagal.' }, { status: 500 });
  }
}
