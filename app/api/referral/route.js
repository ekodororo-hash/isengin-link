import { sql } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { settle, REWARD_DAYS, BONUS_DAYS, MAX_REWARDED, MIN_AGE_HOURS } from '@/lib/referral';
export const dynamic = 'force-dynamic';

export async function GET() {
  const id = await getUserId();
  if (!id) return Response.json({ error: 'Belum masuk.' }, { status: 401 });
  try {
    await settle(id);
    const me = (await sql`select username,(plan_until > now()) as pro,plan_until from users where id=${id}`)[0];
    const friends = await sql`select username, (ref_rewarded_at is not null) as rewarded, created_at from users where referred_by=${id} order by id desc limit 100`;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');
    const rewarded = friends.filter((f) => f.rewarded).length;
    return Response.json({
      url: `${site}/?ref=${me.username}`,
      friends, invited: friends.length, rewarded, earnedDays: rewarded * REWARD_DAYS,
      pro: me.pro === true, until: me.plan_until || null,
      rules: { reward: REWARD_DAYS, bonus: BONUS_DAYS, max: MAX_REWARDED, hours: MIN_AGE_HOURS },
    });
  } catch (e) {
    console.error('Referral gagal (sudah jalankan schema-update.sql?):', e.message);
    return Response.json({ error: 'Fitur ini belum siap. Jalankan schema-update.sql di database.' }, { status: 500 });
  }
}
