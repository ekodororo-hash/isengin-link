'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Shell from '../Shell';
import Loader from '../Loader';
import { PreCtx, fetchPre, needsPre } from '../prefetch';
const Ctx = createContext(null);
export const useAdmin = () => useContext(Ctx);
const menu = (n, r) => [['/admin', 'Ringkasan'], ['/admin/pengguna', 'Pengguna'], ['/admin/centang', n ? `Centang (${n})` : 'Centang'], ['/admin/referral', 'Referral'], ['/admin/laporan', r ? `Laporan (${r})` : 'Laporan'], ['/admin/pengumuman', 'Pengumuman'], ['/admin/pembayaran', 'Pembayaran'], ['/admin/domain', 'Domain']];
const J = { 'Content-Type': 'application/json' };
export function AdminProvider({ children }) {
  const [d, setD] = useState(undefined);
  const [u, setU] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const load = () => fetch('/api/admin').then((r) => (r.ok ? r.json() : null)).then(setD);
  const path = usePathname();
  const [pre, setPre] = useState(null);
  useEffect(() => { load(); fetchPre(path).then(setPre); }, []);
  // Sama seperti dashboard: pindah menu menampilkan animasi memuat (minimal 0,45 detik) dan mengambil data ulang.
  const [nav, setNav] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setNav(true);
    const t0 = Date.now();
    Promise.all([fetch('/api/admin').then((r) => (r.ok ? r.json() : null)).then(setD).catch(() => {}), fetchPre(path).then(setPre)])
      .then(() => setTimeout(() => setNav(false), Math.max(0, 450 - (Date.now() - t0))));
  }, [path]);
  if (d === undefined || nav || (needsPre(path) && pre?.path !== path)) return <Loader />;
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
  async function verify(id, verified) {
    const r = await fetch('/api/admin', { method: 'PATCH', headers: J, body: JSON.stringify({ id, verified }) });
    if (!r.ok) alert((await r.json().catch(() => ({}))).error || 'Gagal mengubah verifikasi.');
    load();
  }
  async function decide(id, kind, reason = '') {
    const r = await fetch('/api/admin', { method: 'PATCH', headers: J, body: JSON.stringify({ id, decide: kind, reason }) });
    if (!r.ok) alert((await r.json().catch(() => ({}))).error || 'Gagal menyimpan keputusan.');
    load();
  }
  async function pro(id, proDays) {
    const r = await fetch('/api/admin', { method: 'PATCH', headers: J, body: JSON.stringify({ id, proDays }) });
    if (!r.ok) alert((await r.json().catch(() => ({}))).error || 'Gagal mengubah paket.');
    load();
  }
  // Reset sandi manual: server membuat sandi sementara, admin menyalinnya dan mengirimnya ke pemilik akun.
  async function resetPass(id, name) {
    const r = await fetch('/api/admin', { method: 'PATCH', headers: J, body: JSON.stringify({ id, resetPass: true }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { alert(j.error || 'Gagal mereset sandi.'); return; }
    prompt(`Sandi sementara untuk @${name} (salin, kirim ke pemiliknya, lalu minta dia menggantinya di Pengaturan):`, j.temp);
  }
  async function del(id) {
    await fetch('/api/admin', { method: 'DELETE', headers: J, body: JSON.stringify({ id }) });
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
    <Ctx.Provider value={{ d, tog, verify, pro, del, decide, resetPass }}>
      <PreCtx.Provider value={pre}>
        <Shell title="Admin" menu={menu((d.requests || []).length, d.reports || 0)} out={out}>{children}</Shell>
      </PreCtx.Provider>
    </Ctx.Provider>
  );
}
