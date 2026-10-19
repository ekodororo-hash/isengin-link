// Jenis item di halaman: link biasa, pembatas, embed video/musik, dan QRIS.
export const KINDS = ['link', 'header', 'embed', 'qris'];
export const kindOf = (k) => (KINDS.includes(k) ? k : 'link');

// Embed video/musik. Hanya penyedia yang dikenal, dan alamat iframe dibuat di sini dari ID yang sudah
// divalidasi, jadi pengguna tidak bisa menyisipkan alamat sembarang ke halaman publik.
export const EMBED_NAMES = { youtube: 'YouTube', spotify: 'Spotify', soundcloud: 'SoundCloud', tiktok: 'TikTok' };

// Mengembalikan { provider, src, ratio | height, facade, thumb } atau null bila alamatnya tidak didukung.
// facade = true: tampil sampul dulu, iframe (berat) baru dimuat setelah pengunjung menekan putar.
export function embedOf(raw) {
  let x;
  const t = String(raw || '').trim();
  try { x = new URL(/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : 'https://' + t); } catch { return null; } // tanpa skema dianggap https, sama seperti saat disimpan
  if (x.protocol !== 'https:' && x.protocol !== 'http:') return null;
  if (x.username || x.password) return null;
  const h = x.hostname.toLowerCase().replace(/^(www|m|music)\./, '');
  const seg = x.pathname.split('/').filter(Boolean);

  if (h === 'youtube.com' || h === 'youtube-nocookie.com' || h === 'youtu.be') {
    let id = '', list = '';
    if (h === 'youtu.be') id = seg[0] || '';
    else if (seg[0] === 'watch') id = x.searchParams.get('v') || '';
    else if (['shorts', 'embed', 'live'].includes(seg[0])) id = seg[1] || '';
    else if (seg[0] === 'playlist') list = x.searchParams.get('list') || '';
    if (/^[\w-]{11}$/.test(id)) return { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}`, ratio: '16 / 9', facade: true, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
    if (/^[\w-]{10,60}$/.test(list)) return { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`, ratio: '16 / 9', facade: true, thumb: '' };
    return null;
  }

  if (h === 'open.spotify.com') {
    const s = seg[0] && /^intl-[a-z]{2}(-[a-z]{2,4})?$/i.test(seg[0]) ? seg.slice(1) : seg;
    const [type, id] = s;
    if (['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(type) && /^[A-Za-z0-9]{22}$/.test(id || ''))
      return { provider: 'spotify', src: `https://open.spotify.com/embed/${type}/${id}`, height: type === 'track' || type === 'episode' ? 152 : 352, facade: false };
    return null;
  }

  if (h === 'soundcloud.com') {
    if (seg.length >= 2 && seg.length <= 4 && seg.every((p) => /^[\w.-]{1,100}$/.test(p)))
      return { provider: 'soundcloud', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent('https://soundcloud.com/' + seg.join('/'))}&hide_related=true&show_comments=false&show_teaser=false&visual=false`, height: 166, facade: false };
    return null;
  }

  if (h === 'tiktok.com') {
    const i = seg.indexOf('video');
    const id = i > 0 && seg[0].startsWith('@') ? seg[i + 1] : '';
    if (/^\d{8,25}$/.test(id || '')) return { provider: 'tiktok', src: `https://www.tiktok.com/embed/v2/${id}`, height: 740, facade: true, thumb: '' };
    return null;
  }
  return null;
}
