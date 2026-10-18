// Paket dan harga (rupiah). Harga diatur dari halaman admin (Pembayaran) atau lewat env; dibaca saat dipakai supaya perubahan langsung berlaku.
export const PLANS = {
  bulanan: { label: '1 bulan', days: 30, get price() { return Number(process.env.PRO_PRICE_MONTH) || 29000; } },
  tahunan: { label: '1 tahun', days: 365, get price() { return Number(process.env.PRO_PRICE_YEAR) || 290000; } },
};
export const planKey = (v) => (Object.prototype.hasOwnProperty.call(PLANS, v) ? v : null);
