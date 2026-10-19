import { sql } from '@/lib/db';
import { BLOB_DIRS, objPath, listDir, removePaths, storageReady } from '@/lib/blob';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GRACE = 24 * 3600 * 1000; // unggahan baru diberi waktu 1 hari (mungkin belum disimpan pengguna)

// Menyapu file yang tidak dipakai siapa pun: unggahan yang tidak jadi disimpan,
// atau sisa dari versi lama yang tidak menghapus file. Dipanggil Vercel Cron (lihat vercel.json).
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
    return Response.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  if (!storageReady()) return Response.json({ error: 'Supabase belum tersambung.' }, { status: 503 });
  try {
    // Kalau salah satu query ini gagal (mis. schema-update.sql belum jalan), berhenti: lebih baik tidak menghapus apa pun.
    const used = new Set();
    for (const r of await sql`select photo_url from users where photo_url is not null`) used.add(objPath(r.photo_url));
    for (const r of await sql`select thumb from links where thumb is not null and thumb <> ''`) used.add(objPath(r.thumb));
    for (const r of await sql`select bg from users where bg is not null and bg <> ''`) {
      try { const o = JSON.parse(r.bg); if (o?.url) used.add(objPath(o.url)); } catch {}
    }
    const stale = [];
    let seen = 0;
    for (const dir of BLOB_DIRS) {
      for (const b of await listDir(dir)) {
        seen++;
        if (!used.has(b.path) && Date.now() - new Date(b.createdAt).getTime() > GRACE) stale.push(b.path);
      }
    }
    for (let i = 0; i < stale.length; i += 100) await removePaths(stale.slice(i, i + 100));
    return Response.json({ checked: seen, deleted: stale.length });
  } catch (e) {
    console.error('Cron pembersih file gagal:', e.message);
    return Response.json({ error: 'Gagal.' }, { status: 500 });
  }
}
