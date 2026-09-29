-- Remove unused order_status values. Neither "pending" nor "processing" is
-- ever actually set anywhere in the app: an orders row is only created once
-- Square confirms payment (always inserted directly as 'paid' — see
-- paid-order-checkout.ts), and the pre-payment window is represented by the
-- separate checkout_sessions table, not a 'pending' order row. "processing"
-- was likewise never wired to any UI action.
--
-- Postgres can't directly drop a value from an enum, so this creates a
-- replacement type, migrates the column over, then swaps the old type out.
-- order_status is only ever used as the type of orders.status (checked
-- across every migration) — nothing else references it.
create type public.order_status_new as enum ('paid', 'shipped', 'delivered', 'cancelled');

alter table public.orders
  alter column status drop default;

alter table public.orders
  alter column status type public.order_status_new
  using status::text::public.order_status_new;

alter table public.orders
  alter column status set default 'paid';

drop type public.order_status;
alter type public.order_status_new rename to order_status;

-- Tracking sync: a Shippo webhook (track_updated) flips this automatically
-- when the carrier reports delivery, instead of relying on the admin to
-- remember to click "Mark Delivered" by hand.
alter table public.orders
  add column if not exists delivered_at timestamptz;
