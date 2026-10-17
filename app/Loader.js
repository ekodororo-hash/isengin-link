import './panel.css';
export default function Loader() {
  return (
    <div className="px-load" role="status" aria-label="Memuat">
      <div className="px-dots" aria-hidden="true"><i /><i /><i /></div>
      <p>Memuat…</p>
    </div>
  );
}
