'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Modal hadiah referral: muncul setelah login. Hadiah baru dibayar saat tombol Klaim diklik; pengundang dan teman klaim sendiri-sendiri.
// Pakai: <RefModal gift={g} onClose={...} onClaimed={...} />
//   gift.kind 'reward' (pengundang): { n, days, per, friends }   gift.kind 'bonus' (teman yang diundang): { days, by }
// Daftar teman dibatasi tampil MAX_SHOW dulu; sisanya muncul lewat tombol "dan N teman lainnya".
const MAX_SHOW = 5;
const Check = () => (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 13l5 5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const Gift = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="9" width="17" height="11" rx="2" /><path d="M3.5 13h17M12 9v11M12 9c-1.5-4-6-4-6-1.5 0 1.5 2 1.5 6 1.5zM12 9c1.5-4 6-4 6-1.5 0 1.5-2 1.5-6 1.5z" /></svg>);

export default function RefModal({ gift, onClose, onClaimed }) {
  const ref = useRef(null);
  const [all, setAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState(null); // hasil klaim dari server

  useEffect(() => {
    if (!gift) return;
    const prev = document.activeElement, ovf = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('.pm-pb')?.focus();
    const key = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = [...ref.current.querySelectorAll('button')];
      if (!f.length) return;
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ovf; prev?.focus?.(); };
  }, [gift]);

  async function klaim() {
    if (busy) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: gift.kind }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setRes(d); onClaimed?.(gift.kind); } else setErr(d.error || 'Klaim gagal. Coba lagi.');
    } catch { setErr('Klaim gagal. Periksa koneksi, lalu coba lagi.'); }
    setBusy(false);
  }

  if (!gift || typeof document === 'undefined') return null;
  const bonus = gift.kind === 'bonus';
  const done = !!res;
  const empty = done && res.n === 0; // sudah diklaim dari tab lain
  const src = done && !empty && !bonus ? res : gift;
  const list = bonus ? [] : src.friends;
  const n = list.length;
  const shown = all ? list : list.slice(0, MAX_SHOW);
  const rest = n - shown.length;
  const judul = empty ? 'Sudah diklaim' : bonus ? (done ? 'Bonus undangan diterima' : 'Bonus undangan siap diklaim') : (done ? 'Hadiah referral diterima' : 'Hadiah referral siap diklaim');
  const teks = empty ? 'Ini sudah kamu klaim sebelumnya.'
    : bonus ? (done ? `${res.days} hari Pro sudah ditambahkan ke akunmu.` : `Kamu mendaftar lewat undangan @${gift.by}. Klaim ${gift.days} hari Pro untuk akunmu.`)
    : done ? `${n} temanmu sudah memenuhi syarat. ${res.days} hari Pro sudah ditambahkan ke akunmu.`
    : `${n} temanmu sudah memenuhi syarat. Klaim ${gift.days} hari Pro untuk akunmu.`;
  return createPortal(
    <div className="pm-ov" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="pm-md" ref={ref} role="dialog" aria-modal="true" aria-labelledby="pm-rt">
        <button className="pm-x" onClick={onClose} aria-label="Tutup">✕</button>
        <div className={'pm-ic' + (done ? ' ok' : '')}>{done ? <Check /> : <Gift />}</div>
        <h3 id="pm-rt">{judul}</h3>
        <p className="pm-t">{teks}</p>
        {!empty && (
          <div className="pm-slot gift">
            <div className="pm-day"><b>{bonus ? gift.days : src.days}</b><span>HARI PRO</span></div>
            {!bonus && <>
              <div className="pm-sep" aria-hidden="true" />
              <div className="pm-flist">
                {shown.map((u) => (
                  <span className="pm-frnd" key={u}><i aria-hidden="true">{String([...u][0] || '?').toUpperCase()}</i>@{u}<small>+{src.per}</small></span>
                ))}
                {rest > 0 && <button type="button" className="pm-more" onClick={() => setAll(true)}>dan {rest} teman lainnya</button>}
              </div>
            </>}
          </div>
        )}
        {err && <p className="px-err" role="alert">{err}</p>}
        <div className="pm-btns">
          {done
            ? <button className="pm-pb" onClick={onClose}>Tutup</button>
            : (<>
                <button className="pm-pb" onClick={klaim} disabled={busy}>{busy ? 'Memproses…' : `Klaim ${gift.days} hari Pro`}</button>
                <button className="pm-sb" onClick={onClose} disabled={busy}>Nanti saja</button>
              </>)}
        </div>
      </div>
    </div>,
    document.body
  );
}
