import { getProducts, getSettings } from "@/lib/data";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";

export const revalidate = 60;

export default async function Home() {
  const [c, products] = await Promise.all([getSettings(), getProducts()]);
  return (<>
    <Hero headline={c.hero_headline} images={c.hero_images} />
    <section className="collection wrap" id="shop" style={{ paddingTop: 96 }}>
      <div className="head"><div className="kicker">The collection</div><h2>What&apos;s on the hook right now</h2></div>
      <div className="cards">{products.length ? products.map((p) => <ProductCard key={p.id} p={p} />) : <div className="empty">No pieces listed yet. Add them in Studio.</div>}</div>
    </section>
    <section className="how" id="how"><div className="wrap"><ol>
      <li><b>Choose a piece</b><span>Add it to your bag. Stock counts are live, and made-to-order pieces show their lead time.</span></li>
      <li><b>Pay securely</b><span>Checkout with Razorpay — card, UPI, netbanking or wallet.</span></li>
      <li><b>We make it</b><span>Payment is verified instantly. You get an order number to track status.</span></li>
    </ol></div></section>
    <CartDrawer products={products} settings={c} />
  </>);
}
