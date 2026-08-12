-- Add accessory and gift-set image groups as separate base products.
insert into public.products
  (slug, name, description, category, images, base_price, text_addon_price, image_addon_price, customizable, featured, best_seller, in_stock, hidden_from_shop, occasions)
values
  ('personalized-executive-gift-set', 'Personalized Executive Gift Set', 'A polished notebook, pen, and insulated bottle set for thoughtful professional gifting.', 'Gift Sets', array['local:access1'], 45.00, 0, 0, true, false, false, true, false, array['Corporate','Graduation','Thank You']),
  ('personalized-keychain-bottle-opener', 'Personalized Keychain Bottle Opener', 'A compact leather keychain and bottle opener personalized for gifting.', 'Accessories', array['local:access2'], 9.99, 0, 0, true, false, false, true, false, array['Birthday','Wedding','Corporate']),
  ('personalized-keychain', 'Personalized Keychain', 'A classic leather keychain personalized with a name, initials, or message.', 'Accessories', array['local:access3'], 7.99, 0, 0, true, false, false, true, false, array['Birthday','Thank You']),
  ('premium-gift-set', 'Premium Personalized Gift Set', 'A coordinated gift set designed for meaningful celebrations and milestone occasions.', 'Gift Sets', array['local:gift1'], 55.00, 0, 0, true, false, false, true, false, array['Birthday','Corporate','Graduation']),
  ('deluxe-gift-set', 'Deluxe Personalized Gift Set', 'A presentation-ready gift set with coordinated keepsakes and drinkware.', 'Gift Sets', array['local:gift2'], 65.00, 0, 0, true, false, false, true, false, array['Birthday','Corporate','Thank You'])
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
