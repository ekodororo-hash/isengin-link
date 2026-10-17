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
];
export const THEME_KEYS = THEMES.map((t) => t.key);
export const getTheme = (key) => THEMES.find((t) => t.key === key) || THEMES[0];
export function themeStyle(key) {
  const t = getTheme(key);
  return { '--pbg': t.bg, '--ink': t.ink, '--pbtn': t.btn, '--accent': t.accent, '--pi': t.ink, '--pb': t.btn, '--pa': t.accent };
}
