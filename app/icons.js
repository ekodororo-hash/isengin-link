// Ikon garis sederhana, warnanya ikut teks (currentColor). Dipilih otomatis dari alamat link.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONS = {
  // Logo WhatsApp (bentuk resmi, berisi), warnanya tetap ikut teks.
  whatsapp: (<path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />),
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
  // Tiga titik vertikal (menu opsi per-tautan) dan ikon salin (dipakai di modal "Bagikan tautan").
  dots: (<g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></g>),
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M6.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5" /></>),
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
// Ikon berdasarkan nama (dipakai untuk ikon sosial media di header profil).
export function NamedIcon({ name, size = 20 }) {
  return (
    <svg className="lico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...S}>
      {ICONS[name] || ICONS.link}
    </svg>
  );
}
