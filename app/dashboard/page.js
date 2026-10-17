'use client';
import { useEffect, useState } from 'react';
const THEMES = ['kobalt', 'permen', 'hutan'];
export default function Dashboard() {
  const [m, setM] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    fetch('/api/me').then((r) => (r.ok ? r.json() : (location.href = '/', null))).then((d) => d && setM(d));
  }, []);
  if (!m) return <main className="page"><p>Memuat…</p></main>;
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
  return (
    <main className="page">
      <h1>Atur halamanmu</h1>
      <p className="lead"><a style={{ color: '#ffd84d' }} href={`/${m.username}`} target="_blank">isengin.site/{m.username}</a></p>
      <div className="box">
        <label htmlFor="f">Foto profil</label>
        {m.photo_url && <img src={m.photo_url} alt="" width="72" height="72" style={{ borderRadius: '50%', objectFit: 'cover' }} />}
        <input id="f" type="file" accept="image/*" onChange={up} />
        <label htmlFor="n">Nama tampilan</label>
        <input id="n" value={m.display_name || ''} onChange={(e) => set('display_name', e.target.value)} maxLength={40} />
        <label htmlFor="b">Bio</label>
        <textarea id="b" rows={3} value={m.bio || ''} onChange={(e) => set('bio', e.target.value)} maxLength={160} />
        <label>Tema</label>
        <div className="themes">
          {THEMES.map((t) => <button key={t} aria-pressed={m.theme === t} onClick={() => set('theme', t)}>{t}</button>)}
        </div>
        <label>Link</label>
        {m.links.map((l, i) => (
          <div key={l.id || 'n' + i} style={{ display: 'grid', gap: 6 }}>
            <div className="row">
              <input aria-label="Judul link" placeholder="Judul, mis. Pesan lewat WhatsApp" value={l.title} onChange={(e) => setL(i, 'title', e.target.value)} />
              <button className="btn ghost" onClick={() => set('links', m.links.filter((_, j) => j !== i))}>Hapus</button>
            </div>
            <input aria-label="Alamat link" placeholder="https://..." value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
            {l.id && <span className="small">{l.clicks} klik</span>}
          </div>
        ))}
        <button className="btn ghost" onClick={() => set('links', [...m.links, { title: '', url: '' }])}>Tambah link</button>
        <button className="btn" onClick={save}>Simpan</button>
        {msg && <p className="small" role="status">{msg}</p>}
        <button className="btn ghost" onClick={out}>Keluar</button>
      </div>
    </main>
  );
}
