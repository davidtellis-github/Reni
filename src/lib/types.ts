export type Settings = {
  id: number; brand: string; tagline: string; since_year: string;
  hero_headline: string; hero_images: string[];
  about_lead: string; about_heading: string; about_body: string; about_image: string;
  upi_id: string; payee_name: string; contact_email: string; instagram: string; shipping_note: string;
};
export type Product = {
  id: string; slug: string; name: string; price: number; stock: number; made_to_order: boolean;
  lead_time: string; description: string; materials: string; size: string; care: string;
  hidden: boolean; images: string[]; sort: number; created_at: string; updated_at: string;
};
export type OrderStatus = "awaiting_verification" | "confirmed" | "shipped" | "rejected";
export type OrderItem = { product_id: string; name: string; price: number; qty: number; made_to_order: boolean };
export type Customer = { name: string; phone: string; email: string; address: string; note: string };
export type Order = {
  id: string; status: OrderStatus; utr: string; upi_id: string; total: number;
  items: OrderItem[]; customer: Customer; admin_note: string; created_at: string; updated_at: string;
};
export type CartLine = { id: string; qty: number };
