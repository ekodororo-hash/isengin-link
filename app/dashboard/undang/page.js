'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default function Undang() {
  const p = usePre('/api/referral');
  const [d, setD] = useState(p?.ok ? p.data : null);
  const [err, setErr] = useState(p && !p.ok ? p.data?.error || 'Gagal memuat.' : '');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (p) return;
    fetch('/api/referral').then(async (r) => { const x = await r.json().catch(() => ({})); if (r.ok) setD(x); else setErr(x.error || 'Gagal memuat.'); });
  }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(d.url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }
  if (err) return (<><h1>Undang teman</h1><p className="px-err" role="alert">{err}</p></>);
  if (!d) return (<><h1>Undang teman</h1><Loader inline /></>);
  const { rules: r } = d;
  const wa = `https://wa.me/?text=${encodeURIComponent('Bikin halaman link-in-bio gratis di isengin.site, daftar lewat link ini ya: ' + d.url)}`;
  return (<>
    <h1>Undang teman</h1>
    <p className="px-sub">Ajak temanmu. Kalian berdua dapat <b>{r.reward} hari Pro</b> gratis.</p>
    <div className="px-card">
      <section className="px-sec">
        <h2>Link undanganmu</h2>
        <input readOnly value={d.url} onFocus={(e) => e.target.select()} aria-label="Link undangan" />
        <div className="px-actions">
          <button className="px-btn" onClick={copy}>{copied ? 'Tersalin' : 'Salin link'}</button>
          <a className="px-btn g" href={wa} target="_blank" rel="noopener noreferrer">Bagikan lewat WhatsApp</a>
        </div>
        <p className="px-hint">Link “Dibuat di isengin.site” di halaman publikmu juga membawa kode undanganmu.</p>
      </section>
      <section className="px-sec">
        <h2>Cara kerja</h2>
        <ul className="px-chk">
          <li>Temanmu daftar lewat link di atas.</li>
          <li>Setelah akunnya berumur {r.hours} jam dan punya minimal 1 link yang tampil, hadiah dibayarkan otomatis.</li>
          <li>Kamu dapat +{r.reward} hari Pro, temanmu dapat +{r.bonus} hari Pro.</li>
          <li>Maksimal {r.max} teman yang berhadiah per akun. Hadiah dihitung saat kamu membuka halaman ini atau halaman Paket.</li>
        </ul>
      </section>
      <section className="px-sec">
        <h2>Temanmu</h2>
        <p className="px-hint">{d.invited} diundang, {d.rewarded} sudah berhadiah ({d.earnedDays} hari Pro didapat).{d.pro ? ` Pro aktif sampai ${tgl(d.until)}.` : ''}</p>
        {d.friends.length > 0 && (
          <ul className="px-chk">{d.friends.map((f) => (
            <li key={f.username} className={f.rewarded ? 'ok' : 'no'}>{f.rewarded ? '✓' : '…'} @{f.username} <span className="px-hint-i">{f.rewarded ? 'berhadiah' : 'menunggu'}</span></li>
          ))}</ul>
        )}
      </section>
    </div>
  </>);
}
