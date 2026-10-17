// Pemeriksaan alamat link supaya halaman pengguna tidak dipakai untuk menipu (phishing) atau menyerang.
// Dipakai saat link disimpan (/api/me) dan saat impor (/api/import).
const OK_PROTO = ['http:', 'https:', 'mailto:'];
// Domain terlarang tambahan, diisi lewat env BLOCKED_DOMAINS (pisahkan dengan koma), mis. "bad.example,evil.test".
const BAD = (process.env.BLOCKED_DOMAINS || '').split(',').map((s) => s.trim().toLowerCase().replace(/^www\./, '')).filter(Boolean);

// Mengembalikan teks masalah, atau '' kalau alamatnya aman dipakai.
export function urlProblem(u) {
  let x;
  try { x = new URL(String(u)); } catch { return 'Alamatnya tidak valid.'; }
  if (!OK_PROTO.includes(x.protocol)) return 'Hanya alamat http, https, atau mailto yang boleh dipakai.';
  if (x.protocol === 'mailto:') return '';
  if (x.username || x.password) return 'Alamat tidak boleh memuat nama pengguna atau sandi (trik yang sering dipakai penipu).';
  const h = x.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
  if (!h.includes('.') || /\.(local|localhost|internal|lan)$/.test(h)) return 'Alamatnya tidak valid.';
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.startsWith('[')) return 'Alamat IP langsung tidak diizinkan, pakai nama domain.';
  if (BAD.some((d) => h === d || h.endsWith('.' + d))) return 'Domain ini diblokir.';
  return '';
}

// Opsional: Google Safe Browsing. Aktif hanya bila env SAFE_BROWSING_KEY diisi. Kalau layanannya gagal atau lambat,
// link tetap diterima (tidak boleh membuat simpan gagal gara-gara pihak luar).
export async function flaggedUrls(urls) {
  const key = process.env.SAFE_BROWSING_KEY;
  const list = [...new Set(urls)].slice(0, 100);
  if (!key || !list.length) return [];
  try {
    const r = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'isengin-site', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: list.map((url) => ({ url })),
        },
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return [...new Set((d.matches || []).map((m) => m.threat?.url).filter(Boolean))];
  } catch (e) {
    console.error('Safe Browsing gagal, link tetap diterima:', e.message);
    return [];
  }
}
