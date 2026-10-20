'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NamedIcon, LinkIcon } from '../icons';

const REASONS = [['penipuan', 'Penipuan atau phishing'], ['dewasa', 'Konten dewasa'], ['kekerasan', 'Kekerasan atau kebencian'], ['tiruan', 'Menyamar sebagai orang lain'], ['spam', 'Spam'], ['lainnya', 'Lainnya']];
const SHARES = [
  { key: 'whatsapp', label: 'WhatsApp', href: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}` },
  { key: 'facebook', label: 'Facebook', href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { key: 'x', label: 'X', href: (u, t) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: 'telegram', label: 'Telegram', href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: 'email', label: 'Email', href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}` },
];

// Path logo resmi dari simple-icons (ikon brand gratis/open-source), bukan gambar tangan,
// supaya bentuknya persis sama dengan logo aslinya.
function ShareIcon({ name, size = 20 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false', fill: 'currentColor' };
  if (name === 'copy') return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M6.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5" /></svg>;
  if (name === 'email') return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M4 8l8 5.5L20 8" /></svg>;
  // WhatsApp — simple-icons "whatsapp"
  if (name === 'whatsapp') return <svg {...c}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" /></svg>;
  // Facebook — simple-icons "facebook"
  if (name === 'facebook') return <svg {...c}><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.848-.287 1.819h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647" /></svg>;
  // Telegram — simple-icons "telegram" (paper plane, tanpa lingkaran karena sudah pakai lingkaran kami sendiri)
  if (name === 'telegram') return <svg {...c}><path d="M21.886 5.242 18.52 21.01c-.254 1.13-.916 1.41-1.856.879l-5.126-3.779-2.473 2.38c-.273.274-.502.502-1.03.502l.368-5.227 9.51-8.593c.414-.369-.09-.574-.643-.205L6.27 13.075l-5.146-1.609c-1.119-.35-1.14-1.119.233-1.655L20.537 3.59c.932-.35 1.748.221 1.349 1.652" /></svg>;
  // X (Twitter) — simple-icons "x", bentuk resmi, bukan sekadar tanda silang
  if (name === 'x') return <svg {...c}><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>;
  return null;
}

function hostOf(u = '') {
  if (/^mailto:/i.test(u)) return u.replace(/^mailto:/i, '');
  try { return new URL(/^https?:/i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch { return u; }
}

// Modal "Bagikan tautan" per-link, terbuka di atas halaman publik. Komponen ini hanya pernah
// dirender di peramban (dipicu klik), jadi aman memakai window langsung tanpa cek SSR.
export default function ShareLink({ title, url, path, pageUsername, pageName, isPage, onClose }) {
  const [copied, setCopied] = useState(false);
  const [repOpen, setRepOpen] = useState(false);
  const [reason, setReason] = useState('penipuan');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  // Mode halaman: bagikan alamat yang sedang dibuka (di domain kustom pun benar), bukan tautan /go/ milik satu link.
  const abs = isPage ? window.location.origin + window.location.pathname : window.location.origin + path;

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

  // Dirender lewat portal ke <body> supaya tidak terjebak di lapisan (stacking context) kotak link, jadi selalu di atas semua elemen halaman.
  return createPortal(
    <div className="shm-ov" role="dialog" aria-modal="true" aria-label={isPage ? 'Bagikan halaman' : 'Bagikan tautan'} onClick={onClose}>
      <div className="shm" onClick={(e) => e.stopPropagation()}>
        <div className="shm-top">
          <h2>{isPage ? 'Bagikan halaman' : 'Bagikan tautan'}</h2>
          <button type="button" className="shm-x" onClick={onClose} aria-label="Tutup"><NamedIcon name="close" size={16} /></button>
        </div>

        <div className="shm-prev">
          <div className="shm-ic" aria-hidden="true">{isPage ? <NamedIcon name="link" size={24} /> : <LinkIcon url={url} size={24} />}</div>
          <p className="shm-t">{title}</p>
          <p className="shm-u">{isPage ? hostOf(abs) + window.location.pathname.replace(/^\/$/, '') : hostOf(url)}</p>
        </div>

        <div className="shm-row">
          <button type="button" className="shm-sh" onClick={copy}>
            <span className="shm-ico shm-copy"><ShareIcon name="copy" size={19} /></span>
            {copied ? 'Tersalin!' : 'Salin'}
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

        {isPage ? null : sent ? (
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
    </div>,
    document.body
  );
}
