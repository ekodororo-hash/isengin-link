'use client';
import { useEffect, useState } from 'react';

const MSG = {
  ok: ['ok', 'Tersedia'],
  taken: ['bad', 'Sudah dipakai, coba nama lain'],
  reserved: ['bad', 'Nama ini tidak boleh dipakai'],
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
