// Midtrans Snap tanpa SDK. Server key hanya dipakai di server.
import { createHash, timingSafeEqual } from 'crypto';
const prod = () => process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SNAP = () => (prod() ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com') + '/snap/v1/transactions';
const API = () => (prod() ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com');
const auth = () => 'Basic ' + Buffer.from((process.env.MIDTRANS_SERVER_KEY || '') + ':').toString('base64');
export const midtransReady = () => !!process.env.MIDTRANS_SERVER_KEY;

// Buat transaksi Snap, kembalikan { token, redirect_url }.
export async function createSnap({ orderId, amount, itemName, name, email, finishUrl }) {
  const r = await fetch(SNAP(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: auth() },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      item_details: [{ id: 'pro', price: amount, quantity: 1, name: itemName.slice(0, 50) }],
      customer_details: { first_name: String(name || '').slice(0, 40), ...(email ? { email } : {}) },
      ...(finishUrl ? { callbacks: { finish: finishUrl } } : {}),
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.redirect_url) throw new Error('Midtrans menolak transaksi: ' + (d.error_messages || [r.status]).join(', '));
  return d;
}

// Status transaksi langsung dari Midtrans (tidak mempercayai isi notifikasi begitu saja).
export async function fetchStatus(orderId) {
  const r = await fetch(`${API()}/v2/${encodeURIComponent(orderId)}/status`, { headers: { Accept: 'application/json', Authorization: auth() } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok && d.status_code !== '404') throw new Error('Gagal cek status Midtrans: ' + r.status);
  return d;
}

// Tanda tangan notifikasi: sha512(order_id + status_code + gross_amount + server key).
export function signatureOk(n) {
  const want = createHash('sha512').update(`${n.order_id}${n.status_code}${n.gross_amount}${process.env.MIDTRANS_SERVER_KEY || ''}`).digest('hex');
  const got = String(n.signature_key || '');
  return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export const isPaid = (s) => s.transaction_status === 'settlement' || (s.transaction_status === 'capture' && s.fraud_status === 'accept');
export const isDead = (s) => ['expire', 'cancel', 'deny', 'failure'].includes(s.transaction_status);
