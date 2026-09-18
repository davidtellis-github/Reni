import type { Metadata } from "next";
import "../globals.css";
import { getSettings } from "@/lib/data";
import { bodoniModa, dmSans } from "@/lib/fonts";
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
    <html lang="en" data-theme="light" className={`${bodoniModa.variable} ${dmSans.variable}`}>
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
