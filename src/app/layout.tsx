import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { CartProvider } from "@/components/CartProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.brand, description: s.tagline || `${s.brand} — hand-crocheted pieces, made one at a time.` };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Nav brand={settings.brand} />
          {children}
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
