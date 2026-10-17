'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
export default function Profil() {
  const { m, set, up } = useDash();
  return (<>
    <h1>Profil</h1><p className="px-sub">Foto, nama, dan bio yang tampil di halamanmu.</p>
    <div className="px-two">
      <div className="px-card">
        <label htmlFor="f">Foto profil</label>
        <input id="f" type="file" accept="image/*" onChange={up} />
        <label htmlFor="n">Nama tampilan</label>
        <input id="n" value={m.display_name || ''} maxLength={40} onChange={(e) => set('display_name', e.target.value)} />
        <label htmlFor="b">Bio</label>
        <textarea id="b" rows={3} maxLength={160} value={m.bio || ''} onChange={(e) => set('bio', e.target.value)} />
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
