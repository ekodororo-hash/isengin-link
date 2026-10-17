'use client';
import { useState } from 'react';
import { LinkIcon, NamedIcon } from '../icons';
import ShareLink from './ShareLink';

// Satu baris tautan di halaman publik: area klik utama (buka tautan) + tombol titik tiga
// yang membuka modal "Bagikan tautan". Keduanya elemen bersebelahan (bukan bersarang)
// supaya tombol tidak ikut ter-klik saat yang ditekan adalah tautannya, atau sebaliknya.
export default function LinkRow({ title, url, th, cat, soldout, labelKey, labelDisplay, price, old, feat, guard, href, pageUsername, pageName }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'plink' + (th ? ' has-th' : '') + (cat ? ' cat' : '') + (soldout ? ' soldout' : '') + (feat ? ' feat' : '')}>
      <a className="plink-main" href={href} rel="noopener noreferrer" target={/^mailto:/i.test(url || '') ? undefined : '_blank'}>
        {th ? <img className="pth" src={th} alt="" width="48" height="48" loading="lazy" /> : <LinkIcon url={url} />}
        <span className="pt">
          {title}
          {(price || old) && <span className="pp">{old && <s>{old}</s>}{price && <b>{price}</b>}</span>}
        </span>
        {labelKey ? <span className={'pbd ' + labelKey}>{labelDisplay}</span> : <span className="psp" aria-hidden="true" />}
      </a>
      {(feat || guard) && (
        <span className="pind">
          {feat && <svg className="pstar" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Link sorotan"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg>}
          {guard === 'pass' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Link dikunci dengan sandi"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}
          {guard === 'adult' && <span className="p18" title="Konten dewasa (18+)">18+</span>}
        </span>
      )}
      <button type="button" className="plink-dots" aria-label={`Opsi untuk tautan ${title}`} onClick={() => setOpen(true)}>
        <NamedIcon name="dots" size={18} />
      </button>
      {open && (
        <ShareLink title={title} url={url} path={href} pageUsername={pageUsername} pageName={pageName} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
