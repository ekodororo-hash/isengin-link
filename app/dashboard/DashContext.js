'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Shell from '../Shell';
import Loader from '../Loader';
import { SOCIALS } from '@/lib/socials';
import { COLOR_KEYS } from '@/lib/themes';
const Ctx = createContext(null);
export const useDash = () => useContext(Ctx);
const MENU = [['/dashboard', 'Ringkasan'], ['/dashboard/link', 'Link'], ['/dashboard/tampilan', 'Tampilan'], ['/dashboard/profil', 'Profil'], ['/dashboard/bagikan', 'Bagikan'], ['/dashboard/pengaturan', 'Pengaturan']];

// Bagian yang bisa diubah pengguna, dipisah per halaman dashboard supaya kelihatan halaman mana yang berubah.
const SECTIONS = [['link', 'Link'], ['profil', 'Profil'], ['tampilan', 'Tampilan']];
const parts = (x) => ({
  link: JSON.stringify(x.links.map((l) => [l.id || 0, l.title, l.url, l.thumb || '', l.hidden === true, l.price || '', l.old_price || '', l.label || ''])),
  profil: JSON.stringify([x.display_name || '', x.bio || '', x.photo_url || '', SOCIALS.map((k) => (x.socials?.[k.key] || '').trim())]),
  tampilan: JSON.stringify([x.theme, COLOR_KEYS.map((k) => x.colors?.[k] || ''), x.btn_style || 'bulat', x.font_key || 'standar']),
});

// Perkecil foto di peramban (maks 640px, JPEG) supaya unggahan kecil dan selalu lolos batas ukuran.
async function shrink(file, max = 640, square = false) {
  const bmp = await createImageBitmap(file);
  const c = document.createElement('canvas');
  if (square) {
    // potong persegi dari tengah gambar (untuk gambar kecil di link)
    const side = Math.min(bmp.width, bmp.height);
    c.width = c.height = Math.max(1, Math.round(side * Math.min(1, max / side)));
    c.getContext('2d').drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, c.width, c.height);
  } else {
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    c.width = Math.max(1, Math.round(bmp.width * s));
    c.height = Math.max(1, Math.round(bmp.height * s));
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  }
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.86));
  if (!blob) throw new Error('toBlob');
  return blob;
}

export function DashProvider({ children }) {
  const [m, setM] = useState(null);
  const [saved, setSaved] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const path = usePathname();
  const pm = m ? parts(m) : null, ps = saved ? parts(saved) : null;
  const changed = pm && ps ? SECTIONS.filter(([k]) => pm[k] !== ps[k]) : [];
  const dirty = changed.length > 0;
  useEffect(() => {
    fetch('/api/me').then((r) => (r.ok ? r.json() : (location.href = '/', null))).then((d) => { if (d) { setM(d); setSaved(d); } });
  }, []);
  useEffect(() => { setMsg(''); }, [path]);
  // Pindah menu terasa seperti memuat ulang halaman (perubahan yang belum disimpan dibuang, data diambil ulang),
  // tapi berjalan diam-diam di dalam tab: tidak ada animasi loading di tab dan tidak ada kedip putih.
  const savedRef = useRef(null);
  savedRef.current = saved;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (savedRef.current) setM(savedRef.current);
    fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) { setM(d); setSaved(d); } }).catch(() => {});
  }, [path]);
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
  // Pindahkan link dari posisi `from` ke `to` (dipakai seret dan lepas).
  const reorder = (from, to) => {
    if (from === to || from < 0 || to < 0 || to >= m.links.length) return;
    const a = [...m.links];
    a.splice(to, 0, a.splice(from, 1)[0]);
    set('links', a);
  };
  async function save() {
    if (busy) return;
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setM(d); setSaved(d); setMsg('Tersimpan.'); } else setMsg(d.error || 'Gagal menyimpan. Coba lagi.');
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
  // Unggah gambar kecil untuk satu link; link dicari lewat id/_k karena urutan bisa berubah saat mengunggah.
  async function upThumb(key, e) {
    const input = e.target;
    const f = input.files[0];
    input.value = '';
    if (!f) return;
    setMsg('Mengunggah gambar…');
    let blob;
    try { blob = await shrink(f, 320, true); } catch { setMsg('Format gambar tidak didukung. Pakai JPG atau PNG.'); return; }
    const fd = new FormData(); fd.append('file', blob, 'gambar.jpg'); fd.append('kind', 'thumb');
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setM((x) => ({ ...x, links: x.links.map((l) => ((l.id || l._k) === key ? { ...l, thumb: d.url } : l)) }));
        setMsg('Gambar terunggah. Klik Simpan agar tersimpan.');
      } else setMsg(d.error || 'Gambar gagal diunggah.');
    } catch { setMsg('Gambar gagal diunggah. Periksa koneksi.'); }
  }
  async function out() {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ mode: 'logout' }) });
    location.href = '/';
  }
  return (
    <Ctx.Provider value={{ m, set, setTheme, upThumb, setL, addLink, delLink, move, reorder, save, up, msg, busy, dirty }}>
      <Shell title="isengin.site" menu={MENU} out={out}>
        {children}
      </Shell>
    </Ctx.Provider>
  );
}
