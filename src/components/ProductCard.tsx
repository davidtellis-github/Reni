import Link from "next/link";
import { availability, inr } from "@/lib/format";
import { imageUrl } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  const a = availability(p); const img = p.images[0];
  return (
    <Link className="card" href={`/product/${p.slug}`}>
      <div className={`img ${img ? "" : "ph"}`} style={img ? { backgroundImage: `url('${imageUrl(img)}')` } : undefined}>
        {a.tag && <span className={`tag ${a.out ? "out" : ""}`}>{a.tag}</span>}
      </div>
      <div className="row"><span className="name">{p.name}</span><span className="price">{inr(p.price)}</span></div>
      <div className="stock">{a.label}</div>
    </Link>
  );
}
