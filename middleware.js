import { NextResponse } from 'next/server';

// Domain utama situs (selain ini dianggap domain kustom pengguna).
const MAIN = (() => { try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').hostname.replace(/^www\./, ''); } catch { return 'isengin.site'; } })();

export function middleware(req) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = req.nextUrl;
  // Teruskan path ke halaman 404 supaya bisa menawarkan "ambil nama ini" bila alamatnya belum dipakai.
  const headers = new Headers(req.headers);
  headers.set('x-pathname', pathname);
  const own = !host || host === MAIN || host === 'www.' + MAIN || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  // Di domain kustom, beranda (/) menampilkan halaman pemiliknya. Path lain (/go/..., /api/..., aset) berjalan normal.
  if (!own && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = `/domain/${host}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

// Lewati aset statis (path yang mengandung titik) dan internal Next.
export const config = { matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'] };
