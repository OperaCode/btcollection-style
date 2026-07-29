-- Schema additions to support the real product catalog and structured
-- personalization (text + photo upload), plus the storage buckets needed
-- for product photography and customer-uploaded personalization photos.

alter table public.products
  add column if not exists sizes text[],
  add column if not exists occasions text[];

-- Public bucket for real product photography (self-hosted copies of the
-- client's own product photos, so the site isn't dependent on her separate
-- Shopify store staying up).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins manage product images" on storage.objects;
create policy "Admins manage product images"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- Private bucket for customer personalization photo uploads. Guests can only
-- drop off a file (INSERT) — no read/update/delete grant for anon/authenticated,
-- so nobody can browse or overwrite other customers' uploads. The admin panel
-- views a specific photo via a server-generated signed URL (service role
-- bypasses RLS entirely, so no SELECT policy is needed for that path).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customization-uploads', 'customization-uploads', false, 8388608, array['image/png','image/jpeg','image/webp','image/heic'])
on conflict (id) do nothing;

drop policy if exists "Anyone can drop off a customization photo" on storage.objects;
create policy "Anyone can drop off a customization photo"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'customization-uploads');
