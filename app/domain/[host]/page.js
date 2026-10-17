import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import Profile, { generateMetadata as profileMeta } from '../../[username]/page';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');

// Hanya domain yang sudah aktif dan pemiliknya masih Pro yang dilayani.
const find = async (host) =>
  (await sql`select username from users where custom_domain=${host} and domain_status='active' and plan_until > now() and active is not false`.catch(() => []))[0];

export async function generateMetadata({ params }) {
  const host = decodeURIComponent(params.host).toLowerCase();
  const u = await find(host);
  if (!u) return { title: 'Halaman tidak ditemukan', robots: { index: false } };
  const m = await profileMeta({ params: { username: u.username } });
  const url = `https://${host}`;
  return {
    ...m,
    alternates: { canonical: url },
    openGraph: { ...m.openGraph, url, images: [`${SITE}/${u.username}/opengraph-image`] },
    twitter: { ...m.twitter, images: [`${SITE}/${u.username}/opengraph-image`] },
  };
}

export default async function DomainPage({ params, searchParams }) {
  const u = await find(decodeURIComponent(params.host).toLowerCase());
  if (!u) notFound();
  return Profile({ params: { username: u.username }, searchParams });
}
