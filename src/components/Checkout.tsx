"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions";
import { inr } from "@/lib/format";
import type { Customer, Product, Settings } from "@/lib/types";

type Line = { id: string; qty: number; p: Product };
type Step = "details" | "pay" | "done";
type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance }
}

const SDK_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export default function Checkout({ lines, total, settings, onClose }: { lines: Line[]; total: number; settings: Settings; onClose: () => void }) {
  const cart = useCart();
  const [step, setStep] = useState<Step>("details");
  const [cust, setCust] = useState<Customer>({ name: "", phone: "", email: "", address: "", note: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (window.Razorpay) { setSdkReady(true); return; }
    const existing = document.querySelector(`script[src="${SDK_SRC}"]`);
    if (existing) { existing.addEventListener("load", () => setSdkReady(true)); return; }
    const s = document.createElement("script");
    s.src = SDK_SRC; s.async = true;
    s.onload = () => setSdkReady(true);
    s.onerror = () => setErr("Could not load the payment gateway. Check your connection and try again.");
    document.body.appendChild(s);
  }, []);

  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCust({ ...cust, [k]: e.target.value });

  async function pay(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await createRazorpayOrder({ lines: lines.map((l) => ({ id: l.id, qty: l.qty })) });
    if (!r.ok) { setBusy(false); setErr(r.error); return; }
    if (!sdkReady || !window.Razorpay) { setBusy(false); setErr("Payment gateway is still loading — try again in a moment."); return; }

    setStep("pay");
    const rp = new window.Razorpay({
      key: r.keyId, amount: r.amount, currency: r.currency, order_id: r.razorpayOrderId,
      name: settings.brand, description: `${lines.length} item${lines.length > 1 ? "s" : ""}`,
      prefill: { name: cust.name, contact: cust.phone, email: cust.email },
      notes: { address: cust.address },
      theme: { color: "#000000" },
      handler: async (resp: unknown) => {
        setBusy(true);
        const p = resp as RazorpayResponse;
        const v = await verifyRazorpayPayment({
          lines: lines.map((l) => ({ id: l.id, qty: l.qty })), customer: cust,
          razorpay_order_id: p.razorpay_order_id, razorpay_payment_id: p.razorpay_payment_id, razorpay_signature: p.razorpay_signature,
        });
        setBusy(false);
        if (!v.ok) { setErr(v.error); setStep("details"); return; }
        setOrderId(v.id); cart.clear(); setStep("done");
      },
      modal: { ondismiss: () => { setBusy(false); setStep("details"); } },
    });
    rp.on("payment.failed", () => { setBusy(false); setErr("Payment failed. You were not charged — please try again."); setStep("details"); });
    rp.open();
  }

  const steps = <div className="steps"><span className={step === "details" ? "on" : ""}>1 Details</span><span className={step === "pay" ? "on" : ""}>2 Pay</span><span className={step === "done" ? "on" : ""}>3 Confirm</span></div>;

  return (<>
    <div className="overlay" onClick={step === "done" ? undefined : onClose} />
    <div className="modal"><div className="panel narrow">
      <header><h3>Checkout</h3>{step !== "done" && <button onClick={onClose}>Close</button>}</header>
      <div style={{ padding: 24 }}>
        {step !== "done" && <form onSubmit={pay}>{steps}
          <label className="field"><span>Name</span><input required value={cust.name} onChange={set("name")} /></label>
          <label className="field"><span>Phone (WhatsApp preferred)</span><input required inputMode="tel" value={cust.phone} onChange={set("phone")} /></label>
          <label className="field"><span>Email</span><input type="email" value={cust.email} onChange={set("email")} /></label>
          <label className="field"><span>Delivery address</span><textarea required value={cust.address} onChange={set("address")} /></label>
          <label className="field"><span>Note for the maker (colour, size, anything)</span><textarea value={cust.note} onChange={set("note")} /></label>
          <div className="total"><span>{lines.length} item{lines.length > 1 ? "s" : ""}</span><span>{inr(total)}</span></div>
          {err && <div className="err">{err}</div>}
          <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>{busy ? "Opening payment…" : `Pay ${inr(total)}`}</button>
          <p className="small muted" style={{ marginTop: 10 }}>Pay securely by card, UPI, netbanking or wallet via Razorpay.</p></form>}

        {step === "done" && <>{steps}<h2 className="display" style={{ fontSize: 30, marginBottom: 12 }}>Thank you</h2>
          <p>Your order <b>{orderId}</b> is confirmed and paid. We&apos;ll message you on {cust.phone} once it&apos;s on its way.</p>
          <p className="small muted">Track it any time at <Link href={`/order/${orderId}`} style={{ textDecoration: "underline" }}>this link</Link>.</p>
          <Link className="btn" href={`/order/${orderId}`} onClick={onClose}>Track order</Link></>}
      </div>
    </div></div>
  </>);
}
