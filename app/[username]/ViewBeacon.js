'use client';
import { useEffect } from 'react';

// Mencatat satu kunjungan setelah halaman terbuka di peramban. Server membatasi 1 per pengunjung per hari.
export default function ViewBeacon({ username }) {
  useEffect(() => {
    fetch('/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }), keepalive: true }).catch(() => {});
  }, [username]);
  return null;
}
