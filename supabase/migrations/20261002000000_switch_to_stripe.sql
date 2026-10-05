-- Switching payment processor from Square to Stripe. Renames the
-- Square-specific payment-reference columns to their Stripe equivalents on
-- every table that tracks a payment (checkout_sessions, orders,
-- custom_requests) — Postgres preserves each column's constraints/indexes
-- across a rename automatically, so the unique constraint on the checkout
-- session id column carries over untouched.
--
-- Also drops custom_requests.stripe_session_id — an orphaned column from an
-- even earlier Stripe integration that was abandoned back in August when
-- the project first switched to Square (see
-- 20260813010000_custom_requests_square_payment.sql's own comment) and was
-- never cleaned up. No point reviving a stale, unused column when this
-- migration is already adding a fresh, correctly-named one.

alter table public.checkout_sessions rename column square_checkout_order_id to stripe_checkout_session_id;
alter table public.checkout_sessions rename column square_payment_id to stripe_payment_id;

alter table public.orders rename column square_checkout_order_id to stripe_checkout_session_id;
alter table public.orders rename column square_payment_id to stripe_payment_id;

alter table public.custom_requests rename column square_checkout_order_id to stripe_checkout_session_id;
alter table public.custom_requests rename column square_payment_id to stripe_payment_id;

alter table public.custom_requests drop column if exists stripe_session_id;
