import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET(req, { params }) {
  const r = await sql`update links set clicks=clicks+1 where id=${Number(params.id) || 0} returning url`;
  return Response.redirect(r[0]?.url || new URL('/', req.url).toString(), 302);
}
