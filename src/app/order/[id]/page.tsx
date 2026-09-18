import { lookupOrder } from "@/app/actions";
import OrderDetail from "@/components/OrderDetail";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await lookupOrder(id);
  return (<section className="wrap" style={{ padding: "64px 0 96px", maxWidth: 640 }}>
    <h2 className="display" style={{ fontSize: 32, marginBottom: 24 }}>Track an order</h2>
    {o ? <OrderDetail o={o} /> : <p>No order found with number <b>{id.toUpperCase()}</b>. Check the number, or the store may not have received it.</p>}
  </section>);
}
