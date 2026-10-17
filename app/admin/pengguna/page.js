'use client';
import { useAdmin } from '../AdminContext';
export default function Pengguna() {
  const { d, tog, del } = useAdmin();
  return (<>
    <h1>Pengguna</h1><p className="px-sub">Nonaktifkan halaman yang melanggar aturan, atau hapus akun sepenuhnya.</p>
    <div className="px-card px-tw"><table>
      <thead><tr><th>Halaman</th><th>Link</th><th>Klik</th><th>Kunjungan</th><th>Status</th><th></th></tr></thead>
      <tbody>{d.users.map((x) => (
        <tr key={x.id}>
          <td><a href={`/${x.username}`} target="_blank">isengin.site/{x.username}</a></td>
          <td>{x.links}</td><td>{x.clicks}</td><td>{x.views || 0}</td>
          <td><span className={'px-tag' + (x.active ? '' : ' off')}>{x.active ? 'Aktif' : 'Nonaktif'}</span></td>
          <td><div className="px-cell-act">
            <button className="px-btn g sm" onClick={() => tog(x.id, !x.active)}>{x.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
            <button className="px-btn d sm" onClick={() => { if (confirm(`Hapus ${x.username} beserta semua link dan statistiknya? Ini tidak bisa dibatalkan.`)) del(x.id); }}>Hapus</button>
          </div></td>
        </tr>
      ))}</tbody>
    </table></div>
  </>);
}
