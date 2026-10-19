// Kirim email lewat Resend (REST API, tanpa paket tambahan).
// Env: RESEND_API_KEY, MAIL_FROM (mis. "isengin <noreply@isengin.site>"), MAIL_REPLY_TO (opsional).
export async function sendMail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.error('RESEND_API_KEY belum diisi, email tidak terkirim.'); return false; }
  try {
    const body = { from: process.env.MAIL_FROM || 'isengin <noreply@isengin.site>', to: [to], subject, html, text };
    if (process.env.MAIL_REPLY_TO) body.reply_to = process.env.MAIL_REPLY_TO;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', cache: 'no-store',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) { console.error('Resend menolak email:', r.status, (await r.text().catch(() => '')).slice(0, 300)); return false; }
    return true;
  } catch (e) {
    console.error('Email gagal dikirim:', e.message);
    return false;
  }
}

const COPY = {
  verify: { subject: 'Kode verifikasi email isengin.site', title: 'Verifikasi email', lead: 'Masukkan kode ini di Pengaturan untuk memastikan email ini milikmu.' },
  reset: { subject: 'Kode reset sandi isengin.site', title: 'Reset sandi', lead: 'Masukkan kode ini di halaman Lupa sandi untuk membuat sandi baru.' },
};

// Isi email berisi kode 6 angka. `code` selalu angka, jadi aman disisipkan ke HTML.
export function codeMail(code, purpose, ttlMin = 10) {
  const c = COPY[purpose];
  const text = `${c.title}\n\n${c.lead}\n\nKode: ${code}\n\nBerlaku ${ttlMin} menit. Jangan bagikan kode ini ke siapa pun. Kalau bukan kamu yang meminta, abaikan saja email ini.\n\nisengin.site`;
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fffbe8;padding:24px">
  <div style="max-width:420px;margin:0 auto;background:#fff;border:3px solid #1f2255;border-radius:16px;padding:24px;color:#1f2255">
    <p style="margin:0 0 4px;font-weight:800;letter-spacing:.04em">ISENGIN.SITE</p>
    <h1 style="margin:0 0 12px;font-size:20px">${c.title}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5">${c.lead}</p>
    <p style="margin:0 0 16px;text-align:center;font-size:34px;font-weight:800;letter-spacing:.3em;background:#ffd23f;border:3px solid #1f2255;border-radius:12px;padding:12px 0">${code}</p>
    <p style="margin:0;font-size:13px;line-height:1.5;opacity:.8">Berlaku ${ttlMin} menit. Jangan bagikan kode ini ke siapa pun. Kalau bukan kamu yang meminta, abaikan saja email ini.</p>
  </div>
</div>`;
  return { subject: c.subject, html, text };
}
