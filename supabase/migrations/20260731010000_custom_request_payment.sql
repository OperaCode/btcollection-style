-- Track the Stripe Checkout Session behind a paid custom request, so the
-- payment-confirmation page can guard against double-processing (a customer
-- refreshing the success page, or retrying an already-paid session).
alter table if exists public.custom_requests
  add column if not exists stripe_session_id text,
  add column if not exists paid_at timestamptz;
