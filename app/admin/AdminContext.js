'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Shell from '../Shell';
import Loader from '../Loader';
const Ctx = createContext(null);
export const useAdmin = () => useContext(Ctx);
const MENU = [['/admin', 'Ringkasan'], ['/admin/pengguna', 'Pengguna']];
const J = { 'Content-Type': 'application/json' };
export function AdminProvider({ children }) {
  const [d, setD] = useState(undefined);
  const [u, setU] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const load = () => fetch('/api/admin').then((r) => (r.ok ? r.json() : null)).then(setD);
  useEffect(() => { load(); }, []);
  if (d === undefined) return <Loader />;
  async function login() {
    setErr('');
    const r = await fetch('/api/admin', { method: 'POST', headers: J, body: JSON.stringify({ mode: 'login', username: u, password: pw }) });
    if (r.ok) load(); else setErr((await r.json()).error || 'Gagal.');
  }
  async function out() {
    await fetch('/api/admin', { method: 'POST', headers: J, body: JSON.stringify({ mode: 'logout' }) });
    setD(null);
  }
  async function tog(id, active) {
    await fetch('/api/admin', { method: 'PATCH', headers: J, body: JSON.stringify({ id, active }) });
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
  return (
    <Ctx.Provider value={{ d, tog }}>
      <Shell title="Admin" menu={MENU} out={out}>{children}</Shell>
    </Ctx.Provider>
  );
}
