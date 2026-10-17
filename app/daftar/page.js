'use client';
import '../auth.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Daftar() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState('');
  // Kode undangan dari ?ref= disimpan di peramban supaya tidak hilang bila pengunjung baru mendaftar nanti.
  useEffect(() => {
    try {
      const q = (new URLSearchParams(location.search).get('ref') || '').toLowerCase();
      if (/^[a-z0-9_]{3,20}$/.test(q)) localStorage.setItem('ref', q);
      const v = localStorage.getItem('ref') || '';
      if (/^[a-z0-9_]{3,20}$/.test(v)) setRef(v);
    } catch {}
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'register', username, password, ref }) });
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
        <h1 className="au-h1">Daftar</h1>
        <p className="au-sub">Pilih alamat halamanmu dan mulai kumpulkan semua link di satu tempat.</p>
        <form className="au-form" onSubmit={submit}>
          {ref && <p className="au-note">Kamu diundang <b>@{ref}</b>. Kalian berdua dapat bonus Pro setelah halamanmu berisi link.</p>}
          <label htmlFor="u">Alamat halamanmu</label>
          <div className="au-field">
            <span>isengin.site/</span>
            <input id="u" placeholder="rani" value={username} maxLength={20} autoComplete="username" spellCheck={false}
              onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
          </div>
          <label htmlFor="p">Sandi</label>
          <div className="au-field">
            <input id="p" type="password" value={password} autoComplete="new-password" onChange={(e) => setP(e.target.value)} />
          </div>
          {err && <p className="au-err" role="alert">{err}</p>}
          <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Klaim nama'}</button>
        </form>
        <p className="au-alt">Sudah punya akun? <Link href="/masuk">Masuk</Link></p>
      </div>
      <p className="au-legal"><Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link></p>
    </main>
  );
}
