// Penghitung unik harian lewat cookie. Satu pengunjung dihitung sekali per halaman (atau per link)
// sampai pergantian hari WIB (00.00), sama dengan batas hari di statistik (daily_stats).
export function hasCookie(req, name) {
  const c = req.headers.get('cookie') || '';
  return c.split(';').some((p) => p.trim().startsWith(name + '='));
}
export function untilMidnightWIB() {
  const wib = Math.floor(Date.now() / 1000) + 7 * 3600;
  return Math.max(60, 86400 - (wib % 86400));
}
export function dayCookie(req, name) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${name}=1; Path=/; Max-Age=${untilMidnightWIB()}; SameSite=Lax${secure}`;
}
