-- Run once in Supabase → SQL editor.
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  brand text not null default 'Knotforaverage',
  tagline text default '',
  since_year text default '2025',
  hero_headline text default 'Every stitch by hand. No two alike.',
  hero_images text[] default '{}',           -- storage paths in bucket "images"
  about_lead text default '',
  about_heading text default '',
  about_body text default '',
  about_image text default '',
  upi_id text not null default '',
  payee_name text default 'Knotforaverage',
  contact_email text default '',
  instagram text default '',
  shipping_note text default 'Ships within India. Delivery charge included in the price.'
);
insert into settings (id) values (1) on conflict do nothing;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price integer not null default 0,           -- INR, whole rupees
  stock integer not null default 0,
  made_to_order boolean not null default false,
  lead_time text default '',
  description text default '',
  materials text default '',
  size text default '',
  care text default '',
  hidden boolean not null default false,
  images text[] default '{}',
  sort integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,                        -- short public order number
  status text not null default 'awaiting_verification'
    check (status in ('awaiting_verification','confirmed','shipped','rejected')),
  utr text not null,
  upi_id text not null,
  total integer not null,
  items jsonb not null,                       -- [{product_id,name,price,qty,made_to_order}]
  customer jsonb not null,                    -- {name,phone,email,address,note}
  admin_note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row-level security: the browser only ever reads public product data.
-- Everything else goes through server actions with the service-role key.
alter table settings enable row level security;
alter table products enable row level security;
alter table orders   enable row level security;
create policy "public read settings" on settings for select to anon using (true);
create policy "public read visible products" on products for select to anon using (hidden = false);
-- no anon policies on orders: not readable or writable from the browser.

-- Atomic stock adjustment used when confirming / reopening an order.
create or replace function adjust_stock(p_id uuid, delta integer) returns void
language sql security definer as $$
  update products set stock = greatest(0, stock + delta), updated_at = now()
  where id = p_id and made_to_order = false;
$$;

-- Storage: create a PUBLIC bucket named "images" in the dashboard (Storage → New bucket → public).
