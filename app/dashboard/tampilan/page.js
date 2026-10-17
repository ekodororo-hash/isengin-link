'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
export default function Tampilan() {
  const { m, set } = useDash();
  return (<>
    <h1>Tampilan</h1><p className="px-sub">Pilih tema, pratinjau langsung di kanan.</p>
    <div className="px-two">
      <div className="px-card">
        <label>Tema</label>
        <div className="px-themes">
          {['kobalt', 'permen', 'hutan'].map((t) => <button key={t} aria-pressed={m.theme === t} onClick={() => set('theme', t)}>{t}</button>)}
        </div>
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
