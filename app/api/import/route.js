import { getUserId } from '@/lib/auth';
import { hit, tooMany } from '@/lib/limit';
import { parseLinktree } from '@/lib/linktree';
import { urlProblem } from '@/lib/safe';
export const dynamic = 'force-dynamic';

// Impor link dari halaman Linktree. Hanya mengembalikan daftar link; pengguna yang menekan Simpan.
// Alamat yang diambil selalu https://linktr.ee/<nama>, nama dari pengguna divalidasi ketat (tidak bisa mengarah ke tempat lain).
export async function POST(req) {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const { handle = '' } = await req.json().catch(() => ({}));
  const h = String(handle).trim().replace(/^https?:\/\/(www\.)?linktr\.ee\//i, '').replace(/^linktr\.ee\//i, '').replace(/^@/, '').split(/[/?#]/)[0];
  if (!/^[A-Za-z0-9_.-]{1,40}$/.test(h)) return Response.json({ error: 'Isi nama Linktree-mu, mis. namakamu atau linktr.ee/namakamu.' }, { status: 400 });
  const lim = await hit(`import:${id}`, 6, 3600);
  if (lim.over) return tooMany(lim);
  let res;
  try {
    res = await fetch(`https://linktr.ee/${encodeURIComponent(h)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; isengin-import/1.0)', Accept: 'text/html', 'Accept-Language': 'id,en;q=0.8' },
      redirect: 'follow', cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
  } catch {
    return Response.json({ error: 'Linktree tidak bisa dihubungi sekarang. Coba lagi sebentar lagi.' }, { status: 502 });
  }
  if (res.status === 404) return Response.json({ error: 'Halaman Linktree itu tidak ditemukan. Cek lagi namanya.' }, { status: 404 });
  let host = '';
  try { host = new URL(res.url).hostname; } catch {}
  if (!res.ok || host !== 'linktr.ee') return Response.json({ error: 'Linktree tidak bisa dibaca sekarang.' }, { status: 502 });
  const p = parseLinktree((await res.text()).slice(0, 3_000_000));
  if (!p || !p.links.some((l) => l.kind === 'link'))
    return Response.json({ error: 'Tidak ada link yang bisa dibaca dari halaman itu. Bisa jadi halamannya kosong, dikunci, atau bentuknya berubah.' }, { status: 422 });
  // Buang alamat yang tidak lolos pemeriksaan keamanan.
  let skipped = 0;
  const links = p.links.filter((l) => {
    if (l.kind === 'header') return true;
    if (urlProblem(l.url)) { skipped++; return false; }
    return true;
  });
  return Response.json({ links, skipped });
}
