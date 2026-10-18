import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { PLANS } from '@/lib/plan';
import { midtransReady } from '@/lib/midtrans';
import { vercelReady } from '@/lib/vercel';
export const dynamic = 'force-dynamic';

// Status pembayaran dan domain untuk admin. Hanya menampilkan terpasang atau belum; isi kunci tidak pernah dikirim.
export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const [sum, pays, doms] = await Promise.all([
    sql`select count(*) filter (where status in ('settlement','capture','paid','success'))::int as paid,
        coalesce(sum(amount) filter (where status in ('settlement','capture','paid','success')),0)::int as total,
        count(*) filter (where status='pending')::int as pending
        from payments`.catch(() => [{ paid: 0, total: 0, pending: 0 }]),
    sql`select p.order_id, p.plan, p.amount, p.status, p.created_at, p.paid_at, u.username
        from payments p left join users u on u.id=p.user_id order by p.created_at desc limit 10`.catch(() => []),
    sql`select username, custom_domain, domain_status from users where custom_domain is not null order by id desc limit 50`.catch(() => []),
  ]);
  return Response.json({
    pay: {
      ready: midtransReady(),
      production: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      plans: Object.values(PLANS).map((p) => ({ label: p.label, price: p.price })),
      webhook: `${site || 'https://domainmu'}/api/billing/webhook`,
      ...sum[0],
      recent: pays,
    },
    dom: {
      ready: vercelReady(),
      team: !!process.env.VERCEL_TEAM_ID,
      list: doms,
    },
  });
}
