-- Local pickup as an alternative to shipping. A pickup order is collected
-- in person from the business address (the same ship-from address in
-- site_settings / SHIPPO_FROM_*), so it carries no shipping charge, never
-- gets a Shippo label, and is taxed at the pickup location rather than a
-- delivery address.
--
-- Pickup orders reuse the existing order_status values: 'paid' means it's
-- waiting to be collected, and 'delivered' means the customer picked it up.
alter table public.checkout_sessions
  add column if not exists fulfillment_method text not null default 'shipping'
    check (fulfillment_method in ('shipping', 'pickup'));

alter table public.orders
  add column if not exists fulfillment_method text not null default 'shipping'
    check (fulfillment_method in ('shipping', 'pickup'));
