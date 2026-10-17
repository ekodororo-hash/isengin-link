// Paket dan harga (rupiah). Harga bisa diubah lewat env tanpa mengubah kode.
export const PLANS = {
  bulanan: { label: '1 bulan', days: 30, price: Number(process.env.PRO_PRICE_MONTH) || 29000 },
  tahunan: { label: '1 tahun', days: 365, price: Number(process.env.PRO_PRICE_YEAR) || 290000 },
};
export const planKey = (v) => (Object.prototype.hasOwnProperty.call(PLANS, v) ? v : null);
