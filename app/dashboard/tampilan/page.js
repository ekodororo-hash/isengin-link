'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
import { BUTTON_STYLES, FONTS } from '@/lib/style';
import { THEMES, ANGLES, themeWith, cleanColors, contrast } from '@/lib/themes';
const COLORS = [['bg', 'Latar'], ['ink', 'Teks'], ['btn', 'Tombol link'], ['accent', 'Aksen']];
export default function Tampilan() {
  const { m, set, setTheme, upBg } = useDash();
  const t = themeWith(m.theme, m.colors);
  const custom = cleanColors(m.colors);
  const bg = m.bg || {};
  const mode = bg.t === 'gradient' || bg.t === 'image' ? bg.t : 'solid';
  const dim = Number.isFinite(+bg.dim) ? +bg.dim : 40;
  const setMode = (md) => {
    if (md === 'solid') set('bg', {});
    else if (md === 'gradient') set('bg', { t: 'gradient', c1: bg.c1 || t.bg, c2: bg.c2 || t.accent, angle: bg.angle || 180 });
    else set('bg', { t: 'image', url: bg.url || '', dim });
  };
  const warns = [];
  if (mode === 'solid' && contrast(t.ink, t.bg) < 4.5) warns.push('Teks sulit dibaca di atas warna latar. Coba warna yang lebih kontras.');
  if (mode === 'gradient' && [bg.c1, bg.c2].some((c) => /^#[0-9a-f]{6}$/i.test(c || '') && contrast(t.ink, c) < 4.5)) warns.push('Teks sulit dibaca di atas salah satu warna gradasi. Coba warna yang lebih kontras dengan warna teks.');
  if (contrast(t.ink, t.btn) < 4.5) warns.push('Teks sulit dibaca di atas warna tombol link.');
  if (contrast(t.accent, t.bg) < 3) warns.push('Warna aksen terlalu mirip latar, huruf di foto profil jadi susah dibaca.');
  return (<>
    <h1>Tampilan</h1><p className="px-sub">Pilih tema, atur warna sendiri kalau mau, pratinjau langsung di samping.</p>
    <div className="px-two">
      <div className="px-card">
        <section className="px-sec">
          <h2>Tema</h2>
          <div className="px-themes">
            {THEMES.map((x) => (
              <button key={x.key} aria-pressed={m.theme === x.key} onClick={() => setTheme(x.key)}>
                <i className="px-sw" style={{ background: x.bg, boxShadow: `inset -7px 0 0 ${x.accent}` }} aria-hidden="true" />{x.label}
              </button>
            ))}
          </div>
        </section>
        <section className="px-sec">
          <h2>Latar belakang</h2>
          <div className="px-themes" role="group" aria-label="Jenis latar belakang">
            {[['solid', 'Warna tema'], ['gradient', 'Gradasi'], ['image', 'Gambar']].map(([k, lab]) => (
              <button key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{lab}</button>
            ))}
          </div>
          {mode === 'gradient' && (<>
            <div className="px-colors">
              {[['c1', 'Warna awal'], ['c2', 'Warna akhir']].map(([k, lab]) => (
                <label key={k} className="px-clr">
                  <input type="color" value={bg[k] || '#ffffff'} onChange={(e) => set('bg', { ...bg, [k]: e.target.value })} />
                  <span><b>{lab}</b><small>{String(bg[k] || '').toUpperCase()}</small></span>
                </label>
              ))}
            </div>
            <div className="px-chips" role="group" aria-label="Arah gradasi">
              {ANGLES.map(([a, lab]) => (
                <button key={a} type="button" aria-pressed={(bg.angle || 180) === a} onClick={() => set('bg', { ...bg, angle: a })}>{lab}</button>
              ))}
            </div>
          </>)}
          {mode === 'image' && (<>
            <p className="px-hint">Gambar dipudarkan ke warna latar tema supaya teks tetap terbaca. Ukurannya diperkecil otomatis di peramban.</p>
            <div className="px-actions">
              <label className="px-btn g sm px-fl">{bg.url ? 'Ganti gambar' : 'Unggah gambar'}
                <input type="file" accept="image/*" className="px-sr" onChange={upBg} />
              </label>
              {bg.url && <button className="px-btn g sm" onClick={() => set('bg', { t: 'image', url: '', dim })}>Hapus gambar</button>}
            </div>
            <label htmlFor="bgdim">Pudarkan gambar: {dim}%</label>
            <input id="bgdim" type="range" className="px-range" min={0} max={90} step={5} value={dim} onChange={(e) => set('bg', { ...bg, t: 'image', dim: Number(e.target.value) })} />
          </>)}
        </section>
        <section className="px-sec">
          <h2>Gaya tombol</h2>
          <div className="px-themes" role="group" aria-label="Gaya tombol">
            {BUTTON_STYLES.map((x) => (
              <button key={x.key} aria-pressed={(m.btn_style || 'bulat') === x.key} onClick={() => set('btn_style', x.key)}>
                <i className={'px-bs ' + x.key} aria-hidden="true" />{x.label}
              </button>
            ))}
          </div>
        </section>
        <section className="px-sec">
          <h2>Font</h2>
          <div className="px-themes" role="group" aria-label="Font">
            {FONTS.map((x) => (
              <button key={x.key} aria-pressed={(m.font_key || 'standar') === x.key} onClick={() => set('font_key', x.key)}>
                <span className="px-fs" style={{ fontFamily: x.css }} aria-hidden="true">Aa</span>{x.label}
              </button>
            ))}
          </div>
        </section>
        <section className="px-sec">
          <h2>Warna kustom</h2>
          <p className="px-hint">Mulai dari tema yang dipilih, lalu ubah warna sesuai selera.</p>
          <div className="px-colors">
            {COLORS.map(([k, lab]) => (
              <label key={k} className="px-clr">
                <input type="color" value={t[k]} onChange={(e) => set('colors', { ...custom, [k]: e.target.value })} />
                <span><b>{lab}</b><small>{String(t[k]).toUpperCase()}</small></span>
              </label>
            ))}
          </div>
          {warns.map((w) => <p key={w} className="px-warn" role="status">{w}</p>)}
          <div className="px-actions">
            <button className="px-btn g sm" disabled={!Object.keys(custom).length} onClick={() => set('colors', {})}>Kembalikan warna tema</button>
          </div>
        </section>
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
