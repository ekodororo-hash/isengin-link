'use client';
import { useEffect, useState } from 'react';
import { NamedIcon } from '../icons';

// Tombol QRIS di halaman publik: membuka jendela berisi gambar QRIS milik pemilik halaman.
export default function QrisButton({ title, img }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);
  return (
    <>
      <div className="plink">
        <button type="button" className="plink-main" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <svg className="lico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01" /></svg>
          <span className="pt">{title}</span>
          <span className="psp" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div className="shm-ov" role="dialog" aria-modal="true" aria-label={`QRIS: ${title}`} onClick={() => setOpen(false)}>
          <div className="shm" onClick={(e) => e.stopPropagation()}>
            <div className="shm-top">
              <h2>QRIS</h2>
              <button type="button" className="shm-x" onClick={() => setOpen(false)} aria-label="Tutup"><NamedIcon name="close" size={16} /></button>
            </div>
            <div className="qr-box"><img src={img} alt={`Kode QRIS: ${title}`} /></div>
            <p className="shm-t qr-t">{title}</p>
            <p className="shm-pd qr-d">Scan dengan aplikasi bank atau e-wallet apa pun yang mendukung QRIS.</p>
            <a className="shm-reg" href={img} target="_blank" rel="noopener noreferrer">Buka gambar penuh</a>
          </div>
        </div>
      )}
    </>
  );
}
