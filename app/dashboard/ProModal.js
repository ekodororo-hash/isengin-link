'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { THEMES } from '@/lib/themes';
import { PRO_THEMES } from '@/lib/pro';

// Satu modal untuk semua fitur Pro. Kerangkanya sama (ikon, judul, teks, kotak pratinjau, dua tombol);
// yang berganti hanya judul, teks, dan isi kotak pratinjau sesuai fitur yang diklik pengguna Gratis.
// Pakai: const [pm, setPm] = useState(null); ... setPm('gambar') ... <ProModal fitur={pm} info={{...}} onClose={() => setPm(null)} />
// Menambah fitur baru: tambahkan satu entri di FITUR di bawah ini.
const S = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };
const Lock = () => (<svg {...S} strokeWidth="2.6"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>);
const BAR7 = [30, 55, 40, 70, 50, 85, 60];
const BAR8 = [45, 65, 35, 75, 55, 80, 40, 60];

const FITUR = {
  gambar: {
    judul: (i) => ((i.used ?? 0) >= (i.limit || 3) ? 'Batas gambar tercapai' : 'Gambar tanpa batas'),
    teks: (i) => `Paket Gratis memuat sampai ${i.limit || 3} gambar di link. Pro tanpa batas.`,
    kedua: 'Kelola gambar',
    isi: (i) => {
      const lim = i.limit || 3, used = Math.min(i.used ?? lim, lim);
      return (<>
        <div className="pm-thumbs" style={{ gridTemplateColumns: `repeat(${lim + 1}, 1fr)` }} aria-hidden="true">
          {Array.from({ length: lim }, (_, n) => <i key={n} className={'c' + (n % 3)} />)}<i className="add">+</i>
        </div>
        <div className="pm-mt"><span>Gambar terpakai</span><span>{used} / {lim}</span></div>
        <div className="pm-meter" role="img" aria-label={`${used} dari ${lim} gambar terpakai`}><i style={{ width: (used / lim) * 100 + '%' }} /></div>
      </>);
    },
  },
  stat: {
    judul: 'Buka statistik lengkap',
    teks: () => 'Paket Gratis melihat 7 dan 30 hari. Pro menambah 90 hari, semua data, dan pilih tanggal sendiri.',
    kedua: 'Tetap 30 hari',
    isi: () => (<>
      <div className="pm-bars" aria-hidden="true">
        {BAR7.map((h, n) => <i key={n} style={{ height: h + '%' }} />)}
        {BAR8.map((h, n) => <i key={'o' + n} className="off" style={{ height: h + '%' }} />)}
      </div>
      <div className="pm-leg"><span>7 dan 30 hari (Gratis)</span><span>Lebih lama (Pro)</span></div>
    </>),
  },
  tema: {
    judul: 'Suka tema ini?',
    teks: () => 'Tema selain Kobalt, Permen, Hutan, dan Neo khusus Pro. Kamu masih bisa mencobanya di pratinjau.',
    kedua: 'Lanjut mencoba',
    isi: () => (
      <div className="pm-sws" aria-hidden="true">
        {THEMES.filter((t) => PRO_THEMES.includes(t.key)).slice(0, 4).map((t) => (
          <div key={t.key} className="pm-sw" style={{ background: t.bg, color: t.ink }}>
            <b className="pm-lk"><Lock /></b><i style={{ background: t.btn }} /><i style={{ background: t.btn }} /><i style={{ background: t.accent }} /><span>{t.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  warna: {
    judul: 'Atur warna sesukamu',
    teks: () => 'Warna kustom baru tampil di halamanmu setelah Pro aktif. Kamu masih bisa mencobanya di pratinjau.',
    kedua: 'Lanjut mencoba',
    isi: () => (
      <div className="pm-cols" aria-hidden="true">
        {[['#ffd23f', 'Latar'], ['#ff5a43', 'Aksen'], ['#2b3cff', 'Tombol link']].map(([c, n]) => (
          <div key={n} className="pm-col"><b style={{ background: c }} /><span>{n}</span><b className="pm-lk"><Lock /></b></div>
        ))}
      </div>
    ),
  },
  font: {
    judul: 'Lebih banyak font dan gaya',
    teks: () => 'Gratis dapat 2 font dan 2 gaya tombol. Pro dapat 5 font dan 5 gaya. Kamu masih bisa mencobanya di pratinjau.',
    kedua: 'Lanjut mencoba',
    isi: () => (
      <div className="pm-fonts" aria-hidden="true">
        <div className="pm-fo">Aa</div><div className="pm-fo">Aa</div>
        <div className="pm-fo l" style={{ fontFamily: 'Georgia, serif' }}>Aa<b className="pm-lk"><Lock /></b></div>
        <div className="pm-fo l" style={{ fontFamily: 'monospace' }}>Aa<b className="pm-lk"><Lock /></b></div>
        <div className="pm-fo l" style={{ fontFamily: 'Bungee, sans-serif', fontSize: '1rem' }}>Aa<b className="pm-lk"><Lock /></b></div>
      </div>
    ),
  },
  latar: {
    judul: 'Gambar sebagai latar',
    teks: () => 'Pasang foto atau gambar sebagai latar halamanmu. Kamu masih bisa mencobanya di pratinjau.',
    kedua: 'Lanjut mencoba',
    isi: () => (
      <div className="pm-bg" aria-hidden="true"><b className="pm-lk"><Lock /></b><i /><i /><i /></div>
    ),
  },
  domain: {
    judul: 'Pakai domain sendiri',
    teks: () => 'Arahkan domainmu ke halaman isengin, jadi alamatnya terlihat profesional.',
    kedua: 'Nanti saja',
    isi: () => (<>
      <div className="pm-dom old"><span>isengin.site/kamu</span></div>
      <div className="pm-arr" aria-hidden="true">↓</div>
      <div className="pm-dom"><b className="pm-lk"><Lock /></b><span>link.tokokamu.com</span></div>
    </>),
  },
};

export default function ProModal({ fitur, info = {}, onClose }) {
  const router = useRouter();
  const ref = useRef(null);
  const F = fitur ? FITUR[fitur] : null;

  useEffect(() => {
    if (!F) return;
    const prev = document.activeElement, ovf = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('.pm-pb')?.focus();
    const key = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = [...ref.current.querySelectorAll('button')];
      if (!f.length) return;
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ovf; prev?.focus?.(); };
  }, [F]);

  if (!F || typeof document === 'undefined') return null;
  const go = () => { onClose(); router.push('/dashboard/paket'); };
  return createPortal(
    <div className="pm-ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pm-md" ref={ref} role="dialog" aria-modal="true" aria-labelledby="pm-t">
        <button className="pm-x" onClick={onClose} aria-label="Tutup">✕</button>
        <div className="pm-ic"><Lock /></div>
        <h3 id="pm-t">{typeof F.judul === 'function' ? F.judul(info) : F.judul}</h3>
        <p className="pm-t">{F.teks(info)}</p>
        <div className="pm-slot">{F.isi(info)}</div>
        <div className="pm-btns">
          <button className="pm-pb" onClick={go}>Aktifkan Pro</button>
          <button className="pm-sb" onClick={onClose}>{F.kedua}</button>
        </div>
        <p className="pm-fine">Pembayaran lewat Midtrans. Paket tidak diperpanjang otomatis.</p>
      </div>
    </div>,
    document.body
  );
}
