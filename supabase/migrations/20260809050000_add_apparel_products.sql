-- Add each appN image group as its own customizable apparel product.
insert into public.products
  (slug, name, description, category, images, base_price, text_addon_price, image_addon_price, customizable, featured, best_seller, in_stock, hidden_from_shop, sizes, occasions)
values
  ('custom-apparel-1', 'Custom Apparel 1', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app1'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Encouragement','Ministry']),
  ('custom-apparel-2', 'Custom Apparel 2', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app2'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Birthday','Ministry']),
  ('custom-apparel-3', 'Custom Apparel 3', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app3'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Encouragement','Ministry']),
  ('custom-apparel-4', 'Custom Apparel 4', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app4'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Birthday','Ministry']),
  ('custom-apparel-5', 'Custom Apparel 5', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app5'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Birthday','Ministry']),
  ('custom-apparel-6', 'Custom Apparel 6', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app6'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Encouragement','Ministry']),
  ('custom-apparel-7', 'Custom Apparel 7', 'A customizable faith-inspired apparel piece made to order.', 'Faith Apparel', array['local:app7'], 24.99, 0, 0, true, false, false, true, false, array['S','M','L','XL','2XL'], array['Encouragement','Ministry'])
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  images = excluded.images,
  base_price = excluded.base_price,
  customizable = excluded.customizable,
  hidden_from_shop = false,
  in_stock = excluded.in_stock,
  sizes = excluded.sizes,
  occasions = excluded.occasions;
