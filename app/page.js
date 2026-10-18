'use client';
import './landing.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { themeStyle } from '@/lib/themes';
import { LinkIcon, NamedIcon } from './icons';

const LINKS = [['Pesan lewat WhatsApp', 'https://wa.me/6281234567890'], ['Preset Lightroom (toko)', 'https://tokopedia.com/rani'], ['Video terbaru di YouTube', 'https://youtube.com/@rani'], ['Kirim email', 'mailto:rani@email.com']];

export default function Home() {
  const [mode, setMode] = useState('register');
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const t = 'neo';
  const nm = username || 'rani';
  const [ref, setRef] = useState('');
  const [refShown, setRefShown] = useState(false);

  // Pesan error hilang otomatis setelah beberapa detik, tidak menempel permanen.
  useEffect(() => {
    if (!err) return;
    const id = setTimeout(() => setErr(''), 3000);
    return () => clearTimeout(id);
  }, [err]);
  // Kode undangan dari ?ref= disimpan di peramban supaya tidak hilang bila pengunjung baru mendaftar nanti.
  // Notifikasi "Kamu diundang" hanya muncul kalau ?ref= memang ada di URL kunjungan ini,
  // bukan tiap kali buka halaman polos karena ada sisa kode lama di localStorage.
  useEffect(() => {
    try {
      const q = (new URLSearchParams(location.search).get('ref') || '').toLowerCase();
      if (/^[a-z0-9_]{3,20}$/.test(q)) {
        localStorage.setItem('ref', q);
        setRef(q);
        setRefShown(true);
      } else {
        const v = localStorage.getItem('ref') || '';
        if (/^[a-z0-9_]{3,20}$/.test(v)) setRef(v);
      }
    } catch {}
  }, []);

  async function go() {
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, username, password, ref }) });
      const d = await r.json();
      if (r.ok) { location.href = '/dashboard'; return; }
      setErr(d.error || 'Gagal.');
    } catch { setErr('Gagal terhubung. Coba lagi.'); }
    setBusy(false);
  }

  return (<>
    <header className="lp-nav">
      <Link className="lp-brand" href="/">ISENGIN.SITE</Link>
      <nav className="lp-nbtn" aria-label="Akun">
        <Link className="lp-nb" href="/masuk">Masuk</Link>
        <Link className="lp-nb r" href="/daftar">Daftar</Link>
      </nav>
    </header>
    <main className="lp-wrap">
      <section>
        <h1 className="lp-h1">Satu link untuk semua kontenmu.</h1>
        <p className="lp-lead">Kumpulkan WhatsApp, Instagram, toko online, dan video di satu halaman. Pasang di bio, dan lihat berapa kali tiap link diklik.</p>
        <div className="lp-claim">
          {refShown && mode === 'register' && <p className="lp-note">Kamu diundang <b>@{ref}</b>. Kalian berdua dapat bonus Pro setelah halamanmu berisi link.</p>}
          <label htmlFor="u">{mode === 'register' ? 'Pilih alamat halamanmu' : 'Nama pengguna atau email'}</label>
          <div className="lp-field">
            {mode === 'register' && <span>isengin.site/</span>}
            <input id="u" placeholder={mode === 'register' ? 'rani' : 'rani atau nama@email.com'} value={username} maxLength={mode === 'register' ? 20 : 120} autoComplete="username" spellCheck={false}
              onChange={(e) => setU(e.target.value.toLowerCase().replace(mode === 'register' ? /[^a-z0-9_]/g : /[^a-z0-9_@.+-]/g, ''))} />
          </div>
          <label htmlFor="p">Sandi</label>
          <div className="lp-field">
            <input id="p" type={show ? 'text' : 'password'} value={password} onChange={(e) => setP(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            <button type="button" className="lp-show" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
          </div>
          {err && <p className="lp-err" role="alert">{err}</p>}
          <button className="lp-btn" onClick={go} disabled={busy}>{busy ? 'Memproses...' : (mode === 'register' ? 'Klaim nama' : 'Masuk')}</button>
          <button className="lp-btn alt" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setErr(''); }}>
            {mode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </section>

      <section aria-label="Contoh halaman">
        <div className="lp-iph">
        <div className="lp-phone" data-t={t} style={themeStyle(t)}>
          <div className="lp-isl" aria-hidden="true" />
          <div className="lp-url">isengin.site/{nm}</div>
          <div className="lp-ava" aria-hidden="true">{nm[0].toUpperCase()}</div>
          <h2 className="lp-name">{nm}</h2>
          <p className="lp-bio">Fotografer lepas. Pesan sesi foto atau lihat karya terbaru di bawah.</p>
          {LINKS.map(([l, u]) => (
            <div key={l} className="lp-link">
              <LinkIcon url={u} />
              <span className="lp-lt">{l}</span>
              <span className="lp-dots" aria-hidden="true"><NamedIcon name="dots" size={18} /></span>
            </div>
          ))}
          <div className="lp-foot">Dibuat di isengin.site</div>
        </div>
        </div>
        <p className="lp-legal">
          <a href="/privasi">Kebijakan Privasi</a> · <a href="/syarat">Syarat Layanan</a>
        </p>
      </section>
    </main>
  </>);
}
