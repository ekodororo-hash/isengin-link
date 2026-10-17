'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
import { SOCIALS, socialHref } from '@/lib/socials';
export default function Profil() {
  const { m, set, up } = useDash();
  const soc = m.socials || {};
  return (<>
    <h1>Profil</h1><p className="px-sub">Foto, nama, bio, dan ikon sosial media yang tampil di halamanmu.</p>
    <div className="px-two">
      <div className="px-card">
        <label htmlFor="f">Foto profil</label>
        <input id="f" type="file" accept="image/*" onChange={up} />
        <label htmlFor="n">Nama tampilan</label>
        <input id="n" value={m.display_name || ''} maxLength={40} onChange={(e) => set('display_name', e.target.value)} />
        <label htmlFor="b">Bio</label>
        <textarea id="b" rows={3} maxLength={160} value={m.bio || ''} onChange={(e) => set('bio', e.target.value)} />
        <label>Ikon sosial media</label>
        <p className="px-hint">Tampil sebagai ikon kecil di bawah bio. Isi username, nomor, atau link lengkap, dan kosongkan yang tidak dipakai. Klik ikon ini tidak masuk hitungan klik link.</p>
        <div className="px-socs">
          {SOCIALS.map((s) => {
            const v = soc[s.key] || '';
            const bad = v.trim() && !socialHref(s.key, v);
            return (
              <div key={s.key}>
                <label htmlFor={`s-${s.key}`}>{s.label}</label>
                <input id={`s-${s.key}`} value={v} maxLength={100} placeholder={s.ph} autoComplete="off" spellCheck={false}
                  onChange={(e) => set('socials', { ...soc, [s.key]: e.target.value })} />
                {bad && <p className="px-warn" role="alert">Format belum dikenali, ikon ini tidak akan disimpan.</p>}
              </div>
            );
          })}
        </div>
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
