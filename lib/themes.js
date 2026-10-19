// Satu sumber untuk semua tema. Warna dipakai lewat variabel CSS inline,
// jadi menambah tema cukup menambah satu baris di sini.
export const THEMES = [
  { key: 'neo', label: 'Neo', bg: '#ffd23f', ink: '#1f2255', btn: '#fffbe8', accent: '#d63220' },
  { key: 'kobalt', label: 'Kobalt', bg: '#ffffff', ink: '#111111', btn: '#f1f1f6', accent: '#2b3cff' },
  { key: 'permen', label: 'Permen', bg: '#ffd1e6', ink: '#3a0b24', btn: '#ffffff', accent: '#e0247f' },
  { key: 'hutan', label: 'Hutan', bg: '#12372a', ink: '#e9ffe9', btn: '#1f5640', accent: '#b8f06a' },
  { key: 'senja', label: 'Senja', bg: '#ffe0c2', ink: '#3b1a05', btn: '#fff4e6', accent: '#c2410c' },
  { key: 'malam', label: 'Malam', bg: '#111218', ink: '#f2f2f7', btn: '#23252f', accent: '#7c8cff' },
  { key: 'laut', label: 'Laut', bg: '#d6f3f5', ink: '#08323a', btn: '#ffffff', accent: '#077a86' },
  { key: 'ungu', label: 'Ungu', bg: '#e7dcff', ink: '#25104a', btn: '#ffffff', accent: '#7a3cf0' },
  { key: 'krem', label: 'Krem', bg: '#f6efe2', ink: '#2a2118', btn: '#ffffff', accent: '#b5651d' },
  { key: 'neon', label: 'Neon', bg: '#0b0b14', ink: '#f5f5ff', btn: '#15152a', accent: '#2bffb0' },
];
export const DEFAULT_THEME = 'neo'; // tema bawaan situs; harus sama dengan default kolom users.theme di database
export const THEME_KEYS = THEMES.map((t) => t.key);
export const getTheme = (key) => THEMES.find((t) => t.key === key) || THEMES.find((t) => t.key === DEFAULT_THEME);

// Warna kustom menimpa warna tema. Hanya hex 6 digit yang diterima.
export const COLOR_KEYS = ['bg', 'ink', 'btn', 'accent'];
export function cleanColors(c) {
  let o = c;
  if (typeof o === 'string') { try { o = o ? JSON.parse(o) : null; } catch { o = null; } }
  const out = {};
  if (o && typeof o === 'object') for (const k of COLOR_KEYS) if (typeof o[k] === 'string' && /^#[0-9a-f]{6}$/i.test(o[k])) out[k] = o[k].toLowerCase();
  return out;
}
export const themeWith = (key, custom) => ({ ...getTheme(key), ...cleanColors(custom) });
export function themeStyle(key, custom) {
  const t = themeWith(key, custom);
  return { '--pbg': t.bg, '--ink': t.ink, '--pbtn': t.btn, '--accent': t.accent, '--pi': t.ink, '--pb': t.btn, '--pa': t.accent };
}

// Rasio kontras WCAG antara dua warna hex (1 sampai 21).
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contrast(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Latar belakang halaman publik: warna tema (kosong), gradasi dua warna, atau gambar.
// Disimpan sebagai JSON teks di kolom users.bg. Gambar harus alamat https tanpa tanda kutip/kurung
// (aman dipakai di CSS url()); kepemilikan file Blob dicek di server (lib/blob.js).
export const ANGLES = [[180, 'Atas ke bawah'], [135, 'Diagonal'], [90, 'Kiri ke kanan']];
const hex6 = (v) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : '');
export function cleanBg(raw) {
  let o = raw;
  if (typeof o === 'string') { try { o = o ? JSON.parse(o) : null; } catch { o = null; } }
  if (!o || typeof o !== 'object') return {};
  if (o.t === 'gradient') {
    const c1 = hex6(o.c1), c2 = hex6(o.c2);
    if (!c1 || !c2) return {};
    const a = Number(o.angle);
    return { t: 'gradient', c1, c2, angle: ANGLES.some(([x]) => x === a) ? a : 180 };
  }
  if (o.t === 'image') {
    const url = typeof o.url === 'string' && o.url.length <= 500 && /^https:\/\/[^\s"'()\\]+$/.test(o.url) ? o.url : '';
    if (!url) return {};
    const d = Number(o.dim);
    return { t: 'image', url, dim: Number.isFinite(d) ? Math.min(90, Math.max(0, Math.round(d))) : 40 };
  }
  return {};
}
const rgba = (h, a) => `rgba(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',')},${a})`;
// Gaya inline untuk latar. Gambar dipudarkan ke warna latar tema (bukan hitam) supaya teks tema tetap terbaca.
export function bgStyle(raw, key, custom) {
  const b = cleanBg(raw);
  if (b.t === 'gradient') return { background: `linear-gradient(${b.angle}deg, ${b.c1}, ${b.c2})` };
  if (b.t === 'image') {
    const o = rgba(themeWith(key, custom).bg, b.dim / 100);
    return { backgroundImage: `linear-gradient(${o}, ${o}), url("${b.url}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
  }
  return {};
}
