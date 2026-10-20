'use client';
import { useDash } from '../DashContext';
import { Phone, PreviewDock, SaveBar } from '../parts';
import { SOCIALS, socialHref } from '@/lib/socials';
import { NamedIcon } from '../../icons';
import { DAYS } from '@/lib/hours';
export default function Profil() {
  const { m, set, up } = useDash();
  const soc = m.socials || {};
  // Jam buka: daftar 7 teks "JJ:MM-JJ:MM" (kosong = libur). Isian setengah jadi ("09:00-") ikut tersimpan sementara dan dibuang saat disimpan.
  const hrs = DAYS.map((_, i) => (m.hours || [])[i] || '');
  const setDay = (i, a, c) => { const n = [...hrs]; n[i] = a || c ? `${a}-${c}` : ''; set('hours', n); };
  const copyMon = () => { const n = [...hrs]; for (let i = 1; i <= 5; i++) n[i] = hrs[0]; set('hours', n); };
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
        <section className="px-sec">
          <h2>Alamat toko</h2>
          <p className="px-hint">Untuk usaha lokal. Tampil sebagai kartu alamat di bawah link, lengkap dengan tombol “Buka peta” ke Google Maps. Kosongkan alamat untuk menyembunyikannya.</p>
          <label htmlFor="sn">Nama toko <span className="px-hint-i">opsional</span></label>
          <input id="sn" value={m.store_name || ''} maxLength={60} placeholder="mis. Warung Bu Tini" onChange={(e) => set('store_name', e.target.value)} />
          <label htmlFor="sa">Alamat <span className="px-hint-i">{(m.store_addr || '').length}/200</span></label>
          <textarea id="sa" rows={3} maxLength={200} placeholder="Jl. Jenderal Sudirman No. 10, Purbalingga, Jawa Tengah" value={m.store_addr || ''} onChange={(e) => set('store_addr', e.target.value)} />
        </section>
        <section className="px-sec">
          <h2>Pengumuman</h2>
          <p className="px-hint">Satu kalimat di atas link, misalnya libur atau promo. Isi waktu tampil dan hilang (WIB) kalau ingin muncul dan hilang otomatis. Kosongkan teks untuk menyembunyikannya.</p>
          <label htmlFor="nt">Teks <span className="px-hint-i">{(m.note_text || '').length}/200</span></label>
          <textarea id="nt" rows={3} maxLength={200} placeholder="mis. Libur 20 sampai 25 Oktober. Pesanan dibalas setelahnya." value={m.note_text || ''} onChange={(e) => set('note_text', e.target.value)} />
          <div className="px-lk-f">
            <label className="px-sch-l">Tampil mulai
              <input type="datetime-local" aria-label="Pengumuman tampil mulai" value={m.note_from || ''} onChange={(e) => set('note_from', e.target.value)} />
            </label>
            <label className="px-sch-l">Hilang pada
              <input type="datetime-local" aria-label="Pengumuman hilang pada" value={m.note_until || ''} min={m.note_from || undefined} onChange={(e) => set('note_until', e.target.value)} />
            </label>
          </div>
          {(m.note_from || m.note_until) && <button type="button" className="px-btn g sm" onClick={() => { set('note_from', ''); set('note_until', ''); }}>Hapus jadwal</button>}
        </section>
        <section className="px-sec">
          <h2>Jam buka</h2>
          <p className="px-hint">Waktu WIB. Pengunjung melihat “Buka sekarang” atau “Tutup” sesuai jam saat halaman dibuka. Hari yang dikosongkan dianggap libur, dan kalau semua dikosongkan blok ini tidak tampil.</p>
          {DAYS.map((d, i) => {
            const [a = '', c = ''] = hrs[i].split('-');
            return (
              <div className="px-hr" key={d}>
                <b>{d}</b>
                <input type="time" aria-label={`${d} buka`} value={a} onChange={(e) => setDay(i, e.target.value, c)} />
                <input type="time" aria-label={`${d} tutup`} value={c} onChange={(e) => setDay(i, a, e.target.value)} />
                {hrs[i] ? <button type="button" className="px-btn g sm" aria-label={`Libur hari ${d}`} title="Libur" onClick={() => setDay(i, '', '')}>×</button> : <span className="px-hint-i">Libur</span>}
              </div>
            );
          })}
          {hrs[0] && <button type="button" className="px-btn g sm" onClick={copyMon}>Salin jam Senin ke Selasa sampai Sabtu</button>}
        </section>
        <SaveBar />
      </div>
      <PreviewDock low><Phone /></PreviewDock>
    </div>
  </>);
}
