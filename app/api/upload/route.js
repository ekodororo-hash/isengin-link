import { put } from '@vercel/blob';
import { getUserId } from '@/lib/auth';
export async function POST(req) {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const f = (await req.formData()).get('file');
  if (!f || !f.type?.startsWith('image/') || f.size > 2000000)
    return Response.json({ error: 'Pilih gambar, maksimal 2 MB.' }, { status: 400 });
  const b = await put(`avatars/${id}-${Date.now()}`, f, { access: 'public', contentType: f.type });
  return Response.json({ url: b.url });
}
