'use client';
import { useEffect, useState } from 'react';
import { NamedIcon, LinkIcon } from '../icons';

const REASONS = [['penipuan', 'Penipuan atau phishing'], ['dewasa', 'Konten dewasa'], ['kekerasan', 'Kekerasan atau kebencian'], ['tiruan', 'Menyamar sebagai orang lain'], ['spam', 'Spam'], ['lainnya', 'Lainnya']];
const SHARES = [
  { key: 'whatsapp', label: 'WhatsApp', href: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}` },
  { key: 'facebook', label: 'Facebook', href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { key: 'x', label: 'X', href: (u, t) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: 'telegram', label: 'Telegram', href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: 'email', label: 'Email', href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}` },
];

// Ikon khusus modal ini, dibuat seragam (bobot garis & gaya isi sama) alih-alih mencampur
// gaya solid (logo resmi) dengan gaya garis tipis seperti ikon lain di situs.
function ShareIcon({ name, size = 20 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' };
  if (name === 'copy') return <svg {...c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M6.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5" /></svg>;
  if (name === 'email') return <svg {...c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M4 8l8 5.5L20 8" /></svg>;
  if (name === 'whatsapp') return <svg {...c} fill="currentColor" stroke="none"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.17-1.23-6.16-3.48-8.42" /></svg>;
  if (name === 'facebook') return <svg {...c} fill="currentColor" stroke="none"><path d="M14 21.5v-7.7h2.6l.4-3h-3V8.8c0-.87.24-1.46 1.5-1.46h1.6V4.66C16.6 4.6 15.67 4.5 14.6 4.5c-2.26 0-3.8 1.38-3.8 3.9v2.4H8.2v3h2.6v7.7z" /></svg>;
  if (name === 'telegram') return <svg {...c} fill="currentColor" stroke="none"><path d="M21.5 3.5L2.9 10.8c-.9.35-.9 1 0 1.3l4.6 1.5 1.7 5.6c.2.6.5.7.9.3l2.6-2.4 4.8 3.5c.7.5 1.2.3 1.4-.5l3-14c.2-1-.3-1.5-1-.6z" /></svg>;
  if (name === 'x') return <svg {...c} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>;
  return null;
}

function hostOf(u = '') {
  if (/^mailto:/i.test(u)) return u.replace(/^mailto:/i, '');
  try { return new URL(/^https?:/i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch { return u; }
}

// Modal "Bagikan tautan" per-link, terbuka di atas halaman publik. Komponen ini hanya pernah
// dirender di peramban (dipicu klik), jadi aman memakai window langsung tanpa cek SSR.
export default function ShareLink({ title, url, path, pageUsername, pageName, onClose }) {
  const [copied, setCopied] = useState(false);
  const [repOpen, setRepOpen] = useState(false);
  const [reason, setReason] = useState('penipuan');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const abs = window.location.origin + path;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  async function copy() {
    try { await navigator.clipboard.writeText(abs); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }
  async function sendReport(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: pageUsername, reason, detail: `Tautan "${title}": ${note}`.trim().slice(0, 300) }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setSent(true); else setErr(d.error || 'Gagal mengirim laporan.');
    } catch { setErr('Gagal mengirim laporan. Periksa koneksi.'); }
    setBusy(false);
  }

  return (
    <div className="shm-ov" role="dialog" aria-modal="true" aria-label="Bagikan tautan" onClick={onClose}>
      <div className="shm" onClick={(e) => e.stopPropagation()}>
        <div className="shm-top">
          <h2>Bagikan tautan</h2>
          <button type="button" className="shm-x" onClick={onClose} aria-label="Tutup"><NamedIcon name="x" size={16} /></button>
        </div>

        <div className="shm-prev">
          <div className="shm-ic" aria-hidden="true"><LinkIcon url={url} size={24} /></div>
          <p className="shm-t">{title}</p>
          <p className="shm-u">{hostOf(url)}</p>
        </div>

        <div className="shm-row">
          <button type="button" className="shm-sh" onClick={copy}>
            <span className="shm-ico shm-copy"><ShareIcon name="copy" size={19} /></span>
            {copied ? 'Tersalin!' : 'Salin tautan'}
          </button>
          {SHARES.map((s) => (
            <a key={s.key} className="shm-sh" href={s.href(abs, title)} target="_blank" rel="noopener noreferrer">
              <span className={'shm-ico shm-' + s.key}><ShareIcon name={s.key} size={19} /></span>
              {s.label}
            </a>
          ))}
        </div>

        <div className="shm-promo">
          <p className="shm-pt">Bergabung dengan {pageName || pageUsername} di isengin.site</p>
          <p className="shm-pd">Buat halamanmu sendiri, gratis. Satu link untuk semua kontenmu.</p>
          <a className="shm-reg" href={`/?ref=${pageUsername}`}>Daftar gratis</a>
        </div>

        {sent ? (
          <p className="shm-ok" role="status">Terima kasih, laporanmu sudah kami terima.</p>
        ) : repOpen ? (
          <form className="shm-rf" onSubmit={sendReport}>
            <label htmlFor="shm-r">Alasan</label>
            <select id="shm-r" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
            <textarea placeholder="Keterangan (opsional)" rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
            {err && <p className="shm-err" role="alert">{err}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim laporan'}</button>
          </form>
        ) : (
          <button type="button" className="shm-report" onClick={() => setRepOpen(true)}>Laporkan tautan ini</button>
        )}
      </div>
    </div>
  );
}
