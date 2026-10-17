'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useDash } from '../DashContext';
export default function Bagikan() {
  const { m } = useDash();
  const [url, setUrl] = useState('');
  const [qr, setQr] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || location.origin).replace(/\/$/, '');
    const u = `${base}/${m.username}`;
    setUrl(u);
    QRCode.toDataURL(u, { width: 720, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#1f2255', light: '#ffffff' } }).then(setQr).catch(() => setNote('Kode QR gagal dibuat.'));
  }, [m.username]);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setNote('Link tersalin.'); } catch { setNote('Salin manual: ' + url); }
  }
  return (<>
    <h1>Bagikan</h1><p className="px-sub">Tempel link-mu di bio, atau cetak kode QR untuk kartu nama dan etalase.</p>
    <div className="px-two">
      <div className="px-card">
        <label>Link halamanmu</label>
        <input readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Link halamanmu" />
        <div className="px-actions">
          <button className="px-btn g" onClick={copy}>Salin link</button>
          {qr && <a className="px-btn" download={`qr-${m.username}.png`} href={qr}>Unduh QR</a>}
          {note && <span role="status" className="px-msg">{note}</span>}
        </div>
      </div>
      <div className="px-card px-qr">
        {qr ? <img src={qr} alt={`Kode QR untuk ${url}`} width="240" height="240" /> : <p className="px-empty">Membuat kode QR…</p>}
      </div>
    </div>
  </>);
}
