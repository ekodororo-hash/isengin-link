// Gaya tombol dan font halaman publik. Tambah pilihan cukup di sini lalu di globals.css.
export const BUTTON_STYLES = [
  { key: 'bulat', label: 'Bulat' },
  { key: 'pil', label: 'Pil' },
  { key: 'kotak', label: 'Kotak' },
  { key: 'garis', label: 'Garis' },
  { key: 'timbul', label: 'Timbul' },
];
export const FONTS = [
  { key: 'standar', label: 'Standar', css: '"Bricolage Grotesque",system-ui,sans-serif' },
  { key: 'jakarta', label: 'Jakarta', css: '"Plus Jakarta Sans",system-ui,sans-serif' },
  { key: 'serif', label: 'Serif', css: '"Playfair Display",Georgia,serif' },
  { key: 'mono', label: 'Mono', css: '"Space Mono",ui-monospace,monospace' },
  { key: 'tebal', label: 'Tebal', css: 'Bungee,system-ui,sans-serif' },
];
export const BTN_KEYS = BUTTON_STYLES.map((x) => x.key);
export const FONT_KEYS = FONTS.map((x) => x.key);
export const cleanBtn = (v) => (BTN_KEYS.includes(v) ? v : 'bulat');
export const cleanFont = (v) => (FONT_KEYS.includes(v) ? v : 'standar');
export const fontCss = (k) => (FONTS.find((x) => x.key === k) || FONTS[0]).css;
