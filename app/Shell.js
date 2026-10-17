'use client';
import './panel.css';
export default function Shell({ title, menu, page, go, out, children }) {
  return (
    <div className="px-app">
      <aside>
        <div className="px-brand">{title}</div>
        <nav aria-label="Menu">
          {menu.map(([k, v]) => <button key={k} aria-current={page === k ? 'page' : undefined} onClick={() => go(k)}>{v}</button>)}
        </nav>
        <button className="px-out" onClick={out}>Keluar</button>
      </aside>
      <main className="px-main">{children}</main>
    </div>
  );
}
