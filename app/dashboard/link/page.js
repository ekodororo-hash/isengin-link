'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { useDash } from '../DashContext';
import { Phone, PreviewDock, SaveBar } from '../parts';
import Importer from '../Importer';
import ProModal from '../ProModal';
import { FREE_THUMBS } from '@/lib/pro';
import { LinkIcon } from '../../icons';
import { LABELS, fmtPrice, labelText } from '@/lib/catalog';
import { embedOf, EMBED_NAMES } from '@/lib/embed';

const S = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const Pencil = () => (<svg {...S}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>);
const Check = () => (<svg {...S}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
const Up = () => (<svg {...S}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
const Down = () => (<svg {...S}><path d="M12 5v14M6 13l6 6 6-6" /></svg>);
const Trash = () => (<svg {...S}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" /></svg>);
const Head = () => (<svg {...S}><path d="M5 7V5h14v2M12 5v14M9 19h6" /></svg>);
const Img = () => (<svg {...S}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10.5" r="1.5" /><path d="M4 17l5-4.5 3.5 3L15.5 13 20 17" /></svg>);
const Badge = () => (<svg className="px-ok" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7" fill="#2fb344" stroke="#1f2255" strokeWidth="1.6" /><path d="M4.6 8.3l2.3 2.3 4.5-4.7" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const Play = () => (<svg {...S}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" /></svg>);
const Qr = () => (<svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01" /></svg>);
const Grip = () => (<svg {...S} strokeWidth="2.8"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" /></svg>);

export default function LinkPage() {
  const { m, setL, addLink, addHeader, addEmbed, addQris, delLink, move, reorder, upThumb, upQris } = useDash();
  const n = m.links.length;
  const thumbs = m.links.filter((l) => l.kind !== 'header' && l.thumb).length;
  const feats = m.links.filter((l) => l.kind !== 'header' && l.featured).length; // maksimal 2 link sorotan
  // Link yang sedang diedit (dikunci lewat id/_k karena urutan bisa berubah). Link baru kosong otomatis terbuka.
  const [open, setOpen] = useState({});
  const [pm, setPm] = useState(null);
  // Gambar yang sudah ada saat halaman dibuka. Paket gratis boleh menambah gambar ke-4 dan seterusnya, tapi server menolak menyimpannya.
  const orig = useRef(null);
  if (orig.current === null) orig.current = new Set(m.links.map((l) => l.thumb).filter(Boolean));
  const overNew = !m.pro && thumbs > FREE_THUMBS && m.links.some((l) => l.kind !== 'header' && l.thumb && !orig.current.has(l.thumb));
  // Paket gratis sudah 3 gambar: link tanpa gambar tidak boleh menambah lagi, modal Pro langsung terbuka (mengganti gambar tetap boleh).
  const gate = (e, l) => { if (!m.pro && !l.thumb && thumbs >= FREE_THUMBS) { e.preventDefault(); setPm('gambar'); } };
  const keyOf = (l, i) => l.id || l._k || 'n' + i;
  // Link/pembatas baru yang kosong terbuka otomatis. Kuncinya diingat di sini supaya form TIDAK menutup
  // sendiri begitu isinya mulai diketik (sebelumnya terbuka hanya selama judul dan alamat masih kosong).
  const autoOpen = useRef(new Set());
  const isOpen = (l, i) => {
    const key = keyOf(l, i);
    const v = open[key];
    if (v !== undefined) return v;
    if (autoOpen.current.has(key)) return true;
    if ((!l.title || l.kind === 'qris') && !l.url) { autoOpen.current.add(key); return true; }
    return false;
  };
  const toggle = (l, i) => setOpen((o) => ({ ...o, [keyOf(l, i)]: !isOpen(l, i) }));

  // Seret dan lepas: pegang ikon titik-titik, geser ke atas atau bawah. Bekerja dengan mouse maupun sentuhan.
  const listRef = useRef(null);
  const dragKey = useRef(null);
  const [drag, setDrag] = useState(null);
  const rects = useRef(null);   // posisi baris sebelum urutan berubah (untuk animasi geser baris lain)
  const lastY = useRef(0);      // posisi jari/kursor terakhir
  const grab = useRef(0);       // jarak jari dari atas baris saat mulai menyeret
  const rowOf = (key) => listRef.current && [...listRef.current.querySelectorAll('[data-k]')].find((r) => r.dataset.k === String(key));
  // Baris yang diseret ikut jari: digeser lewat transform dari posisi aslinya di daftar.
  const place = () => {
    const key = dragKey.current;
    const el = key == null ? null : rowOf(key);
    if (!el) return;
    const ty = parseFloat(el.dataset.ty || '0');
    const natural = el.getBoundingClientRect().top - ty;
    const dy = lastY.current - grab.current - natural;
    el.dataset.ty = String(dy);
    el.style.transition = 'none';
    el.style.transform = `translateY(${dy}px)`;
  };
  // Setelah urutan berubah: baris lain meluncur halus dari posisi lamanya ke posisi baru, baris yang diseret tetap menempel di jari.
  useLayoutEffect(() => {
    const prev = rects.current;
    if (!prev || !listRef.current) return;
    rects.current = null;
    for (const r of listRef.current.querySelectorAll('[data-k]')) {
      if (r.dataset.k === String(dragKey.current)) continue;
      const o = prev[r.dataset.k];
      if (o == null) continue;
      const d = o - r.getBoundingClientRect().top;
      if (Math.abs(d) < 1) continue;
      r.style.transition = 'none';
      r.style.transform = `translateY(${d}px)`;
      r.getBoundingClientRect();
      r.style.transition = 'transform .2s ease';
      r.style.transform = '';
    }
    place();
  }, [m.links]);
  // Handler terbaru disimpan di ref: pendengar di window dipasang sekali saat mulai seret, tapi state-nya terus berubah.
  const hMove = useRef(null), hUp = useRef(null), stopDrag = useRef(null);
  const down = (e, key) => {
    if (e.button > 0) return;
    e.preventDefault();
    const row = e.currentTarget.closest('[data-k]');
    lastY.current = e.clientY;
    grab.current = row ? e.clientY - row.getBoundingClientRect().top : 0;
    dragKey.current = key; setDrag(key);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    // Saat urutan berubah, React memindahkan elemen di DOM dan capture bisa lepas (seret jadi macet).
    // Karena itu gerak dan lepas dipantau di window, bukan di tombol.
    const mv = (ev) => hMove.current && hMove.current(ev);
    const end = () => hUp.current && hUp.current();
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
    stopDrag.current = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
    };
  };
  const moveDrag = (e) => {
    const key = dragKey.current;
    if (key == null || !listRef.current) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) { up(); return; } // tombol mouse sudah dilepas tapi pointerup terlewat
    lastY.current = e.clientY;
    const rows = [...listRef.current.querySelectorAll('[data-k]')];
    // Titik tengah tiap baris dihitung dari posisi aslinya (bukan yang sedang beranimasi) supaya tidak bolak-balik.
    const y = e.clientY - listRef.current.getBoundingClientRect().top;
    let to = 0;
    for (const r of rows) {
      if (r.dataset.k === String(key)) continue;
      if (r.offsetTop - listRef.current.offsetTop + r.offsetHeight / 2 < y) to++;
    }
    const from = m.links.findIndex((l, i) => String(keyOf(l, i)) === String(key));
    if (from >= 0 && from !== to) {
      const snap = {};
      for (const r of rows) snap[r.dataset.k] = r.getBoundingClientRect().top;
      rects.current = snap;
      reorder(from, to);
    } else place();
    if (e.clientY < 90) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
  };
  // Lepas: baris yang diseret meluncur halus ke tempat barunya.
  const up = () => {
    const el = dragKey.current == null ? null : rowOf(dragKey.current);
    if (el) {
      el.style.transition = 'transform .2s ease, box-shadow .2s ease';
      el.style.transform = '';
      delete el.dataset.ty;
    }
    if (stopDrag.current) { stopDrag.current(); stopDrag.current = null; }
    dragKey.current = null; setDrag(null);
  };
  hMove.current = moveDrag; hUp.current = up;
  useLayoutEffect(() => () => { if (stopDrag.current) stopDrag.current(); }, []);

  return (<>
    <ProModal fitur={pm} info={{ used: thumbs, limit: FREE_THUMBS }} onClose={() => setPm(null)} />
    <h1>Link</h1>
    <p className="px-sub">Atur urutan dengan menyeret ikon titik-titik atau tombol panah, sama seperti di halaman publikmu. Gunakan pembatas untuk mengelompokkan link. Klik Simpan setelah selesai.</p>
    <div className="px-two">
    <div className="px-lnkcol">
    <Importer />
    {!m.pro && thumbs >= 2 && <p className="px-hint px-quota" role="status"><span>Gambar {Math.min(thumbs, FREE_THUMBS)}/{FREE_THUMBS}</span><button type="button" className="px-lnk" onClick={() => setPm('gambar')}>Pro: tanpa batas</button></p>}
    <div className="px-card">
      {n === 0 && <p className="px-empty">Belum ada link. Klik “Tambah link” untuk mulai.</p>}
      <div ref={listRef}>
        {m.links.map((l, i) => {
          const k = keyOf(l, i);
          if (l.kind === 'embed' || l.kind === 'qris') {
            const q = l.kind === 'qris', ed = isOpen(l, i), emb = q ? null : embedOf(l.url);
            return (
              <div className={'px-lk' + (l.hidden ? ' off' : '') + (ed ? ' ed' : '') + (drag === k ? ' drag' : '')} key={k} data-k={k}>
                <div className="px-lk-r">
                  <button className="px-grip" aria-label={`Seret untuk memindahkan item ${i + 1}`} title="Seret untuk mengurutkan" onPointerDown={(e) => down(e, k)}><Grip /></button>
                  <span className="px-lk-no">{i + 1}</span>
                  {q && l.url ? <img className="px-th" src={l.url} alt="" /> : <span className="px-th e" aria-hidden="true">{q ? <Qr /> : <Play />}</span>}
                  <div className="px-lk-i">
                    <strong>{l.title || <em>{q ? 'Tanpa judul' : emb ? EMBED_NAMES[emb.provider] : 'Embed'}</em>}<span className="px-tag ext">{q ? 'QRIS' : 'Embed'}</span></strong>
                    <span>{q ? (l.url ? 'Gambar QRIS terpasang' : 'Belum ada gambar QRIS') : (l.url || 'Belum ada alamat')}</span>
                  </div>
                  <label className="px-sw2" title={l.hidden ? 'Disembunyikan' : 'Tampil'}>
                    <input type="checkbox" role="switch" className="px-sr" aria-label={`Tampilkan item ${i + 1}`} checked={!l.hidden} onChange={(e) => setL(i, 'hidden', !e.target.checked)} />
                    <span className="px-tg" aria-hidden="true" />
                  </label>
                  <div className="px-lk-b">
                    <button className="px-ib" aria-label={`Naikkan item ${i + 1}`} title="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}><Up /></button>
                    <button className="px-ib" aria-label={`Turunkan item ${i + 1}`} title="Turunkan" disabled={i === n - 1} onClick={() => move(i, 1)}><Down /></button>
                    <button className={'px-ib' + (ed ? ' on' : '')} aria-label={ed ? `Selesai mengedit item ${i + 1}` : `Edit item ${i + 1}`} aria-expanded={ed} title={ed ? 'Selesai' : 'Edit'} onClick={() => toggle(l, i)}>{ed ? <Check /> : <Pencil />}</button>
                    <button className="px-ib d" aria-label={`Hapus item ${i + 1}`} title="Hapus" onClick={() => delLink(i)}><Trash /></button>
                  </div>
                </div>
                {ed && (
                  <div className="px-lk-e">
                    {q ? (<>
                      <div className="px-lk-f">
                        <input aria-label={`Judul QRIS ${i + 1}`} placeholder="Judul, mis. Traktir kopi" value={l.title} maxLength={60} onChange={(e) => setL(i, 'title', e.target.value)} />
                      </div>
                      <div className="px-lk-t">
                        <label className="px-btn g sm px-fl">{l.url ? 'Ganti gambar QRIS' : 'Unggah gambar QRIS'}
                          <input type="file" accept="image/*" className="px-sr" aria-label={`Unggah gambar QRIS ${i + 1}`} onChange={(e) => upQris(l.id || l._k, e)} />
                        </label>
                      </div>
                      {l.url && <img className="px-qr-prev" src={l.url} alt="Pratinjau QRIS" />}
                      <p className="px-hint">Unggah gambar QRIS statis dari bank atau e-wallet-mu (nominal diisi sendiri oleh pembayar). Pakai gambar yang hanya berisi kode QR, jangan sertakan tangkapan layar aplikasi. Setelah itu klik Simpan.</p>
                    </>) : (<>
                      <div className="px-lk-f">
                        <input aria-label={`Judul embed ${i + 1}`} placeholder="Judul (opsional)" value={l.title} maxLength={60} onChange={(e) => setL(i, 'title', e.target.value)} />
                        <input aria-label={`Alamat embed ${i + 1}`} placeholder="Tempel link YouTube, Spotify, SoundCloud, atau TikTok" value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
                      </div>
                      {l.url && !emb && <p className="px-warn" role="alert">Link ini belum didukung, jadi tidak akan disimpan. Pakai link video YouTube atau TikTok, atau lagu, album, dan playlist Spotify atau SoundCloud.</p>}
                      {emb && <p className="px-hint">Terbaca sebagai {EMBED_NAMES[emb.provider]}. {emb.facade ? 'Pengunjung melihat sampul dulu; videonya dimuat setelah ditekan.' : 'Pemutarnya tampil langsung di halamanmu.'}</p>}
                    </>)}
                  </div>
                )}
              </div>
            );
          }
          const hed = l.kind === 'header' && isOpen(l, i);
          if (l.kind === 'header') return (
            <div className={'px-lk px-hd' + (l.hidden ? ' off' : '') + (drag === k ? ' drag' : '')} key={k} data-k={k}>
              <div className="px-lk-r">
                <button className="px-grip" aria-label={`Seret untuk memindahkan pembatas ${i + 1}`} title="Seret untuk mengurutkan"
                  onPointerDown={(e) => down(e, k)}><Grip /></button>
                <span className="px-lk-no">{i + 1}</span>
                <span className="px-th e" aria-hidden="true"><Head /></span>
                {hed
                  ? <input className="px-hd-in" autoFocus={!!l.title} aria-label={`Judul pembatas ${i + 1}`} placeholder="Judul pembatas, mis. Produk" maxLength={60} value={l.title} onChange={(e) => setL(i, 'title', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') toggle(l, i); }} />
                  : <div className="px-lk-i"><strong>{l.title || <em>Tanpa judul</em>}</strong></div>}
                <label className="px-sw2" title={l.hidden ? 'Disembunyikan' : 'Tampil'}>
                  <input type="checkbox" role="switch" className="px-sr" aria-label={`Tampilkan pembatas ${i + 1}`} checked={!l.hidden} onChange={(e) => setL(i, 'hidden', !e.target.checked)} />
                  <span className="px-tg" aria-hidden="true" />
                </label>
                <div className="px-lk-b">
                  <button className="px-ib" aria-label={`Naikkan pembatas ${i + 1}`} title="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}><Up /></button>
                  <button className="px-ib" aria-label={`Turunkan pembatas ${i + 1}`} title="Turunkan" disabled={i === n - 1} onClick={() => move(i, 1)}><Down /></button>
                  <button className={'px-ib' + (hed ? ' on' : '')} aria-label={hed ? `Selesai mengedit pembatas ${i + 1}` : `Edit pembatas ${i + 1}`} aria-expanded={hed} title={hed ? 'Selesai' : 'Edit'} onClick={() => toggle(l, i)}>{hed ? <Check /> : <Pencil />}</button>
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
                  onPointerDown={(e) => down(e, k)}><Grip /></button>
                <span className="px-lk-no">{i + 1}</span>
                {l.thumb ? <img className="px-th" src={l.thumb} alt="" /> : <span className="px-th e" aria-hidden="true"><LinkIcon url={l.url} size={20} /></span>}
                <div className="px-lk-i">
                  <strong>{l.title || <em>Tanpa judul</em>}{l.label && <span className={'px-tag ' + l.label}>{labelText(l.label)}</span>}{l.featured && <span className="px-tag sor">Sorotan</span>}{l.guard && <span className="px-tag kunci">{l.guard === 'pass' ? 'Terkunci' : '18+'}</span>}</strong>
                  <span>{price ? <b className="px-pr">{price}</b> : null}{price ? ' · ' : ''}{l.url || 'Belum ada alamat'}</span>
                </div>
                <label className="px-sw2" title={l.hidden ? 'Disembunyikan' : 'Tampil'}>
                  <input type="checkbox" role="switch" className="px-sr" aria-label={`Tampilkan link ${i + 1}`} checked={!l.hidden} onChange={(e) => setL(i, 'hidden', !e.target.checked)} />
                  <span className="px-tg" aria-hidden="true" />
                </label>
                <div className="px-lk-b">
                  <label className={'px-ib px-ib-img'} onClick={(e) => gate(e, l)} title={l.thumb ? 'Ganti gambar' : 'Tambah gambar'}>
                    <Img />{l.thumb && <Badge />}
                    <input type="file" accept="image/*" className="px-sr" aria-label={l.thumb ? `Ganti gambar link ${i + 1}` : `Tambah gambar link ${i + 1}`} onChange={(e) => upThumb(l.id || l._k, e)} />
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
                  <fieldset className="px-cat px-grd">
                    <legend>Sorotan dan pengaman <span className="px-hint-i">opsional</span></legend>
                    <label className="px-ck">
                      <input type="checkbox" checked={l.featured === true} disabled={!l.featured && feats >= 2} onChange={(e) => setL(i, 'featured', e.target.checked)} />
                      Sorot link ini (bingkai dan bintang di halamanmu){!l.featured && feats >= 2 ? ' · maksimal 2 link' : ''}
                    </label>
                    <div className="px-chips" role="group" aria-label={`Pengaman link ${i + 1}`}>
                      {[['', 'Tanpa pengaman'], ['adult', 'Peringatan 18+'], ['pass', 'Sandi']].map(([v, t]) => (
                        <button key={v || 'x'} type="button" aria-pressed={(l.guard || '') === v} onClick={() => setL(i, 'guard', v)}>{t}</button>
                      ))}
                    </div>
                    {l.guard === 'pass' && (<>
                      <input type="password" autoComplete="new-password" aria-label={`Sandi link ${i + 1}`} maxLength={64} placeholder={l.has_pass ? 'Sandi baru (kosongkan untuk tetap memakai yang lama)' : 'Sandi, 4 sampai 64 karakter'} value={l.pass || ''} onChange={(e) => setL(i, 'pass', e.target.value)} />
                      <p className="px-hint">Alamat link tidak tampil di halaman publik. Pengunjung harus memasukkan sandi dulu. Bagikan sandinya sendiri ke orang yang boleh membuka.</p>
                    </>)}
                    {l.guard === 'adult' && <p className="px-hint">Pengunjung melihat peringatan konten dewasa dulu dan harus memilih “Saya 18+” untuk lanjut.</p>}
                  </fieldset>
                  <div className="px-lk-t">
                    {l.thumb && <button className="px-btn g sm" onClick={() => setL(i, 'thumb', '')}>Hapus gambar</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Gambar lebih dari batas gratis tidak bisa disimpan: simpan dicegat dan modal Pro muncul. Tombol sekunder (kelas g) tidak dicegat. */}
      <div style={{ display: 'contents' }} onClickCapture={(e) => { const b = e.target.closest && e.target.closest('button'); if (overNew && b && !b.classList.contains('g')) { e.stopPropagation(); e.preventDefault(); setPm('gambar'); } }}>
        <SaveBar>
          <button className="px-btn g" onClick={addLink}>Tambah link</button>
          <button className="px-btn g" onClick={addHeader}>Tambah pembatas</button>
          <button className="px-btn g" onClick={addEmbed}>Tambah embed</button>
          <button className="px-btn g" onClick={addQris}>Tambah QRIS</button>
        </SaveBar>
      </div>
    </div>
    </div>
    <PreviewDock low><Phone /></PreviewDock>
    </div>
  </>);
}
