'use client';
import './landing.css';
import { useState } from 'react';
import { themeStyle } from '@/lib/themes';

const LINKS = ['Pesan lewat WhatsApp', 'Portofolio di Instagram', 'Preset Lightroom (toko)', 'Video terbaru di YouTube', 'Kirim email'];

export default function Home() {
  const [mode, setMode] = useState('register');
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState('');
  const t = 'kobalt';
  const [c, setC] = useState(LINKS.map(() => 0));
  const nm = username || 'rani';

  async function go() {
    setErr('');
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, username, password }) });
    const d = await r.json();
    if (r.ok) location.href = '/dashboard'; else setErr(d.error || 'Gagal.');
  }

  return (
    <main className="lp-wrap">
      <section>
        <h1 className="lp-h1">Satu link untuk semua kontenmu.</h1>
        <p className="lp-lead">Kumpulkan WhatsApp, Instagram, toko online, dan video di satu halaman. Pasang di bio, dan lihat berapa kali tiap link diklik.</p>
        <div className="lp-claim">
          <label htmlFor="u">{mode === 'register' ? 'Pilih alamat halamanmu' : 'Nama halamanmu'}</label>
          <div className="lp-field">
            <span>isengin.site/</span>
            <input id="u" placeholder="rani" value={username} maxLength={20} autoComplete="username" spellCheck={false}
              onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
          </div>
          <label htmlFor="p">Sandi</label>
          <div className="lp-field">
            <input id="p" type="password" value={password} onChange={(e) => setP(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
          </div>
          {err && <p className="lp-err" role="alert">{err}</p>}
          <button className="lp-btn" onClick={go}>{mode === 'register' ? 'Klaim nama' : 'Masuk'}</button>
          <button className="lp-btn alt" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setErr(''); }}>
            {mode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </section>

      <section aria-label="Contoh halaman">
        <div className="lp-phone" data-t={t} style={themeStyle(t)}>
          <div className="lp-url">isengin.site/{nm}</div>
          <div className="lp-ava" aria-hidden="true">{nm[0].toUpperCase()}</div>
          <h2 className="lp-name">{nm}</h2>
          <p className="lp-bio">Fotografer lepas. Pesan sesi foto atau lihat karya terbaru di bawah.</p>
          {LINKS.map((l, i) => (
            <button key={l} className="lp-link" onClick={() => setC(c.map((x, j) => (j === i ? x + 1 : x)))}>
              <span>{l}</span><span className="lp-cnt">{c[i]}</span>
            </button>
          ))}
          <div className="lp-foot">Dibuat di isengin.site</div>
        </div>
      </section>
    </main>
  );
}
