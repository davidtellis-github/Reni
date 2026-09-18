import type { Product } from "./types";

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export function availability(p: Pick<Product, "stock" | "made_to_order" | "lead_time">) {
  if (p.made_to_order) return { ok: true, label: p.lead_time ? `Made to order · ${p.lead_time}` : "Made to order", tag: "Made to order", out: false };
  const s = Number(p.stock || 0);
  if (s <= 0) return { ok: false, label: "Sold out", tag: "Sold out", out: true };
  return { ok: true, label: s === 1 ? "Only 1 available" : `${s} available`, tag: s <= 2 ? `Only ${s} left` : "", out: false };
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "piece";

export const orderNumber = () => {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = "";
  for (let i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
};
