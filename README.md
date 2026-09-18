# Knotforaverage — store + studio portal

Next.js 15 (App Router, TypeScript) · Supabase (Postgres + Storage) · UPI payment with manual UTR verification.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL editor → paste `supabase/schema.sql` → Run.
3. Storage → New bucket → name `images`, tick **Public**.
4. Project settings → API: copy the URL, `anon` key and `service_role` key.

## 2. Local run
```bash
cp .env.example .env.local   # fill in the four values
npm install
npm run dev                  # http://localhost:3000
```
Open `/admin` → Settings → set the UPI ID and payee name first. Then add pieces.

## 3. Deploy (Vercel)
Import the repo, add the same four env vars, deploy. Set `ADMIN_PASSWORD` — with it unset the studio is open to the internet.

## How money moves
Customer pays your UPI ID directly (QR / deep link). They enter the 12-digit UTR; the order is saved as *awaiting verification*. You check the UTR in your UPI app, then confirm in Studio → Orders. Confirming decrements stock atomically via the `adjust_stock` SQL function. Nothing is verified automatically — that needs a gateway (Razorpay/Cashfree) and is a later step.

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
