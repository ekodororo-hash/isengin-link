import { sql } from '@/lib/db';
import { hit, ipOf } from '@/lib/limit';
import { RESERVED } from '@/lib/reserved';

export const dynamic = 'force-dynamic';

// Cek nama pengguna saat mengetik di halaman daftar: { status: 'ok' | 'taken' | 'reserved' | 'invalid' | 'limit' }.
// Dibatasi per alamat IP supaya tidak dipakai untuk menyapu daftar nama pengguna.
export async function GET(req) {
  const u = String(new URL(req.url).searchParams.get('u') || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return Response.json({ status: 'invalid' });
  if (RESERVED.includes(u)) return Response.json({ status: 'reserved' });
  const lim = await hit(`un:${ipOf(req)}`, 40, 60);
  if (lim.over) return Response.json({ status: 'limit' });
  try {
    const r = await sql`select 1 from users where username=${u}`;
    return Response.json({ status: r.length ? 'taken' : 'ok' });
  } catch {
    return Response.json({ status: 'limit' });
  }
}
