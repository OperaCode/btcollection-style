-- Promo/discount codes (e.g. a launch "new customer" discount) plus the
-- columns needed to actually charge and record sales tax, which has been
-- hardcoded to 0 on every order until now.

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off numeric not null check (percent_off > 0 and percent_off <= 100),
  min_subtotal numeric not null default 0,
  active boolean not null default false,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

-- Admin-only in every direction. Redemption is validated entirely
-- server-side (service role) during checkout — see src/lib/discounts.ts —
-- so the public/anon client never needs, and never gets, direct access to
-- this table.
create policy "Admins manage discount codes" on public.discount_codes for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select, insert, update, delete on public.discount_codes to authenticated;
grant all on public.discount_codes to service_role;

create trigger discount_codes_updated
  before update on public.discount_codes
  for each row execute function public.update_updated_at_column();

-- checkout_sessions never had a tax column at all (orders did, but it was
-- always inserted as 0) — add it here so the amount computed at checkout
-- time survives through to the paid order.
alter table public.checkout_sessions
  add column if not exists tax numeric not null default 0,
  add column if not exists discount_code text,
  add column if not exists discount_amount numeric not null default 0;

alter table public.orders
  add column if not exists discount_code text,
  add column if not exists discount_amount numeric not null default 0;
