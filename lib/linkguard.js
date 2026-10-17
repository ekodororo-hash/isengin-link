// Pengaman link: peringatan konten dewasa (guard = 'adult') atau sandi (guard = 'pass').
// Sandi disimpan hanya sebagai hash scrypt berbumbu ("garam:hash"), tidak pernah dikirim balik ke klien.
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
export const GUARDS = ['adult', 'pass'];
export const cleanGuard = (g) => (GUARDS.includes(g) ? g : '');
export const PASS_MIN = 4, PASS_MAX = 64;
export function hashPass(p) {
  const salt = randomBytes(16);
  return salt.toString('hex') + ':' + scryptSync(String(p), salt, 32).toString('hex');
}
export function checkPass(p, stored) {
  try {
    const [s, h] = String(stored || '').split(':');
    if (!s || !h) return false;
    const a = scryptSync(String(p), Buffer.from(s, 'hex'), 32), b = Buffer.from(h, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Halaman perantara sebelum link dibuka. `action` = alamat /go/<id> (dengan ?s=), `error` = pesan salah sandi.
export function guardHtml({ kind, action, error = '', back = '/' }) {
  const body = kind === 'pass'
    ? `<h1>Link ini dikunci</h1><p>Masukkan sandi dari pemilik halaman untuk membukanya.</p>
       <form method="post" action="${esc(action)}"><input type="password" name="pass" maxlength="${PASS_MAX}" autocomplete="off" autofocus required aria-label="Sandi">
       ${error ? `<p class="e" role="alert">${esc(error)}</p>` : ''}<button type="submit">Buka link</button></form>
       <a class="b" href="${esc(back)}">Kembali</a>`
    : `<h1>Peringatan konten</h1><p>Link ini ditandai pemiliknya berisi konten dewasa (18+). Lanjutkan hanya jika kamu sudah berusia 18 tahun ke atas.</p>
       <a class="go" href="${esc(action + (action.includes('?') ? '&' : '?') + 'ok=1')}">Saya 18+, lanjutkan</a>
       <a class="b" href="${esc(back)}">Kembali</a>`;
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${kind === 'pass' ? 'Link dikunci' : 'Peringatan konten'}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f4f8;font-family:system-ui,sans-serif;color:#111}
main{background:#fff;border-radius:18px;padding:28px 24px;width:min(92vw,380px);text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.12)}
h1{font-size:1.25rem;margin:0 0 8px}p{margin:0 0 16px;line-height:1.5;color:#444}
input{width:100%;box-sizing:border-box;padding:12px;border:2px solid #d5d5e0;border-radius:12px;font:inherit;margin-bottom:12px}
button,.go{display:block;width:100%;box-sizing:border-box;padding:12px;border:0;border-radius:12px;background:#2b3cff;color:#fff;font:inherit;font-weight:700;text-decoration:none;cursor:pointer;margin-bottom:10px}
.b{display:inline-block;color:#555;font-size:.9rem}.e{color:#c4001d;font-weight:600;margin:0 0 12px}</style></head><body><main>${body}</main></body></html>`;
}
