'use client';
import '../landing.css';
import '../auth.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { themeStyle } from '@/lib/themes';

const lnk = { background: 'none', border: 0, padding: 0, font: 'inherit', fontWeight: 700, textDecoration: 'underline', color: 'inherit', cursor: 'pointer' };

export default function Lupa() {
  const [step, setStep] = useState(1);
  const [who, setWho] = useState('');
  const [sent, setSent] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!err) return;
    const id = setTimeout(() => setErr(''), 4500);
    return () => clearTimeout(id);
  }, [err]);
  // Jeda sebelum boleh kirim ulang kode.
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  async function post(body) {
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { ok: r.ok, d: await r.json().catch(() => ({})) };
  }

  async function sendCode(e) {
    e?.preventDefault();
    const w = who.trim().toLowerCase().replace(/^@/, '');
    if (!w) { setErr('Isi email atau nama pengguna terlebih dahulu.'); return; }
    setErr(''); setBusy(true);
    try {
      const { ok, d } = await post({ mode: 'forgot', who: w });
      if (ok) { setWho(w); setSent(d.sent || ''); setCode(''); setStep(2); setWait(60); }
      else setErr(d.error || 'Gagal.');
    } catch { setErr('Gagal terhubung. Coba lagi.'); }
    setBusy(false);
  }

  async function reset(e) {
    e.preventDefault();
    if (code.length !== 6) { setErr('Kode terdiri dari 6 angka.'); return; }
    if (pw.length < 8) { setErr('Sandi baru minimal 8 karakter.'); return; }
    if (pw !== pw2) { setErr('Konfirmasi sandi tidak sama.'); return; }
    setErr(''); setBusy(true);
    try {
      const { ok, d } = await post({ mode: 'reset', who, code, password: pw });
      if (ok) { location.href = '/dashboard'; return; }
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
              <div className="au-rk-top">
                <span className="au-rk-brand">ISENGIN.SITE</span>
                <span className="au-rk-burger"><i /><i /><i /></span>
              </div>
              <h2 className="au-rk-h">Ringkasan</h2>
              <p className="au-rk-u">isengin.site/david</p>
              <div className="au-rk-grid">
                <div className="au-rk-card au-rk-stat"><b>23</b><span>Total klik</span></div>
                <div className="au-rk-card au-rk-stat"><b>4</b><span>Link tampil</span></div>
                <div className="au-rk-card au-rk-stat au-rk-w"><b>87</b><span>Kunjungan</span></div>
              </div>
              <div className="au-rk-card">
                <b className="au-rk-ct">Per hari</b>
                <div className="au-rk-seg"><span className="on">Klik</span><span>Kunjungan</span></div>
                <div className="au-rk-seg"><span>7 hari</span><span className="on">14 hari</span><span>30 hari</span></div>
                <p className="au-rk-sum">23 klik dalam 14 hari terakhir</p>
                <div className="au-rk-chart">
                  {[0, 1, 0, 2, 1, 0, 3, 1, 2, 0, 4, 2, 1, 6].map((v, n) => (
                    <div key={n} className="au-rk-col">
                      <span className="au-rk-val">{v || ''}</span>
                      <i style={{ height: `calc((100% - 18px) * ${v / 6})` }} />
                    </div>
                  ))}
                </div>
                <div className="au-rk-axis"><span>5 Okt</span><span>18 Okt</span></div>
              </div>
              <div className="au-rk-card au-rk-mt">
                <b className="au-rk-ct">Peringkat link</b>
              </div>
            </div>
          </div>
        </div>
        <p className="au-tag">Lupa sandi? Tenang, kami kirim kode ke emailmu.</p>
      </aside>
      <main className="au-main">
        <div className="au-top">
          <Link className="au-back" href="/masuk">&larr; Kembali</Link>
          <Link className="au-mlogo" href="/">ISENGIN.SITE</Link>
        </div>
        <div className="au-box">
          <p className="au-kick">Reset sandi</p>
          <h1 className="au-h1">Lupa sandi</h1>
          {step === 1 ? (
            <>
              <p className="au-sub">Masukkan email atau nama penggunamu. Kode 6 angka dikirim ke email terverifikasi akunmu.</p>
              <form className="au-form" onSubmit={sendCode}>
                <div className="au-ugroup">
                  {err && <p className="au-err" role="alert">{err}</p>}
                  <label htmlFor="em">Email atau nama pengguna</label>
                  <div className="au-field">
                    <input id="em" value={who} maxLength={120} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="nama@email.com atau nama pengguna"
                      onChange={(e) => setWho(e.target.value)} />
                  </div>
                </div>
                <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Mengirim...' : 'Kirim kode'}</button>
              </form>
              <p className="au-note" style={{ marginTop: 14 }}>Belum punya email terverifikasi? <Link href="/tentang-kami" style={{ color: 'inherit' }}>Hubungi admin</Link>.</p>
            </>
          ) : (
            <>
              <p className="au-sub">Kode 6 angka sudah dikirim ke <b>{sent}</b>. Cek folder Spam juga. Kode berlaku 10 menit.</p>
              <form className="au-form" onSubmit={reset}>
                <div className="au-ugroup">
                  {err && <p className="au-err" role="alert">{err}</p>}
                  <label htmlFor="cd">Kode dari email</label>
                  <div className="au-field">
                    <input id="cd" inputMode="numeric" autoComplete="one-time-code" placeholder="6 angka" maxLength={6} value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                  </div>
                </div>
                <label htmlFor="np">Sandi baru</label>
                <div className="au-field">
                  <input id="np" type={show ? 'text' : 'password'} value={pw} maxLength={100} autoComplete="new-password" onChange={(e) => setPw(e.target.value)} />
                  <button type="button" className="au-show" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
                </div>
                <label htmlFor="np2">Ulangi sandi baru</label>
                <div className="au-field">
                  <input id="np2" type={show ? 'text' : 'password'} value={pw2} maxLength={100} autoComplete="new-password" onChange={(e) => setPw2(e.target.value)} />
                </div>
                <p className="au-note">Minimal 8 karakter.</p>
                <button className="au-btn" type="submit" disabled={busy}>{busy ? 'Memproses...' : 'Ganti sandi dan masuk'}</button>
              </form>
              <p className="au-note" style={{ marginTop: 20, marginBottom: 0, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
                <button type="button" style={{ ...lnk, opacity: wait > 0 ? 0.5 : 1, cursor: wait > 0 ? 'default' : 'pointer' }} disabled={wait > 0 || busy} onClick={sendCode}>
                  {wait > 0 ? `Kirim ulang kode (${wait} detik)` : 'Kirim ulang kode'}
                </button>
                <span aria-hidden="true">·</span>
                <button type="button" style={lnk} onClick={() => { setStep(1); setErr(''); }}>Ganti akun</button>
              </p>
            </>
          )}
        </div>
        <footer className="au-foot"><Link href="/fitur">Fitur</Link> · <Link href="/tentang-kami">Tentang Kami</Link> · <Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link></footer>
      </main>
    </div>
  );
}
