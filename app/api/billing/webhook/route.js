import { sql } from '@/lib/db';
import { PLANS } from '@/lib/plan';
import { signatureOk, fetchStatus, isPaid, isDead } from '@/lib/midtrans';
export const dynamic = 'force-dynamic';

// Notifikasi dari Midtrans (atur di dashboard Midtrans: Settings > Configuration > Payment Notification URL).
// Tiga lapis pengaman: tanda tangan, status dicek ulang langsung ke Midtrans, dan nominal harus sama dengan pesanan.
// Aman dipanggil berulang: pesanan yang sudah lunas tidak memperpanjang paket dua kali.
export async function POST(req) {
  const n = await req.json().catch(() => null);
  if (!n || !n.order_id || !signatureOk(n)) return Response.json({ error: 'Tanda tangan tidak valid.' }, { status: 401 });
  const pay = (await sql`select order_id,user_id,plan,amount,status from payments where order_id=${String(n.order_id)}`)[0];
  if (!pay) return Response.json({ ok: true }); // bukan pesanan kita
  let st;
  try { st = await fetchStatus(pay.order_id); } catch (e) {
    console.error(e.message);
    return Response.json({ error: 'Cek status gagal.' }, { status: 500 }); // Midtrans akan mengulang
  }
  if (isPaid(st)) {
    if (Number(st.gross_amount) !== pay.amount) {
      console.error('Nominal tidak cocok untuk', pay.order_id, st.gross_amount, pay.amount);
      return Response.json({ ok: true });
    }
    const days = (PLANS[pay.plan] || PLANS.bulanan).days;
    // Satu perintah: tandai lunas (hanya kalau belum) dan perpanjang paket dari tanggal berakhir saat ini, atau dari sekarang bila sudah lewat.
    await sql`
      with p as (update payments set status='paid', paid_at=now() where order_id=${pay.order_id} and status <> 'paid' and user_id is not null returning user_id)
      update users set plan_until = greatest(coalesce(plan_until, now()), now()) + make_interval(days => ${days}::int)
      where id = (select user_id from p)`;
  } else if (isDead(st)) {
    await sql`update payments set status=${String(st.transaction_status).slice(0, 20)} where order_id=${pay.order_id} and status = 'pending'`;
  }
  return Response.json({ ok: true });
}
