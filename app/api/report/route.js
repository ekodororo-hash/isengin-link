import { sql } from '@/lib/db';
import { hit, ipOf, tooMany } from '@/lib/limit';
export const dynamic = 'force-dynamic';
const REASONS = { penipuan: 'Penipuan atau phishing', dewasa: 'Konten dewasa', kekerasan: 'Kekerasan atau kebencian', tiruan: 'Menyamar sebagai orang lain', spam: 'Spam', lainnya: 'Lainnya' };

// Laporan halaman dari pengunjung (tanpa login). Dibatasi per IP, dan satu IP hanya sekali per halaman per hari.
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const username = String(b.username || '').trim().toLowerCase();
  const reason = Object.prototype.hasOwnProperty.call(REASONS, b.reason) ? b.reason : '';
  const detail = String(b.detail || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (!/^[a-z0-9_]{3,20}$/.test(username) || !reason) return Response.json({ error: 'Pilih alasan laporan.' }, { status: 400 });
  const ip = ipOf(req);
  const lim = await hit(`report:ip:${ip}`, 6, 3600);
  if (lim.over) return tooMany(lim);
  const u = (await sql`select id from users where username=${username} and active is not false`.catch(() => []))[0];
  if (!u) return Response.json({ error: 'Halaman tidak ditemukan.' }, { status: 404 });
  if ((await hit(`report:${ip}:${u.id}`, 1, 86400)).over) return Response.json({ ok: true });
  try {
    await sql`insert into reports(user_id, reason, detail) values (${u.id}, ${reason}, ${detail})`;
  } catch (e) {
    console.error('Laporan gagal disimpan (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Laporan belum bisa dikirim sekarang.' }, { status: 500 });
  }
  return Response.json({ ok: true });
}
