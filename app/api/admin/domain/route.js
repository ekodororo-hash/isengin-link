import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { vercelReady, testVercel } from '@/lib/vercel';
import { loadSettings, saveSettings, view } from '@/lib/settings';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });

async function state() {
  const db = await loadSettings(true);
  const list = await sql`select username, custom_domain, domain_status from users where custom_domain is not null order by id desc limit 50`.catch(() => []);
  return {
    ready: vercelReady(),
    token: view('VERCEL_API_TOKEN', db),
    project: process.env.VERCEL_PROJECT_ID || '',
    team: process.env.VERCEL_TEAM_ID || '',
    list,
  };
}
export async function GET() {
  if (!(await isAdmin())) return no();
  return Response.json(await state());
}

// Simpan pengaturan (token kosong = tidak diubah) atau, dengan test:true, uji koneksi ke Vercel.
export async function PUT(req) {
  if (!(await isAdmin())) return no();
  const b = await req.json().catch(() => ({}));
  if (b.test) return Response.json(await testVercel());
  const vals = {};
  const token = String(b.token || '').trim();
  if (token) {
    if (token.length > 300 || /\s/.test(token)) return Response.json({ error: 'Token tidak valid.' }, { status: 400 });
    vals.VERCEL_API_TOKEN = token;
  } else if (b.clearToken) vals.VERCEL_API_TOKEN = '';
  for (const [f, k] of [['project', 'VERCEL_PROJECT_ID'], ['team', 'VERCEL_TEAM_ID']]) {
    const v = String(b[f] || '').trim();
    if (v.length > 100 || /\s/.test(v)) return Response.json({ error: 'Isian tidak valid.' }, { status: 400 });
    vals[k] = v;
  }
  try { await saveSettings(vals); } catch (e) {
    console.error('Simpan pengaturan gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Gagal menyimpan. Jalankan schema-update.sql di database.' }, { status: 500 });
  }
  return Response.json(await state());
}
