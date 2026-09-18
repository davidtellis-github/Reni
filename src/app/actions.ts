"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient, publicClient } from "@/lib/supabase";
import { isAdmin, setAdminCookie, clearAdminCookie } from "@/lib/auth";
import { orderNumber, slugify } from "@/lib/format";
import type { CartLine, Customer, OrderItem, OrderStatus, Product } from "@/lib/types";

async function guard() { if (!(await isAdmin())) throw new Error("Not signed in"); }

// ---------- public ----------
export type CreateOrderResult = { ok: true; id: string } | { ok: false; error: string };

export async function createOrder(input: { lines: CartLine[]; customer: Customer; utr: string }): Promise<CreateOrderResult> {
  const utr = input.utr.trim();
  if (!/^\d{12}$/.test(utr)) return { ok: false, error: "UTR is 12 digits. Find it on the payment receipt in your UPI app." };
  const c = input.customer;
  if (!c.name?.trim() || !c.phone?.trim() || !c.address?.trim()) return { ok: false, error: "Name, phone and address are required." };
  if (!input.lines.length) return { ok: false, error: "Your bag is empty." };

  const db = adminClient();
  const ids = input.lines.map((l) => l.id);
  const [{ data: products }, { data: settings }] = await Promise.all([
    db.from("products").select("*").in("id", ids).eq("hidden", false),
    db.from("settings").select("upi_id").eq("id", 1).single(),
  ]);
  if (!settings?.upi_id) return { ok: false, error: "The store has no UPI ID configured yet." };

  const items: OrderItem[] = [];
  for (const l of input.lines) {
    const p = (products || []).find((x: Product) => x.id === l.id);
    if (!p) return { ok: false, error: "One of the pieces in your bag is no longer available." };
    const qty = Math.max(1, Math.floor(l.qty));
    if (!p.made_to_order && qty > p.stock) return { ok: false, error: `Only ${p.stock} of "${p.name}" available.` };
    items.push({ product_id: p.id, name: p.name, price: p.price, qty, made_to_order: p.made_to_order });
  }
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const id = orderNumber();
  const { error } = await db.from("orders").insert({
    id, status: "awaiting_verification", utr, upi_id: settings.upi_id, total, items,
    customer: { name: c.name.trim(), phone: c.phone.trim(), email: (c.email || "").trim(), address: c.address.trim(), note: (c.note || "").trim() },
  });
  if (error) return { ok: false, error: "Could not save the order. Your payment is safe — note your UTR and contact the studio." };
  return { ok: true, id };
}

export async function lookupOrder(id: string) {
  const { data } = await adminClient().from("orders").select("id,status,total,items,utr,upi_id,admin_note,created_at").eq("id", id.trim().toUpperCase()).maybeSingle();
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
export async function saveProduct(form: FormData) {
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
  if (!name) throw new Error("Name is required");
  if (id) {
    await db.from("products").update(doc).eq("id", id);
  } else {
    const { data: last } = await db.from("products").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
    let slug = slugify(name);
    const { data: clash } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    await db.from("products").insert({ ...doc, slug, sort: (last?.sort ?? 0) + 1 });
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
  const keys = ["brand","tagline","since_year","hero_headline","about_lead","about_heading","about_body","upi_id","payee_name","contact_email","instagram","shipping_note","about_image"] as const;
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
