import { inr } from "@/lib/format";
import type { Order } from "@/lib/types";

const LABEL: Record<string, string> = { awaiting_verification: "Awaiting payment", confirmed: "Payment confirmed — being made", shipped: "Shipped", rejected: "Cancelled / refunded" };
type Props = { o: Partial<Order> & Pick<Order, "id" | "status" | "items" | "total" | "created_at">; admin?: boolean };

export default function OrderDetail({ o, admin = false }: Props) {
  return (<>
    <div className="small muted">Order {o.id} · {new Date(o.created_at).toLocaleString("en-IN")}</div>
    <div style={{ margin: "10px 0 18px" }}><span className={`status ${o.status}`}>{LABEL[o.status] || o.status}</span></div>
    {o.items.map((i, k) => <div className="total" key={k} style={{ fontWeight: 400 }}><span>{i.name} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></div>)}
    <div className="total"><span>Total</span><span>{inr(o.total)}</span></div>
    <dl className="small" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 16px" }}>
      {admin && o.razorpay_payment_id && <><dt className="muted">Payment ID</dt><dd style={{ margin: 0 }}>{o.razorpay_payment_id}</dd></>}
      {admin && o.customer && <><dt className="muted">Name</dt><dd style={{ margin: 0 }}>{o.customer.name}</dd><dt className="muted">Phone</dt><dd style={{ margin: 0 }}>{o.customer.phone}</dd><dt className="muted">Email</dt><dd style={{ margin: 0 }}>{o.customer.email || "—"}</dd><dt className="muted">Address</dt><dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{o.customer.address}</dd><dt className="muted">Note</dt><dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{o.customer.note || "—"}</dd></>}
      {o.admin_note && <><dt className="muted">From the studio</dt><dd style={{ margin: 0 }}>{o.admin_note}</dd></>}
    </dl>
  </>);
}
