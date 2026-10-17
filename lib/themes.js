// Satu sumber untuk semua tema. Warna dipakai lewat variabel CSS inline,
// jadi menambah tema cukup menambah satu baris di sini.
export const THEMES = [
  { key: 'kobalt', label: 'Kobalt', bg: '#ffffff', ink: '#111111', btn: '#f1f1f6', accent: '#2b3cff' },
  { key: 'permen', label: 'Permen', bg: '#ffd1e6', ink: '#3a0b24', btn: '#ffffff', accent: '#e0247f' },
  { key: 'hutan', label: 'Hutan', bg: '#12372a', ink: '#e9ffe9', btn: '#1f5640', accent: '#b8f06a' },
  { key: 'senja', label: 'Senja', bg: '#ffe0c2', ink: '#3b1a05', btn: '#fff4e6', accent: '#c2410c' },
  { key: 'malam', label: 'Malam', bg: '#111218', ink: '#f2f2f7', btn: '#23252f', accent: '#7c8cff' },
  { key: 'laut', label: 'Laut', bg: '#d6f3f5', ink: '#08323a', btn: '#ffffff', accent: '#077a86' },
  { key: 'ungu', label: 'Ungu', bg: '#e7dcff', ink: '#25104a', btn: '#ffffff', accent: '#7a3cf0' },
  { key: 'krem', label: 'Krem', bg: '#f6efe2', ink: '#2a2118', btn: '#ffffff', accent: '#b5651d' },
  { key: 'neo', label: 'Neo', bg: '#ffd23f', ink: '#1f2255', btn: '#fffbe8', accent: '#d63220' },
  { key: 'neon', label: 'Neon', bg: '#0b0b14', ink: '#f5f5ff', btn: '#15152a', accent: '#2bffb0' },
];
export const THEME_KEYS = THEMES.map((t) => t.key);
export const getTheme = (key) => THEMES.find((t) => t.key === key) || THEMES[0];

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
