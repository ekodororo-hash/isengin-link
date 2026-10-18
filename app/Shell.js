'use client';
import './panel.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Shell({ title, menu, out, reload = false, children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  // reload: menu berupa tautan biasa yang memuat ulang halaman (dipakai admin); tanpa itu, pindah menu tidak memuat ulang tab.
  const Item = reload ? 'a' : Link;
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open]);
  return (
    <div className="px-app">
      <header className="px-top">
        <div className="px-brand">{title}</div>
        <button className="px-burger" aria-label="Buka menu" aria-expanded={open} aria-controls="px-side" onClick={() => setOpen(true)}>
          <span /><span /><span />
        </button>
      </header>
      <div className="px-scrim" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="px-side" data-open={open}>
        <div className="px-side-head">
          <div className="px-brand">{title}</div>
          <button className="px-close" aria-label="Tutup menu" onClick={() => setOpen(false)}>✕</button>
        </div>
        <nav aria-label="Menu">
          {menu.map(([href, label, badge]) => (
            <Item key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}{badge && <i className="px-badge" role="img" aria-label="ada hadiah siap diklaim" />}</Item>
          ))}
        </nav>
        <button className="px-out" onClick={out}>Keluar</button>
      </aside>
      <main className="px-main">{children}</main>
    </div>
  );
}
