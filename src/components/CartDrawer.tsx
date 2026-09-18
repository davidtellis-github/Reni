"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import Checkout from "./Checkout";
import { availability, inr } from "@/lib/format";
import { imageUrl } from "@/lib/supabase";
import type { Product, Settings } from "@/lib/types";

export default function CartDrawer({ products, settings }: { products: Product[]; settings: Settings }) {
  const cart = useCart();
  const [checkout, setCheckout] = useState(false);
  const lines = cart.lines.map((l) => ({ ...l, p: products.find((p) => p.id === l.id) })).filter((l) => l.p) as { id: string; qty: number; p: Product }[];
  const total = lines.reduce((a, l) => a + l.qty * l.p.price, 0);
  if (checkout) return <Checkout lines={lines} total={total} settings={settings} onClose={() => setCheckout(false)} />;
  if (!cart.open) return null;
  return (<>
    <div className="overlay" onClick={() => cart.setOpen(false)} />
    <aside className="drawer" role="dialog" aria-label="Bag">
      <header><h3>Your bag</h3><button onClick={() => cart.setOpen(false)}>Close</button></header>
      <div className="body">{lines.length ? lines.map((l) => {
        const max = l.p.made_to_order ? 99 : l.p.stock;
        return (<div className="line" key={l.id}>
          <div className="thumb" style={l.p.images[0] ? { backgroundImage: `url('${imageUrl(l.p.images[0])}')` } : undefined} />
          <div><div className="n">{l.p.name}</div><div className="small muted">{availability(l.p).label}</div>
            <div className="qty"><button onClick={() => cart.change(l.id, -1, max)}>−</button><span>{l.qty}</span><button onClick={() => { if (!cart.change(l.id, 1, max)) alert("That is all we have of this piece."); }}>+</button></div></div>
          <div>{inr(l.p.price * l.qty)}</div>
        </div>);
      }) : <p className="muted">Your bag is empty.</p>}</div>
      <div className="foot"><div className="total"><span>Total</span><span>{inr(total)}</span></div>
        <p className="small muted" style={{ margin: "0 0 12px" }}>{settings.shipping_note}</p>
        <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={!lines.length} onClick={() => setCheckout(true)}>Pay by UPI</button></div>
    </aside>
  </>);
}
