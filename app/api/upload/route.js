import { put } from '@vercel/blob';
import { getUserId } from '@/lib/auth';
export async function POST(req) {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const f = (await req.formData()).get('file');
  if (!f || !f.type?.startsWith('image/') || f.size > 2000000)
    return Response.json({ error: 'Pilih gambar, maksimal 2 MB.' }, { status: 400 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN belum ada: sambungkan Vercel Blob ke project lalu Redeploy.');
    return Response.json({ error: 'Penyimpanan foto belum siap. Hubungi pemilik situs.' }, { status: 503 });
  }
  try {
    const b = await put(`avatars/${id}-${Date.now()}`, f, { access: 'public', contentType: f.type });
    return Response.json({ url: b.url });
  } catch (e) {
    console.error('Unggah foto gagal:', e.message);
    return Response.json({ error: 'Foto gagal disimpan. Coba lagi nanti.' }, { status: 500 });
  }
}
