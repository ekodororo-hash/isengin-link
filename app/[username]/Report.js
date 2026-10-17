'use client';
import { useState } from 'react';
const REASONS = [['penipuan', 'Penipuan atau phishing'], ['dewasa', 'Konten dewasa'], ['kekerasan', 'Kekerasan atau kebencian'], ['tiruan', 'Menyamar sebagai orang lain'], ['spam', 'Spam'], ['lainnya', 'Lainnya']];

// Tombol kecil di kaki halaman publik. Pengunjung tidak perlu masuk akun.
// inline: tampil sebaris dengan tautan lain (Kebijakan Privasi · Syarat Layanan) alih-alih di baris sendiri.
export default function Report({ username, inline }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('penipuan');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
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
  if (done) return <p className="rep-ok" role="status">Terima kasih, laporanmu sudah kami terima.</p>;
  if (!open) return <button type="button" className={'rep-open' + (inline ? ' rep-open-inline' : '')} onClick={() => setOpen(true)}>Laporkan halaman ini</button>;
  return (
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
        <button type="button" onClick={() => setOpen(false)}>Batal</button>
      </div>
    </form>
  );
}
