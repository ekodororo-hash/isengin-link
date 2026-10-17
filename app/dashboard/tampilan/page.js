'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
import { BUTTON_STYLES, FONTS } from '@/lib/style';
import { THEMES, themeWith, cleanColors, contrast } from '@/lib/themes';
const COLORS = [['bg', 'Latar'], ['ink', 'Teks'], ['btn', 'Tombol link'], ['accent', 'Aksen']];
export default function Tampilan() {
  const { m, set, setTheme } = useDash();
  const t = themeWith(m.theme, m.colors);
  const custom = cleanColors(m.colors);
  const warns = [];
  if (contrast(t.ink, t.bg) < 4.5) warns.push('Teks sulit dibaca di atas warna latar. Coba warna yang lebih kontras.');
  if (contrast(t.ink, t.btn) < 4.5) warns.push('Teks sulit dibaca di atas warna tombol link.');
  if (contrast(t.accent, t.bg) < 3) warns.push('Warna aksen terlalu mirip latar, huruf di foto profil jadi susah dibaca.');
  return (<>
    <h1>Tampilan</h1><p className="px-sub">Pilih tema, atur warna sendiri kalau mau, pratinjau langsung di samping.</p>
    <div className="px-two">
      <div className="px-card">
        <section className="px-sec">
          <h2>Tema</h2>
          <div className="px-themes px-themes-g">
            {THEMES.map((x) => (
              <button key={x.key} aria-pressed={m.theme === x.key} onClick={() => setTheme(x.key)}>
                <i className="px-sw" style={{ background: x.bg, boxShadow: `inset -7px 0 0 ${x.accent}` }} aria-hidden="true" />{x.label}
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
        <section className="px-sec">
          <h2>Gaya tombol</h2>
          <div className="px-opts" role="group" aria-label="Gaya tombol">
            {BUTTON_STYLES.map((x) => (
              <button key={x.key} aria-pressed={(m.btn_style || 'bulat') === x.key} onClick={() => set('btn_style', x.key)}>
                <i className={'px-bs ' + x.key} aria-hidden="true" />{x.label}
              </button>
            ))}
          </div>
        </section>
        <section className="px-sec">
          <h2>Font</h2>
          <div className="px-opts" role="group" aria-label="Font">
            {FONTS.map((x) => (
              <button key={x.key} aria-pressed={(m.font_key || 'standar') === x.key} onClick={() => set('font_key', x.key)}>
                <span className="px-fs" style={{ fontFamily: x.css }} aria-hidden="true">Aa</span>{x.label}
              </button>
            ))}
          </div>
        </section>
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
