'use client';
import { useRef, useState } from 'react';
import { useDash } from '../DashContext';
import { SaveBar } from '../parts';
import { LinkIcon } from '../../icons';
import { LABELS, fmtPrice, labelText } from '@/lib/catalog';

const S = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const Pencil = () => (<svg {...S}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>);
const Check = () => (<svg {...S}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
const Up = () => (<svg {...S}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
const Down = () => (<svg {...S}><path d="M12 5v14M6 13l6 6 6-6" /></svg>);
const Trash = () => (<svg {...S}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" /></svg>);
const Head = () => (<svg {...S}><path d="M5 7V5h14v2M12 5v14M9 19h6" /></svg>);
const Grip = () => (<svg {...S} strokeWidth="2.8"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" /></svg>);

export default function LinkPage() {
  const { m, setL, addLink, addHeader, delLink, move, reorder, upThumb } = useDash();
  const n = m.links.length;
  // Link yang sedang diedit (dikunci lewat id/_k karena urutan bisa berubah). Link baru kosong otomatis terbuka.
  const [open, setOpen] = useState({});
  const keyOf = (l, i) => l.id || l._k || 'n' + i;
  const isOpen = (l, i) => {
    const v = open[keyOf(l, i)];
    return v === undefined ? !l.title && !l.url : v;
  };
  const toggle = (l, i) => setOpen((o) => ({ ...o, [keyOf(l, i)]: !isOpen(l, i) }));

  // Seret dan lepas: pegang ikon titik-titik, geser ke atas atau bawah. Bekerja dengan mouse maupun sentuhan.
  const listRef = useRef(null);
  const dragKey = useRef(null);
  const [drag, setDrag] = useState(null);
  const down = (e, key) => {
    if (e.button > 0) return;
    e.preventDefault();
    dragKey.current = key; setDrag(key);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e) => {
    const key = dragKey.current;
    if (key == null || !listRef.current) return;
    const rows = [...listRef.current.querySelectorAll('[data-k]')];
    const y = e.clientY;
    let to = 0;
    for (const r of rows) {
      if (r.dataset.k === String(key)) continue;
      const b = r.getBoundingClientRect();
      if (y > b.top + b.height / 2) to++;
    }
    const from = m.links.findIndex((l, i) => String(keyOf(l, i)) === String(key));
    if (from >= 0 && from !== to) reorder(from, to);
    if (e.clientY < 90) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
  };
  const up = () => { dragKey.current = null; setDrag(null); };

  return (<>
    <h1>Link</h1>
    <p className="px-sub">Seret ikon titik-titik untuk mengubah urutan, atau pakai tombol panah. Urutan di sini sama dengan urutan di halamanmu. Pembatas adalah judul seksi tanpa alamat untuk mengelompokkan link (mis. “Produk”, “Sosial media”). Link atau pembatas yang disembunyikan tidak tampil, dan link tersembunyi tidak dihitung kliknya. Setelah mengubah, klik Simpan.</p>
    <div className="px-card">
      {n === 0 && <p className="px-empty">Belum ada link. Klik “Tambah link” untuk mulai.</p>}
      <div ref={listRef}>
        {m.links.map((l, i) => {
          const k = keyOf(l, i);
          if (l.kind === 'header') return (
            <div className={'px-lk px-hd' + (l.hidden ? ' off' : '') + (drag === k ? ' drag' : '')} key={k} data-k={k}>
              <div className="px-lk-r">
                <button className="px-grip" aria-label={`Seret untuk memindahkan pembatas ${i + 1}`} title="Seret untuk mengurutkan"
                  onPointerDown={(e) => down(e, k)} onPointerMove={moveDrag} onPointerUp={up} onPointerCancel={up}><Grip /></button>
                <span className="px-lk-no">{i + 1}</span>
                <span className="px-th e" aria-hidden="true"><Head /></span>
                <input className="px-hd-in" aria-label={`Judul pembatas ${i + 1}`} placeholder="Judul pembatas, mis. Produk" maxLength={60} value={l.title} onChange={(e) => setL(i, 'title', e.target.value)} />
                <div className="px-lk-b">
                  <label className="px-sw2" title={l.hidden ? 'Disembunyikan' : 'Tampil'}>
                    <input type="checkbox" role="switch" className="px-sr" aria-label={`Tampilkan pembatas ${i + 1}`} checked={!l.hidden} onChange={(e) => setL(i, 'hidden', !e.target.checked)} />
                    <span className="px-tg" aria-hidden="true" />
                  </label>
                  <button className="px-ib" aria-label={`Naikkan pembatas ${i + 1}`} title="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}><Up /></button>
                  <button className="px-ib" aria-label={`Turunkan pembatas ${i + 1}`} title="Turunkan" disabled={i === n - 1} onClick={() => move(i, 1)}><Down /></button>
                  <button className="px-ib d" aria-label={`Hapus pembatas ${i + 1}`} title="Hapus" onClick={() => delLink(i)}><Trash /></button>
                </div>
              </div>
            </div>
          );
          const ed = isOpen(l, i);
          const price = fmtPrice(l.price);
          return (
            <div className={'px-lk' + (l.hidden ? ' off' : '') + (ed ? ' ed' : '') + (drag === k ? ' drag' : '')} key={k} data-k={k}>
              <div className="px-lk-r">
                <button className="px-grip" aria-label={`Seret untuk memindahkan link ${i + 1}`} title="Seret untuk mengurutkan"
                  onPointerDown={(e) => down(e, k)} onPointerMove={moveDrag} onPointerUp={up} onPointerCancel={up}><Grip /></button>
                <span className="px-lk-no">{i + 1}</span>
                {l.thumb ? <img className="px-th" src={l.thumb} alt="" /> : <span className="px-th e" aria-hidden="true"><LinkIcon url={l.url} size={20} /></span>}
                <div className="px-lk-i">
                  <strong>{l.title || <em>Tanpa judul</em>}{l.label && <span className={'px-tag ' + l.label}>{labelText(l.label)}</span>}</strong>
                  <span>{price ? <b className="px-pr">{price}</b> : null}{price ? ' · ' : ''}{l.url || 'Belum ada alamat'}</span>
                </div>
                <div className="px-lk-b">
                  <label className="px-sw2" title={l.hidden ? 'Disembunyikan' : 'Tampil'}>
                    <input type="checkbox" role="switch" className="px-sr" aria-label={`Tampilkan link ${i + 1}`} checked={!l.hidden} onChange={(e) => setL(i, 'hidden', !e.target.checked)} />
                    <span className="px-tg" aria-hidden="true" />
                  </label>
                  <button className="px-ib" aria-label={`Naikkan link ${i + 1}`} title="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}><Up /></button>
                  <button className="px-ib" aria-label={`Turunkan link ${i + 1}`} title="Turunkan" disabled={i === n - 1} onClick={() => move(i, 1)}><Down /></button>
                  <button className={'px-ib' + (ed ? ' on' : '')} aria-label={ed ? `Selesai mengedit link ${i + 1}` : `Edit link ${i + 1}`} aria-expanded={ed} title={ed ? 'Selesai' : 'Edit'} onClick={() => toggle(l, i)}>{ed ? <Check /> : <Pencil />}</button>
                  <button className="px-ib d" aria-label={`Hapus link ${i + 1}`} title="Hapus" onClick={() => delLink(i)}><Trash /></button>
                </div>
              </div>
              {ed && (
                <div className="px-lk-e">
                  <div className="px-lk-f">
                    <input aria-label={`Judul link ${i + 1}`} placeholder="Judul" value={l.title} maxLength={60} onChange={(e) => setL(i, 'title', e.target.value)} />
                    <input aria-label={`Alamat link ${i + 1}`} placeholder="https://..." value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
                  </div>
                  <fieldset className="px-cat">
                    <legend>Katalog produk <span className="px-hint-i">opsional</span></legend>
                    <div className="px-lk-f">
                      <input aria-label={`Harga link ${i + 1}`} placeholder="Harga, mis. 45000" inputMode="text" maxLength={24} value={l.price || ''} onChange={(e) => setL(i, 'price', e.target.value)} />
                      <input aria-label={`Harga coret link ${i + 1}`} placeholder="Harga coret (sebelum diskon)" maxLength={24} value={l.old_price || ''} onChange={(e) => setL(i, 'old_price', e.target.value)} />
                    </div>
                    <div className="px-chips" role="group" aria-label={`Label link ${i + 1}`}>
                      {LABELS.map(([v, t]) => (
                        <button key={v || 'x'} type="button" aria-pressed={(l.label || '') === v} onClick={() => setL(i, 'label', v)}>{t}</button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="px-lk-t">
                    <label className="px-btn g sm px-fl">{l.thumb ? 'Ganti gambar' : 'Tambah gambar'}
                      <input type="file" accept="image/*" className="px-sr" onChange={(e) => upThumb(l.id || l._k, e)} />
                    </label>
                    {l.thumb && <button className="px-btn g sm" onClick={() => setL(i, 'thumb', '')}>Hapus gambar</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <SaveBar>
        <button className="px-btn g" onClick={addLink}>Tambah link</button>
        <button className="px-btn g" onClick={addHeader}>Tambah pembatas</button>
      </SaveBar>
    </div>
  </>);
}
