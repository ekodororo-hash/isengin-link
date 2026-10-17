// Link pintar: di HP, link ke aplikasi populer dibuka langsung di aplikasinya (bukan di browser dalam Instagram/TikTok).
// Android memakai intent:// dengan alamat cadangan (kalau aplikasi tidak ada, otomatis ke web).
// iOS memakai skema aplikasi untuk yang polanya jelas; sisanya tetap dialihkan biasa.
const seg = (u) => u.pathname.split('/').filter(Boolean);
const q = encodeURIComponent;

const iosYoutube = (u, h) => {
  if (h === 'youtu.be') { const id = seg(u)[0]; return id ? `youtube://www.youtube.com/watch?v=${q(id)}${u.search ? '&' + u.search.slice(1) : ''}` : null; }
  return `youtube://www.youtube.com${u.pathname}${u.search}`;
};
const iosInstagram = (u) => {
  const s = seg(u);
  if (s.length !== 1 || ['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct'].includes(s[0])) return null;
  return `instagram://user?username=${q(s[0])}`;
};
const iosWhatsapp = (u, h) => {
  if (h === 'wa.me') {
    const p = seg(u)[0];
    if (!/^\d{5,16}$/.test(p || '')) return null;
    const t = u.searchParams.get('text');
    return `whatsapp://send?phone=${p}${t ? '&text=' + q(t) : ''}`;
  }
  if (h === 'api.whatsapp.com' && u.pathname === '/send') return `whatsapp://send${u.search}`;
  return null;
};
const iosTelegram = (u) => {
  const s = seg(u);
  return s.length === 1 && /^[A-Za-z0-9_]{3,}$/.test(s[0]) ? `tg://resolve?domain=${s[0]}` : null;
};
const iosSpotify = (u, h) => {
  if (h !== 'open.spotify.com') return null;
  const s = seg(u);
  if (s[0] && s[0].startsWith('intl-')) s.shift();
  return s.length >= 2 && ['track', 'album', 'playlist', 'artist', 'show', 'episode'].includes(s[0]) && /^[A-Za-z0-9]{10,30}$/.test(s[1]) ? `spotify:${s[0]}:${s[1]}` : null;
};

const APPS = [
  { name: 'YouTube', pkg: 'com.google.android.youtube', hosts: ['youtube.com', 'youtu.be'], ios: iosYoutube },
  { name: 'Instagram', pkg: 'com.instagram.android', hosts: ['instagram.com'], ios: iosInstagram },
  { name: 'TikTok', pkg: 'com.zhiliaoapp.musically', hosts: ['tiktok.com'] },
  { name: 'Facebook', pkg: 'com.facebook.katana', hosts: ['facebook.com', 'fb.com', 'fb.watch'] },
  { name: 'X', pkg: 'com.twitter.android', hosts: ['x.com', 'twitter.com'] },
  { name: 'Threads', pkg: 'com.instagram.barcelona', hosts: ['threads.net'] },
  { name: 'WhatsApp', pkg: 'com.whatsapp', hosts: ['wa.me', 'whatsapp.com'], ios: iosWhatsapp },
  { name: 'Telegram', pkg: 'org.telegram.messenger', hosts: ['t.me', 'telegram.me'], ios: iosTelegram },
  { name: 'Spotify', pkg: 'com.spotify.music', hosts: ['open.spotify.com'], ios: iosSpotify },
  { name: 'Tokopedia', pkg: 'com.tokopedia.tkpd', hosts: ['tokopedia.com'] },
  { name: 'Shopee', pkg: 'com.shopee.id', hosts: ['shopee.co.id'] },
  { name: 'Lazada', pkg: 'com.lazada.android', hosts: ['lazada.co.id'] },
];

function androidIntent(u, pkg) {
  const rest = u.host + u.pathname + u.search;
  if (/[;#]/.test(rest)) return null;
  return `intent://${rest}#Intent;scheme=${u.protocol.slice(0, -1)};package=${pkg};S.browser_fallback_url=${q(u.href)};end`;
}

// Mengembalikan { app, deep } bila link ini sebaiknya dibuka di aplikasinya, selain itu null.
export function smartTarget(raw, ua) {
  const os = /android/i.test(ua || '') ? 'android' : /iphone|ipad|ipod/i.test(ua || '') ? 'ios' : null;
  if (!os) return null;
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const app = APPS.find((a) => a.hosts.some((h) => host === h || host.endsWith('.' + h)));
  if (!app) return null;
  const deep = os === 'android' ? androidIntent(u, app.pkg) : app.ios ? app.ios(u, host) : null;
  return deep ? { app: app.name, deep } : null;
}

const js = (s) => JSON.stringify(String(s)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Halaman perantara singkat: coba buka aplikasi, kalau gagal lanjut ke web setelah sekitar 1,6 detik.
export function smartHtml({ app, deep, web }) {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Membuka ${esc(app)}…</title>
<style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;text-align:center;background:#fff;color:#111}@media(prefers-color-scheme:dark){body{background:#111;color:#f2f2f2}}a{color:inherit;font-weight:700}p{margin:8px 20px}</style></head>
<body><main><p>Membuka <b>${esc(app)}</b>…</p><p><a id="w" href="${esc(web)}">Buka di browser saja</a></p></main>
<script>
var deep=${js(deep)},web=${js(web)},gone=false,t=setTimeout(function(){location.replace(web)},1600);
document.addEventListener('visibilitychange',function(){
  if(document.hidden){gone=true;clearTimeout(t)}
  else if(gone){if(history.length>1)history.back();else location.replace('/')}
});
window.addEventListener('pagehide',function(){clearTimeout(t)});
location.href=deep;
</script></body></html>`;
}
