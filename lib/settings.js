// Pengaturan pembayaran dan domain yang bisa diubah dari halaman admin.
// Nilai di tabel site_settings mengalahkan Environment Variables; kalau kosong, Environment Variables dipakai seperti biasa.
import { sql } from '@/lib/db';

export const KEYS = ['MIDTRANS_SERVER_KEY', 'MIDTRANS_IS_PRODUCTION', 'PRO_PRICE_MONTH', 'PRO_PRICE_YEAR', 'VERCEL_API_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_TEAM_ID'];
export const SECRET = ['MIDTRANS_SERVER_KEY', 'VERCEL_API_TOKEN'];
const BASE = Object.fromEntries(KEYS.map((k) => [k, process.env[k]])); // nilai asli dari Environment Variables
let cache = { at: 0, db: {} };

// Muat dari database (disimpan 10 detik) lalu terapkan ke process.env, jadi kode lain tetap membaca process.env seperti biasa.
export async function loadSettings(force = false) {
  if (!force && Date.now() - cache.at < 10000) return cache.db;
  let db = {};
  try {
    const rows = await sql`select key, value from site_settings`;
    db = Object.fromEntries(rows.filter((r) => KEYS.includes(r.key) && r.value !== '').map((r) => [r.key, r.value]));
  } catch (e) {
    console.error('Gagal membaca site_settings (cek tabelnya sudah dibuat lewat schema-update.sql dan koneksi database):', e.message);
  }
  for (const k of KEYS) {
    const v = db[k] ?? BASE[k];
    if (v === undefined || v === '') delete process.env[k]; else process.env[k] = v;
  }
  cache = { at: Date.now(), db };
  return db;
}

// Simpan: nilai kosong menghapus isian di sini (kembali ke Environment Variables).
export async function saveSettings(values) {
  for (const [k, v] of Object.entries(values)) {
    if (!KEYS.includes(k)) continue;
    if (v === '' || v == null) await sql`delete from site_settings where key=${k}`;
    else await sql`insert into site_settings(key, value, updated_at) values (${k}, ${String(v)}, now()) on conflict (key) do update set value=excluded.value, updated_at=now()`;
  }
  return loadSettings(true);
}

// Bentuk aman untuk dikirim ke halaman admin: kunci rahasia hanya ditampilkan 4 huruf terakhir.
export function view(key, db) {
  const v = process.env[key] || '';
  const mask = SECRET.includes(key);
  return { set: !!v, from: db[key] !== undefined ? 'admin' : v ? 'vercel' : '', value: mask ? (v ? '••••' + v.slice(-4) : '') : v };
}
