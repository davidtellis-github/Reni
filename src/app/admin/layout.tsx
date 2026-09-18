import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import { bodoniModa, dmSans } from "@/lib/fonts";
import { logout } from "@/app/actions";

export const metadata: Metadata = { title: "Studio", description: "Admin portal — not part of the public site." };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${bodoniModa.variable} ${dmSans.variable}`}>
      <body>
        <section className="admin wrap">
          <div className="bar"><h2>Studio</h2>{!process.env.ADMIN_PASSWORD && <span className="pill">ADMIN_PASSWORD is not set — the portal is open to anyone</span>}</div>
          <div className="adminnav"><Link href="/admin">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/settings">Settings</Link><span className="spacer" />
            {process.env.ADMIN_PASSWORD && <form action={logout}><button style={{ textDecoration: "underline" }}>Sign out</button></form>}</div>
          {children}
        </section>
      </body>
    </html>
  );
}
