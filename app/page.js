'use client';
import { useState } from 'react';
export default function Home() {
  const [mode, setMode] = useState('register');
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState('');
  async function go() {
    setErr('');
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, username, password }) });
    const d = await r.json();
    if (r.ok) location.href = '/dashboard'; else setErr(d.error || 'Gagal.');
  }
  return (
    <main className="page">
      <h1>Satu link untuk semua kontenmu.</h1>
      <p className="lead">Kumpulkan WhatsApp, Instagram, toko online, dan video di satu halaman, lalu lihat berapa kali tiap link diklik.</p>
      <div className="box">
        <label htmlFor="u">Nama halaman (isengin.site/nama)</label>
        <input id="u" value={username} onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} maxLength={20} autoComplete="username" />
        <label htmlFor="p">Sandi</label>
        <input id="p" type="password" value={password} onChange={(e) => setP(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" onClick={go}>{mode === 'register' ? 'Buat halaman' : 'Masuk'}</button>
        <button className="btn ghost" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
          {mode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
        </button>
      </div>
    </main>
  );
}
