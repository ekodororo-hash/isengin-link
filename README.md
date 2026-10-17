# isengin.site link-in-bio

1. Neon: buat project, buka SQL Editor, jalankan isi `schema.sql`, salin connection string.
2. Vercel: import repo GitHub ini. Di Storage, buat **Blob** dan sambungkan ke project (token terisi otomatis).
3. Environment Variables di Vercel: `DATABASE_URL`, `AUTH_SECRET` (string acak panjang).
4. Deploy. Lalu Settings > Domains > tambahkan `isengin.site`, ikuti petunjuk DNS.

Lokal: salin `.env.example` ke `.env.local`, isi, lalu `npm install && npm run dev`.
