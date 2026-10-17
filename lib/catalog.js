// Link katalog produk: harga, harga coret, dan label. Satu sumber untuk server dan tampilan.
export const LABELS = [
  ['', 'Tanpa'], ['promo', 'Promo'], ['baru', 'Baru'], ['terbatas', 'Stok terbatas'], ['habis', 'Habis'],
];
export const LABEL_KEYS = LABELS.map(([k]) => k);
export const labelText = (k) => (LABELS.find(([x]) => x === k) || [])[1] || '';

// Isian harga bebas, tapi angka saja otomatis jadi "Rp 45.000". Teks lain (mis. "Mulai Rp 20rb") dipakai apa adanya.
export function cleanPrice(v) {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return s;
}
export function fmtPrice(v) {
  const s = cleanPrice(v);
  if (!s) return '';
  if (/^\d+$/.test(s)) return 'Rp ' + s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return s;
}
export const cleanLabel = (v) => (LABEL_KEYS.includes(v) ? v : '');
