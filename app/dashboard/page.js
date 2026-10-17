'use client';
import { useDash } from './DashContext';
import { DailyChart } from './parts';
import { SOURCES } from '@/lib/source';
export default function Ringkasan() {
  const { m } = useDash();
  const tot = m.links.reduce((a, l) => a + (l.clicks || 0), 0);
  const mx = Math.max(1, ...m.links.map((l) => l.clicks || 0));
  const src = m.sources || [];
  const smx = Math.max(1, ...src.map((x) => x.clicks));
  return (<>
    <h1>Ringkasan</h1>
    <p className="px-sub"><a href={`/${m.username}`} target="_blank">isengin.site/{m.username}</a></p>
    <div className="px-grid">
      <div className="px-card px-stat"><b>{tot}</b><span>Total klik</span></div>
      <div className="px-card px-stat"><b>{m.links.filter((l) => !l.hidden).length}</b><span>Link tampil</span></div>
      <div className="px-card px-stat"><b>{m.views || 0}</b><span>Kunjungan halaman</span></div>
    </div>
    <DailyChart daily={m.daily} />
    <div className="px-card"><b>Klik per link</b>
      {m.links.map((l, i) => (
        <div className="px-bar" key={l.id || i}><span>{l.title}{l.hidden ? ' (tersembunyi)' : ''}</span><i style={{ width: Math.max(4, ((l.clicks || 0) / mx) * 100) + '%' }} /><b>{l.clicks || 0}</b></div>
      ))}
    </div>
    <div className="px-card px-mt"><b>Asal klik</b> <span className="px-hint-i">30 hari terakhir</span>
      {src.length ? src.map((x) => (
        <div className="px-bar" key={x.src}><span>{SOURCES[x.src] || x.src}</span><i style={{ width: Math.max(4, (x.clicks / smx) * 100) + '%' }} /><b>{x.clicks}</b></div>
      )) : <p className="px-empty">Belum ada data. Asal klik mulai tercatat sejak fitur ini dipasang.</p>}
      <p className="px-hint">Klik dari WhatsApp dan beberapa aplikasi lain sering tercatat sebagai &quot;Langsung / tidak diketahui&quot; karena aplikasinya tidak mengirim asal pengunjung. Supaya terhitung, tambahkan <code>?src=whatsapp</code> di akhir link saat dibagikan, misalnya isengin.site/{m.username}?src=whatsapp. Nama lain yang dikenali: instagram, tiktok, facebook, youtube, x, telegram, threads, linkedin.</p>
    </div>
  </>);
}
