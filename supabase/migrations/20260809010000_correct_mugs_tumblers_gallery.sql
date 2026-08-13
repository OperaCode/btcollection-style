-- Correct the previous numbered-shop import: those products were not intended
-- to be added as products. Remove them and keep the two finished bottles as
-- gallery-only records so existing order history remains intact.
alter table public.products
  add column if not exists hidden_from_shop boolean not null default false;

update public.products
set hidden_from_shop = true
where slug in ('custom-logo-water-bottle', 'monogram-insulated-bottle');

delete from public.products
where slug in (
  'custom-mug-tumbler-2',
  'custom-mug-tumbler-3',
  'custom-mug-tumbler-4',
  'custom-mug-tumbler-5',
  'custom-mug-tumbler-6',
  'custom-mug-tumbler-7'
);
