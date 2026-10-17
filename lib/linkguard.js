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
const RADIUS = { bulat: '16px', pil: '999px', kotak: '4px', garis: '14px', timbul: '10px' };
const DEF = { bg: '#ffffff', ink: '#111111', btn: '#f1f1f6', accent: '#2b3cff', style: 'bulat', font: 'system-ui,sans-serif' };
const hex = (c, d) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : d);
// Halaman perantara sebelum link dibuka, memakai warna, font, dan bentuk tombol milik pemilik halaman.
// `action` = alamat /go/<id> (dengan ?s=), `error` = pesan salah sandi, `look` = { bg, ink, btn, accent, style, font }.
export function guardHtml({ kind, action, error = '', back = '/', look = DEF }) {
  const bg = hex(look.bg, DEF.bg), ink = hex(look.ink, DEF.ink), btn = hex(look.btn, DEF.btn), ac = hex(look.accent, DEF.accent);
  const st = RADIUS[look.style] ? look.style : 'bulat', r = RADIUS[st];
  const font = /^[\w\s,"'-]+$/.test(look.font || '') ? look.font : DEF.font;
  const edge = st === 'garis' ? `border:2px solid ${ink};` : st === 'timbul' ? `border:2px solid ${ink};box-shadow:4px 4px 0 ${ink};` : '';
  const body = kind === 'pass'
    ? `<h1>Link ini dikunci</h1><p>Masukkan sandi dari pemilik halaman untuk membukanya.</p>
       <form method="post" action="${esc(action)}"><input type="password" name="pass" maxlength="${PASS_MAX}" autocomplete="off" autofocus required aria-label="Sandi">
       ${error ? `<p class="e" role="alert">${esc(error)}</p>` : ''}<button type="submit">Buka link</button></form>
       <a class="b" href="${esc(back)}">Kembali</a>`
    : `<h1>Peringatan konten</h1><p>Link ini ditandai pemiliknya berisi konten dewasa (18+). Lanjutkan hanya jika kamu sudah berusia 18 tahun ke atas.</p>
       <a class="go" href="${esc(action + (action.includes('?') ? '&' : '?') + 'ok=1')}">Saya 18+, lanjutkan</a>
       <a class="b" href="${esc(back)}">Kembali</a>`;
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Bungee&family=Plus+Jakarta+Sans:wght@400;600;800&family=Playfair+Display:wght@600;800&family=Space+Mono:wght@400;700&display=swap"><title>${kind === 'pass' ? 'Link dikunci' : 'Peringatan konten'}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:${bg};color:${ink};font-family:${font}}
main{background:${btn};color:${ink};border-radius:${st === 'pil' ? '28px' : r};${edge}padding:28px 24px;width:min(92vw,380px);text-align:center;${edge ? '' : 'box-shadow:0 8px 30px rgba(0,0,0,.15)'}}
h1{font-size:1.25rem;margin:0 0 8px}p{margin:0 0 16px;line-height:1.5;opacity:.85}
input{width:100%;box-sizing:border-box;padding:12px;border:2px solid ${ink};border-radius:${st === 'pil' ? '999px' : r};background:${bg};color:${ink};font:inherit;margin-bottom:12px}
button,.go{display:block;width:100%;box-sizing:border-box;padding:12px;border:0;border-radius:${st === 'pil' ? '999px' : r};background:${ac};color:${bg};font:inherit;font-weight:700;text-decoration:none;cursor:pointer;margin-bottom:10px;text-align:center}
input:focus-visible,button:focus-visible,.go:focus-visible{outline:3px solid ${ac};outline-offset:2px}
.b{display:inline-block;color:inherit;opacity:.75;font-size:.9rem}.e{color:inherit;font-weight:700;margin:0 0 12px;opacity:1}</style></head><body><main>${body}</main></body></html>`;
}
