import Link from 'next/link';
import '../fitur/fitur.css';

export const metadata = {
  title: 'Tentang Kami – isengin.site',
  description: 'Latar belakang, prinsip, dan kontak tim isengin.site.',
};

const NILAI = [
  {
    h: 'Kesederhanaan',
    p: 'Fungsi dasar dapat digunakan dalam hitungan menit, tanpa memerlukan keahlian teknis.',
    i: <path d="M4 20l16-16M4 12l8-8M4 20l8-8" />,
  },
  {
    h: 'Transparansi Harga',
    p: 'Paket Gratis tersedia tanpa batas waktu. Paket Pro hanya diperuntukkan bagi fitur tambahan, bukan syarat penggunaan dasar.',
    i: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.2a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01" /></>,
  },
  {
    h: 'Kepemilikan Data Penuh',
    p: 'Seluruh konten yang Anda unggah tetap menjadi hak Anda sepenuhnya, dengan opsi ekspor data kapan pun diperlukan.',
    i: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h6v6H9z" /></>,
  },
];

const KONTAK = [
  {
    h: 'Email',
    v: 'ekopurnomo1096@gmail.com',
    href: 'mailto:ekopurnomo1096@gmail.com',
    external: false,
    i: <path d="M3 5h18v14H3zM3 7l9 6 9-6" />,
  },
  {
    h: 'WhatsApp',
    v: '085868872566',
    href: 'https://wa.me/6285868872566',
    external: true,
    fill: true,
    i: <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.148-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />,
  },
  {
    h: 'Instagram',
    v: '@ekopnmo',
    href: 'https://instagram.com/ekopnmo',
    external: true,
    i: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  },
];

export default function TentangKami() {
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
          <h1>Satu platform tautan untuk <em>seluruh kebutuhan</em> Anda.</h1>
          <p className="ft-lead">isengin.site membantu individu dan pelaku usaha menampilkan seluruh tautan penting, mulai dari toko, konten, hingga kontak, dalam satu halaman yang profesional dan mudah dikelola.</p>
        </div>
        <div className="ft-wrap">
          <section aria-labelledby="cerita">
            <h2 id="cerita">Latar Belakang Kami</h2>
            <p className="ft-sub" style={{ maxWidth: '640px' }}>
              isengin.site dikembangkan untuk menjawab kebutuhan sederhana namun mendasar, yaitu menyatukan berbagai tautan penting, mulai dari media sosial, toko daring, portofolio, hingga kontak, dalam satu halaman yang terorganisir. Kami percaya setiap individu dan pelaku usaha berhak memiliki etalase digital yang mudah dikelola dan mencerminkan identitas mereka secara profesional.
            </p>
          </section>

          <section aria-labelledby="nilai">
            <h2 id="nilai">Nilai yang Kami Junjung</h2>
            <p className="ft-sub">Prinsip yang menjadi acuan dalam setiap pengembangan fitur.</p>
            <div className="ft-grid">
              {NILAI.map((n) => (
                <div className="ft-card" key={n.h}>
                  <div className="ft-ic" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{n.i}</svg>
                  </div>
                  <h3>{n.h}</h3>
                  <p>{n.p}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="kontak">
            <h2 id="kontak">Hubungi Kami</h2>
            <p className="ft-sub">Silakan pilih kanal berikut untuk pertanyaan, masukan, atau kerja sama.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
              {KONTAK.map((k) => (
                <a
                  key={k.h}
                  href={k.href}
                  target={k.external ? '_blank' : undefined}
                  rel={k.external ? 'noopener noreferrer' : undefined}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '14px' }}
                >
                  <div className="ft-ic" aria-hidden="true" style={{ marginBottom: 0, flex: 'none' }}>
                    {k.fill
                      ? <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">{k.i}</svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{k.i}</svg>}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Bungee, sans-serif', fontWeight: 400, fontSize: '1rem' }}>{k.h}</h3>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--mut)' }}>{k.v}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <div className="ft-final">
            <h2>Mulai Kelola Tautan Anda Hari Ini</h2>
            <Link className="ft-btn" href="/daftar">Daftar Sekarang</Link>
          </div>
        </div>
      </main>
      <footer className="ft-foot">
        <Link href="/fitur">Fitur</Link> · <Link href="/tentang-kami">Tentang Kami</Link> · <Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link><br />© 2026 isengin.site
      </footer>
    </div>
  );
}
