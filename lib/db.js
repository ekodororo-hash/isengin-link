import { neon } from '@neondatabase/serverless';
// no-store: jangan biarkan Next.js menyimpan hasil query. Tanpa ini, data lama
// (mis. akun yang sempat dinonaktifkan) bisa tersaji terus setelah diubah.
export const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: 'no-store' } });
