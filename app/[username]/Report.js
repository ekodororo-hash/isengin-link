'use client';
import { useEffect, useRef, useState } from 'react';
const REASONS = [['penipuan', 'Penipuan atau phishing'], ['dewasa', 'Konten dewasa'], ['kekerasan', 'Kekerasan atau kebencian'], ['tiruan', 'Menyamar sebagai orang lain'], ['spam', 'Spam'], ['lainnya', 'Lainnya']];

// Titik tiga polos di kanan atas halaman publik. Diketuk membuka menu kecil "Laporkan halaman ini",
// lalu formulir laporan tampil di kartu tengah layar. Pengunjung tidak perlu masuk akun.
export default function Report({ username }) {
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('penipuan');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const out = (e) => { if (box.current && !box.current.contains(e.target)) setMenu(false); };
    const key = (e) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('pointerdown', out);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', key); };
  }, [menu]);

  function close() { setOpen(false); setMsg(''); if (done) { setDone(false); setDetail(''); } }

  useEffect(() => {
    if (!open) return;
    const key = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, done]);

  async function send(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, reason, detail }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setDone(true); else setMsg(d.error || 'Gagal mengirim laporan.');
    } catch { setMsg('Gagal mengirim laporan. Periksa koneksi, lalu coba lagi.'); }
    setBusy(false);
  }

  return (
    <>
      <div className="rep-corner" ref={box}>
        <button type="button" className="rep-dots" onClick={() => setMenu((m) => !m)} aria-label="Lainnya" aria-haspopup="menu" aria-expanded={menu}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="4.5" cy="12" r="2.3" /><circle cx="12" cy="12" r="2.3" /><circle cx="19.5" cy="12" r="2.3" /></svg>
        </button>
        {menu && (
          <div className="rep-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => { setMenu(false); setOpen(true); }}>Laporkan halaman ini</button>
          </div>
        )}
      </div>
      {open && (
        <div className="rep-ov" onClick={close}>
          <div className="rep-card" role="dialog" aria-modal="true" aria-labelledby="rep-t" onClick={(e) => e.stopPropagation()}>
            <h2 id="rep-t" className="rep-t">Laporkan halaman ini</h2>
            {done ? (
              <>
                <p className="rep-ok" role="status">Terima kasih, laporanmu sudah kami terima.</p>
                <div className="rep-act"><button type="button" onClick={close}>Tutup</button></div>
              </>
            ) : (
              <form className="rep" onSubmit={send}>
                <label htmlFor="rep-r">Alasan</label>
                <select id="rep-r" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                </select>
                <label htmlFor="rep-d">Keterangan (opsional)</label>
                <textarea id="rep-d" rows={3} maxLength={300} value={detail} onChange={(e) => setDetail(e.target.value)} />
                {msg && <p className="rep-err" role="alert">{msg}</p>}
                <div className="rep-act">
                  <button type="submit" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim laporan'}</button>
                  <button type="button" onClick={close}>Batal</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
