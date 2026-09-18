import Link from "next/link";
import { getProducts, getSettings } from "@/lib/data";
import { imageUrl } from "@/lib/supabase";
import CartDrawer from "@/components/CartDrawer";

export const revalidate = 60;
const shapes = ["n1", "tall", "round", "round", "n3", "n2", "tall", "n1"];

export default async function About() {
  const [c, products] = await Promise.all([getSettings(), getProducts()]);
  const ids = [...new Set([...products.flatMap((p) => p.images), ...c.hero_images])].slice(0, 8);
  const paras = c.about_body.split(/\n\s*\n/).filter(Boolean);
  return (<>
    <section className="aboutpg wrap">
      <div className="strip">{(ids.length ? ids : shapes.slice(0, 6)).map((id, i) => <div key={id + i} className={`ph ${shapes[i % shapes.length]}`} style={ids.length ? { backgroundImage: `url('${imageUrl(id)}')` } : undefined} />)}</div>
      <p className="intro">{c.about_lead}</p>
      <div className="grid">
        <h1>{c.about_heading}</h1>
        <div className="portrait" style={c.about_image ? { backgroundImage: `url('${imageUrl(c.about_image)}')` } : undefined} />
        <div className="copy">{paras.map((t, i) => <p key={i}>{t}</p>)}<Link className="btn" href="/#shop">See the pieces</Link><div className="small muted" style={{ marginTop: 22 }}>Since {c.since_year}</div></div>
      </div>
    </section>
    <CartDrawer products={products} settings={c} />
  </>);
}
