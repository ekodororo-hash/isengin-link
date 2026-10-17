// Centang verifikasi di samping nama. Warna mengikuti aksen halaman (lihat .vb di globals.css).
export default function Verified({ size = 20 }) {
  return (
    <svg className="vb" width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Terverifikasi">
      <title>Terverifikasi</title>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7.8 12.4l3 3 5.6-6" fill="none" stroke="var(--pbg,#fff)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
