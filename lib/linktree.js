// Membaca halaman publik Linktree (data JSON yang ditanam di HTML). Murni fungsi, tanpa akses jaringan.
// Mengembalikan { name, bio, links: [{ kind: 'link'|'header', title, url? }] } atau null kalau bentuk halamannya tidak dikenali.
export function parseLinktree(html) {
  const m = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(String(html || ''));
  if (!m) return null;
  let data;
  try { data = JSON.parse(m[1]); } catch { return null; }
  const pp = data?.props?.pageProps;
  if (!pp || typeof pp !== 'object') return null;
  const acc = pp.account || {};
  const out = [];
  const walk = (arr, depth) => {
    if (!Array.isArray(arr) || depth > 3) return;
    for (const l of arr) {
      if (!l || typeof l !== 'object' || l.locked) continue;
      const title = String(l.title || l.name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const url = typeof l.url === 'string' ? l.url.trim() : '';
      // Grup berisi link lain: jadi pembatas, lalu isinya.
      if (Array.isArray(l.links) && !url) {
        if (title) out.push({ kind: 'header', title });
        walk(l.links, depth + 1);
        continue;
      }
      if (title && /^https?:\/\//i.test(url)) out.push({ kind: 'link', title, url: url.slice(0, 500) });
    }
  };
  walk(pp.links, 0);
  return {
    name: String(acc.pageTitle || acc.username || '').slice(0, 40),
    bio: String(acc.description || '').slice(0, 160),
    links: out,
  };
}
