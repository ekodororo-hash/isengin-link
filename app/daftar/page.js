'use client';
import '../landing.css';
import '../auth.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LinkIcon, NamedIcon } from '../icons';
import { themeStyle } from '@/lib/themes';

const LINKS = [['Pesan lewat WhatsApp', 'https://wa.me/6281234567890'], ['Preset Lightroom (toko)', 'https://tokopedia.com/rani'], ['Video terbaru di YouTube', 'https://youtube.com/@rani'], ['Kirim email', 'mailto:rani@email.com']];

export default function Daftar() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState('');
  const nm = username || 'rani';
  // Kode undangan dari ?ref= disimpan di peramban supaya tidak hilang bila pengunjung baru mendaftar nanti.
  useEffect(() => {
    try {
      const q = (new URLSearchParams(location.search).get('ref') || '').toLowerCase();
      if (/^[a-z0-9_]{3,20}$/.test(q)) localStorage.setItem('ref', q);
      const pu = (new URLSearchParams(location.search).get('u') || '').toLowerCase();
      if (/^[a-z0-9_]{3,20}$/.test(pu)) setU(pu);
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
    <div className="au-wrap">
      <aside className="au-side">
        <Link className="au-logo" href="/">ISENGIN.SITE</Link>
        <div className="au-demo" aria-hidden="true">
          <div className="lp-iph">
            <div className="lp-phone" data-t="neo" style={themeStyle('neo')}>
              <div className="lp-isl" />
              <div className="lp-url">isengin.site/{nm}</div>
              <div className="lp-ava">{nm[0].toUpperCase()}</div>
              <h2 className="lp-name">{nm}</h2>
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
        <p className="au-tag">Pasang di bio, dan lihat berapa kali tiap link diklik.</p>
      </aside>
      <main className="au-main">
        <div className="au-top">
          <Link className="au-back" href="/">&larr; Kembali</Link>
          <Link className="au-mlogo" href="/">ISENGIN.SITE</Link>
        </div>
        <div className="au-box">
          <p className="au-kick">Selamat datang di isengin.site</p>
          <h1 className="au-h1">Buat halamanmu</h1>
          <p className="au-sub">Pilih alamat dan mulai kumpulkan semua link di satu tempat.</p>
          <nav className="au-tabs" aria-label="Masuk atau daftar">
            <Link href="/masuk">Masuk</Link>
            <Link href="/daftar" aria-current="page">Daftar</Link>
          </nav>
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
              <input id="p" type={show ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password} autoComplete="new-password" onChange={(e) => setP(e.target.value)} />
              <button type="button" className="au-show" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
            </div>
            {err && <p className="au-err" role="alert">{err}</p>}
            <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Klaim nama'}</button>
          </form>
          <p className="au-legal"><Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link></p>
        </div>
      </main>
    </div>
  );
}
