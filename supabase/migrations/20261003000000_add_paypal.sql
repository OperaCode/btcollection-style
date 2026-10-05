-- Adds PayPal as a second payment option alongside Stripe. Stripe's own
-- PayPal integration only covers EEA/UK/Switzerland-based accounts (this
-- business is US-based), so PayPal has to be its own, separate gateway
-- integration rather than a Stripe payment method toggle.
--
-- `payment_gateway` records which one a given checkout/order/custom request
-- actually went through, since the two IDs below are gateway-specific and
-- only one pair is ever populated for a given row.
alter table public.checkout_sessions
  add column if not exists payment_gateway text not null default 'stripe'
    check (payment_gateway in ('stripe', 'paypal')),
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text;

alter table public.orders
  add column if not exists payment_gateway text not null default 'stripe'
    check (payment_gateway in ('stripe', 'paypal')),
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text;

alter table public.custom_requests
  add column if not exists payment_gateway text not null default 'stripe'
    check (payment_gateway in ('stripe', 'paypal')),
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text;

create index if not exists checkout_sessions_paypal_order_id_idx
  on public.checkout_sessions (paypal_order_id) where paypal_order_id is not null;
create index if not exists orders_paypal_order_id_idx
  on public.orders (paypal_order_id) where paypal_order_id is not null;
create index if not exists custom_requests_paypal_order_id_idx
  on public.custom_requests (paypal_order_id) where paypal_order_id is not null;
