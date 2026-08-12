-- Restore each numbered shop image group as its own base product.
insert into public.products
  (slug, name, description, category, images, base_price, text_addon_price, image_addon_price, customizable, featured, best_seller, in_stock, hidden_from_shop, occasions)
values
  ('custom-mug-tumbler-2', 'Custom Mugs & Tumblers 2', 'A customizable mugs and tumblers base product. Choose your color and add your own design.', 'Mugs & Tumblers', array['local:shop2'], 18.99, 0, 0, true, false, false, true, false, array['Birthday','Corporate','Wedding']),
  ('custom-mug-tumbler-3', 'Custom Mugs & Tumblers 3', 'A customizable mugs and tumblers base product. Choose your color and add your own design.', 'Mugs & Tumblers', array['local:shop3'], 18.99, 0, 0, true, false, false, true, false, array['Birthday','Wedding']),
  ('custom-mug-tumbler-4', 'Custom Mugs & Tumblers 4', 'A customizable mugs and tumblers base product. Choose your color and add your own design.', 'Mugs & Tumblers', array['local:shop4'], 18.99, 0, 0, true, false, false, true, false, array['Birthday','Wedding']),
  ('custom-mug-tumbler-5', 'Custom Mugs & Tumblers 5', 'A customizable mugs and tumblers base product. Choose your color and add your own design.', 'Mugs & Tumblers', array['local:shop5'], 18.99, 0, 0, true, false, false, true, false, array['Birthday','Corporate']),
  ('custom-mug-tumbler-6', 'Custom Mugs & Tumblers 6', 'A customizable mugs and tumblers base product. Choose your color and add your own design.', 'Mugs & Tumblers', array['local:shop6'], 18.99, 0, 0, true, false, false, true, false, array['Birthday','Corporate']),
  ('custom-mug-tumbler-7', 'Custom Mugs & Tumblers 7', 'A customizable mugs and tumblers base product. Choose your color and add your own design.', 'Mugs & Tumblers', array['local:shop7'], 18.99, 0, 0, true, false, false, true, false, array['Birthday','Corporate'])
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
