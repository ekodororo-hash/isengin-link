'use client';
import { useDash } from './DashContext';
import { SOURCES } from '@/lib/source';
import Langkah from './Langkah';

const sel = (a, b) => (a === b ? 'sama seperti kemarin' : `${a > b ? '+' : '−'}${Math.abs(a - b)} dari kemarin`);
export default function Ringkasan() {
  const { m } = useDash();
  const links = m.links.filter((l) => (l.kind || 'link') === 'link');
  const shown = links.filter((l) => !l.hidden).length;
  const tot = links.reduce((a, l) => a + (l.clicks || 0), 0);
  const views = m.views || 0;
  // daily: 30 hari terakhir, hari ini di urutan terakhir.
  const daily = m.daily || [];
  const t = daily[daily.length - 1] || { clicks: 0, views: 0 }, y = daily[daily.length - 2] || { clicks: 0, views: 0 };
  const c30 = daily.reduce((a, r) => a + r.clicks, 0);
  const best = links.reduce((a, l) => ((l.clicks || 0) > (a?.clicks || 0) ? l : a), null);
  const top = (m.sources || [])[0];
  const left = m.pro && m.plan_until ? Math.max(0, Math.ceil((new Date(m.plan_until) - Date.now()) / 86400000)) : 0;
  const Card = ({ n, v, sub, txt }) => (<div className={'px-card px-stat' + (txt ? ' px-txt' : '')}><b>{v}</b><span>{n}</span>{sub && <small>{sub}</small>}</div>);
  return (<>
    <h1>Ringkasan</h1>
    <p className="px-sub"><a href={`/${m.username}`} target="_blank">isengin.site/{m.username}</a></p>
    <Langkah />
    <div className="px-grid">
      <Card n="Total klik" v={tot} sub="sejak awal" />
      <Card n="Kunjungan" v={views} sub="sejak awal" />
      <Card n="Link tampil" v={`${shown} dari ${links.length}`} />
      <Card n="Link tersembunyi" v={links.length - shown} />
      <Card n="Klik hari ini" v={t.clicks} sub={sel(t.clicks, y.clicks)} />
      <Card n="Kunjungan hari ini" v={t.views} sub={sel(t.views, y.views)} />
      <Card n="Klik 30 hari terakhir" v={c30} />
      <Card n="Link terlaris" txt v={best && best.clicks ? best.title : '–'} sub={best && best.clicks ? `${best.clicks} klik sejak awal` : 'Belum ada klik'} />
      <Card n="Rasio klik" v={views ? Math.round((tot / views) * 100) + '%' : '–'} sub="klik dibagi kunjungan" />
      <Card n="Asal teratas" txt v={top ? SOURCES[top.src] || top.src : '–'} sub={top ? `${top.clicks} klik, 30 hari` : 'Belum ada data'} />
      {m.pro
        ? <Card n="Sisa Pro" txt v={`${left} hari lagi`} />
        : <Card n="Paket" txt v="Gratis" sub={<a href="/dashboard/paket">Lihat paket Pro</a>} />}
    </div>
    <a className="px-btn" href="/dashboard/statistik">Lihat statistik lengkap</a>
  </>);
}
