-- "Admins manage product images" had no `TO authenticated` scope, so Postgres
-- evaluated its has_role() check for every storage.objects INSERT regardless
-- of role or bucket — including anonymous customization-photo uploads to the
-- unrelated private bucket, which then failed with "permission denied for
-- function has_role" (anon was never granted execute on it, same class of
-- bug fixed for orders/order_items earlier). Scoping the policy to
-- authenticated means Postgres never needs to evaluate it for anon requests
-- at all.
drop policy if exists "Admins manage product images" on storage.objects;
create policy "Admins manage product images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
