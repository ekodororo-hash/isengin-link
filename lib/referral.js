import { sql } from '@/lib/db';
export const REWARD_DAYS = 7;   // hadiah untuk pengundang, per teman yang aktif
export const BONUS_DAYS = 7;    // bonus untuk teman yang diundang
export const MAX_REWARDED = 10; // maksimal teman berhadiah per pengundang
export const MIN_AGE_HOURS = 24; // teman harus sudah mendaftar minimal sekian jam

// Teman dianggap "aktif" bila akunnya berumur >= 24 jam dan punya minimal 1 link yang tampil.
// Hadiah dibayarkan sekali per teman, dalam satu perintah (aman dipanggil berulang).
export async function settle(me) {
  const done = (await sql`select count(*)::int as n from users where referred_by=${me} and ref_rewarded_at is not null`)[0].n;
  const room = MAX_REWARDED - done;
  if (room <= 0) return 0;
  const ready = await sql`select u.id from users u
    where u.referred_by=${me} and u.ref_rewarded_at is null and u.active is not false
      and u.created_at <= now() - make_interval(hours => ${MIN_AGE_HOURS}::int)
      and exists (select 1 from links l where l.user_id=u.id and l.hidden is not true and coalesce(l.kind,'link')='link')
    order by u.id limit ${room}`;
  let n = 0;
  for (const x of ready) {
    const r = await sql`
      with r as (update users set ref_rewarded_at=now(),
                   plan_until = greatest(coalesce(plan_until, now()), now()) + make_interval(days => ${BONUS_DAYS}::int)
                 where id=${x.id} and ref_rewarded_at is null returning id)
      update users set plan_until = greatest(coalesce(plan_until, now()), now()) + make_interval(days => ${REWARD_DAYS}::int)
      where id=${me} and exists (select 1 from r) returning id`;
    if (r.length) n++;
  }
  return n;
}
