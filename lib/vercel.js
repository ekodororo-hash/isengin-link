// Mendaftarkan domain kustom pengguna ke project Vercel lewat REST API.
// Env: VERCEL_API_TOKEN, VERCEL_PROJECT_ID, dan VERCEL_TEAM_ID (hanya bila project ada di team).
import { loadSettings } from '@/lib/settings';
const base = 'https://api.vercel.com';
export const vercelReady = () => !!(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
const q = () => (process.env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : '');
const call = async (method, path, body) => {
  const r = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, d };
};
const pid = () => encodeURIComponent(process.env.VERCEL_PROJECT_ID);

export async function addDomain(domain) {
  await loadSettings();
  const r = await call('POST', `/v10/projects/${pid()}/domains${q()}`, { name: domain });
  // domain_already_in_use_by_other / sudah ada di project lain
  if (!r.ok) return { ok: false, code: r.d?.error?.code || '', message: r.d?.error?.message || 'Vercel menolak domain ini.' };
  return { ok: true };
}

// { verified, misconfigured }: aktif bila terverifikasi dan DNS sudah benar.
export async function domainState(domain) {
  await loadSettings();
  const [p, c] = await Promise.all([
    call('GET', `/v9/projects/${pid()}/domains/${encodeURIComponent(domain)}${q()}`),
    call('GET', `/v6/domains/${encodeURIComponent(domain)}/config${q()}`),
  ]);
  if (!p.ok) return { found: false, verified: false, misconfigured: true };
  return { found: true, verified: p.d.verified === true, misconfigured: c.ok ? c.d.misconfigured === true : true };
}

export async function removeDomain(domain) {
  await loadSettings();
  if (!vercelReady() || !domain) return;
  try { await call('DELETE', `/v9/projects/${pid()}/domains/${encodeURIComponent(domain)}${q()}`); }
  catch (e) { console.error('Gagal melepas domain dari Vercel:', e.message); }
}

// Nama domain yang boleh dipakai pengguna. Mengembalikan teks domain rapi atau null.
const RESERVED_SUFFIX = ['vercel.app', 'vercel.com', 'localhost'];
export function cleanDomain(raw, ownHost) {
  let d = String(raw || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '');
  if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d)) return null;
  const own = String(ownHost || '').replace(/^www\./, '');
  if (own && (d === own || d.endsWith('.' + own))) return null;
  if (RESERVED_SUFFIX.some((s) => d === s || d.endsWith('.' + s))) return null;
  return d;
}

// Uji koneksi untuk halaman admin: token dan project harus cocok.
export async function testVercel() {
  await loadSettings();
  if (!vercelReady()) return { ok: false, message: 'Token dan Project ID belum diisi.' };
  const r = await call('GET', `/v9/projects/${pid()}${q()}`);
  if (r.ok) return { ok: true, message: `Terhubung ke project "${r.d.name || ''}".` };
  if (r.status === 401 || r.status === 403) return { ok: false, message: 'Token ditolak Vercel. Cek token atau Team ID.' };
  if (r.status === 404) return { ok: false, message: 'Project tidak ditemukan. Cek Project ID (dan Team ID bila project ada di Team).' };
  return { ok: false, message: r.d?.error?.message || 'Gagal terhubung ke Vercel.' };
}
