'use client';
import { useEffect, useState } from 'react';
import Loader from '../../Loader';
import { usePre } from '../../prefetch';
import { Pill, Field, Secret, From } from '../Bits';
const J = { 'Content-Type': 'application/json' };

export default function Domain() {
  const pre = usePre('/api/admin/domain');
  const x0 = pre?.ok ? pre.data : null;
  const [d, setD] = useState(x0);
  const [err, setErr] = useState(pre && !pre.ok ? pre.data?.error || 'Gagal memuat.' : '');
  const [token, setToken] = useState(''), [project, setProject] = useState(x0 ? x0.project : ''), [team, setTeam] = useState(x0 ? x0.team : '');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const fill = (x) => { setD(x); setProject(x.project); setTeam(x.team); setToken(''); };
  useEffect(() => {
    if (pre) return;
    fetch('/api/admin/domain').then(async (r) => { const x = await r.json().catch(() => ({})); if (r.ok) fill(x); else setErr(x.error || 'Gagal memuat.'); });
  }, []);
  async function put(body, tag) {
    setBusy(tag); setMsg(null);
    const r = await fetch('/api/admin/domain', { method: 'PUT', headers: J, body: JSON.stringify(body) });
    const x = await r.json().catch(() => ({}));
    setBusy('');
    return { ok: r.ok, x };
  }
  async function save(e, extra = {}) {
    e?.preventDefault();
    const { ok, x } = await put({ token, project, team, ...extra }, 'save');
    if (ok) { fill(x); setMsg({ t: 'Tersimpan.' }); } else setMsg({ t: x.error || 'Gagal menyimpan.', err: true });
  }
  async function test() {
    const { x } = await put({ test: true }, 'test');
    setMsg({ t: x.message || 'Gagal menguji.', err: !x.ok });
  }
  if (err) return (<><h1>Domain</h1><p className="px-err" role="alert">{err}</p></>);
  if (!d) return (<><h1>Domain</h1><Loader inline /></>);
  return (<>
    <h1>Domain</h1>
    <p className="px-sub">Pengguna Pro bisa memakai domain sendiri. Domainnya didaftarkan otomatis ke project Vercel. Perubahan langsung berlaku.</p>
    <div className="px-card">
      <section className="px-sec">
        <h2>Koneksi Vercel <Pill ok={d.ready}>{d.ready ? 'Aktif' : 'Belum aktif'}</Pill></h2>
        <form onSubmit={save}>
          <Field id="vt" label={<>Token API <From f={d.token.from} /></>} hint="Buat di Vercel: Account Settings, Tokens. Dipakai untuk mendaftarkan domain pengguna.">
            <Secret id="vt" value={token} onChange={(e) => setToken(e.target.value)} placeholder={d.token.set ? `Tersimpan (${d.token.value}). Kosongkan jika tidak diubah` : 'Tempel token'} />
          </Field>
          <Field id="vp" label="Project ID" hint="Vercel: buka project, Settings, General, bagian Project ID (prj_…).">
            <input id="vp" value={project} onChange={(e) => setProject(e.target.value)} placeholder="prj_xxxxxxxx" spellCheck={false} autoComplete="off" />
          </Field>
          <Field id="vm" label={<>Team ID <span className="px-hint-i">opsional</span></>} hint="Isi hanya kalau project ada di Team Vercel. Kalau akun pribadi, kosongkan.">
            <input id="vm" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="team_xxxxxxxx" spellCheck={false} autoComplete="off" />
          </Field>
          <div className="px-actions">
            <button className="px-btn" disabled={!!busy}>{busy === 'save' ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" className="px-btn g" disabled={!!busy} onClick={test}>{busy === 'test' ? 'Menguji…' : 'Tes koneksi'}</button>
            {d.token.from === 'admin' && <button type="button" className="px-btn g" disabled={!!busy} onClick={() => save(null, { clearToken: true })}>Hapus token tersimpan</button>}
            {msg && <span role="status" className={'px-msg' + (msg.err ? ' err' : '')}>{msg.t}</span>}
          </div>
        </form>
      </section>

      <section className="px-sec">
        <h2>Domain pengguna ({d.list.length})</h2>
        <p className="px-hint">&quot;Menunggu DNS&quot; berarti pengguna belum mengarahkan domainnya sesuai petunjuk di halaman Domain mereka.</p>
        {d.list.length === 0 ? <p className="px-empty">Belum ada yang memasang domain.</p> : (
          <div className="px-tw"><table>
            <thead><tr><th>Domain</th><th>Pengguna</th><th>Status</th></tr></thead>
            <tbody>{d.list.map((x) => (
              <tr key={x.custom_domain}><td>{x.custom_domain}</td><td>{x.username}</td><td>{x.domain_status === 'active' ? 'Aktif' : 'Menunggu DNS'}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </div>
  </>);
}
