'use client';
import Link from 'next/link';
import { useAdmin } from './AdminContext';
export default function Ringkasan() {
  const { d } = useAdmin();
  const n = (f) => d.users.filter(f).length;
  const clicks = d.users.reduce((a, x) => a + x.clicks, 0);
  const waiting = (d.requests || []).length;
  return (<>
    <h1>Ringkasan situs</h1><p className="px-sub">Semua pengguna isengin.site</p>
    <div className="px-grid">
      <div className="px-card px-stat"><b>{d.users.length}</b><span>Pengguna</span></div>
      <div className="px-card px-stat"><b>{clicks}</b><span>Total klik</span></div>
      <div className="px-card px-stat"><b>{n((x) => x.pro)}</b><span>Pro aktif</span></div>
      <div className="px-card px-stat"><b>{n((x) => x.verified)}</b><span>Bercentang</span></div>
      <div className="px-card px-stat"><b>{n((x) => !x.active)}</b><span>Dinonaktifkan</span></div>
      <Link href="/admin/centang" className="px-card px-stat"><b>{waiting}</b><span>Pengajuan centang menunggu</span></Link>
    </div>
  </>);
}
