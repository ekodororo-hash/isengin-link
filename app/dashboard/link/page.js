'use client';
import { useDash } from '../DashContext';
import { SaveBar } from '../parts';
import { LinkIcon } from '../../icons';
export default function LinkPage() {
  const { m, setL, addLink, delLink, move } = useDash();
  const n = m.links.length;
  return (<>
    <h1>Link</h1>
    <p className="px-sub">Urutan di sini sama dengan urutan di halamanmu. Setelah mengubah, klik Simpan.</p>
    <div className="px-card">
      {n === 0 && <p className="px-empty">Belum ada link. Klik “Tambah link” untuk mulai.</p>}
      {m.links.map((l, i) => (
        <div className="px-lk" key={l.id || l._k || 'n' + i}>
          <div className="px-lk-f">
            <input aria-label={`Judul link ${i + 1}`} placeholder="Judul" value={l.title} maxLength={60} onChange={(e) => setL(i, 'title', e.target.value)} />
            <input aria-label={`Alamat link ${i + 1}`} placeholder="https://..." value={l.url} onChange={(e) => setL(i, 'url', e.target.value)} />
          </div>
          <div className="px-lk-a">
            <span className="px-lk-n"><LinkIcon url={l.url} size={18} />{i + 1}</span>
            <button className="px-sq" aria-label={`Naikkan link ${i + 1}`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button className="px-sq" aria-label={`Turunkan link ${i + 1}`} disabled={i === n - 1} onClick={() => move(i, 1)}>↓</button>
            <button className="px-btn d sm" onClick={() => delLink(i)}>Hapus</button>
          </div>
        </div>
      ))}
      <SaveBar><button className="px-btn g" onClick={addLink}>Tambah link</button></SaveBar>
    </div>
  </>);
}
