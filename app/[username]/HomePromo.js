'use client';
import { useEffect, useState } from 'react';
import { NamedIcon } from '../icons';

// Alamat utama situs. Tautan di popup selalu ke sini, termasuk saat halaman dibuka lewat domain kustom.
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');

// Logo isengin (sama dengan app/icon.svg), digambar langsung supaya tidak terpotong dan warnanya tetap Neo.
function Logo({ className }) {
  return (
    <svg className={className} viewBox="0 0 62 62" aria-hidden="true" focusable="false">
      <rect x="7" y="7" width="54" height="54" rx="12" fill="#1f2255" />
      <rect x="3" y="3" width="54" height="54" rx="12" fill="#ffd23f" stroke="#1f2255" strokeWidth="4" />
      <rect x="13" y="14" width="34" height="9" rx="4.5" fill="#1f2255" />
      <rect x="13" y="25" width="34" height="9" rx="4.5" fill="#ff5a43" />
      <rect x="13" y="36" width="34" height="9" rx="4.5" fill="#1f2255" />
    </svg>
  );
}

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
    window.open(`${SITE}/daftar?ref=${ref}${nm ? '&u=' + encodeURIComponent(nm) : ''}`, '_blank', 'noopener,noreferrer');
  }
  const shown = nm || 'namamu';

  return (
    <>
      <button type="button" className="homebtn" onClick={() => setOpen(true)} aria-label="Buat halamanmu sendiri di isengin.site" aria-haspopup="dialog">
        <Logo />
      </button>
      {open && (
        <div className="hp-ov" role="dialog" aria-modal="true" aria-labelledby="hp-h" onClick={() => setOpen(false)}>
          <div className="hp" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="hp-x" onClick={() => setOpen(false)} aria-label="Tutup"><NamedIcon name="close" size={16} /></button>
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
              <a href={`${SITE}/masuk`}>Sudah punya akun? Masuk</a>
              <a href={SITE}>Pelajari isengin.site</a>
            </div>
            <a className="hp-free" href={`${SITE}/daftar?ref=${ref}`}>Daftar gratis</a>

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
