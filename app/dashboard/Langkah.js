'use client';
import Link from 'next/link';
import { useDash } from './DashContext';

// Daftar langkah awal. Semua status dihitung dari data akun, jadi tidak ada yang perlu disimpan; hilang sendiri kalau sudah lengkap.
export default function Langkah() {
  const { m } = useDash();
  const shown = m.links.filter((l) => !l.hidden && (l.kind || 'link') === 'link').length;
  const steps = [
    ['Pasang foto profil', 'Halaman dengan foto lebih dipercaya pengunjung.', '/dashboard/profil', !!m.photo_url],
    ['Tulis bio singkat', 'Minimal 10 karakter, ceritakan kamu atau tokomu.', '/dashboard/profil', (m.bio || '').trim().length >= 10],
    ['Tambah link pertama', 'WhatsApp, Instagram, toko online, atau apa saja.', '/dashboard/link', shown >= 1],
    ['Bagikan halamanmu', 'Tempel link-mu di bio, lalu tunggu kunjungan pertama.', '/dashboard/bagikan', (m.views || 0) > 0],
  ];
  const n = steps.filter((s) => s[3]).length;
  if (n === steps.length) return null;
  return (
    <section className="px-card px-ob" aria-labelledby="ob-h">
      <div className="px-ob-h"><b id="ob-h">Langkah awal</b><span>{n} dari {steps.length} selesai</span></div>
      <div className="px-prog" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={n} aria-label="Kemajuan langkah awal"><i style={{ width: (n / steps.length) * 100 + '%' }} /></div>
      <ul className="px-st">
        {steps.map(([t, h, href, ok]) => (
          <li key={t} className={ok ? 'ok' : ''}>
            <Link href={href}>
              <span className="ck" aria-hidden="true">{ok ? '✓' : ''}</span>
              <span><span className="tt">{t}</span><small>{h}</small></span>
              <span className="sr-only">{ok ? ' (selesai)' : ' (belum)'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
