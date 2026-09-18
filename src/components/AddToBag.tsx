"use client";
import { useCart } from "./CartProvider";
import { availability } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AddToBag({ p }: { p: Product }) {
  const cart = useCart(); const a = availability(p);
  return <button className="btn" disabled={!a.ok} onClick={() => { if (!cart.add(p.id, p.made_to_order ? 99 : p.stock)) alert("That is all we have of this piece."); }}>{a.ok ? "Add to bag" : "Sold out"}</button>;
}
