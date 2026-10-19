import Link from 'next/link';

// Bagian bawah halaman depan: fitur, untuk siapa, undangan, perbandingan paket, FAQ, ajakan akhir, dan footer.
const QR = "M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM11 0h1v1h-1zM13 0h1v1h-1zM14 0h1v1h-1zM16 0h1v1h-1zM18 0h1v1h-1zM19 0h1v1h-1zM20 0h1v1h-1zM21 0h1v1h-1zM22 0h1v1h-1zM23 0h1v1h-1zM24 0h1v1h-1zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h1v1h-1zM9 1h1v1h-1zM10 1h1v1h-1zM11 1h1v1h-1zM13 1h1v1h-1zM14 1h1v1h-1zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM6 2h1v1h-1zM9 2h1v1h-1zM11 2h1v1h-1zM13 2h1v1h-1zM14 2h1v1h-1zM15 2h1v1h-1zM16 2h1v1h-1zM18 2h1v1h-1zM20 2h1v1h-1zM21 2h1v1h-1zM22 2h1v1h-1zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM6 3h1v1h-1zM9 3h1v1h-1zM12 3h1v1h-1zM14 3h1v1h-1zM15 3h1v1h-1zM16 3h1v1h-1zM18 3h1v1h-1zM20 3h1v1h-1zM21 3h1v1h-1zM22 3h1v1h-1zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM6 4h1v1h-1zM9 4h1v1h-1zM10 4h1v1h-1zM12 4h1v1h-1zM13 4h1v1h-1zM16 4h1v1h-1zM18 4h1v1h-1zM20 4h1v1h-1zM21 4h1v1h-1zM22 4h1v1h-1zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM12 5h1v1h-1zM14 5h1v1h-1zM15 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h1v1h-1zM1 6h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM19 6h1v1h-1zM20 6h1v1h-1zM21 6h1v1h-1zM22 6h1v1h-1zM23 6h1v1h-1zM24 6h1v1h-1zM8 7h1v1h-1zM10 7h1v1h-1zM15 7h1v1h-1zM2 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM8 8h1v1h-1zM13 8h1v1h-1zM14 8h1v1h-1zM16 8h1v1h-1zM17 8h1v1h-1zM18 8h1v1h-1zM19 8h1v1h-1zM20 8h1v1h-1zM22 8h1v1h-1zM23 8h1v1h-1zM24 8h1v1h-1zM1 9h1v1h-1zM2 9h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM10 9h1v1h-1zM13 9h1v1h-1zM14 9h1v1h-1zM15 9h1v1h-1zM16 9h1v1h-1zM19 9h1v1h-1zM20 9h1v1h-1zM21 9h1v1h-1zM22 9h1v1h-1zM4 10h1v1h-1zM6 10h1v1h-1zM10 10h1v1h-1zM11 10h1v1h-1zM12 10h1v1h-1zM14 10h1v1h-1zM15 10h1v1h-1zM16 10h1v1h-1zM17 10h1v1h-1zM18 10h1v1h-1zM19 10h1v1h-1zM20 10h1v1h-1zM21 10h1v1h-1zM22 10h1v1h-1zM23 10h1v1h-1zM24 10h1v1h-1zM2 11h1v1h-1zM3 11h1v1h-1zM4 11h1v1h-1zM5 11h1v1h-1zM7 11h1v1h-1zM10 11h1v1h-1zM12 11h1v1h-1zM13 11h1v1h-1zM14 11h1v1h-1zM15 11h1v1h-1zM17 11h1v1h-1zM18 11h1v1h-1zM21 11h1v1h-1zM23 11h1v1h-1zM3 12h1v1h-1zM4 12h1v1h-1zM5 12h1v1h-1zM6 12h1v1h-1zM10 12h1v1h-1zM11 12h1v1h-1zM18 12h1v1h-1zM20 12h1v1h-1zM21 12h1v1h-1zM22 12h1v1h-1zM23 12h1v1h-1zM24 12h1v1h-1zM2 13h1v1h-1zM7 13h1v1h-1zM8 13h1v1h-1zM9 13h1v1h-1zM10 13h1v1h-1zM11 13h1v1h-1zM15 13h1v1h-1zM18 13h1v1h-1zM23 13h1v1h-1zM24 13h1v1h-1zM1 14h1v1h-1zM4 14h1v1h-1zM5 14h1v1h-1zM6 14h1v1h-1zM9 14h1v1h-1zM10 14h1v1h-1zM11 14h1v1h-1zM14 14h1v1h-1zM18 14h1v1h-1zM20 14h1v1h-1zM21 14h1v1h-1zM1 15h1v1h-1zM4 15h1v1h-1zM5 15h1v1h-1zM7 15h1v1h-1zM8 15h1v1h-1zM10 15h1v1h-1zM11 15h1v1h-1zM12 15h1v1h-1zM14 15h1v1h-1zM15 15h1v1h-1zM18 15h1v1h-1zM23 15h1v1h-1zM24 15h1v1h-1zM0 16h1v1h-1zM1 16h1v1h-1zM3 16h1v1h-1zM4 16h1v1h-1zM6 16h1v1h-1zM8 16h1v1h-1zM12 16h1v1h-1zM14 16h1v1h-1zM15 16h1v1h-1zM16 16h1v1h-1zM17 16h1v1h-1zM18 16h1v1h-1zM19 16h1v1h-1zM20 16h1v1h-1zM9 17h1v1h-1zM14 17h1v1h-1zM16 17h1v1h-1zM20 17h1v1h-1zM21 17h1v1h-1zM0 18h1v1h-1zM1 18h1v1h-1zM2 18h1v1h-1zM3 18h1v1h-1zM4 18h1v1h-1zM5 18h1v1h-1zM6 18h1v1h-1zM9 18h1v1h-1zM13 18h1v1h-1zM14 18h1v1h-1zM15 18h1v1h-1zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM21 18h1v1h-1zM22 18h1v1h-1zM23 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM10 19h1v1h-1zM13 19h1v1h-1zM16 19h1v1h-1zM20 19h1v1h-1zM21 19h1v1h-1zM23 19h1v1h-1zM0 20h1v1h-1zM2 20h1v1h-1zM3 20h1v1h-1zM4 20h1v1h-1zM6 20h1v1h-1zM10 20h1v1h-1zM11 20h1v1h-1zM13 20h1v1h-1zM14 20h1v1h-1zM15 20h1v1h-1zM16 20h1v1h-1zM17 20h1v1h-1zM18 20h1v1h-1zM19 20h1v1h-1zM20 20h1v1h-1zM22 20h1v1h-1zM24 20h1v1h-1zM0 21h1v1h-1zM2 21h1v1h-1zM3 21h1v1h-1zM4 21h1v1h-1zM6 21h1v1h-1zM8 21h1v1h-1zM9 21h1v1h-1zM12 21h1v1h-1zM16 21h1v1h-1zM17 21h1v1h-1zM18 21h1v1h-1zM20 21h1v1h-1zM21 21h1v1h-1zM22 21h1v1h-1zM0 22h1v1h-1zM2 22h1v1h-1zM3 22h1v1h-1zM4 22h1v1h-1zM6 22h1v1h-1zM8 22h1v1h-1zM9 22h1v1h-1zM13 22h1v1h-1zM14 22h1v1h-1zM16 22h1v1h-1zM17 22h1v1h-1zM21 22h1v1h-1zM23 22h1v1h-1zM0 23h1v1h-1zM6 23h1v1h-1zM8 23h1v1h-1zM9 23h1v1h-1zM12 23h1v1h-1zM13 23h1v1h-1zM15 23h1v1h-1zM16 23h1v1h-1zM17 23h1v1h-1zM18 23h1v1h-1zM19 23h1v1h-1zM20 23h1v1h-1zM21 23h1v1h-1zM23 23h1v1h-1zM0 24h1v1h-1zM1 24h1v1h-1zM2 24h1v1h-1zM3 24h1v1h-1zM4 24h1v1h-1zM5 24h1v1h-1zM6 24h1v1h-1zM8 24h1v1h-1zM9 24h1v1h-1zM10 24h1v1h-1zM11 24h1v1h-1zM12 24h1v1h-1zM15 24h1v1h-1zM16 24h1v1h-1zM18 24h1v1h-1zM20 24h1v1h-1zM23 24h1v1h-1z";

export default function Bawah() {
  return (
    <div className="lx">
      <section className="lx-s lx-band2">
        <div className="lx-w">
          <h2>Semua yang kamu butuhkan</h2>
          <p className="lx-sub">Sederhana untuk pemula, cukup lengkap untuk jualan.</p>
          <div className="lx-g4">
            <div className="lx-card">
              <div className="lx-mini" aria-hidden="true">
                {[20, 40, 25, 60, 45, 90].map((h, i) => <i key={i} style={{ height: h + '%' }} />)}
              </div>
              <h3>Lihat siapa yang klik</h3>
              <p>Jumlah klik, kunjungan, dan asal klik tiap link.</p>
            </div>
            <div className="lx-card">
              <div className="lx-sw" aria-hidden="true">
                {['#2b3cff', '#ff5a43', '#1f8a4c', '#ffd23f'].map((c) => <i key={c} style={{ background: c }} />)}
              </div>
              <h3>Tampilan sesukamu</h3>
              <p>Pilih tema, font, dan gaya tombol sampai pas dengan gayamu.</p>
            </div>
            <div className="lx-card">
              <div className="lx-pr" aria-hidden="true">
                <div className="lx-pt"><span>Preset Lightroom</span><em>Habis</em></div>
                <div className="lx-pp"><s>Rp150.000</s><b>Rp99.000</b></div>
              </div>
              <h3>Cocok buat jualan</h3>
              <p>Tampilkan harga, harga coret, dan label stok langsung di link.</p>
            </div>
            <div className="lx-card">
              <div className="lx-qr" aria-hidden="true">
                <svg viewBox="0 0 25 25" shapeRendering="crispEdges"><path fill="#1f2255" d={QR} /></svg>
              </div>
              <h3>Bagikan gampang</h3>
              <p>QR dan link pendek siap dicetak di kemasan, brosur, atau kartu nama.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lx-s">
        <div className="lx-w">
          <h2>Cocok untuk siapa saja</h2>
          <p className="lx-sub">Siapa pun yang punya lebih dari satu link untuk dibagikan.</p>
          <div className="lx-g3">
            <div className="lx-card"><span className="lx-tag">Penjual online</span><h3>Satu link, semua toko</h3><p>Taruh WhatsApp, Tokopedia, Shopee, dan katalog di satu halaman.</p></div>
            <div className="lx-card"><span className="lx-tag">Kreator</span><h3>Semua konten terkumpul</h3><p>YouTube, Instagram, dan video terbaru langsung ketemu dari bio.</p></div>
            <div className="lx-card"><span className="lx-tag">Jasa &amp; fotografer</span><h3>Portofolio dan pesan</h3><p>Tampilkan karya, lalu arahkan calon klien ke tombol pesan.</p></div>
          </div>
        </div>
      </section>

      <section className="lx-s lx-bonwrap">
        <div className="lx-w">
          <div className="lx-bon"><span className="lx-tag">Undang teman</span><p>Ajak teman daftar lewat link undanganmu, kalian berdua dapat bonus Pro.</p></div>
        </div>
      </section>

      <section className="lx-s lx-band2">
        <div className="lx-w">
          <h2>Gratis atau Pro</h2>
          <p className="lx-sub">Mulai gratis. Naik ke Pro kalau butuh domain sendiri dan tampilan tanpa branding isengin.</p>
          <div className="lx-tw">
            <table>
              <thead><tr><th>Fitur</th><th>Gratis</th><th>Pro</th></tr></thead>
              <tbody>
                <tr className="g"><th colSpan={3}>Dasar</th></tr>
                <tr><td>Halaman, link, tema, dan statistik dasar</td><td><span className="ya">Ya</span></td><td><span className="ya">Ya</span></td></tr>
                <tr><td>Statistik harian per link</td><td>7 hari</td><td>30 hari</td></tr>
                <tr><td>Gambar di link</td><td>3 gambar</td><td>Tanpa batas</td></tr>
                <tr className="g"><th colSpan={3}>Tampilan</th></tr>
                <tr><td>Latar belakang gambar</td><td className="no">Tidak</td><td><span className="ya">Ya</span></td></tr>
                <tr><td>Warna kustom</td><td className="no">Tidak</td><td><span className="ya">Ya</span></td></tr>
                <tr><td>Tema selain Kobalt, Permen, Hutan</td><td className="no">Tidak</td><td><span className="ya">Ya</span></td></tr>
                <tr><td>Pilihan font</td><td>2 font</td><td>5 font</td></tr>
                <tr><td>Pilihan gaya tombol</td><td>2 gaya</td><td>5 gaya</td></tr>
                <tr className="g"><th colSpan={3}>Domain dan branding</th></tr>
                <tr><td>Domain kustom (mis. link.tokokamu.com)</td><td className="no">Tidak</td><td><span className="ya">Ya</span></td></tr>
                <tr><td>Tanpa branding isengin (tulisan “Dibuat di isengin.site”, tombol logo, dan popup ajakan daftar)</td><td className="no">Tidak</td><td><span className="ya">Ya</span></td></tr>
              </tbody>
            </table>
          </div>
          <div className="lx-cta"><Link className="lx-btn" href="/daftar">Mulai gratis</Link></div>
        </div>
      </section>

      <section className="lx-s">
        <div className="lx-w">
          <h2>Pertanyaan umum</h2>
          <p className="lx-sub">Yang paling sering ditanyakan sebelum daftar.</p>
          <details open><summary>Apa benar gratis?</summary><p>Ya. Paket Gratis sudah cukup untuk membuat halaman, menambah link, dan melihat statistik dasar. Pro hanya untuk fitur tambahan.</p></details>
          <details><summary>Apa yang terjadi kalau Pro-ku habis?</summary><p>Halamanmu di isengin.site tetap aktif dengan tampilan Gratis. Domain sendiri berhenti berfungsi sampai kamu memperpanjang, lalu hidup lagi tanpa setup ulang.</p></details>
          <details><summary>Bisa pakai domain sendiri?</summary><p>Bisa, di paket Pro. Kamu cukup mengarahkan domain milikmu, dan halamanmu tampil di alamat itu.</p></details>
          <details><summary>Bisa ganti nama alamat nanti?</summary><p>Alamat dipilih saat daftar. Pilih nama yang mudah diingat dan sesuai dengan toko atau akunmu.</p></details>
          <details><summary>Apa bedanya dengan link bio lain?</summary><p>Fokusnya sederhana: cepat dibuat, bisa dipakai untuk jualan lengkap dengan harga dan label, dan bisa memakai domain sendiri.</p></details>
        </div>
      </section>

      <section className="lx-s lx-band lx-end">
        <div className="lx-w">
          <h2>Siap punya satu link?</h2>
          <p className="lx-sub" style={{ marginInline: 'auto' }}>Ambil namamu sekarang sebelum keduluan.</p>
          <Link className="lx-btn" href="/daftar">Klaim nama</Link>
        </div>
      </section>

      <footer className="lx-foot">
        <div className="lx-w"><Link href="/fitur">Fitur</Link> · <Link href="/tentang-kami">Tentang Kami</Link> · <Link href="/privasi">Kebijakan Privasi</Link> · <Link href="/syarat">Syarat Layanan</Link><br />© 2026 isengin.site</div>
      </footer>
    </div>
  );
}
