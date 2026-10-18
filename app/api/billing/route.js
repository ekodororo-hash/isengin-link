import { sql } from '@/lib/db';
import { loadSettings } from '@/lib/settings';
import { getUserId } from '@/lib/auth';
import { hit, tooMany } from '@/lib/limit';
import { PLANS, planKey } from '@/lib/plan';
import { createSnap, midtransReady } from '@/lib/midtrans';
import { pending, pendingBonus, REWARD_DAYS, BONUS_DAYS } from '@/lib/referral';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });

// Status paket, harga, dan riwayat pembayaran.
export async function GET() {
  await loadSettings();
  const id = await getUserId();
  if (!id) return no();
  const [u, pays, rf, bn, ready, bonusReady, paidRows] = await Promise.all([
    sql`select (plan_until > now()) as pro, plan_until from users where id=${id}`.catch(() => []),
    sql`select order_id, plan, amount, status, created_at, paid_at from payments where user_id=${id} order by created_at desc limit 10`.catch(() => []),
    // Hadiah referral yang sudah diklaim (pengundang) dan bonus undangan milik pengguna ini.
    sql`select username, ref_rewarded_at as at from users where referred_by=${id} and ref_rewarded_at is not null order by ref_rewarded_at desc limit 100`.catch(() => []),
    sql`select i.username as by, u.ref_bonus_at as at from users u join users i on i.id=u.referred_by where u.id=${id} and u.ref_bonus_at is not null`.catch(() => []),
    pending(id).catch(() => null),
    pendingBonus(id).catch(() => null),
    sql`select plan, count(*)::int as n from payments where user_id=${id} and status='paid' group by plan`.catch(() => []),
  ]);
  // Klaim hadiah pengundang dikelompokkan per menit (satu klik = satu baris riwayat).
  const groups = new Map();
  for (const r of rf) { const k = new Date(r.at).toISOString().slice(0, 16); const g = groups.get(k) || { kind: 'reward', at: r.at, friends: [] }; g.friends.push(r.username); groups.set(k, g); }
  const claims = [...Array.from(groups.values()).map((g) => ({ ...g, days: g.friends.length * REWARD_DAYS })), ...bn.map((b) => ({ kind: 'bonus', at: b.at, by: b.by, days: BONUS_DAYS }))].sort((a, b) => new Date(b.at) - new Date(a.at));
  const paidDays = paidRows.reduce((a, r) => a + (PLANS[r.plan]?.days || 0) * r.n, 0);
  return Response.json({
    ready: midtransReady(),
    pro: u[0]?.pro === true,
    until: u[0]?.plan_until || null,
    plans: Object.fromEntries(Object.entries(PLANS).map(([k, v]) => [k, { label: v.label, price: v.price, days: v.days }])),
    payments: pays,
    referral: {
      pending: ready ? { n: ready.n, days: ready.days, friends: ready.friends } : null,
      bonus: bonusReady ? { days: bonusReady.days, by: bonusReady.by } : null,
      claims,
      refDays: claims.reduce((a, c) => a + c.days, 0),
      paidDays,
    },
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
