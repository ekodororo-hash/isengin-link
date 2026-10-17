'use client';
import { useEffect, useState } from 'react';
import { NamedIcon } from '../icons';

// Tombol rumah di kiri atas halaman publik. Diketuk membuka kartu ajakan daftar (bukan pindah halaman).
// Hanya dirender di peramban setelah diklik, jadi aman memakai window/document.
export default function HomePromo({ pageUsername, pageName }) {
  const [open, setOpen] = useState(false);
  const [nm, setNm] = useState('');
  const ref = encodeURIComponent(pageUsername);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  function claim(e) {
    e.preventDefault();
    window.open(`/daftar?ref=${ref}${nm ? '&u=' + encodeURIComponent(nm) : ''}`, '_blank', 'noopener,noreferrer');
  }
  const shown = nm || 'namamu';

  return (
    <>
      <button type="button" className="homebtn" onClick={() => setOpen(true)} aria-label="Buat halamanmu sendiri di isengin.site" aria-haspopup="dialog">
        <NamedIcon name="home" size={18} />
      </button>
      {open && (
        <div className="hp-ov" role="dialog" aria-modal="true" aria-labelledby="hp-h" onClick={() => setOpen(false)}>
          <div className="hp" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="hp-x" onClick={() => setOpen(false)} aria-label="Tutup"><NamedIcon name="close" size={16} /></button>
            <div className="hp-brand"><img src="/icon.svg" width="40" height="40" alt="" />ISENGIN.SITE</div>
            <h2 id="hp-h" className="hp-h">Satu link untuk <span>semua kontenmu.</span></h2>
            <p className="hp-p">Gabung dengan {pageName || pageUsername}. Kumpulkan WhatsApp, Instagram, toko online, dan video di satu halaman.</p>

            <form className="hp-form" onSubmit={claim}>
              <label className="hp-field">
                <span>isengin.site/</span>
                <input value={nm} placeholder="namamu" maxLength={20} autoComplete="off" spellCheck={false} aria-label="Pilih alamat halamanmu"
                  onChange={(e) => setNm(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
              </label>
              <button type="submit" className="hp-claim">Klaim nama</button>
            </form>

            <div className="hp-links">
              <a href="/masuk">Sudah punya akun? Masuk</a>
              <a href="/">Pelajari isengin.site</a>
            </div>
            <a className="hp-free" href={`/daftar?ref=${ref}`}>Daftar gratis</a>

            <div className="hp-ph" aria-hidden="true">
              <i className="hp-a" />
              <b>{shown}</b>
              <u /><u /><u />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
