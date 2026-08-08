-- Add product-photo examples supplied for the revamp catalog.
--
-- These are not copied from the old store import. They use bundled local image
-- aliases and can be edited later from the admin dashboard once final pricing
-- and product availability are confirmed.

insert into public.products
  (slug, name, description, price, category, images, customizable, best_seller, in_stock, featured, sizes, occasions)
values
  (
    'sweet-sixteen-photo-pillow',
    'Sweet Sixteen Photo Pillow',
    'A keepsake throw pillow for milestone birthdays, personalized with a photo collage, name, age, and heartfelt message.',
    50,
    'Accessories',
    array['local:upload-01', 'local:upload-02'],
    true,
    true,
    true,
    true,
    null,
    array['Birthday','Milestone','Graduation']
  ),
  (
    'graduation-photo-pillow',
    'Graduation Photo Pillow',
    'A personalized class-year pillow with graduate photo artwork and a custom celebration message.',
    50,
    'Accessories',
    array['local:upload-03', 'local:upload-04'],
    true,
    false,
    true,
    true,
    null,
    array['Graduation','Milestone','Birthday']
  ),
  (
    'personalized-birthday-photo-pillow',
    'Personalized Birthday Photo Pillow',
    'A custom birthday pillow designed with customer photos, celebratory artwork, and a personal name or message.',
    50,
    'Accessories',
    array['local:upload-13', 'local:upload-12'],
    true,
    false,
    true,
    false,
    null,
    array['Birthday','Thank You','Milestone']
  ),
  (
    'golden-jubilee-embroidered-towel',
    'Golden Jubilee Embroidered Towel',
    'A plush white towel embroidered in gold thread for anniversaries, jubilee celebrations, and elegant gift moments.',
    35,
    'Accessories',
    array['local:upload-11'],
    true,
    false,
    true,
    false,
    null,
    array['Anniversary','Milestone','Thank You']
  ),
  (
    'signature-navy-executive-gift-set',
    'Signature Navy Executive Gift Set',
    'A premium boxed set with notebook, pen, bookmark, and handled drinkware in a refined navy presentation case.',
    115,
    'Gift Sets',
    array['local:upload-06', 'local:upload-07', 'local:upload-08', 'local:upload-05'],
    true,
    true,
    true,
    true,
    null,
    array['Corporate','Graduation','Thank You']
  ),
  (
    'orange-monogram-executive-gift-set',
    'Orange Monogram Executive Gift Set',
    'A bold personalized gift set with notebook, pen, and insulated tumbler, finished with custom initials.',
    105,
    'Gift Sets',
    array['local:upload-10', 'local:upload-15'],
    true,
    false,
    true,
    true,
    null,
    array['Corporate','Graduation','Birthday']
  ),
  (
    'custom-logo-water-bottle',
    'Custom Logo Water Bottle',
    'A clean insulated bottle customized with a business, school, ministry, or event logo.',
    28,
    'Mugs & Tumblers',
    array['local:upload-09'],
    true,
    false,
    true,
    false,
    null,
    array['Corporate','Ministry','Thank You']
  ),
  (
    'monogram-insulated-bottle',
    'Monogram Insulated Bottle',
    'A personalized insulated bottle with a gold monogram finish, ideal for leaders, teachers, and everyday gifting.',
    32,
    'Mugs & Tumblers',
    array['local:upload-14'],
    true,
    false,
    true,
    false,
    null,
    array['Birthday','Ministry','Thank You']
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  images = excluded.images,
  customizable = excluded.customizable,
  best_seller = excluded.best_seller,
  in_stock = excluded.in_stock,
  featured = excluded.featured,
  sizes = excluded.sizes,
  occasions = excluded.occasions,
  updated_at = now();
