-- Inspiration gallery: completed work is separate from the base products customers can buy.
create table if not exists public.gallery_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  product_id uuid references public.products(id) on delete set null,
  product_type text,
  occasions text[] not null default '{}',
  materials text[] not null default '{}',
  colors text[] not null default '{}',
  techniques text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_project_id uuid not null references public.gallery_projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_projects_product_id_idx on public.gallery_projects(product_id);
create index if not exists gallery_projects_published_idx on public.gallery_projects(published, featured, sort_order);
create index if not exists gallery_images_project_idx on public.gallery_images(gallery_project_id, sort_order);

alter table public.gallery_projects enable row level security;
alter table public.gallery_images enable row level security;

drop policy if exists "Public read published gallery projects" on public.gallery_projects;
create policy "Public read published gallery projects" on public.gallery_projects for select using (published = true);
drop policy if exists "Admins manage gallery projects" on public.gallery_projects;
create policy "Admins manage gallery projects" on public.gallery_projects for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read published gallery images" on public.gallery_images;
create policy "Public read published gallery images" on public.gallery_images for select using (exists (select 1 from public.gallery_projects p where p.id = gallery_project_id and p.published = true));
drop policy if exists "Admins manage gallery images" on public.gallery_images;
create policy "Admins manage gallery images" on public.gallery_images for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read gallery images" on storage.objects;
create policy "Public read gallery images" on storage.objects for select using (bucket_id = 'gallery-images');
drop policy if exists "Admins manage gallery images storage" on storage.objects;
create policy "Admins manage gallery images storage" on storage.objects for all using (bucket_id = 'gallery-images' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'gallery-images' and public.has_role(auth.uid(), 'admin'));
