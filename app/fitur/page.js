import Link from 'next/link';
import './fitur.css';
import { PLANS } from '@/lib/plan';
import { loadSettings } from '@/lib/settings';
import { BONUS_DAYS } from '@/lib/referral';

export const metadata = {
  title: 'Fitur – isengin.site',
  description: 'Semua yang bisa kamu taruh di satu link: sosial media, katalog harga, link terkunci, statistik klik, kode QR, dan domain sendiri.',
};

// Harga Pro bisa diubah admin dan dibaca dari database, jadi halaman dibuat saat dibuka (seperti halaman lain yang membaca database).
export const dynamic = 'force-dynamic';

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' };

const FEATURES = [
  { h: 'Link dan sosial media', p: 'Tambah link, atur urutannya, dan tampilkan ikon sosial media di bawah profilmu.', i: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /> },
  { h: 'Katalog harga', p: 'Tampilkan harga, harga coret, dan label seperti habis atau promo untuk jualan online.', i: <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" /> },
  { h: 'Link terkunci', p: 'Lindungi link dengan sandi, atau beri penanda 18+ sebelum pengunjung membukanya.', i: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></> },
  { h: 'Tampilan sesukamu', p: 'Pilih tema, font, dan gaya tombol. Di Pro: warna kustom dan gambar latar.', i: <><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="10" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="15.5" cy="10" r="1" /><path d="M12 21a2.5 2.5 0 0 1 0-5h2a2 2 0 0 0 2-2" /></> },
  { h: 'Statistik klik', p: 'Lihat kunjungan dan klik tiap link. Riwayat harian 7 hari, 30 hari di Pro.', i: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { h: 'Kode QR', p: 'Unduh kode QR halamanmu untuk kartu nama, brosur, atau etalase tokomu.', i: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01" /></> },
  { h: 'Pindah dari tempat lain', p: 'Sudah punya halaman link di layanan lain? Impor, lalu rapikan di sini.', i: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" /> },
  { h: 'Lencana verifikasi', p: 'Akun resmi bisa mengajukan lencana verifikasi di samping nama. Pengajuan ditinjau manual.', i: <path d="M12 3l2.4 1.8 3-.1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3-.1L12 21l-2.4-1.8-3 .1-.9-2.9-2.4-1.8.9-2.9-.9-2.9 2.4-1.8.9-2.9 3 .1zM8.5 12l2.5 2.5 4.5-5" /> },
  { h: 'Domain sendiri', pro: true, p: 'Pakai domain sendiri seperti link.tokokamu.com, tanpa branding isengin.', i: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></> },
];

const ROWS = [
  ['Dasar'],
  ['Halaman, link, tema, dan statistik dasar', 'Ya', 'Ya'],
  ['Statistik harian per link', '7 hari', '30 hari'],
  ['Gambar di link', '3 gambar', 'Tanpa batas'],
  ['Tampilan'],
  ['Latar belakang gambar', 'Tidak', 'Ya'],
  ['Warna kustom', 'Tidak', 'Ya'],
  ['Tema selain Kobalt, Permen, Hutan', 'Tidak', 'Ya'],
  ['Pilihan font', '2 font', '5 font'],
  ['Pilihan gaya tombol', '2 gaya', '5 gaya'],
  ['Domain dan branding'],
  ['Domain kustom (mis. link.tokokamu.com)', 'Tidak', 'Ya'],
  ['Tanpa branding isengin', 'Tidak', 'Ya'],
];

const cell = (v) => (v === 'Ya' ? <span className="ft-tag">Ya</span> : v === 'Tidak' ? <span className="ft-no">Tidak</span> : v);

const FAQ = [
  ['Apakah benar-benar gratis?', 'Ya. Paket Gratis tidak ada batas waktu. Kamu hanya membayar kalau ingin fitur Pro.'],
  ['Perlu kartu kredit untuk daftar?', 'Tidak. Daftar cukup dengan nama pengguna dan sandi.'],
  ['Bisa pakai domain sendiri?', 'Bisa, di paket Pro. Kamu bisa memakai alamat seperti link.tokokamu.com.'],
  ['Kalau paket Pro habis, halamanku hilang?', 'Tidak. Halamanmu tetap ada dan kembali ke paket Gratis. Pilihan khusus Pro tidak ditampilkan sampai kamu memperpanjang.'],
  ['Apakah Pro diperpanjang otomatis?', 'Tidak. Perpanjangan ditambahkan setelah masa aktif yang tersisa, jadi tidak ada hari yang hilang.'],
];

export default async function Fitur() {
  await loadSettings();
  const harga = PLANS.bulanan.price.toLocaleString('id-ID');
  return (
    <div className="ft">
      <header className="ft-nav">
        <Link className="ft-brand" href="/">ISENGIN.SITE</Link>
        <nav className="ft-nbtn" aria-label="Akun">
          <Link className="ft-nb" href="/masuk">Masuk</Link>
          <Link className="ft-nb r" href="/daftar">Daftar</Link>
        </nav>
      </header>
      <main>
        <div className="ft-hero">
          <h1>Semua yang bisa kamu taruh di <em>satu link</em>.</h1>
          <p className="ft-lead">Kumpulkan WhatsApp, Instagram, toko online, dan video di satu halaman. Pasang di bio, bagikan lewat QR, dan lihat berapa kali tiap link diklik.</p>
          <div className="ft-cta">
            <Link className="ft-btn" href="/daftar">Daftar gratis</Link>
            <a className="ft-btn alt" href="#bandingkan">Bandingkan Gratis dan Pro</a>
          </div>
        </div>
        <div className="ft-wrap">
          <section aria-labelledby="f">
            <h2 id="f">Fitur</h2>
            <p className="ft-sub">Yang sudah ada, tanpa perlu pasang apa pun.</p>
            <div className="ft-grid">
              {FEATURES.map((f) => (
                <div className="ft-card" key={f.h}>
                  <div className="ft-ic"><svg {...svg}>{f.i}</svg></div>
                  <h3>{f.h}{f.pro && <span className="ft-pro">PRO</span>}</h3>
                  <p>{f.p}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="bandingkan" aria-labelledby="b">
            <h2 id="b">Gratis dan Pro</h2>
            <p className="ft-sub">Mulai gratis. Naik ke Pro kalau butuh lebih.</p>
            <div className="ft-tw">
              <table>
                <thead><tr><th>Fitur</th><th>Gratis</th><th>Pro</th></tr></thead>
                <tbody>
                  {ROWS.map((r) => (r.length === 1
                    ? <tr className="g" key={r[0]}><th colSpan={3}>{r[0]}</th></tr>
                    : <tr key={r[0]}><td>{r[0]}</td><td>{cell(r[1])}</td><td>{cell(r[2])}</td></tr>))}
                </tbody>
              </table>
            </div>
            <div className="ft-price"><b>Mulai Rp {harga} / bulan</b></div>
          </section>

          <section aria-labelledby="m">
            <h2 id="m">Mulai dalam 3 langkah</h2>
            <p className="ft-sub">Tidak sampai lima menit.</p>
            <div className="ft-steps">
              <div className="ft-step"><h3>Klaim nama</h3><p>Pilih alamat isengin.site/namamu, cukup dengan nama dan sandi.</p></div>
              <div className="ft-step"><h3>Isi link</h3><p>Tambah link, foto, dan bio. Pilih tema yang kamu suka.</p></div>
              <div className="ft-step"><h3>Bagikan</h3><p>Pasang di bio, kirim lewat WhatsApp, atau cetak kode QR-nya.</p></div>
            </div>
          </section>

          <section aria-label="Undang teman">
            <div className="ft-ref">
              <span><b>Ajak teman, dapat Pro gratis.</b><br />Kamu dan temanmu masing-masing dapat {BONUS_DAYS} hari Pro setelah halamannya berisi link.</span>
              <Link className="ft-btn" href="/daftar">Daftar dan dapatkan link undangan</Link>
            </div>
          </section>

          <section aria-labelledby="q">
            <h2 id="q">Pertanyaan umum</h2>
            <p className="ft-sub" />
            {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </section>

          <div className="ft-final">
            <h2>Siap punya satu link untuk semuanya?</h2>
            <Link className="ft-btn" href="/daftar">Daftar gratis</Link>
          </div>
        </div>
      </main>
      <footer className="ft-foot">
        <Link href="/fitur">Fitur</Link> · <Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link><br />© 2026 isengin.site
      </footer>
    </div>
  );
}
