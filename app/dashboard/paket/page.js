'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
const rp = (n) => 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const STATUS = { paid: 'Lunas', pending: 'Menunggu pembayaran', expire: 'Kedaluwarsa', cancel: 'Dibatalkan', deny: 'Ditolak', failure: 'Gagal', failed: 'Gagal' };
const ROWS = [
  ['Halaman, link, tema, dan statistik dasar', 'Ya', 'Ya'],
  ['Statistik harian per link', '7 hari', '30 hari'],
  ['Domain kustom (mis. link.tokokamu.com)', 'Tidak', 'Ya'],
  ['Tanpa tulisan “Dibuat di isengin.site”', 'Tidak', 'Ya'],
];

export default function Paket() {
  const [d, setD] = useState(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const load = () => fetch('/api/billing').then((r) => (r.ok ? r.json() : null)).then((x) => { if (x) setD(x); });
  useEffect(() => { load(); }, []);
  // Setelah membayar, konfirmasi datang lewat webhook; cek ulang beberapa kali sampai paket aktif.
  const waiting = d?.payments?.some((p) => p.status === 'pending' && Date.now() - new Date(p.created_at).getTime() < 3600000);
  useEffect(() => {
    if (!waiting) return;
    let n = 0;
    const t = setInterval(() => { if (++n > 12) clearInterval(t); else load(); }, 5000);
    return () => clearInterval(t);
  }, [waiting]);

  async function buy(plan) {
    setBusy(plan); setErr('');
    const r = await fetch('/api/billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const x = await r.json().catch(() => ({}));
    if (r.ok && x.url) { location.href = x.url; return; }
    setErr(x.error || 'Gagal membuat pesanan.'); setBusy('');
  }
  if (!d) return (<><h1>Paket</h1><Loader inline /></>);
  return (<>
    <h1>Paket</h1>
    <p className="px-sub">{d.pro ? <>Paket <b>Pro</b> aktif sampai {tgl(d.until)}.</> : 'Kamu memakai paket Gratis.'}</p>
    <div className="px-card">
      <section className="px-sec">
        <h2>Gratis dan Pro</h2>
        <div className="px-tw"><table>
          <thead><tr><th>Fitur</th><th>Gratis</th><th>Pro</th></tr></thead>
          <tbody>{ROWS.map(([f, a, b]) => <tr key={f}><td>{f}</td><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="px-sec">
        <h2>{d.pro ? 'Perpanjang' : 'Upgrade ke Pro'}</h2>
        {!d.ready && <p className="px-warn" role="status">Pembayaran belum diaktifkan oleh pemilik situs.</p>}
        {waiting && <p className="px-hint" role="status">Menunggu konfirmasi pembayaran. Halaman ini diperbarui otomatis; kalau sudah membayar, biasanya hanya beberapa detik.</p>}
        <div className="px-actions">
          {Object.entries(d.plans).map(([k, p]) => (
            <button key={k} className="px-btn" disabled={!d.ready || !!busy} aria-busy={busy === k} onClick={() => buy(k)}>
              {busy === k ? 'Membuka pembayaran…' : `${p.label} · ${rp(p.price)}`}
            </button>
          ))}
        </div>
        {err && <p className="px-err" role="alert">{err}</p>}
        <p className="px-hint">Pembayaran lewat Midtrans (QRIS, transfer bank, e-wallet, kartu). Perpanjangan ditambahkan setelah masa aktif yang tersisa, jadi tidak ada hari yang hilang. Paket tidak diperpanjang otomatis.</p>
      </section>
      {d.payments.length > 0 && (
        <section className="px-sec">
          <h2>Riwayat</h2>
          <div className="px-tw"><table>
            <thead><tr><th>Tanggal</th><th>Paket</th><th>Jumlah</th><th>Status</th></tr></thead>
            <tbody>{d.payments.map((p) => (
              <tr key={p.order_id}><td>{tgl(p.created_at)}</td><td>{d.plans[p.plan]?.label || p.plan}</td><td>{rp(p.amount)}</td><td>{STATUS[p.status] || p.status}</td></tr>
            ))}</tbody>
          </table></div>
        </section>
      )}
    </div>
  </>);
}
