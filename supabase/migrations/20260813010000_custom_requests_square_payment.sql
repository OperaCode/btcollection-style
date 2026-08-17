-- Custom request payments move from Stripe to Square, matching the regular
-- shop checkout. stripe_session_id is left in place (unused going forward)
-- so historical rows aren't touched.
alter table public.custom_requests
  add column if not exists square_checkout_order_id text,
  add column if not exists square_payment_id text;
