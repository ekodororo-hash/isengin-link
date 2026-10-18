'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
const PAID = ['settlement', 'capture', 'paid', 'success'];
const stLabel = (s) => (PAID.includes(s) ? 'Lunas' : s === 'pending' ? 'Menunggu' : s === 'expire' ? 'Kedaluwarsa' : s === 'cancel' ? 'Dibatalkan' : s === 'failed' ? 'Gagal' : s);
const PLAN = { bulanan: '1 bulan', tahunan: '1 tahun' };
const Pill = ({ ok, children }) => <span className={'px-pill' + (ok ? ' ok' : ' no')}>{children}</span>;
const Row = ({ k, children, hint }) => (
  <div className="px-kv">
    <div><b>{k}</b>{hint && <small>{hint}</small>}</div>
    <div className="px-kv-v">{children}</div>
  </div>
);

export default function Pengaturan() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    fetch('/api/admin/pengaturan').then(async (r) => { const x = await r.json().catch(() => ({})); if (r.ok) setD(x); else setErr(x.error || 'Gagal memuat.'); });
  }, []);
  async function copy(t) { try { await navigator.clipboard.writeText(t); setNote('Tersalin.'); } catch { setNote('Salin manual.'); } setTimeout(() => setNote(''), 2000); }
  if (err) return (<><h1>Pengaturan</h1><p className="px-err" role="alert">{err}</p></>);
  if (!d) return (<><h1>Pengaturan</h1><Loader inline /></>);
  const { pay, dom } = d;
  return (<>
    <h1>Pengaturan</h1>
    <p className="px-sub">Status pembayaran dan domain kustom. Kunci rahasia disimpan di Vercel (Environment Variables), tidak ditampilkan di sini.</p>

    <div className="px-card">
      <section className="px-sec">
        <h2>Pembayaran (Midtrans)</h2>
        <p className="px-hint">Dipakai pengguna untuk membeli paket Pro. Kalau belum aktif, tombol bayar di halaman Paket tidak berfungsi.</p>
        <Row k="Status" hint="Aktif bila MIDTRANS_SERVER_KEY sudah diisi."><Pill ok={pay.ready}>{pay.ready ? 'Aktif' : 'Belum aktif'}</Pill></Row>
        <Row k="Mode" hint="Sandbox hanya untuk uji coba, tidak ada uang sungguhan. Ubah lewat MIDTRANS_IS_PRODUCTION."><Pill ok={pay.production}>{pay.production ? 'Produksi' : 'Sandbox (uji coba)'}</Pill></Row>
        {pay.plans.map((p) => <Row key={p.label} k={'Harga ' + p.label} hint="Ubah lewat PRO_PRICE_MONTH atau PRO_PRICE_YEAR.">{rp(p.price)}</Row>)}
        <Row k="Alamat notifikasi" hint="Tempel di dashboard Midtrans (Settings, Configuration, Payment Notification URL) supaya paket otomatis aktif setelah bayar.">
          <button type="button" className="px-btn g" onClick={() => copy(pay.webhook)}>Salin</button>
        </Row>
        <p className="px-url">{pay.webhook}</p>
        <div className="px-grid px-mini-g">
          <div className="px-card px-stat"><b>{pay.paid}</b><span>Lunas</span></div>
          <div className="px-card px-stat"><b>{pay.pending}</b><span>Menunggu</span></div>
          <div className="px-card px-stat"><b>{rp(pay.total)}</b><span>Total masuk</span></div>
        </div>
        <h3 className="px-h3">Pembayaran terbaru</h3>
        {pay.recent.length === 0 ? <p className="px-empty">Belum ada pembayaran.</p> : (
          <div className="px-tw"><table>
            <thead><tr><th>Tanggal</th><th>Pengguna</th><th>Paket</th><th>Jumlah</th><th>Status</th></tr></thead>
            <tbody>{pay.recent.map((x) => (
              <tr key={x.order_id}><td>{tgl(x.created_at)}</td><td>{x.username || '(dihapus)'}</td><td>{PLAN[x.plan] || x.plan}</td><td>{rp(x.amount)}</td><td>{stLabel(x.status)}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="px-sec">
        <h2>Domain kustom (Vercel)</h2>
        <p className="px-hint">Pengguna Pro bisa memakai domain sendiri untuk halamannya. Domain didaftarkan otomatis ke project Vercel.</p>
        <Row k="Status" hint="Aktif bila VERCEL_API_TOKEN dan VERCEL_PROJECT_ID sudah diisi."><Pill ok={dom.ready}>{dom.ready ? 'Aktif' : 'Belum aktif'}</Pill></Row>
        <Row k="Akun Vercel" hint="Isi VERCEL_TEAM_ID hanya bila project ada di Team."><Pill ok={true}>{dom.team ? 'Team' : 'Pribadi'}</Pill></Row>
        <h3 className="px-h3">Domain pengguna ({dom.list.length})</h3>
        {dom.list.length === 0 ? <p className="px-empty">Belum ada yang memasang domain.</p> : (
          <div className="px-tw"><table>
            <thead><tr><th>Domain</th><th>Pengguna</th><th>Status</th></tr></thead>
            <tbody>{dom.list.map((x) => (
              <tr key={x.custom_domain}><td>{x.custom_domain}</td><td>{x.username}</td><td>{x.domain_status === 'active' ? 'Aktif' : 'Menunggu DNS'}</td></tr>
            ))}</tbody>
          </table></div>
        )}
        <p className="px-hint">&quot;Menunggu DNS&quot; berarti pengguna belum mengarahkan domainnya sesuai petunjuk di halaman Domain mereka.</p>
      </section>
    </div>
    {note && <span role="status" className="px-msg">{note}</span>}
  </>);
}
