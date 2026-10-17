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
            <span className="shm-ico shm-copy"><NamedIcon name="copy" size={19} /></span>
            {copied ? 'Tersalin!' : 'Salin tautan'}
          </button>
          {SHARES.map((s) => (
            <a key={s.key} className="shm-sh" href={s.href(abs, title)} target="_blank" rel="noopener noreferrer">
              <span className={'shm-ico shm-' + s.key}><NamedIcon name={s.key} size={19} /></span>
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
