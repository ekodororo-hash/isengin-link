'use client';
import '../landing.css';
import '../auth.css';
import Link from 'next/link';
import { useState } from 'react';
import { LinkIcon, NamedIcon } from '../icons';
import { themeStyle } from '@/lib/themes';

const LINKS = [['Pesan lewat WhatsApp', 'https://wa.me/6281234567890'], ['Preset Lightroom (toko)', 'https://tokopedia.com/rani'], ['Video terbaru di YouTube', 'https://youtube.com/@rani'], ['Kirim email', 'mailto:rani@email.com']];

export default function Masuk() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [show, setShow] = useState(false);
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
    <div className="au-wrap">
      <aside className="au-side">
        <Link className="au-logo" href="/">ISENGIN.SITE</Link>
        <div className="au-demo" aria-hidden="true">
          <div className="lp-iph">
            <div className="lp-phone" data-t="neo" style={themeStyle('neo')}>
              <div className="lp-isl" />
              <div className="lp-url">isengin.site/{'rani'}</div>
              <div className="lp-ava">{'rani'[0].toUpperCase()}</div>
              <h2 className="lp-name">{'rani'}</h2>
              <p className="lp-bio">Fotografer lepas. Pesan sesi foto atau lihat karya terbaru di bawah.</p>
              {LINKS.map(([l, u]) => (
                <div key={l} className="lp-link">
                  <LinkIcon url={u} />
                  <span className="lp-lt">{l}</span>
                  <span className="lp-dots"><NamedIcon name="dots" size={18} /></span>
                </div>
              ))}
              <div className="lp-foot">Dibuat di isengin.site</div>
            </div>
          </div>
        </div>
        <p className="au-tag">Atur link dan lihat jumlah kliknya dari dashboard.</p>
      </aside>
      <main className="au-main">
        <div className="au-top">
          <Link className="au-back" href="/">&larr; Kembali</Link>
          <Link className="au-mlogo" href="/">ISENGIN.SITE</Link>
        </div>
        <div className="au-box">
          <p className="au-kick">Selamat datang kembali</p>
          <h1 className="au-h1">Masuk ke dashboard</h1>
          <p className="au-sub">Atur link dan lihat jumlah kliknya.</p>
          <nav className="au-tabs" aria-label="Masuk atau daftar">
            <Link href="/masuk" aria-current="page">Masuk</Link>
            <Link href="/daftar">Daftar</Link>
          </nav>
          <form className="au-form" onSubmit={submit}>
            <label htmlFor="u">Nama pengguna atau email</label>
            <div className="au-field">
              <input id="u" placeholder="rani atau nama@email.com" value={username} maxLength={120} autoComplete="username" spellCheck={false}
                onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_@.+-]/g, ''))} />
            </div>
            <label htmlFor="p">Sandi</label>
            <div className="au-field">
              <input id="p" type={show ? 'text' : 'password'} value={password} autoComplete="current-password" onChange={(e) => setP(e.target.value)} />
              <button type="button" className="au-show" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
            </div>
            {err && <p className="au-err" role="alert">{err}</p>}
            <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Masuk'}</button>
          </form>
          <p className="au-legal"><Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link></p>
        </div>
      </main>
    </div>
  );
}
