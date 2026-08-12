-- Add each towel gift-set image group as its own Gift Sets product.
insert into public.products
  (slug, name, description, category, images, base_price, text_addon_price, image_addon_price, customizable, featured, best_seller, in_stock, hidden_from_shop, occasions)
values
  ('embroidered-towel-gift-set-1', 'Embroidered Towel Gift Set 1', 'A personalized embroidered towel gift set, finished for meaningful celebrations.', 'Gift Sets', array['local:gift-towel-1'], 35.00, 0, 0, true, false, false, true, false, array['Birthday','Mother''s Day','Thank You']),
  ('embroidered-towel-gift-set-2', 'Embroidered Towel Gift Set 2', 'A personalized embroidered towel gift set, finished for meaningful celebrations.', 'Gift Sets', array['local:gift-towel-2'], 35.00, 0, 0, true, false, false, true, false, array['Birthday','Mother''s Day','Thank You']),
  ('embroidered-towel-gift-set-3', 'Embroidered Towel Gift Set 3', 'A personalized embroidered towel gift set, finished for meaningful celebrations.', 'Gift Sets', array['local:gift-towel-3'], 35.00, 0, 0, true, false, false, true, false, array['Birthday','Wedding','Thank You']),
  ('embroidered-towel-gift-set-4', 'Embroidered Towel Gift Set 4', 'A personalized embroidered towel gift set, finished for meaningful celebrations.', 'Gift Sets', array['local:gift-towel-4'], 35.00, 0, 0, true, false, false, true, false, array['Baby','Birthday','Thank You'])
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  images = excluded.images,
  base_price = excluded.base_price,
  customizable = excluded.customizable,
  hidden_from_shop = false,
  in_stock = excluded.in_stock,
  occasions = excluded.occasions;
