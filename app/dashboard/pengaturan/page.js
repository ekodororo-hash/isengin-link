'use client';
import { useEffect, useState } from 'react';
import VerifyBox from '../VerifyBox';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';

// Kekuatan sandi: 0 sampai 4. Panjang paling berpengaruh, lalu ragam jenis karakter.
function strength(p) {
  if (!p) return { score: 0, label: '', tips: [] };
  const tips = [];
  const has = { low: /[a-z]/.test(p), up: /[A-Z]/.test(p), num: /\d/.test(p), sym: /[^A-Za-z0-9]/.test(p) };
  const kinds = Object.values(has).filter(Boolean).length;
  let pts = 0;
  if (p.length >= 8) pts++;
  if (p.length >= 12) pts++;
  if (kinds >= 3) pts++;
  if (kinds === 4 && p.length >= 10) pts++;
  if (/^(.)\1+$/.test(p) || /^(123456|password|qwerty|abcdef|111111|sandi|admin)/i.test(p) || new Set(p).size < 4) pts = 0;
  if (p.length < 8) { pts = Math.min(pts, 1); tips.push('Minimal 8 karakter'); }
  if (p.length < 12 && p.length >= 8) tips.push('12 karakter atau lebih lebih aman');
  if (!(has.up && has.low)) tips.push('Campur huruf besar dan kecil');
  if (!has.num) tips.push('Tambah angka');
  if (!has.sym) tips.push('Tambah simbol');
  const score = Math.min(4, Math.max(p.length >= 1 ? 1 : 0, pts));
  return { score, label: ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][score], tips: tips.slice(0, 3) };
}

async function call(method, body) {
  const r = await fetch('/api/account', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, d };
}
// Kolom sandi dengan tombol Tampilkan/Sembunyikan di dalam kolom, sama seperti halaman masuk.
function Pw({ show, setShow, ...props }) {
  return (
    <div className="px-pw">
      <input type={show ? 'text' : 'password'} {...props} />
      <button type="button" className="px-pwb" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
    </div>
  );
}
const Msg = ({ m }) => (m ? <span role="status" className={'px-msg' + (m.err ? ' err' : '')}>{m.t}</span> : null);

export default function Pengaturan() {
  const p = usePre('/api/account');
  const [acc, setAcc] = useState(p?.ok ? p.data : null);
  const [email, setEmail] = useState(p?.ok ? p.data?.email || '' : '');
  const [em, setEm] = useState(null);
  const [code, setCode] = useState('');
  const [cur, setCur] = useState(''), [nw, setNw] = useState(''), [again, setAgain] = useState('');
  const [show, setShow] = useState(false), [dshow, setDshow] = useState(false);
  const [pm, setPm] = useState(null);
  const [delOpen, setDelOpen] = useState(false);
  const [dpass, setDpass] = useState(''), [dconf, setDconf] = useState('');
  const [dm, setDm] = useState(null);
  const [busy, setBusy] = useState('');
  const st = strength(nw);
  const cleaned = email.trim().toLowerCase();

  useEffect(() => {
    if (p) return;
    fetch('/api/account').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) { setAcc(d); setEmail(d.email || ''); } });
  }, []);

  // Langkah 1: kirim kode ke email (atau hapus email bila kolomnya dikosongkan).
  async function saveEmail(e) {
    e.preventDefault(); setBusy('email'); setEm(null);
    const { ok, d } = await call('PUT', { email });
    if (!ok) setEm({ t: d.error || 'Gagal mengirim kode.', err: true });
    else if (d.pending) { setAcc((a) => ({ ...a, pending: d.pending })); setCode(''); setEm({ t: `Kode dikirim ke ${d.pending}.` }); }
    else { setEmail(d.email || ''); setAcc((a) => ({ ...a, email: d.email || '', verified: !!d.verified, pending: '' })); setEm({ t: d.email ? 'Email sudah terverifikasi.' : 'Email dihapus.' }); }
    setBusy('');
  }
  // Langkah 2: cocokkan kode 6 angka.
  async function confirmCode(e) {
    e.preventDefault(); setBusy('code'); setEm(null);
    const { ok, d } = await call('PUT', { mode: 'verify', code });
    if (ok) { setEmail(d.email); setAcc((a) => ({ ...a, email: d.email, verified: true, pending: '' })); setCode(''); setEm({ t: 'Email terverifikasi.' }); }
    else setEm({ t: d.error || 'Gagal memverifikasi.', err: true });
    setBusy('');
  }
  async function cancelCode() {
    await call('PUT', { mode: 'cancel' });
    setAcc((a) => ({ ...a, pending: '' })); setCode(''); setEm(null);
  }
  async function savePass(e) {
    e.preventDefault(); setPm(null);
    if (nw !== again) { setPm({ t: 'Konfirmasi sandi tidak sama.', err: true }); return; }
    setBusy('pass');
    const { ok, d } = await call('PUT', { mode: 'password', current: cur, next: nw });
    setPm({ t: ok ? 'Sandi diganti.' : d.error || 'Gagal mengganti sandi.', err: !ok });
    if (ok) { setCur(''); setNw(''); setAgain(''); }
    setBusy('');
  }
  async function delAcc(e) {
    e.preventDefault(); setBusy('del'); setDm(null);
    const { ok, d } = await call('DELETE', { password: dpass, confirm: dconf });
    if (ok) { location.href = '/'; return; }
    setDm({ t: d.error || 'Gagal menghapus akun.', err: true });
    setBusy('');
  }

  if (!acc) return (<><h1>Pengaturan</h1><Loader inline /></>);
  return (<>
    <h1>Pengaturan</h1>
    <p className="px-sub">Akun, email, sandi, dan penghapusan akun.</p>
    <div className="px-card">
      <section className="px-sec">
        <h2>Akun</h2>
        <form onSubmit={saveEmail}>
          <label htmlFor="u">Nama pengguna</label>
          <input id="u" value={acc.username} readOnly />
          <p className="px-hint">Alamat halamanmu: isengin.site/{acc.username}. Tidak bisa diubah.</p>
          <label htmlFor="e">Email <span className="px-hint-i">opsional, tapi perlu kalau lupa sandi</span></label>
          <input id="e" type="email" autoComplete="email" placeholder="nama@email.com" value={email} maxLength={120} onChange={(e) => setEmail(e.target.value)} />
          {acc.email && <p className="px-hint">{acc.verified ? <><b>✓ Terverifikasi.</b> Bisa dipakai untuk masuk dan reset sandi.</> : <><b>Belum diverifikasi.</b> Kirim kode supaya email ini bisa dipakai untuk reset sandi.</>}</p>}
          {!acc.email && <p className="px-hint">Kami kirim kode 6 angka untuk memastikan email ini milikmu. Setelah itu kamu bisa masuk dengan email atau nama pengguna, dan reset sandi sendiri kalau lupa.</p>}
          <div className="px-actions">
            <button className="px-btn" disabled={busy === 'email' || (cleaned === (acc.email || '') && (acc.verified || !cleaned))}>{busy === 'email' ? 'Memproses…' : !cleaned ? 'Hapus email' : 'Kirim kode verifikasi'}</button>
            {!acc.pending && <Msg m={em} />}
          </div>
        </form>
        {acc.pending && (
          <form onSubmit={confirmCode} className="px-code">
            <label htmlFor="ec">Kode verifikasi</label>
            <input id="ec" inputMode="numeric" autoComplete="one-time-code" placeholder="6 angka" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <p className="px-hint">Kode dikirim ke <b>{acc.pending}</b> dan berlaku 10 menit. Belum masuk? Cek folder Spam, atau klik Kirim kode verifikasi lagi.</p>
            <div className="px-actions">
              <button className="px-btn" disabled={busy === 'code' || code.length !== 6}>{busy === 'code' ? 'Memeriksa…' : 'Verifikasi'}</button>
              <button type="button" className="px-btn g" onClick={cancelCode}>Batal</button>
              <Msg m={em} />
            </div>
          </form>
        )}
      </section>

      <VerifyBox />

      <section className="px-sec">
        <h2>Ganti sandi</h2>
        <form onSubmit={savePass}>
          <label htmlFor="pc">Sandi saat ini</label>
          <Pw show={show} setShow={setShow} id="pc" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required />
          <label htmlFor="pn">Sandi baru</label>
          <Pw show={show} setShow={setShow} id="pn" autoComplete="new-password" value={nw} maxLength={100} onChange={(e) => setNw(e.target.value)} required aria-describedby="pst" />
          <div className="px-meter" id="pst" data-s={st.score}>
            <div className="px-segs" role="meter" aria-label="Kekuatan sandi" aria-valuemin={0} aria-valuemax={4} aria-valuenow={st.score} aria-valuetext={st.label || 'Belum diisi'}>
              <i /><i /><i /><i />
            </div>
            <b>{st.label}</b>
          </div>
          {st.tips.length > 0 && st.score < 4 && <p className="px-hint">Saran: {st.tips.join(', ')}.</p>}
          <label htmlFor="pa">Ulangi sandi baru</label>
          <Pw show={show} setShow={setShow} id="pa" autoComplete="new-password" value={again} maxLength={100} onChange={(e) => setAgain(e.target.value)} required />
          {again && nw !== again && <p className="px-warn" role="alert">Sandi belum sama.</p>}
          <div className="px-actions">
            <button className="px-btn" disabled={busy === 'pass' || !cur || nw.length < 8 || nw !== again}>{busy === 'pass' ? 'Menyimpan…' : 'Ganti sandi'}</button>
            <Msg m={pm} />
          </div>
        </form>
      </section>

      <section className="px-sec px-danger">
        <h2>Hapus akun</h2>
        <p className="px-hint">Semua link, gambar, dan statistikmu akan dihapus dan halaman isengin.site/{acc.username} tidak bisa dibuka lagi. Tindakan ini tidak bisa dibatalkan.</p>
        {!delOpen ? (
          <div className="px-actions"><button className="px-btn d" onClick={() => setDelOpen(true)}>Hapus akun</button></div>
        ) : (
          <form onSubmit={delAcc}>
            <label htmlFor="dc">Ketik <b>{acc.username}</b> untuk konfirmasi</label>
            <input id="dc" value={dconf} autoComplete="off" onChange={(e) => setDconf(e.target.value)} required />
            <label htmlFor="dp">Sandi</label>
            <Pw show={dshow} setShow={setDshow} id="dp" autoComplete="current-password" value={dpass} onChange={(e) => setDpass(e.target.value)} required />
            <div className="px-actions">
              <button className="px-btn d" disabled={busy === 'del' || dconf.trim().toLowerCase() !== acc.username || !dpass}>{busy === 'del' ? 'Menghapus…' : 'Hapus akun saya'}</button>
              <button type="button" className="px-btn g" onClick={() => { setDelOpen(false); setDconf(''); setDpass(''); setDm(null); }}>Batal</button>
              <Msg m={dm} />
            </div>
          </form>
        )}
      </section>
    </div>
  </>);
}
