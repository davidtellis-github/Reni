import Link from "next/link";
import { logout } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (<section className="admin wrap">
    <div className="bar"><h2>Studio</h2>{!process.env.ADMIN_PASSWORD && <span className="pill">ADMIN_PASSWORD is not set — the portal is open to anyone</span>}</div>
    <div className="adminnav"><Link href="/admin">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/settings">Settings</Link><span className="spacer" />
      {process.env.ADMIN_PASSWORD && <form action={logout}><button style={{ textDecoration: "underline" }}>Sign out</button></form>}</div>
    {children}
  </section>);
}
