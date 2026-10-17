'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Shell from '../Shell';
import Loader from '../Loader';
import { SOCIALS } from '@/lib/socials';
import { COLOR_KEYS } from '@/lib/themes';
const Ctx = createContext(null);
export const useDash = () => useContext(Ctx);
const MENU = [['/dashboard', 'Ringkasan'], ['/dashboard/link', 'Link'], ['/dashboard/tampilan', 'Tampilan'], ['/dashboard/profil', 'Profil'], ['/dashboard/bagikan', 'Bagikan']];

// Hanya bagian yang bisa diubah pengguna; dipakai untuk tahu ada perubahan yang belum disimpan.
const snap = (x) => JSON.stringify({
  n: x.display_name || '', b: x.bio || '', t: x.theme, p: x.photo_url || '',
  l: x.links.map((l) => [l.id || 0, l.title, l.url]),
  s: SOCIALS.map((k) => (x.socials?.[k.key] || '').trim()),
  c: COLOR_KEYS.map((k) => x.colors?.[k] || ''),
});

// Perkecil foto di peramban (maks 640px, JPEG) supaya unggahan kecil dan selalu lolos batas ukuran.
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 640 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * s));
  c.height = Math.max(1, Math.round(bmp.height * s));
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.86));
  if (!blob) throw new Error('toBlob');
  return blob;
}

export function DashProvider({ children }) {
  const [m, setM] = useState(null);
  const [base, setBase] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const path = usePathname();
  const dirty = m ? snap(m) !== base : false;
  useEffect(() => {
    fetch('/api/me').then((r) => (r.ok ? r.json() : (location.href = '/', null))).then((d) => { if (d) { setM(d); setBase(snap(d)); } });
  }, []);
  useEffect(() => { setMsg(''); }, [path]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
  if (!m) return <Loader />;
  const set = (k, v) => { setMsg(''); setM({ ...m, [k]: v }); };
  // Memilih tema berarti mulai dari warna tema itu, jadi warna kustom dikosongkan.
  const setTheme = (key) => { setMsg(''); setM({ ...m, theme: key, colors: {} }); };
  const setL = (i, k, v) => set('links', m.links.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const addLink = () => set('links', [...m.links, { _k: Math.random().toString(36).slice(2), title: '', url: '' }]);
  const delLink = (i) => set('links', m.links.filter((_, j) => j !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= m.links.length) return;
    const a = [...m.links];
    [a[i], a[j]] = [a[j], a[i]];
    set('links', a);
  };
  async function save() {
    if (busy) return;
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setM(d); setBase(snap(d)); setMsg('Tersimpan.'); } else setMsg(d.error || 'Gagal menyimpan. Coba lagi.');
    } catch { setMsg('Gagal menyimpan. Periksa koneksi, lalu coba lagi.'); }
    setBusy(false);
  }
  async function up(e) {
    const input = e.target;
    const f = input.files[0];
    input.value = '';
    if (!f) return;
    setMsg('Mengunggah foto…');
    let blob;
    try { blob = await shrink(f); } catch { setMsg('Format foto tidak didukung. Pakai JPG atau PNG.'); return; }
    const fd = new FormData(); fd.append('file', blob, 'foto.jpg');
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setM((x) => ({ ...x, photo_url: d.url })); setMsg('Foto terunggah. Klik Simpan agar tersimpan.'); } else setMsg(d.error || 'Foto gagal diunggah.');
    } catch { setMsg('Foto gagal diunggah. Periksa koneksi.'); }
  }
  async function out() {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ mode: 'logout' }) });
    location.href = '/';
  }
  return (
    <Ctx.Provider value={{ m, set, setTheme, setL, addLink, delLink, move, save, up, msg, busy, dirty }}>
      <Shell title="isengin.site" menu={MENU} out={out}>
        {children}
        {dirty && (
          <div className="px-dirty" role="status">
            <span>Ada perubahan yang belum disimpan</span>
            <button className="px-btn" onClick={save} disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</button>
          </div>
        )}
      </Shell>
    </Ctx.Provider>
  );
}
