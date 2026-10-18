'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
import Link from 'next/link';
import ProModal from '../ProModal';
// Domain dua tingkat seperti toko.co.id tetap dianggap domain utama (butuh record A, bukan CNAME).
const SLD = ['co.id', 'or.id', 'web.id', 'my.id', 'sch.id', 'ac.id', 'go.id', 'biz.id', 'net.id', 'com.au', 'co.uk'];
const isApex = (d) => { const p = d.split('.'); return p.length === 2 || (p.length === 3 && SLD.includes(p.slice(1).join('.'))); };

export default function Domain() {
  const p = usePre('/api/domain');
  const [d, setD] = useState(p?.ok ? p.data : null);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [pm, setPm] = useState(null);
  const load = () => fetch('/api/domain').then((r) => (r.ok ? r.json() : null)).then((x) => { if (x) setD(x); });
  useEffect(() => { if (!p) load(); }, []);
  const post = async (body) => {
    const r = await fetch('/api/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { ok: r.ok, x: await r.json().catch(() => ({})) };
  };
  async function add(e) {
    e.preventDefault(); setBusy('add'); setMsg(null);
    const { ok, x } = await post({ mode: 'add', domain: val });
    if (ok) { setVal(''); setMsg({ t: 'Domain terpasang. Atur DNS di bawah, lalu klik Cek status.' }); await load(); } else setMsg({ t: x.error || 'Gagal memasang domain.', err: true });
    setBusy('');
  }
  async function check() {
    setBusy('check'); setMsg(null);
    const { ok, x } = await post({ mode: 'check' });
    if (!ok) setMsg({ t: x.error || 'Gagal mengecek.', err: true });
    else setMsg(x.status === 'active' ? { t: 'Domain aktif. Halamanmu sudah bisa dibuka lewat domain ini.' } : { t: 'Belum aktif. DNS bisa butuh beberapa menit sampai beberapa jam untuk menyebar. Coba cek lagi nanti.', err: true });
    await load(); setBusy('');
  }
  async function remove() {
    if (!confirm(`Lepas ${d.domain}? Halamanmu tidak bisa lagi dibuka lewat domain ini.`)) return;
    setBusy('del'); setMsg(null);
    await fetch('/api/domain', { method: 'DELETE' });
    await load(); setBusy('');
  }
  if (!d) return (<><h1>Domain</h1><Loader inline /></>);
  const apex = d.domain ? isApex(d.domain) : false;
  const sub = d.domain ? d.domain.split('.')[0] : '';
  return (<>
    <ProModal fitur={pm} onClose={() => setPm(null)} />
    <h1>Domain</h1>
    <p className="px-sub">Pakai domain sendiri untuk halamanmu, misalnya link.tokokamu.com.</p>
    <div className="px-card">
      {!d.pro && !d.domain && (
        <section className="px-sec">
          <h2>Khusus Pro</h2>
          <p className="px-hint">Domain kustom tersedia di paket Pro.</p>
          <button type="button" className="px-btn g" onClick={() => setPm('domain')}>Lihat keuntungan Pro</button>
        </section>
      )}
      {!d.ready && <p className="px-warn" role="status">Fitur domain belum dikonfigurasi oleh pemilik situs.</p>}
      {d.pro && !d.domain && (
        <section className="px-sec">
          <h2>Pasang domain</h2>
          <form onSubmit={add}>
            <label htmlFor="dom">Nama domain</label>
            <input id="dom" placeholder="link.tokokamu.com" value={val} maxLength={253} autoComplete="off" spellCheck={false} onChange={(e) => setVal(e.target.value)} />
            <p className="px-hint">Domain harus milikmu dan kamu bisa mengatur DNS-nya. Subdomain (link.tokokamu.com) paling mudah dan paling aman untuk situs lain yang sudah berjalan.</p>
            <div className="px-actions"><button className="px-btn" disabled={!d.ready || busy === 'add' || !val.trim()}>{busy === 'add' ? 'Memasang…' : 'Pasang domain'}</button></div>
          </form>
        </section>
      )}
      {d.domain && (
        <section className="px-sec">
          <h2>{d.domain} <span className={'px-tag' + (d.status === 'active' && d.pro ? '' : ' off')}>{!d.pro ? 'Paket berakhir' : d.status === 'active' ? 'Aktif' : 'Menunggu DNS'}</span></h2>
          {!d.pro && <p className="px-warn" role="status">Paket Pro-mu sudah berakhir, jadi domain ini tidak melayani halamanmu. <Link href="/dashboard/paket">Perpanjang</Link> untuk mengaktifkannya lagi.</p>}
          <p className="px-hint">Di pengaturan DNS domainmu, tambahkan satu record ini:</p>
          <div className="px-tw"><table>
            <thead><tr><th>Tipe</th><th>Nama</th><th>Nilai</th></tr></thead>
            <tbody>
              {apex
                ? <tr><td>A</td><td>@</td><td><code>{d.a}</code></td></tr>
                : <tr><td>CNAME</td><td>{sub}</td><td><code>{d.cname}</code></td></tr>}
            </tbody>
          </table></div>
          <p className="px-hint">{apex ? 'Domain utama memakai record A.' : 'Subdomain memakai CNAME.'} Kalau ragu, tanyakan ke penyedia domainmu. Setelah DNS diatur, klik Cek status. Sertifikat HTTPS dibuat otomatis.</p>
          <div className="px-actions">
            <button className="px-btn" onClick={check} disabled={busy === 'check' || !d.ready}>{busy === 'check' ? 'Mengecek…' : 'Cek status'}</button>
            <button className="px-btn d" onClick={remove} disabled={busy === 'del'}>Lepas domain</button>
          </div>
        </section>
      )}
      {msg && <p role="status" className={'px-msg' + (msg.err ? ' err' : '')}>{msg.t}</p>}
    </div>
  </>);
}
