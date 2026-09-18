import { cache } from "react";
import { publicClient, adminClient } from "./supabase";
import type { Settings, Product, Order } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  id: 1, brand: "Knotforaverage", tagline: "", since_year: "2025",
  hero_headline: "Every stitch by hand. No two alike.", hero_images: [],
  about_lead: "", about_heading: "", about_body: "", about_image: "",
  upi_id: "", payee_name: "Knotforaverage", contact_email: "", instagram: "",
  shipping_note: "Ships within India. Delivery charge included in the price.",
};

export const getSettings = cache(async (): Promise<Settings> => {
  const { data } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const { data } = await publicClient().from("products").select("*").eq("hidden", false).order("sort");
  return data || [];
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const { data } = await publicClient().from("products").select("*").eq("slug", slug).maybeSingle();
  return data;
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
