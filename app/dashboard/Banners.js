'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBullhorn, FaCircleInfo, FaCrown, FaXmark } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';
import { useDash } from './DashContext';

const tgl = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const today = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); // hari ini, zona Jakarta
const rd = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const wr = (k) => { try { localStorage.setItem(k, '1'); } catch {} };

// Pengumuman dari admin dan pengingat Pro hampir habis. Keduanya bisa ditutup; penutupnya disimpan di peramban saja.
export default function Banners() {
  const { m } = useDash();
  const path = usePathname();
  const [gone, setGone] = useState({});
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  const items = [];
  const a = m.announce;
  if (a && !rd('ann-' + a.id)) items.push({ key: 'ann-' + a.id, level: a.level === 'penting' ? 'penting' : 'info', icon: a.level === 'pengumuman' ? FaBullhorn : FaCircleInfo, body: a.text });
  const until = m.plan_until ? new Date(m.plan_until) : null;
  if (until && path !== '/dashboard/paket') {
    const days = Math.ceil((until - Date.now()) / 86400000);
    const key = 'pro-' + today();
    if (m.pro && days <= 7 && !rd(key)) {
      const when = days <= 1 ? 'dalam 1 hari' : `${days} hari lagi`;
      items.push({ key, level: 'penting', icon: FaCrown, body: <>Paket Pro berakhir {when} ({tgl(until)}) dan tidak diperpanjang otomatis. <Link href="/dashboard/paket">Perpanjang sekarang</Link></> });
    } else if (!m.pro && days <= 0 && days >= -30 && !rd(key)) {
      items.push({ key, level: 'penting', icon: FaCrown, body: <>Paket Pro berakhir pada {tgl(until)}. Tampilan Pro disembunyikan dari halamanmu, tapi pilihanmu tetap tersimpan. <Link href="/dashboard/paket">Aktifkan lagi</Link></> });
    }
  }
  const show = items.filter((x) => !gone[x.key]);
  if (!show.length) return null;
  return (
    <div className="px-bns">
      {show.map((x) => (
        <div className={'px-bn ' + x.level} role="status" key={x.key}>
          <span className="ico" aria-hidden="true"><x.icon size={22} /></span>
          <p>{x.body}</p>
          <button type="button" aria-label="Tutup" onClick={() => { wr(x.key); setGone((g) => ({ ...g, [x.key]: true })); }}><FaXmark size={14} /></button>
        </div>
      ))}
    </div>
  );
}
