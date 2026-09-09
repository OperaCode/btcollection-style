-- The client's new storefront category list is: Faith Apparel, Drinkware,
-- Gift Sets, Accessories, Kids/Baby, Embroidered, Engraved (see
-- src/lib/categories.ts). Remap existing product rows so they keep matching
-- a shop filter chip instead of falling out of every category filter.
--
-- "Engraved Drinkware" and "Embroidery Home & Accessories" were legacy
-- category values seeded before categories.ts existed as the single source
-- of truth — they never matched any filter chip even under the old list.

update public.products set category = 'Drinkware' where category = 'Mugs & Tumblers';
update public.products set category = 'Engraved' where category = 'Engraved Drinkware';
update public.products set category = 'Embroidered' where category = 'Embroidery Home & Accessories';
