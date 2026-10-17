'use client';
import { useState } from 'react';
import { useDash } from './DashContext';
import { LinkIcon, NamedIcon } from '../icons';
import { themeStyle, bgStyle } from '@/lib/themes';
import Verified from '../Verified';
import { socialList } from '@/lib/socials';
import { fmtPrice, labelText } from '@/lib/catalog';
import { fontCss } from '@/lib/style';

export function Phone() {
  const { m } = useDash();
  const n = m.display_name || m.username;
  const soc = socialList(m.socials);
  return (
    <div className="px-ph" data-t={m.theme} data-b={m.btn_style || 'bulat'} style={{ ...themeStyle(m.theme, m.colors), ...bgStyle(m.bg, m.theme, m.colors), '--pfont': fontCss(m.font_key) }}>
      {m.photo_url ? <img className="a" src={m.photo_url} alt="" /> : <div className="a">{n[0].toUpperCase()}</div>}
      <h3>{n}{m.verified && <Verified size={14} />}</h3><p>{m.bio}</p>
      {soc.length > 0 && <div className="so">{soc.map((x) => <span className="s" key={x.key}><NamedIcon name={x.key} size={14} /></span>)}</div>}
      {m.links.filter((l) => !l.hidden).map((l, i) => {
        if (l.kind === 'header') return <div className="hd" key={l.id || l._k || i}><span>{l.title || 'Judul pembatas'}</span></div>;
        const price = fmtPrice(l.price), old = fmtPrice(l.old_price);
        return (
          <div className={'l' + (price || old || l.label ? ' cat' : '') + (l.label === 'habis' ? ' soldout' : '')} key={l.id || l._k || i}>
            {l.thumb ? <img className="t" src={l.thumb} alt="" /> : <LinkIcon url={l.url} size={16} />}
            <span>{l.title || 'Judul link'}{(price || old) && <span className="pp">{old && <s>{old}</s>}{price && <b>{price}</b>}</span>}</span>
            {l.label && <span className={'pbd ' + l.label}>{labelText(l.label)}</span>}
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
