'use client';
import { useAdmin } from './AdminContext';
export default function Ringkasan() {
  const { d } = useAdmin();
  const clicks = d.users.reduce((a, x) => a + x.clicks, 0);
  return (<>
    <h1>Ringkasan situs</h1><p className="px-sub">Semua pengguna isengin.site</p>
    <div className="px-grid">
      <div className="px-card px-stat"><b>{d.users.length}</b><span>Pengguna</span></div>
      <div className="px-card px-stat"><b>{clicks}</b><span>Total klik</span></div>
      <div className="px-card px-stat"><b>{d.users.filter((x) => !x.active).length}</b><span>Dinonaktifkan</span></div>
    </div>
  </>);
}
