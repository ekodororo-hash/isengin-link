'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
const rp = (n) => 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const STATUS = { paid: 'Lunas', pending: 'Menunggu pembayaran', expire: 'Kedaluwarsa', cancel: 'Dibatalkan', deny: 'Ditolak', failure: 'Gagal', failed: 'Gagal' };
const ROWS = [
  ['Dasar'],
  ['Halaman, link, tema, dan statistik dasar', 'Ya', 'Ya'],
  ['Statistik harian per link', '7 hari', '30 hari'],
  ['Gambar di link', '3 gambar', 'Tanpa batas'],
  ['Tampilan'],
  ['Latar belakang gambar', 'Tidak', 'Ya'],
  ['Warna kustom', 'Tidak', 'Ya'],
  ['Tema selain Kobalt, Permen, Hutan, Neo', 'Tidak', 'Ya'],
  ['Pilihan font', '2 font', '5 font'],
  ['Pilihan gaya tombol', '2 gaya', '5 gaya'],
  ['Domain dan branding'],
  ['Domain kustom (mis. link.tokokamu.com)', 'Tidak', 'Ya'],
  ['Tanpa branding isengin (tulisan “Dibuat di isengin.site”, tombol logo, dan popup ajakan daftar)', 'Tidak', 'Ya'],
];
const cell = (v) => (v === 'Ya' ? <span className="px-tag">Ya</span> : v === 'Tidak' ? <span className="px-no">Tidak</span> : v);

export default function Paket() {
  const p = usePre('/api/billing');
  const [d, setD] = useState(p?.ok ? p.data : null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [got, setGot] = useState('');
  const load = () => fetch('/api/billing').then((r) => (r.ok ? r.json() : null)).then((x) => { if (x) setD(x); });
  useEffect(() => { if (!p) load(); }, []);
  // Modal klaim (RefModal) memberi tahu halaman ini supaya status paket ikut diperbarui.
  useEffect(() => { window.addEventListener('isengin:claimed', load); return () => window.removeEventListener('isengin:claimed', load); }, []);
  // Setelah membayar, konfirmasi datang lewat webhook; cek ulang beberapa kali sampai paket aktif.
  const waiting = d?.payments?.some((p) => p.status === 'pending' && Date.now() - new Date(p.created_at).getTime() < 3600000);
  useEffect(() => {
    if (!waiting) return;
    let n = 0;
    const t = setInterval(() => { if (++n > 12) clearInterval(t); else load(); }, 5000);
    return () => clearInterval(t);
  }, [waiting]);

  // Klaim hadiah referral langsung dari halaman ini (endpoint sama dengan modal dan halaman Undang).
  async function klaim(kind) {
    if (busy) return;
    setBusy('ref'); setGot(''); setErr('');
    try {
      const r = await fetch('/api/referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }) });
      const x = await r.json().catch(() => ({}));
      if (!r.ok) setErr(x.error || 'Klaim gagal. Coba lagi.');
      else { setGot(x.n > 0 ? `Berhasil. ${x.days} hari Pro sudah ditambahkan ke akunmu.` : 'Hadiah ini sudah diklaim sebelumnya.'); await load(); }
    } catch { setErr('Klaim gagal. Periksa koneksi, lalu coba lagi.'); }
    setBusy('');
  }
  async function buy(plan) {
    setBusy(plan); setErr('');
    const r = await fetch('/api/billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const x = await r.json().catch(() => ({}));
    if (r.ok && x.url) { location.href = x.url; return; }
    setErr(x.error || 'Gagal membuat pesanan.'); setBusy('');
  }
  if (!d) return (<><h1>Paket</h1><Loader inline /></>);
  const rf = d.referral || { pending: null, bonus: null, claims: [], refDays: 0, paidDays: 0 };
  const sisa = d.pro && d.until ? Math.max(0, Math.ceil((new Date(d.until) - Date.now()) / 86400000)) : 0;
  const rows = [
    ...d.payments.map((p) => ({ key: p.order_id, at: p.created_at, name: d.plans[p.plan]?.label ? `Pro ${d.plans[p.plan].label}` : p.plan, amt: rp(p.amount), st: STATUS[p.status] || p.status, ref: false })),
    ...rf.claims.map((c) => ({ key: `${c.kind}-${c.at}`, at: c.at, name: c.kind === 'bonus' ? `Bonus undangan @${c.by}` : `Hadiah referral ${c.friends.slice(0, 3).map((u) => '@' + u).join(', ')}${c.friends.length > 3 ? ` +${c.friends.length - 3}` : ''}`, amt: `+${c.days} hari`, st: 'Diklaim', ref: true })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));
  return (<>
    <h1>Paket</h1>
    <p className="px-sub">{d.pro ? <>Paket <b>Pro</b> aktif sampai {tgl(d.until)}.</> : 'Kamu memakai paket Gratis.'}</p>
    {(rf.pending || rf.bonus) && (
      <div className="pk-claim">
        <span><b>Hadiah referral siap diklaim.</b>{rf.pending && ` ${rf.pending.n} temanmu sudah memenuhi syarat (${rf.pending.friends.slice(0, 3).map((u) => '@' + u).join(', ')}${rf.pending.n > 3 ? ` dan ${rf.pending.n - 3} lainnya` : ''}).`}{rf.bonus && ` Kamu mendaftar lewat undangan @${rf.bonus.by}.`}</span>
        {rf.pending && <button className="px-btn d" disabled={!!busy} aria-busy={busy === 'ref'} onClick={() => klaim('reward')}>{busy === 'ref' ? 'Memproses…' : `Klaim ${rf.pending.days} hari Pro`}</button>}
        {rf.bonus && <button className="px-btn d" disabled={!!busy} aria-busy={busy === 'ref'} onClick={() => klaim('bonus')}>{busy === 'ref' ? 'Memproses…' : `Klaim bonus ${rf.bonus.days} hari Pro`}</button>}
      </div>
    )}
    {got && <p className="px-hint" role="status">{got}</p>}
    <div className="px-card">
      <section className="px-sec">
        <h2>Status paket</h2>
        <div className="pk-top">
          <span className={'pk-badge' + (d.pro ? '' : ' free')}>{d.pro ? 'Pro aktif' : 'Gratis'}</span>
          <span className="pk-until">{d.pro ? `Berakhir ${tgl(d.until)} · sisa ${sisa} hari` : 'Upgrade atau klaim hadiah referral untuk membuka fitur Pro.'}</span>
        </div>
        {d.pro && (rf.paidDays > 0 || rf.refDays > 0) && (
          <ul className="pk-src">
            {rf.paidDays > 0 && <li><i className="pay" aria-hidden="true" />Pembelian paket<small>+{rf.paidDays} hari</small></li>}
            {rf.refDays > 0 && <li><i className="ref" aria-hidden="true" />Hadiah referral dan bonus undangan<small>+{rf.refDays} hari</small></li>}
          </ul>
        )}
      </section>
      <section className="px-sec">
        <h2>Gratis dan Pro</h2>
        <div className="px-tw"><table className="px-cmp">
          <thead><tr><th>Fitur</th><th>Gratis</th><th>Pro</th></tr></thead>
          <tbody>{ROWS.map(([f, a, b]) => (a === undefined
            ? <tr key={f} className="px-grp"><th colSpan={3}>{f}</th></tr>
            : <tr key={f}><td>{f}</td><td>{cell(a)}</td><td>{cell(b)}</td></tr>))}</tbody>
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
      {rows.length > 0 && (
        <section className="px-sec">
          <h2>Riwayat</h2>
          <div className="px-tw"><table>
            <thead><tr><th>Tanggal</th><th>Paket / sumber</th><th>Jumlah</th><th>Status</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.key}><td>{tgl(r.at)}</td><td>{r.name}</td><td>{r.amt}</td><td>{r.ref ? <span className="pk-tg">{r.st}</span> : r.st}</td></tr>
            ))}</tbody>
          </table></div>
        </section>
      )}
    </div>
  </>);
}
