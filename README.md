# Knotforaverage — store + studio portal

Next.js 15 (App Router, TypeScript) · Supabase (Postgres + Storage) · Razorpay checkout.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL editor → paste `supabase/schema.sql` → Run.
3. Storage → New bucket → name `images`, tick **Public**.
4. Project settings → API: copy the URL, `anon` key and `service_role` key.

## 2. Razorpay
1. Create an account at razorpay.com (test mode is fine for development).
2. Dashboard → Settings → API Keys → generate a Key ID + Key Secret.

## 3. Local run
```bash
cp .env.example .env.local   # fill in Supabase + Razorpay values
npm install
npm run dev                  # http://localhost:3000
```
Open `/admin` → Settings to set brand, hero, and about copy. Then add pieces.

## 4. Deploy (Vercel)
Import the repo, add the same env vars, deploy. Set `ADMIN_PASSWORD` — with it unset the studio is open to the internet.

## How money moves
At checkout the server creates a Razorpay order (`RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`), then Razorpay's own checkout modal collects payment (cards, UPI, netbanking, wallets). On success the browser sends back `razorpay_order_id` / `razorpay_payment_id` / `razorpay_signature`, and the server re-derives the HMAC signature from the key secret to confirm the payment is genuine before writing the order — so a customer can't fake a paid order client-side. Verified orders are saved as *confirmed* immediately and stock is decremented atomically via the `adjust_stock` SQL function. Studio → Orders can still move an order to *shipped* or *rejected* (rejecting restocks it).

## Layout
```
src/app            routes (page.tsx per URL), actions.ts = all server mutations
src/app/admin      studio portal, gated by src/middleware.ts + ADMIN_PASSWORD cookie
src/components     UI; "use client" files hold browser state (cart, checkout, uploader)
src/lib            supabase clients, types, formatting, data access
supabase/          schema.sql — tables, RLS, adjust_stock()
```
Security model: the browser only holds the `anon` key and can only read visible products and settings (RLS). Orders are written and read through server actions using the service-role key, so customers cannot list other people's orders.

## Known gaps
- No email/WhatsApp notification on new order — check Studio → Orders, or add a Supabase webhook.
- Hero image on the prototype used a dark scrim + white text; same here. Light photos may want the scrim lowered in `globals.css` (`.hero .scrim`).
- Stock is checked at order time, not reserved. Two people can both order the last piece before either is confirmed; reject the second.
