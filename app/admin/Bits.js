'use client';
import { useState } from 'react';
export const rp = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');
export const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
export const Pill = ({ ok, children }) => <span className={'px-pill' + (ok ? ' ok' : '')}>{children}</span>;
// Isian dengan judul dan keterangan singkat di bawahnya.
export const Field = ({ id, label, hint, children }) => (
  <div className="px-fld">
    <label htmlFor={id}>{label}</label>
    {children}
    {hint && <p className="px-hint">{hint}</p>}
  </div>
);
// Kolom rahasia: tombol Tampilkan di dalam kolom, sama seperti halaman masuk.
export function Secret(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="px-pw">
      <input type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false} {...props} />
      <button type="button" className="px-pwb" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Tampilkan'}</button>
    </div>
  );
}
export const From = ({ f }) => (f ? <span className="px-hint-i">{f === 'admin' ? 'diatur di sini' : 'dari Vercel'}</span> : null);
