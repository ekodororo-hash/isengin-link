import './globals.css';
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://isengin.site'),
  title: 'isengin.site – satu link untuk semua kontenmu',
  description: 'Kumpulkan WhatsApp, Instagram, toko online, dan video di satu halaman, lalu lihat berapa kali tiap link diklik.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Bungee&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
