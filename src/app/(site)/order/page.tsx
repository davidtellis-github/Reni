import { redirect } from "next/navigation";

export default function Track() {
  async function go(form: FormData) { "use server"; redirect(`/order/${String(form.get("id") || "").trim().toUpperCase()}`); }
  return (<section className="wrap" style={{ padding: "64px 0 96px", maxWidth: 640 }}>
    <h2 className="display" style={{ fontSize: 32, marginBottom: 24 }}>Track an order</h2>
    <form action={go}><label className="field"><span>Order number</span><input name="id" placeholder="e.g. AB12CD34" required /></label><button className="btn">Find order</button></form>
  </section>);
}
