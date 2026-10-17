'use client';
import { createContext, useContext } from 'react';
// Data halaman diambil bersamaan dengan animasi memuat milik provider (dashboard/admin),
// jadi animasi memuat hanya tampil sekali, tidak lagi diikuti animasi kedua dari halamannya sendiri.
export const PRE = {
  '/admin/referral': ['/api/admin/referral'],
  '/admin/laporan': ['/api/admin/laporan'],
  '/dashboard/undang': ['/api/referral'],
  '/dashboard/paket': ['/api/billing'],
  '/dashboard/pengaturan': ['/api/account', '/api/verify'],
  '/dashboard/domain': ['/api/domain'],
};
export const needsPre = (path) => !!PRE[path];
export async function fetchPre(path) {
  const map = {};
  await Promise.all((PRE[path] || []).map(async (u) => {
    try { const r = await fetch(u); map[u] = { ok: r.ok, data: await r.json().catch(() => null) }; } catch { map[u] = { ok: false, data: null }; }
  }));
  return { path, map };
}
export const PreCtx = createContext(null);
// Hasil ambil-awal untuk satu alamat API, atau undefined kalau belum ada (halaman mengambil sendiri).
export const usePre = (url) => useContext(PreCtx)?.map?.[url];
