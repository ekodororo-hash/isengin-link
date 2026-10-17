import { headers } from 'next/headers';
import { sql } from '@/lib/db';
export const metadata = { title: 'Halaman tidak ditemukan – isengin.site', robots: { index: false } };

const RESERVED = ['api', 'dashboard', 'login', 'admin', 'go', 's', 'domain', 'privasi', 'syarat'];

export default async function NotFound() {
  // Kalau alamatnya berbentuk nama pengguna (isengin.site/rani), cek apakah namanya masih bebas.
  const m = /^\/([a-z0-9_]{3,20})$/.exec(headers().get('x-pathname') || '');
  const name = m && !RESERVED.includes(m[1]) ? m[1] : null;
  let state = 'none'; // none | free | taken
  if (name) {
    const r = await sql`select 1 from users where username=${name}`.catch(() => null);
    if (r) state = r.length ? 'taken' : 'free';
  }
  const box = { background: '#fff', color: '#111', borderRadius: 18, padding: 24, display: 'grid', gap: 12 };
  const a = { display: 'inline-block', minHeight: 48, lineHeight: '48px', padding: '0 20px', borderRadius: 12, background: '#ffd84d', color: '#1a1a1a', fontWeight: 800, textDecoration: 'none', textAlign: 'center' };
  return (
    <main className="page">
      <p style={{ margin: 0, fontWeight: 800, letterSpacing: '.08em' }} aria-hidden="true">404</p>
      <h1>{state === 'free' ? `isengin.site/${name} masih kosong` : 'Halaman tidak ditemukan'}</h1>
      <div style={box}>
        {state === 'free' && (<>
          <p style={{ margin: 0 }}>Belum ada yang memakai nama ini. Ambil sekarang, gratis, sebelum keduluan.</p>
          <a style={a} href="/">Daftar dan klaim nama</a>
        </>)}
        {state === 'taken' && (<>
          <p style={{ margin: 0 }}>Halaman <b>{name}</b> sedang tidak tersedia. Pemiliknya mungkin menonaktifkannya sementara.</p>
          <a style={a} href="/">Ke beranda</a>
        </>)}
        {state === 'none' && (<>
          <p style={{ margin: 0 }}>Alamat yang kamu buka tidak ada atau sudah dipindah. Periksa lagi penulisannya.</p>
          <a style={a} href="/">Ke beranda</a>
        </>)}
        {state !== 'free' && <p className="small" style={{ margin: 0 }}>Punya link sendiri? Buat halamanmu di isengin.site dalam semenit.</p>}
      </div>
    </main>
  );
}
