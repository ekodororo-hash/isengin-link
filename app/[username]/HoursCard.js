'use client';
import { useEffect, useState } from 'react';
import { DAYS, dot, statusAt } from '@/lib/hours';

// Kartu jam buka di halaman publik. Status dihitung dari jam sekarang (WIB) dan diperbarui tiap 30 detik selagi halaman terbuka.
// Render pertama memakai waktu server (nowMs) supaya sama dengan HTML dari server.
export default function HoursCard({ hours, nowMs }) {
  const [now, setNow] = useState(nowMs);
  const [all, setAll] = useState(false);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const s = statusAt(hours, now);
  if (!s) return null;
  return (
    <div className="pstore phours">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      <div className="pstore-t">
        <span className="ph-s"><b className={'ph-pill ' + (s.open ? 'o' : 'c')}>{s.label}</b>{s.detail}</span>
        {all && (
          <ul className="ph-l">
            {DAYS.map((d, i) => (
              <li key={d} className={i === s.today ? 'now' : undefined}><span>{d}</span><span>{hours[i] ? dot(hours[i].split('-')[0]) + ' sampai ' + dot(hours[i].split('-')[1]) : 'Libur'}</span></li>
            ))}
            <li className="tz"><span>Waktu WIB</span></li>
          </ul>
        )}
      </div>
      <button type="button" className="pstore-go" aria-expanded={all} onClick={() => setAll(!all)}>{all ? 'Tutup' : 'Semua jam'}</button>
    </div>
  );
}
