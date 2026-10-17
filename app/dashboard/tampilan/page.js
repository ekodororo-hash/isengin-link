'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
import { THEMES } from '@/lib/themes';
export default function Tampilan() {
  const { m, set } = useDash();
  return (<>
    <h1>Tampilan</h1><p className="px-sub">Pilih tema, pratinjau langsung di samping.</p>
    <div className="px-two">
      <div className="px-card">
        <label>Tema</label>
        <div className="px-themes">
          {THEMES.map((t) => (
            <button key={t.key} aria-pressed={m.theme === t.key} onClick={() => set('theme', t.key)}>
              <i className="px-sw" style={{ background: t.bg, boxShadow: `inset -7px 0 0 ${t.accent}` }} aria-hidden="true" />{t.label}
            </button>
          ))}
        </div>
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
