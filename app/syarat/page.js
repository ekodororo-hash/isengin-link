export const metadata = {
  title: 'Syarat Layanan – isengin.site',
  description: 'Syarat dan ketentuan penggunaan layanan isengin.site.',
};

const SECTIONS = [
  {
    h: '1. Tentang layanan',
    p: [
      'isengin.site adalah layanan "satu link untuk semua konten" yang memungkinkan kamu membuat halaman publik berisi kumpulan tautan (WhatsApp, Instagram, toko, video, dan lainnya) di satu alamat singkat.',
      'Dengan membuat akun atau menggunakan layanan ini, kamu dianggap telah membaca dan menyetujui Syarat Layanan ini beserta Kebijakan Privasi kami.',
    ],
  },
  {
    h: '2. Pendaftaran akun',
    p: [
      'Kamu wajib memberikan informasi yang akurat saat mendaftar dan bertanggung jawab menjaga kerahasiaan kata sandi akunmu.',
      'Nama pengguna (username) diberikan dengan prinsip siapa cepat dia dapat, selama tidak melanggar aturan pada pasal 4. Kami berhak menonaktifkan nama pengguna yang melanggar aturan tersebut.',
      'Kamu bertanggung jawab atas seluruh aktivitas yang terjadi melalui akunmu.',
    ],
  },
  {
    h: '3. Konten pengguna',
    p: [
      'Seluruh konten yang kamu unggah atau masukkan (teks, tautan, gambar, nama produk, dan sejenisnya) adalah tanggung jawabmu sepenuhnya.',
      'Dengan mengunggah konten, kamu menjamin bahwa kamu memiliki hak atas konten tersebut atau izin untuk menggunakannya, dan memberi kami izin terbatas untuk menampilkan konten tersebut di halaman publikmu sebagai bagian dari layanan.',
      'Kami tidak secara aktif meninjau setiap konten sebelum ditayangkan, namun berhak menghapus konten atau menonaktifkan akun yang melanggar pasal 4 bila ditemukan atau dilaporkan.',
    ],
  },
  {
    h: '4. Penggunaan yang dilarang',
    p: [
      'Dilarang menggunakan layanan untuk konten yang melanggar hukum, termasuk namun tidak terbatas pada: penipuan, perjudian ilegal, konten dewasa, ujaran kebencian, kekerasan, atau pelanggaran hak cipta/merek dagang pihak lain.',
      'Dilarang menyamar sebagai orang atau entitas lain (impersonasi) tanpa izin, atau menggunakan nama pengguna yang menyesatkan.',
      'Dilarang menyalahgunakan sistem, termasuk mencoba meretas, membebani server secara berlebihan, mengakali sistem klik/statistik, atau membuat akun secara massal untuk menyalahgunakan program referral.',
      'Pelanggaran dapat berakibat penangguhan atau penghapusan akun tanpa pemberitahuan sebelumnya.',
    ],
  },
  {
    h: '5. Paket Pro dan pembayaran',
    p: [
      'isengin.site menyediakan paket gratis dan paket Pro berbayar dengan fitur tambahan. Rincian fitur dan harga ditampilkan di dasbor saat kamu memilih paket.',
      'Pembayaran diproses melalui mitra pembayaran pihak ketiga. Kami tidak menyimpan data kartu/metode pembayaranmu secara langsung.',
      'Kecuali dinyatakan lain saat pembelian, biaya langganan tidak dapat dikembalikan (non-refundable) setelah pembayaran berhasil, kecuali diwajibkan oleh hukum yang berlaku.',
      'Kami berhak mengubah harga atau fitur paket Pro di kemudian hari, dengan pemberitahuan wajar sebelum perubahan berlaku bagi pelanggan yang sedang aktif.',
    ],
  },
  {
    h: '6. Domain kustom',
    p: [
      'Jika kamu menghubungkan domain milikmu sendiri ke halaman isengin.site, kamu bertanggung jawab penuh atas kepemilikan dan biaya domain tersebut di penyedia domain masing-masing.',
      'Kami tidak bertanggung jawab atas gangguan yang berasal dari penyedia domain atau DNS pihak ketiga.',
    ],
  },
  {
    h: '7. Ketersediaan layanan',
    p: [
      'Kami berupaya menjaga layanan tetap berjalan dengan baik, namun tidak menjamin layanan akan selalu bebas gangguan, bebas kesalahan, atau tersedia tanpa henti.',
      'Kami dapat melakukan pemeliharaan, pembaruan, atau perubahan fitur dari waktu ke waktu yang dapat memengaruhi tampilan atau fungsi layanan.',
    ],
  },
  {
    h: '8. Batasan tanggung jawab',
    p: [
      'Layanan disediakan "sebagaimana adanya". Sejauh diizinkan oleh hukum yang berlaku, kami tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, atau kehilangan pendapatan yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan ini.',
      'Kami tidak bertanggung jawab atas transaksi, produk, atau janji apa pun antara kamu dengan pengunjung halamanmu melalui tautan yang kamu cantumkan.',
    ],
  },
  {
    h: '9. Penghentian akun',
    p: [
      'Kamu dapat berhenti menggunakan layanan dan meminta penghapusan akun kapan saja.',
      'Kami berhak menangguhkan atau menghapus akun yang melanggar Syarat Layanan ini, termasuk tanpa pemberitahuan sebelumnya untuk pelanggaran yang serius.',
    ],
  },
  {
    h: '10. Perubahan syarat',
    p: ['Syarat Layanan ini dapat diperbarui sewaktu-waktu. Versi terbaru akan selalu tersedia di halaman ini, dan penggunaan layanan setelah perubahan berarti kamu menyetujui syarat yang diperbarui.'],
  },
  {
    h: '11. Hukum yang berlaku',
    p: ['Syarat Layanan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.'],
  },
];

export default function Syarat() {
  return (
    <main className="page">
      <p className="small" style={{ margin: '0 0 8px' }}>Berlaku mulai Oktober 2026</p>
      <h1 style={{ fontSize: 'clamp(1.8rem,6vw,2.6rem)' }}>Syarat Layanan</h1>
      <p className="lead">
        Dengan menggunakan isengin.site, kamu menyetujui syarat dan ketentuan berikut. Mohon dibaca dengan saksama.
      </p>
      <div className="box" style={{ gap: 22 }}>
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 8px' }}>{s.h}</h2>
            {s.p.map((line, i) => (
              <p key={i} style={{ margin: '0 0 8px', color: '#333' }}>{line}</p>
            ))}
          </section>
        ))}
      </div>
      <p className="small" style={{ marginTop: 20 }}>
        Lihat juga <a href="/privasi" style={{ color: 'inherit' }}>Kebijakan Privasi</a> kami. · <a href="/" style={{ color: 'inherit' }}>Kembali ke beranda</a>
      </p>
    </main>
  );
}
