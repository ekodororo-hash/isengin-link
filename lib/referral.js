import { sql } from '@/lib/db';
export const REWARD_DAYS = 7;   // hadiah untuk pengundang, per teman yang aktif
export const BONUS_DAYS = 7;    // bonus untuk teman yang diundang
export const MAX_REWARDED = 10; // maksimal teman berhadiah per pengundang
export const MIN_AGE_HOURS = 24; // teman harus sudah mendaftar minimal sekian jam

// Teman dianggap "aktif" bila akunnya berumur >= 24 jam dan punya minimal 1 link yang tampil.
// Tidak ada yang dibayar otomatis. Pengundang dan teman masing-masing klik Klaim sendiri:
//   - pengundang klaim hadiah per teman (ref_rewarded_at), dibatasi MAX_REWARDED teman
//   - teman klaim bonus undangannya sendiri (ref_bonus_at)

// Teman yang hadiahnya sudah bisa diklaim pengundang, dibatasi sisa kuota MAX_REWARDED.
async function ready(me) {
  const done = (await sql`select count(*)::int as n from users where referred_by=${me} and ref_rewarded_at is not null`)[0].n;
  const room = MAX_REWARDED - done;
  if (room <= 0) return [];
  return sql`select u.id, u.username from users u
    where u.referred_by=${me} and u.ref_rewarded_at is null and u.active is not false
      and u.created_at <= now() - make_interval(hours => ${MIN_AGE_HOURS}::int)
      and exists (select 1 from links l where l.user_id=u.id and l.hidden is not true and coalesce(l.kind,'link')='link')
    order by u.id limit ${room}`;
}

// Hadiah pengundang yang siap diklaim (hanya dihitung). null bila tidak ada.
export async function pending(me) {
  const rows = await ready(me);
  if (!rows.length) return null;
  return { kind: 'reward', n: rows.length, days: rows.length * REWARD_DAYS, per: REWARD_DAYS, friends: rows.map((r) => r.username) };
}

// Klaim hadiah pengundang: sekali per teman, satu perintah per teman (aman diklik berulang atau dari dua tab). Teman tidak ikut dibayar.
export async function claim(me) {
  const rows = await ready(me);
  const paid = [];
  for (const x of rows) {
    const r = await sql`
      with r as (update users set ref_rewarded_at=now() where id=${x.id} and ref_rewarded_at is null returning id)
      update users set plan_until = greatest(coalesce(plan_until, now()), now()) + make_interval(days => ${REWARD_DAYS}::int)
      where id=${me} and exists (select 1 from r) returning id`;
    if (r.length) paid.push(x.username);
  }
  return { kind: 'reward', n: paid.length, days: paid.length * REWARD_DAYS, per: REWARD_DAYS, friends: paid };
}

// Bonus undangan milik teman (pengguna ini sendiri): siap diklaim bila ia didaftarkan lewat undangan, belum klaim, dan sudah aktif.
// Batas MAX_REWARDED berlaku saat pendaftaran (app/api/auth/route.js): pengundang yang sudah punya sebanyak itu tidak bisa mengundang lagi.
export async function pendingBonus(me) {
  const r = await sql`select i.username as by from users u join users i on i.id=u.referred_by
    where u.id=${me} and u.ref_bonus_at is null and u.active is not false
      and u.created_at <= now() - make_interval(hours => ${MIN_AGE_HOURS}::int)
      and exists (select 1 from links l where l.user_id=u.id and l.hidden is not true and coalesce(l.kind,'link')='link')`;
  return r.length ? { kind: 'bonus', days: BONUS_DAYS, by: r[0].by } : null;
}

// Klaim bonus undangan sendiri. Satu perintah, hanya sekali.
export async function claimBonus(me) {
  const r = await sql`update users set ref_bonus_at=now(),
      plan_until = greatest(coalesce(plan_until, now()), now()) + make_interval(days => ${BONUS_DAYS}::int)
    where id=${me} and referred_by is not null and ref_bonus_at is null and active is not false
      and created_at <= now() - make_interval(hours => ${MIN_AGE_HOURS}::int)
      and exists (select 1 from links l where l.user_id=users.id and l.hidden is not true and coalesce(l.kind,'link')='link')
    returning id`;
  return { kind: 'bonus', n: r.length, days: r.length * BONUS_DAYS };
}
