import { sql } from '@/lib/db';
import { loadSettings } from '@/lib/settings';
import { getUserId } from '@/lib/auth';
import { hit, tooMany } from '@/lib/limit';
import { addDomain, domainState, removeDomain, cleanDomain, vercelReady } from '@/lib/vercel';
export const dynamic = 'force-dynamic';
const no = () => Response.json({ error: 'Belum masuk.' }, { status: 401 });
const bad = (error, status = 400) => Response.json({ error }, { status });
const ownHost = () => { try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').hostname; } catch { return 'isengin.site'; } };

async function mine(id) {
  const r = await sql`select custom_domain, domain_status, (plan_until > now()) as pro from users where id=${id}`.catch(() => []);
  return { domain: r[0]?.custom_domain || '', status: r[0]?.domain_status || '', pro: r[0]?.pro === true };
}

export async function GET() {
  await loadSettings();
  const id = await getUserId();
  if (!id) return no();
  const d = await mine(id);
  return Response.json({ ...d, ready: vercelReady(), cname: 'cname.vercel-dns.com', a: '76.76.21.21' });
}

// mode "add": pasang domain (Pro). mode "check": cek DNS lalu aktifkan bila sudah benar.
export async function POST(req) {
  await loadSettings();
  const id = await getUserId();
  if (!id) return no();
  if (!vercelReady()) return bad('Fitur domain belum dikonfigurasi oleh pemilik situs.', 503);
  const lim = await hit(`dom:${id}`, 30, 3600);
  if (lim.over) return tooMany(lim);
  const b = await req.json().catch(() => ({}));
  const cur = await mine(id);

  if (b.mode === 'check') {
    if (!cur.domain) return bad('Belum ada domain.');
    const s = await domainState(cur.domain);
    const ok = s.found && s.verified && !s.misconfigured;
    await sql`update users set domain_status=${ok ? 'active' : 'pending'} where id=${id}`;
    return Response.json({ status: ok ? 'active' : 'pending', verified: s.verified, misconfigured: s.misconfigured });
  }

  if (!cur.pro) return bad('Domain kustom khusus paket Pro.', 402);
  if (cur.domain) return bad('Hapus domain yang lama dulu sebelum memasang yang baru.', 409);
  const domain = cleanDomain(b.domain, ownHost());
  if (!domain) return bad('Alamat domain belum benar. Contoh: link.tokokamu.com atau tokokamu.com.');
  if ((await sql`select 1 from users where custom_domain=${domain}`).length) return bad('Domain ini sudah dipakai akun lain.', 409);
  const r = await addDomain(domain);
  if (!r.ok) return bad(r.code === 'domain_taken' || /already|in use/i.test(r.message) ? 'Domain ini sudah terpasang di tempat lain.' : r.message, 409);
  try {
    await sql`update users set custom_domain=${domain}, domain_status='pending' where id=${id}`;
  } catch (e) {
    await removeDomain(domain);
    console.error('Gagal menyimpan domain:', e.message);
    return bad('Domain gagal disimpan. Coba lagi.', 500);
  }
  return Response.json({ domain, status: 'pending' });
}

export async function DELETE() {
  await loadSettings();
  const id = await getUserId();
  if (!id) return no();
  const cur = await mine(id);
  if (!cur.domain) return Response.json({ ok: true });
  await sql`update users set custom_domain=null, domain_status='' where id=${id}`;
  await removeDomain(cur.domain);
  return Response.json({ ok: true });
}
