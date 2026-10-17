import './panel.css';
// Animasi memuat yang sama di semua halaman. Tanpa prop: layar penuh (dipakai sebelum dashboard/admin tampil).
// inline: di dalam halaman, di bawah judul. small: versi kecil untuk satu bagian kartu.
export default function Loader({ inline = false, small = false }) {
  return (
    <div className={'px-load' + (inline ? ' in' : '') + (small ? ' sm' : '')} role="status" aria-label="Memuat">
      <div className="px-dots" aria-hidden="true"><i /><i /><i /></div>
      <p>Memuat…</p>
    </div>
  );
}
