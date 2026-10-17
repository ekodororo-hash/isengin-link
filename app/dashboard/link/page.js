'use client';
import { useState } from 'react';
import { useDash } from '../DashContext';
import { SaveBar } from '../parts';
import { LinkIcon } from '../../icons';

const S = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const Pencil = () => (<svg {...S}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>);
const Check = () => (<svg {...S}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
const Up = () => (<svg {...S}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
const Down = () => (<svg {...S}><path d="M12 5v14M6 13l6 6 6-6" /></svg>);
const Trash = () => (<svg {...S}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" /></svg>);

export default function LinkPage() {
  const { m, setL, addLink, delLink, move, upThumb } = useDash();
  const n = m.links.length;
  // Link yang sedang diedit (dikunci lewat id/_k karena urutan bisa berubah). Link baru kosong otomatis terbuka.
  const [open, setOpen] = useState({});
  const keyOf = (l, i) => l.id || l._k || 'n' + i;
  const isOpen = (l, i) => {
    const v = open[keyOf(l, i)];
    return v === undefined ? !l.title && !l.url : v;
  };
  const toggle = (l, i) => setOpen((o) => ({ ...o, [keyOf(l, i)]: !isOpen(l, i) }));

  return (<>
    <h1>Link</h1>
    <p className="px-sub">Urutan di sini sama dengan urutan di halamanmu. Link yang disembunyikan tidak tampil di halamanmu dan klik ke link itu tidak dihitung. Setelah mengubah, klik Simpan.</p>
    <div className="px-card">
      {n === 0 && <p className="px-empty">Belum ada link. Klik “Tambah link” untuk mulai.</p>}
      {m.links.map((l, i) => {
        const ed = isOpen(l, i);
        return (
          <div className={'px-lk' + (l.hidden ? ' off' : '') + (ed ? ' ed' : '')} key={keyOf(l, i)}>
            <div className="px-lk-r">
              <span className="px-lk-no">{i + 1}</span>
              {l.thumb ? <img className="px-th" src={l.thumb} alt="" /> : <span className="px-th e" aria-hidden="true"><LinkIcon url={l.url} size={20} /></span>}
              <div className="px-lk-i">
                <strong>{l.title || <em>Tanpa judul</em>}</strong>
                <span>{l.url || 'Belum ada alamat'}</span>
              </div>
              <div className="px-lk-b">
                <label className="px-sw2" title={l.hidden ? 'Disembunyikan' : 'Tampil'}>
                  <input type="checkbox" role="switch" className="px-sr" aria-label={`Tampilkan link ${i + 1}`} checked={!l.hidden} onChange={(e) => setL(i, 'hidden', !e.target.checked)} />
                  <span className="px-tg" aria-hidden="true" />
                </label>
                <button className={'px-ib' + (ed ? ' on' : '')} aria-label={ed ? `Selesai mengedit link ${i + 1}` : `Edit link ${i + 1}`} aria-expanded={ed} title={ed ? 'Selesai' : 'Edit'} onClick={() => toggle(l, i)}>{ed ? <Check /> : <Pencil />}</button>
                <button className="px-ib" aria-label={`Naikkan link ${i + 1}`} title="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}><Up /></button>
                <button className="px-ib" aria-label={`Turunkan link ${i + 1}`} title="Turunkan" disabled={i === n - 1} onClick={() => move(i, 1)}><Down /></button>
                <button className="px-ib d" aria-label={`Hapus link ${i + 1}`} title="Hapus" onClick={() => delLink(i)}><Trash /></button>
              </div>
            </div>
            {ed && (
              <div className="px-lk-e">
                <div className="px-lk-f">
                  <input aria-label={`Judul link ${i + 1}`} placeholder="Judul" value={l.title} maxLength={60} onChange={(e) => setL(i, 'title', e.target.value)} />
                  <input aria-label={`Alamat link ${i + 1}`} placeholder="https://..." value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
                </div>
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
      <SaveBar><button className="px-btn g" onClick={addLink}>Tambah link</button></SaveBar>
    </div>
  </>);
}
