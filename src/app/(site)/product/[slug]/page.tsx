import { notFound } from "next/navigation";
import { getProduct, getProducts, getSettings } from "@/lib/data";
import { availability, inr } from "@/lib/format";
import Gallery from "@/components/Gallery";
import AddToBag from "@/components/AddToBag";
import CartDrawer from "@/components/CartDrawer";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, c, products] = await Promise.all([getProduct(slug), getSettings(), getProducts()]);
  if (!p || p.hidden) notFound();
  const a = availability(p);
  return (<>
    <section className="wrap pdpage"><div className="pd">
      <Gallery images={p.images} />
      <div className="info"><h2>{p.name}</h2><div className="price">{inr(p.price)}</div>
        <p>{p.description}</p>
        <dl>{p.materials && <><dt>Materials</dt><dd>{p.materials}</dd></>}{p.size && <><dt>Size</dt><dd>{p.size}</dd></>}<dt>Availability</dt><dd>{a.label}</dd>{p.care && <><dt>Care</dt><dd>{p.care}</dd></>}</dl>
        <AddToBag p={p} />
      </div></div></section>
    <CartDrawer products={products} settings={c} />
  </>);
}
