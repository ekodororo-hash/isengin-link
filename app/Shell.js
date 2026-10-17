'use client';
import './panel.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Shell({ title, menu, out, children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);
  return (
    <div className="px-app">
      <aside>
        <div className="px-brand">{title}</div>
        <button className="px-burger" aria-label="Menu" aria-expanded={open} aria-controls="px-menu" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <div id="px-menu" className="px-menu" data-open={open}>
          <nav aria-label="Menu">
            {menu.map(([href, label]) => (
              <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>
            ))}
          </nav>
          <button className="px-out" onClick={out}>Keluar</button>
        </div>
      </aside>
      <main className="px-main">{children}</main>
    </div>
  );
}
