import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { pending, claim, pendingBonus, claimBonus, REWARD_DAYS, BONUS_DAYS, MAX_REWARDED, MIN_AGE_HOURS } from '@/lib/referral';
export const dynamic = 'force-dynamic';

export async function GET() {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  try {
    const me = (await sql`select username,(plan_until > now()) as pro,plan_until from users where id=${id}`)[0];
    const friends = await sql`select username, (ref_rewarded_at is not null) as rewarded, created_at from users where referred_by=${id} order by id desc limit 100`;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');
    const rewarded = friends.filter((f) => f.rewarded).length;
    const [ready, bonus] = await Promise.all([pending(id), pendingBonus(id)]); // hadiah pengundang & bonus undangan yang siap diklaim
    return Response.json({
      url: `${site}/?ref=${me.username}`,
      friends, invited: friends.length, rewarded, earnedDays: rewarded * REWARD_DAYS,
      pending: ready ? { n: ready.n, days: ready.days, friends: ready.friends } : null,
      bonus: bonus ? { days: bonus.days, by: bonus.by } : null,
      pro: me.pro === true, until: me.plan_until || null,
      rules: { reward: REWARD_DAYS, bonus: BONUS_DAYS, max: MAX_REWARDED, hours: MIN_AGE_HOURS },
    });
  } catch (e) {
    console.error('Referral gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Fitur ini belum siap. Jalankan schema-update.sql di database.' }, { status: 500 });
  }
}

// Klaim, masing-masing sendiri: { kind: 'reward' } hadiah untuk pengundang, { kind: 'bonus' } bonus undangan untuk teman yang diundang.
export async function POST(req) {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  try {
    const got = b.kind === 'bonus' ? await claimBonus(id) : await claim(id);
    const me = (await sql`select (plan_until > now()) as pro, plan_until from users where id=${id}`)[0];
    return Response.json({ ...got, pro: me.pro === true, until: me.plan_until || null });
  } catch (e) {
    console.error('Klaim referral gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Klaim gagal. Coba lagi sebentar.' }, { status: 500 });
  }
}
