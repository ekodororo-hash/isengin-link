'use client';
import { useDash } from '../DashContext';
import { SaveBar } from '../parts';
export default function LinkPage() {
  const { m, set, setL } = useDash();
  return (<>
    <h1>Link</h1><p className="px-sub">Urutan di sini sama dengan urutan di halamanmu.</p>
    <div className="px-card">
      {m.links.map((l, i) => (
        <div className="px-row" key={l.id || 'n' + i}>
          <input aria-label="Judul link" placeholder="Judul" value={l.title} onChange={(e) => setL(i, 'title', e.target.value)} />
          <input aria-label="Alamat link" placeholder="https://..." value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
          <button className="px-btn d" onClick={() => set('links', m.links.filter((_, j) => j !== i))}>Hapus</button>
        </div>
      ))}
      <button className="px-btn g" onClick={() => set('links', [...m.links, { title: '', url: '' }])}>Tambah link</button>
      <SaveBar />
    </div>
  </>);
}
