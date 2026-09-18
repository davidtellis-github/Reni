import { cache } from "react";
import { publicClient, adminClient } from "./supabase";
import type { Settings, Product, Order } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  id: 1, brand: "Knotforaverage", tagline: "Hand-crocheted throws, made one at a time.", since_year: "2025",
  hero_headline: "Every stitch by hand. No two alike.",
  hero_images: ["/images/blanket-oat.png", "/images/blanket-sage.png", "/images/blanket-clay.png"],
  about_lead: "Every throw starts as a single ball of yarn and a few quiet evenings.",
  about_heading: "Made by hand, for slow living",
  about_body: "Knotforaverage began with one hook, one skein, and a habit of making gifts nobody asked for.\n\nEach piece is crocheted to order in small batches, so colours, textures, and finishes vary slightly from throw to throw — that's the point, not a flaw.\n\nWe work mostly with chunky chenille and worsted-weight cotton, chosen for how they feel after the hundredth wash, not just the first photo.",
  about_image: "/images/blanket-sage.png",
  contact_email: "", instagram: "",
  shipping_note: "Ships within India. Delivery charge included in the price.",
};

const now = "2026-01-01T00:00:00.000Z";
export const DEMO_PRODUCTS: Product[] = [
  { id: "demo-1", slug: "oat-chunky-throw", name: "Oat Chunky Throw", price: 3499, stock: 4, made_to_order: false,
    lead_time: "", description: "A deep-ribbed chunky knit throw in warm oat, hand-finished with a scalloped edge. Big enough to share, soft enough to live in.",
    materials: "Chenille yarn", size: "127 × 152 cm", care: "Machine wash cold, tumble dry low",
    hidden: false, images: ["/images/blanket-oat.png"], sort: 1, created_at: now, updated_at: now },
  { id: "demo-2", slug: "sage-cable-throw", name: "Sage Cable Throw", price: 3799, stock: 2, made_to_order: false,
    lead_time: "", description: "Chunky cable-knit throw in muted sage. Each cable is worked by hand, so no two rows sit quite the same.",
    materials: "Chenille yarn", size: "127 × 152 cm", care: "Machine wash cold, tumble dry low",
    hidden: false, images: ["/images/blanket-sage.png"], sort: 2, created_at: now, updated_at: now },
  { id: "demo-3", slug: "natural-fringe-throw", name: "Natural Fringe Throw", price: 2899, stock: 0, made_to_order: true,
    lead_time: "2–3 weeks", description: "Ribbed crochet throw in natural and taupe, finished with oversized pom-pom tassels.",
    materials: "Wool-blend yarn", size: "110 × 150 cm", care: "Hand wash cold, lay flat to dry",
    hidden: false, images: ["/images/blanket-natural.png"], sort: 3, created_at: now, updated_at: now },
  { id: "demo-4", slug: "clay-stripe-throw", name: "Clay Stripe Throw", price: 3199, stock: 3, made_to_order: false,
    lead_time: "", description: "Bold vertical stripes in clay pink, cream, and mustard. A statement throw for a neutral room.",
    materials: "Acrylic-wool blend", size: "120 × 160 cm", care: "Machine wash cold, tumble dry low",
    hidden: false, images: ["/images/blanket-clay.png"], sort: 4, created_at: now, updated_at: now },
  { id: "demo-5", slug: "blush-colorblock-throw", name: "Blush Colorblock Throw", price: 3299, stock: 5, made_to_order: false,
    lead_time: "", description: "Colour-blocked panels in blush, chartreuse, and cream, crocheted in a dense single stitch for structure and warmth.",
    materials: "Cotton-acrylic blend", size: "120 × 150 cm", care: "Machine wash cold, tumble dry low",
    hidden: false, images: ["/images/blanket-blush.png"], sort: 5, created_at: now, updated_at: now },
];

export const getSettings = cache(async (): Promise<Settings> => {
  const { data } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const { data } = await publicClient().from("products").select("*").eq("hidden", false).order("sort");
  return data && data.length ? data : DEMO_PRODUCTS;
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const { data } = await publicClient().from("products").select("*").eq("slug", slug).maybeSingle();
  return data || DEMO_PRODUCTS.find((p) => p.slug === slug) || null;
});

// ---- admin (service role) ----
export async function adminProducts(): Promise<Product[]> {
  const { data } = await adminClient().from("products").select("*").order("sort");
  return data || [];
}
export async function adminProduct(id: string): Promise<Product | null> {
  const { data } = await adminClient().from("products").select("*").eq("id", id).maybeSingle();
  return data;
}
export async function adminOrders(): Promise<Order[]> {
  const { data } = await adminClient().from("orders").select("*").order("created_at", { ascending: false });
  return data || [];
}
export async function adminOrder(id: string): Promise<Order | null> {
  const { data } = await adminClient().from("orders").select("*").eq("id", id).maybeSingle();
  return data;
}
