'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
import { rp, tgl, Pill, Field, Secret, From } from '../Bits';
const J = { 'Content-Type': 'application/json' };
const ST = { paid: 'Lunas', pending: 'Menunggu', failed: 'Gagal', expire: 'Kedaluwarsa', cancel: 'Dibatalkan', deny: 'Ditolak' };
const PLAN = { bulanan: '1 bulan', tahunan: '1 tahun' };

export default function Pembayaran() {
  const pre = usePre('/api/admin/pembayaran');
  const x0 = pre?.ok ? pre.data : null;
  const [d, setD] = useState(x0);
  const [err, setErr] = useState(pre && !pre.ok ? pre.data?.error || 'Gagal memuat.' : '');
  const [key, setKey] = useState('');
  const [prod, setProd] = useState(x0 ? x0.production : false);
  const [month, setMonth] = useState(x0 ? String(x0.month) : ''), [year, setYear] = useState(x0 ? String(x0.year) : '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const fill = (x) => { setD(x); setProd(x.production); setMonth(String(x.month)); setYear(String(x.year)); setKey(''); };
  useEffect(() => {
    if (pre) return;
    fetch('/api/admin/pembayaran').then(async (r) => { const x = await r.json().catch(() => ({})); if (r.ok) fill(x); else setErr(x.error || 'Gagal memuat.'); });
  }, []);
  async function save(e, extra = {}) {
    e?.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch('/api/admin/pembayaran', { method: 'PUT', headers: J, body: JSON.stringify({ key, production: prod, month: Number(month), year: Number(year), ...extra }) });
    const x = await r.json().catch(() => ({}));
    if (r.ok) { fill(x); setMsg({ t: 'Tersimpan.' }); } else setMsg({ t: x.error || 'Gagal menyimpan.', err: true });
    setBusy(false);
  }
  async function copy(t) { try { await navigator.clipboard.writeText(t); setMsg({ t: 'Alamat tersalin.' }); } catch { setMsg({ t: 'Salin manual.', err: true }); } }
  if (err) return (<><h1>Pembayaran</h1><p className="px-err" role="alert">{err}</p></>);
  if (!d) return (<><h1>Pembayaran</h1><Loader inline /></>);
  return (<>
    <h1>Pembayaran</h1>
    <p className="px-sub">Midtrans untuk pembelian paket Pro. Perubahan langsung berlaku.</p>
    <div className="px-card">
      <section className="px-sec">
        <h2>Pengaturan <Pill ok={d.ready}>{d.ready ? 'Aktif' : 'Belum aktif'}</Pill></h2>
        <form onSubmit={save}>
          <Field id="mk" label={<>Server key <From f={d.key.from} /></>} hint="Dari dashboard Midtrans, menu Settings lalu Access Keys. Tanpa ini tombol bayar tidak berfungsi.">
            <Secret id="mk" value={key} onChange={(e) => setKey(e.target.value)} placeholder={d.key.set ? `Tersimpan (${d.key.value}). Kosongkan jika tidak diubah` : 'SB-Mid-server-…'} />
          </Field>
          <Field label="Mode" hint="Sandbox hanya uji coba tanpa uang sungguhan. Pilih Produksi kalau server key di atas adalah key produksi.">
            <div className="px-seg" role="group" aria-label="Mode">
              {[[false, 'Sandbox'], [true, 'Produksi']].map(([v, t]) => <button type="button" key={t} aria-pressed={prod === v} onClick={() => setProd(v)}>{t}</button>)}
            </div>
          </Field>
          <Field id="pm" label="Harga 1 bulan (Rp)" hint="Berlaku untuk pembelian berikutnya.">
            <input id="pm" inputMode="numeric" value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))} required />
          </Field>
          <Field id="py" label="Harga 1 tahun (Rp)">
            <input id="py" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} required />
          </Field>
          <div className="px-actions">
            <button className="px-btn" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</button>
            {d.key.from === 'admin' && <button type="button" className="px-btn g" disabled={busy} onClick={() => save(null, { clearKey: true })}>Hapus key tersimpan</button>}
            {msg && <span role="status" className={'px-msg' + (msg.err ? ' err' : '')}>{msg.t}</span>}
          </div>
        </form>
      </section>

      <section className="px-sec">
        <h2>Alamat notifikasi</h2>
        <p className="px-hint">Tempel di Midtrans: Settings, Configuration, Payment Notification URL. Dengan ini paket pengguna otomatis aktif setelah bayar.</p>
        <p className="px-url">{d.webhook}</p>
        <div className="px-actions"><button type="button" className="px-btn g" onClick={() => copy(d.webhook)}>Salin alamat</button></div>
      </section>

      <section className="px-sec">
        <h2>Ringkasan</h2>
        <div className="px-grid px-mini-g">
          <div className="px-card px-stat"><b>{d.paid}</b><span>Lunas</span></div>
          <div className="px-card px-stat"><b>{d.pending}</b><span>Menunggu</span></div>
          <div className="px-card px-stat"><b>{rp(d.total)}</b><span>Total masuk</span></div>
        </div>
        <h3 className="px-h3">Pembayaran terbaru</h3>
        {d.recent.length === 0 ? <p className="px-empty">Belum ada pembayaran.</p> : (
          <div className="px-tw"><table>
            <thead><tr><th>Tanggal</th><th>Pengguna</th><th>Paket</th><th>Jumlah</th><th>Status</th></tr></thead>
            <tbody>{d.recent.map((x) => (
              <tr key={x.order_id}><td>{tgl(x.created_at)}</td><td>{x.username || '(dihapus)'}</td><td>{PLAN[x.plan] || x.plan}</td><td>{rp(x.amount)}</td><td>{ST[x.status] || x.status}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </div>
  </>);
}
