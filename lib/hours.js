// Jam buka toko (waktu WIB). Disimpan sebagai daftar 7 teks, Senin sampai Minggu: "09:00-17:00" atau "" (libur).
export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const T = /^([01]\d|2[0-3]):[0-5]\d$/;
const mins = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
export const dot = (t) => String(t).replace(':', '.');

export function cleanDay(s) {
  const [a, b] = String(s || '').split('-');
  return T.test(a || '') && T.test(b || '') && mins(a) < mins(b) ? a + '-' + b : '';
}

// Hasil: daftar 7 teks, atau daftar kosong bila tidak ada satu pun hari yang berjam (blok jam buka tidak tampil).
export function cleanHours(raw) {
  let arr = raw;
  if (typeof raw === 'string') { try { arr = JSON.parse(raw); } catch { arr = []; } }
  if (!Array.isArray(arr)) arr = [];
  const out = DAYS.map((_, i) => cleanDay(arr[i]));
  return out.some(Boolean) ? out : [];
}

// Status pada waktu ms (epoch). WIB = UTC+7, tanpa perubahan musim.
export function statusAt(hours, ms) {
  if (!Array.isArray(hours) || !hours.some(Boolean)) return null;
  const w = new Date(ms + 7 * 3600000);
  const di = (w.getUTCDay() + 6) % 7;
  const m = w.getUTCHours() * 60 + w.getUTCMinutes();
  const today = hours[di];
  if (today) {
    const [a, b] = today.split('-');
    if (m >= mins(a) && m < mins(b)) return { open: true, label: 'Buka sekarang', detail: 'tutup ' + dot(b), today: di };
    if (m < mins(a)) return { open: false, label: 'Tutup', detail: 'buka hari ini ' + dot(a), today: di };
  }
  for (let k = 1; k <= 7; k++) {
    const d = (di + k) % 7;
    if (hours[d]) return { open: false, label: 'Tutup', detail: 'buka ' + (k === 1 ? 'besok' : DAYS[d]) + ' ' + dot(hours[d].split('-')[0]), today: di };
  }
  return null;
}
