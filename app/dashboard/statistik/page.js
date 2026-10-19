'use client';
import { useEffect, useRef, useState } from 'react';
import { useDash } from '../DashContext';
import { DailyChart, LinkRank } from '../parts';
import ProModal from '../ProModal';
import { SOURCES } from '@/lib/source';

const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const tgl = (d) => `${+d.slice(8)} ${BLN[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
const back = (s, n) => new Date(Date.parse(s + 'T00:00:00Z') - n * 86400000).toISOString().slice(0, 10);
// Gratis: 7 dan 30 hari. Pro: ditambah 90 hari, Semua, dan tanggal sendiri (maks 1 tahun). Batas ini juga dijaga di /api/statistik.
const OPTS = [['7', '7 hari', false], ['30', '30 hari', false], ['90', '90 hari', true], ['all', 'Semua', true], ['custom', 'Pilih tanggal', true]];

export default function Statistik() {
  const { m } = useDash();
  const [req, setReq] = useState({ range: '30' });
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [pm, setPm] = useState(null);
  const [cf, setCf] = useState('');
  const [ct, setCt] = useState('');
  const seq = useRef(0);

  useEffect(() => {
    const n = ++seq.current;
    setBusy(true); setErr('');
    const qs = new URLSearchParams({ range: req.range, ...(req.range === 'custom' ? { from: req.from, to: req.to } : {}) });
    fetch('/api/statistik?' + qs)
      .then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
      .then(({ ok, j }) => { if (n !== seq.current) return; if (ok) setD(j); else setErr(j.error || 'Gagal memuat statistik.'); })
      .catch(() => { if (n === seq.current) setErr('Gagal memuat. Periksa koneksi, lalu coba lagi.'); })
      .finally(() => { if (n === seq.current) setBusy(false); });
  }, [req]);

  const pick = (v) => {
    if (v !== '7' && v !== '30' && !m.pro) { setPm('stat'); return; }
    if (v === 'custom') {
      const to = d?.today || '';
      const from = to ? (back(to, 29) < d.min_day ? d.min_day : back(to, 29)) : '';
      setCf(from); setCt(to);
      setReq({ range: 'custom', from, to });
      return;
    }
    setReq({ range: v });
  };
  const apply = () => {
    if (!cf || !ct) { setErr('Isi tanggal mulai dan tanggal akhir.'); return; }
    if (cf > ct) { setErr('Tanggal mulai harus sebelum tanggal akhir.'); return; }
    setReq({ range: 'custom', from: cf, to: ct });
  };

  const daily = d?.daily || [];
  const days = daily.map((r) => r.day);
  const sources = d?.sources || [];
  const smx = Math.max(1, ...sources.map((x) => x.clicks));
  const label = !d ? '' : ['7', '30', '90'].includes(d.range) ? `dalam ${d.range} hari terakhir` : `pada ${tgl(d.from)} sampai ${tgl(d.to)}`;

  return (<>
    <ProModal fitur={pm} onClose={() => setPm(null)} />
    <h1>Statistik</h1>
    <p className="px-sub">Klik, kunjungan, peringkat link, dan asal klik untuk rentang waktu pilihanmu.</p>
    <div className="px-card px-chartcard">
      <div className="px-ch-head">
        <b>Rentang waktu</b>
        <div className="px-seg" role="group" aria-label="Rentang waktu">
          {OPTS.map(([v, t, onlyPro]) => <button key={v} aria-pressed={req.range === v} onClick={() => pick(v)}>{onlyPro && !m.pro ? `${t} · Pro` : t}</button>)}
        </div>
      </div>
      {req.range === 'custom' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginTop: 14 }}>
          <div><label htmlFor="st-from">Dari</label><input id="st-from" type="date" value={cf} min={d?.min_day} max={ct || d?.today} onChange={(e) => setCf(e.target.value)} /></div>
          <div><label htmlFor="st-to">Sampai</label><input id="st-to" type="date" value={ct} min={cf || d?.min_day} max={d?.today} onChange={(e) => setCt(e.target.value)} /></div>
          <button className="px-btn" onClick={apply} disabled={busy}>Terapkan</button>
        </div>
      )}
      {!m.pro && <p className="px-ch-sum">Gratis: 7 dan 30 hari. Pro menambah 90 hari, semua data, dan pilih tanggal sendiri.</p>}
      {d && ['all', 'custom'].includes(req.range) && <p className="px-ch-sum">Statistik harian tercatat sejak {tgl(d.min_day)}. Rentang tanggal paling lama 1 tahun.</p>}
      {err && <p className="px-warn" role="alert">{err}</p>}
    </div>
    {!d && !err && <p className="px-empty" role="status">Memuat…</p>}
    {d && (<div aria-busy={busy} style={{ opacity: busy ? 0.6 : 1 }}>
      <DailyChart key={d.range} daily={daily} label={label} />
      <LinkRank days={days} linkDays={d.link_days || []} label={label} />
      <div className="px-card px-mt">
        <div className="px-ch-head"><b>Asal klik</b><span className="px-hint-i">{label}</span></div>
        {sources.length ? <div className="px-srcs">{sources.map((x) => (
          <div className="px-src" key={x.src}><span>{SOURCES[x.src] || x.src}</span><b>{x.clicks}</b><i style={{ width: Math.max(4, (x.clicks / smx) * 100) + '%' }} /></div>
        ))}</div> : <p className="px-empty">Belum ada data.</p>}
      </div>
    </div>)}
  </>);
}
