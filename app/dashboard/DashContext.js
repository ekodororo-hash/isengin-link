'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Shell from '../Shell';
import Loader from '../Loader';
const Ctx = createContext(null);
export const useDash = () => useContext(Ctx);
const MENU = [['/dashboard', 'Ringkasan'], ['/dashboard/link', 'Link'], ['/dashboard/tampilan', 'Tampilan'], ['/dashboard/profil', 'Profil']];
export function DashProvider({ children }) {
  const [m, setM] = useState(null);
  const [msg, setMsg] = useState('');
  const path = usePathname();
  useEffect(() => {
    fetch('/api/me').then((r) => (r.ok ? r.json() : (location.href = '/', null))).then((d) => d && setM(d));
  }, []);
  useEffect(() => { setMsg(''); }, [path]);
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
  return (
    <Ctx.Provider value={{ m, set, setL, save, up, msg }}>
      <Shell title="isengin.site" menu={MENU} out={out}>{children}</Shell>
    </Ctx.Provider>
  );
}
