import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { PLANS } from '@/lib/plan';
import { midtransReady } from '@/lib/midtrans';
import { loadSettings, saveSettings, view } from '@/lib/settings';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });

async function state() {
  const db = await loadSettings(true);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const [sum, pays] = await Promise.all([
    sql`select count(*) filter (where status='paid')::int as paid,
        coalesce(sum(amount) filter (where status='paid'),0)::int as total,
        count(*) filter (where status='pending')::int as pending from payments`.catch(() => [{ paid: 0, total: 0, pending: 0 }]),
    sql`select p.order_id, p.plan, p.amount, p.status, p.created_at, u.username
        from payments p left join users u on u.id=p.user_id order by p.created_at desc limit 10`.catch(() => []),
  ]);
  return {
    ready: midtransReady(),
    key: view('MIDTRANS_SERVER_KEY', db),
    production: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    month: PLANS.bulanan.price,
    year: PLANS.tahunan.price,
    webhook: `${site || 'https://domainmu'}/api/billing/webhook`,
    ...sum[0],
    recent: pays,
  };
}
export async function GET() {
  if (!(await isAdmin())) return no();
  return Response.json(await state());
}

// Simpan pengaturan. Kunci kosong = tidak diubah; clearKey = hapus kunci yang disimpan di sini.
export async function PUT(req) {
  if (!(await isAdmin())) return no();
  const b = await req.json().catch(() => ({}));
  const vals = {};
  const key = String(b.key || '').trim();
  if (key) {
    if (key.length > 200 || /\s/.test(key)) return Response.json({ error: 'Server key tidak valid.' }, { status: 400 });
    vals.MIDTRANS_SERVER_KEY = key;
  } else if (b.clearKey) vals.MIDTRANS_SERVER_KEY = '';
  if (typeof b.production === 'boolean') vals.MIDTRANS_IS_PRODUCTION = b.production ? 'true' : 'false';
  for (const [f, k] of [['month', 'PRO_PRICE_MONTH'], ['year', 'PRO_PRICE_YEAR']]) {
    const n = Number(b[f]);
    if (!Number.isInteger(n) || n < 1000 || n > 100000000) return Response.json({ error: 'Harga harus angka bulat, minimal Rp1.000.' }, { status: 400 });
    vals[k] = String(n);
  }
  try { await saveSettings(vals); } catch (e) {
    console.error('Simpan pengaturan gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Gagal menyimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
  }
  return Response.json(await state());
}
