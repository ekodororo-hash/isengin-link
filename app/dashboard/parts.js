'use client';
import { useEffect, useState } from 'react';
import ProModal from './ProModal';
import { useDash } from './DashContext';
import { LinkIcon, NamedIcon } from '../icons';
import { themeStyle, bgStyle } from '@/lib/themes';
import Verified from '../Verified';
import { socialList } from '@/lib/socials';
import { fmtPrice, labelText } from '@/lib/catalog';
import { fontCss } from '@/lib/style';
import { effectiveLook, thumbOk } from '@/lib/pro';

// Pratinjau: di desktop tampil di samping form. Di HP berupa tombol melayang "Pratinjau" yang membuka lembar pratinjau, jadi tidak perlu scroll ke bawah.
export function PreviewDock({ children }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div className={'px-pvd' + (open ? ' open' : '')}>
      <button type="button" className="px-pvb" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? 'Tutup' : 'Pratinjau'}</button>
      <div className="px-pvs" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>{children}</div>
    </div>
  );
}

// trial: pilihan Pro yang dicoba pengguna gratis. Hanya tampil di pratinjau, tidak disimpan dan tidak tampil di halaman publik.
export function Phone({ trial }) {
  const { m } = useDash();
  // Pratinjau sama persis dengan halaman publik: pilihan Pro tidak tampil kalau paketnya tidak aktif.
  const eff = { ...effectiveLook({ theme: m.theme, font_key: m.font_key || 'standar', btn_style: m.btn_style || 'bulat', colors: m.colors, bg: m.bg }, m.pro), ...(m.pro ? {} : trial || {}) };
  const vis = m.links.filter((l) => !l.hidden);
  const n = m.display_name || m.username;
  const soc = socialList(m.socials);
  return (
    <div className="px-ph" data-t={eff.theme} data-b={eff.btn_style} style={{ ...themeStyle(eff.theme, eff.colors), ...bgStyle(eff.bg, eff.theme, eff.colors), '--pfont': fontCss(eff.font_key) }}>
      {m.photo_url ? <img className="a" src={m.photo_url} alt="" /> : <div className="a">{n[0].toUpperCase()}</div>}
      <h3>{n}{m.verified && <Verified size={14} />}</h3><p>{m.bio}</p>
      {soc.length > 0 && <div className="so">{soc.map((x) => <span className="s" key={x.key}><NamedIcon name={x.key} size={14} /></span>)}</div>}
      {vis.map((l, i) => {
        if (l.kind === 'header') return <div className="hd" key={l.id || l._k || i}><span>{l.title || 'Judul pembatas'}</span></div>;
        const price = fmtPrice(l.price), old = fmtPrice(l.old_price);
        const th = thumbOk(vis, i, m.pro) ? l.thumb : '';
        return (
          <div className={'l' + (price || old ? ' cat' : '') + (l.label === 'habis' ? ' soldout' : '') + (l.featured ? ' feat' : '')} key={l.id || l._k || i}>
            {th ? <img className="t" src={th} alt="" /> : <LinkIcon url={l.url} size={16} />}
            <span>{l.title || 'Judul link'}{(price || old) && <span className="pp">{old && <s>{old}</s>}{price && <b>{price}</b>}</span>}</span>
            {l.label && <span className={'pbd ' + l.label}>{labelText(l.label)}</span>}
            {(l.featured || l.guard) && <span className="pind">{l.featured && <svg className="pstar" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-label="Sorotan"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg>}{l.guard === 'pass' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-label="Terkunci"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}{l.guard === 'adult' && <span className="p18">18+</span>}</span>}
          </div>
        );
      })}
    </div>
  );
}

// Tombol Simpan; `children` tampil sejajar di sebelah kirinya (mis. Tambah link).
export function SaveBar({ children }) {
  const { save, msg, busy } = useDash();
  return (
    <div className="px-actions">
      {children}
      <button className="px-btn" onClick={save} disabled={busy} aria-busy={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</button>
      {msg && <span role="status" className="px-msg">{msg}</span>}
    </div>
  );
}

const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const lab = (d) => `${+d.slice(8)} ${BLN[+d.slice(5, 7) - 1]}`;

export function DailyChart({ daily = [] }) {
  const [days, setDays] = useState(14);
  const [k, setK] = useState('clicks');
  const rows = daily.slice(-days);
  if (!rows.length) return null;
  const mx = Math.max(1, ...rows.map((r) => r[k]));
  const sum = rows.reduce((a, r) => a + r[k], 0);
  const nm = k === 'clicks' ? 'klik' : 'kunjungan';
  const pick = (opts, val, on) => opts.map(([v, t]) => <button key={v} aria-pressed={val === v} onClick={() => on(v)}>{t}</button>);
  return (
    <div className="px-card px-chartcard">
      <div className="px-ch-head">
        <b>Per hari</b>
        <div className="px-seg" role="group" aria-label="Jenis data">{pick([['clicks', 'Klik'], ['views', 'Kunjungan']], k, setK)}</div>
        <div className="px-seg" role="group" aria-label="Rentang waktu">{pick([[7, '7 hari'], [14, '14 hari'], [30, '30 hari']], days, setDays)}</div>
      </div>
      <p className="px-ch-sum">{sum} {nm} dalam {days} hari terakhir</p>
      <div className="px-chart" role="img" aria-label={`Grafik ${nm} per hari, total ${sum} dalam ${days} hari`}>
        {rows.map((r) => (
          <div key={r.day} className="px-col" title={`${lab(r.day)}: ${r[k]} ${nm}`}>
            {days <= 14 && <span className="px-val">{r[k] || ''}</span>}
            <i style={{ height: `calc((100% - 18px) * ${r[k] / mx})` }} />
          </div>
        ))}
      </div>
      <div className="px-ch-axis"><span>{lab(rows[0].day)}</span><span>{lab(rows[rows.length - 1].day)}</span></div>
    </div>
  );
}

// Tanggal hari ini di zona Jakarta (YYYY-MM-DD) dan mundur k hari, sama dengan zona yang dipakai server.
const TODAY = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
const dayAt = (k) => { const d = new Date(TODAY() + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - k); return d.toISOString().slice(0, 10); };
const lastDays = (n) => Array.from({ length: n }, (_, i) => dayAt(n - 1 - i));

// Peringkat link terlaris. Pilihan "Semua" memakai total seumur hidup; 7 dan 30 hari memakai statistik harian per link.
// Gratis dibatasi 7 hari; tombol 30 hari membuka modal Pro. Klik nama link untuk melihat grafik hariannya.
export function LinkRank() {
  const { m } = useDash();
  const [pm, setPm] = useState(null);
  const [range, setRange] = useState('all');
  const [open, setOpen] = useState(null);
  const links = m.links.filter((l) => l.kind !== 'header');
  const n = range === 'all' ? 0 : range;
  const chartDays = lastDays(n || m.stat_days || 7);
  const byLink = {};
  for (const r of m.link_days || []) (byLink[r.link_id] ||= {})[r.day] = r.clicks;
  const sumDays = (id, days) => days.reduce((a, d) => a + (byLink[id]?.[d] || 0), 0);
  const rows = links.map((l) => ({ l, v: n ? sumDays(l.id, lastDays(n)) : l.clicks || 0 })).sort((a, b) => b.v - a.v);
  const mx = Math.max(1, ...rows.map((r) => r.v));
  const opts = [['all', 'Semua'], [7, '7 hari'], [30, m.pro ? '30 hari' : '30 hari · Pro']];
  const pick = (v) => { if (v === 30 && !m.pro) { setPm('stat'); return; } setRange(v); };
  return (
    <>
    <ProModal fitur={pm} onClose={() => setPm(null)} />
    <div className="px-card">
      <div className="px-ch-head">
        <b>Peringkat link</b>
        <div className="px-seg" role="group" aria-label="Rentang waktu">
          {opts.map(([v, t]) => <button key={v} aria-pressed={range === v} onClick={() => pick(v)}>{t}</button>)}
        </div>
      </div>
      <p className="px-ch-sum">{range === 'all' ? 'Total klik sejak link dibuat.' : `Klik dalam ${range} hari terakhir.`} Ketuk nama link untuk grafik harian.{!m.pro && ' Gratis: 7 hari.'}</p>
      {rows.length === 0 && <p className="px-empty">Belum ada link.</p>}
      {rows.map(({ l, v }, i) => {
        const key = l.id || l._k || i, on = open === key;
        const vals = chartDays.map((d) => byLink[l.id]?.[d] || 0), cm = Math.max(1, ...vals);
        return (
          <div key={key}>
            <div className="px-bar">
              <button className="px-rk-n" aria-expanded={on} onClick={() => setOpen(on ? null : key)}>{i + 1}. {l.title}{l.hidden ? ' (tersembunyi)' : ''}</button>
              <i style={{ width: Math.max(4, (v / mx) * 100) + '%' }} /><b>{v}</b>
            </div>
            {on && (l.id ? (
              <div className="px-mini-w">
                <div className="px-chart px-mini" role="img" aria-label={`Klik per hari untuk ${l.title}, ${vals.reduce((a, b) => a + b, 0)} dalam ${chartDays.length} hari`}>
                  {chartDays.map((d, j) => (
                    <div key={d} className="px-col" title={`${lab(d)}: ${vals[j]} klik`}><i style={{ height: `calc(100% * ${vals[j] / cm})` }} /></div>
                  ))}
                </div>
                <div className="px-ch-axis"><span>{lab(chartDays[0])}</span><span>{vals.reduce((a, b) => a + b, 0)} klik dalam {chartDays.length} hari</span><span>{lab(chartDays[chartDays.length - 1])}</span></div>
              </div>
            ) : <p className="px-hint">Simpan dulu supaya statistiknya mulai tercatat.</p>)}
          </div>
        );
      })}
    </div>
    </>
  );
}
