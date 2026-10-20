'use client';
import { useEffect, useState } from 'react';
import { fmtLeft } from '../countdown';

// Hitung mundur "Berakhir ..." di bawah judul link yang punya jam hilang. Saat habis, halaman dimuat ulang supaya link hilang.
export default function EndCount({ hideMs }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= hideMs) { clearInterval(id); setTimeout(() => location.reload(), 800); }
    }, 1000);
    return () => clearInterval(id);
  }, [hideMs]);
  if (now == null || hideMs - now <= 0) return null;
  return <span className="pend end">Sisa {fmtLeft(hideMs - now)}</span>;
}
