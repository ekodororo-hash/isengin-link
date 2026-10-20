// Menebak dari mana pengunjung datang, urutannya:
// 1) parameter ?src= (atau utm_source) di link yang dibagikan, 2) domain referer, 3) aplikasi pembuka (user agent).
export const SOURCES = {
  instagram: 'Instagram', whatsapp: 'WhatsApp', tiktok: 'TikTok', facebook: 'Facebook',
  youtube: 'YouTube', x: 'X (Twitter)', telegram: 'Telegram', threads: 'Threads',
  linkedin: 'LinkedIn', pinterest: 'Pinterest', google: 'Google', line: 'LINE',
  langsung: 'Langsung / tidak diketahui', lainnya: 'Lainnya',
};
const ALIAS = { ig: 'instagram', wa: 'whatsapp', fb: 'facebook', yt: 'youtube', twitter: 'x', tg: 'telegram', tt: 'tiktok' };
const HOSTS = [
  ['instagram', ['instagram.com', 'instagr.am']],
  ['facebook', ['facebook.com', 'fb.com', 'fb.me', 'fb.watch', 'messenger.com']],
  ['whatsapp', ['wa.me', 'whatsapp.com']],
  ['tiktok', ['tiktok.com']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['x', ['x.com', 'twitter.com', 't.co']],
  ['telegram', ['t.me', 'telegram.org', 'telegram.me']],
  ['threads', ['threads.net']],
  ['linkedin', ['linkedin.com', 'lnkd.in']],
  ['pinterest', ['pinterest.com', 'pin.it']],
  ['line', ['line.me']],
];
const has = (k) => Object.prototype.hasOwnProperty.call(SOURCES, k);

// Di alamat /go/<id> asal klik dibawa sebagai kode pendek (bukan nama terang seperti "langsung"), dan dihilangkan sama sekali kalau asalnya langsung.
// Catatan: ini hanya merapikan dan menyamarkan tampilan alamat, bukan pengaman; asal klik cuma dipakai untuk statistik.
const TOKENS = {
  instagram: 'k7', whatsapp: 'm2', tiktok: 'q9', facebook: 'f4', youtube: 'y1', x: 'x8', telegram: 't3',
  threads: 'h5', linkedin: 'l6', pinterest: 'p0', google: 'g2', line: 'n9', lainnya: 'z1',
};
const FROM_TOKEN = Object.fromEntries(Object.entries(TOKENS).map(([k, v]) => [v, k]));
// ke "?s=kode", atau "" untuk asal langsung
export const srcQuery = (src) => (TOKENS[src] ? `?s=${TOKENS[src]}` : '');
// baca ?s=: kode baru, atau nama lama (supaya link yang sudah telanjur dibagikan tetap jalan)
export const srcFromParam = (v) => {
  const k = String(v || '').toLowerCase().trim();
  return FROM_TOKEN[k] || normSrc(k) || null;
};

// Hanya nama yang dikenal yang boleh dicatat, supaya tabel tidak bisa dibanjiri nilai acak.
export const normSrc = (v) => {
  const k = String(v || '').toLowerCase().trim();
  return has(k) ? k : null;
};

function fromHost(h) {
  for (const [name, list] of HOSTS) if (list.some((d) => h === d || h.endsWith('.' + d))) return name;
  if (/(^|\.)google\./.test(h)) return 'google';
  return null;
}

export function detectSource({ param, referer, ua, ownHost }) {
  if (param) {
    const p = String(param).toLowerCase().replace(/[^a-z0-9]/g, '');
    return normSrc(p) || ALIAS[p] || 'lainnya';
  }
  if (referer) {
    try {
      const h = new URL(referer).hostname.replace(/^www\./, '').toLowerCase();
      if (h && h !== ownHost) return fromHost(h) || 'lainnya';
    } catch {}
  }
  const u = String(ua || '');
  if (/Instagram/i.test(u)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB/.test(u)) return 'facebook';
  if (/TikTok|musical_ly|Bytedance/i.test(u)) return 'tiktok';
  if (/\bLine\//i.test(u)) return 'line';
  return 'langsung';
}
