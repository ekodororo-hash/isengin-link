'use client';
import { useState } from 'react';
import { EMBED_NAMES } from '@/lib/embed';

// Embed video/musik di halaman publik. YouTube dan TikTok (berat) tampil sebagai sampul dulu dan baru dimuat
// saat ditekan; Spotify dan SoundCloud (ringan) langsung dimuat malas (lazy) saat mendekati layar.
export default function EmbedBox({ provider, src, height, ratio, facade, thumb, title }) {
  const [on, setOn] = useState(!facade);
  const name = EMBED_NAMES[provider] || 'Embed';
  const url = on && facade ? src + (src.includes('?') ? '&' : '?') + 'autoplay=1' : src;
  return (
    <div className={'pemb ' + provider} style={ratio ? { aspectRatio: ratio } : { height }}>
      {on ? (
        <iframe src={url} title={title || name} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <button type="button" className="pemb-go" onClick={() => setOn(true)} aria-label={`Putar ${title || 'video'} dari ${name}`}>
          {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
          <span className="pemb-play" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg></span>
          <span className="pemb-nm">{title || name}</span>
        </button>
      )}
    </div>
  );
}
