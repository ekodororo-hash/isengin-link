'use client';
import { useEffect, useState } from 'react';
import { fmtLeft } from '../countdown';

// Baris link yang belum tayang: tidak bisa diklik, URL tidak dikirim ke browser. Menampilkan hitung mundur,
// lalu memuat ulang halaman begitu waktunya tiba supaya link aslinya muncul.
export default function SoonRow({ title, showMs }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= showMs) { clearInterval(id); setTimeout(() => location.reload(), 800); }
    }, 1000);
    return () => clearInterval(id);
  }, [showMs]);
  const left = now == null ? null : showMs - now;
  return (
    <div className="plink soon" role="group" aria-label={`${title}, belum tayang`}>
      <div className="plink-main">
        <svg className="lico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        <span className="pt">
          {title}
          <span className="pend" aria-live="off">{left == null ? 'Segera' : left > 0 ? `Tayang dalam ${fmtLeft(left)}` : 'Memuat…'}</span>
        </span>
        <span className="psp" aria-hidden="true" />
      </div>
    </div>
  );
}
