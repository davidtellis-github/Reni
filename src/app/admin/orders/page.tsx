import { adminOrders } from "@/lib/data";
import { inr } from "@/lib/format";
import OrderDetail from "@/components/OrderDetail";
import { setOrderStatus } from "@/app/actions";
import type { OrderStatus } from "@/lib/types";

const FILTERS: (OrderStatus | "all")[] = ["awaiting_verification", "confirmed", "shipped", "rejected", "all"];

export default async function Orders({ searchParams }: { searchParams: Promise<{ f?: string; o?: string }> }) {
  const { f = "confirmed", o: openId } = await searchParams;
  const all = await adminOrders();
  const list = all.filter((x) => f === "all" || x.status === f);
  const open = openId ? all.find((x) => x.id === openId) : null;
  async function act(form: FormData) { "use server"; await setOrderStatus(String(form.get("id")), String(form.get("status")) as OrderStatus, String(form.get("note") || "")); }
  return (<>
    <div className="bar"><div className="actions" style={{ gap: 12 }}>{FILTERS.map((x) => <a key={x} href={`/admin/orders?f=${x}`} style={{ fontWeight: f === x ? 600 : 400, textDecoration: "underline", fontSize: 12 }}>{x.replace("_", " ")}</a>)}</div></div>
    <div className="tscroll"><table><thead><tr><th>Order</th><th>When</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment ID</th><th>Status</th></tr></thead><tbody>
      {list.length ? list.map((x) => (<tr key={x.id}><td><a href={`/admin/orders?f=${f}&o=${x.id}`} style={{ textDecoration: "underline" }}>{x.id}</a></td><td className="small">{new Date(x.created_at).toLocaleDateString("en-IN")}</td>
        <td>{x.customer.name}<div className="small muted">{x.customer.phone}</div></td><td className="small">{x.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
        <td>{inr(x.total)}</td><td className="small">{x.razorpay_payment_id}</td><td><span className={`status ${x.status}`}>{x.status.replace("_", " ")}</span></td></tr>)) : <tr><td colSpan={7} className="muted">No orders here.</td></tr>}
    </tbody></table></div>
    <p className="small muted" style={{ marginTop: 16 }}>Payments are verified automatically by Razorpay, so new orders land here already confirmed and stock is deducted right away. Use Reject only to cancel/refund an order — that restocks it.</p>
    {open && (<>
      <div className="overlay" /><div className="modal"><div className="panel narrow">
        <header><h3>Order {open.id}</h3><a href={`/admin/orders?f=${f}`}>Close</a></header>
        <div style={{ padding: 24 }}><OrderDetail o={open} admin />
          <form action={act}><input type="hidden" name="id" value={open.id} />
            <label className="field" style={{ marginTop: 18 }}><span>Message to customer (shown on their tracking page)</span><input name="note" defaultValue={open.admin_note || ""} /></label>
            <div className="actions" style={{ gap: 14 }}>
              {open.status === "awaiting_verification" && <><button className="btn small" name="status" value="confirmed">Confirm payment</button><button className="btn ghost small" name="status" value="rejected">Reject</button></>}
              {open.status === "confirmed" && <button className="btn small" name="status" value="shipped">Mark shipped</button>}
              {open.status !== "awaiting_verification" && <button name="status" value="awaiting_verification">Reopen</button>}
              <button name="status" value={open.status}>Save note</button>
            </div></form></div></div></div>
    </>)}
  </>);
}
