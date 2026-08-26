-- A checkout attempt is not an order. Keep pre-payment data private, then
-- create the fulfillment order only after Square confirms payment.
create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  delivery_method text,
  square_checkout_order_id text unique,
  square_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.checkout_sessions enable row level security;
grant all on public.checkout_sessions to service_role;

-- The admin client calls this function immediately after sign-in. Reassert the
-- grant because CREATE OR REPLACE migrations preserve (and can accidentally
-- leave behind) revoked function privileges.
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
