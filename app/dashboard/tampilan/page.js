'use client';
import { useState } from 'react';
import ProModal from '../ProModal';
import { useDash } from '../DashContext';
import { Phone, PreviewDock, SaveBar } from '../parts';
import { BUTTON_STYLES, FONTS } from '@/lib/style';
import { PRO_THEMES, PRO_FONTS, PRO_BTNS, proUses } from '@/lib/pro';
import { THEMES, ANGLES, themeWith, cleanColors, contrast } from '@/lib/themes';
const COLORS = [['bg', 'Latar'], ['ink', 'Teks'], ['btn', 'Tombol link'], ['accent', 'Aksen']];
export default function Tampilan() {
  const { m, set, setTheme, upBg } = useDash();
  const pro = m.pro === true;
  // Pengguna gratis boleh mencoba pilihan Pro: tampil di pratinjau saja, tidak disimpan dan tidak tampil di halaman publik.
  const [tr, setTr] = useState({});
  const [pm, setPm] = useState(null);
  const trKeys = pro ? [] : Object.keys(tr);
  const trying = trKeys.length > 0;
  const clr = (...ks) => setTr((o) => { const n = { ...o }; ks.forEach((k) => delete n[k]); return n; });
  const pick = (locked, what, key, val, fn) => () => {
    if (locked) setTr((o) => { const n = { ...o, [key]: val }; if (key === 'theme') delete n.colors; return n; });
    else { clr(key, ...(key === 'theme' ? ['colors'] : [])); fn(); }
  };
  const used = pro ? [] : proUses(m);
  const theme = (!pro && tr.theme) || m.theme;
  const colors = (!pro && tr.colors) || m.colors;
  const t = themeWith(theme, colors);
  const custom = cleanColors(colors);
  const bg = (!pro && tr.bg) || m.bg || {};
  const setBg = (v) => { if (!pro && v.t === 'image') setTr((o) => ({ ...o, bg: v })); else { clr('bg'); set('bg', v); } };
  const upTrialBg = (e) => { const f = e.target.files && e.target.files[0]; if (f) setTr((o) => ({ ...o, bg: { t: 'image', url: URL.createObjectURL(f), dim: o.bg?.dim ?? 40 } })); };
  const mode = bg.t === 'gradient' || bg.t === 'image' ? bg.t : 'solid';
  const dim = Number.isFinite(+bg.dim) ? +bg.dim : 40;
  const setMode = (md) => {
    if (md === 'solid') setBg({});
    else if (md === 'gradient') setBg({ t: 'gradient', c1: bg.c1 || t.bg, c2: bg.c2 || t.accent, angle: bg.angle || 180 });
    else setBg({ t: 'image', url: bg.url || '', dim });
  };
  // Fitur Pro mana yang ditampilkan di modal: yang sedang dicoba, kalau tidak ada yang sudah terpilih sebelumnya.
  const fiturPro = () => {
    if (tr.bg) return 'latar';
    if (tr.theme) return 'tema';
    if (tr.colors) return 'warna';
    if (tr.font_key || tr.btn_style) return 'font';
    if (m.bg?.t === 'image') return 'latar';
    if (PRO_THEMES.includes(m.theme)) return 'tema';
    if (Object.keys(cleanColors(m.colors) || {}).length) return 'warna';
    return 'font';
  };
  const warns = [];
  if (mode === 'solid' && contrast(t.ink, t.bg) < 4.5) warns.push('Teks sulit dibaca di atas warna latar. Coba warna yang lebih kontras.');
  if (mode === 'gradient' && [bg.c1, bg.c2].some((c) => /^#[0-9a-f]{6}$/i.test(c || '') && contrast(t.ink, c) < 4.5)) warns.push('Teks sulit dibaca di atas salah satu warna gradasi. Coba warna yang lebih kontras dengan warna teks.');
  if (contrast(t.ink, t.btn) < 4.5) warns.push('Teks sulit dibaca di atas warna tombol link.');
  if (contrast(t.accent, t.bg) < 3) warns.push('Warna aksen terlalu mirip latar, huruf di foto profil jadi susah dibaca.');
  return (<>
    <ProModal fitur={pm} onClose={() => setPm(null)} />
    <h1>Tampilan</h1><p className="px-sub">Pilih tema, atur warna sendiri kalau mau, pratinjau langsung di samping.</p>
    <div className="px-two">
      <div className="px-card">
        {used.length > 0 && <p className="px-warn" role="status">Khusus Pro dan tidak tampil di halamanmu sekarang: {used.join(', ')}. <button type="button" className="px-lnk" onClick={() => setPm(fiturPro())}>Aktifkan Pro</button> untuk menampilkannya lagi.</p>}
        <section className="px-sec">
          <h2>Tema</h2>
          <div className="px-themes">
            {THEMES.map((x) => {
              const L = !pro && PRO_THEMES.includes(x.key);
              return (
                <button key={x.key} aria-pressed={theme === x.key} onClick={pick(L, `Tema ${x.label}`, 'theme', x.key, () => setTheme(x.key))}>
                  <i className="px-sw" style={{ background: x.bg, boxShadow: `inset -7px 0 0 ${x.accent}` }} aria-hidden="true" />{x.label}{L && <em className="px-pro">Pro</em>}
                </button>
              );
            })}
          </div>
        </section>
        <section className="px-sec">
          <h2>Latar belakang</h2>
          <div className="px-themes" role="group" aria-label="Jenis latar belakang">
            {[['solid', 'Warna tema'], ['gradient', 'Gradasi'], ['image', 'Gambar']].map(([k, lab]) => (
              <button key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{lab}{k === 'image' && !pro && <em className="px-pro">Pro</em>}</button>
            ))}
          </div>
          {mode === 'gradient' && (<>
            <div className="px-colors">
              {[['c1', 'Warna awal'], ['c2', 'Warna akhir']].map(([k, lab]) => (
                <label key={k} className="px-clr">
                  <input type="color" value={bg[k] || '#ffffff'} onChange={(e) => setBg({ ...bg, [k]: e.target.value })} />
                  <span><b>{lab}</b><small>{String(bg[k] || '').toUpperCase()}</small></span>
                </label>
              ))}
            </div>
            <div className="px-chips" role="group" aria-label="Arah gradasi">
              {ANGLES.map(([a, lab]) => (
                <button key={a} type="button" aria-pressed={(bg.angle || 180) === a} onClick={() => setBg({ ...bg, angle: a })}>{lab}</button>
              ))}
            </div>
          </>)}
          {mode === 'image' && (<>
            <p className="px-hint">Gambar dipudarkan ke warna latar tema supaya teks tetap terbaca. Ukurannya diperkecil otomatis di peramban.</p>
            <div className="px-actions">
              <label className="px-btn g sm px-fl">{bg.url ? 'Ganti gambar' : 'Unggah gambar'}
                <input type="file" accept="image/*" className="px-sr" onChange={pro ? upBg : upTrialBg} />
              </label>
              {bg.url && <button className="px-btn g sm" onClick={() => setBg({ t: 'image', url: '', dim })}>Hapus gambar</button>}
            </div>
            <label htmlFor="bgdim">Pudarkan gambar: {dim}%</label>
            <input id="bgdim" type="range" className="px-range" min={0} max={90} step={5} value={dim} onChange={(e) => setBg({ ...bg, t: 'image', dim: Number(e.target.value) })} />
          </>)}
        </section>
        <section className="px-sec">
          <h2>Gaya tombol</h2>
          <div className="px-themes" role="group" aria-label="Gaya tombol">
            {BUTTON_STYLES.map((x) => {
              const L = !pro && PRO_BTNS.includes(x.key);
              return (
                <button key={x.key} aria-pressed={((!pro && tr.btn_style) || m.btn_style || 'bulat') === x.key} onClick={pick(L, `Gaya tombol ${x.label}`, 'btn_style', x.key, () => set('btn_style', x.key))}>
                  <i className={'px-bs ' + x.key} aria-hidden="true" />{x.label}{L && <em className="px-pro">Pro</em>}
                </button>
              );
            })}
          </div>
        </section>
        <section className="px-sec">
          <h2>Font</h2>
          <div className="px-themes" role="group" aria-label="Font">
            {FONTS.map((x) => {
              const L = !pro && PRO_FONTS.includes(x.key);
              return (
                <button key={x.key} aria-pressed={((!pro && tr.font_key) || m.font_key || 'standar') === x.key} onClick={pick(L, `Font ${x.label}`, 'font_key', x.key, () => set('font_key', x.key))}>
                  <span className="px-fs" style={{ fontFamily: x.css }} aria-hidden="true">Aa</span>{x.label}{L && <em className="px-pro">Pro</em>}
                </button>
              );
            })}
          </div>
        </section>
        <section className="px-sec">
          <h2>Warna kustom{!pro && <em className="px-pro">Pro</em>}</h2>
          <p className="px-hint">{pro ? 'Mulai dari tema yang dipilih, lalu ubah warna sesuai selera.' : <>Coba dulu di pratinjau. Warna kustom baru tampil di halamanmu setelah <button type="button" className="px-lnk" onClick={() => setPm('warna')}>Pro aktif</button>.</>}</p>
          <div className="px-colors">
            {COLORS.map(([k, lab]) => (
              <label key={k} className="px-clr">
                <input type="color" value={t[k]} onChange={(e) => (pro ? set('colors', { ...custom, [k]: e.target.value }) : setTr((o) => ({ ...o, colors: { ...custom, [k]: e.target.value } })))} />
                <span><b>{lab}</b><small>{String(t[k]).toUpperCase()}</small></span>
              </label>
            ))}
          </div>
          {warns.map((w) => <p key={w} className="px-warn" role="status">{w}</p>)}
          <div className="px-actions">
            <button className="px-btn g sm" disabled={!Object.keys(custom).length} onClick={() => { clr('colors'); set('colors', {}); }}>Kembalikan warna tema</button>
          </div>
        </section>
        {/* Modal Pro muncul saat menyimpan, kalau masih ada pilihan Pro yang hanya dicoba di pratinjau. Tombol sekunder (kelas g) tidak dicegat. */}
        <div style={{ display: 'contents' }} onClickCapture={(e) => { const b = e.target.closest && e.target.closest('button'); if (trying && b && !b.classList.contains('g')) setPm(fiturPro()); }}><SaveBar /></div>
      </div>
      <PreviewDock low><Phone trial={tr} /></PreviewDock>
    </div>
  </>);
}
