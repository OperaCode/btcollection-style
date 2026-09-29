-- Durable copy of each purchased shipping label: previously only Shippo's
-- own label_url was stored, which isn't guaranteed to stay valid forever.
-- The PDF gets downloaded and re-uploaded here at purchase time.
--
-- Private bucket, no anon/authenticated policies — the label is written by
-- purchaseLabel() and read via a signed URL, both using the service-role
-- client (verified-admin gated), same pattern as the customization-uploads
-- bucket's read path.
insert into storage.buckets (id, name, public)
values ('shipping-labels', 'shipping-labels', false)
on conflict (id) do nothing;

alter table public.orders
  add column if not exists shipping_label_path text;
