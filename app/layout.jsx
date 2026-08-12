import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Mappa applicativa e dei requisiti",
  description: "Vista navigabile del parco applicativo, dei domini e dei requisiti condivisi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
