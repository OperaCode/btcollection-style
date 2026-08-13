-- Several products were seeded with placeholder names ("Custom Apparel 3",
-- "Custom Mugs & Tumblers 4", etc). Give each a name and description that
-- actually reflects the product photo on file.

update public.products set
  name = 'Mommy Est. Varsity Tee',
  description = 'A varsity-style tee with glitter "Mommy" lettering and the year of your choice embroidered below — a sweet everyday tribute for moms.'
where slug = 'custom-apparel-1';

update public.products set
  name = 'Queen of Hearts Monogram Tee',
  description = 'A crowned initial and heart embroidered on a relaxed tee, personalized with any letter — a regal little gift for the queen in your life.'
where slug = 'custom-apparel-2';

update public.products set
  name = 'Blessed Mom Graphic Tee',
  description = 'A soft tee with hand-lettered "Blessed Mom" script — a cozy reminder of gratitude for Mother''s Day, baby showers, or any day she deserves it.'
where slug = 'custom-apparel-3';

update public.products set
  name = 'Queen, His One and Only Tee',
  description = 'A bold varsity-style graphic tee declaring her the one and only — a playful, confident gift for a partner, daughter, or best friend.'
where slug = 'custom-apparel-4';

update public.products set
  name = 'Grow in Grace Scripture Tee',
  description = 'A gentle botanical script paired with 2 Peter 3:18, embroidered on soft cotton — faith-inspired apparel for everyday encouragement.'
where slug = 'custom-apparel-5';

update public.products set
  name = 'Amen Varsity Tee',
  description = 'Bold collegiate-style "Amen" lettering in gold on black — a statement piece for the faith-forward wardrobe.'
where slug = 'custom-apparel-6';

update public.products set
  name = 'She Who Kneels Before God Tee',
  description = 'An empowering faith graphic tee reminding her that strength starts on her knees in prayer — a meaningful gift for any believer.'
where slug = 'custom-apparel-7';

update public.products set
  name = 'Matte Insulated Travel Tumbler with Strap',
  description = 'A double-wall insulated stainless steel tumbler with a secure flip lid and carry strap, available in a range of matte colors — personalize it with a name or initials.'
where slug = 'custom-mug-tumbler-2';

update public.products set
  name = 'Matte Sport Water Bottle with Flip Straw',
  description = 'A sleek matte stainless steel water bottle with a pop-up straw lid, built to keep drinks cold for hours — personalize it for gym bags, desks, or daily hydration.'
where slug = 'custom-mug-tumbler-3';

update public.products set
  name = 'Two-Tone Sport Water Bottle',
  description = 'The same flip-straw sport bottle in soft two-tone matte finishes — a colorful, personalized hydration companion for any season.'
where slug = 'custom-mug-tumbler-4';

update public.products set
  name = 'Insulated Travel Mug with Handle & Accessories',
  description = 'A generously sized stainless steel travel mug with a comfortable handle and flip lid, complete with a straw, spoon, and tea infuser — a ready-to-gift set personalized with a name or message.'
where slug = 'custom-mug-tumbler-5';

update public.products set
  name = 'Vacuum Flask with Tea Infuser & Cup',
  description = 'A large-capacity vacuum flask with a built-in stainless steel tea infuser and a detachable cup, ideal for tea lovers on the move — personalize it for a truly custom gift.'
where slug = 'custom-mug-tumbler-6';

update public.products set
  name = 'Ribbed Coffee Tumbler with Charm Strap',
  description = 'A textured, ribbed-base coffee tumbler with a flip lid and a sweet charm strap — a cozy, giftable tumbler personalized with a name, initials, or message.'
where slug = 'custom-mug-tumbler-7';

update public.products set
  name = 'Golden Jubilee Embroidered Towel',
  description = 'A plush white towel embroidered in gold with a name and milestone message, gift-boxed and ribbon-tied — a beautiful keepsake for a golden anniversary or jubilee celebration.'
where slug = 'embroidered-towel-gift-set-1';

update public.products set
  name = 'Personalized Name Embroidered Towel Gift Box',
  description = 'A soft towel embroidered with a name of your choice, wrapped in tulle with a gold bow and presented in a keepsake gift box — ready to gift for Mother''s Day, birthdays, or any occasion worth celebrating.'
where slug = 'embroidered-towel-gift-set-2';

update public.products set
  name = 'Whimsical Monogram Baby Towel',
  description = 'A playful monogram and name embroidered in a colorful whimsical swan design — a charming personalized keepsake for a new baby or little one.'
where slug = 'embroidered-towel-gift-set-3';

update public.products set
  name = 'Family Name Embroidered Towel Set (Set of 5)',
  description = 'Five plush towels, each embroidered with a family member''s name — a coordinated, personalized set that makes a heartfelt housewarming or family gift.'
where slug = 'embroidered-towel-gift-set-4';
