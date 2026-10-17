// Ikon asli dari Font Awesome Free (lewat paket react-icons), warnanya ikut teks (currentColor).
// Ikon dipilih otomatis dari alamat link.
import {
  FaWhatsapp, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaXTwitter, FaGithub, FaLinkedin,
  FaTelegram, FaSpotify, FaEnvelope, FaBagShopping, FaLink, FaEllipsisVertical, FaRegCopy, FaXmark, FaHouse,
} from 'react-icons/fa6';
const ICONS = {
  whatsapp: FaWhatsapp, instagram: FaInstagram, youtube: FaYoutube, tiktok: FaTiktok, facebook: FaFacebook,
  x: FaXTwitter, github: FaGithub, linkedin: FaLinkedin, telegram: FaTelegram, spotify: FaSpotify,
  email: FaEnvelope, toko: FaBagShopping, link: FaLink,
  // Tiga titik vertikal (menu opsi per-tautan), ikon salin, dan tanda tutup (X biasa, bukan logo X).
  dots: FaEllipsisVertical, copy: FaRegCopy, close: FaXmark, home: FaHouse,
};
const RULES = [
  ['whatsapp', ['wa.me', 'whatsapp.com', 'api.whatsapp.com']],
  ['instagram', ['instagram.com', 'instagr.am']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['tiktok', ['tiktok.com']],
  ['facebook', ['facebook.com', 'fb.com', 'fb.me']],
  ['x', ['x.com', 'twitter.com']],
  ['github', ['github.com']],
  ['linkedin', ['linkedin.com']],
  ['telegram', ['t.me', 'telegram.me']],
  ['spotify', ['spotify.com']],
  ['toko', ['tokopedia.com', 'tokopedia.link', 'shopee.co.id', 'shopee.com', 'shp.ee', 'lazada.co.id', 'bukalapak.com', 'blibli.com']],
];
export function iconName(url = '') {
  const s = String(url).trim();
  if (/^mailto:/i.test(s)) return 'email';
  let h = '';
  try { h = new URL(/^https?:/i.test(s) ? s : 'https://' + s).hostname.replace(/^www\./, '').toLowerCase(); } catch { return 'link'; }
  for (const [name, hosts] of RULES) if (hosts.some((d) => h === d || h.endsWith('.' + d))) return name;
  return 'link';
}
export function LinkIcon({ url, size = 20 }) {
  const Ico = ICONS[iconName(url)] || ICONS.link;
  return <Ico className="lico" size={size} aria-hidden="true" focusable="false" />;
}
// Ikon berdasarkan nama (dipakai untuk ikon sosial media di header profil).
export function NamedIcon({ name, size = 20 }) {
  const Ico = ICONS[name] || ICONS.link;
  return <Ico className="lico" size={size} aria-hidden="true" focusable="false" />;
}
