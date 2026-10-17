import { ImageResponse } from 'next/og';
import { sql } from '@/lib/db';
import { themeWith, bgStyle } from '@/lib/themes';
export const alt = 'Halaman link isengin.site';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Pembuat gambar tidak bisa membaca webp/heic, jadi foto hanya dipakai bila PNG/JPEG/GIF.
async function photoOk(url) {
  if (!url) return false;
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return /^image\/(png|jpe?g|gif)/.test(r.headers.get('content-type') || '');
  } catch { return false; }
}

export default async function Image({ params }) {
  const u = (await sql`select id,username,display_name,bio,theme,photo_url,active from users where username=${String(params.username).toLowerCase()}`)[0];
  const extra = u ? (await sql`select colors from users where id=${u.id}`.catch(() => []))[0] : null;
  const t = themeWith(u?.theme, extra?.colors);
  const more = u ? (await sql`select bg from users where id=${u.id}`.catch(() => []))[0] : null;
  // Gradasi ikut tampil di preview; gambar latar tidak (cukup warna tema).
  const pageBg = (u && u.active !== false && bgStyle(more?.bg, u.theme, extra?.colors).background) || t.bg;
  const name = u && u.active !== false ? u.display_name || u.username : 'isengin.site';
  const bio = u && u.active !== false && u.bio ? (u.bio.length > 110 ? u.bio.slice(0, 107) + '…' : u.bio) : 'Satu link untuk semua kontenmu.';
  const showPhoto = u && u.active !== false && (await photoOk(u.photo_url));
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: pageBg, color: t.ink, padding: 60 }}>
        {showPhoto ? (
          <img src={u.photo_url} width={200} height={200} style={{ borderRadius: 100, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 200, height: 200, borderRadius: 100, background: t.accent, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 700 }}>
            {name[0].toUpperCase()}
          </div>
        )}
        <div style={{ display: 'flex', marginTop: 30, fontSize: 72, fontWeight: 700 }}>{name}</div>
        <div style={{ display: 'flex', marginTop: 12, fontSize: 34, opacity: 0.8, textAlign: 'center', maxWidth: 940, justifyContent: 'center' }}>{bio}</div>
        <div style={{ display: 'flex', marginTop: 40, padding: '10px 28px', borderRadius: 999, background: t.accent, color: t.bg, fontSize: 30, fontWeight: 700 }}>
          {`isengin.site/${u?.username || ''}`}
        </div>
      </div>
    ),
    size
  );
}
