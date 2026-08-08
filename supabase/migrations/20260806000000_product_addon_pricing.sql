-- Configurable per-product pricing: a base price plus optional flat-fee
-- add-ons for personalization text and an uploaded customization photo.
-- Both add-on prices default to 0, preserving current behavior (free
-- personalization) until an admin sets a real add-on price per product.
alter table public.products rename column price to base_price;

alter table public.products
  add column if not exists text_addon_price numeric not null default 0,
  add column if not exists image_addon_price numeric not null default 0;
