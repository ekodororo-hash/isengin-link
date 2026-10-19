'use client';
import { useEffect, useState } from 'react';

const MSG = {
  ok: ['ok', 'Tersedia'],
  taken: ['bad', 'Sudah dipakai'],
  reserved: ['bad', 'Tidak boleh'],
};

// Cek ketersediaan nama pengguna otomatis (jeda 400 ms setelah berhenti mengetik). Mengembalikan { cls, text } atau null.
export default function useUsernameCheck(username, enabled = true) {
  const [res, setRes] = useState(null);
  useEffect(() => {
    setRes(null);
    if (!enabled || !/^[a-z0-9_]{3,20}$/.test(username)) return;
    const ctl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await fetch('/api/username?u=' + encodeURIComponent(username), { signal: ctl.signal });
        const d = await r.json();
        const m = MSG[d.status];
        setRes(m ? { cls: m[0], text: m[1] } : null);
      } catch { /* diam saja: pengecekan akhir tetap di server saat daftar */ }
    }, 400);
    return () => { clearTimeout(id); ctl.abort(); };
  }, [username, enabled]);
  return res;
}

// Keterangan status di sebelah label "alamat halamanmu": ikon SVG + teks. Tidak menampilkan apa-apa bila belum ada hasil.
export function UnHint({ cek }) {
  if (!cek) return null;
  const ok = cek.cls === 'ok';
  return (
    <span className={'un-hint ' + cek.cls} role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ok ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
      </svg>
      {cek.text}
    </span>
  );
}
