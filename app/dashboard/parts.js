'use client';
import { useDash } from './DashContext';
export function Phone() {
  const { m } = useDash();
  const n = m.display_name || m.username;
  return (
    <div className="px-ph" data-t={m.theme}>
      {m.photo_url ? <img className="a" src={m.photo_url} alt="" /> : <div className="a">{n[0].toUpperCase()}</div>}
      <h3>{n}</h3><p>{m.bio}</p>
      {m.links.map((l, i) => <div className="l" key={i}>{l.title || 'Judul link'}</div>)}
    </div>
  );
}
export function SaveBar() {
  const { save, msg } = useDash();
  return <p><button className="px-btn" onClick={save}>Simpan</button>{msg && <span role="status">{msg}</span>}</p>;
}
