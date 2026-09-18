import Link from "next/link";
import type { Settings } from "@/lib/types";

export default function Footer({ settings: c }: { settings: Settings }) {
  const ig = c.instagram.replace("@", "");
  return (
    <footer id="contact"><div className="wrap">
      <div className="cols">
        <div><b>SHOP</b><Link href="/#shop">All pieces</Link><Link href="/#how">How to order</Link><Link href="/order">Track an order</Link></div>
        <div><b>STUDIO</b><Link href="/about">About</Link><span>{c.shipping_note}</span></div>
        <div><b>CONTACT</b>{c.contact_email ? <a href={`mailto:${c.contact_email}`}>{c.contact_email}</a> : <span>Email not set</span>}{ig && <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener">@{ig}</a>}</div>
        <div><b>PAYMENT</b><span>Cards, UPI, netbanking &amp; wallets</span><span>Secure checkout via Razorpay</span></div>
      </div>
      <div className="word">{c.brand}</div>
      <div className="legal"><span>© {c.since_year}–{new Date().getFullYear()} {c.brand}</span><span>Handmade in India</span></div>
    </div></footer>
  );
}
