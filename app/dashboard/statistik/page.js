'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDash } from '../DashContext';
import { DailyChart, LinkRank } from '../parts';
import ProModal from '../ProModal';
import { SOURCES } from '@/lib/source';

const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const tgl = (d) => `${+d.slice(8)} ${BLN[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
const back = (s, n) => new Date(Date.parse(s + 'T00:00:00Z') - n * 86400000).toISOString().slice(0, 10);
// Gratis: 7 dan 30 hari. Pro: ditambah 90 hari, Semua, dan tanggal sendiri (maks 1 tahun). Batas ini juga dijaga di /api/statistik.
const OPTS = [['7', '7 hari', false], ['30', '30 hari', false], ['90', '90 hari', true], ['all', 'Semua', true], ['custom', 'Pilih tanggal', true]];
const FIX = OPTS.filter((o) => !o[2]); // tombol langsung
const MORE = OPTS.filter((o) => o[2]); // masuk menu "⋯"
const SHORT = { '90': '90 hari', all: 'Semua', custom: 'Tanggal' };

export default function Statistik() {
  const { m } = useDash();
  // 7, 30, 90 hari: data diambil sekali saat halaman dibuka (Pro 90 hari, Gratis 30 hari), lalu dipotong di browser.
  // Hanya "Semua" dan "Pilih tanggal" yang memanggil /api/statistik lagi.
  const [sel, setSel] = useState({ range: '30' });
  const [base, setBase] = useState(null);
  const [ext, setExt] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [pm, setPm] = useState(null);
  const [cf, setCf] = useState('');
  const [ct, setCt] = useState('');
  const [tick, setTick] = useState(0);
  const [menu, setMenu] = useState(false);
  const moreRef = useRef(null);
  const seq = useRef(0);
  const baseRange = m.pro ? '90' : '30';
  const fixed = ['7', '30', '90'].includes(sel.range);
  const inMore = MORE.some(([v]) => v === sel.range);

  // Sekali per kunjungan: data dasar untuk 7/30/90 hari.
  useEffect(() => {
    let off = false;
    setErr('');
    fetch('/api/statistik?range=' + baseRange)
      .then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
      .then(({ ok, j }) => { if (off) return; if (ok) setBase(j); else setErr(j.error || 'Gagal memuat statistik.'); })
      .catch(() => { if (!off) setErr('Gagal memuat. Periksa koneksi, lalu coba lagi.'); });
    return () => { off = true; };
  }, [baseRange, tick]);

  // Hanya untuk "Semua" dan tanggal kustom.
  useEffect(() => {
    const n = ++seq.current;
    if (fixed) { setBusy(false); return; }
    setBusy(true); setErr('');
    const qs = new URLSearchParams({ range: sel.range, ...(sel.range === 'custom' ? { from: sel.from, to: sel.to } : {}) });
    fetch('/api/statistik?' + qs)
      .then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
      .then(({ ok, j }) => { if (n !== seq.current) return; if (ok) setExt(j); else setErr(j.error || 'Gagal memuat statistik.'); })
      .catch(() => { if (n === seq.current) setErr('Gagal memuat. Periksa koneksi, lalu coba lagi.'); })
      .finally(() => { if (n === seq.current) setBusy(false); });
  }, [sel, fixed]);

  // Menu rentang lainnya: tutup saat ketuk di luar atau tekan Esc.
  useEffect(() => {
    if (!menu) return;
    const down = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMenu(false); };
    const key = (e) => { if (e.key === 'Escape') setMenu(false); };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [menu]);

  const pick = (v) => {
    setMenu(false);
    if (v !== '7' && v !== '30' && !m.pro) { setPm('stat'); return; }
    setErr('');
    if (['7', '30', '90'].includes(v)) {
      if (!base) setTick((t) => t + 1); // data dasar belum ada (mis. gagal dimuat tadi): coba lagi
      setSel({ range: v });
      return;
    }
    if (v === 'all') { if (sel.range !== 'all') setSel({ range: 'all' }); return; }
    const meta = base || ext;
    const to = meta?.today || '';
    const from = to ? (back(to, 29) < meta.min_day ? meta.min_day : back(to, 29)) : '';
    setCf(from); setCt(to);
    setSel({ range: 'custom', from, to });
  };
  const apply = () => {
    if (!cf || !ct) { setErr('Isi tanggal mulai dan tanggal akhir.'); return; }
    if (cf > ct) { setErr('Tanggal mulai harus sebelum tanggal akhir.'); return; }
    setSel({ range: 'custom', from: cf, to: ct });
  };

  // Data yang ditampilkan: untuk 7/30/90 dipotong dari data dasar, untuk Semua/kustom langsung dari server.
  const d = useMemo(() => {
    const b = fixed ? base : ext;
    if (!b) return null;
    const daily = fixed ? b.daily.slice(-Math.min(+sel.range, b.daily.length)) : b.daily;
    const from = daily[0]?.day || b.from;
    const link_days = (b.link_days || []).filter((r) => r.day >= from);
    const bySrc = {};
    for (const r of b.source_days || []) if (r.day >= from) bySrc[r.src] = (bySrc[r.src] || 0) + r.clicks;
    const sources = Object.entries(bySrc).map(([src, clicks]) => ({ src, clicks })).sort((a, c) => c.clicks - a.clicks);
    return { ...b, range: fixed ? sel.range : b.range, from, daily, link_days, sources };
  }, [fixed, base, ext, sel.range]);

  const daily = d?.daily || [];
  const days = daily.map((r) => r.day);
  const sources = d?.sources || [];
  const smx = Math.max(1, ...sources.map((x) => x.clicks));
  const label = !d ? '' : ['7', '30', '90'].includes(d.range) ? `dalam ${d.range} hari terakhir` : `pada ${tgl(d.from)} sampai ${tgl(d.to)}`;

  return (<>
    <ProModal fitur={pm} onClose={() => setPm(null)} />
    <h1>Statistik</h1>
    <p className="px-sub">Klik, kunjungan, peringkat link, dan asal klik pada rentang waktu yang dipilih.</p>
    <div className="px-card px-chartcard">
      <div className="px-ch-head">
        <b>Rentang waktu</b>
        <div className="px-seg px-seg-range" role="group" aria-label="Rentang waktu">
          {FIX.map(([v, t]) => <button key={v} aria-pressed={sel.range === v} onClick={() => pick(v)}>{t}</button>)}
          <div className="px-more" ref={moreRef}>
            <button className="px-more-btn" aria-haspopup="menu" aria-expanded={menu} aria-pressed={inMore} aria-label="Rentang lainnya" onClick={() => setMenu((o) => !o)}>
              {inMore
                ? <><span className="px-more-lbl">{SHORT[sel.range]}</span><span className="px-caret" /></>
                : <span className="px-more-dots"><span /><span /><span /></span>}
            </button>
            {menu && (
              <div className="px-menu" role="menu">
                {MORE.map(([v, t]) => <button key={v} role="menuitemradio" aria-checked={sel.range === v} onClick={() => pick(v)}>{t}{!m.pro && <span className="px-pro-tag">Pro</span>}</button>)}
              </div>
            )}
          </div>
        </div>
      </div>
      {sel.range === 'custom' && (
        <div className="px-dates">
          <div><label htmlFor="st-from">Dari</label><input id="st-from" type="date" value={cf} min={d?.min_day} max={ct || d?.today} onChange={(e) => setCf(e.target.value)} /></div>
          <div><label htmlFor="st-to">Sampai</label><input id="st-to" type="date" value={ct} min={cf || d?.min_day} max={d?.today} onChange={(e) => setCt(e.target.value)} /></div>
          <button className="px-btn" onClick={apply} disabled={busy}>Terapkan</button>
        </div>
      )}
      {d && ['all', 'custom'].includes(sel.range) && <p className="px-ch-sum">Statistik harian tercatat sejak {tgl(d.min_day)}. Rentang tanggal paling lama 1 tahun.</p>}
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
