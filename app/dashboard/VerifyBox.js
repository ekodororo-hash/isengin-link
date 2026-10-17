'use client';
import { useEffect, useState } from 'react';
import Verified from '../Verified';
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default function VerifyBox() {
  const [d, setD] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState(null);
  const load = () => fetch('/api/verify').then((r) => (r.ok ? r.json() : null)).then((x) => { if (x) setD(x); });
  useEffect(() => { load(); }, []);

  async function send(e) {
    e.preventDefault(); setBusy(true); setM(null);
    const r = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note }) });
    const x = await r.json().catch(() => ({}));
    if (r.ok) { setNote(''); await load(); } else setM({ t: x.error || 'Gagal mengajukan.', err: true });
    setBusy(false);
  }
  async function cancel() {
    setBusy(true);
    await fetch('/api/verify', { method: 'DELETE' });
    await load(); setBusy(false);
  }

  if (!d) return null;
  const req = d.request;
  const waitRetry = req?.status === 'rejected' && d.retryAt && Date.now() < new Date(d.retryAt).getTime();
  return (
    <section className="px-sec">
      <h2>Centang verifikasi</h2>
      {d.verified ? (
        <p className="px-hint"><Verified size={16} /> Akunmu sudah bercentang. Centang tampil di samping namamu di halaman publik.</p>
      ) : req?.status === 'pending' ? (<>
        <p className="px-hint" role="status">Pengajuanmu terkirim pada {tgl(req.created_at)} dan sedang ditinjau.</p>
        <div className="px-actions"><button className="px-btn g" onClick={cancel} disabled={busy}>Batalkan pengajuan</button></div>
      </>) : (<>
        <p className="px-hint">Centang menandai akun resmi. Pengajuan ditinjau manual oleh admin.</p>
        {req?.status === 'rejected' && <p className="px-warn" role="status">Pengajuan sebelumnya ditolak{req.reason ? `: ${req.reason}` : '.'}{waitRetry ? ` Kamu bisa mengajukan lagi setelah ${tgl(d.retryAt)}.` : ''}</p>}
        <ul className="px-chk">{d.checks.map((c) => <li key={c.text} className={c.ok ? 'ok' : 'no'}>{c.ok ? '✓' : '✗'} {c.text}</li>)}</ul>
        <form onSubmit={send}>
          <label htmlFor="vn">Alasan atau bukti akun resmi</label>
          <textarea id="vn" rows={3} value={note} maxLength={d.noteMax} placeholder="Mis. tautan akun Instagram/YouTube resmimu yang mencantumkan alamat halaman ini" onChange={(e) => setNote(e.target.value)} />
          <div className="px-actions">
            <button className="px-btn" disabled={busy || !d.ready || waitRetry || note.trim().length < d.noteMin}>{busy ? 'Mengirim…' : 'Ajukan centang'}</button>
            {m && <span role="status" className={'px-msg' + (m.err ? ' err' : '')}>{m.t}</span>}
          </div>
        </form>
      </>)}
    </section>
  );
}
