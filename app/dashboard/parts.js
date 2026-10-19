'use client';
import { useEffect, useState } from 'react';
import { useDash } from './DashContext';
import { LinkIcon, NamedIcon } from '../icons';
import { themeStyle, bgStyle } from '@/lib/themes';
import Verified from '../Verified';
import { socialList } from '@/lib/socials';
import { fmtPrice, labelText } from '@/lib/catalog';
import { fontCss } from '@/lib/style';
import { effectiveLook, thumbOk } from '@/lib/pro';

// Pratinjau: di desktop tampil di samping form. Di HP berupa tombol melayang "Pratinjau" yang membuka lembar pratinjau, jadi tidak perlu scroll ke bawah.
export function PreviewDock({ children, low }) {
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
    <div className={'px-pvd' + (open ? ' open' : '') + (low ? ' low' : '')}>
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
        if (l.kind === 'embed') return <div className="l" key={l.id || l._k || i}><span>▶ {l.title || 'Video / musik'}</span></div>;
        if (l.kind === 'qris') return <div className="l" key={l.id || l._k || i}><span>{l.title || 'QRIS'} · QRIS</span></div>;
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
const lab = (d, y) => `${+d.slice(8)} ${BLN[+d.slice(5, 7) - 1]}${y ? ' ' + d.slice(0, 4) : ''}`;
const yr = (a, b) => a.slice(0, 4) !== b.slice(0, 4);
// Rentang panjang: batang dirapatkan supaya tetap muat.
const dense = (n) => (n > 60 ? { gap: 1 } : n > 31 ? { gap: 2 } : undefined);
const thin = (n) => (n > 60 ? { borderWidth: 1, borderRadius: 0 } : undefined);

// Grafik harian untuk satu rentang (daftar hari lengkap dari /api/statistik). Pilihan rentang ada di halaman Statistik.
export function DailyChart({ daily = [], label = '' }) {
  const [k, setK] = useState('clicks');
  if (!daily.length) return null;
  const n = daily.length, y = yr(daily[0].day, daily[n - 1].day);
  const mx = Math.max(1, ...daily.map((r) => r[k]));
  const sum = daily.reduce((a, r) => a + r[k], 0);
  const nm = k === 'clicks' ? 'klik' : 'kunjungan';
  return (
    <div className="px-card px-chartcard">
      <div className="px-ch-head">
        <b>Per hari</b>
        <div className="px-seg" role="group" aria-label="Jenis data">
          {[['clicks', 'Klik'], ['views', 'Kunjungan']].map(([v, t]) => <button key={v} aria-pressed={k === v} onClick={() => setK(v)}>{t}</button>)}
        </div>
      </div>
      <p className="px-ch-sum">{sum} {nm} {label}</p>
      <div className="px-chart" style={dense(n)} role="img" aria-label={`Grafik ${nm} per hari, total ${sum} ${label}`}>
        {daily.map((r) => (
          <div key={r.day} className="px-col" title={`${lab(r.day, y)}: ${r[k]} ${nm}`}>
            {n <= 14 && <span className="px-val">{r[k] || ''}</span>}
            <i style={{ height: `calc((100% - ${n <= 14 ? 18 : 0}px) * ${r[k] / mx})`, ...thin(n) }} />
          </div>
        ))}
      </div>
      <div className="px-ch-axis"><span>{lab(daily[0].day, y)}</span><span>{lab(daily[n - 1].day, y)}</span></div>
    </div>
  );
}

// Peringkat link terlaris dalam satu rentang, dari statistik harian per link. Klik nama link untuk melihat grafik hariannya.
// days: daftar hari dalam rentang; linkDays: baris {link_id, day, clicks} dari /api/statistik.
export function LinkRank({ days = [], linkDays = [], label = '' }) {
  const { m } = useDash();
  const [open, setOpen] = useState(null);
  const links = m.links.filter((l) => (l.kind || 'link') === 'link');
  const byLink = {};
  for (const r of linkDays) (byLink[r.link_id] ||= {})[r.day] = r.clicks;
  const rows = links.map((l) => ({ l, v: days.reduce((a, d) => a + (byLink[l.id]?.[d] || 0), 0) })).sort((a, b) => b.v - a.v);
  const mx = Math.max(1, ...rows.map((r) => r.v));
  const y = days.length > 1 && yr(days[0], days[days.length - 1]);
  return (
    <div className="px-card px-mt">
      <div className="px-ch-head"><b>Peringkat link</b></div>
      <p className="px-ch-sum">Klik per link {label}. Ketuk nama link untuk grafik harian.</p>
      {rows.length === 0 && <p className="px-empty">Belum ada link.</p>}
      {rows.map(({ l, v }, i) => {
        const key = l.id || l._k || i, on = open === key;
        const vals = days.map((d) => byLink[l.id]?.[d] || 0), cm = Math.max(1, ...vals);
        return (
          <div key={key}>
            <div className="px-bar">
              <button className="px-rk-n" aria-expanded={on} onClick={() => setOpen(on ? null : key)}>{i + 1}. {l.title}{l.hidden ? ' (tersembunyi)' : ''}</button>
              <i style={{ width: Math.max(4, (v / mx) * 100) + '%' }} /><b>{v}</b>
            </div>
            {on && (l.id ? (
              <div className="px-mini-w">
                <div className="px-chart px-mini" style={dense(days.length)} role="img" aria-label={`Klik per hari untuk ${l.title}, ${v} ${label}`}>
                  {days.map((d, j) => (
                    <div key={d} className="px-col" title={`${lab(d, y)}: ${vals[j]} klik`}><i style={{ height: `calc(100% * ${vals[j] / cm})`, ...thin(days.length) }} /></div>
                  ))}
                </div>
                <div className="px-ch-axis"><span>{lab(days[0], y)}</span><span>{v} klik {label}</span><span>{lab(days[days.length - 1], y)}</span></div>
              </div>
            ) : <p className="px-hint">Simpan dulu supaya statistiknya mulai tercatat.</p>)}
          </div>
        );
      })}
    </div>
  );
}
