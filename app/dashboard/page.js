'use client';
import { useEffect, useState } from 'react';
import Shell from '../Shell';
import Loader from '../Loader';
const MENU = [['ringkasan', 'Ringkasan'], ['link', 'Link'], ['tampilan', 'Tampilan'], ['profil', 'Profil']];
export default function Dashboard() {
  const [m, setM] = useState(null);
  const [p, setP] = useState('ringkasan');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    fetch('/api/me').then((r) => (r.ok ? r.json() : (location.href = '/', null))).then((d) => d && setM(d));
  }, []);
  if (!m) return <Loader />;
  const set = (k, v) => setM({ ...m, [k]: v });
  const setL = (i, k, v) => set('links', m.links.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  async function save() {
    const r = await fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
    const d = await r.json();
    if (r.ok) { setM(d); setMsg('Tersimpan.'); } else setMsg(d.error || 'Gagal menyimpan.');
  }
  async function up(e) {
    const f = e.target.files[0];
    if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    if (r.ok) { set('photo_url', d.url); setMsg('Foto terunggah. Klik Simpan.'); } else setMsg(d.error);
  }
  async function out() {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ mode: 'logout' }) });
    location.href = '/';
  }
  const n = m.display_name || m.username;
  const tot = m.links.reduce((a, l) => a + (l.clicks || 0), 0);
  const mx = Math.max(1, ...m.links.map((l) => l.clicks || 0));
  const phone = (
    <div className="px-ph" data-t={m.theme}>
      {m.photo_url ? <img className="a" src={m.photo_url} alt="" /> : <div className="a">{n[0].toUpperCase()}</div>}
      <h3>{n}</h3><p>{m.bio}</p>
      {m.links.map((l, i) => <div className="l" key={i}>{l.title || 'Judul link'}</div>)}
    </div>
  );
  const bar = (
    <p><button className="px-btn" onClick={save}>Simpan</button>{msg && <span role="status">{msg}</span>}</p>
  );
  return (
    <Shell title="isengin.site" menu={MENU} page={p} go={(k) => { setP(k); setMsg(''); }} out={out}>
      {p === 'ringkasan' && (<>
        <h1>Ringkasan</h1>
        <p className="px-sub"><a href={`/${m.username}`} target="_blank">isengin.site/{m.username}</a></p>
        <div className="px-grid">
          <div className="px-card px-stat"><b>{tot}</b><span>Total klik</span></div>
          <div className="px-card px-stat"><b>{m.links.length}</b><span>Link aktif</span></div>
          <div className="px-card px-stat"><b>{m.views || 0}</b><span>Kunjungan halaman</span></div>
        </div>
        <div className="px-card"><b>Klik per link</b>
          {m.links.map((l, i) => (
            <div className="px-bar" key={i}><span>{l.title}</span><i style={{ width: Math.max(4, ((l.clicks || 0) / mx) * 100) + '%' }} /><b>{l.clicks || 0}</b></div>
          ))}
        </div>
      </>)}
      {p === 'link' && (<>
        <h1>Link</h1><p className="px-sub">Urutan di sini sama dengan urutan di halamanmu.</p>
        <div className="px-card">
          {m.links.map((l, i) => (
            <div className="px-row" key={l.id || 'n' + i}>
              <input aria-label="Judul link" placeholder="Judul" value={l.title} onChange={(e) => setL(i, 'title', e.target.value)} />
              <input aria-label="Alamat link" placeholder="https://..." value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
              <button className="px-btn d" onClick={() => set('links', m.links.filter((_, j) => j !== i))}>Hapus</button>
            </div>
          ))}
          <button className="px-btn g" onClick={() => set('links', [...m.links, { title: '', url: '' }])}>Tambah link</button>
          {bar}
        </div>
      </>)}
      {p === 'tampilan' && (<>
        <h1>Tampilan</h1><p className="px-sub">Pilih tema, pratinjau langsung di kanan.</p>
        <div className="px-two">
          <div className="px-card">
            <label>Tema</label>
            <div className="px-themes">
              {['kobalt', 'permen', 'hutan'].map((t) => <button key={t} aria-pressed={m.theme === t} onClick={() => set('theme', t)}>{t}</button>)}
            </div>
            {bar}
          </div>
          <div>{phone}</div>
        </div>
      </>)}
      {p === 'profil' && (<>
        <h1>Profil</h1><p className="px-sub">Foto, nama, dan bio yang tampil di halamanmu.</p>
        <div className="px-two">
          <div className="px-card">
            <label htmlFor="f">Foto profil</label>
            <input id="f" type="file" accept="image/*" onChange={up} />
            <label htmlFor="n">Nama tampilan</label>
            <input id="n" value={m.display_name || ''} maxLength={40} onChange={(e) => set('display_name', e.target.value)} />
            <label htmlFor="b">Bio</label>
            <textarea id="b" rows={3} maxLength={160} value={m.bio || ''} onChange={(e) => set('bio', e.target.value)} />
            {bar}
          </div>
          <div>{phone}</div>
        </div>
      </>)}
    </Shell>
  );
}
