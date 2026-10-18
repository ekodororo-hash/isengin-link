import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { hit, tooMany } from '@/lib/limit';
import { checks, NOTE_MIN, NOTE_MAX, RETRY_DAYS } from '@/lib/verify';
export const dynamic = 'force-dynamic';
const needLogin = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });
const bad = (error, status = 400) => Response.json({ error }, { status });
const SETUP = 'Fitur ini belum siap. Jalankan schema-update.sql di database.';

// Status centang akun ini, syarat otomatis, dan pengajuan terakhir (kalau ada).
export async function GET() {
  const id = await getUserId();
  if (!id) return needLogin();
  try {
    const u = (await sql`select verified,verified_at from users where id=${id}`)[0];
    const req = (await sql`select note,status,reason,created_at,decided_at from verify_requests where user_id=${id}`)[0] || null;
    const c = await checks(id);
    const retryAt = req?.status === 'rejected' && req.decided_at ? new Date(new Date(req.decided_at).getTime() + RETRY_DAYS * 86400000).toISOString() : null;
    return Response.json({ verified: u?.verified === true, verifiedAt: u?.verified_at || null, request: req, checks: c.list, ready: c.ready, retryAt, noteMin: NOTE_MIN, noteMax: NOTE_MAX });
  } catch (e) {
    console.error('Verifikasi gagal dibaca (sudah jalankan schema-update.sql?):', e.message);
    return bad(SETUP, 500);
  }
}

// Ajukan centang. Admin memutuskan di /admin/pengguna.
export async function POST(req) {
  const id = await getUserId();
  if (!id) return needLogin();
  const lim = await hit(`vreq:${id}`, 3, 86400);
  if (lim.over) return tooMany(lim);
  const b = await req.json().catch(() => ({}));
  const note = String(b.note || '').trim().slice(0, NOTE_MAX);
  if (note.length < NOTE_MIN) return bad(`Tulis alasan atau tautan akun resmimu (minimal ${NOTE_MIN} karakter).`);
  try {
    const u = (await sql`select verified from users where id=${id}`)[0];
    if (u?.verified === true) return bad('Akunmu sudah terverifikasi.', 409);
    const old = (await sql`select status,decided_at from verify_requests where user_id=${id}`)[0];
    if (old?.status === 'pending') return bad('Pengajuanmu masih menunggu.', 409);
    if (old?.status === 'rejected' && old.decided_at && Date.now() - new Date(old.decided_at).getTime() < RETRY_DAYS * 86400000)
      return bad(`Pengajuan bisa diulang ${RETRY_DAYS} hari setelah ditolak.`, 429);
    const c = await checks(id);
    if (!c.ready) return bad('Lengkapi dulu syarat di atas.');
    await sql`insert into verify_requests(user_id,note,status,reason,created_at,decided_at) values (${id},${note},'pending','',now(),null)
      on conflict (user_id) do update set note=excluded.note, status='pending', reason='', created_at=now(), decided_at=null`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error('Pengajuan centang gagal (sudah jalankan schema-update.sql?):', e.message);
    return bad(SETUP, 500);
  }
}

// Batalkan pengajuan yang masih menunggu.
export async function DELETE() {
  const id = await getUserId();
  if (!id) return needLogin();
  await sql`delete from verify_requests where user_id=${id} and status='pending'`.catch(() => {});
  return Response.json({ ok: true });
}
