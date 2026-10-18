'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
const J = { 'Content-Type': 'application/json' };

export default function Pengumuman() {
  const pre = usePre('/api/admin/pengumuman');
  const [items, setItems] = useState(pre?.ok ? pre.data?.items || [] : null);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [level, setLevel] = useState('pengumuman');
  const [busy, setBusy] = useState(false);
  const load = () => fetch('/api/admin/pengumuman').then(async (r) => { const x = await r.json().catch(() => ({})); if (r.ok) { setItems(x.items); setErr(''); } else setErr(x.error || 'Gagal memuat.'); });
  useEffect(() => { if (!pre) load(); }, []);
  async function call(method, body, okMsg) {
    setBusy(true); setErr('');
    const r = await fetch('/api/admin/pengumuman', { method, headers: J, body: JSON.stringify(body) });
    if (!r.ok) setErr((await r.json().catch(() => ({}))).error || 'Gagal menyimpan.'); else okMsg?.();
    await load();
    setBusy(false);
  }
  const latest = items?.find((x) => x.active)?.id;
  if (items === null && !err) return (<><h1>Pengumuman</h1><Loader inline /></>);
  return (<>
    <h1>Pengumuman</h1>
    <p className="px-sub">Banner di dashboard semua pengguna. Hanya pengumuman aktif yang paling baru yang tampil. Pengguna bisa menutupnya, dan pengumuman baru muncul lagi.</p>
    {err && <p className="px-err" role="alert">{err}</p>}
    <div className="px-card">
      <section className="px-sec">
        <h2>Buat pengumuman</h2>
        <label htmlFor="ann-t">Isi (maks. 280 karakter)</label>
        <textarea id="ann-t" rows={3} maxLength={280} value={text} onChange={(e) => setText(e.target.value)} placeholder="mis. Diskon Pro 20% sampai Minggu. Buka menu Paket." />
        <div className="px-chips" role="group" aria-label="Jenis pengumuman">
          {[['pengumuman', 'Pengumuman'], ['info', 'Info'], ['penting', 'Penting']].map(([v, t]) => <button key={v} type="button" aria-pressed={level === v} onClick={() => setLevel(v)}>{t}</button>)}
        </div>
        <div className="px-actions">
          <button className="px-btn" disabled={busy || text.trim().length < 3} onClick={() => call('POST', { text, level }, () => setText(''))}>Terbitkan</button>
        </div>
      </section>
    </div>
    <div className="px-card">
      <section className="px-sec">
        <h2>Riwayat</h2>
        {items?.length === 0 && <p className="adm-empty">Belum ada pengumuman.</p>}
        {items?.map((x) => (
          <div className="adm-req" key={x.id}>
            <span className={'px-tag' + (x.level === 'penting' ? ' off' : '')}>{x.level === 'penting' ? 'Penting' : x.level === 'pengumuman' ? 'Pengumuman' : 'Info'}</span>
            {x.id === latest && <span className="px-tag">Sedang tampil</span>}
            {!x.active && <span className="px-tag">Disembunyikan</span>}
            <span className="adm-sm">{tgl(x.created_at)}</span>
            <p>{x.text}</p>
            <div className="px-cell-act">
              <button className="px-btn g sm" disabled={busy} onClick={() => call('PATCH', { id: x.id, active: !x.active })}>{x.active ? 'Sembunyikan' : 'Aktifkan'}</button>
              <button className="px-btn d sm" disabled={busy} onClick={() => confirm('Hapus pengumuman ini?') && call('PATCH', { id: x.id, remove: true })}>Hapus</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  </>);
}
