'use client';
import { useDash } from '../DashContext';
import { Phone, SaveBar } from '../parts';
import { SOCIALS, socialHref } from '@/lib/socials';
import { NamedIcon } from '../../icons';
export default function Profil() {
  const { m, set, up } = useDash();
  const soc = m.socials || {};
  return (<>
    <h1>Profil</h1><p className="px-sub">Foto, nama, bio, dan ikon sosial media yang tampil di halamanmu.</p>
    <div className="px-two">
      <div className="px-card">
        <section className="px-sec">
          <h2>Identitas</h2>
          <div className="px-photo">
            {m.photo_url ? <img className="px-av" src={m.photo_url} alt="" /> : <span className="px-av e" aria-hidden="true">{(m.display_name || m.username || '?')[0].toUpperCase()}</span>}
            <div>
              <label className="px-btn g sm px-fl">{m.photo_url ? 'Ganti foto' : 'Unggah foto'}
                <input id="f" type="file" accept="image/*" className="px-sr" onChange={up} />
              </label>
              <p className="px-hint">Foto profil, tampil bulat di halamanmu.</p>
            </div>
          </div>
          <label htmlFor="n">Nama tampilan</label>
          <input id="n" value={m.display_name || ''} maxLength={40} onChange={(e) => set('display_name', e.target.value)} />
          <label htmlFor="b">Bio <span className="px-hint-i">{(m.bio || '').length}/160</span></label>
          <textarea id="b" rows={3} maxLength={160} value={m.bio || ''} onChange={(e) => set('bio', e.target.value)} />
        </section>
        <section className="px-sec">
          <h2>Ikon sosial media</h2>
          <p className="px-hint">Tampil sebagai ikon kecil di bawah bio. Isi username, nomor, atau link lengkap, dan kosongkan yang tidak dipakai. Klik ikon ini tidak masuk hitungan klik link.</p>
          <div className="px-socs">
            {SOCIALS.map((s) => {
              const v = soc[s.key] || '';
              const bad = v.trim() && !socialHref(s.key, v);
              return (
                <div key={s.key}>
                  <label htmlFor={`s-${s.key}`} className="px-sl"><NamedIcon name={s.key} size={16} />{s.label}</label>
                  <input id={`s-${s.key}`} value={v} maxLength={100} placeholder={s.ph} autoComplete="off" spellCheck={false}
                    onChange={(e) => set('socials', { ...soc, [s.key]: e.target.value })} />
                  {bad && <p className="px-warn" role="alert">Format belum dikenali, ikon ini tidak akan disimpan.</p>}
                </div>
              );
            })}
          </div>
        </section>
        <SaveBar />
      </div>
      <div><Phone /></div>
    </div>
  </>);
}
