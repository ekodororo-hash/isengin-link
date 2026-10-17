import { sql } from '@/lib/db';

export function ipOf(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

// Hitung satu percobaan untuk `key`. Disimpan di database karena fungsi serverless
// tidak berbagi memori. Mengembalikan { over, wait } (wait dalam detik).
export async function hit(key, max, sec) {
  const r = await sql`
    insert into rate_limits(key, count, reset_at) values (${key}, 1, now() + make_interval(secs => ${sec}::float8))
    on conflict (key) do update set
      count = case when rate_limits.reset_at <= now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at <= now() then now() + make_interval(secs => ${sec}::float8) else rate_limits.reset_at end
    returning count, greatest(1, ceil(extract(epoch from (reset_at - now()))))::int as wait`;
  if (Math.random() < 0.02) await sql`delete from rate_limits where reset_at < now() - interval '1 day'`;
  return { over: r[0].count > max, wait: r[0].wait };
}

export const clear = (key) => sql`delete from rate_limits where key=${key}`;

export const tooMany = ({ wait }) =>
  Response.json(
    { error: `Terlalu banyak percobaan. Coba lagi sekitar ${Math.max(1, Math.ceil(wait / 60))} menit lagi.` },
    { status: 429, headers: { 'Retry-After': String(wait) } }
  );
