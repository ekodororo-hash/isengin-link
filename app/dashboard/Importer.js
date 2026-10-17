'use client';
import { useState } from 'react';
import { useDash } from './DashContext';
const norm = (u) => String(u || '').trim().toLowerCase().replace(/\/+$/, '');
const MAX = 30;

// Impor link dari halaman Linktree. Link ditambahkan ke daftar di layar; baru tersimpan setelah klik Simpan.
export default function Importer() {
  const { m, set } = useDash();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  async function run(e) {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true); setNote(null);
    try {
      const r = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle: name }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setNote({ t: d.error || 'Gagal mengimpor.', err: true }); setBusy(false); return; }
      const have = new Set(m.links.map((l) => norm(l.url)));
      let room = MAX - m.links.length;
      const add = [];
      let dup = 0, cut = 0;
      for (const l of d.links) {
        if (l.kind === 'header') { if (room > 0) { add.push({ _k: Math.random().toString(36).slice(2), kind: 'header', title: l.title, url: '' }); room--; } continue; }
        if (have.has(norm(l.url))) { dup++; continue; }
        if (room <= 0) { cut++; continue; }
        have.add(norm(l.url));
        add.push({ _k: Math.random().toString(36).slice(2), title: l.title, url: l.url });
        room--;
      }
      // Pembatas yang tidak diikuti link baru dibuang.
      const keep = add.filter((x, i) => x.kind !== 'header' || (add[i + 1] && add[i + 1].kind !== 'header'));
      const n = keep.filter((x) => x.kind !== 'header').length;
      if (!n) { setNote({ t: dup ? 'Semua link dari Linktree itu sudah ada di halamanmu.' : 'Tidak ada link baru yang bisa ditambahkan.', err: true }); setBusy(false); return; }
      set('links', [...m.links, ...keep]);
      const extra = [dup && `${dup} sudah ada`, cut && `${cut} tidak muat (maks. ${MAX})`, d.skipped && `${d.skipped} dibuang karena alamatnya tidak aman`].filter(Boolean).join(', ');
      setNote({ t: `${n} link ditambahkan di bawah${extra ? ` (${extra})` : ''}. Klik Simpan untuk menyimpannya.` });
      setName('');
    } catch { setNote({ t: 'Gagal mengimpor. Periksa koneksi, lalu coba lagi.', err: true }); }
    setBusy(false);
  }
  return (
    <form className="px-card px-imp" onSubmit={run}>
      <b>Pindah dari Linktree?</b>
      <p className="px-hint">Masukkan nama Linktree-mu, link-nya ikut dipindahkan ke daftar di bawah. Foto, warna, dan tema tidak ikut.</p>
      <div className="px-imp-r">
        <input aria-label="Nama atau alamat Linktree" placeholder="namakamu atau linktr.ee/namakamu" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="px-btn g" disabled={busy || !name.trim()} aria-busy={busy}>{busy ? 'Mengambil…' : 'Impor'}</button>
      </div>
      {note && <p className={note.err ? 'px-err' : 'px-msg'} role={note.err ? 'alert' : 'status'}>{note.t}</p>}
    </form>
  );
}
