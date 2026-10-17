// Ikon garis sederhana, warnanya ikut teks (currentColor). Dipilih otomatis dari alamat link.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONS = {
  whatsapp: (<><path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z" /><path d="M9.2 9c0 3.3 2.7 6 6 6l1.1-1.5-2-1-1 .9c-.9-.4-1.6-1.1-2-2l.9-1-1-2L9.2 9z" /></>),
  instagram: (<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r=".9" fill="currentColor" stroke="none" /></>),
  youtube: (<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></>),
  tiktok: (<><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 4c.4 2.4 2 4 4.5 4.2" /></>),
  facebook: (<><circle cx="12" cy="12" r="9" /><path d="M13.5 20.5v-7h2.2l.4-2.6h-2.6V9.2c0-.8.3-1.3 1.4-1.3h1.3V5.6c-.3 0-1.1-.1-2-.1-2 0-3.3 1.2-3.3 3.4v1.9H8.7v2.6h2.2v7" /></>),
  x: (<path d="M5 5l14 14M19 5L5 19" />),
  github: (<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />),
  linkedin: (<><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5V16M8 7.8v.1M11.5 16v-5.5M11.5 13c0-1.5 1-2.6 2.4-2.6s2.1 1 2.1 2.5V16" /></>),
  telegram: (<><path d="M21 4L3 11l5.5 2L10 19l3-3.5 4.5 3.5L21 4z" /><path d="M8.5 13L21 4" /></>),
  spotify: (<><circle cx="12" cy="12" r="9" /><path d="M7.5 9.5c3.2-1 6.8-.7 9.5 1M8 12.7c2.6-.7 5.3-.4 7.6.9M8.5 15.7c2-.5 4-.3 5.7.6" /></>),
  email: (<><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M4 8l8 5.5L20 8" /></>),
  toko: (<><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>),
  link: (<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>),
};
const RULES = [
  ['whatsapp', ['wa.me', 'whatsapp.com', 'api.whatsapp.com']],
  ['instagram', ['instagram.com', 'instagr.am']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['tiktok', ['tiktok.com']],
  ['facebook', ['facebook.com', 'fb.com', 'fb.me']],
  ['x', ['x.com', 'twitter.com']],
  ['github', ['github.com']],
  ['linkedin', ['linkedin.com']],
  ['telegram', ['t.me', 'telegram.me']],
  ['spotify', ['spotify.com']],
  ['toko', ['tokopedia.com', 'tokopedia.link', 'shopee.co.id', 'shopee.com', 'shp.ee', 'lazada.co.id', 'bukalapak.com', 'blibli.com']],
];
export function iconName(url = '') {
  const s = String(url).trim();
  if (/^mailto:/i.test(s)) return 'email';
  let h = '';
  try { h = new URL(/^https?:/i.test(s) ? s : 'https://' + s).hostname.replace(/^www\./, '').toLowerCase(); } catch { return 'link'; }
  for (const [name, hosts] of RULES) if (hosts.some((d) => h === d || h.endsWith('.' + d))) return name;
  return 'link';
}
export function LinkIcon({ url, size = 20 }) {
  return (
    <svg className="lico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...S}>
      {ICONS[iconName(url)]}
    </svg>
  );
}
