// Ikon sosial media di header profil. Yang disimpan adalah teks yang diketik pengguna
// (username, nomor, atau link); alamat akhirnya dibuat oleh socialHref, baik saat
// menyimpan (validasi) maupun saat menampilkan.
export const SOCIALS = [
  { key: 'instagram', label: 'Instagram', ph: '@username', base: 'https://instagram.com/' },
  { key: 'whatsapp', label: 'WhatsApp', ph: '08123456789' },
  { key: 'tiktok', label: 'TikTok', ph: '@username', base: 'https://tiktok.com/@' },
  { key: 'youtube', label: 'YouTube', ph: '@namachannel', base: 'https://youtube.com/@' },
  { key: 'facebook', label: 'Facebook', ph: 'username atau link', base: 'https://facebook.com/' },
  { key: 'x', label: 'X (Twitter)', ph: '@username', base: 'https://x.com/' },
  { key: 'telegram', label: 'Telegram', ph: '@username', base: 'https://t.me/' },
  { key: 'email', label: 'Email', ph: 'nama@email.com' },
];

// Mengembalikan alamat https:// atau mailto: yang aman, atau null bila isiannya tidak valid.
export function socialHref(key, raw) {
  const s = SOCIALS.find((x) => x.key === key);
  const v = String(raw || '').trim().slice(0, 100);
  if (!s || !v) return null;
  if (key === 'email') {
    const e = v.replace(/^mailto:/i, '');
    return /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(e) ? 'mailto:' + e : null;
  }
  if (/^https?:\/\//i.test(v)) {
    try { return new URL(v).href; } catch { return null; }
  }
  if (key === 'whatsapp') {
    let d = v.replace(/\D/g, '');
    if (d.startsWith('0')) d = '62' + d.slice(1);
    return d.length >= 8 && d.length <= 15 ? 'https://wa.me/' + d : null;
  }
  const h = v.replace(/^@/, '');
  return /^[A-Za-z0-9._-]{1,50}$/.test(h) ? s.base + h : null;
}

export function parseSocials(raw) {
  let o = raw;
  if (typeof o === 'string') { try { o = o ? JSON.parse(o) : {}; } catch { o = {}; } }
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
}

// Hanya isian yang valid, urutannya tetap mengikuti daftar SOCIALS.
export function cleanSocials(raw) {
  const o = parseSocials(raw), out = {};
  for (const s of SOCIALS) {
    const v = String(o[s.key] ?? '').trim().slice(0, 100);
    if (v && socialHref(s.key, v)) out[s.key] = v;
  }
  return out;
}

export function socialList(raw) {
  const o = parseSocials(raw);
  return SOCIALS.map((s) => ({ key: s.key, label: s.label, href: socialHref(s.key, o[s.key]) })).filter((s) => s.href);
}
