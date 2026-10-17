import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';

// Ringkasan referral untuk admin: pengundang teratas dan undangan terbaru (berguna untuk memantau penyalahgunaan).
export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  try {
    const [top, recent, tot] = await Promise.all([
      sql`select r.username, count(u.id)::int as invited, count(u.ref_rewarded_at)::int as rewarded
          from users r join users u on u.referred_by=r.id group by r.id, r.username order by invited desc, r.id limit 50`,
      sql`select u.username, r.username as by, u.created_at, u.ref_rewarded_at as rewarded_at
          from users u join users r on r.id=u.referred_by order by u.id desc limit 100`,
      sql`select count(*)::int as invited, count(ref_rewarded_at)::int as rewarded from users where referred_by is not null`,
    ]);
    return Response.json({ top, recent, invited: tot[0].invited, rewarded: tot[0].rewarded });
  } catch (e) {
    console.error('Referral admin gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Data belum siap. Jalankan schema-update.sql di database.' }, { status: 500 });
  }
}
