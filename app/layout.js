import './globals.css';
export const metadata = { title: 'isengin.site – satu link untuk semua kontenmu' };
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
