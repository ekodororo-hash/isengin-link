const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site').replace(/\/$/, '');

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/api/', '/go/'] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
