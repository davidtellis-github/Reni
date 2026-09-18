"use server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient, publicClient } from "@/lib/supabase";
import { razorpayClient } from "@/lib/razorpay";
import { isAdmin, setAdminCookie, clearAdminCookie } from "@/lib/auth";
import { orderNumber, slugify } from "@/lib/format";
import type { CartLine, Customer, OrderItem, OrderStatus, Product } from "@/lib/types";

async function guard() { if (!(await isAdmin())) throw new Error("Not signed in"); }

async function priceCart(lines: CartLine[]) {
  const ids = lines.map((l) => l.id);
  const { data: products } = await adminClient().from("products").select("*").in("id", ids).eq("hidden", false);
  const items: OrderItem[] = [];
  for (const l of lines) {
    const p = (products || []).find((x: Product) => x.id === l.id);
    if (!p) throw new Error("One of the pieces in your bag is no longer available.");
    const qty = Math.max(1, Math.floor(l.qty));
    if (!p.made_to_order && qty > p.stock) throw new Error(`Only ${p.stock} of "${p.name}" available.`);
    items.push({ product_id: p.id, name: p.name, price: p.price, qty, made_to_order: p.made_to_order });
  }
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  return { items, total };
}

// ---------- public: Razorpay checkout ----------
export type CreateRazorpayOrderResult =
  | { ok: true; keyId: string; amount: number; currency: string; razorpayOrderId: string }
  | { ok: false; error: string };

export async function createRazorpayOrder(input: { lines: CartLine[] }): Promise<CreateRazorpayOrderResult> {
  if (!input.lines.length) return { ok: false, error: "Your bag is empty." };
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) return { ok: false, error: "Payments are not set up yet. Add your Razorpay keys." };
  try {
    const { total } = await priceCart(input.lines);
    if (total <= 0) return { ok: false, error: "Your bag is empty." };
    const order = await razorpayClient().orders.create({ amount: Math.round(total * 100), currency: "INR", receipt: orderNumber() });
    return { ok: true, keyId, amount: Number(order.amount), currency: order.currency, razorpayOrderId: order.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not start payment." };
  }
}

export type VerifyPaymentResult = { ok: true; id: string } | { ok: false; error: string };

export async function verifyRazorpayPayment(input: {
  lines: CartLine[]; customer: Customer;
  razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
}): Promise<VerifyPaymentResult> {
  const c = input.customer;
  if (!c.name?.trim() || !c.phone?.trim() || !c.address?.trim()) return { ok: false, error: "Name, phone and address are required." };
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return { ok: false, error: "Payments are not set up yet." };

  const expected = crypto.createHmac("sha256", secret).update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`).digest("hex");
  if (expected !== input.razorpay_signature) return { ok: false, error: "Payment could not be verified." };

  let items: OrderItem[]; let total: number;
  try { ({ items, total } = await priceCart(input.lines)); }
  catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Could not verify your order." }; }

  const db = adminClient();
  const id = orderNumber();
  const { error } = await db.from("orders").insert({
    id, status: "confirmed",
    razorpay_order_id: input.razorpay_order_id, razorpay_payment_id: input.razorpay_payment_id,
    total, items,
    customer: { name: c.name.trim(), phone: c.phone.trim(), email: (c.email || "").trim(), address: c.address.trim(), note: (c.note || "").trim() },
  });
  if (error) return { ok: false, error: `Payment succeeded but the order could not be saved. Contact the studio with payment ID ${input.razorpay_payment_id}.` };

  for (const it of items) {
    if (it.made_to_order) continue;
    await db.rpc("adjust_stock", { p_id: it.product_id, delta: -it.qty });
  }
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function lookupOrder(id: string) {
  const { data } = await adminClient().from("orders").select("id,status,total,items,razorpay_payment_id,admin_note,created_at").eq("id", id.trim().toUpperCase()).maybeSingle();
  return data;
}

// ---------- admin auth ----------
export async function login(_: unknown, form: FormData) {
  const pw = String(form.get("password") || "");
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) return { error: "Wrong password." };
  await setAdminCookie();
  redirect("/admin");
}
export async function logout() { await clearAdminCookie(); redirect("/admin/login"); }

// ---------- admin: images ----------
export async function uploadImage(form: FormData): Promise<{ path?: string; error?: string }> {
  await guard();
  const file = form.get("file") as File | null;
  if (!file || !file.size) return { error: "No file." };
  if (file.size > 20 * 1024 * 1024) return { error: "Image over 20 MB." };
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await adminClient().storage.from("images").upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) return { error: error.message };
  return { path };
}

// ---------- admin: products ----------
export type SaveProductResult = { error?: string } | null;

export async function saveProduct(_: SaveProductResult, form: FormData): Promise<SaveProductResult> {
  await guard();
  const db = adminClient();
  const id = String(form.get("id") || "");
  const name = String(form.get("name") || "").trim();
  const madeToOrder = form.get("made_to_order") === "on";
  const doc = {
    name,
    price: Math.max(0, Math.round(Number(form.get("price") || 0))),
    stock: madeToOrder ? 0 : Math.max(0, Math.round(Number(form.get("stock") || 0))),
    made_to_order: madeToOrder,
    lead_time: String(form.get("lead_time") || ""),
    description: String(form.get("description") || ""),
    materials: String(form.get("materials") || ""),
    size: String(form.get("size") || ""),
    care: String(form.get("care") || ""),
    hidden: form.get("hidden") === "on",
    images: form.getAll("images").map(String).filter(Boolean),
    updated_at: new Date().toISOString(),
  };
  if (!name) return { error: "Name is required." };
  if (id) {
    const { error } = await db.from("products").update(doc).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: last } = await db.from("products").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
    let slug = slugify(name);
    const { data: clash } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await db.from("products").insert({ ...doc, slug, sort: (last?.sort ?? 0) + 1 });
    if (error) return { error: error.message };
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}
export async function deleteProduct(id: string) {
  await guard();
  await adminClient().from("products").delete().eq("id", id);
  revalidatePath("/", "layout");
}
export async function moveProduct(id: string, dir: -1 | 1) {
  await guard();
  const db = adminClient();
  const { data } = await db.from("products").select("id,sort").order("sort");
  const list = data || [];
  const i = list.findIndex((p) => p.id === id); const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  await db.from("products").update({ sort: list[j].sort }).eq("id", list[i].id);
  await db.from("products").update({ sort: list[i].sort }).eq("id", list[j].id);
  revalidatePath("/", "layout");
}

// ---------- admin: settings ----------
export async function saveSettings(form: FormData) {
  await guard();
  const keys = ["brand","tagline","since_year","hero_headline","about_lead","about_heading","about_body","contact_email","instagram","shipping_note","about_image"] as const;
  const doc: Record<string, unknown> = {};
  for (const k of keys) doc[k] = String(form.get(k) ?? "").trim();
  doc.hero_images = form.getAll("hero_images").map(String).filter(Boolean);
  await adminClient().from("settings").update(doc).eq("id", 1);
  revalidatePath("/", "layout");
}

// ---------- admin: orders ----------
export async function setOrderStatus(id: string, status: OrderStatus, adminNote: string) {
  await guard();
  const db = adminClient();
  const { data: o } = await db.from("orders").select("*").eq("id", id).single();
  if (!o) return;
  const decrement = o.status === "awaiting_verification" && status === "confirmed";
  const restock = (o.status === "confirmed" || o.status === "shipped") && status === "awaiting_verification";
  await db.from("orders").update({ status, admin_note: adminNote, updated_at: new Date().toISOString() }).eq("id", id);
  if (decrement || restock) {
    for (const it of o.items as OrderItem[]) {
      if (it.made_to_order) continue;
      await db.rpc("adjust_stock", { p_id: it.product_id, delta: decrement ? -it.qty : it.qty });
    }
  }
  revalidatePath("/", "layout");
}
