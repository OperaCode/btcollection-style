-- Shippo label-management fields for admin fulfillment.
alter table if exists public.orders
  add column if not exists shippo_shipment_id text,
  add column if not exists shippo_rate_id text,
  add column if not exists shipping_label_url text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists label_purchased_at timestamptz;
