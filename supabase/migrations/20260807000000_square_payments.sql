-- Square payment reference on orders. Orders are now only created after a
-- Square charge succeeds (see src/lib/square.ts + checkout.tsx), so this
-- stores which Square payment paid for the order.
alter table public.orders
  add column if not exists square_payment_id text;
