import { sql } from '@/lib/db';
import { hit, ipOf, tooMany } from '@/lib/limit';
import { MAX_REWARDED } from '@/lib/referral';
export const dynamic = 'force-dynamic';

// Publik (dipakai halaman Daftar): apakah undangan dari kode ini sudah penuh? Hanya mengembalikan true/false dan batasnya.
export async function GET(req) {
  const lim = await hit(`refcek:${ipOf(req)}`, 60, 600);
  if (lim.over) return tooMany(lim);
  const code = (new URL(req.url).searchParams.get('ref') || '').trim().toLowerCase();
  const out = (full) => Response.json({ full, max: MAX_REWARDED });
  if (!/^[a-z0-9_]{3,20}$/.test(code)) return out(false);
  try {
    const n = (await sql`select count(*)::int as n from users x
      where x.referred_by = (select id from users where username=${code} and active is not false)`)[0].n;
    return out(n >= MAX_REWARDED);
  } catch { return out(false); }
}
