'use client';
import '../landing.css';
import '../auth.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { themeStyle } from '@/lib/themes';

export default function Masuk() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Pesan error hilang otomatis setelah beberapa detik, tidak menempel permanen.
  useEffect(() => {
    if (!err) return;
    const id = setTimeout(() => setErr(''), 3000);
    return () => clearTimeout(id);
  }, [err]);

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
            <div className="lp-phone au-rk" data-t="neo" style={themeStyle('neo')}>
              <div className="lp-isl" />
              <h2 className="au-rk-h">Ringkasan</h2>
              <p className="au-rk-u">isengin.site/namamu</p>
              <div className="au-rk-grid">
                <div className="au-rk-c"><b>23</b><span>Total klik</span></div>
                <div className="au-rk-c"><b>4</b><span>Link tampil</span></div>
                <div className="au-rk-c au-rk-w"><b>87</b><span>Kunjungan</span></div>
              </div>
              <div className="au-rk-c au-rk-chart">
                <strong>Per hari</strong>
                <span className="au-rk-n">23 klik dalam 14 hari terakhir</span>
                <div className="au-rk-bars">
                  {[0, 1, 0, 2, 1, 0, 3, 1, 2, 0, 4, 2, 1, 6].map((v, n) => (
                    <i key={n} style={{ height: Math.max(2, (v / 6) * 100) + '%' }} />
                  ))}
                </div>
              </div>
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
              <input id="u" value={username} maxLength={120} autoComplete="username" spellCheck={false}
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
