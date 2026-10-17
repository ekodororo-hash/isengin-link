// Aturan fitur tampilan yang khusus Pro. Satu sumber untuk server, halaman publik, pratinjau, dan dashboard.
// Tanpa env di sini supaya aman dipakai di komponen klien. Harga paket ada di lib/plan.js.
import { cleanBg } from './themes';
export const PRO_THEMES = ['neo', 'neon'];
export const PRO_FONTS = ['serif', 'mono', 'tebal'];
export const PRO_BTNS = ['kotak', 'garis', 'timbul'];
export const FREE_THUMBS = 3; // gambar di link untuk paket gratis

const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

// Tampilan yang benar-benar dipakai halaman publik. Pilihan Pro tetap tersimpan di akun (tidak dihapus),
// hanya tidak tampil selama paketnya tidak aktif, jadi memperpanjang Pro langsung memulihkannya.
export function effectiveLook(x, pro) {
  if (pro) return x;
  return {
    theme: PRO_THEMES.includes(x.theme) ? 'kobalt' : x.theme,
    font_key: PRO_FONTS.includes(x.font_key) ? 'standar' : x.font_key,
    btn_style: PRO_BTNS.includes(x.btn_style) ? 'bulat' : x.btn_style,
    colors: '',
    bg: cleanBg(x.bg).t === 'image' ? '' : x.bg,
  };
}

// Gambar link yang boleh tampil: paket gratis hanya FREE_THUMBS gambar pertama. `list` = link yang tampil, berurutan.
export const thumbOk = (list, i, pro) => pro || list.slice(0, i).filter((l) => l.thumb).length < FREE_THUMBS;

// Daftar pilihan Pro yang sedang tersimpan di akun (untuk pemberitahuan ke pengguna gratis).
export function proUses(m) {
  const out = [];
  if (PRO_THEMES.includes(m.theme)) out.push(`Tema ${cap(m.theme)}`);
  if (PRO_FONTS.includes(m.font_key)) out.push(`Font ${cap(m.font_key)}`);
  if (PRO_BTNS.includes(m.btn_style)) out.push(`Gaya tombol ${cap(m.btn_style)}`);
  if (m.colors && Object.keys(m.colors).length) out.push('Warna kustom');
  if (m.bg?.t === 'image') out.push('Latar gambar');
  const th = (m.links || []).filter((l) => !l.hidden && l.kind !== 'header' && l.thumb).length;
  if (th > FREE_THUMBS) out.push(`Gambar link (hanya ${FREE_THUMBS} pertama yang tampil)`);
  return out;
}
