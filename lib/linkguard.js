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
// Halaman perantara sebelum link dibuka, bergaya situs isengin.site (kuning, krem, biru tua, garis tebal).
// `action` = alamat /go/<id> (dengan ?s=), `error` = pesan salah sandi.
export function guardHtml({ kind, action, error = '', back = '/' }) {
  const body = kind === 'pass'
    ? `<h1>Link ini dikunci</h1><p>Masukkan sandi dari pemilik halaman untuk membukanya.</p>
       <form method="post" action="${esc(action)}"><input type="password" name="pass" maxlength="${PASS_MAX}" autocomplete="off" autofocus required aria-label="Sandi" placeholder="Sandi">
       ${error ? `<p class="e" role="alert">${esc(error)}</p>` : ''}<button type="submit">Buka link</button></form>
       <a class="b" href="${esc(back)}">Kembali</a>`
    : `<h1>Peringatan konten</h1><p>Link ini ditandai pemiliknya berisi konten dewasa (18+). Lanjutkan hanya jika kamu sudah berusia 18 tahun ke atas.</p>
       <a class="go" href="${esc(action + (action.includes('?') ? '&' : '?') + 'ok=1')}">Saya 18+, lanjutkan</a>
       <a class="b" href="${esc(back)}">Kembali</a>`;
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap"><title>${kind === 'pass' ? 'Link dikunci' : 'Peringatan konten'}</title>
<style>:root{--navy:#1f2255;--yel:#ffd23f;--red:#ff5a43;--cream:#fffbe8}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--yel);color:var(--navy);font-family:"Plus Jakarta Sans",system-ui,sans-serif}
main{background:var(--cream);border:3px solid var(--navy);border-radius:22px;box-shadow:6px 6px 0 var(--navy);padding:28px 24px;width:min(92vw,380px);text-align:center}
h1{font-family:Bungee,system-ui,sans-serif;font-weight:400;text-transform:uppercase;font-size:1.3rem;line-height:1.15;margin:0 0 10px}
p{margin:0 0 16px;line-height:1.5;font-weight:600}
input{width:100%;box-sizing:border-box;padding:12px 14px;border:3px solid var(--navy);border-radius:14px;background:#fff;color:var(--navy);font:inherit;font-weight:600;margin-bottom:12px}
button,.go{display:block;width:100%;box-sizing:border-box;padding:12px;border:3px solid var(--navy);border-radius:999px;box-shadow:4px 4px 0 var(--navy);background:var(--red);color:#fff;font:inherit;font-weight:800;text-decoration:none;cursor:pointer;margin:0 0 14px;text-align:center}
button:active,.go:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--navy)}
input:focus-visible,button:focus-visible,.go:focus-visible{outline:3px solid var(--navy);outline-offset:3px}
.b{display:inline-block;color:var(--navy);font-weight:700;font-size:.9rem}.e{color:#a00018;font-weight:800;margin:0 0 12px}</style></head><body><main>${body}</main></body></html>`;
}
