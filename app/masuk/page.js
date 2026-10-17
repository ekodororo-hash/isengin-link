'use client';
import '../auth.css';
import Link from 'next/link';
import { useState } from 'react';

export default function Masuk() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'login', username, password }) });
      const d = await r.json();
      if (r.ok) { location.href = '/dashboard'; return; }
      setErr(d.error || 'Gagal.');
    } catch { setErr('Gagal terhubung. Coba lagi.'); }
    setBusy(false);
  }

  return (
    <main className="au-wrap">
      <div className="au-card">
        <Link className="au-logo" href="/">ISENGIN.SITE</Link>
        <h1 className="au-h1">Masuk</h1>
        <p className="au-sub">Masuk untuk mengatur link dan melihat jumlah kliknya.</p>
        <form className="au-form" onSubmit={submit}>
          <label htmlFor="u">Nama pengguna atau email</label>
          <div className="au-field">
            <input id="u" placeholder="rani atau nama@email.com" value={username} maxLength={120} autoComplete="username" spellCheck={false}
              onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_@.+-]/g, ''))} />
          </div>
          <label htmlFor="p">Sandi</label>
          <div className="au-field">
            <input id="p" type="password" value={password} autoComplete="current-password" onChange={(e) => setP(e.target.value)} />
          </div>
          {err && <p className="au-err" role="alert">{err}</p>}
          <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Masuk'}</button>
        </form>
        <p className="au-alt">Belum punya akun? <Link href="/daftar">Daftar</Link></p>
      </div>
      <p className="au-legal"><Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link></p>
    </main>
  );
}
