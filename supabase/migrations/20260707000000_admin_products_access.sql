-- Admin access for products/orders management.
--
-- HOW TO APPLY: paste this whole file into the Supabase SQL editor for this
-- project and run it once.
do $$
begin
  -- no-op guard block so the file is a single paste-and-run unit
end $$;

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric not null default 0,
  description text,
  images text[] not null default '{}',
  customizable boolean not null default false,
  featured boolean not null default false,
  best_seller boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending',
  subtotal numeric not null default 0,
  shipping numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  shipping_address jsonb,
  delivery_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  price numeric not null,
  quantity integer not null default 1,
  customization jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null unique,
  source text not null default 'website',
  status text not null default 'subscribed',
  welcome_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  item_type text,
  occasion text,
  quantity integer,
  deadline date,
  delivery_preference text,
  sample_image_path text,
  design_text text,
  media_details text,
  idea text,
  status text not null default 'new',
  notification_sent_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.newsletter_subscribers
  add column if not exists full_name text,
  add column if not exists source text not null default 'website',
  add column if not exists status text not null default 'subscribed',
  add column if not exists welcome_email_sent_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.custom_requests
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists item_type text,
  add column if not exists occasion text,
  add column if not exists quantity integer,
  add column if not exists deadline date,
  add column if not exists delivery_preference text,
  add column if not exists sample_image_path text,
  add column if not exists design_text text,
  add column if not exists media_details text,
  add column if not exists idea text,
  add column if not exists status text not null default 'new',
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_error text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists user_roles_user_id_role_idx
  on public.user_roles (user_id, role);

-- 1. Make sure RLS is on for the tables the admin area touches.
alter table if exists public.products enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.user_roles enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.newsletter_subscribers enable row level security;
alter table if exists public.custom_requests enable row level security;

grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, update on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
grant insert on public.custom_requests to anon, authenticated;
grant select, update on public.custom_requests to authenticated;
grant all on public.custom_requests to service_role;

-- Admin invite allowlist. Configure admin emails in Supabase, not in code.
create table if not exists public.admin_invites (
  email text primary key,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_invites enable row level security;

-- Admin-role helper used by RLS policies and the admin client.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 2. Public storefront can read products; only admins can write.
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Guests can place orders; admins can see and update every order / order item.
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Admins view all orders" on public.orders;
create policy "Admins view all orders"
  on public.orders for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins view all order items" on public.order_items;
create policy "Admins view all order items"
  on public.order_items for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items"
  on public.order_items for insert
  with check (true);

-- 4. A signed-in user can read their own role (needed for the client-side
--    admin check); admins can read every row in user_roles.
drop policy if exists "Users read own role" on public.user_roles;
create policy "Users read own role"
  on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- 5. Newsletter: visitors can subscribe; admins can view and manage the list.
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (status = 'subscribed');
 
drop policy if exists "Admins view newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins view newsletter subscribers"
  on public.newsletter_subscribers for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins update newsletter subscribers"
  on public.newsletter_subscribers for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 6. Custom requests: visitors can submit; admins can view and manage.
drop policy if exists "Anyone can create custom requests" on public.custom_requests;
create policy "Anyone can create custom requests"
  on public.custom_requests for insert
  with check (true);

drop policy if exists "Admins view custom requests" on public.custom_requests;
create policy "Admins view custom requests"
  on public.custom_requests for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update custom requests" on public.custom_requests;
create policy "Admins update custom requests"
  on public.custom_requests for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 7. Admin bootstrap: users are granted roles if their email exists in
--    public.admin_invites. Add admins from Supabase with:
--    select public.grant_admin_by_email('owner@example.com');
create or replace function public.handle_new_admin_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited_role public.app_role;
begin
  select role into invited_role
  from public.admin_invites
  where lower(email) = lower(new.email)
  limit 1;

  if invited_role is not null then
    insert into public.user_roles (user_id, role)
    values (new.id, invited_role)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin_bootstrap on auth.users;
create trigger on_auth_user_created_admin_bootstrap
  after insert on auth.users
  for each row execute function public.handle_new_admin_bootstrap();

-- SQL-editor helper for configuring admins without hardcoding an email here.
create or replace function public.grant_admin_by_email(_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_invites (email, role)
  values (lower(_email), 'admin')
  on conflict (email) do update set role = excluded.role;

  insert into public.user_roles (user_id, role)
  select id, 'admin'
  from auth.users
  where lower(email) = lower(_email)
  on conflict do nothing;
end;
$$;

revoke all on function public.grant_admin_by_email(text) from public, anon, authenticated;
