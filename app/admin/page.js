'use client';
import { useEffect, useState } from 'react';
import Shell from '../Shell';
const MENU = [['ringkasan', 'Ringkasan'], ['pengguna', 'Pengguna']];
export default function Admin() {
  const [d, setD] = useState(undefined);
  const [p, setP] = useState('ringkasan');
  const [u, setU] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const load = () => fetch('/api/admin').then((r) => (r.ok ? r.json() : null)).then(setD);
  useEffect(() => { load(); }, []);
  if (d === undefined) return <main className="px-main"><p>Memuat…</p></main>;
  async function login() {
    setErr('');
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'login', username: u, password: pw }) });
    if (r.ok) load(); else setErr((await r.json()).error || 'Gagal.');
  }
  async function out() {
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'logout' }) });
    setD(null);
  }
  async function tog(id, active) {
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active }) });
    load();
  }
  if (d === null) return (
    <div className="px-app"><main className="px-login px-main">
      <h1>Admin</h1><p className="px-sub">Khusus pemilik situs.</p>
      <div className="px-card">
        <label htmlFor="au">Nama admin</label><input id="au" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
        <label htmlFor="ap">Sandi</label><input id="ap" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        {err && <p className="px-err" role="alert">{err}</p>}
        <p><button className="px-btn" onClick={login}>Masuk</button></p>
      </div>
    </main></div>
  );
  const clicks = d.users.reduce((a, x) => a + x.clicks, 0);
  return (
    <Shell title="Admin" menu={MENU} page={p} go={setP} out={out}>
      {p === 'ringkasan' && (<>
        <h1>Ringkasan situs</h1><p className="px-sub">Semua pengguna isengin.site</p>
        <div className="px-grid">
          <div className="px-card px-stat"><b>{d.users.length}</b><span>Pengguna</span></div>
          <div className="px-card px-stat"><b>{clicks}</b><span>Total klik</span></div>
          <div className="px-card px-stat"><b>{d.users.filter((x) => !x.active).length}</b><span>Dinonaktifkan</span></div>
        </div>
      </>)}
      {p === 'pengguna' && (<>
        <h1>Pengguna</h1><p className="px-sub">Nonaktifkan halaman yang melanggar aturan.</p>
        <div className="px-card px-tw"><table>
          <thead><tr><th>Halaman</th><th>Link</th><th>Klik</th><th>Kunjungan</th><th>Status</th><th></th></tr></thead>
          <tbody>{d.users.map((x) => (
            <tr key={x.id}>
              <td><a href={`/${x.username}`} target="_blank">isengin.site/{x.username}</a></td>
              <td>{x.links}</td><td>{x.clicks}</td><td>{x.views || 0}</td>
              <td><span className={'px-tag' + (x.active ? '' : ' off')}>{x.active ? 'Aktif' : 'Nonaktif'}</span></td>
              <td><button className="px-btn g" onClick={() => tog(x.id, !x.active)}>{x.active ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      </>)}
    </Shell>
  );
}
