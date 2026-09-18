"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { useCart } from "./CartProvider";
import { createOrder } from "@/app/actions";
import { inr, upiLink } from "@/lib/format";
import type { Customer, Product, Settings } from "@/lib/types";

type Line = { id: string; qty: number; p: Product };
type Step = "details" | "pay" | "done";

export default function Checkout({ lines, total, settings, onClose }: { lines: Line[]; total: number; settings: Settings; onClose: () => void }) {
  const cart = useCart();
  const [step, setStep] = useState<Step>("details");
  const [cust, setCust] = useState<Customer>({ name: "", phone: "", email: "", address: "", note: "" });
  const [utr, setUtr] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState("");
  // A provisional reference for the UPI note; the real order number is assigned on submit.
  const ref = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  const link = upiLink(settings.upi_id, settings.payee_name || settings.brand, total, ref);
  const [qr, setQr] = useState("");
  useEffect(() => { if (step === "pay") QRCode.toDataURL(link, { width: 184, margin: 1 }).then(setQr).catch(() => setQr("")); }, [step, link]);

  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCust({ ...cust, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await createOrder({ lines: lines.map((l) => ({ id: l.id, qty: l.qty })), customer: cust, utr });
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    setOrderId(r.id); cart.clear(); setStep("done");
  }
  const steps = <div className="steps"><span className={step === "details" ? "on" : ""}>1 Details</span><span className={step === "pay" ? "on" : ""}>2 Pay</span><span className={step === "done" ? "on" : ""}>3 Confirm</span></div>;

  return (<>
    <div className="overlay" onClick={step === "done" ? undefined : onClose} />
    <div className="modal"><div className="panel narrow">
      <header><h3>Checkout</h3>{step !== "done" && <button onClick={onClose}>Close</button>}</header>
      <div style={{ padding: 24 }}>
        {step === "details" && <form onSubmit={(e) => { e.preventDefault(); setStep("pay"); }}>{steps}
          <label className="field"><span>Name</span><input required value={cust.name} onChange={set("name")} /></label>
          <label className="field"><span>Phone (WhatsApp preferred)</span><input required inputMode="tel" value={cust.phone} onChange={set("phone")} /></label>
          <label className="field"><span>Email</span><input type="email" value={cust.email} onChange={set("email")} /></label>
          <label className="field"><span>Delivery address</span><textarea required value={cust.address} onChange={set("address")} /></label>
          <label className="field"><span>Note for the maker (colour, size, anything)</span><textarea value={cust.note} onChange={set("note")} /></label>
          <div className="total"><span>{lines.length} item{lines.length > 1 ? "s" : ""}</span><span>{inr(total)}</span></div>
          <button className="btn" style={{ width: "100%", justifyContent: "center" }}>Continue to payment</button></form>}

        {step === "pay" && <>{steps}<div className="pay">
          <div><div className="qr">{qr ? <img src={qr} alt="UPI QR code" /> : <span className="small muted">Use the button or UPI ID.</span>}</div>
            <a className="btn ghost small" style={{ marginTop: 10, width: 200, justifyContent: "center" }} href={link}>Open UPI app</a></div>
          <div><div className="amt">{inr(total)}</div><div className="small muted">Payment reference {ref}</div>
            <div className="upi"><code>{settings.upi_id}</code><button onClick={() => navigator.clipboard?.writeText(settings.upi_id)}>Copy</button></div>
            <p className="small muted">Pay exactly {inr(total)} to the UPI ID above. Then enter the UTR / transaction reference from your receipt.</p>
            <form onSubmit={submit}><label className="field"><span>UTR / UPI reference (12 digits)</span><input required inputMode="numeric" pattern="[0-9]{12}" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 4xxxxxxxxxxx" /></label>
              {err && <div className="err">{err}</div>}
              <button className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>{busy ? "Saving…" : "I have paid — submit UTR"}</button></form>
            <button className="small muted" style={{ marginTop: 14, textDecoration: "underline" }} onClick={() => setStep("details")}>Back to details</button></div>
        </div></>}

        {step === "done" && <>{steps}<h2 className="display" style={{ fontSize: 30, marginBottom: 12 }}>Thank you</h2>
          <p>Your order <b>{orderId}</b> is awaiting payment verification. We check UTRs by hand, usually within a day, and will message you on {cust.phone} once it&apos;s confirmed.</p>
          <p className="small muted">Track it any time at <Link href={`/order/${orderId}`} style={{ textDecoration: "underline" }}>this link</Link>. Keep your UTR handy.</p>
          <Link className="btn" href={`/order/${orderId}`} onClick={onClose}>Track order</Link></>}
      </div>
    </div></div>
  </>);
}
