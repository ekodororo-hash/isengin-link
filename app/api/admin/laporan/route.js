import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });

// Halaman yang dilaporkan dan belum ditangani, paling banyak dilaporkan dulu.
export async function GET() {
  if (!(await isAdmin())) return no();
  try {
    const [groups, reasons, items] = await Promise.all([
      sql`select r.user_id as id, u.username, u.active, count(*)::int as total, max(r.created_at) as last_at
          from reports r join users u on u.id=r.user_id where r.status='open'
          group by r.user_id, u.username, u.active order by total desc, last_at desc limit 100`,
      sql`select user_id, reason, count(*)::int as n from reports where status='open' group by user_id, reason`,
      sql`select user_id, reason, detail, created_at from (
            select *, row_number() over (partition by user_id order by created_at desc) as rn from reports where status='open') x
          where rn <= 5 order by created_at desc`,
    ]);
    return Response.json({
      groups: groups.map((g) => ({
        ...g,
        reasons: reasons.filter((x) => x.user_id === g.id).map((x) => ({ reason: x.reason, n: x.n })),
        items: items.filter((x) => x.user_id === g.id).map((x) => ({ reason: x.reason, detail: x.detail, at: x.created_at })),
      })),
    });
  } catch (e) {
    console.error('Laporan admin gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Data belum siap. Jalankan schema-update.sql di database.' }, { status: 500 });
  }
}

// action: 'dismiss' (laporan tidak terbukti) atau 'deactivate' (nonaktifkan halamannya).
export async function PATCH(req) {
  if (!(await isAdmin())) return no();
  const { id, action } = await req.json().catch(() => ({}));
  const uid = Number(id);
  if (!uid || (action !== 'dismiss' && action !== 'deactivate')) return Response.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  try {
    if (action === 'deactivate') {
      await sql.transaction([
        sql`update users set active=false where id=${uid}`,
        sql`update reports set status='actioned', handled_at=now() where user_id=${uid} and status='open'`,
      ]);
    } else {
      await sql`update reports set status='dismissed', handled_at=now() where user_id=${uid} and status='open'`;
    }
  } catch (e) {
    console.error('Menangani laporan gagal:', e.message);
    return Response.json({ error: 'Gagal menyimpan keputusan.' }, { status: 500 });
  }
  return Response.json({ ok: true });
}
