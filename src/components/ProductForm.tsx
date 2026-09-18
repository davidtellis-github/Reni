"use client";
import { useActionState } from "react";
import Link from "next/link";
import { saveProduct } from "@/app/actions";
import ImageUploader from "@/components/ImageUploader";
import type { Product } from "@/lib/types";

export default function ProductForm({ p, isNew }: { p: Partial<Product>; isNew: boolean }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  return (<form action={action} className="editor"><div>
    {!isNew && <input type="hidden" name="id" value={p.id} />}
    <label className="field"><span>Name</span><input name="name" required defaultValue={p.name || ""} /></label>
    <div className="two"><label className="field"><span>Price (₹)</span><input name="price" type="number" min={0} step={1} required defaultValue={p.price ?? ""} /></label>
      <label className="field"><span>Stock (pieces ready now)</span><input name="stock" type="number" min={0} step={1} defaultValue={p.stock ?? 0} /></label></div>
    <label className="field inline"><input type="checkbox" name="made_to_order" defaultChecked={!!p.made_to_order} /><span>Made to order (ignore stock)</span></label>
    <label className="field"><span>Lead time (shown when made to order)</span><input name="lead_time" placeholder="e.g. ready in 10–14 days" defaultValue={p.lead_time || ""} /></label>
    <label className="field"><span>Description</span><textarea name="description" defaultValue={p.description || ""} /></label>
    <div className="two"><label className="field"><span>Materials</span><input name="materials" defaultValue={p.materials || ""} /></label>
      <label className="field"><span>Size</span><input name="size" defaultValue={p.size || ""} /></label></div>
    <label className="field"><span>Care</span><input name="care" defaultValue={p.care || ""} /></label>
    <label className="field inline"><input type="checkbox" name="hidden" defaultChecked={!!p.hidden} /><span>Hide from the shop</span></label>
    {state?.error && <div className="err" style={{ marginTop: 8 }}>{state.error}</div>}
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}><button className="btn" disabled={pending}>{pending ? "Saving…" : "Save piece"}</button><Link className="btn ghost" href="/admin">Cancel</Link></div>
  </div><div>
    <div className="field"><span>Photos (first one is the cover)</span><ImageUploader name="images" initial={p.images || []} /></div>
  </div></form>);
}
