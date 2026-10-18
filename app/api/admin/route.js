import { sql } from '@/lib/db';
import { userBlobs, dropBlobs } from '@/lib/blob';
import { removeDomain } from '@/lib/vercel';
import { setAdmin, clearAdmin, isAdmin } from '@/lib/auth';
import { hit, clear, ipOf, tooMany } from '@/lib/limit';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });
export async function POST(req) {
  const { mode, username, password } = await req.json();
  if (mode === 'logout') { clearAdmin(); return Response.json({ ok: true }); }
  const ip = ipOf(req);
  const lim = await hit(`admin:${ip}`, 8, 900);
  if (lim.over) return tooMany(lim);
  const { ADMIN_USER, ADMIN_PASS } = process.env;
  if (!ADMIN_USER || !ADMIN_PASS || username !== ADMIN_USER || password !== ADMIN_PASS)
    return Response.json({ error: 'Nama atau sandi admin salah.' }, { status: 401 });
  await clear(`admin:${ip}`);
  await setAdmin();
  return Response.json({ ok: true });
}
export async function GET() {
  if (!(await isAdmin())) return no();
  const users = await sql`select u.id,u.username,u.display_name,u.created_at,u.active,u.verified,(u.plan_until > now()) as pro,u.plan_until,u.views,count(l.id)::int as links,coalesce(sum(l.clicks),0)::int as clicks from users u left join links l on l.user_id=u.id group by u.id order by u.id desc`
    .catch((e) => { console.error('Kolom verified belum ada (jalankan schema-update.sql):', e.message); return sql`select u.id,u.username,u.display_name,u.created_at,u.active,u.views,count(l.id)::int as links,coalesce(sum(l.clicks),0)::int as clicks from users u left join links l on l.user_id=u.id group by u.id order by u.id desc`; });
  const requests = await sql`select r.user_id as id, u.username, u.display_name, r.note, r.created_at, u.views,
      (select count(*)::int from links l where l.user_id=u.id and l.hidden is not true and coalesce(l.kind,'link')='link') as links
    from verify_requests r join users u on u.id=r.user_id where r.status='pending' order by r.created_at`
    .catch((e) => { console.error('Tabel verify_requests belum ada (jalankan schema-update.sql):', e.message); return []; });
  const reports = (await sql`select count(distinct user_id)::int as n from reports where status='open'`.catch(() => [{ n: 0 }]))[0]?.n || 0;
  return Response.json({ users, requests, reports });
}
export async function PATCH(req) {
  if (!(await isAdmin())) return no();
  const { id, active, verified, proDays, decide, reason } = await req.json();
  // Keputusan atas pengajuan centang dari pengguna.
  if (decide === 'approve' || decide === 'reject') {
    try {
      if (decide === 'approve') {
        await sql`update users set verified=true, verified_at=now() where id=${Number(id)}`;
        await sql`delete from verify_requests where user_id=${Number(id)}`;
      } else {
        await sql`update verify_requests set status='rejected', reason=${String(reason || '').trim().slice(0, 200)}, decided_at=now() where user_id=${Number(id)}`;
      }
    } catch (e) {
      console.error('Keputusan centang gagal (sudah jalankan schema-update.sql?):', e.message);
      return Response.json({ error: 'Gagal. Jalankan schema-update.sql di database.' }, { status: 500 });
    }
    return Response.json({ ok: true });
  }
  // Centang verifikasi hanya bisa diubah dari sini (pengguna tidak punya akses lewat /api/me).
  if (typeof verified === 'boolean') {
    try { await sql`update users set verified=${verified}, verified_at=case when ${verified} then now() else null end where id=${Number(id)}`; }
    catch (e) {
      console.error('Gagal mengubah verifikasi (sudah jalankan schema-update.sql?):', e.message);
      return Response.json({ error: 'Kolom verified belum ada. Jalankan schema-update.sql di database.' }, { status: 500 });
    }
  }
  // Beri Pro N hari (diperpanjang dari tanggal berakhir bila masih aktif), atau 0 untuk mencabut.
  if (Number.isInteger(proDays) && proDays >= 0 && proDays <= 3650) {
    try {
      await sql`update users set plan_until = case when ${proDays}::int = 0 then null
        else greatest(coalesce(plan_until, now()), now()) + make_interval(days => ${proDays}::int) end where id=${Number(id)}`;
    } catch (e) {
      console.error('Gagal mengubah paket (sudah jalankan schema-update.sql?):', e.message);
      return Response.json({ error: 'Kolom plan_until belum ada. Jalankan schema-update.sql di database.' }, { status: 500 });
    }
  }
  if (typeof active === 'boolean') await sql`update users set active=${active} where id=${Number(id)}`;
  return Response.json({ ok: true });
}
// Hapus akun beserta link dan statistiknya (cascade di database), lalu semua file Blob-nya.
export async function DELETE(req) {
  if (!(await isAdmin())) return no();
  const { id } = await req.json();
  const uid = Number(id);
  const files = await userBlobs(uid);
  const dom = (await sql`select custom_domain from users where id=${uid}`.catch(() => []))[0]?.custom_domain;
  const r = await sql`delete from users where id=${uid} returning id`;
  await dropBlobs(files, uid);
  await removeDomain(dom);
  return Response.json({ ok: true, deleted: r.length });
}
