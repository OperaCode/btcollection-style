-- Add the mug image groups as separate base products.
insert into public.products
  (slug, name, description, category, images, base_price, text_addon_price, image_addon_price, customizable, featured, best_seller, in_stock, hidden_from_shop, occasions)
values
  ('personalized-faith-affirmation-mug', 'Personalized Faith Affirmation Mug', 'A personalized ceramic mug for milestone birthdays, encouragement, and faith-filled gifting.', 'Mugs & Tumblers', array['local:mugshop1'], 14.99, 0, 0, true, false, false, true, false, array['Birthday','Ministry','Encouragement']),
  ('personalized-milestone-mug', 'Personalized Milestone Mug', 'A custom milestone mug with a name, age, affirmation, or meaningful message.', 'Mugs & Tumblers', array['local:mugshop2'], 14.99, 0, 0, true, false, false, true, false, array['Birthday','Anniversary','Thank You'])
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
