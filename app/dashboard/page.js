'use client';
import { useDash } from './DashContext';
export default function Ringkasan() {
  const { m } = useDash();
  const tot = m.links.reduce((a, l) => a + (l.clicks || 0), 0);
  const mx = Math.max(1, ...m.links.map((l) => l.clicks || 0));
  return (<>
    <h1>Ringkasan</h1>
    <p className="px-sub"><a href={`/${m.username}`} target="_blank">isengin.site/{m.username}</a></p>
    <div className="px-grid">
      <div className="px-card px-stat"><b>{tot}</b><span>Total klik</span></div>
      <div className="px-card px-stat"><b>{m.links.length}</b><span>Link aktif</span></div>
      <div className="px-card px-stat"><b>{m.views || 0}</b><span>Kunjungan halaman</span></div>
    </div>
    <div className="px-card"><b>Klik per link</b>
      {m.links.map((l, i) => (
        <div className="px-bar" key={i}><span>{l.title}</span><i style={{ width: Math.max(4, ((l.clicks || 0) / mx) * 100) + '%' }} /><b>{l.clicks || 0}</b></div>
      ))}
    </div>
  </>);
}
