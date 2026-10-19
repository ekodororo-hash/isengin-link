'use client';
import '../landing.css';
import '../auth.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LinkIcon, NamedIcon } from '../icons';
import { themeStyle } from '@/lib/themes';
import useUsernameCheck, { UnHint } from '../useUsernameCheck';

const LINKS = [['Pesan lewat WhatsApp', 'https://wa.me/6281234567890'], ['Preset Lightroom (toko)', 'https://tokopedia.com/david'], ['Video terbaru di YouTube', 'https://youtube.com/@david'], ['Kirim email', 'mailto:david@email.com']];

export default function Daftar() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState('');
  const [refShown, setRefShown] = useState(false);
  const [refFull, setRefFull] = useState(false); // undangan dari kode ini sudah penuh (batas teman per pengundang)
  const [refMax, setRefMax] = useState(10);
  const cek = useUsernameCheck(username);
  const nm = username || 'david';

  // Pesan error hilang otomatis setelah beberapa detik, tidak menempel permanen.
  useEffect(() => {
    if (!err) return;
    const id = setTimeout(() => setErr(''), 4500);
    return () => clearTimeout(id);
  }, [err]);

  // Kode undangan dari ?ref= disimpan di peramban supaya tidak hilang bila pengunjung baru mendaftar nanti.
  // Notifikasi "Kamu diundang" hanya muncul kalau ?ref= memang ada di URL kunjungan ini,
  // bukan tiap kali buka halaman polos karena ada sisa kode lama di localStorage.
  useEffect(() => {
    try {
      const q = (new URLSearchParams(location.search).get('ref') || '').toLowerCase();
      const pu = (new URLSearchParams(location.search).get('u') || '').toLowerCase();
      if (/^[a-z0-9_]{3,20}$/.test(pu)) setU(pu);
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

  // Cek apakah undangan sudah penuh. Kalau penuh, kode lama dibuang dari peramban dan tidak dikirim saat daftar.
  useEffect(() => {
    if (!ref) return;
    fetch('/api/referral/cek?ref=' + encodeURIComponent(ref)).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.full) { setRefFull(true); setRefMax(d.max || 10); try { localStorage.removeItem('ref'); } catch {} }
    }).catch(() => {});
  }, [ref]);

  async function submit(e) {
    e.preventDefault();
    if (!username.trim() || !password) { setErr('Isi nama atau sandi terlebih dahulu.'); return; }
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'register', username, password, ref: refFull ? '' : ref }) });
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
              <h2 className="lp-name">{username || 'David'}</h2>
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
          <p className="au-sub">Kumpulkan semua link kamu di satu tempat.</p>
          <nav className="au-tabs" aria-label="Masuk atau daftar">
            <Link href="/masuk">Masuk</Link>
            <Link href="/daftar" aria-current="page">Daftar</Link>
          </nav>
          <form className="au-form" onSubmit={submit}>
            {refShown && refFull && <p className="au-note">Undangan dari <b>@{ref}</b> sudah penuh (maksimal {refMax} teman). Kamu tetap bisa daftar, tapi tanpa bonus undangan.</p>}
            {refShown && !refFull && <p className="au-note">Kamu diundang <b>@{ref}</b>. Kalian berdua dapat bonus Pro setelah halamanmu berisi link.</p>}
            <div className="au-ugroup">
              {err && <p className="au-err" role="alert">{err}</p>}
              <div className="un-row"><label htmlFor="u">Alamat halamanmu</label><UnHint cek={cek} /></div>
              <div className="au-field">
                <span>isengin.site/</span>
                <input id="u" value={username} maxLength={20} autoComplete="off" spellCheck={false}
                  onChange={(e) => setU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
              </div>
            </div>
            <label htmlFor="p">Sandi</label>
            <div className="au-field">
              <input id="p" type={show ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password} autoComplete="new-password" onChange={(e) => setP(e.target.value)} />
              <button type="button" className="au-show" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
            </div>
            <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Klaim nama'}</button>
          </form>
          <p className="au-legal"><Link href="/fitur">Fitur</Link> · <Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link></p>
        </div>
      </main>
    </div>
  );
}
