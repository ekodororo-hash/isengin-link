'use client';
import { useDash } from './DashContext';
import { DailyChart, LinkRank } from './parts';
import { SOURCES } from '@/lib/source';
import Langkah from './Langkah';
export default function Ringkasan() {
  const { m } = useDash();
  const tot = m.links.reduce((a, l) => a + (l.clicks || 0), 0);
  const src = m.sources || [];
  const smx = Math.max(1, ...src.map((x) => x.clicks));
  return (<>
    <h1>Ringkasan</h1>
    <p className="px-sub"><a href={`/${m.username}`} target="_blank">isengin.site/{m.username}</a></p>
    <Langkah />
    <div className="px-grid">
      <div className="px-card px-stat"><b>{tot}</b><span>Total klik</span></div>
      <div className="px-card px-stat"><b>{m.links.filter((l) => !l.hidden && l.kind !== 'header').length}</b><span>Link tampil</span></div>
      <div className="px-card px-stat"><b>{m.views || 0}</b><span>Kunjungan</span></div>
    </div>
    <DailyChart daily={m.daily} />
    <LinkRank />
    <div className="px-card px-mt">
      <div className="px-ch-head"><b>Asal klik</b><span className="px-hint-i">30 hari terakhir</span></div>
      {src.length ? <div className="px-srcs">{src.map((x) => (
        <div className="px-src" key={x.src}><span>{SOURCES[x.src] || x.src}</span><b>{x.clicks}</b><i style={{ width: Math.max(4, (x.clicks / smx) * 100) + '%' }} /></div>
      ))}</div> : <p className="px-empty">Belum ada data.</p>}
      <p className="px-hint">Klik dari WhatsApp sering muncul sebagai &quot;Langsung&quot;. Supaya terbaca sebagai WhatsApp, tambahkan <code>?src=whatsapp</code> di belakang link saat kamu bagikan.</p>
      <p className="px-hint">Contoh: isengin.site/{m.username}?src=whatsapp. Ganti &quot;whatsapp&quot; dengan instagram, tiktok, facebook, youtube, atau telegram sesuai tempat kamu membagikannya.</p>
    </div>
  </>);
}
