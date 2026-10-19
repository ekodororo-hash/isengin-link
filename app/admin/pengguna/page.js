'use client';
import { Fragment, useState } from 'react';
import { useAdmin } from '../AdminContext';
import Verified from '../../Verified';
const FILTERS = [['semua', 'Semua'], ['aktif', 'Aktif'], ['nonaktif', 'Nonaktif'], ['pro', 'Pro'], ['centang', 'Bercentang']];
const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
const MATCH = {
  semua: () => true, aktif: (x) => x.active, nonaktif: (x) => !x.active, pro: (x) => x.pro, centang: (x) => x.verified,
};

export default function Pengguna() {
  const { d, tog, verify, pro, del, resetPass } = useAdmin();
  const [q, setQ] = useState('');
  const [f, setF] = useState('semua');
  const [open, setOpen] = useState(null);
  const s = q.trim().toLowerCase();
  const rows = d.users.filter((x) => MATCH[f](x) && (!s || x.username.includes(s) || (x.display_name || '').toLowerCase().includes(s)));
  return (<>
    <h1>Pengguna</h1>
    <p className="px-sub">Cari akun, atur paket Pro, centang, status, atau hapus. Klik Kelola di baris yang dipilih.</p>
    <div className="adm-bar">
      <input type="search" placeholder="Cari nama pengguna…" aria-label="Cari pengguna" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="adm-chips" role="group" aria-label="Saring">
        {FILTERS.map(([k, l]) => <button key={k} className="adm-chip" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}
      </div>
    </div>
    <div className="px-card px-tw">
      {rows.length === 0 ? <p className="adm-empty">Tidak ada pengguna yang cocok.</p> : (
        <table>
          <thead><tr><th>Halaman</th><th>Link</th><th>Klik</th><th>Kunjungan</th><th>Daftar</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((x) => (
            <Fragment key={x.id}>
              <tr>
                <td>
                  <a href={`/${x.username}`} target="_blank" rel="noopener noreferrer">@{x.username}</a>{x.verified && <> <Verified size={16} /></>}
                  {x.display_name && x.display_name !== x.username && <span className="adm-sm">{x.display_name}</span>}
                </td>
                <td>{x.links}</td><td>{x.clicks}</td><td>{x.views || 0}</td><td>{tgl(x.created_at)}</td>
                <td>
                  <span className={'px-tag' + (x.active ? '' : ' off')}>{x.active ? 'Aktif' : 'Nonaktif'}</span>
                  {x.pro && <span className="px-tag pro">Pro</span>}
                </td>
                <td><button className="px-btn g sm" aria-expanded={open === x.id} onClick={() => setOpen(open === x.id ? null : x.id)}>{open === x.id ? 'Tutup' : 'Kelola'}</button></td>
              </tr>
              {open === x.id && (
                <tr className="adm-sub-row"><td colSpan={7}>
                  <div className="adm-grp"><b>Paket Pro</b>
                    <span className="adm-sm">{x.pro ? `Aktif sampai ${tgl(x.plan_until)}` : 'Gratis'}</span>
                    <button className="px-btn g sm" onClick={() => pro(x.id, 30)}>+30 hari</button>
                    <button className="px-btn g sm" onClick={() => pro(x.id, 365)}>+365 hari</button>
                    {x.pro && <button className="px-btn g sm" onClick={() => pro(x.id, 0)}>Cabut Pro</button>}
                  </div>
                  <div className="adm-grp"><b>Centang</b>
                    <button className="px-btn g sm" onClick={() => verify(x.id, !x.verified)}>{x.verified ? 'Cabut centang' : 'Beri centang'}</button>
                  </div>
                  <div className="adm-grp"><b>Akun</b>
                    <button className="px-btn g sm" onClick={() => tog(x.id, !x.active)}>{x.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                    <button className="px-btn g sm" onClick={() => { if (confirm(`Reset sandi @${x.username}? Sandi lamanya langsung tidak berlaku dan semua sesi login-nya keluar. Lakukan hanya setelah memastikan pemiliknya.`)) resetPass(x.id, x.username); }}>Reset sandi</button>
                    <button className="px-btn d sm" onClick={() => { if (confirm(`Hapus ${x.username} beserta semua link dan statistiknya? Ini tidak bisa dibatalkan.`)) { del(x.id); setOpen(null); } }}>Hapus</button>
                  </div>
                </td></tr>
              )}
            </Fragment>
          ))}</tbody>
        </table>
      )}
    </div>
  </>);
}
