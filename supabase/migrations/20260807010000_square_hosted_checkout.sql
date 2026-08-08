-- Switch to Square's hosted Checkout (Payment Links) instead of the embedded
-- Web Payments SDK card form. Orders are created as 'pending' before the
-- customer is redirected to Square, then flipped to 'paid' once we verify
-- the Square order/payment on return (see src/lib/square.ts). This column
-- stores the Square-side order id so we know what to verify against.
alter table public.orders
  add column if not exists square_checkout_order_id text;
