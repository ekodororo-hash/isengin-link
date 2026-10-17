'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
const NAMA = { penipuan: 'Penipuan / phishing', dewasa: 'Konten dewasa', kekerasan: 'Kekerasan / kebencian', tiruan: 'Menyamar', spam: 'Spam', lainnya: 'Lainnya' };

export default function Laporan() {
  const p = usePre('/api/admin/laporan');
  const [r, setR] = useState(p?.ok ? p.data : null);
  const [err, setErr] = useState(p && !p.ok ? p.data?.error || 'Gagal memuat.' : '');
  const [busy, setBusy] = useState(0);
  const load = () => fetch('/api/admin/laporan').then(async (res) => { const x = await res.json().catch(() => ({})); if (res.ok) { setR(x); setErr(''); } else setErr(x.error || 'Gagal memuat.'); });
  useEffect(() => { if (!p) load(); }, []);
  async function act(id, action, text) {
    if (!confirm(text)) return;
    setBusy(id);
    const res = await fetch('/api/admin/laporan', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    if (!res.ok) alert((await res.json().catch(() => ({}))).error || 'Gagal menyimpan keputusan.');
    await load();
    setBusy(0);
  }
  if (err) return (<><h1>Laporan</h1><p className="px-err" role="alert">{err}</p></>);
  if (!r) return (<><h1>Laporan</h1><Loader inline /></>);
  return (<>
    <h1>Laporan</h1>
    <p className="px-sub">Halaman yang dilaporkan pengunjung dan belum ditangani. Buka halamannya dulu sebelum memutuskan.</p>
    {r.groups.length === 0 && <div className="px-card"><p className="adm-empty">Tidak ada laporan yang menunggu.</p></div>}
    {r.groups.map((g) => (
      <div className="px-card adm-req" key={g.id}>
        <a href={`/${g.username}`} target="_blank" rel="noopener noreferrer"><b>isengin.site/{g.username}</b></a>
        {!g.active && <span className="px-tag off">Nonaktif</span>}
        <span className="adm-sm">{g.total} laporan · terakhir {tgl(g.last_at)}</span>
        <div className="adm-grp">{g.reasons.map((x) => <span className="px-tag" key={x.reason}>{NAMA[x.reason] || x.reason} · {x.n}</span>)}</div>
        {g.items.filter((x) => x.detail).map((x, i) => <blockquote className="adm-note" key={i}>{x.detail}</blockquote>)}
        <div className="px-cell-act">
          {g.active && <button className="px-btn d sm" disabled={busy === g.id} onClick={() => act(g.id, 'deactivate', `Nonaktifkan halaman ${g.username}? Halaman publiknya langsung disembunyikan.`)}>Nonaktifkan halaman</button>}
          <button className="px-btn g sm" disabled={busy === g.id} onClick={() => act(g.id, 'dismiss', `Abaikan semua laporan untuk ${g.username}?`)}>Abaikan laporan</button>
        </div>
      </div>
    ))}
  </>);
}
