import Link from "next/link";
import Image from "next/image";
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
      <div className="strip">{(ids.length ? ids : shapes.slice(0, 6)).map((id, i) => (
        <div key={id + i} className={`ph ${shapes[i % shapes.length]}`}>
          {ids.length > 0 && <Image src={imageUrl(id)} alt="" fill sizes="190px" style={{ objectFit: "cover" }} />}
        </div>
      ))}</div>
      <p className="intro">{c.about_lead}</p>
      <div className="grid">
        <h1>{c.about_heading}</h1>
        <div className="portrait">
          {c.about_image && <Image src={imageUrl(c.about_image)} alt="" fill sizes="(max-width: 900px) 100vw, 33vw" style={{ objectFit: "cover" }} />}
        </div>
        <div className="copy">{paras.map((t, i) => <p key={i}>{t}</p>)}<Link className="btn" href="/#shop">See the pieces</Link><div className="small muted" style={{ marginTop: 22 }}>Since {c.since_year}</div></div>
      </div>
    </section>
    <CartDrawer products={products} settings={c} />
  </>);
}
