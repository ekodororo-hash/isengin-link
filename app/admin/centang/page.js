'use client';
import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Verified from '../../Verified';
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default function Centang() {
  const { d, decide, verify } = useAdmin();
  const reqs = d.requests || [];
  const done = d.users.filter((x) => x.verified);
  const [rej, setRej] = useState(null);
  const [why, setWhy] = useState('');
  async function send(id, kind, reason) { await decide(id, kind, reason); setRej(null); }
  return (<>
    <h1>Centang</h1>
    <p className="px-sub">Pengajuan centang dari pengguna, dan daftar akun yang sudah bercentang.</p>

    <h2 className="adm-h2">Menunggu ({reqs.length})</h2>
    {reqs.length === 0 && <div className="px-card"><p className="adm-empty">Tidak ada pengajuan yang menunggu.</p></div>}
    {reqs.map((x) => (
      <div className="px-card adm-req" key={x.id}>
        <a href={`/${x.username}`} target="_blank" rel="noopener noreferrer"><b>isengin.site/{x.username}</b></a>
        <span className="adm-sm">Diajukan {tgl(x.created_at)} · {x.links} link · {x.views || 0} kunjungan</span>
        <blockquote className="adm-note">{x.note}</blockquote>
        {rej === x.id ? (<>
          <label htmlFor={`why${x.id}`}>Alasan penolakan (dilihat pengguna)</label>
          <input id={`why${x.id}`} value={why} maxLength={200} onChange={(e) => setWhy(e.target.value)} />
          <div className="px-cell-act" style={{ marginTop: 10 }}>
            <button className="px-btn d sm" onClick={() => send(x.id, 'reject', why)}>Kirim penolakan</button>
            <button className="px-btn g sm" onClick={() => setRej(null)}>Batal</button>
          </div>
        </>) : (
          <div className="px-cell-act">
            <button className="px-btn sm" onClick={() => send(x.id, 'approve')}>Setujui</button>
            <button className="px-btn d sm" onClick={() => { setRej(x.id); setWhy('Belum bisa kami pastikan keasliannya.'); }}>Tolak</button>
          </div>
        )}
      </div>
    ))}

    <h2 className="adm-h2">Sudah bercentang ({done.length})</h2>
    <div className="px-card px-tw">
      {done.length === 0 ? <p className="adm-empty">Belum ada akun bercentang.</p> : (
        <table>
          <thead><tr><th>Halaman</th><th></th></tr></thead>
          <tbody>{done.map((x) => (
            <tr key={x.id}>
              <td><a href={`/${x.username}`} target="_blank" rel="noopener noreferrer">@{x.username}</a> <Verified size={16} /></td>
              <td><button className="px-btn g sm" onClick={() => verify(x.id, false)}>Cabut centang</button></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  </>);
}
