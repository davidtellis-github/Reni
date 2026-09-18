import Link from "next/link";
import Image from "next/image";
import { availability, inr } from "@/lib/format";
import { imageUrl } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  const a = availability(p); const img = p.images[0];
  return (
    <Link className="card" href={`/product/${p.slug}`}>
      <div className={`img ${img ? "" : "ph"}`}>
        {img && <Image src={imageUrl(img)} alt={p.name} fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: "cover" }} />}
        {a.tag && <span className={`tag ${a.out ? "out" : ""}`}>{a.tag}</span>}
      </div>
      <div className="row"><span className="name">{p.name}</span><span className="price">{inr(p.price)}</span></div>
      <div className="stock">{a.label}</div>
    </Link>
  );
}
