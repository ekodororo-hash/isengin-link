import { sql } from '@/lib/db';
import { loadSettings } from '@/lib/settings';
import { getUserId } from '@/lib/auth';
import { hit, tooMany } from '@/lib/limit';
import { PLANS, planKey } from '@/lib/plan';
import { createSnap, midtransReady } from '@/lib/midtrans';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });

// Status paket, harga, dan riwayat pembayaran.
export async function GET() {
  await loadSettings();
  const id = await getUserId();
  if (!id) return no();
  const [u, pays] = await Promise.all([
    sql`select (plan_until > now()) as pro, plan_until from users where id=${id}`.catch(() => []),
    sql`select order_id, plan, amount, status, created_at, paid_at from payments where user_id=${id} order by created_at desc limit 10`.catch(() => []),
  ]);
  return Response.json({
    ready: midtransReady(),
    pro: u[0]?.pro === true,
    until: u[0]?.plan_until || null,
    plans: Object.fromEntries(Object.entries(PLANS).map(([k, v]) => [k, { label: v.label, price: v.price }])),
    payments: pays,
  });
}

// Buat pesanan lalu kembalikan alamat pembayaran Midtrans. Paket baru aktif setelah webhook mengonfirmasi.
export async function POST(req) {
  await loadSettings();
  const id = await getUserId();
  if (!id) return no();
  if (!midtransReady()) return Response.json({ error: 'Pembayaran belum diaktifkan oleh pemilik situs.' }, { status: 503 });
  const lim = await hit(`bill:${id}`, 10, 3600);
  if (lim.over) return tooMany(lim);
  const b = await req.json().catch(() => ({}));
  const key = planKey(b.plan);
  if (!key) return Response.json({ error: 'Pilih paket yang tersedia.' }, { status: 400 });
  const plan = PLANS[key];
  const u = (await sql`select username from users where id=${id}`)[0];
  const email = (await sql`select email from users where id=${id}`.catch(() => []))[0]?.email || '';
  const orderId = `PRO-${id}-${Date.now()}`;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');
  try {
    await sql`insert into payments(order_id,user_id,plan,amount) values (${orderId},${id},${key},${plan.price})`;
    const s = await createSnap({ orderId, amount: plan.price, itemName: `isengin.site Pro ${plan.label}`, name: u.username, email, finishUrl: `${site}/dashboard/paket` });
    return Response.json({ url: s.redirect_url });
  } catch (e) {
    console.error('Gagal membuat pesanan:', e.message);
    await sql`update payments set status='failed' where order_id=${orderId}`.catch(() => {});
    return Response.json({ error: 'Pesanan gagal dibuat. Coba lagi nanti.' }, { status: 502 });
  }
}
