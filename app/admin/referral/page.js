'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

export default function Referral() {
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    fetch('/api/admin/referral').then(async (res) => { const x = await res.json().catch(() => ({})); if (res.ok) setR(x); else setErr(x.error || 'Gagal memuat.'); });
  }, []);
  if (err) return (<><h1>Referral</h1><p className="px-err" role="alert">{err}</p></>);
  if (!r) return (<><h1>Referral</h1><Loader inline /></>);
  return (<>
    <h1>Referral</h1>
    <p className="px-sub">Pantau siapa mengundang siapa. Pengundang dengan banyak teman tapi sedikit yang berhadiah bisa jadi tanda akun palsu.</p>
    <div className="px-grid">
      <div className="px-card px-stat"><b>{r.invited}</b><span>Diundang</span></div>
      <div className="px-card px-stat"><b>{r.rewarded}</b><span>Sudah berhadiah</span></div>
      <div className="px-card px-stat"><b>{r.invited - r.rewarded}</b><span>Menunggu</span></div>
    </div>

    <h2 className="adm-h2">Pengundang teratas</h2>
    <div className="px-card px-tw">
      {r.top.length === 0 ? <p className="adm-empty">Belum ada undangan.</p> : (
        <table>
          <thead><tr><th>Pengundang</th><th>Diundang</th><th>Berhadiah</th></tr></thead>
          <tbody>{r.top.map((x) => <tr key={x.username}><td><a href={`/${x.username}`} target="_blank" rel="noopener noreferrer">@{x.username}</a></td><td>{x.invited}</td><td>{x.rewarded}</td></tr>)}</tbody>
        </table>
      )}
    </div>

    <h2 className="adm-h2">Undangan terbaru</h2>
    <div className="px-card px-tw">
      {r.recent.length === 0 ? <p className="adm-empty">Belum ada undangan.</p> : (
        <table>
          <thead><tr><th>Teman</th><th>Diundang oleh</th><th>Daftar</th><th>Hadiah</th></tr></thead>
          <tbody>{r.recent.map((x) => (
            <tr key={x.username}>
              <td><a href={`/${x.username}`} target="_blank" rel="noopener noreferrer">@{x.username}</a></td>
              <td>@{x.by}</td><td>{tgl(x.created_at)}</td>
              <td><span className={'px-tag' + (x.rewarded_at ? '' : ' off')}>{x.rewarded_at ? 'Cair' : 'Menunggu'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  </>);
}
