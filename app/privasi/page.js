import '../landing.css';

export const metadata = {
  title: 'Kebijakan Privasi – isengin.site',
  description: 'Bagaimana isengin.site mengumpulkan, memakai, dan melindungi data pengguna.',
};

const SECTIONS = [
  {
    h: '1. Data yang kami kumpulkan',
    p: [
      'Saat mendaftar, kami menyimpan nama pengguna, kata sandi (dalam bentuk terenkripsi), dan email bila kamu memberikannya.',
      'Saat kamu mengatur halaman publikmu, kami menyimpan konten yang kamu masukkan sendiri: bio, foto profil, daftar tautan, harga produk, serta pengaturan tema dan domain kustom.',
      'Saat pengunjung membuka halamanmu atau mengklik sebuah tautan, kami mencatat jumlah kunjungan dan klik secara agregat untuk fitur statistik. Kami tidak mengumpulkan data pribadi pengunjung di luar yang diperlukan untuk menghitung angka ini (misalnya alamat IP disimpan singkat untuk mencegah penghitungan klik ganda/bot).',
      'Jika kamu berlangganan paket Pro, data transaksi pembayaran diproses oleh mitra pembayaran kami (Midtrans) dan hanya status serta riwayat transaksi yang kami simpan di sistem kami.',
    ],
  },
  {
    h: '2. Bagaimana data digunakan',
    p: [
      'Menjalankan dan menampilkan halamanmu di isengin.site/namamu atau di domain kustommu.',
      'Menghitung statistik kunjungan dan klik yang ditampilkan di dasbormu.',
      'Memproses pembayaran paket Pro dan mengirim pemberitahuan terkait akun (misalnya status langganan).',
      'Mencegah penyalahgunaan, spam, dan aktivitas yang melanggar Syarat Layanan.',
    ],
  },
  {
    h: '3. Berbagi data dengan pihak ketiga',
    p: [
      'Kami tidak menjual data pribadi pengguna kepada pihak mana pun.',
      'Data hanya dibagikan kepada penyedia layanan yang kami pakai untuk menjalankan isengin.site, seperti penyedia basis data/hosting dan mitra pembayaran, sebatas yang diperlukan agar layanan berjalan.',
      'Konten yang kamu pilih untuk tampilkan secara publik di halamanmu (nama, bio, foto, tautan) dapat dilihat oleh siapa saja yang mengunjungi halaman tersebut, karena sifatnya memang halaman publik.',
    ],
  },
  {
    h: '4. Penyimpanan dan keamanan',
    p: [
      'Kata sandi disimpan dalam bentuk ter-hash, bukan teks biasa, sehingga kami sendiri tidak dapat membacanya.',
      'Kami berupaya menjaga keamanan data dengan praktik standar industri, namun tidak ada sistem yang bisa dijamin 100% aman. Gunakan kata sandi yang kuat dan jangan membagikannya ke siapa pun.',
      'Data disimpan selama akunmu masih aktif, dan akan dihapus dalam waktu wajar setelah kamu menghapus akun.',
    ],
  },
  {
    h: '5. Cookie dan penyimpanan lokal',
    p: [
      'Kami menggunakan cookie atau penyimpanan lokal peramban untuk menjaga sesi login tetap berjalan, mengingat kode undangan (referral) yang kamu gunakan saat mendaftar, dan mencegah penghitungan klik ganda pada statistik.',
      'Kami tidak menggunakan cookie untuk melacak aktivitasmu di situs lain di luar isengin.site.',
    ],
  },
  {
    h: '6. Hak pengguna',
    p: [
      'Kamu dapat mengubah atau menghapus konten halamanmu kapan saja lewat dasbor.',
      'Kamu dapat meminta penghapusan akun dan seluruh data terkait dengan menghubungi kami melalui kontak di bawah; permintaan akan diproses dalam waktu wajar.',
      'Kamu berhak meminta salinan data pribadi yang kami simpan tentang akunmu.',
    ],
  },
  {
    h: '7. Anak di bawah umur',
    p: ['Layanan ini tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak secara sengaja mengumpulkan data dari anak di bawah usia tersebut.'],
  },
  {
    h: '8. Perubahan kebijakan',
    p: ['Kebijakan ini dapat diperbarui dari waktu ke waktu. Perubahan signifikan akan diinformasikan melalui halaman ini atau pemberitahuan di situs.'],
  },
  {
    h: '9. Kontak',
    p: ['Pertanyaan seputar privasi dapat disampaikan melalui halaman profil tim kami atau kontak yang tertera di situs isengin.site.'],
  },
];

export default function Privasi() {
  return (
    <main className="legal-wrap">
      <p className="legal-date">Berlaku mulai Oktober 2026</p>
      <h1>Kebijakan Privasi</h1>
      <p className="legal-lead">
        Privasimu penting bagi kami. Halaman ini menjelaskan data apa saja yang isengin.site kumpulkan, untuk apa data itu dipakai, dan hak yang kamu miliki atas datamu.
      </p>
      <div className="legal-box">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>
        ))}
      </div>
      <p className="legal-foot">
        Lihat juga <a href="/syarat">Syarat Layanan</a> kami. · <a href="/fitur">Fitur</a> · <a href="/">Kembali ke beranda</a>
      </p>
    </main>
  );
}
