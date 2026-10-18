import './globals.css';
import Script from 'next/script';
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Bungee&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;800&family=Space+Mono:wght@400;700&display=swap" />
      </head>
      <body>
        {children}
        <Script src="https://chat.emahairshop.com/widget.js" data-bot="isengin" strategy="afterInteractive" />
      </body>
    </html>
  );
}
