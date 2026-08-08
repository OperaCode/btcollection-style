-- Default personalization add-on prices for existing customizable products.
--
-- These launched at $0 (see 20260806000000_product_addon_pricing.sql) so the
-- pricing UI stayed invisible until real numbers were set. Applies a simple
-- three-tier default scaled to each product's base price; fine-tune any
-- individual product afterward from /admin/products.
update public.products
set
  text_addon_price = case
    when base_price < 30 then 3
    when base_price < 60 then 5
    else 8
  end,
  image_addon_price = case
    when base_price < 30 then 6
    when base_price < 60 then 10
    else 15
  end
where customizable = true;
