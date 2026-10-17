'use client';
import { useState } from 'react';
import { LinkIcon, NamedIcon } from '../icons';
import ShareLink from './ShareLink';

// Satu baris tautan di halaman publik: area klik utama (buka tautan) + tombol titik tiga
// yang membuka modal "Bagikan tautan". Keduanya elemen bersebelahan (bukan bersarang)
// supaya tombol tidak ikut ter-klik saat yang ditekan adalah tautannya, atau sebaliknya.
export default function LinkRow({ title, url, th, cat, soldout, labelKey, labelDisplay, price, old, href, pageUsername, pageName }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'plink' + (th ? ' has-th' : '') + (cat ? ' cat' : '') + (soldout ? ' soldout' : '')}>
      <a className="plink-main" href={href} rel="noopener noreferrer" target={/^mailto:/i.test(url || '') ? undefined : '_blank'}>
        {th ? <img className="pth" src={th} alt="" width="48" height="48" loading="lazy" /> : <LinkIcon url={url} />}
        <span className="pt">
          {title}
          {(price || old) && <span className="pp">{old && <s>{old}</s>}{price && <b>{price}</b>}</span>}
        </span>
        {labelKey ? <span className={'pbd ' + labelKey}>{labelDisplay}</span> : <span className="psp" aria-hidden="true" />}
      </a>
      <button type="button" className="plink-dots" aria-label={`Opsi untuk tautan ${title}`} onClick={() => setOpen(true)}>
        <NamedIcon name="dots" size={18} />
      </button>
      {open && (
        <ShareLink title={title} url={url} path={href} pageUsername={pageUsername} pageName={pageName} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
