'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useDash } from '../DashContext';
const PLACES = [['whatsapp', 'WhatsApp'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['youtube', 'YouTube'], ['telegram', 'Telegram'], ['x', 'X (Twitter)']];
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
  async function copyFor(key, name) {
    const u = `${url}?src=${key}`;
    try { await navigator.clipboard.writeText(u); setNote(`Link untuk ${name} tersalin.`); } catch { setNote('Salin manual: ' + u); }
  }
  return (<>
    <h1>Bagikan</h1><p className="px-sub">Tempel link-mu di bio, atau cetak kode QR untuk kartu nama dan etalase.</p>
    <div className="px-share">
      <div className="px-card">
        <section className="px-sec">
          <h2>Link halamanmu</h2>
          <input readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Link halamanmu" />
          <p className="px-hint">Tempel di bio Instagram, TikTok, atau WhatsApp.</p>
          <div className="px-actions">
            <button className="px-btn g" onClick={copy}>Salin link</button>
            {qr && <a className="px-btn" download={`qr-${m.username}.png`} href={qr}>Unduh QR</a>}
            {note && <span role="status" className="px-msg">{note}</span>}
          </div>
        </section>
        <section className="px-sec">
          <h2>Link per tempat</h2>
          <p className="px-hint">Pakai link yang sesuai tempatmu membagikannya. Di Ringkasan, kamu jadi tahu klik datang dari mana.</p>
          <div className="px-places">
            {PLACES.map(([k, n]) => (
              <div className="px-place" key={k}><span>{n}</span><button type="button" className="px-btn g" onClick={() => copyFor(k, n)}>Salin</button></div>
            ))}
          </div>
        </section>
        <section className="px-sec">
          <h2>Tips</h2>
          <p className="px-hint">Cetak kode QR di kartu nama, kemasan, atau etalase supaya pelanggan bisa langsung membuka halamanmu.</p>
        </section>
      </div>
      <div className="px-card px-qr">
        {qr ? <img src={qr} alt={`Kode QR untuk ${url}`} width="240" height="240" /> : <p className="px-empty">Membuat kode QR…</p>}
        <p className="px-hint">Arahkan kamera HP ke kode ini.</p>
      </div>
    </div>
  </>);
}
