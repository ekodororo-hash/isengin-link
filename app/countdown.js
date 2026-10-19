// Format sisa waktu untuk hitung mundur: "2h 3j 15m", "3j 15m 09d", "15m 09d", "42d". Detik tampil saat kurang dari sehari.
export function fmtLeft(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const ss = String(s).padStart(2, '0');
  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m ${ss}d`;
  if (m > 0) return `${m}m ${ss}d`;
  return `${s}d`;
}
