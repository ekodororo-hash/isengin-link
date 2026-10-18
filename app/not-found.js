import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import './landing.css';
export const metadata = { title: 'Halaman tidak ditemukan – isengin.site', robots: { index: false } };

const RESERVED = ['api', 'dashboard', 'login', 'admin', 'go', 's', 'domain', 'privasi', 'syarat', 'fitur'];

export default async function NotFound() {
  // Kalau alamatnya berbentuk nama pengguna (isengin.site/rani), cek apakah namanya masih bebas.
  const m = /^\/([a-z0-9_]{3,20})$/.exec(headers().get('x-pathname') || '');
  const name = m && !RESERVED.includes(m[1]) ? m[1] : null;
  let state = 'none'; // none | free | taken
  if (name) {
    const r = await sql`select 1 from users where username=${name}`.catch(() => null);
    if (r) state = r.length ? 'taken' : 'free';
  }
  return (
    <main className="legal-wrap nf-wrap">
      <p className="legal-date" aria-hidden="true">404</p>
      <h1>{state === 'free' ? `isengin.site/${name} masih kosong` : 'Halaman tidak ditemukan'}</h1>
      <div className="legal-box">
        {state === 'free' && (<>
          <p>Belum ada yang memakai nama ini. Ambil sekarang, gratis, sebelum keduluan.</p>
          <a className="lp-btn nf-btn" href={`/daftar?u=${name}`}>Daftar dan klaim nama</a>
        </>)}
        {state === 'taken' && (<>
          <p>Halaman <b>{name}</b> sedang tidak tersedia. Pemiliknya mungkin menonaktifkannya sementara.</p>
          <a className="lp-btn nf-btn" href="/">Ke beranda</a>
        </>)}
        {state === 'none' && (<>
          <p>Alamat yang kamu buka tidak ada atau sudah dipindah. Periksa lagi penulisannya.</p>
          <a className="lp-btn nf-btn" href="/">Ke beranda</a>
        </>)}
        {state !== 'free' && <p className="nf-small">Punya link sendiri? Buat halamanmu di isengin.site dalam semenit.</p>}
      </div>
    </main>
  );
}
