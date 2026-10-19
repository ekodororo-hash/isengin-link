// Centang hijau seragam untuk status "berhasil/terverifikasi" di panel (email, verifikasi akun, undangan teman).
export default function OkMark({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      style={{ color: 'var(--navy)', verticalAlign: '-3px', flex: 'none', ...style }}>
      <circle cx="10" cy="10" r="8.4" fill="#b8f06a" />
      <path d="M6.2 10.4l2.5 2.5 5.1-5.3" />
    </svg>
  );
}
